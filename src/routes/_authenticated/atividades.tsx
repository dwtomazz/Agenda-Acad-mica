import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Empty, Badge, PrimaryButton } from "@/components/ui-bits";
import { RequireTurma } from "@/components/RequireTurma";
import { useDemoList, useDemoUser, useMinhasTurmas } from "@/hooks/useDemoData";
import { demoStore, KEYS, type Atividade, type Disciplina } from "@/lib/demoStore";
import { ClipboardList, CheckCircle2, Circle, Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/atividades")({ component: Page });

function Page() {
  const me = useDemoUser();
  if (!me) return null;
  return (
    <AppShell title="Atividades">
      <RequireTurma>
        {me.perfil === "aluno" ? <Aluno /> : <Prof />}
      </RequireTurma>
    </AppShell>
  );
}

function fmt(s: string) { return new Date(s).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }); }

function Aluno() {
  const me = useDemoUser()!;
  const turmas = useMinhasTurmas();
  const atividades = useDemoList<Atividade>(KEYS.atividades);
  const disciplinas = useDemoList<Disciplina>(KEYS.disciplinas);
  const concl = useDemoList<{ aluno_id: string; atividade_id: string }>(KEYS.concluidas);
  const [filtroDisc, setFiltroDisc] = useState("");
  const [filtroPrazo, setFiltroPrazo] = useState<"todas" | "futuras" | "vencidas">("todas");
  const [filtroStatus, setFiltroStatus] = useState<"todas" | "pendentes" | "concluidas">("todas");

  const tIds = new Set(turmas.map((t) => t.id));
  const minhas = atividades.filter((a) => tIds.has(a.turma_id));
  const myDisc = useMemo(() => disciplinas.filter((d) => tIds.has(d.turma_id)), [disciplinas, turmas]);
  const concluidasSet = new Set(concl.filter((c) => c.aluno_id === me.id).map((c) => c.atividade_id));

  const lista = minhas
    .filter((a) => !filtroDisc || a.disciplina_id === filtroDisc)
    .filter((a) => {
      const ts = new Date(a.prazo).getTime();
      if (filtroPrazo === "futuras" && ts < Date.now()) return false;
      if (filtroPrazo === "vencidas" && ts >= Date.now()) return false;
      return true;
    })
    .filter((a) => {
      const done = concluidasSet.has(a.id);
      if (filtroStatus === "pendentes" && done) return false;
      if (filtroStatus === "concluidas" && !done) return false;
      return true;
    })
    .sort((a, b) => a.prazo.localeCompare(b.prazo));

  function toggle(id: string, done: boolean) {
    if (done) {
      const found = concl.find((c) => c.aluno_id === me.id && c.atividade_id === id);
      if (found) demoStore.remove(KEYS.concluidas, (found as any).id);
    } else {
      demoStore.create(KEYS.concluidas, { aluno_id: me.id, atividade_id: id });
    }
  }

  return (
    <>
      <div className="mb-4 grid grid-cols-3 gap-2">
        <select value={filtroDisc} onChange={(e) => setFiltroDisc(e.target.value)} className="h-10 rounded-xl border border-border bg-background px-2 text-xs">
          <option value="">Disciplinas</option>
          {myDisc.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
        </select>
        <select value={filtroPrazo} onChange={(e) => setFiltroPrazo(e.target.value as any)} className="h-10 rounded-xl border border-border bg-background px-2 text-xs">
          <option value="todas">Prazo</option>
          <option value="futuras">Em aberto</option>
          <option value="vencidas">Vencidas</option>
        </select>
        <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value as any)} className="h-10 rounded-xl border border-border bg-background px-2 text-xs">
          <option value="todas">Status</option>
          <option value="pendentes">Pendentes</option>
          <option value="concluidas">Concluídas</option>
        </select>
      </div>
      {lista.length ? lista.map((a) => {
        const done = concluidasSet.has(a.id);
        const venc = new Date(a.prazo).getTime() < Date.now();
        const d = disciplinas.find((x) => x.id === a.disciplina_id);
        return (
          <Card key={a.id} className="mb-2 flex items-start gap-3">
            <button onClick={() => toggle(a.id, done)} className="mt-0.5">
              {done ? <CheckCircle2 size={22} className="text-primary" /> : <Circle size={22} className="text-muted-foreground" />}
            </button>
            <div className="flex-1">
              <p className={`text-sm font-semibold ${done ? "line-through opacity-60" : ""}`}>{a.titulo}</p>
              <p className="text-xs text-muted-foreground">{d?.nome ?? "—"} · <span className="capitalize">{a.tipo}</span></p>
              {a.descricao && <p className="mt-1 text-xs text-muted-foreground">{a.descricao}</p>}
              <div className="mt-1"><Badge tone={done ? "ok" : venc ? "danger" : "warn"}>prazo {fmt(a.prazo)}</Badge></div>
            </div>
          </Card>
        );
      }) : <Empty>Nenhuma atividade encontrada.</Empty>}
    </>
  );
}

function Prof() {
  const me = useDemoUser()!;
  const turmas = useMinhasTurmas();
  const atividades = useDemoList<Atividade>(KEYS.atividades);
  const disciplinas = useDemoList<Disciplina>(KEYS.disciplinas);
  const [busca, setBusca] = useState("");
  const tIds = new Set(turmas.map((t) => t.id));
  const minhas = atividades
    .filter((a) => me.perfil === "administrador" || tIds.has(a.turma_id))
    .filter((a) => !busca || a.titulo.toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));

  function del(id: string) {
    if (!confirm("Excluir atividade?")) return;
    demoStore.remove(KEYS.atividades, id);
    toast.success("Excluída");
  }

  return (
    <>
      <div className="mb-3"><Link to="/atividades/nova"><PrimaryButton className="w-full"><Plus size={18}/> Nova atividade</PrimaryButton></Link></div>
      <div className="mb-3 flex items-center gap-2 rounded-xl border border-border bg-background px-3">
        <Search size={16} className="text-muted-foreground"/>
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar atividade…" className="h-10 flex-1 bg-transparent text-sm outline-none"/>
      </div>
      {minhas.length ? minhas.map((a) => {
        const t = turmas.find((t) => t.id === a.turma_id) ?? null;
        const d = disciplinas.find((x) => x.id === a.disciplina_id);
        return (
          <Card key={a.id} className="mb-2 flex items-start gap-3">
            <ClipboardList size={20} className="mt-0.5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-semibold">{a.titulo}</p>
              <p className="text-xs text-muted-foreground">{t?.nome ?? "—"} · {d?.nome ?? "—"} · prazo {fmt(a.prazo)}</p>
              {a.descricao && <p className="mt-1 text-xs text-muted-foreground">{a.descricao}</p>}
            </div>
            <div className="flex gap-1">
              <Link to="/atividades/nova" search={{ id: a.id }} className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-secondary"><Pencil size={14}/></Link>
              <button onClick={() => del(a.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-border text-destructive hover:bg-secondary"><Trash2 size={14}/></button>
            </div>
          </Card>
        );
      }) : <Empty>Nenhuma atividade.</Empty>}
    </>
  );
}