import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Search, NotebookText, ChevronRight, Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/trabalhos")({
  head: () => ({ meta: [{ title: "Trabalhos & Provas" }] }),
  component: TrabalhosLayout,
});

const TRABALHOS = [
  "Trabalho de Pesquisa — Cálculo II",
  "Trabalho de História do Brasil",
  "Trabalho de Banco de Dados",
  "Seminário de Engenharia de Software",
];

function TrabalhosLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/trabalhos") return <Outlet />;
  return (
    <AppShell title="Relatar Trabalho" back="/home">
      <div className="mb-5">
        <label className="mb-1 block text-sm font-semibold">Tema <span className="text-primary">*</span></label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input placeholder="Digite o tema do trabalho..." className="h-12 w-full rounded-xl border border-border bg-card pl-11 pr-4 text-sm outline-none placeholder:text-muted-foreground" />
        </div>
      </div>
      <h2 className="mb-3 text-lg font-bold">Lista de Trabalhos</h2>
      <div className="rounded-2xl border border-border bg-card">
        {TRABALHOS.map((t, i) => (
          <Link key={i} to="/trabalhos/novo" className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-4 last:border-0 hover:bg-secondary/40">
            <div className="flex items-center gap-3">
              <NotebookText className="text-primary" size={20} />
              <span className="text-sm">{t}</span>
            </div>
            <ChevronRight className="text-muted-foreground" size={18} />
          </Link>
        ))}
      </div>
      <Link to="/trabalhos/novo" className="fixed bottom-24 right-5 grid h-14 w-14 place-items-center rounded-full text-primary-foreground shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
        <Plus size={26} />
      </Link>
    </AppShell>
  );
}