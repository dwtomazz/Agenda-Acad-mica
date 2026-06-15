import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Card, SectionTitle, Empty, Badge } from "@/components/ui-bits";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/relatorios")({ component: Relatorios });

function Relatorios() {
  const alunos = useQuery({ queryKey: ["rel-alunos"], queryFn: async () => {
    const { data: ids } = await supabase.from("user_roles").select("user_id").eq("role", "aluno");
    if (!ids?.length) return [];
    return (await supabase.from("profiles").select("id,full_name,ativo").in("id", ids.map(i => i.user_id))).data ?? [];
  }});
  const profs = useQuery({ queryKey: ["rel-profs"], queryFn: async () => {
    const { data: ids } = await supabase.from("user_roles").select("user_id").eq("role", "professor");
    if (!ids?.length) return [];
    return (await supabase.from("profiles").select("id,full_name").in("id", ids.map(i => i.user_id))).data ?? [];
  }});
  const turmas = useQuery({ queryKey: ["rel-turmas"], queryFn: async () => (await supabase.from("turmas").select("id,nome,ano,disciplinas(nome)").order("ano", { ascending: false })).data ?? [] });
  const ativ = useQuery({ queryKey: ["rel-ativ"], queryFn: async () => (await supabase.from("atividades").select("id,titulo,prazo,turmas(nome)").order("created_at", { ascending: false }).limit(20)).data ?? [] });

  return (
    <AppShell title="Relatórios">
      <section className="mb-5">
        <SectionTitle action={<Badge>{alunos.data?.length ?? 0}</Badge>}>Alunos</SectionTitle>
        {alunos.data?.length ? alunos.data.slice(0, 10).map((a) => (
          <Card key={a.id} className="mb-1 flex items-center justify-between">
            <p className="text-sm">{a.full_name}</p>
            <Badge tone={a.ativo ? "ok" : "danger"}>{a.ativo ? "Ativo" : "Inativo"}</Badge>
          </Card>
        )) : <Empty>—</Empty>}
      </section>
      <section className="mb-5">
        <SectionTitle action={<Badge>{profs.data?.length ?? 0}</Badge>}>Professores</SectionTitle>
        {profs.data?.length ? profs.data.map((p) => (
          <Card key={p.id} className="mb-1"><p className="text-sm">{p.full_name}</p></Card>
        )) : <Empty>—</Empty>}
      </section>
      <section className="mb-5">
        <SectionTitle action={<Badge>{turmas.data?.length ?? 0}</Badge>}>Turmas</SectionTitle>
        {turmas.data?.length ? turmas.data.map((t: any) => (
          <Card key={t.id} className="mb-1"><p className="text-sm">{t.nome} <span className="text-xs text-muted-foreground">· {t.disciplinas?.nome ?? "—"} · {t.ano}</span></p></Card>
        )) : <Empty>—</Empty>}
      </section>
      <section>
        <SectionTitle action={<Badge>{ativ.data?.length ?? 0}</Badge>}>Atividades recentes</SectionTitle>
        {ativ.data?.length ? ativ.data.map((a: any) => (
          <Card key={a.id} className="mb-1"><p className="text-sm">{a.titulo} <span className="text-xs text-muted-foreground">· {a.turmas?.nome}</span></p></Card>
        )) : <Empty>—</Empty>}
      </section>
    </AppShell>
  );
}
