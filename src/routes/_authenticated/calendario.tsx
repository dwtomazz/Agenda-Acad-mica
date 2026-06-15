import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Empty, Field, SelectField, PrimaryButton, Modal, Badge } from "@/components/ui-bits";
import { useAuth, useUserRole } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Plus, CalendarDays, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/calendario")({ component: CalendarioPage });

function CalendarioPage() {
  const { user } = useAuth();
  const { role } = useUserRole();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const eventos = useQuery({
    queryKey: ["eventos"],
    enabled: !!user,
    queryFn: async () => (await supabase.from("eventos").select("id,titulo,descricao,data,tipo,turma_id,turmas(nome)").order("data", { ascending: true })).data ?? [],
  });

  const turmas = useQuery({
    queryKey: ["turmas-min", user?.id],
    enabled: !!user && (role === "professor" || role === "administrador"),
    queryFn: async () => (await supabase.from("turmas").select("id,nome")).data ?? [],
  });

  const podeCriar = role === "professor" || role === "administrador";

  async function del(id: string) {
    if (!confirm("Excluir evento?")) return;
    await supabase.from("eventos").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["eventos"] });
  }

  return (
    <AppShell title="Calendário">
      {podeCriar && (
        <div className="mb-4">
          <PrimaryButton onClick={() => setOpen(true)} className="w-full"><Plus size={18}/> Cadastrar evento</PrimaryButton>
        </div>
      )}

      {eventos.data?.length ? (
        <div className="space-y-2">
          {eventos.data.map((e: any) => (
            <Card key={e.id} className="flex items-start gap-3">
              <CalendarDays size={20} className="mt-0.5 text-primary" />
              <div className="flex-1">
                <div className="flex items-center gap-2"><p className="text-sm font-semibold">{e.titulo}</p><Badge tone={e.tipo === "prova" ? "danger" : e.tipo === "trabalho" ? "warn" : "default"}>{e.tipo}</Badge></div>
                <p className="text-xs text-muted-foreground">{fmtDate(e.data)} {e.turmas?.nome && `· ${e.turmas.nome}`}</p>
                {e.descricao && <p className="mt-1 text-xs text-muted-foreground">{e.descricao}</p>}
              </div>
              {podeCriar && <button onClick={() => del(e.id)} className="text-destructive"><Trash2 size={16}/></button>}
            </Card>
          ))}
        </div>
      ) : <Empty>Nenhum evento agendado.</Empty>}

      {open && <EventoModal onClose={() => { setOpen(false); qc.invalidateQueries({ queryKey: ["eventos"] }); }} turmas={turmas.data ?? []} userId={user!.id} />}
    </AppShell>
  );
}

function EventoModal({ onClose, turmas, userId }: { onClose: () => void; turmas: { id: string; nome: string }[]; userId: string }) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState("");
  const [tipo, setTipo] = useState("evento");
  const [turmaId, setTurmaId] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("eventos").insert({
      titulo, descricao: descricao || null, data: new Date(data).toISOString(),
      tipo, turma_id: turmaId || null, criado_por: userId,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Evento criado");
    onClose();
  }

  return (
    <Modal open onClose={onClose} title="Novo evento">
      <form onSubmit={submit} className="space-y-3">
        <Field label="Título" value={titulo} onChange={setTitulo} required />
        <Field label="Data e hora" value={data} onChange={setData} type="datetime-local" required />
        <SelectField label="Tipo" value={tipo} onChange={setTipo} required options={[
          { value: "prova", label: "Prova" }, { value: "trabalho", label: "Trabalho" },
          { value: "seminario", label: "Seminário" }, { value: "evento", label: "Evento" },
        ]} />
        <SelectField label="Turma (opcional)" value={turmaId} onChange={setTurmaId} options={turmas.map((t) => ({ value: t.id, label: t.nome }))} />
        <Field label="Descrição" value={descricao} onChange={setDescricao} rows={2} />
        <PrimaryButton type="submit" loading={loading}>Criar</PrimaryButton>
      </form>
    </Modal>
  );
}

function fmtDate(s: string) {
  return new Date(s).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
