import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, SectionTitle, Empty, Badge, PrimaryButton, GhostButton } from "@/components/ui-bits";
import { useAuth, useUserRole } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ClipboardList, CheckCircle2, Circle, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/atividades")({ component: AtividadesPage });

function AtividadesPage() {
  const { role } = useUserRole();
  if (role === "professor" || role === "administrador") return <AtividadesProf />;
  return <AtividadesAluno />;
}

function AtividadesAluno() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [filtroDisciplina, setFiltroDisciplina] = useState("");
  const [filtroPrazo, setFiltroPrazo] = useState<"todas" | "futuras" | "vencidas">("todas");

  const ativ = useQuery({
    queryKey: ["aluno-ativ", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("atividades")
        .select("id,titulo,descricao,prazo,disciplina_id,turma_id,turmas(nome),disciplinas(nome)")
        .order("prazo", { ascending: true });
      return data ?? [];
    },
  });
  const concluidas = useQuery({
    queryKey: ["aluno-concl", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("atividade_concluida").select("atividade_id").eq("aluno_id", user!.id);
      return new Set((data ?? []).map((r) => r.atividade_id));
    },
  });
  const disciplinas = useMemo(() => {
    const map = new Map<string, string>();
    ativ.data?.forEach((a: any) => { if (a.disciplina_id) map.set(a.disciplina_id, a.disciplinas?.nome ?? "—"); });
    return Array.from(map, ([id, nome]) => ({ id, nome }));
  }, [ativ.data]);

  const filtradas = (ativ.data ?? []).filter((a: any) => {
    if (filtroDisciplina && a.disciplina_id !== filtroDisciplina) return false;
    if (filtroPrazo !== "todas" && a.prazo) {
      const dt = new Date(a.prazo).getTime();
      const now = Date.now();
      if (filtroPrazo === "futuras" && dt < now) return false;
      if (filtroPrazo === "vencidas" && dt >= now) return false;
    }
    return true;
  });

  async function toggle(id: string, done: boolean) {
    if (done) {
      await supabase.from("atividade_concluida").delete().eq("atividade_id", id).eq("aluno_id", user!.id);
    } else {
      await supabase.from("atividade_concluida").insert({ atividade_id: id, aluno_id: user!.id });
    }
    qc.invalidateQueries({ queryKey: ["aluno-concl"] });
  }

  return (
    <AppShell title="Atividades">
      <div className="mb-4 grid grid-cols-2 gap-2">
        <select value={filtroDisciplina} onChange={(e) => setFiltroDisciplina(e.target.value)} className="h-10 rounded-xl border border-border bg-background px-2 text-xs">
          <option value="">Todas disciplinas</option>
          {disciplinas.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
        </select>
        <select value={filtroPrazo} onChange={(e) => setFiltroPrazo(e.target.value as any)} className="h-10 rounded-xl border border-border bg-background px-2 text-xs">
          <option value="todas">Qualquer prazo</option>
          <option value="futuras">Em aberto</option>
          <option value="vencidas">Vencidas</option>
        </select>
      </div>
      {filtradas.length ? (
        <div className="space-y-2">
          {filtradas.map((a: any) => {
            const done = concluidas.data?.has(a.id);
            const venc = a.prazo && new Date(a.prazo).getTime() < Date.now();
            return (
              <Card key={a.id} className="flex items-start gap-3">
                <button onClick={() => toggle(a.id, !!done)} className="mt-0.5">
                  {done ? <CheckCircle2 size={22} className="text-primary" /> : <Circle size={22} className="text-muted-foreground" />}
                </button>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${done ? "line-through opacity-60" : ""}`}>{a.titulo}</p>
                  <p className="text-xs text-muted-foreground">{a.disciplinas?.nome ?? "Sem disciplina"} · {a.turmas?.nome}</p>
                  {a.descricao && <p className="mt-1 text-xs text-muted-foreground">{a.descricao}</p>}
                  <div className="mt-1 flex items-center gap-2">
                    {a.prazo && <Badge tone={done ? "ok" : venc ? "danger" : "warn"}>prazo {fmtDate(a.prazo)}</Badge>}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : <Empty>Nenhuma atividade encontrada.</Empty>}
    </AppShell>
  );
}

function AtividadesProf() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const ativ = useQuery({
    queryKey: ["prof-ativ", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("atividades")
        .select("id,titulo,descricao,prazo,disciplina_id,turma_id,turmas(nome,professor_id),disciplinas(nome)")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  async function del(id: string) {
    if (!confirm("Excluir atividade?")) return;
    await supabase.from("atividades").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["prof-ativ"] });
    toast.success("Atividade excluída");
  }

  return (
    <AppShell title="Atividades">
      <div className="mb-4">
        <Link to="/atividades/nova"><PrimaryButton className="w-full"><Plus size={18}/> Nova atividade</PrimaryButton></Link>
      </div>
      {ativ.data?.length ? (
        <div className="space-y-2">
          {ativ.data.map((a: any) => (
            <Card key={a.id} className="flex items-start gap-3">
              <ClipboardList size={20} className="mt-0.5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-semibold">{a.titulo}</p>
                <p className="text-xs text-muted-foreground">{a.turmas?.nome} · {a.disciplinas?.nome ?? "—"} · prazo {fmtDate(a.prazo)}</p>
                {a.descricao && <p className="mt-1 text-xs text-muted-foreground">{a.descricao}</p>}
              </div>
              <div className="flex gap-2">
                <Link to="/atividades/nova" search={{ id: a.id }} className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-secondary"><Pencil size={14}/></Link>
                <button onClick={() => del(a.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-border text-destructive hover:bg-secondary"><Trash2 size={14}/></button>
              </div>
            </Card>
          ))}
        </div>
      ) : <Empty>Nenhuma atividade criada.</Empty>}
    </AppShell>
  );
}

function fmtDate(s: string | null) {
  if (!s) return "—";
  return new Date(s).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}
