import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mail, Lock, Eye, EyeOff, User, UserPlus, LogIn } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Field } from "./login";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Criar conta — Agenda Acadêmica" }] }),
  component: SignupPage,
});

function SignupPage() {
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const nav = useNavigate();
  return (
    <div className="min-h-screen px-6 py-10" style={{ background: "radial-gradient(circle at 30% 0%, oklch(0.45 0.2 260) 0%, oklch(0.16 0.05 265) 70%)" }}>
      <div className="mx-auto max-w-sm">
        <div className="flex justify-center"><Logo /></div>
        <form onSubmit={(e) => { e.preventDefault(); nav({ to: "/home" }); }} className="mt-8 rounded-2xl border border-border bg-card/80 p-6 shadow-2xl backdrop-blur">
          <h1 className="text-center text-3xl font-bold">Criar conta</h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">junte-se à sua rotina acadêmica</p>
          <div className="my-5 flex items-center gap-3 text-muted-foreground"><div className="h-px flex-1 bg-border" /><span className="text-lg">∞</span><div className="h-px flex-1 bg-border" /></div>

          <Field label="Nome do usuário"><User className="text-muted-foreground" size={18} /><input required placeholder="Digite seu nome de usuário" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" /></Field>
          <Field label="E-mail"><Mail className="text-muted-foreground" size={18} /><input type="email" required placeholder="Digite seu melhor e-mail" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" /></Field>
          <Field label="Senha">
            <Lock className="text-muted-foreground" size={18} />
            <input type={show ? "text" : "password"} required placeholder="Crie uma senha" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            <button type="button" onClick={() => setShow(!show)} className="text-muted-foreground">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </Field>
          <p className="mt-1 text-xs text-muted-foreground">Mínimo de 6 caracteres com letras e números.</p>
          <Field label="Confirmar senha">
            <Lock className="text-muted-foreground" size={18} />
            <input type={show2 ? "text" : "password"} required placeholder="Confirme sua senha" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            <button type="button" onClick={() => setShow2(!show2)} className="text-muted-foreground">{show2 ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </Field>

          <button type="submit" className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl font-semibold text-primary-foreground shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
            <UserPlus size={18} /> Criar conta
          </button>
          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" />ou<div className="h-px flex-1 bg-border" /></div>
          <Link to="/login" className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-primary text-sm font-semibold text-primary hover:bg-primary/10">
            <LogIn size={18} /> Já tenho uma conta
          </Link>

          <p className="mt-5 text-center text-xs text-muted-foreground">Cadastrar com</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button type="button" className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm">Microsoft</button>
            <button type="button" className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm">Google</button>
          </div>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground"><Lock size={12} /> Seus dados estão protegidos</p>
        </form>
      </div>
    </div>
  );
}