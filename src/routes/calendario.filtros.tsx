import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/calendario/filtros")({
  head: () => ({ meta: [{ title: "Filtros — Calendário" }] }),
  component: Filtros,
});

function Filtros() {
  const [state, setState] = useState<Record<string, boolean>>({ Provas: true, Seminários: true, Trabalhos: false, Atividades: false });
  return (
    <AppShell title="Calendário" back="/calendario">
      <div className="relative mb-5">
        <input placeholder="Buscar eventos..." className="h-12 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none placeholder:text-muted-foreground" />
      </div>
      <h2 className="mb-3 text-lg font-bold">Filtros</h2>
      <div className="divide-y divide-border rounded-2xl border border-border bg-card">
        {Object.entries(state).map(([k, v]) => (
          <button key={k} onClick={() => setState((s) => ({ ...s, [k]: !v }))} className="flex w-full items-center gap-4 px-5 py-4 text-left">
            <span className={`grid h-6 w-6 place-items-center rounded-md border ${v ? "border-primary bg-primary text-primary-foreground" : "border-border bg-secondary/40"}`}>
              {v && <Check size={16} />}
            </span>
            <span className="font-medium">{k}</span>
          </button>
        ))}
      </div>
    </AppShell>
  );
}