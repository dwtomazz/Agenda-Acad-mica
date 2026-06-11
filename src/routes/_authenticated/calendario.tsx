import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays } from "lucide-react";

export const Route = createFileRoute("/_authenticated/calendario")({
  head: () => ({ meta: [{ title: "Calendário — Mentora" }] }),
  component: Calendario,
});

function Calendario() {
  const [list, setList] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("events").select("*, class:classes(title)").order("starts_at").then(({ data }) => setList(data ?? []));
  }, []);
  return (
    <AppShell title="Calendário">
      {list.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Sem eventos.</p>}
      <div className="space-y-3">
        {list.map((e) => (
          <div key={e.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl text-primary-foreground" style={{ background: "var(--gradient-primary)" }}><CalendarDays size={18} /></div>
            <div className="flex-1">
              <p className="font-semibold capitalize">{e.title}</p>
              <p className="text-xs text-muted-foreground">{e.class?.title} • {e.type} • {new Date(e.starts_at).toLocaleString("pt-BR")}</p>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}