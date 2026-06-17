import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card, Empty, SectionTitle } from "@/components/ui-bits";
import { RequireTurma } from "@/components/RequireTurma";
import { useDemoList, useMinhasTurmas } from "@/hooks/useDemoData";
import { KEYS, type Disciplina, type Usuario } from "@/lib/demoStore";

const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export const Route = createFileRoute("/_authenticated/horarios")({ component: Page });

function Page() {
  return <AppShell title="Horários"><RequireTurma><Horarios/></RequireTurma></AppShell>;
}

function Horarios() {
  const turmas = useMinhasTurmas();
  const disciplinas = useDemoList<Disciplina>(KEYS.disciplinas);
  const usuarios = useDemoList<Usuario>(KEYS.usuarios);

  const tIds = new Set(turmas.map((t) => t.id));
  const minhas = disciplinas.filter((d) => tIds.has(d.turma_id));
  const hoje = new Date().getDay();

  const grade: Record<number, Disciplina[]> = {};
  minhas.forEach((d) => { (grade[d.dia_semana] = grade[d.dia_semana] || []).push(d); });
  Object.values(grade).forEach((arr) => arr.sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio)));

  if (minhas.length === 0) return <Empty>Sem horários cadastrados.</Empty>;

  const dias = [1, 2, 3, 4, 5, 6, 0].filter((d) => grade[d]);
  const doDia = grade[hoje] ?? [];

  return (
    <>
      <SectionTitle>Disciplinas de hoje ({DIAS[hoje]})</SectionTitle>
      {doDia.length ? doDia.map((d) => (
        <Card key={d.id} className="mb-2">
          <p className="text-sm font-semibold">{d.nome}</p>
          <p className="text-xs text-muted-foreground">{d.hora_inicio} – {d.hora_fim} · prof. {usuarios.find((u) => u.id === d.professor_id)?.nome ?? "—"}</p>
        </Card>
      )) : <Empty>Sem aulas hoje.</Empty>}

      <SectionTitle>Grade semanal</SectionTitle>
      <div className="space-y-3">
        {dias.map((dia) => (
          <Card key={dia}>
            <p className="mb-2 text-sm font-bold">{DIAS[dia]}</p>
            {grade[dia].map((d) => (
              <div key={d.id} className="flex items-center justify-between border-t border-border py-2 first:border-t-0 first:pt-0">
                <div>
                  <p className="text-sm font-semibold">{d.nome}</p>
                  <p className="text-xs text-muted-foreground">prof. {usuarios.find((u) => u.id === d.professor_id)?.nome ?? "—"}</p>
                </div>
                <p className="text-xs font-mono">{d.hora_inicio}–{d.hora_fim}</p>
              </div>
            ))}
          </Card>
        ))}
      </div>
    </>
  );
}