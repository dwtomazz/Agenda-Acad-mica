import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card, Empty, SectionTitle, Badge } from "@/components/ui-bits";
import { useDemoList, useDemoUser } from "@/hooks/useDemoData";
import { KEYS, type Turma, type Usuario, type Disciplina, type Atividade } from "@/lib/demoStore";
import { Users, ClipboardList, Library } from "lucide-react";

export const Route = createFileRoute("/_authenticated/turmas/$id")({ component: TurmaDetail });

function TurmaDetail() {
  const { id } = Route.useParams();
  const me = useDemoUser();
  const turmas = useDemoList<Turma>(KEYS.turmas);
  const usuarios = useDemoList<Usuario>(KEYS.usuarios);
  const disc = useDemoList<Disciplina>(KEYS.disciplinas);
  const ativ = useDemoList<Atividade>(KEYS.atividades);

  const t = turmas.find((x) => x.id === id);
  if (!t) return <AppShell title="Turma" back="/turmas"><Empty>Turma não encontrada.</Empty></AppShell>;
  if (me && me.perfil !== "administrador" && !t.professores.includes(me.id) && !t.alunos.includes(me.id)) {
    return <AppShell title="Turma" back="/turmas"><Empty>Você não está vinculado a esta turma.</Empty></AppShell>;
  }
  const profs = t.professores.map((id) => usuarios.find((u) => u.id === id)).filter(Boolean) as Usuario[];
  const alunos = t.alunos.map((id) => usuarios.find((u) => u.id === id)).filter(Boolean) as Usuario[];
  const turmaDisc = disc.filter((d) => d.turma_id === t.id);
  const turmaAtiv = ativ.filter((a) => a.turma_id === t.id).sort((a, b) => a.prazo.localeCompare(b.prazo));

  return (
    <AppShell title={t.nome} back="/turmas">
      <Card className="mb-4">
        <p className="text-sm"><b>Ano:</b> {t.ano} · <b>Período:</b> {t.periodo}</p>
        <p className="text-sm"><b>Professores:</b> {profs.map((p) => p.nome).join(", ") || "—"}</p>
        <p className="text-sm"><b>Alunos:</b> {alunos.length}</p>
      </Card>

      <SectionTitle>Disciplinas</SectionTitle>
      {turmaDisc.length ? turmaDisc.map((d) => (
        <Card key={d.id} className="mb-2 flex items-center gap-3">
          <Library size={18} className="text-primary"/>
          <div className="flex-1"><p className="text-sm font-semibold">{d.nome}</p><p className="text-xs text-muted-foreground">{d.codigo} · prof. {usuarios.find((u) => u.id === d.professor_id)?.nome ?? "—"}</p></div>
        </Card>
      )) : <Empty>Sem disciplinas.</Empty>}

      <div className="h-4"/>
      <SectionTitle>Atividades</SectionTitle>
      {turmaAtiv.length ? turmaAtiv.map((a) => (
        <Card key={a.id} className="mb-2 flex items-center gap-3">
          <ClipboardList size={18} className="text-primary"/>
          <div className="flex-1"><p className="text-sm font-semibold">{a.titulo}</p><p className="text-xs text-muted-foreground">{new Date(a.prazo).toLocaleString("pt-BR")}</p></div>
        </Card>
      )) : <Empty>Sem atividades.</Empty>}

      {me?.perfil !== "aluno" && (
        <>
          <div className="h-4"/>
          <SectionTitle action={<Badge>{alunos.length}</Badge>}>Alunos</SectionTitle>
          {alunos.length ? alunos.map((a) => (
            <Card key={a.id} className="mb-1 flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/20"><Users size={14} className="text-primary"/></div>
              <p className="text-sm">{a.nome}</p>
            </Card>
          )) : <Empty>Sem alunos.</Empty>}
        </>
      )}
    </AppShell>
  );
}