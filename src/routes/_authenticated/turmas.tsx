import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Card, Empty } from "@/components/ui-bits";
import { useAuth, useUserRole } from "@/hooks/useAuth";
import { demoStore, KEYS } from "@/lib/demoStore";
import { BookOpen } from "lucide-react";

export const Route = createFileRoute("/_authenticated/turmas")({ component: TurmasList });

function TurmasList() {
  const { user } = useAuth();
  const { role } = useUserRole();
  const turmas = useQuery({
    queryKey: ["turmas-list", user?.id, role],
    enabled: !!user,
    queryFn: async () => {
      const disc = demoStore.list<any>(KEYS.disciplinas);
      return demoStore.list<any>(KEYS.turmas)
        .map((t) => ({ ...t, disciplina_nome: disc.find((d) => d.id === t.disciplina_id)?.nome ?? null }))
        .sort((a, b) => (b.ano ?? 0) - (a.ano ?? 0));
    },
  });

  return (
    <AppShell title={role === "professor" ? "Minhas turmas" : "Turmas"}>
      {turmas.data?.length ? (
        <div className="space-y-2">
          {turmas.data.map((t: any) => (
            <Link key={t.id} to="/turmas/$id" params={{ id: t.id }} className="block">
              <Card className="flex items-center gap-3">
                <BookOpen size={20} className="text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{t.nome}</p>
                  <p className="text-xs text-muted-foreground">{t.disciplina_nome ?? "Sem disciplina"} · {t.ano} · prof. {t.professor_nome ?? "—"}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : <Empty>Nenhuma turma.</Empty>}
    </AppShell>
  );
}
