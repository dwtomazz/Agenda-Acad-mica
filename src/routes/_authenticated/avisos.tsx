import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Empty, Field, SelectField, PrimaryButton, Modal, Badge } from "@/components/ui-bits";
import { useAuth, useUserRole } from "@/hooks/useAuth";
import { demoStore, KEYS } from "@/lib/demoStore";
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
    queryFn: async () => {
      const turmas = demoStore.list<any>(KEYS.turmas);
      return demoStore.list<any>(KEYS.avisos)
        .map((a) => ({ ...a, turma_nome: turmas.find((t) => t.id === a.turma_id)?.nome ?? null }))
        .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
    },
  });
  const minhasTurmas = useQuery({
    queryKey: ["minhas-turmas-avisos", user?.id],
    enabled: !!user,
    queryFn: async () => demoStore.list<any>(KEYS.turmas).map((t) => ({ id: t.id, nome: t.nome })),
  });

  const podeCriar = role === "professor" || role === "administrador";

  async function del(id: string) {
    if (!confirm("Excluir aviso?")) return;
    demoStore.remove(KEYS.avisos, id);
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
                    <Badge tone={a.escopo === "geral" ? "default" : "warn"}>{a.escopo === "geral" ? "Institucional" : a.turma_nome ?? "Turma"}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{a.autor ?? "—"} · {fmt(a.created_at)}</p>
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
    demoStore.create(KEYS.avisos, {
      titulo, conteudo, escopo,
      turma_id: escopo === "turma" ? turmaId || null : null,
      criado_por: userId,
      autor: role === "administrador" ? "Administrador" : role === "professor" ? "Professor" : "Aluno",
    });
    setLoading(false);
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
