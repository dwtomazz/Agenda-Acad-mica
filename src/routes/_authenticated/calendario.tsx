import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Empty, Field, SelectField, PrimaryButton, Modal, Badge } from "@/components/ui-bits";
import { useDemoList, useDemoUser, useMinhasTurmas } from "@/hooks/useDemoData";
import { demoStore, KEYS, notificar, type Evento, type Turma } from "@/lib/demoStore";
import { Plus, CalendarDays, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/calendario")({ component: Page });

function fmt(s: string) {
  return new Date(s).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function Page() {
  const me = useDemoUser();
  const minhas = useMinhasTurmas();
  const eventos = useDemoList<Evento>(KEYS.eventos);
  const [open, setOpen] = useState<Evento | { __new: true } | null>(null);

  if (!me) return null;

  const tIds = new Set(minhas.map((t) => t.id));
  const visiveis = eventos
    .filter((e) => me.perfil === "administrador" || !e.turma_id || tIds.has(e.turma_id))
    .sort((a, b) => a.data.localeCompare(b.data));
  const podeCriar = me.perfil === "professor" || me.perfil === "administrador";

  function del(id: string) {
    if (!confirm("Excluir evento?")) return;
    demoStore.remove(KEYS.eventos, id);
  }

  return (
    <AppShell title="Calendário">
      {podeCriar && <div className="mb-3"><PrimaryButton onClick={() => setOpen({ __new: true } as any)} className="w-full"><Plus size={18}/> Novo evento</PrimaryButton></div>}
      {visiveis.length ? visiveis.map((e) => (
        <Card key={e.id} className="mb-2 flex items-start gap-3">
          <CalendarDays size={20} className="mt-0.5 text-primary" />
          <div className="flex-1">
            <div className="flex items-center gap-2"><p className="text-sm font-semibold">{e.titulo}</p><Badge tone={e.tipo === "prova" ? "danger" : e.tipo === "trabalho" ? "warn" : "default"}>{e.tipo}</Badge></div>
            <p className="text-xs text-muted-foreground">{fmt(e.data)}{e.turma_id && minhas.find((t) => t.id === e.turma_id) ? ` · ${minhas.find((t) => t.id === e.turma_id)!.nome}` : ""}</p>
            {e.descricao && <p className="mt-1 text-xs text-muted-foreground">{e.descricao}</p>}
          </div>
          {(me.perfil === "administrador" || e.criado_por === me.id) && (
            <div className="flex flex-col gap-1">
              <button onClick={() => setOpen(e)} className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-secondary"><Pencil size={14}/></button>
              <button onClick={() => del(e.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-border text-destructive"><Trash2 size={14}/></button>
            </div>
          )}
        </Card>
      )) : <Empty>Nenhum evento agendado.</Empty>}

      {open && <EventoModal ev={"__new" in open ? null : open} turmas={minhas} userId={me.id} onClose={() => setOpen(null)} podeInst={me.perfil === "administrador"} />}
    </AppShell>
  );
}

function EventoModal({ ev, turmas, userId, onClose, podeInst }: { ev: Evento | null; turmas: Turma[]; userId: string; onClose: () => void; podeInst: boolean }) {
  const [titulo, setTitulo] = useState(ev?.titulo ?? "");
  const [descricao, setDescricao] = useState(ev?.descricao ?? "");
  const [data, setData] = useState(ev?.data ? ev.data.slice(0, 16) : "");
  const [tipo, setTipo] = useState<Evento["tipo"]>(ev?.tipo ?? "institucional");
  const [turmaId, setTurmaId] = useState(ev?.turma_id ?? "");
  const [loading, setLoading] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    const payload = {
      titulo, descricao, data: new Date(data).toISOString(),
      tipo, turma_id: turmaId || null, criado_por: userId,
    };
    if (ev) demoStore.update(KEYS.eventos, ev.id, payload);
    else {
      const novo = demoStore.create<Evento>(KEYS.eventos, payload as any);
      if (turmaId) {
        const t = demoStore.get<Turma>(KEYS.turmas, turmaId);
        if (t) notificar([...t.alunos, ...t.professores].filter((u) => u !== userId), { titulo: "Novo evento", mensagem: novo.titulo, tipo: "evento", link: "/calendario" });
      }
    }
    setLoading(false); toast.success("Evento salvo"); onClose();
  }

  return (
    <Modal open onClose={onClose} title={ev ? "Editar evento" : "Novo evento"}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Título" value={titulo} onChange={setTitulo} required />
        <Field label="Data e hora" value={data} onChange={setData} type="datetime-local" required />
        <SelectField label="Tipo" value={tipo} onChange={(v) => setTipo(v as any)} required options={[
          { value: "prova", label: "Prova" }, { value: "trabalho", label: "Trabalho" },
          { value: "seminario", label: "Seminário" }, ...(podeInst ? [{ value: "institucional", label: "Institucional" }] : []),
        ]} />
        <SelectField label="Turma (opcional)" value={turmaId} onChange={setTurmaId} options={turmas.map((t) => ({ value: t.id, label: t.nome }))} />
        <Field label="Descrição" value={descricao} onChange={setDescricao} rows={2} />
        <PrimaryButton type="submit" loading={loading}>Salvar</PrimaryButton>
      </form>
    </Modal>
  );
}