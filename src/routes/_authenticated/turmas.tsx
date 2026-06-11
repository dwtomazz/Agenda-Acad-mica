import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useUserRole } from "@/hooks/useAuth";
import { Plus, BookOpen, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/turmas")({
  head: () => ({ meta: [{ title: "Turmas — Mentora" }] }),
  component: TurmasLayout,
});

function TurmasLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/turmas") return <Outlet />;
  return <TurmasList />;
}

function TurmasList() {
  const { user } = useAuth();
  const { role } = useUserRole();
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    if (role === "mentor") {
      supabase.from("classes").select("*").eq("mentor_id", user.id).order("created_at", { ascending: false }).then(({ data }) => setClasses(data ?? []));
    } else {
      supabase
        .from("class_members")
        .select("class:classes(*)")
        .eq("user_id", user.id)
        .eq("status", "aprovado")
        .then(({ data }) => setClasses((data ?? []).map((d: any) => d.class).filter(Boolean)));
    }
  }, [user, role]);

  return (
    <AppShell title="Minhas turmas">
      {classes.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
          <BookOpen className="mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {role === "mentor" ? "Crie sua primeira turma." : "Procure mentores para entrar em uma turma."}
          </p>
        </div>
      )}
      <div className="space-y-3">
        {classes.map((c) => (
          <Link key={c.id} to="/turmas/$id" params={{ id: c.id }} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 hover:bg-secondary/40">
            <div className="grid h-12 w-12 place-items-center rounded-xl text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
              <BookOpen size={20} />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{c.title}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground"><Users size={12} /> {c.area ?? "Mentoria"}</p>
            </div>
          </Link>
        ))}
      </div>
      {role === "mentor" && (
        <Link to="/turmas/nova" className="fixed bottom-24 right-5 grid h-14 w-14 place-items-center rounded-full text-primary-foreground shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
          <Plus size={26} />
        </Link>
      )}
    </AppShell>
  );
}