import { useState } from "react";
import { Bell } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useDemoList, useDemoUser } from "@/hooks/useDemoData";
import { demoStore, KEYS, type Notificacao } from "@/lib/demoStore";

export function NotificationsBell() {
  const me = useDemoUser();
  const all = useDemoList<Notificacao>(KEYS.notificacoes);
  const [open, setOpen] = useState(false);
  if (!me) return null;
  const mine = all.filter((n) => n.usuario_id === me.id).sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
  const unread = mine.filter((n) => !n.lida).length;

  function markAll() {
    mine.filter((n) => !n.lida).forEach((n) => demoStore.update(KEYS.notificacoes, n.id, { lida: true }));
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative grid h-10 w-10 place-items-center rounded-full text-white hover:bg-white/10" aria-label="Notificações">
        <Bell size={20}/>
        {unread > 0 && <span className="absolute right-1.5 top-1.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white">{unread}</span>}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-border bg-card p-3 shadow-2xl">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">Notificações</p>
              {unread > 0 && <button onClick={markAll} className="text-xs text-primary hover:underline">marcar todas</button>}
            </div>
            <div className="max-h-80 space-y-1 overflow-auto">
              {mine.length ? mine.slice(0, 20).map((n) => (
                <Link key={n.id} to={(n.link as any) ?? "/home"} onClick={() => { demoStore.update(KEYS.notificacoes, n.id, { lida: true }); setOpen(false); }} className={`block rounded-lg p-2 text-sm hover:bg-secondary ${!n.lida ? "bg-primary/5" : ""}`}>
                  <p className="font-semibold">{n.titulo}</p>
                  <p className="text-xs text-muted-foreground">{n.mensagem}</p>
                </Link>
              )) : <p className="px-2 py-4 text-center text-xs text-muted-foreground">Sem notificações.</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}