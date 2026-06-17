import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card, SectionTitle, Empty, Badge } from "@/components/ui-bits";
import { useDemoList, useDemoUser, useMinhasTurmas } from "@/hooks/useDemoData";
import { KEYS, type Atividade, type Aviso, type Evento, type Usuario, type Turma } from "@/lib/demoStore";
import { ClipboardList, CalendarDays, Megaphone, Users, BookOpen, Library, Inbox, Award } from "lucide-react";

export const Route = createFileRoute("/_authenticated/home")({ component: HomePage });

function HomePage() {
  const me = useDemoUser();
  if (!me) return <AppShell title="Início"><p>Carregando…</p></AppShell>;
  if (me.perfil === "professor") return <HomeProfessor />;
  if (me.perfil === "administrador") return <HomeAdmin />;
  return <HomeAluno />;
}

function fmt(s: string) {
  return new Date(s).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function HomeAluno() {
  const me = useDemoUser()!;
  const turmas = useMinhasTurmas();
  const atividades = useDemoList<Atividade>(KEYS.atividades);
  const eventos = useDemoList<Evento>(KEYS.eventos);
  const avisos = useDemoList<Aviso>(KEYS.avisos);

  if (turmas.length === 0) {
    return (
      <AppShell title="Início">
        <Empty>Você ainda não foi vinculado a uma turma. Entre em contato com a administração.</Empty>
      </AppShell>
    );
  }

  const turmaIds = new Set(turmas.map((t) => t.id));
  const now = Date.now();
  const prox = atividades
    .filter((a) => turmaIds.has(a.turma_id) && new Date(a.prazo).getTime() >= now)
    .sort((a, b) => a.prazo.localeCompare(b.prazo))
    .slice(0, 5);
  const provas = eventos
    .filter((e) => (e.turma_id ? turmaIds.has(e.turma_id) : true) && new Date(e.data).getTime() >= now)
    .filter((e) => e.tipo === "prova" || e.tipo === "trabalho")
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(0, 3);
  const recentes = avisos
    .filter((a) => a.escopo === "geral" || (a.turma_id && turmaIds.has(a.turma_id)))
    .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))
    .slice(0, 3);

  return (
    <AppShell title="Início">
      <div className="space-y-6">
        <Card className="text-sm">
          Olá, <b>{me.nome}</b>! Você está em {turmas.length} turma{turmas.length > 1 ? "s" : ""}: {turmas.map((t) => t.nome).join(", ")}.
        </Card>

        <section>
          <SectionTitle action={<Link to="/atividades" className="text-xs text-primary hover:underline">ver tudo</Link>}>Próximas atividades</SectionTitle>
          {prox.length ? prox.map((a) => (
            <Link key={a.id} to="/atividades" className="block">
              <Card className="mb-2 flex items-center gap-3">
                <ClipboardList size={20} className="text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{a.titulo}</p>
                  <p className="text-xs text-muted-foreground">prazo {fmt(a.prazo)}</p>
                </div>
              </Card>
            </Link>
          )) : <Empty>Nada pendente.</Empty>}
        </section>

        <section>
          <SectionTitle action={<Link to="/calendario" className="text-xs text-primary hover:underline">calendário</Link>}>Próximas provas e trabalhos</SectionTitle>
          {provas.length ? provas.map((e) => (
            <Card key={e.id} className="mb-2 flex items-center gap-3">
              <CalendarDays size={20} className="text-primary" />
              <div className="flex-1">
                <p className="text-sm font-semibold">{e.titulo}</p>
                <p className="text-xs text-muted-foreground capitalize">{e.tipo} · {fmt(e.data)}</p>
              </div>
            </Card>
          )) : <Empty>Nada agendado.</Empty>}
        </section>

        <section>
          <SectionTitle action={<Link to="/avisos" className="text-xs text-primary hover:underline">ver tudo</Link>}>Últimos avisos</SectionTitle>
          {recentes.length ? recentes.map((av) => (
            <Link key={av.id} to="/avisos" className="block">
              <Card className="mb-2 flex items-center gap-3">
                <Megaphone size={20} className="text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{av.titulo}</p>
                  <p className="text-xs text-muted-foreground">{av.escopo === "geral" ? "Institucional" : "Turma"} · {fmt(av.created_at!)}</p>
                </div>
              </Card>
            </Link>
          )) : <Empty>Sem comunicados recentes.</Empty>}
        </section>
      </div>
    </AppShell>
  );
}

function HomeProfessor() {
  const me = useDemoUser()!;
  const turmas = useMinhasTurmas();
  const atividades = useDemoList<Atividade>(KEYS.atividades);
  const avisos = useDemoList<Aviso>(KEYS.avisos);

  const minhas = atividades.filter((a) => turmas.some((t) => t.id === a.turma_id));
  const ativasCount = minhas.filter((a) => new Date(a.prazo).getTime() >= Date.now()).length;
  const meusAvisos = avisos.filter((a) => a.autor_id === me.id).slice(0, 3);

  if (turmas.length === 0) {
    return (
      <AppShell title="Início">
        <Empty>Você ainda não foi vinculado a uma turma. Entre em contato com a administração.</Empty>
      </AppShell>
    );
  }

  return (
    <AppShell title="Início">
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center"><p className="text-2xl font-bold text-primary">{turmas.length}</p><p className="text-xs text-muted-foreground">Turmas</p></Card>
          <Card className="text-center"><p className="text-2xl font-bold text-primary">{ativasCount}</p><p className="text-xs text-muted-foreground">Ativas</p></Card>
          <Card className="text-center"><p className="text-2xl font-bold text-primary">{minhas.length}</p><p className="text-xs text-muted-foreground">Atividades</p></Card>
        </div>

        <section>
          <SectionTitle action={<Link to="/turmas" className="text-xs text-primary hover:underline">ver tudo</Link>}>Minhas turmas</SectionTitle>
          {turmas.slice(0, 4).map((t) => (
            <Link key={t.id} to="/turmas/$id" params={{ id: t.id }} className="block">
              <Card className="mb-2 flex items-center gap-3">
                <BookOpen size={20} className="text-primary" />
                <div className="flex-1"><p className="text-sm font-semibold">{t.nome}</p><p className="text-xs text-muted-foreground">{t.alunos.length} alunos · {t.periodo}</p></div>
              </Card>
            </Link>
          ))}
        </section>

        <section>
          <SectionTitle action={<Link to="/entregas" className="text-xs text-primary hover:underline">ver tudo</Link>}>Entregas</SectionTitle>
          <Link to="/entregas"><Card className="flex items-center gap-3"><Inbox size={20} className="text-primary"/><p className="text-sm font-semibold">Ver entregas dos alunos</p></Card></Link>
        </section>

        <section>
          <SectionTitle>Últimos avisos enviados</SectionTitle>
          {meusAvisos.length ? meusAvisos.map((a) => (
            <Card key={a.id} className="mb-2"><p className="text-sm font-semibold">{a.titulo}</p><p className="text-xs text-muted-foreground">{fmt(a.created_at!)}</p></Card>
          )) : <Empty>Nenhum aviso publicado.</Empty>}
        </section>
      </div>
    </AppShell>
  );
}

function HomeAdmin() {
  const usuarios = useDemoList<Usuario>(KEYS.usuarios);
  const turmas = useDemoList<Turma>(KEYS.turmas);
  const disc = useDemoList<any>(KEYS.disciplinas);
  const ativ = useDemoList<Atividade>(KEYS.atividades);
  const alunos = usuarios.filter((u) => u.perfil === "aluno").length;
  const profs = usuarios.filter((u) => u.perfil === "professor").length;

  const cards = [
    { i: Users, t: "Alunos", v: alunos, to: "/admin/usuarios" },
    { i: Users, t: "Professores", v: profs, to: "/admin/usuarios" },
    { i: BookOpen, t: "Turmas", v: turmas.length, to: "/admin/turmas" },
    { i: Library, t: "Disciplinas", v: disc.length, to: "/admin/disciplinas" },
    { i: ClipboardList, t: "Atividades", v: ativ.length, to: "/admin/relatorios" },
    { i: Award, t: "Usuários ativos", v: usuarios.filter((u) => u.ativo).length, to: "/admin/usuarios" },
  ];

  return (
    <AppShell title="Dashboard">
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <Link key={c.t} to={c.to as any} className="block">
            <Card className="text-center">
              <c.i size={20} className="mx-auto mb-1 text-primary" />
              <p className="text-3xl font-bold">{c.v}</p>
              <p className="text-xs text-muted-foreground">{c.t}</p>
            </Card>
          </Link>
        ))}
      </div>
      <div className="mt-6 space-y-2">
        <Link to="/admin/comunicados"><Card className="flex items-center gap-3"><Megaphone size={20} className="text-primary" /><p className="text-sm font-semibold">Comunicados institucionais</p></Card></Link>
        <Link to="/admin/relatorios"><Card className="flex items-center gap-3"><ClipboardList size={20} className="text-primary" /><p className="text-sm font-semibold">Relatórios</p></Card></Link>
        <Link to="/admin/configuracoes"><Card className="flex items-center gap-3"><Library size={20} className="text-primary" /><p className="text-sm font-semibold">Configurações do sistema</p></Card></Link>
      </div>
    </AppShell>
  );
}