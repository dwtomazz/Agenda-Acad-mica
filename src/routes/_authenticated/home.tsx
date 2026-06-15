import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Card, SectionTitle, Empty, Badge } from "@/components/ui-bits";
import { useAuth, useUserRole } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ClipboardList, CalendarDays, Megaphone, Users, BookOpen, Library } from "lucide-react";

export const Route = createFileRoute("/_authenticated/home")({
  component: HomePage,
});

function HomePage() {
  const { role, loading } = useUserRole();
  if (loading) return <AppShell title="Início"><p className="text-sm text-muted-foreground">Carregando…</p></AppShell>;
  if (role === "professor") return <HomeProfessor />;
  if (role === "administrador") return <HomeAdmin />;
  return <HomeAluno />;
}

function HomeAluno() {
  const { user } = useAuth();
  const proximas = useQuery({
    queryKey: ["aluno-atividades-prox", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("atividades")
        .select("id,titulo,prazo,turmas(nome)")
        .gte("prazo", new Date().toISOString())
        .order("prazo", { ascending: true })
        .limit(5);
      return data ?? [];
    },
  });
  const provas = useQuery({
    queryKey: ["aluno-provas-prox", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("eventos")
        .select("id,titulo,data,tipo")
        .in("tipo", ["prova", "trabalho"])
        .gte("data", new Date().toISOString())
        .order("data", { ascending: true })
        .limit(3);
      return data ?? [];
    },
  });
  const avisos = useQuery({
    queryKey: ["aluno-avisos", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("avisos").select("id,titulo,created_at,escopo").order("created_at", { ascending: false }).limit(3);
      return data ?? [];
    },
  });

  return (
    <AppShell title="Início">
      <div className="space-y-6">
        <section>
          <SectionTitle>Próximas atividades</SectionTitle>
          {proximas.data?.length ? (
            <div className="space-y-2">
              {proximas.data.map((a: any) => (
                <Link key={a.id} to="/atividades" className="block">
                  <Card className="flex items-center gap-3">
                    <ClipboardList size={20} className="text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{a.titulo}</p>
                      <p className="text-xs text-muted-foreground">{a.turmas?.nome} · prazo {fmtDate(a.prazo)}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : <Empty>Sem atividades pendentes.</Empty>}
        </section>

        <section>
          <SectionTitle>Próximas provas e trabalhos</SectionTitle>
          {provas.data?.length ? (
            <div className="space-y-2">
              {provas.data.map((e: any) => (
                <Card key={e.id} className="flex items-center gap-3">
                  <CalendarDays size={20} className="text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{e.titulo}</p>
                    <p className="text-xs text-muted-foreground capitalize">{e.tipo} · {fmtDate(e.data)}</p>
                  </div>
                </Card>
              ))}
            </div>
          ) : <Empty>Nada agendado.</Empty>}
        </section>

        <section>
          <SectionTitle>Últimos avisos</SectionTitle>
          {avisos.data?.length ? (
            <div className="space-y-2">
              {avisos.data.map((av: any) => (
                <Link key={av.id} to="/avisos" className="block">
                  <Card className="flex items-center gap-3">
                    <Megaphone size={20} className="text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{av.titulo}</p>
                      <p className="text-xs text-muted-foreground">{av.escopo === "geral" ? "Institucional" : "Turma"} · {fmtDate(av.created_at)}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : <Empty>Sem comunicados recentes.</Empty>}
        </section>
      </div>
    </AppShell>
  );
}

function HomeProfessor() {
  const { user } = useAuth();
  const turmas = useQuery({
    queryKey: ["prof-turmas", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("turmas").select("id,nome,ano").eq("professor_id", user!.id);
      return data ?? [];
    },
  });
  const ativ = useQuery({
    queryKey: ["prof-ativ-count", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count } = await supabase
        .from("atividades")
        .select("id", { count: "exact", head: true })
        .gte("prazo", new Date().toISOString());
      return count ?? 0;
    },
  });
  const avisos = useQuery({
    queryKey: ["prof-avisos", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("avisos").select("id,titulo,created_at").eq("criado_por", user!.id).order("created_at", { ascending: false }).limit(3);
      return data ?? [];
    },
  });

  return (
    <AppShell title="Início">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <Card className="text-center">
            <p className="text-3xl font-bold text-primary">{turmas.data?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">Minhas turmas</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-primary">{ativ.data ?? 0}</p>
            <p className="text-xs text-muted-foreground">Atividades ativas</p>
          </Card>
        </div>

        <section>
          <SectionTitle action={<Link to="/turmas" className="text-xs text-primary hover:underline">ver tudo</Link>}>Minhas turmas</SectionTitle>
          {turmas.data?.length ? (
            <div className="space-y-2">
              {turmas.data.slice(0, 4).map((t) => (
                <Link key={t.id} to="/turmas/$id" params={{ id: t.id }} className="block">
                  <Card className="flex items-center gap-3">
                    <BookOpen size={20} className="text-primary" />
                    <div className="flex-1"><p className="text-sm font-semibold">{t.nome}</p><p className="text-xs text-muted-foreground">{t.ano}</p></div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : <Empty>Você ainda não está em nenhuma turma. Peça ao administrador.</Empty>}
        </section>

        <section>
          <SectionTitle>Últimos avisos enviados</SectionTitle>
          {avisos.data?.length ? avisos.data.map((a: any) => (
            <Card key={a.id} className="mb-2"><p className="text-sm font-semibold">{a.titulo}</p><p className="text-xs text-muted-foreground">{fmtDate(a.created_at)}</p></Card>
          )) : <Empty>Nenhum aviso enviado.</Empty>}
        </section>
      </div>
    </AppShell>
  );
}

function HomeAdmin() {
  const stats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [alunos, prof, turmas, ativ] = await Promise.all([
        supabase.from("user_roles").select("user_id", { count: "exact", head: true }).eq("role", "aluno"),
        supabase.from("user_roles").select("user_id", { count: "exact", head: true }).eq("role", "professor"),
        supabase.from("turmas").select("id", { count: "exact", head: true }),
        supabase.from("atividades").select("id", { count: "exact", head: true }),
      ]);
      return {
        alunos: alunos.count ?? 0,
        professores: prof.count ?? 0,
        turmas: turmas.count ?? 0,
        atividades: ativ.count ?? 0,
      };
    },
  });

  const cards = [
    { i: Users, t: "Alunos", v: stats.data?.alunos ?? 0, to: "/admin/usuarios" },
    { i: Users, t: "Professores", v: stats.data?.professores ?? 0, to: "/admin/usuarios" },
    { i: BookOpen, t: "Turmas", v: stats.data?.turmas ?? 0, to: "/admin/turmas" },
    { i: ClipboardList, t: "Atividades", v: stats.data?.atividades ?? 0, to: "/admin/turmas" },
  ];

  return (
    <AppShell title="Dashboard">
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <Link key={c.t} to={c.to} className="block">
            <Card className="text-center">
              <c.i size={20} className="mx-auto mb-1 text-primary" />
              <p className="text-3xl font-bold">{c.v}</p>
              <p className="text-xs text-muted-foreground">{c.t}</p>
            </Card>
          </Link>
        ))}
      </div>
      <div className="mt-6 space-y-2">
        <Link to="/admin/disciplinas"><Card className="flex items-center gap-3"><Library size={20} className="text-primary" /><p className="text-sm font-semibold">Gerenciar disciplinas</p></Card></Link>
        <Link to="/admin/comunicados"><Card className="flex items-center gap-3"><Megaphone size={20} className="text-primary" /><p className="text-sm font-semibold">Comunicados institucionais</p></Card></Link>
        <Link to="/admin/relatorios"><Card className="flex items-center gap-3"><ClipboardList size={20} className="text-primary" /><p className="text-sm font-semibold">Relatórios</p></Card></Link>
      </div>
    </AppShell>
  );
}

function fmtDate(s: string | null) {
  if (!s) return "—";
  return new Date(s).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}
