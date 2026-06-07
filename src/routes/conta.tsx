import { createFileRoute, Link } from "@tanstack/react-router";
import { User, Mail, Lock, Camera, LogOut, Eye } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/conta")({
  head: () => ({ meta: [{ title: "Detalhes da Conta" }] }),
  component: Conta,
});

function Conta() {
  return (
    <AppShell title="Detalhes da Conta" back="/home" hideBottomNav>
      <div className="flex flex-col items-center pt-2">
        <div className="relative">
          <div className="grid h-28 w-28 place-items-center rounded-full text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
            <User size={56} />
          </div>
          <button className="absolute bottom-1 right-1 grid h-9 w-9 place-items-center rounded-full bg-secondary text-foreground ring-2 ring-background">
            <Camera size={16} />
          </button>
        </div>
      </div>
      <div className="mt-8 space-y-4">
        <Field label="Nome do Usuário" icon={<User size={18} />} value="João da Silva" />
        <Field label="E-mail" icon={<Mail size={18} />} value="joaodasilva@gmail.com" />
        <Field label="Senha" icon={<Lock size={18} />} value="••••••••" suffix={<Eye size={18} />} />
      </div>
      <button className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl font-semibold text-primary-foreground shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
        <Lock size={18} /> Salvar Alterações
      </button>
      <Link to="/sair" className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-primary text-sm font-semibold text-primary hover:bg-primary/10">
        <LogOut size={18} /> Sair da Conta
      </Link>
    </AppShell>
  );
}

function Field({ label, icon, value, suffix }: { label: string; icon: React.ReactNode; value: string; suffix?: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold">{label}</label>
      <div className="flex h-12 items-center gap-3 rounded-xl border border-border bg-secondary/40 px-3">
        <span className="text-muted-foreground">{icon}</span>
        <input defaultValue={value} className="flex-1 bg-transparent text-sm outline-none" />
        {suffix && <span className="text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}