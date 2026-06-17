import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { AppShell } from "@/components/AppShell";
import { Card, Field, SelectField, PrimaryButton } from "@/components/ui-bits";
import { useDemoUser, useMinhasTurmas, useDemoList } from "@/hooks/useDemoData";
import { demoStore, KEYS, notificar, type Atividade, type Disciplina, type Turma } from "@/lib/demoStore";
import { toast } from "sonner";

const search = z.object({ id: z.string().optional() });

export const Route = createFileRoute("/_authenticated/atividades/nova")({
  validateSearch: search,
  component: NovaAtividade,
});

function NovaAtividade() {
  const { id } = Route.useSearch();
  const me = useDemoUser();
  const navigate = useNavigate();
  const minhas = useMinhasTurmas();
  const todasTurmas = useDemoList<Turma>(KEYS.turmas);
  const disciplinas = useDemoList<Disciplina>(KEYS.disciplinas);

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [prazo, setPrazo] = useState("");
  const [turmaId, setTurmaId] = useState("");
  const [discId, setDiscId] = useState("");
  const [tipo, setTipo] = useState<Atividade["tipo"]>("exercicio");
  const [loading, setLoading] = useState(false);

  const turmasOpts = me?.perfil === "administrador" ? todasTurmas : minhas;

  useEffect(() => {
    if (!id) return;
    const a = demoStore.get<Atividade>(KEYS.atividades, id);
    if (!a) return;
    setTitulo(a.titulo); setDescricao(a.descricao);
    setPrazo(a.prazo ? a.prazo.slice(0, 16) : "");
    setTurmaId(a.turma_id); setDiscId(a.disciplina_id ?? ""); setTipo(a.tipo);
  }, [id]);

  const discOpts = useMemo(() => disciplinas.filter((d) => !turmaId || d.turma_id === turmaId), [disciplinas, turmaId]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!me) return;
    setLoading(true);
    const payload = {
      titulo, descricao, prazo: new Date(prazo).toISOString(),
      turma_id: turmaId, disciplina_id: discId || null, tipo, criada_por: me.id,
    };
    if (id) {
      demoStore.update(KEYS.atividades, id, payload);
    } else {
      const a = demoStore.create<Atividade>(KEYS.atividades, payload as any);
      // notifica alunos da turma
      const t = demoStore.get<Turma>(KEYS.turmas, turmaId);
      if (t) notificar(t.alunos, { titulo: "Nova atividade", mensagem: a.titulo, tipo: "atividade", link: "/atividades" });
    }
    setLoading(false);
    toast.success(id ? "Atividade atualizada" : "Atividade criada");
    navigate({ to: "/atividades" });
  }

  return (
    <AppShell title={id ? "Editar atividade" : "Nova atividade"} back="/atividades">
      <Card>
        <form onSubmit={submit} className="space-y-3">
          <Field label="Título" value={titulo} onChange={setTitulo} required />
          <Field label="Descrição" value={descricao} onChange={setDescricao} rows={3} />
          <Field label="Prazo" value={prazo} onChange={setPrazo} type="datetime-local" required />
          <SelectField label="Turma" value={turmaId} onChange={setTurmaId} required options={turmasOpts.map((t) => ({ value: t.id, label: t.nome }))} />
          <SelectField label="Disciplina" value={discId} onChange={setDiscId} options={discOpts.map((d) => ({ value: d.id, label: d.nome }))} />
          <SelectField label="Tipo" value={tipo} onChange={(v) => setTipo(v as any)} required options={[
            { value: "exercicio", label: "Exercício" },
            { value: "trabalho", label: "Trabalho" },
            { value: "prova", label: "Prova" },
            { value: "seminario", label: "Seminário" },
          ]} />
          <PrimaryButton type="submit" loading={loading}>{id ? "Salvar" : "Criar"}</PrimaryButton>
        </form>
      </Card>
    </AppShell>
  );
}