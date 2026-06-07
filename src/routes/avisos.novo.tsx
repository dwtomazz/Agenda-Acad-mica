import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Send, CalendarDays } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/avisos/novo")({
  head: () => ({ meta: [{ title: "Relatar Aviso" }] }),
  component: NovoAviso,
});

export function Label({ children, req }: { children: React.ReactNode; req?: boolean }) {
  return <label className="mb-1 block text-sm font-semibold">{children} {req && <span className="text-primary">*</span>}</label>;
}
export function Input({ label, placeholder, req }: { label: string; placeholder: string; req?: boolean }) {
  return (
    <div>
      <Label req={req}>{label}</Label>
      <input placeholder={placeholder} className="h-12 w-full rounded-xl border border-border bg-secondary/40 px-3 text-sm outline-none placeholder:text-muted-foreground" />
    </div>
  );
}

function NovoAviso() {
  const nav = useNavigate();
  return (
    <AppShell title="Relatar Aviso" back="/avisos" hideBottomNav>
      <form onSubmit={(e) => { e.preventDefault(); nav({ to: "/avisos" }); }} className="rounded-2xl border border-border bg-card p-5">
        <Label req>Texto Completo</Label>
        <textarea rows={6} maxLength={500} placeholder="Digite aqui o texto completo do aviso..." className="w-full resize-none rounded-xl border border-border bg-secondary/40 p-3 text-sm outline-none placeholder:text-muted-foreground" />
        <p className="mt-1 text-right text-xs text-muted-foreground">0/500</p>
        <div className="mt-4 space-y-4">
          <Input label="Prof. Nome do Professor" placeholder="Digite o nome do professor..." req />
          <Input label="Disciplina" placeholder="Digite o nome da disciplina..." req />
          <div>
            <Label req>Data</Label>
            <div className="flex h-12 items-center gap-3 rounded-xl border border-border bg-secondary/40 px-3">
              <CalendarDays size={18} className="text-muted-foreground" />
              <input placeholder="DD / MM / AAAA" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            </div>
          </div>
        </div>
        <button className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl font-semibold text-primary-foreground shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
          <Send size={18} /> Enviar Relato
        </button>
      </form>
    </AppShell>
  );
}