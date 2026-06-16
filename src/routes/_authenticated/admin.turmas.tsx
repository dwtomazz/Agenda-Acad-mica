import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Empty, Field, SelectField, PrimaryButton, Modal, Badge } from "@/components/ui-bits";
import { demoStore, KEYS } from "@/lib/demoStore";
import { BookOpen, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/turmas")({ component: AdminTurmas });

function AdminTurmas() {
  const qc = useQueryClient();
  const [edit, setEdit] = useState<any | null>(null);
  const turmas = useQuery({
    queryKey: ["admin-turmas"],
    queryFn: async () => {
      const disc = demoStore.list<any>(KEYS.disciplinas);
      return demoStore.list<any>(KEYS.turmas)
        .map((t) => ({ ...t, disciplina_nome: disc.find((d) => d.id === t.disciplina_id)?.nome ?? null }))
        .sort((a, b) => (b.ano ?? 0) - (a.ano ?? 0));
    },
  });
  async function del(id: string) {
    if (!confirm("Excluir turma?")) return;
    demoStore.remove(KEYS.turmas, id);
    qc.invalidateQueries({ queryKey: ["admin-turmas"] });
  }
  return (
    <AppShell title="Turmas">
      <div className="mb-4"><PrimaryButton onClick={() => setEdit({})} className="w-full"><Plus size={18}/> Nova turma</PrimaryButton></div>
      {turmas.data?.length ? turmas.data.map((t: any) => (
        <Card key={t.id} className="mb-2 flex items-center gap-3">
          <BookOpen size={18} className="text-primary"/>
          <div className="flex-1">
            <p className="text-sm font-semibold">{t.nome} <Badge>{t.ano}</Badge></p>
            <p className="text-xs text-muted-foreground">{t.disciplina_nome ?? "—"} · prof. {t.professor_nome ?? "—"}</p>
          </div>
          <button onClick={() => setEdit(t)} className="grid h-8 w-8 place-items-center rounded-lg border border-border"><Pencil size={14}/></button>
          <button onClick={() => del(t.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-border text-destructive"><Trash2 size={14}/></button>
        </Card>
      )) : <Empty>Nenhuma turma.</Empty>}

      {edit && <TurmaForm turma={edit} onClose={() => { setEdit(null); qc.invalidateQueries({ queryKey: ["admin-turmas"] }); }} />}
    </AppShell>
  );
}

function TurmaForm({ turma, onClose }: { turma: any; onClose: () => void }) {
  const [nome, setNome] = useState(turma.nome ?? "");
  const [ano, setAno] = useState(String(turma.ano ?? new Date().getFullYear()));
  const [disciplinaId, setDisciplinaId] = useState(turma.disciplina_id ?? "");
  const [profNome, setProfNome] = useState(turma.professor_nome ?? "");
  const [loading, setLoading] = useState(false);

  const disc = useQuery({ queryKey: ["disciplinas"], queryFn: async () => demoStore.list<any>(KEYS.disciplinas) });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const payload = { nome, ano: Number(ano), disciplina_id: disciplinaId || null, professor_nome: profNome || null };
    if (turma.id) demoStore.update(KEYS.turmas, turma.id, payload);
    else demoStore.create(KEYS.turmas, payload);
    setLoading(false);
    toast.success("Salvo"); onClose();
  }
  return (
    <Modal open onClose={onClose} title={turma.id ? "Editar turma" : "Nova turma"}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Nome" value={nome} onChange={setNome} required />
        <Field label="Ano" value={ano} onChange={setAno} type="number" required />
        <SelectField label="Disciplina" value={disciplinaId} onChange={setDisciplinaId} options={(disc.data ?? []).map((d) => ({ value: d.id, label: d.nome }))} />
        <Field label="Professor responsável" value={profNome} onChange={setProfNome} placeholder="Nome do professor" />
        <PrimaryButton type="submit" loading={loading}>Salvar</PrimaryButton>
      </form>
    </Modal>
  );
}
