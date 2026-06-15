import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Empty, Field, SelectField, PrimaryButton, Modal, Badge } from "@/components/ui-bits";
import { useAuth, useUserRole } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Megaphone, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/avisos")({ component: AvisosPage });

function AvisosPage() {
  const { user } = useAuth();
  const { role } = useUserRole();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const avisos = useQuery({
    queryKey: ["avisos"],
    enabled: !!user,
    queryFn: async () => (await supabase.from("avisos").select("id,titulo,conteudo,escopo,turma_id,criado_por,created_at,turmas(nome),profiles!avisos_criado_por_fkey(full_name)").order("created_at", { ascending: false })).data ?? [],
  });
  const minhasTurmas = useQuery({
    queryKey: ["minhas-turmas-avisos", user?.id],
    enabled: !!user && role === "professor",
    queryFn: async () => (await supabase.from("turmas").select("id,nome").eq("professor_id", user!.id)).data ?? [],
  });

  const podeCriar = role === "professor" || role === "administrador";

  async function del(id: string) {
    if (!confirm("Excluir aviso?")) return;
    await supabase.from("avisos").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["avisos"] });
  }

  return (
    <AppShell title="Avisos">
      {podeCriar && (
        <div className="mb-4"><PrimaryButton onClick={() => setOpen(true)} className="w-full"><Plus size={18}/> Novo aviso</PrimaryButton></div>
      )}
      {avisos.data?.length ? (
        <div className="space-y-2">
          {avisos.data.map((a: any) => (
            <Card key={a.id}>
              <div className="flex items-start gap-3">
                <Megaphone size={20} className="mt-0.5 text-primary" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{a.titulo}</p>
                    <Badge tone={a.escopo === "geral" ? "default" : "warn"}>{a.escopo === "geral" ? "Institucional" : a.turmas?.nome ?? "Turma"}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{a.profiles?.full_name ?? "—"} · {fmt(a.created_at)}</p>
                  <p className="mt-2 text-sm whitespace-pre-wrap">{a.conteudo}</p>
                </div>
                {(role === "administrador" || a.criado_por === user?.id) && (
                  <button onClick={() => del(a.id)} className="text-destructive"><Trash2 size={16}/></button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : <Empty>Sem avisos no momento.</Empty>}

      {open && <AvisoModal onClose={() => { setOpen(false); qc.invalidateQueries({ queryKey: ["avisos"] }); }} turmas={minhasTurmas.data ?? []} role={role!} userId={user!.id} />}
    </AppShell>
  );
}

function AvisoModal({ onClose, turmas, role, userId }: { onClose: () => void; turmas: { id: string; nome: string }[]; role: "professor" | "administrador" | "aluno"; userId: string }) {
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [escopo, setEscopo] = useState(role === "administrador" ? "geral" : "turma");
  const [turmaId, setTurmaId] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("avisos").insert({
      titulo, conteudo, escopo,
      turma_id: escopo === "turma" ? turmaId || null : null,
      criado_por: userId,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Aviso publicado");
    onClose();
  }

  return (
    <Modal open onClose={onClose} title="Novo aviso">
      <form onSubmit={submit} className="space-y-3">
        <Field label="Título" value={titulo} onChange={setTitulo} required />
        <Field label="Mensagem" value={conteudo} onChange={setConteudo} rows={4} required />
        {role === "administrador" && (
          <SelectField label="Escopo" value={escopo} onChange={setEscopo} required options={[
            { value: "geral", label: "Institucional (todos)" },
            { value: "turma", label: "Turma específica" },
          ]} />
        )}
        {escopo === "turma" && (
          <SelectField label="Turma" value={turmaId} onChange={setTurmaId} required options={turmas.map((t) => ({ value: t.id, label: t.nome }))} />
        )}
        <PrimaryButton type="submit" loading={loading}>Publicar</PrimaryButton>
      </form>
    </Modal>
  );
}

function fmt(s: string) { return new Date(s).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }); }
