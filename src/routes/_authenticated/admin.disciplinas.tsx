import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Empty, Field, SelectField, PrimaryButton, Modal } from "@/components/ui-bits";
import { useDemoList } from "@/hooks/useDemoData";
import { demoStore, KEYS, type Disciplina, type Turma, type Usuario } from "@/lib/demoStore";
import { Library, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/disciplinas")({ component: AdminDisc });

const DIAS = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];

function AdminDisc() {
  const disc = useDemoList<Disciplina>(KEYS.disciplinas);
  const turmas = useDemoList<Turma>(KEYS.turmas);
  const usuarios = useDemoList<Usuario>(KEYS.usuarios);
  const [open, setOpen] = useState<Disciplina | { __new: true } | null>(null);

  function del(d: Disciplina) {
    if (!confirm("Excluir disciplina?")) return;
    demoStore.remove(KEYS.disciplinas, d.id); toast.success("Excluída");
  }

  return (
    <AppShell title="Disciplinas">
      <div className="mb-3"><PrimaryButton onClick={() => setOpen({ __new: true } as any)} className="w-full"><Plus size={18}/> Nova disciplina</PrimaryButton></div>
      {disc.length ? disc.map((d) => {
        const t = turmas.find((x) => x.id === d.turma_id);
        const p = usuarios.find((u) => u.id === d.professor_id);
        return (
          <Card key={d.id} className="mb-2 flex items-center gap-3">
            <Library size={18} className="text-primary"/>
            <div className="flex-1">
              <p className="text-sm font-semibold">{d.nome} <span className="text-xs text-muted-foreground">({d.codigo})</span></p>
              <p className="text-xs text-muted-foreground">{t?.nome ?? "—"} · prof. {p?.nome ?? "—"} · {DIAS[d.dia_semana]} {d.hora_inicio}-{d.hora_fim}</p>
            </div>
            <button onClick={() => setOpen(d)} className="grid h-8 w-8 place-items-center rounded-lg border border-border"><Pencil size={14}/></button>
            <button onClick={() => del(d)} className="grid h-8 w-8 place-items-center rounded-lg border border-border text-destructive"><Trash2 size={14}/></button>
          </Card>
        );
      }) : <Empty>Nenhuma disciplina.</Empty>}
      {open && <DiscForm d={"__new" in open ? null : open} onClose={() => setOpen(null)} />}
    </AppShell>
  );
}

function DiscForm({ d, onClose }: { d: Disciplina | null; onClose: () => void }) {
  const turmas = useDemoList<Turma>(KEYS.turmas);
  const usuarios = useDemoList<Usuario>(KEYS.usuarios);
  const [nome, setNome] = useState(d?.nome ?? "");
  const [codigo, setCodigo] = useState(d?.codigo ?? "");
  const [turmaId, setTurmaId] = useState(d?.turma_id ?? "");
  const [profId, setProfId] = useState(d?.professor_id ?? "");
  const [carga, setCarga] = useState(String(d?.carga_horaria ?? 60));
  const [dia, setDia] = useState(String(d?.dia_semana ?? 1));
  const [hi, setHi] = useState(d?.hora_inicio ?? "07:30");
  const [hf, setHf] = useState(d?.hora_fim ?? "09:00");
  const [loading, setLoading] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    const payload = { nome, codigo, turma_id: turmaId, professor_id: profId || null, carga_horaria: Number(carga), dia_semana: Number(dia), hora_inicio: hi, hora_fim: hf };
    if (d) demoStore.update(KEYS.disciplinas, d.id, payload);
    else demoStore.create<Disciplina>(KEYS.disciplinas, payload as any);
    setLoading(false); toast.success("Disciplina salva"); onClose();
  }
  const profsOpts = usuarios.filter((u) => u.perfil === "professor").map((u) => ({ value: u.id, label: u.nome }));

  return (
    <Modal open onClose={onClose} title={d ? "Editar disciplina" : "Nova disciplina"}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Nome" value={nome} onChange={setNome} required />
        <Field label="Código" value={codigo} onChange={setCodigo} required />
        <SelectField label="Turma" value={turmaId} onChange={setTurmaId} required options={turmas.map((t) => ({ value: t.id, label: t.nome }))} />
        <SelectField label="Professor" value={profId} onChange={setProfId} options={profsOpts} />
        <Field label="Carga horária" value={carga} onChange={setCarga} type="number" />
        <SelectField label="Dia da semana" value={dia} onChange={setDia} required options={["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"].map((n, i) => ({ value: String(i), label: n }))} />
        <div className="grid grid-cols-2 gap-2">
          <Field label="Início" value={hi} onChange={setHi} type="time" />
          <Field label="Fim" value={hf} onChange={setHf} type="time" />
        </div>
        <PrimaryButton type="submit" loading={loading}>Salvar</PrimaryButton>
      </form>
    </Modal>
  );
}