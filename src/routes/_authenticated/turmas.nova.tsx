import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Send } from "lucide-react";

export const Route = createFileRoute("/_authenticated/turmas/nova")({
  head: () => ({ meta: [{ title: "Nova turma" }] }),
  component: NovaTurma,
});

function NovaTurma() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [area, setArea] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("classes")
      .insert({ title, area, description, mentor_id: user.id })
      .select("id")
      .single();
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Turma criada!");
    nav({ to: "/turmas/$id", params: { id: data!.id } });
  }

  return (
    <AppShell title="Nova turma" back="/turmas" hideBottomNav>
      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Título</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Ex.: Cálculo Aplicado" className="h-12 w-full rounded-xl border border-border bg-secondary/40 px-3 text-sm outline-none" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Área</span>
          <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Ex.: Matemática" className="h-12 w-full rounded-xl border border-border bg-secondary/40 px-3 text-sm outline-none" />
        </label>
        <div>
          <label className="mb-1 block text-sm font-semibold">Descrição</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full resize-none rounded-xl border border-border bg-secondary/40 p-3 text-sm outline-none" />
        </div>
        <button disabled={saving} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl font-semibold text-primary-foreground shadow-[var(--shadow-glow)] disabled:opacity-60" style={{ background: "var(--gradient-primary)" }}>
          <Send size={18} /> Criar turma
        </button>
      </form>
    </AppShell>
  );
}