import { createFileRoute, Link } from "@tanstack/react-router";
import { LogIn, UserPlus, GraduationCap, BookOpen, ClipboardList, Megaphone } from "lucide-react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Agenda Acadêmica — gestão escolar para alunos, professores e administradores" },
      { name: "description", content: "Acompanhe atividades, notas, frequência, calendário e avisos da sua escola." },
      { property: "og:title", content: "Agenda Acadêmica" },
      { property: "og:description", content: "Acompanhe atividades, notas, frequência, calendário e avisos." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: "radial-gradient(circle at 20% 0%, oklch(0.45 0.2 260) 0%, oklch(0.16 0.05 265) 60%)" }}
    >
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 pt-6">
        <Logo size="md" />
        <Link to="/auth" className="rounded-xl border border-border bg-card/60 px-4 py-2 text-sm font-medium text-foreground hover:bg-card">
          Entrar
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-6 pt-16 pb-24 text-center">
        <h1 className="mx-auto max-w-3xl text-5xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl">
          A vida escolar, organizada.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
          Atividades, notas, frequência, calendário e avisos — para alunos, professores e administradores em um só lugar.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/auth" className="flex h-12 items-center gap-2 rounded-xl px-6 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
            <UserPlus size={18} /> Criar conta
          </Link>
          <Link to="/auth" className="flex h-12 items-center gap-2 rounded-xl border border-border bg-card px-6 text-sm font-semibold text-foreground">
            <LogIn size={18} /> Já tenho conta
          </Link>
        </div>

        <div className="mt-20 grid gap-4 sm:grid-cols-3">
          {[
            { i: ClipboardList, t: "Atividades e prazos", d: "Veja o que entregar e quando." },
            { i: BookOpen, t: "Notas e frequência", d: "Acompanhe seu desempenho a cada bimestre." },
            { i: Megaphone, t: "Avisos e calendário", d: "Provas, trabalhos e comunicados da escola." },
          ].map((f, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card/60 p-6 text-left backdrop-blur">
              <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                <f.i size={20} />
              </div>
              <p className="text-base font-semibold">{f.t}</p>
              <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="mx-auto max-w-5xl px-6 pb-6 text-center text-xs text-muted-foreground">
        <GraduationCap size={14} className="mr-1 inline" /> Agenda Acadêmica © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
