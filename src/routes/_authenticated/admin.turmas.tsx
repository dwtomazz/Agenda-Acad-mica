import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Empty, Field, SelectField, PrimaryButton, Modal, Badge } from "@/components/ui-bits";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Plus, Pencil, Trash2, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/turmas")({ component: AdminTurmas });

function AdminTurmas() {
  const qc = useQueryClient();
  const [edit, setEdit] = useState<any | null>(null);
  const [vincular, setVincular] = useState<any | null>(null);
  const turmas = useQuery({
    queryKey: ["admin-turmas"],
    queryFn: async () => (await supabase.from("turmas").select("*,disciplinas(nome),profiles!turmas_professor_id_fkey(full_name)").order("ano", { ascending: false })).data ?? [],
  });
  async function del(id: string) {
    if (!confirm("Excluir turma?")) return;
    await supabase.from("turmas").delete().eq("id", id);
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
            <p className="text-xs text-muted-foreground">{t.disciplinas?.nome ?? "—"} · prof. {t.profiles?.full_name ?? "—"}</p>
          </div>
          <button onClick={() => setVincular(t)} className="grid h-8 w-8 place-items-center rounded-lg border border-border" title="Alunos"><UsersIcon size={14}/></button>
          <button onClick={() => setEdit(t)} className="grid h-8 w-8 place-items-center rounded-lg border border-border"><Pencil size={14}/></button>
          <button onClick={() => del(t.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-border text-destructive"><Trash2 size={14}/></button>
        </Card>
      )) : <Empty>Nenhuma turma.</Empty>}

      {edit && <TurmaForm turma={edit} onClose={() => { setEdit(null); qc.invalidateQueries({ queryKey: ["admin-turmas"] }); }} />}
      {vincular && <VincularAlunos turma={vincular} onClose={() => setVincular(null)} />}
    </AppShell>
  );
}

function TurmaForm({ turma, onClose }: { turma: any; onClose: () => void }) {
  const [nome, setNome] = useState(turma.nome ?? "");
  const [ano, setAno] = useState(String(turma.ano ?? new Date().getFullYear()));
  const [disciplinaId, setDisciplinaId] = useState(turma.disciplina_id ?? "");
  const [profId, setProfId] = useState(turma.professor_id ?? "");
  const [loading, setLoading] = useState(false);

  const disc = useQuery({ queryKey: ["disciplinas"], queryFn: async () => (await supabase.from("disciplinas").select("id,nome")).data ?? [] });
  const profs = useQuery({
    queryKey: ["profs"],
    queryFn: async () => {
      const { data: ids } = await supabase.from("user_roles").select("user_id").eq("role", "professor");
      if (!ids?.length) return [];
      const { data } = await supabase.from("profiles").select("id,full_name").in("id", ids.map((i) => i.user_id));
      return data ?? [];
    },
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const payload = { nome, ano: Number(ano), disciplina_id: disciplinaId || null, professor_id: profId || null };
    const op = turma.id
      ? supabase.from("turmas").update(payload).eq("id", turma.id)
      : supabase.from("turmas").insert(payload);
    const { error } = await op;
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Salvo"); onClose();
  }
  return (
    <Modal open onClose={onClose} title={turma.id ? "Editar turma" : "Nova turma"}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Nome" value={nome} onChange={setNome} required />
        <Field label="Ano" value={ano} onChange={setAno} type="number" required />
        <SelectField label="Disciplina" value={disciplinaId} onChange={setDisciplinaId} options={(disc.data ?? []).map((d) => ({ value: d.id, label: d.nome }))} />
        <SelectField label="Professor responsável" value={profId} onChange={setProfId} options={(profs.data ?? []).map((p) => ({ value: p.id, label: p.full_name ?? "—" }))} />
        <PrimaryButton type="submit" loading={loading}>Salvar</PrimaryButton>
      </form>
    </Modal>
  );
}

function VincularAlunos({ turma, onClose }: { turma: any; onClose: () => void }) {
  const qc = useQueryClient();
  const vinc = useQuery({
    queryKey: ["turma-alunos-adm", turma.id],
    queryFn: async () => (await supabase.from("turma_alunos").select("aluno_id,profiles(full_name)").eq("turma_id", turma.id)).data ?? [],
  });
  const alunos = useQuery({
    queryKey: ["alunos-all"],
    queryFn: async () => {
      const { data: ids } = await supabase.from("user_roles").select("user_id").eq("role", "aluno");
      if (!ids?.length) return [];
      const { data } = await supabase.from("profiles").select("id,full_name").in("id", ids.map((i) => i.user_id));
      return data ?? [];
    },
  });
  const inSet = new Set((vinc.data ?? []).map((v: any) => v.aluno_id));

  async function toggle(id: string) {
    if (inSet.has(id)) {
      await supabase.from("turma_alunos").delete().eq("turma_id", turma.id).eq("aluno_id", id);
    } else {
      await supabase.from("turma_alunos").insert({ turma_id: turma.id, aluno_id: id });
    }
    qc.invalidateQueries({ queryKey: ["turma-alunos-adm", turma.id] });
  }

  return (
    <Modal open onClose={onClose} title={`Alunos — ${turma.nome}`}>
      <div className="max-h-80 space-y-2 overflow-y-auto">
        {alunos.data?.length ? alunos.data.map((a) => (
          <label key={a.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-2">
            <input type="checkbox" checked={inSet.has(a.id)} onChange={() => toggle(a.id)} />
            <span className="text-sm">{a.full_name}</span>
          </label>
        )) : <Empty>Sem alunos cadastrados.</Empty>}
      </div>
    </Modal>
  );
}
