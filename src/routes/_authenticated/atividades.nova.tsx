import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { AppShell } from "@/components/AppShell";
import { Card, Field, SelectField, PrimaryButton } from "@/components/ui-bits";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const search = z.object({ id: z.string().optional() });

export const Route = createFileRoute("/_authenticated/atividades/nova")({
  validateSearch: search,
  component: NovaAtividade,
});

function NovaAtividade() {
  const { id } = Route.useSearch();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [prazo, setPrazo] = useState("");
  const [turmaId, setTurmaId] = useState("");
  const [disciplinaId, setDisciplinaId] = useState("");
  const [loading, setLoading] = useState(false);

  const turmas = useQuery({
    queryKey: ["minhas-turmas", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("turmas").select("id,nome,disciplina_id");
      return data ?? [];
    },
  });
  const disciplinas = useQuery({
    queryKey: ["disciplinas"],
    queryFn: async () => (await supabase.from("disciplinas").select("id,nome")).data ?? [],
  });

  useEffect(() => {
    if (!id) return;
    supabase.from("atividades").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      if (!data) return;
      setTitulo(data.titulo); setDescricao(data.descricao ?? "");
      setPrazo(data.prazo ? data.prazo.slice(0, 16) : "");
      setTurmaId(data.turma_id); setDisciplinaId(data.disciplina_id ?? "");
    });
  }, [id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const payload = {
      titulo, descricao: descricao || null,
      prazo: prazo ? new Date(prazo).toISOString() : null,
      turma_id: turmaId, disciplina_id: disciplinaId || null,
      criada_por: user!.id,
    };
    const op = id
      ? supabase.from("atividades").update(payload).eq("id", id)
      : supabase.from("atividades").insert(payload);
    const { error } = await op;
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(id ? "Atualizada" : "Atividade criada");
    navigate({ to: "/atividades" });
  }

  return (
    <AppShell title={id ? "Editar atividade" : "Nova atividade"} back="/atividades">
      <Card>
        <form onSubmit={submit} className="space-y-3">
          <Field label="Título" value={titulo} onChange={setTitulo} required />
          <Field label="Descrição" value={descricao} onChange={setDescricao} rows={3} />
          <Field label="Prazo" value={prazo} onChange={setPrazo} type="datetime-local" />
          <SelectField label="Turma" value={turmaId} onChange={setTurmaId} required options={(turmas.data ?? []).map((t) => ({ value: t.id, label: t.nome }))} />
          <SelectField label="Disciplina" value={disciplinaId} onChange={setDisciplinaId} options={(disciplinas.data ?? []).map((d) => ({ value: d.id, label: d.nome }))} />
          <PrimaryButton type="submit" loading={loading}>{id ? "Salvar" : "Criar"}</PrimaryButton>
        </form>
      </Card>
    </AppShell>
  );
}
