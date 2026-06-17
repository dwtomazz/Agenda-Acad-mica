import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Empty, Field, SelectField, PrimaryButton, Modal, Badge } from "@/components/ui-bits";
import { useDemoList, useDemoUser, useMinhasTurmas } from "@/hooks/useDemoData";
import { demoStore, KEYS, notificar, type Aviso, type Turma, type Usuario } from "@/lib/demoStore";
import { Plus, Megaphone, Trash2, Pencil, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/avisos")({ component: Page });

function fmt(s: string) { return new Date(s).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }); }

function Page() {
  const me = useDemoUser();
  const minhas = useMinhasTurmas();
  const avisos = useDemoList<Aviso>(KEYS.avisos);
  const turmas = useDemoList<Turma>(KEYS.turmas);
  const [open, setOpen] = useState<Aviso | { __new: true } | null>(null);
  const [busca, setBusca] = useState("");

  if (!me) return null;

  const tIds = new Set(minhas.map((t) => t.id));
  const visiveis = avisos
    .filter((a) => me.perfil === "administrador" || a.escopo === "geral" || (a.turma_id && tIds.has(a.turma_id)))
    .filter((a) => !busca || a.titulo.toLowerCase().includes(busca.toLowerCase()) || a.conteudo.toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));

  const podeCriar = me.perfil === "professor" || me.perfil === "administrador";

  function del(id: string) {
    if (!confirm("Excluir aviso?")) return;
    demoStore.remove(KEYS.avisos, id);
  }

  return (
    <AppShell title="Avisos">
      {podeCriar && <div className="mb-3"><PrimaryButton onClick={() => setOpen({ __new: true } as any)} className="w-full"><Plus size={18}/> Novo aviso</PrimaryButton></div>}
      <div className="mb-3 flex items-center gap-2 rounded-xl border border-border bg-background px-3">
        <Search size={16} className="text-muted-foreground"/>
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar avisos…" className="h-10 flex-1 bg-transparent text-sm outline-none"/>
      </div>
      {visiveis.length ? visiveis.map((a) => {
        const tnome = a.turma_id ? turmas.find((t) => t.id === a.turma_id)?.nome : null;
        return (
          <Card key={a.id} className="mb-2">
            <div className="flex items-start gap-3">
              <Megaphone size={20} className="mt-0.5 text-primary" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold">{a.titulo}</p><Badge tone={a.escopo === "geral" ? "default" : "warn"}>{a.escopo === "geral" ? "Institucional" : tnome ?? "Turma"}</Badge></div>
                <p className="text-xs text-muted-foreground">{a.autor_nome} · {fmt(a.created_at!)}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm">{a.conteudo}</p>
              </div>
              {(me.perfil === "administrador" || a.autor_id === me.id) && (
                <div className="flex flex-col gap-1">
                  <button onClick={() => setOpen(a)} className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-secondary"><Pencil size={14}/></button>
                  <button onClick={() => del(a.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-border text-destructive"><Trash2 size={14}/></button>
                </div>
              )}
            </div>
          </Card>
        );
      }) : <Empty>Sem avisos.</Empty>}

      {open && <AvisoModal av={"__new" in open ? null : open} onClose={() => setOpen(null)} me={me} minhas={minhas} />}
    </AppShell>
  );
}

function AvisoModal({ av, onClose, me, minhas }: { av: Aviso | null; onClose: () => void; me: Usuario; minhas: Turma[] }) {
  const [titulo, setTitulo] = useState(av?.titulo ?? "");
  const [conteudo, setConteudo] = useState(av?.conteudo ?? "");
  const [escopo, setEscopo] = useState<"geral" | "turma">(av?.escopo ?? (me.perfil === "administrador" ? "geral" : "turma"));
  const [turmaId, setTurmaId] = useState(av?.turma_id ?? (minhas[0]?.id ?? ""));
  const [loading, setLoading] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const payload = {
      titulo, conteudo, escopo,
      turma_id: escopo === "turma" ? turmaId : null,
      autor_id: me.id, autor_nome: me.nome, autor_perfil: me.perfil,
    };
    if (av) demoStore.update(KEYS.avisos, av.id, payload);
    else {
      const novo = demoStore.create<Aviso>(KEYS.avisos, payload as any);
      // notificações
      const usuariosAlvo: string[] = [];
      if (escopo === "geral") {
        const todos = demoStore.list<Usuario>(KEYS.usuarios);
        todos.forEach((u) => { if (u.id !== me.id) usuariosAlvo.push(u.id); });
      } else if (turmaId) {
        const t = demoStore.get<Turma>(KEYS.turmas, turmaId);
        if (t) [...t.alunos, ...t.professores].forEach((u) => { if (u !== me.id) usuariosAlvo.push(u); });
      }
      notificar(usuariosAlvo, { titulo: "Novo aviso", mensagem: novo.titulo, tipo: "aviso", link: "/avisos" });
    }
    setLoading(false); toast.success("Aviso salvo"); onClose();
  }

  return (
    <Modal open onClose={onClose} title={av ? "Editar aviso" : "Novo aviso"}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Título" value={titulo} onChange={setTitulo} required />
        <Field label="Mensagem" value={conteudo} onChange={setConteudo} rows={4} required />
        {me.perfil === "administrador" && (
          <SelectField label="Escopo" value={escopo} onChange={(v) => setEscopo(v as any)} required options={[
            { value: "geral", label: "Institucional (todos)" },
            { value: "turma", label: "Turma específica" },
          ]} />
        )}
        {escopo === "turma" && (
          <SelectField label="Turma" value={turmaId} onChange={setTurmaId} required options={minhas.map((t) => ({ value: t.id, label: t.nome }))} />
        )}
        <PrimaryButton type="submit" loading={loading}>Publicar</PrimaryButton>
      </form>
    </Modal>
  );
}