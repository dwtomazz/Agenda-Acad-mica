import { createFileRoute } from "@tanstack/react-router";
import { Megaphone, Star } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/home")({
  head: () => ({ meta: [{ title: "Início — Agenda Acadêmica" }] }),
  component: HomePage,
});

function HomePage() {
  return (
    <AppShell title="Agenda Acadêmica" showProfile>
      <Section icon={<Megaphone className="text-primary" />} title="Último Aviso">
        <Row title="Prova de Cálculo II adiada para 25/05." meta="Hoje, 10:30" />
        <Row title="Trabalho de História: entrega até 20/05." meta="Ontem, 16:45" />
      </Section>
      <Section icon={<Star className="text-warning" fill="currentColor" />} title="Destaques">
        <Row title="Entrega de atividades esta semana" meta="3 atividades" dot="warning" />
        <Row title="Provas agendadas para a próxima semana" meta="2 provas" dot="warning" />
      </Section>
    </AppShell>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-3 pb-3">{icon}<h2 className="text-lg font-bold">{title}</h2></div>
      <div className="divide-y divide-border">{children}</div>
    </section>
  );
}

function Row({ title, meta, dot = "primary" }: { title: string; meta: string; dot?: "primary" | "warning" }) {
  return (
    <div className="flex items-start justify-between gap-3 py-3">
      <div className="flex items-start gap-3">
        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot === "warning" ? "bg-warning" : "bg-primary"}`} />
        <p className="text-sm">{title}</p>
      </div>
      <span className="shrink-0 text-xs text-muted-foreground">{meta}</span>
    </div>
  );
}