import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { FileText, GraduationCap, ClipboardList, Info, Search, Plus, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/avisos")({
  head: () => ({ meta: [{ title: "Avisos — Agenda Acadêmica" }] }),
  component: AvisosLayout,
});

function AvisosLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/avisos") return <Outlet />;
  return (
    <AppShell title="Avisos" back="/home">
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input placeholder="Buscar avisos..." className="h-12 w-full rounded-xl border border-border bg-card pl-11 pr-4 text-sm outline-none placeholder:text-muted-foreground" />
      </div>
      {AVISOS.map((a, i) => <Card key={i} {...a} />)}
      <Link to="/avisos/novo" className="fixed bottom-24 right-5 grid h-14 w-14 place-items-center rounded-full text-primary-foreground shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
        <Plus size={26} />
      </Link>
    </AppShell>
  );
}

const AVISOS = [
  { title: "Prova de Cálculo II adiada", date: "20/05", prof: "Prof. Diego Araújo / Cálculo II", summary: "A prova foi adiada para o dia 25/05." },
  { title: "Trabalho de História", date: "18/05", prof: "Profa. Ana Beatriz / História", summary: "Entrega até 20/05 via portal." },
  { title: "Mudança de sala", date: "16/05", prof: "Coordenação", summary: "Aulas de Banco de Dados na sala 204." },
];

function Card({ title, date, prof, summary }: { title: string; date: string; prof: string; summary: string }) {
  return (
    <div className="mb-4 rounded-2xl border border-border bg-card p-4">
      <Line icon={<FileText className="text-primary" size={20} />} text={title} right={date} />
      <Line icon={<GraduationCap className="text-primary" size={20} />} text={prof} bold />
      <Line icon={<ClipboardList className="text-primary" size={20} />} text={summary} />
      <button className="mt-1 flex w-full items-center justify-between rounded-xl px-2 py-2 text-sm hover:bg-secondary/40">
        <span className="flex items-center gap-3"><Info className="text-primary" size={20} /> Mais detalhes</span>
        <ChevronRight className="text-muted-foreground" size={18} />
      </button>
    </div>
  );
}

function Line({ icon, text, right, bold }: { icon: React.ReactNode; text: string; right?: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 py-2.5 last:border-0">
      <div className="flex items-center gap-3">
        {icon}
        <span className={`text-sm ${bold ? "font-semibold" : "text-foreground/90"}`}>{text}</span>
      </div>
      {right && <span className="text-xs uppercase text-muted-foreground">{right}</span>}
    </div>
  );
}