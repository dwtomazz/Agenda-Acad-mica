import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Empty, SectionTitle, Badge, Field, SelectField, PrimaryButton, Modal } from "@/components/ui-bits";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Power } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/usuarios")({ component: AdminUsuarios });

function AdminUsuarios() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const profiles = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => (await supabase.from("profiles").select("id,full_name,avatar_url,ativo,created_at").order("created_at", { ascending: false })).data ?? [],
  });
  const roles = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => (await supabase.from("user_roles").select("user_id,role")).data ?? [],
  });
  const roleByUser = new Map<string, string>();
  roles.data?.forEach((r: any) => roleByUser.set(r.user_id, r.role));

  async function toggleActive(id: string, ativo: boolean) {
    await supabase.from("profiles").update({ ativo: !ativo }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-profiles"] });
  }

  const alunos = (profiles.data ?? []).filter((p) => roleByUser.get(p.id) === "aluno");
  const profs = (profiles.data ?? []).filter((p) => roleByUser.get(p.id) === "professor");
  const admins = (profiles.data ?? []).filter((p) => roleByUser.get(p.id) === "administrador");

  return (
    <AppShell title="Usuários">
      {[
        { t: "Administradores", list: admins },
        { t: "Professores", list: profs },
        { t: "Alunos", list: alunos },
      ].map((g) => (
        <section key={g.t} className="mb-5">
          <SectionTitle action={<Badge>{g.list.length}</Badge>}>{g.t}</SectionTitle>
          {g.list.length ? g.list.map((p) => (
            <Card key={p.id} className="mb-2 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/20 grid place-items-center text-sm font-bold text-primary">{(p.full_name ?? "?")[0]?.toUpperCase()}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{p.full_name}</p>
                <p className="text-xs text-muted-foreground">{p.ativo ? "Ativo" : "Desativado"}</p>
              </div>
              <button onClick={() => setEditing(p)} className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-secondary"><Pencil size={14}/></button>
              <button onClick={() => toggleActive(p.id, p.ativo)} className={`grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-secondary ${p.ativo ? "text-destructive" : "text-emerald-400"}`}><Power size={14}/></button>
            </Card>
          )) : <Empty>Nenhum.</Empty>}
        </section>
      ))}
      {editing && <EditUser user={editing} currentRole={roleByUser.get(editing.id) ?? "aluno"} onClose={() => { setEditing(null); qc.invalidateQueries(); }} />}
    </AppShell>
  );
}

function EditUser({ user, currentRole, onClose }: { user: any; currentRole: string; onClose: () => void }) {
  const [name, setName] = useState(user.full_name ?? "");
  const [role, setRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.from("profiles").update({ full_name: name }).eq("id", user.id);
      if (role !== currentRole) {
        await supabase.from("user_roles").delete().eq("user_id", user.id);
        await supabase.from("user_roles").insert({ user_id: user.id, role: role as any });
      }
      toast.success("Usuário atualizado");
      onClose();
    } catch (err: any) { toast.error(err.message); } finally { setLoading(false); }
  }
  return (
    <Modal open onClose={onClose} title="Editar usuário">
      <form onSubmit={save} className="space-y-3">
        <Field label="Nome" value={name} onChange={setName} required />
        <SelectField label="Papel" value={role} onChange={setRole} required options={[
          { value: "aluno", label: "Aluno" },
          { value: "professor", label: "Professor" },
          { value: "administrador", label: "Administrador" },
        ]} />
        <PrimaryButton type="submit" loading={loading}>Salvar</PrimaryButton>
      </form>
    </Modal>
  );
}
