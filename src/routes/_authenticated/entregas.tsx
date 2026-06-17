import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Empty, SectionTitle, Badge, Field, PrimaryButton, Modal } from "@/components/ui-bits";
import { RequireTurma } from "@/components/RequireTurma";
import { useDemoList, useDemoUser, useMinhasTurmas } from "@/hooks/useDemoData";
import { demoStore, KEYS, type Atividade, type Turma, type Usuario } from "@/lib/demoStore";
import { Inbox, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

type Entrega = { id: string; atividade_id: string; aluno_id: string; status: "pendente" | "entregue"; data_envio?: string; nota?: number | null; comentario?: string };

export const Route = createFileRoute("/_authenticated/entregas")({ component: Page });

function Page() {
  const me = useDemoUser();
  if (!me) return null;
  return (
    <AppShell title="Entregas">
      <RequireTurma>
        {me.perfil === "aluno" ? <EntregaAluno/> : <EntregaProf/>}
      </RequireTurma>
    </AppShell>
  );
}

function EntregaAluno() {
  const me = useDemoUser()!;
  const turmas = useMinhasTurmas();
  const atividades = useDemoList<Atividade>(KEYS.atividades);
  const entregas = useDemoList<Entrega>(KEYS.entregas);
  const tIds = new Set(turmas.map((t) => t.id));
  const minhas = atividades.filter((a) => tIds.has(a.turma_id)).sort((a, b) => a.prazo.localeCompare(b.prazo));

  function toggle(a: Atividade) {
    const ex = entregas.find((e) => e.atividade_id === a.id && e.aluno_id === me.id);
    if (ex) {
      if (ex.status === "entregue") demoStore.update(KEYS.entregas, ex.id, { status: "pendente", data_envio: null as any });
      else demoStore.update(KEYS.entregas, ex.id, { status: "entregue", data_envio: new Date().toISOString() });
    } else {
      demoStore.create<Entrega>(KEYS.entregas, { atividade_id: a.id, aluno_id: me.id, status: "entregue", data_envio: new Date().toISOString(), nota: null } as any);
    }
    toast.success("Entrega atualizada");
  }

  return (
    <>
      {minhas.length ? minhas.map((a) => {
        const e = entregas.find((e) => e.atividade_id === a.id && e.aluno_id === me.id);
        const enviado = e?.status === "entregue";
        return (
          <Card key={a.id} className="mb-2 flex items-start gap-3">
            <button onClick={() => toggle(a)} className="mt-0.5">
              {enviado ? <CheckCircle2 size={22} className="text-primary"/> : <Circle size={22} className="text-muted-foreground"/>}
            </button>
            <div className="flex-1">
              <p className="text-sm font-semibold">{a.titulo}</p>
              <p className="text-xs text-muted-foreground">prazo {new Date(a.prazo).toLocaleString("pt-BR")}</p>
              {enviado && <p className="mt-1 text-xs text-emerald-400">Entregue {e?.data_envio ? new Date(e.data_envio).toLocaleDateString("pt-BR") : ""}</p>}
              {e?.nota != null && <p className="mt-1 text-sm">Nota: <b>{Number(e.nota).toFixed(1)}</b></p>}
              {e?.comentario && <p className="mt-1 text-xs text-muted-foreground">"{e.comentario}"</p>}
            </div>
          </Card>
        );
      }) : <Empty>Nenhuma atividade.</Empty>}
    </>
  );
}

function EntregaProf() {
  const me = useDemoUser()!;
  const turmas = useMinhasTurmas();
  const atividades = useDemoList<Atividade>(KEYS.atividades);
  const entregas = useDemoList<Entrega>(KEYS.entregas);
  const usuarios = useDemoList<Usuario>(KEYS.usuarios);
  const [editing, setEditing] = useState<{ ativ: Atividade; alunoId: string; entrega: Entrega | null } | null>(null);

  const tIds = new Set(turmas.map((t) => t.id));
  const minhas = atividades.filter((a) => tIds.has(a.turma_id) && (me.perfil === "administrador" || a.criada_por === me.id || true));

  return (
    <>
      {minhas.length ? minhas.map((a) => {
        const turma = turmas.find((t) => t.id === a.turma_id);
        const alunos = turma?.alunos ?? [];
        return (
          <div key={a.id} className="mb-4">
            <SectionTitle action={<Badge>{entregas.filter((e) => e.atividade_id === a.id && e.status === "entregue").length}/{alunos.length}</Badge>}>{a.titulo} <span className="text-xs text-muted-foreground">· {turma?.nome}</span></SectionTitle>
            {alunos.length ? alunos.map((aId) => {
              const aluno = usuarios.find((u) => u.id === aId);
              const e = entregas.find((x) => x.atividade_id === a.id && x.aluno_id === aId) ?? null;
              return (
                <Card key={aId} className="mb-2 flex items-center gap-3">
                  <Inbox size={18} className="text-primary"/>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{aluno?.nome ?? aId}</p>
                    <p className="text-xs text-muted-foreground">
                      {e?.status === "entregue" ? `Entregue ${e.data_envio ? new Date(e.data_envio).toLocaleDateString("pt-BR") : ""}` : "Pendente"}
                      {e?.nota != null && ` · Nota ${Number(e.nota).toFixed(1)}`}
                    </p>
                  </div>
                  <button onClick={() => setEditing({ ativ: a, alunoId: aId, entrega: e })} className="rounded-lg border border-border px-3 py-1 text-xs hover:bg-secondary">Corrigir</button>
                </Card>
              );
            }) : <Empty>Turma sem alunos.</Empty>}
          </div>
        );
      }) : <Empty>Sem atividades em suas turmas.</Empty>}

      {editing && <CorrigirModal {...editing} onClose={() => setEditing(null)} />}
    </>
  );
}

function CorrigirModal({ ativ, alunoId, entrega, onClose }: { ativ: Atividade; alunoId: string; entrega: Entrega | null; onClose: () => void }) {
  const [nota, setNota] = useState(entrega?.nota != null ? String(entrega.nota) : "");
  const [coment, setComent] = useState(entrega?.comentario ?? "");
  const [loading, setLoading] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    const patch = { nota: nota === "" ? null : Number(nota), comentario: coment };
    if (entrega) demoStore.update(KEYS.entregas, entrega.id, patch);
    else demoStore.create<Entrega>(KEYS.entregas, { atividade_id: ativ.id, aluno_id: alunoId, status: "entregue", data_envio: new Date().toISOString(), ...patch } as any);
    setLoading(false); toast.success("Correção salva"); onClose();
  }
  return (
    <Modal open onClose={onClose} title="Corrigir entrega">
      <form onSubmit={submit} className="space-y-3">
        <Field label="Nota (0 a 10)" value={nota} onChange={setNota} type="number" />
        <Field label="Comentário" value={coment} onChange={setComent} rows={3} />
        <PrimaryButton type="submit" loading={loading}>Salvar</PrimaryButton>
      </form>
    </Modal>
  );
}