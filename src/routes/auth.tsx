import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { GraduationCap, Users, Shield } from "lucide-react";
import { readDemoSession, writeDemoSession } from "@/hooks/useAuth";

type PerfilLogin = "aluno" | "professor" | "administrador";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Entrar — Agenda Acadêmica" }] }),
  component: AuthPage,
});

const NOMES: Record<PerfilLogin, string> = {
  aluno: "Aluno",
  professor: "Professor",
  administrador: "Administrador",
};

function AuthPage() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<PerfilLogin | null>(null);

  useEffect(() => {
    if (readDemoSession()) navigate({ to: "/home" });
  }, [navigate]);

  function entrar() {
    if (!perfil) return;
    writeDemoSession({ role: perfil, name: `${NOMES[perfil]} Demo` });
    navigate({ to: "/home" });
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-5 py-10"
      style={{ background: "radial-gradient(circle at 20% 0%, oklch(0.45 0.2 260) 0%, oklch(0.16 0.05 265) 60%)" }}
    >
      <div className="w-full max-w-md rounded-3xl border border-border bg-card/80 p-8 backdrop-blur">
        <div className="flex justify-center"><Logo size="md" /></div>

        {!perfil ? (
          <>
            <h1 className="mt-6 text-center text-2xl font-bold">Como você quer entrar?</h1>
            <p className="mb-6 mt-1 text-center text-sm text-muted-foreground">Selecione o perfil para continuar</p>
            <div className="grid gap-3">
              <PerfilCard icon={<GraduationCap size={22} />} label="Entrar como Aluno" desc="Acompanhe atividades, notas e avisos" onClick={() => setPerfil("aluno")} />
              <PerfilCard icon={<Users size={22} />} label="Entrar como Professor" desc="Gerencie turmas, atividades e entregas" onClick={() => setPerfil("professor")} />
              <PerfilCard icon={<Shield size={22} />} label="Entrar como Administrador" desc="Gerencie todo o sistema" onClick={() => setPerfil("administrador")} />
            </div>
            <p className="mt-6 text-center text-xs text-muted-foreground">
              <Link to="/" className="hover:underline">← voltar para o início</Link>
            </p>
          </>
        ) : (
          <>
            <button onClick={() => setPerfil(null)} className="mt-4 text-xs text-muted-foreground hover:underline">← trocar perfil</button>
            <h1 className="mt-2 text-center text-2xl font-bold">Bem-vindo</h1>
            <p className="mb-6 mt-1 text-center text-sm text-muted-foreground">
              Você entrará como <span className="font-semibold text-foreground">{NOMES[perfil]}</span>
            </p>

            <div className="grid place-items-center py-4">
              <div className="grid h-20 w-20 place-items-center rounded-2xl text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                {perfil === "administrador" ? <Shield size={36} /> : perfil === "professor" ? <Users size={36} /> : <GraduationCap size={36} />}
              </div>
            </div>

            <button
              onClick={entrar}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              Entrar como {NOMES[perfil]}
            </button>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Modo demonstração — nenhum cadastro é necessário.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function PerfilCard({ icon, label, desc, onClick }: { icon: React.ReactNode; label: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-4 rounded-2xl border border-border bg-background p-4 text-left hover:border-primary hover:bg-primary/5 transition">
      <div className="grid h-12 w-12 place-items-center rounded-xl text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </button>
  );
}
