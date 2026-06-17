import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Empty, SectionTitle, Badge } from "@/components/ui-bits";
import { RequireTurma } from "@/components/RequireTurma";
import { useDemoList, useDemoUser, useMinhasTurmas } from "@/hooks/useDemoData";
import { KEYS, type Disciplina, type Frequencia, type Nota } from "@/lib/demoStore";

export const Route = createFileRoute("/_authenticated/notas")({ component: Page });

function Page() {
  return <AppShell title="Notas e Frequência"><RequireTurma><Notas/></RequireTurma></AppShell>;
}

function Notas() {
  const me = useDemoUser()!;
  const turmas = useMinhasTurmas();
  const disciplinas = useDemoList<Disciplina>(KEYS.disciplinas);
  const notas = useDemoList<Nota>(KEYS.notas);
  const freq = useDemoList<Frequencia>(KEYS.frequencias);

  const periodos = useMemo(() => Array.from(new Set(notas.filter((n) => n.aluno_id === me.id).map((n) => n.periodo))), [notas, me.id]);
  const [periodo, setPeriodo] = useState("");

  const tIds = new Set(turmas.map((t) => t.id));
  const disc = disciplinas.filter((d) => tIds.has(d.turma_id));

  return (
    <>
      {periodos.length > 0 && (
        <div className="mb-4">
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value)} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs">
            <option value="">Todos os períodos</option>
            {periodos.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      )}
      {disc.length === 0 ? <Empty>Sem disciplinas.</Empty> : disc.map((d) => {
        const myNotas = notas.filter((n) => n.aluno_id === me.id && n.disciplina_id === d.id && (!periodo || n.periodo === periodo));
        const myFreq = freq.filter((f) => f.aluno_id === me.id && f.disciplina_id === d.id);
        const somaPeso = myNotas.reduce((a, n) => a + Number(n.peso), 0);
        const media = somaPeso ? myNotas.reduce((a, n) => a + Number(n.valor) * Number(n.peso), 0) / somaPeso : null;
        const presentes = myFreq.filter((x) => x.presente).length;
        const taxa = myFreq.length ? Math.round((presentes / myFreq.length) * 100) : null;
        const sit = media == null ? "—" : media >= 7 ? "Aprovado" : media >= 5 ? "Recuperação" : "Reprovado";
        const tone = media == null ? "default" : media >= 7 ? "ok" : media >= 5 ? "warn" : "danger";
        return (
          <Card key={d.id} className="mb-3">
            <p className="text-base font-bold">{d.nome}</p>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              <div><p className="text-2xl font-bold text-primary">{media?.toFixed(1) ?? "—"}</p><p className="text-[10px] uppercase text-muted-foreground">Média</p></div>
              <div><p className="text-2xl font-bold text-primary">{taxa != null ? `${taxa}%` : "—"}</p><p className="text-[10px] uppercase text-muted-foreground">Frequência</p></div>
              <div className="flex items-center justify-center"><Badge tone={tone as any}>{sit}</Badge></div>
            </div>
            {myNotas.length > 0 && (
              <div className="mt-3">
                <SectionTitle>Notas</SectionTitle>
                <div className="space-y-1">
                  {myNotas.map((n) => (
                    <div key={n.id} className="flex items-center justify-between text-sm">
                      <span>{n.descricao} <span className="text-xs text-muted-foreground">({n.periodo})</span></span>
                      <span className="font-semibold">{Number(n.valor).toFixed(1)} <span className="text-xs text-muted-foreground">(peso {n.peso})</span></span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </>
  );
}