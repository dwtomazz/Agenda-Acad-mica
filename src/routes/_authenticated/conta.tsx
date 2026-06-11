import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useUserRole } from "@/hooks/useAuth";
import { LogOut, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/conta")({
  head: () => ({ meta: [{ title: "Meu perfil" }] }),
  component: Conta,
});

function Conta() {
  const { user } = useAuth();
  const { role } = useUserRole();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      setName(data?.full_name ?? "");
      setArea(data?.area ?? "");
      setBio(data?.bio ?? "");
    });
  }, [user]);

  async function save() {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ full_name: name, area, bio }).eq("id", user.id);
    if (error) return toast.error(error.message);
    toast.success("Perfil atualizado");
  }

  async function logout() {
    await supabase.auth.signOut();
    nav({ to: "/auth", replace: true });
  }

  return (
    <AppShell title="Meu perfil" back="/home">
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">E-mail</p>
        <p className="mb-4 text-sm">{user?.email}</p>
        <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Papel</p>
        <p className="mb-4 text-sm capitalize">{role}</p>

        <label className="mb-3 block">
          <span className="mb-1 block text-sm font-semibold">Nome</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="h-12 w-full rounded-xl border border-border bg-secondary/40 px-3 text-sm" />
        </label>
        <label className="mb-3 block">
          <span className="mb-1 block text-sm font-semibold">{role === "mentor" ? "Área de atuação" : "Área de interesse"}</span>
          <input value={area} onChange={(e) => setArea(e.target.value)} className="h-12 w-full rounded-xl border border-border bg-secondary/40 px-3 text-sm" />
        </label>
        <div className="mb-3">
          <label className="mb-1 block text-sm font-semibold">Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="w-full resize-none rounded-xl border border-border bg-secondary/40 p-3 text-sm" />
        </div>
        <button onClick={save} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl font-semibold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
          <Save size={18} /> Salvar
        </button>
      </div>

      <button onClick={logout} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-destructive/40 text-sm font-semibold text-destructive">
        <LogOut size={16} /> Sair
      </button>
    </AppShell>
  );
}