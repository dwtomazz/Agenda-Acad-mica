import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogOut, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/sair")({
  head: () => ({ meta: [{ title: "Sair" }] }),
  component: SairPage,
});

function SairPage() {
  const nav = useNavigate();
  return (
    <AppShell title="Sair do Aplicativo" back="/home" hideBottomNav>
      <div className="mx-auto mt-10 max-w-xs rounded-2xl border border-border bg-card p-6 text-center">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-primary/10 ring-2 ring-primary/40">
          <LogOut className="text-primary" size={40} />
        </div>
        <h2 className="mt-5 text-xl font-bold">Sair do Aplicativo</h2>
        <p className="mt-2 text-sm text-muted-foreground">Tem certeza que deseja sair do Agenda Acadêmica?</p>
        <div className="my-5 h-px bg-border" />
        <button onClick={() => nav({ to: "/" })} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl font-semibold text-primary-foreground shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
          <LogOut size={18} /> Sair
        </button>
        <Link to="/home" className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-primary text-sm font-semibold text-primary hover:bg-primary/10">
          <X size={18} /> Cancelar
        </Link>
      </div>
    </AppShell>
  );
}