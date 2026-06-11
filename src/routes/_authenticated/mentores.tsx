import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Search, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/mentores")({
  head: () => ({ meta: [{ title: "Procurar mentores" }] }),
  component: MentoresLayout,
});

function MentoresLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path !== "/mentores") return <Outlet />;
  return <MentoresList />;
}

function MentoresList() {
  const [q, setQ] = useState("");
  const [mentors, setMentors] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "mentor");
      const ids = (roles ?? []).map((r: any) => r.user_id);
      if (ids.length === 0) return setMentors([]);
      const { data } = await supabase.from("profiles").select("*").in("id", ids);
      setMentors(data ?? []);
    })();
  }, []);

  const filtered = mentors.filter((m) => !q || (m.full_name?.toLowerCase().includes(q.toLowerCase()) || m.area?.toLowerCase().includes(q.toLowerCase())));

  return (
    <AppShell title="Procurar mentores">
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome ou área..." className="h-12 w-full rounded-xl border border-border bg-card pl-11 pr-4 text-sm outline-none" />
      </div>
      {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Nenhum mentor encontrado.</p>}
      <div className="space-y-3">
        {filtered.map((m) => (
          <Link key={m.id} to="/mentores/$id" params={{ id: m.id }} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 hover:bg-secondary/40">
            <div className="grid h-12 w-12 place-items-center rounded-full text-primary-foreground" style={{ background: "var(--gradient-primary)" }}><Users size={20} /></div>
            <div className="flex-1">
              <p className="font-semibold">{m.full_name || "Mentor"}</p>
              <p className="text-xs text-muted-foreground">{m.area || "Mentoria"}</p>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}