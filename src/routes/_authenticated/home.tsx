import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useAuth";
import { BookOpen, Megaphone, Plus, Users, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({ meta: [{ title: "Início — Mentora" }] }),
  component: Home,
});

function Home() {
  const { role, loading } = useUserRole();
  const [classes, setClasses] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("classes").select("*").order("created_at", { ascending: false }).limit(4).then(({ data }) => setClasses(data ?? []));
    supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(3).then(({ data }) => setAnnouncements(data ?? []));
  }, []);

  if (loading) return null;

  return (
    <AppShell title={role === "mentor" ? "Painel do Mentor" : "Painel do Aluno"} showProfile>
      <section className="mb-5 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold"><BookOpen size={18} className="text-primary" /> {role === "mentor" ? "Suas turmas" : "Minhas turmas"}</h2>
          {role === "mentor" && (
            <Link to="/turmas/nova" className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <Plus size={14} /> Nova
            </Link>
          )}
        </div>
        <div className="mt-3 space-y-2">
          {classes.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">Nenhuma turma ainda.</p>}
          {classes.map((c) => (
            <Link key={c.id} to="/turmas/$id" params={{ id: c.id }} className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-3 hover:bg-secondary/60">
              <div>
                <p className="font-semibold">{c.title}</p>
                <p className="text-xs text-muted-foreground">{c.area ?? "—"}</p>
              </div>
              <Users size={18} className="text-muted-foreground" />
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-5 rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold"><Megaphone size={18} className="text-primary" /> Últimos avisos</h2>
        {announcements.length === 0 && <p className="py-2 text-sm text-muted-foreground">Sem avisos ainda.</p>}
        <div className="divide-y divide-border">
          {announcements.map((a) => (
            <div key={a.id} className="py-3">
              <p className="text-sm font-semibold">{a.title}</p>
              <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString("pt-BR")}</p>
            </div>
          ))}
        </div>
      </section>

      {role === "aluno" && (
        <Link to="/mentores" className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
          <Search size={18} /> Procurar mentores
        </Link>
      )}
    </AppShell>
  );
}