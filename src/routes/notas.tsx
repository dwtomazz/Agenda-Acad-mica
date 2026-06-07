import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, Info } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/notas")({
  head: () => ({ meta: [{ title: "Notas & Frequências" }] }),
  component: Notas,
});

const SUBJECTS = [
  { name: "Programação Web", prof: "Prof. Diego Araújo", grade: 8.7, freq: 92 },
  { name: "Banco de Dados", prof: "Profa. Ana Beatriz", grade: 9.1, freq: 96 },
  { name: "Engenharia de Software", prof: "Prof. Carlos Mendes", grade: 7.8, freq: 85 },
  { name: "Matemática Discreta", prof: "Profa. Juliana Castro", grade: 8.2, freq: 90 },
];

function Notas() {
  return (
    <AppShell title="Notas & Frequências" back="/home">
      <div className="mb-5 flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4">
        <div>
          <p className="text-xs text-muted-foreground">Período Letivo</p>
          <p className="text-lg font-semibold">2024.1</p>
        </div>
        <ChevronDown className="text-muted-foreground" />
      </div>
      {SUBJECTS.map((s) => (
        <div key={s.name} className="mb-4 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold">{s.name}</p>
              <p className="text-sm text-muted-foreground">{s.prof}</p>
            </div>
            <div className="grid h-12 w-14 place-items-center rounded-lg text-base font-bold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
              {s.grade.toFixed(1).replace(".", ",")}
            </div>
          </div>
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Frequência</span><span>{s.freq}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary/60">
              <div className="h-full rounded-full" style={{ width: `${s.freq}%`, background: "var(--gradient-primary)" }} />
            </div>
          </div>
        </div>
      ))}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-2 flex items-center gap-2 text-primary"><Info size={18} /><span className="font-semibold">Sobre as notas</span></div>
        <p className="text-sm text-muted-foreground">As notas exibidas são referentes às avaliações já lançadas pelos professores. Frequência baseada nas aulas registradas até o momento.</p>
      </div>
    </AppShell>
  );
}