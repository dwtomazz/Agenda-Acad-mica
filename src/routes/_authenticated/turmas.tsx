import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card, Empty } from "@/components/ui-bits";
import { RequireTurma } from "@/components/RequireTurma";
import { useDemoUser, useMinhasTurmas } from "@/hooks/useDemoData";
import { BookOpen } from "lucide-react";

export const Route = createFileRoute("/_authenticated/turmas")({ component: Layout });

function Layout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/turmas") return <Outlet />;
  return <List />;
}

function List() {
  const me = useDemoUser();
  const turmas = useMinhasTurmas();
  if (!me) return null;
  return (
    <AppShell title={me.perfil === "professor" ? "Minhas turmas" : "Turmas"}>
      <RequireTurma>
        {turmas.length ? turmas.map((t) => (
          <Link key={t.id} to="/turmas/$id" params={{ id: t.id }} className="block">
            <Card className="mb-2 flex items-center gap-3">
              <BookOpen size={20} className="text-primary" />
              <div className="flex-1">
                <p className="text-sm font-semibold">{t.nome}</p>
                <p className="text-xs text-muted-foreground">{t.ano} · {t.periodo} · {t.alunos.length} alunos</p>
              </div>
            </Card>
          </Link>
        )) : <Empty>Nenhuma turma.</Empty>}
      </RequireTurma>
    </AppShell>
  );
}