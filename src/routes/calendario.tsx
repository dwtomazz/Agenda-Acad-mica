import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Search, FileText, Users, PenLine, ChevronRight, Filter } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/calendario")({
  head: () => ({ meta: [{ title: "Calendário" }] }),
  component: CalendarioLayout,
});

const EVENTS = [
  { title: "Prova", date: "22/05", icon: FileText },
  { title: "Seminário", date: "30/05", icon: Users },
  { title: "Atividade", date: "05/06", icon: PenLine },
];

function CalendarioLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/calendario") return <Outlet />;
  return (
    <AppShell title="Calendário" back="/home">
      <div className="mb-5 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input placeholder="Buscar eventos..." className="h-12 w-full rounded-xl border border-border bg-card pl-11 pr-4 text-sm outline-none placeholder:text-muted-foreground" />
        </div>
        <Link to="/calendario/filtros" className="grid h-12 w-12 place-items-center rounded-xl border border-border bg-card text-primary"><Filter size={20} /></Link>
      </div>
      {EVENTS.map((e, i) => (
        <button key={i} className="mb-4 flex w-full items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 text-left hover:bg-secondary/40">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
              <e.icon size={22} />
            </div>
            <div>
              <p className="font-semibold">{e.title}</p>
              <p className="text-sm text-muted-foreground">{e.date}</p>
            </div>
          </div>
          <ChevronRight className="text-muted-foreground" size={20} />
        </button>
      ))}
    </AppShell>
  );
}