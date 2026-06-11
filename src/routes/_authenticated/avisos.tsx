import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Megaphone } from "lucide-react";

export const Route = createFileRoute("/_authenticated/avisos")({
  head: () => ({ meta: [{ title: "Avisos — Mentora" }] }),
  component: Avisos,
});

function Avisos() {
  const [list, setList] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("announcements").select("*, class:classes(title)").order("created_at", { ascending: false }).then(({ data }) => setList(data ?? []));
  }, []);
  return (
    <AppShell title="Avisos">
      {list.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Sem avisos.</p>}
      <div className="space-y-3">
        {list.map((a) => (
          <div key={a.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Megaphone size={14} className="text-primary" />{a.class?.title ?? "Geral"} • {new Date(a.created_at).toLocaleDateString("pt-BR")}</div>
            <p className="mt-1 font-semibold">{a.title}</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{a.body}</p>
          </div>
        ))}
      </div>
    </AppShell>
  );
}