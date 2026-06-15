import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Field, PrimaryButton } from "@/components/ui-bits";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/perfil")({ component: Perfil });

function Perfil() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const prof = useQuery({
    queryKey: ["me", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [pwd, setPwd] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (prof.data) { setName(prof.data.full_name ?? ""); setAvatar(prof.data.avatar_url ?? ""); }
  }, [prof.data]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({ full_name: name, avatar_url: avatar || null }).eq("id", user!.id);
      if (error) throw error;
      if (pwd) {
        const { error: pErr } = await supabase.auth.updateUser({ password: pwd });
        if (pErr) throw pErr;
        setPwd("");
      }
      toast.success("Perfil atualizado");
      qc.invalidateQueries({ queryKey: ["me"] });
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao salvar");
    } finally { setSaving(false); }
  }

  return (
    <AppShell title="Perfil" back="/home">
      <Card>
        <form onSubmit={save} className="space-y-3">
          <div className="flex items-center gap-3">
            {avatar ? <img src={avatar} alt="" className="h-16 w-16 rounded-full object-cover" /> : <div className="h-16 w-16 rounded-full bg-primary/20 grid place-items-center text-xl font-bold text-primary">{(name || user?.email || "?")[0].toUpperCase()}</div>}
            <div>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Field label="Nome completo" value={name} onChange={setName} required />
          <Field label="URL da foto" value={avatar} onChange={setAvatar} placeholder="https://..." />
          <Field label="Nova senha (opcional)" value={pwd} onChange={setPwd} type="password" />
          <PrimaryButton type="submit" loading={saving}>Salvar alterações</PrimaryButton>
        </form>
      </Card>
    </AppShell>
  );
}
