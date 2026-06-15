import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Card, Empty, SectionTitle, Badge } from "@/components/ui-bits";
import { useAuth, useUserRole } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Users, ClipboardList } from "lucide-react";

export const Route = createFileRoute("/_authenticated/turmas/$id")({ component: TurmaDetail });

function TurmaDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const { role } = useUserRole();

  const turma = useQuery({
    queryKey: ["turma", id],
    queryFn: async () => (await supabase.from("turmas").select("*,disciplinas(nome),profiles!turmas_professor_id_fkey(full_name)").eq("id", id).maybeSingle()).data,
  });
  const alunos = useQuery({
    queryKey: ["turma-alunos", id],
    enabled: role !== "aluno",
    queryFn: async () => (await supabase.from("turma_alunos").select("aluno_id,profiles(full_name,avatar_url)").eq("turma_id", id)).data ?? [],
  });
  const ativ = useQuery({
    queryKey: ["turma-ativ", id],
    queryFn: async () => (await supabase.from("atividades").select("id,titulo,prazo").eq("turma_id", id).order("prazo", { ascending: true })).data ?? [],
  });

  if (!turma.data) return <AppShell title="Turma" back="/turmas"><Empty>Turma não encontrada.</Empty></AppShell>;
  return (
    <AppShell title={turma.data.nome} back="/turmas">
      <Card className="mb-4">
        <p className="text-sm"><b>Disciplina:</b> {(turma.data as any).disciplinas?.nome ?? "—"}</p>
        <p className="text-sm"><b>Ano:</b> {turma.data.ano}</p>
        <p className="text-sm"><b>Professor:</b> {(turma.data as any).profiles?.full_name ?? "—"}</p>
      </Card>

      <section className="mb-5">
        <SectionTitle>Atividades</SectionTitle>
        {ativ.data?.length ? ativ.data.map((a: any) => (
          <Card key={a.id} className="mb-2 flex items-center gap-3">
            <ClipboardList size={18} className="text-primary"/>
            <div className="flex-1"><p className="text-sm font-semibold">{a.titulo}</p><p className="text-xs text-muted-foreground">{a.prazo ? new Date(a.prazo).toLocaleString("pt-BR") : "Sem prazo"}</p></div>
          </Card>
        )) : <Empty>Sem atividades.</Empty>}
      </section>

      {role !== "aluno" && (
        <section>
          <SectionTitle action={<Badge>{alunos.data?.length ?? 0}</Badge>}>Alunos</SectionTitle>
          {alunos.data?.length ? (
            <div className="space-y-1">
              {alunos.data.map((a: any) => (
                <Card key={a.aluno_id} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 grid place-items-center"><Users size={14} className="text-primary"/></div>
                  <p className="text-sm">{a.profiles?.full_name ?? "—"}</p>
                </Card>
              ))}
            </div>
          ) : <Empty>Sem alunos.</Empty>}
        </section>
      )}
    </AppShell>
  );
}
