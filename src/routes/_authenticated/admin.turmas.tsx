import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Empty, Field, PrimaryButton, Modal, Badge } from "@/components/ui-bits";
import { useDemoList } from "@/hooks/useDemoData";
import { demoStore, KEYS, type Turma, type Usuario } from "@/lib/demoStore";
import { BookOpen, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/turmas")({ component: AdminTurmas });

function AdminTurmas() {
  const turmas = useDemoList<Turma>(KEYS.turmas);
  const [edit, setEdit] = useState<Turma | { __new: true } | null>(null);

  function del(t: Turma) {
    if (!confirm(`Excluir turma "${t.nome}"?`)) return;
    demoStore.remove(KEYS.turmas, t.id); toast.success("Excluída");
  }

  return (
    <AppShell title="Turmas">
      <div className="mb-3"><PrimaryButton onClick={() => setEdit({ __new: true } as any)} className="w-full"><Plus size={18}/> Nova turma</PrimaryButton></div>
      {turmas.length ? turmas.map((t) => (
        <Card key={t.id} className="mb-2 flex items-center gap-3">
          <BookOpen size={18} className="text-primary"/>
          <div className="flex-1">
            <p className="text-sm font-semibold">{t.nome} <Badge>{t.ano}</Badge></p>
            <p className="text-xs text-muted-foreground">{t.periodo} · {t.professores.length} profs · {t.alunos.length} alunos</p>
          </div>
          <button onClick={() => setEdit(t)} className="grid h-8 w-8 place-items-center rounded-lg border border-border"><Pencil size={14}/></button>
          <button onClick={() => del(t)} className="grid h-8 w-8 place-items-center rounded-lg border border-border text-destructive"><Trash2 size={14}/></button>
        </Card>
      )) : <Empty>Nenhuma turma.</Empty>}
      {edit && <TurmaForm turma={"__new" in edit ? null : edit} onClose={() => setEdit(null)} />}
    </AppShell>
  );
}

function TurmaForm({ turma, onClose }: { turma: Turma | null; onClose: () => void }) {
  const usuarios = useDemoList<Usuario>(KEYS.usuarios);
  const [nome, setNome] = useState(turma?.nome ?? "");
  const [ano, setAno] = useState(String(turma?.ano ?? new Date().getFullYear()));
  const [periodo, setPeriodo] = useState(turma?.periodo ?? "Matutino");
  const [profs, setProfs] = useState<string[]>(turma?.professores ?? []);
  const [alunos, setAlunos] = useState<string[]>(turma?.alunos ?? []);
  const [loading, setLoading] = useState(false);

  const todosProfs = usuarios.filter((u) => u.perfil === "professor");
  const todosAlunos = usuarios.filter((u) => u.perfil === "aluno");

  function toggleId(list: string[], setList: (v: string[]) => void, id: string) {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    const payload = { nome, ano: Number(ano), periodo, professores: profs, alunos };
    if (turma) demoStore.update(KEYS.turmas, turma.id, payload);
    else demoStore.create<Turma>(KEYS.turmas, payload as any);
    setLoading(false); toast.success("Turma salva"); onClose();
  }

  return (
    <Modal open onClose={onClose} title={turma ? "Editar turma" : "Nova turma"}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Nome" value={nome} onChange={setNome} required />
        <div className="grid grid-cols-2 gap-2">
          <Field label="Ano" value={ano} onChange={setAno} type="number" required />
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Período</span>
            <select value={periodo} onChange={(e) => setPeriodo(e.target.value)} className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm">
              <option>Matutino</option><option>Vespertino</option><option>Noturno</option>
            </select>
          </label>
        </div>
        <div>
          <p className="mb-1 text-sm font-medium">Professores</p>
          <div className="max-h-32 space-y-1 overflow-auto rounded-xl border border-border p-2">
            {todosProfs.length ? todosProfs.map((u) => (
              <label key={u.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={profs.includes(u.id)} onChange={() => toggleId(profs, setProfs, u.id)} />
                {u.nome}
              </label>
            )) : <p className="text-xs text-muted-foreground">Cadastre professores em Usuários.</p>}
          </div>
        </div>
        <div>
          <p className="mb-1 text-sm font-medium">Alunos</p>
          <div className="max-h-40 space-y-1 overflow-auto rounded-xl border border-border p-2">
            {todosAlunos.length ? todosAlunos.map((u) => (
              <label key={u.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={alunos.includes(u.id)} onChange={() => toggleId(alunos, setAlunos, u.id)} />
                {u.nome}
              </label>
            )) : <p className="text-xs text-muted-foreground">Cadastre alunos em Usuários.</p>}
          </div>
        </div>
        <PrimaryButton type="submit" loading={loading}>Salvar</PrimaryButton>
      </form>
    </Modal>
  );
}