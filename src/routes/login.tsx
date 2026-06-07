import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — Agenda Acadêmica" }] }),
  component: LoginPage,
});

function LoginPage() {
  const [show, setShow] = useState(false);
  const nav = useNavigate();
  return (
    <div
      className="min-h-screen px-6 py-10"
      style={{ background: "radial-gradient(circle at 30% 0%, oklch(0.45 0.2 260) 0%, oklch(0.16 0.05 265) 70%)" }}
    >
      <div className="mx-auto max-w-sm">
        <div className="flex justify-center"><Logo /></div>
        <form
          onSubmit={(e) => { e.preventDefault(); nav({ to: "/home" }); }}
          className="mt-8 rounded-2xl border border-border bg-card/80 p-6 shadow-2xl backdrop-blur"
        >
          <h1 className="text-center text-3xl font-bold">Bem-vindo(a)</h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">à sua rotina acadêmica</p>
          <Divider />

          <Field label="E-mail">
            <Mail className="text-muted-foreground" size={18} />
            <input type="email" required placeholder="seuemail@exemplo.com" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          </Field>

          <Field label="Senha">
            <Lock className="text-muted-foreground" size={18} />
            <input type={show ? "text" : "password"} required placeholder="Digite sua senha" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            <button type="button" onClick={() => setShow((v) => !v)} className="text-muted-foreground hover:text-foreground">
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </Field>

          <button type="submit" className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl font-semibold text-primary-foreground shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
            <LogIn size={18} /> Entrar
          </button>

          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> ou <div className="h-px flex-1 bg-border" />
          </div>

          <Link to="/signup" className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-secondary/40 text-sm font-semibold hover:bg-secondary">
            <UserPlus size={18} /> Cadastrar-se
          </Link>
        </form>

        <div className="mt-6">
          <p className="text-center text-sm text-muted-foreground">Login com</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <SocialBtn label="Microsoft" />
            <SocialBtn label="Google" />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Lock size={12} /> Seus dados estão protegidos
        </div>
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <label className="mb-1 block text-sm font-semibold">{label}</label>
      <div className="flex h-12 items-center gap-3 rounded-xl border border-border bg-secondary/40 px-3">
        {children}
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div className="my-5 flex items-center gap-3 text-muted-foreground">
      <div className="h-px flex-1 bg-border" />
      <span className="text-lg">∞</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function SocialBtn({ label }: { label: "Microsoft" | "Google" }) {
  return (
    <button className="flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-medium hover:bg-secondary">
      {label === "Microsoft" ? <MsLogo /> : <GoogleLogo />} {label}
    </button>
  );
}

function MsLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24"><rect x="1" y="1" width="10" height="10" fill="#f25022"/><rect x="13" y="1" width="10" height="10" fill="#7fba00"/><rect x="1" y="13" width="10" height="10" fill="#00a4ef"/><rect x="13" y="13" width="10" height="10" fill="#ffb900"/></svg>
  );
}
function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.9 6.4 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c10.8 0 19.5-8.7 19.5-19.5 0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16.1 18.9 13.5 24 13.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.9 7.4 29.2 5.5 24 5.5c-7.3 0-13.5 4.1-16.7 10.2z"/><path fill="#4CAF50" d="M24 43.5c5.1 0 9.8-2 13.3-5.1l-6.2-5.2c-2 1.4-4.5 2.3-7.1 2.3-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.6 39.3 16.2 43.5 24 43.5z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.7l6.2 5.2c-.4.4 6.8-5 6.8-14.9 0-1.2-.1-2.3-.4-3.5z"/></svg>
  );
}