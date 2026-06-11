import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MessageCircle, BookOpen, Megaphone, CalendarDays, ClipboardList, Users, Send, Plus, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/turmas/$id")({
  head: () => ({ meta: [{ title: "Turma — Mentora" }] }),
  component: TurmaPage,
});

type Tab = "chat" | "materiais" | "tarefas" | "avisos" | "calendario" | "alunos";

function TurmaPage() {
  const { id } = useParams({ from: "/_authenticated/turmas/$id" });
  const { user } = useAuth();
  const [turma, setTurma] = useState<any>(null);
  const [tab, setTab] = useState<Tab>("chat");
  const [isMentor, setIsMentor] = useState(false);

  useEffect(() => {
    supabase.from("classes").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      setTurma(data);
      if (data && user) setIsMentor(data.mentor_id === user.id);
    });
  }, [id, user]);

  if (!turma) return <AppShell title="Turma" back="/turmas"><p className="text-center text-sm text-muted-foreground">Carregando...</p></AppShell>;

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "chat", label: "Chat", icon: MessageCircle },
    { id: "materiais", label: "Materiais", icon: BookOpen },
    { id: "tarefas", label: "Tarefas", icon: ClipboardList },
    { id: "avisos", label: "Avisos", icon: Megaphone },
    { id: "calendario", label: "Aulas", icon: CalendarDays },
    { id: "alunos", label: "Alunos", icon: Users },
  ];

  return (
    <AppShell title={turma.title} back="/turmas" hideBottomNav>
      <p className="mb-3 text-sm text-muted-foreground">{turma.description || turma.area}</p>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${tab === t.id ? "text-primary-foreground" : "border border-border bg-card text-foreground"}`} style={tab === t.id ? { background: "var(--gradient-primary)" } : {}}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>
      {tab === "chat" && <ChatTab classId={id} />}
      {tab === "materiais" && <MateriaisTab classId={id} isMentor={isMentor} />}
      {tab === "tarefas" && <TarefasTab classId={id} isMentor={isMentor} />}
      {tab === "avisos" && <AvisosTab classId={id} isMentor={isMentor} />}
      {tab === "calendario" && <CalendarioTab classId={id} isMentor={isMentor} />}
      {tab === "alunos" && <AlunosTab classId={id} isMentor={isMentor} />}
    </AppShell>
  );
}

function ChatTab({ classId }: { classId: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    supabase.from("messages").select("*, profile:profiles!messages_user_id_fkey(full_name,avatar_url)").eq("class_id", classId).order("created_at").then(({ data }) => setMessages(data ?? []));
    const ch = supabase.channel(`messages-${classId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `class_id=eq.${classId}` }, async (payload) => {
      const { data } = await supabase.from("profiles").select("full_name,avatar_url").eq("id", (payload.new as any).user_id).maybeSingle();
      setMessages((m) => [...m, { ...(payload.new as any), profile: data }]);
    }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [classId]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !user) return;
    const body = text.trim();
    setText("");
    const { error } = await supabase.from("messages").insert({ class_id: classId, user_id: user.id, body });
    if (error) toast.error(error.message);
  }

  return (
    <div>
      <div className="mb-3 max-h-[55vh] space-y-2 overflow-y-auto rounded-2xl border border-border bg-card p-3">
        {messages.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Inicie a conversa.</p>}
        {messages.map((m) => {
          const mine = m.user_id === user?.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${mine ? "text-primary-foreground" : "bg-secondary/60"}`} style={mine ? { background: "var(--gradient-primary)" } : {}}>
                {!mine && <p className="mb-0.5 text-[10px] font-semibold opacity-80">{m.profile?.full_name ?? "Usuário"}</p>}
                <p>{m.body}</p>
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={send} className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Digite sua mensagem..." className="h-12 flex-1 rounded-xl border border-border bg-card px-4 text-sm outline-none" />
        <button className="grid h-12 w-12 place-items-center rounded-xl text-primary-foreground shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}><Send size={18} /></button>
      </form>
    </div>
  );
}

function MateriaisTab({ classId, isMentor }: { classId: string; isMentor: boolean }) {
  const { user } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<"link" | "arquivo" | "aula_gravada">("link");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  function reload() {
    supabase.from("materials").select("*").eq("class_id", classId).order("created_at", { ascending: false }).then(({ data }) => setList(data ?? []));
  }
  useEffect(reload, [classId]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      let finalUrl = url;
      if (type !== "link" && file) {
        const path = `${user.id}/${classId}/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from("materials").upload(path, file);
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("materials").getPublicUrl(path);
        finalUrl = data.publicUrl;
      }
      const { error } = await supabase.from("materials").insert({ class_id: classId, title, url: finalUrl, type, created_by: user.id });
      if (error) throw error;
      toast.success("Material adicionado");
      setShow(false); setTitle(""); setUrl(""); setFile(null);
      reload();
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  }

  return (
    <div>
      {isMentor && !show && (
        <button onClick={() => setShow(true)} className="mb-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary/10 text-sm font-semibold text-primary"><Plus size={16} /> Adicionar material</button>
      )}
      {show && (
        <form onSubmit={add} className="mb-4 space-y-3 rounded-2xl border border-border bg-card p-4">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" required className="h-11 w-full rounded-xl border border-border bg-secondary/40 px-3 text-sm" />
          <select value={type} onChange={(e) => setType(e.target.value as any)} className="h-11 w-full rounded-xl border border-border bg-secondary/40 px-3 text-sm">
            <option value="link">Link externo</option>
            <option value="arquivo">Arquivo</option>
            <option value="aula_gravada">Aula gravada (vídeo)</option>
          </select>
          {type === "link" ? (
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." required className="h-11 w-full rounded-xl border border-border bg-secondary/40 px-3 text-sm" />
          ) : (
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} required className="w-full text-sm" />
          )}
          <div className="flex gap-2">
            <button type="button" onClick={() => setShow(false)} className="h-11 flex-1 rounded-xl border border-border text-sm font-semibold">Cancelar</button>
            <button disabled={busy} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-primary-foreground disabled:opacity-60" style={{ background: "var(--gradient-primary)" }}>{busy && <Loader2 size={14} className="animate-spin" />} Salvar</button>
          </div>
        </form>
      )}
      {list.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Sem materiais ainda.</p>}
      <div className="space-y-2">
        {list.map((m) => (
          <a key={m.id} href={m.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-border bg-card p-3 hover:bg-secondary/40">
            <div className="flex items-center gap-3">
              <BookOpen size={18} className="text-primary" />
              <div><p className="text-sm font-semibold">{m.title}</p><p className="text-xs text-muted-foreground capitalize">{m.type.replace("_", " ")}</p></div>
            </div>
            <ExternalLink size={14} className="text-muted-foreground" />
          </a>
        ))}
      </div>
    </div>
  );
}

function TarefasTab({ classId, isMentor }: { classId: string; isMentor: boolean }) {
  const [list, setList] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [due, setDue] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  function reload() { supabase.from("assignments").select("*").eq("class_id", classId).order("created_at", { ascending: false }).then(({ data }) => setList(data ?? [])); }
  useEffect(reload, [classId]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("assignments").insert({ class_id: classId, title, description: desc, due_at: due || null });
    if (error) return toast.error(error.message);
    toast.success("Tarefa criada"); setShow(false); setTitle(""); setDesc(""); setDue(""); reload();
  }

  if (openId) return <TarefaDetail assignmentId={openId} isMentor={isMentor} onBack={() => setOpenId(null)} />;

  return (
    <div>
      {isMentor && !show && (
        <button onClick={() => setShow(true)} className="mb-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary/10 text-sm font-semibold text-primary"><Plus size={16} /> Nova tarefa</button>
      )}
      {show && (
        <form onSubmit={add} className="mb-4 space-y-3 rounded-2xl border border-border bg-card p-4">
          <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Título" className="h-11 w-full rounded-xl border border-border bg-secondary/40 px-3 text-sm" />
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} placeholder="Descrição" className="w-full resize-none rounded-xl border border-border bg-secondary/40 p-3 text-sm" />
          <input type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} className="h-11 w-full rounded-xl border border-border bg-secondary/40 px-3 text-sm" />
          <div className="flex gap-2">
            <button type="button" onClick={() => setShow(false)} className="h-11 flex-1 rounded-xl border border-border text-sm font-semibold">Cancelar</button>
            <button className="h-11 flex-1 rounded-xl text-sm font-semibold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>Criar</button>
          </div>
        </form>
      )}
      {list.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Sem tarefas.</p>}
      <div className="space-y-2">
        {list.map((t) => (
          <button key={t.id} onClick={() => setOpenId(t.id)} className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-3 text-left hover:bg-secondary/40">
            <div>
              <p className="text-sm font-semibold">{t.title}</p>
              <p className="text-xs text-muted-foreground">{t.due_at ? `Entrega: ${new Date(t.due_at).toLocaleString("pt-BR")}` : "Sem prazo"}</p>
            </div>
            <ClipboardList size={18} className="text-primary" />
          </button>
        ))}
      </div>
    </div>
  );
}

function TarefaDetail({ assignmentId, isMentor, onBack }: { assignmentId: string; isMentor: boolean; onBack: () => void }) {
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<any>(null);
  const [subs, setSubs] = useState<any[]>([]);
  const [mySub, setMySub] = useState<any>(null);
  const [body, setBody] = useState("");

  function reload() {
    supabase.from("assignments").select("*").eq("id", assignmentId).maybeSingle().then(({ data }) => setAssignment(data));
    if (isMentor) {
      supabase.from("submissions").select("*, profile:profiles!submissions_user_id_fkey(full_name)").eq("assignment_id", assignmentId).then(({ data }) => setSubs(data ?? []));
    } else if (user) {
      supabase.from("submissions").select("*").eq("assignment_id", assignmentId).eq("user_id", user.id).maybeSingle().then(({ data }) => { setMySub(data); setBody(data?.body ?? ""); });
    }
  }
  useEffect(reload, [assignmentId, user, isMentor]);

  async function submit() {
    if (!user) return;
    const payload = { assignment_id: assignmentId, user_id: user.id, body };
    const { error } = await supabase.from("submissions").upsert(payload, { onConflict: "assignment_id,user_id" });
    if (error) return toast.error(error.message);
    toast.success("Entregue!"); reload();
  }

  async function grade(subId: string, g: number, fb: string) {
    const { error } = await supabase.from("submissions").update({ grade: g, feedback: fb }).eq("id", subId);
    if (error) return toast.error(error.message);
    toast.success("Avaliado"); reload();
  }

  if (!assignment) return <p className="text-sm text-muted-foreground">Carregando...</p>;

  return (
    <div>
      <button onClick={onBack} className="mb-3 text-sm text-primary">← voltar para tarefas</button>
      <div className="mb-4 rounded-2xl border border-border bg-card p-4">
        <p className="font-bold">{assignment.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{assignment.description}</p>
      </div>
      {!isMentor ? (
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="mb-2 text-sm font-semibold">Sua entrega</p>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} placeholder="Resposta..." className="w-full resize-none rounded-xl border border-border bg-secondary/40 p-3 text-sm" />
          <button onClick={submit} className="mt-3 h-11 w-full rounded-xl text-sm font-semibold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>{mySub ? "Atualizar entrega" : "Enviar"}</button>
          {mySub?.grade != null && <p className="mt-3 text-sm">Nota: <span className="font-bold text-primary">{mySub.grade}</span> — {mySub.feedback}</p>}
        </div>
      ) : (
        <div className="space-y-2">
          {subs.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma entrega ainda.</p>}
          {subs.map((s) => (
            <div key={s.id} className="rounded-2xl border border-border bg-card p-4">
              <p className="font-semibold">{s.profile?.full_name ?? "Aluno"}</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{s.body}</p>
              <div className="mt-3 flex items-center gap-2">
                <input type="number" step="0.1" defaultValue={s.grade ?? ""} placeholder="Nota" id={`g-${s.id}`} className="h-10 w-20 rounded-lg border border-border bg-secondary/40 px-2 text-sm" />
                <input defaultValue={s.feedback ?? ""} placeholder="Feedback" id={`f-${s.id}`} className="h-10 flex-1 rounded-lg border border-border bg-secondary/40 px-2 text-sm" />
                <button onClick={() => {
                  const g = parseFloat((document.getElementById(`g-${s.id}`) as HTMLInputElement).value);
                  const f = (document.getElementById(`f-${s.id}`) as HTMLInputElement).value;
                  grade(s.id, g, f);
                }} className="h-10 rounded-lg px-3 text-xs font-semibold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>Salvar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AvisosTab({ classId, isMentor }: { classId: string; isMentor: boolean }) {
  const { user } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  function reload() { supabase.from("announcements").select("*").eq("class_id", classId).order("created_at", { ascending: false }).then(({ data }) => setList(data ?? [])); }
  useEffect(reload, [classId]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("announcements").insert({ class_id: classId, author_id: user.id, title, body });
    if (error) return toast.error(error.message);
    toast.success("Aviso publicado"); setShow(false); setTitle(""); setBody(""); reload();
  }

  return (
    <div>
      {isMentor && !show && (
        <button onClick={() => setShow(true)} className="mb-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary/10 text-sm font-semibold text-primary"><Plus size={16} /> Lançar aviso</button>
      )}
      {show && (
        <form onSubmit={add} className="mb-4 space-y-3 rounded-2xl border border-border bg-card p-4">
          <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Título" className="h-11 w-full rounded-xl border border-border bg-secondary/40 px-3 text-sm" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} required placeholder="Mensagem" className="w-full resize-none rounded-xl border border-border bg-secondary/40 p-3 text-sm" />
          <div className="flex gap-2">
            <button type="button" onClick={() => setShow(false)} className="h-11 flex-1 rounded-xl border border-border text-sm font-semibold">Cancelar</button>
            <button className="h-11 flex-1 rounded-xl text-sm font-semibold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>Publicar</button>
          </div>
        </form>
      )}
      {list.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Sem avisos.</p>}
      <div className="space-y-2">
        {list.map((a) => (
          <div key={a.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between"><p className="font-semibold">{a.title}</p><span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString("pt-BR")}</span></div>
            <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{a.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarioTab({ classId, isMentor }: { classId: string; isMentor: boolean }) {
  const [list, setList] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"aula" | "prova" | "seminario" | "atividade">("aula");
  const [when, setWhen] = useState("");

  function reload() { supabase.from("events").select("*").eq("class_id", classId).order("starts_at").then(({ data }) => setList(data ?? [])); }
  useEffect(reload, [classId]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("events").insert({ class_id: classId, title, type, starts_at: when });
    if (error) return toast.error(error.message);
    toast.success("Evento criado"); setShow(false); setTitle(""); setWhen(""); reload();
  }

  return (
    <div>
      {isMentor && !show && (
        <button onClick={() => setShow(true)} className="mb-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary/10 text-sm font-semibold text-primary"><Plus size={16} /> Novo evento</button>
      )}
      {show && (
        <form onSubmit={add} className="mb-4 space-y-3 rounded-2xl border border-border bg-card p-4">
          <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Título" className="h-11 w-full rounded-xl border border-border bg-secondary/40 px-3 text-sm" />
          <select value={type} onChange={(e) => setType(e.target.value as any)} className="h-11 w-full rounded-xl border border-border bg-secondary/40 px-3 text-sm">
            <option value="aula">Aula</option><option value="prova">Prova</option><option value="seminario">Seminário</option><option value="atividade">Atividade</option>
          </select>
          <input type="datetime-local" required value={when} onChange={(e) => setWhen(e.target.value)} className="h-11 w-full rounded-xl border border-border bg-secondary/40 px-3 text-sm" />
          <div className="flex gap-2">
            <button type="button" onClick={() => setShow(false)} className="h-11 flex-1 rounded-xl border border-border text-sm font-semibold">Cancelar</button>
            <button className="h-11 flex-1 rounded-xl text-sm font-semibold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>Salvar</button>
          </div>
        </form>
      )}
      {list.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Sem eventos.</p>}
      <div className="space-y-2">
        {list.map((e) => (
          <div key={e.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl text-primary-foreground" style={{ background: "var(--gradient-primary)" }}><CalendarDays size={18} /></div>
            <div className="flex-1"><p className="font-semibold capitalize">{e.title}</p><p className="text-xs text-muted-foreground">{e.type} • {new Date(e.starts_at).toLocaleString("pt-BR")}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlunosTab({ classId, isMentor }: { classId: string; isMentor: boolean }) {
  const [members, setMembers] = useState<any[]>([]);
  function reload() {
    supabase.from("class_members").select("*, profile:profiles!class_members_user_id_fkey(full_name,avatar_url)").eq("class_id", classId).then(({ data }) => setMembers(data ?? []));
  }
  useEffect(reload, [classId]);

  async function approve(id: string) { await supabase.from("class_members").update({ status: "aprovado" }).eq("id", id); reload(); }
  async function remove(id: string) { await supabase.from("class_members").delete().eq("id", id); reload(); }

  if (members.length === 0) return <p className="py-6 text-center text-sm text-muted-foreground">Nenhum aluno ainda.</p>;
  return (
    <div className="space-y-2">
      {members.map((m) => (
        <div key={m.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 text-primary"><Users size={16} /></div>
            <div>
              <p className="text-sm font-semibold">{m.profile?.full_name ?? "Aluno"}</p>
              <p className="text-xs capitalize text-muted-foreground">{m.status}</p>
            </div>
          </div>
          {isMentor && (
            <div className="flex gap-2">
              {m.status === "pendente" && <button onClick={() => approve(m.id)} className="rounded-lg bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Aprovar</button>}
              <button onClick={() => remove(m.id)} className="rounded-lg border border-destructive/50 px-3 py-1 text-xs font-semibold text-destructive">Remover</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}