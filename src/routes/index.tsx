import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { LogIn, UserPlus, Lock, CalendarDays, BookOpen, Clock, ClipboardList, GraduationCap } from "lucide-react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Agenda Acadêmica" },
      { name: "description", content: "Sua rotina acadêmica organizada: avisos, trabalhos, calendário e notas." },
      { property: "og:title", content: "Agenda Acadêmica" },
      { property: "og:description", content: "Sua rotina acadêmica organizada em um só lugar." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-10"
      style={{
        background:
          "radial-gradient(circle at 20% 0%, oklch(0.45 0.2 260) 0%, oklch(0.16 0.05 265) 60%)",
      }}
    >
      <BgIcons />
      <div className="relative z-10 w-full max-w-sm text-center">
        <div className="flex justify-center"><Logo size="lg" /></div>
        <h1 className="mt-12 text-4xl font-bold text-foreground">Bem-vindo(a)</h1>
        <p className="mt-2 text-base text-muted-foreground">à sua rotina acadêmica</p>

        <div className="mt-10 space-y-4">
          <Link
            to="/login"
            className="flex h-14 w-full items-center justify-center gap-3 rounded-xl text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110"
            style={{ background: "var(--gradient-primary)" }}
          >
            <LogIn size={20} /> Entrar
          </Link>
          <Link
            to="/signup"
            className="flex h-14 w-full items-center justify-center gap-3 rounded-xl border border-border bg-card text-base font-semibold text-foreground transition hover:bg-secondary"
          >
            <UserPlus size={20} /> Criar conta
          </Link>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Lock size={12} /> Seus dados estão protegidos
        </div>
      </div>
    </div>
  );
}

function BgIcons() {
  const icons = [CalendarDays, BookOpen, Clock, ClipboardList, GraduationCap];
  const positions = [
    "top-10 left-6", "top-16 right-8", "top-1/3 left-2", "top-1/2 right-4",
    "bottom-24 left-10", "bottom-16 right-12", "bottom-40 right-2",
  ];
  return (
    <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
      {positions.map((p, i) => {
        const Ic = icons[i % icons.length];
        return <Ic key={i} size={56} className={`absolute ${p} text-foreground`} />;
      })}
    </div>
  );
}
