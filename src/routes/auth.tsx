import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { GraduationCap, Users, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";

type PerfilLogin = "aluno" | "professor" | "administrador";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Entrar — Agenda Acadêmica" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<PerfilLogin | null>(null);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/home" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!perfil) return;
    setLoading(true);
    try {
      if (mode === "signup") {
        // No signup, papel salvo é aluno ou professor; admin é promovido após login
        const roleForSignup = perfil === "administrador" ? "aluno" : perfil;
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name, role: roleForSignup }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (perfil === "administrador") {
          // tenta promover com código
          const { error: pErr } = await supabase.rpc("promote_to_admin", { _code: adminCode });
          if (pErr) {
            toast.error("Conta criada como aluno. Código de admin inválido.");
          } else {
            toast.success("Conta de administrador criada!");
          }
        } else {
          toast.success("Conta criada com sucesso!");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (perfil === "administrador" && adminCode) {
          await supabase.rpc("promote_to_admin", { _code: adminCode });
        }
      }
      navigate({ to: "/home" });
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    if (!perfil) {
      toast.error("Selecione um perfil primeiro");
      return;
    }
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/home" });
    if (r.error) toast.error(r.error.message ?? "Erro Google");
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
            <h1 className="mt-2 text-center text-2xl font-bold">
              {mode === "login" ? "Bem-vindo" : "Crie sua conta"}
            </h1>
            <p className="mb-6 mt-1 text-center text-sm text-muted-foreground">
              Perfil: <span className="font-semibold text-foreground capitalize">{perfil}</span>
            </p>

            <form onSubmit={submit} className="space-y-3">
              {mode === "signup" && (
                <label className="block">
                  <span className="mb-1 block text-sm font-medium">Nome completo</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} required className="h-12 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
                </label>
              )}
              <label className="block">
                <span className="mb-1 block text-sm font-medium">E-mail</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Senha</span>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="h-12 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
              </label>

              {perfil === "administrador" && (
                <label className="block">
                  <span className="mb-1 block text-sm font-medium">Código de administrador</span>
                  <input value={adminCode} onChange={(e) => setAdminCode(e.target.value)} placeholder="Necessário para acesso admin" className="h-12 w-full rounded-xl border border-warning/40 bg-background px-3 text-sm outline-none focus:border-primary" />
                  <span className="mt-1 block text-xs text-muted-foreground">Solicite o código à coordenação da escola.</span>
                </label>
              )}

              <button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl font-semibold text-primary-foreground shadow-[var(--shadow-glow)] disabled:opacity-60" style={{ background: "var(--gradient-primary)" }}>
                {loading && <Loader2 size={16} className="animate-spin" />}
                {mode === "login" ? "Entrar" : "Criar conta"}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" /> ou <div className="h-px flex-1 bg-border" />
            </div>

            <button onClick={google} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background text-sm font-semibold hover:bg-secondary">
              <GoogleIcon /> Continuar com Google
            </button>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "login" ? "Não tem conta?" : "Já tem conta?"}{" "}
              <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="font-semibold text-primary hover:underline">
                {mode === "login" ? "Crie agora" : "Entre"}
              </button>
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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.3 29.3 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c10.8 0 19.5-8.7 19.5-19.5 0-1.3-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.3 29.3 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 43.5c5.2 0 9.9-2 13.5-5.2l-6.2-5.2c-2 1.4-4.5 2.4-7.3 2.4-5.2 0-9.6-3.4-11.2-8L6.3 32C9.7 38.1 16.3 43.5 24 43.5z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4 5.4l6.2 5.2c-.4.4 6.5-4.7 6.5-14.6 0-1.3-.1-2.3-.4-3.5z"/>
    </svg>
  );
}
