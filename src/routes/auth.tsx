import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { GraduationCap, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Entrar — Mentora" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<"aluno" | "mentor">("aluno");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/home" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name, role },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Você já está logado.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/home" });
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/home" });
    if (r.error) toast.error(r.error.message ?? "Erro Google");
    if (!r.redirected && !r.error) navigate({ to: "/home" });
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-5 py-10"
      style={{ background: "radial-gradient(circle at 20% 0%, oklch(0.45 0.2 260) 0%, oklch(0.16 0.05 265) 60%)" }}
    >
      <div className="w-full max-w-md rounded-3xl border border-border bg-card/80 p-8 backdrop-blur">
        <div className="flex justify-center"><Logo size="md" /></div>
        <h1 className="mt-6 text-center text-2xl font-bold">
          {mode === "login" ? "Bem-vindo de volta" : "Crie sua conta"}
        </h1>
        <p className="mb-6 mt-1 text-center text-sm text-muted-foreground">
          {mode === "login" ? "Entre para acessar suas turmas" : "Comece a aprender ou ensinar hoje"}
        </p>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <RoleBtn active={role === "aluno"} onClick={() => setRole("aluno")} icon={<GraduationCap size={18} />} label="Sou aluno" />
                <RoleBtn active={role === "mentor"} onClick={() => setRole("mentor")} icon={<Users size={18} />} label="Sou mentor" />
              </div>
              <Field label="Nome completo" value={name} onChange={setName} required />
            </>
          )}
          <Field label="E-mail" type="email" value={email} onChange={setEmail} required />
          <Field label="Senha" type="password" value={password} onChange={setPassword} required minLength={6} />

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl font-semibold text-primary-foreground shadow-[var(--shadow-glow)] disabled:opacity-60"
            style={{ background: "var(--gradient-primary)" }}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> ou <div className="h-px flex-1 bg-border" />
        </div>

        <button
          onClick={google}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background text-sm font-semibold hover:bg-secondary"
        >
          <GoogleIcon /> Continuar com Google
        </button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "login" ? "Não tem conta?" : "Já tem conta?"}{" "}
          <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="font-semibold text-primary hover:underline">
            {mode === "login" ? "Crie agora" : "Entre"}
          </button>
        </p>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">← voltar para o início</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required, minLength }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; minLength?: number }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        minLength={minLength}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function RoleBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-semibold ${active ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-foreground"}`}
    >
      {icon} {label}
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