import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Send, CalendarDays } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Input, Label } from "./avisos.novo";

export const Route = createFileRoute("/trabalhos/novo")({
  head: () => ({ meta: [{ title: "Novo Trabalho" }] }),
  component: NovoTrabalho,
});

function NovoTrabalho() {
  const nav = useNavigate();
  return (
    <AppShell title="Relatar Trabalho" back="/trabalhos" hideBottomNav>
      <form onSubmit={(e) => { e.preventDefault(); nav({ to: "/trabalhos" }); }} className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <Input label="Trabalho de" placeholder="Ex.: Trabalho de pesquisa" req />
        <div>
          <Label req>Entrega</Label>
          <div className="flex h-12 items-center gap-3 rounded-xl border border-border bg-secondary/40 px-3">
            <CalendarDays size={18} className="text-muted-foreground" />
            <input placeholder="DD / MM / AAAA" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          </div>
        </div>
        <Input label="Professor(a)" placeholder="Nome do professor(a)..." />
        <Input label="Disciplina" placeholder="Nome da disciplina..." />
        <div>
          <Label>Descrição</Label>
          <textarea rows={5} maxLength={500} placeholder="Digite a descrição do trabalho..." className="w-full resize-none rounded-xl border border-border bg-secondary/40 p-3 text-sm outline-none placeholder:text-muted-foreground" />
          <p className="mt-1 text-right text-xs text-muted-foreground">0/500</p>
        </div>
        <button className="flex h-12 w-full items-center justify-center gap-2 rounded-xl font-semibold text-primary-foreground shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
          <Send size={18} /> Enviar Relato
        </button>
      </form>
    </AppShell>
  );
}