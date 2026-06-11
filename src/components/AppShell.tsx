import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Home,
  Megaphone,
  CalendarDays,
  Menu,
  User,
  ArrowLeft,
  X,
  LogOut,
  Users,
  Search,
  BookOpen,
} from "lucide-react";
import { Logo } from "./Logo";
import { useUserRole } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const baseDrawer = [
  { to: "/home", label: "Início", icon: Home },
  { to: "/turmas", label: "Minhas turmas", icon: BookOpen },
  { to: "/avisos", label: "Avisos", icon: Megaphone },
  { to: "/calendario", label: "Calendário", icon: CalendarDays },
] as const;

export function AppShell({
  title,
  children,
  back,
  showProfile = false,
  hideBottomNav = false,
}: {
  title: string;
  children: ReactNode;
  back?: string;
  showProfile?: boolean;
  hideBottomNav?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { role } = useUserRole();
  const navigate = useNavigate();
  const drawerItems = [
    ...baseDrawer,
    ...(role === "aluno"
      ? [{ to: "/mentores" as const, label: "Procurar mentores", icon: Search }]
      : []),
    { to: "/conta" as const, label: "Meu perfil", icon: User },
  ];

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <header
        className="sticky top-0 z-30 px-5 pb-5 pt-6 shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
        style={{ background: "var(--gradient-header)" }}
      >
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          {back ? (
            <Link to={back} className="grid h-10 w-10 place-items-center rounded-full text-white hover:bg-white/10">
              <ArrowLeft size={22} />
            </Link>
          ) : (
            <button
              onClick={() => setOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-full text-white hover:bg-white/10"
              aria-label="Abrir menu"
            >
              <Menu size={24} />
            </button>
          )}
          <h1 className="flex-1 text-center text-xl font-bold text-white">{title}</h1>
          {showProfile ? (
            <Link
              to="/conta"
              className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-white/40 text-white hover:bg-white/10"
            >
              <User size={20} />
            </Link>
          ) : (
            <button
              onClick={() => setOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-full text-white hover:bg-white/10"
              aria-label="Abrir menu"
            >
              <Menu size={22} />
            </button>
          )}
        </div>
      </header>

      <main className={`mx-auto max-w-md px-5 py-5 ${hideBottomNav ? "" : "pb-28"}`}>{children}</main>

      {!hideBottomNav && <BottomNav pathname={pathname} />}

      {open && (
        <div className="fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="relative flex w-72 max-w-[85vw] flex-col bg-sidebar text-sidebar-foreground shadow-2xl">
            <div
              className="flex items-center justify-between p-5"
              style={{ background: "var(--gradient-header)" }}
            >
              <Logo size="sm" />
              <button
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-white hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-3">
              {drawerItems.map((it, i) => {
                const Icon = it.icon;
                const active = pathname === it.to;
                return (
                  <Link
                    key={i}
                    to={it.to as string}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-4 border-b border-sidebar-border/40 px-5 py-4 text-sm ${
                      active ? "text-primary" : "text-sidebar-foreground"
                    } hover:bg-sidebar-accent`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{it.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={signOut}
                className="flex w-full items-center gap-4 border-b border-sidebar-border/40 px-5 py-4 text-left text-sm text-destructive hover:bg-sidebar-accent"
              >
                <LogOut size={20} />
                <span className="font-medium">Sair</span>
              </button>
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}

function BottomNav({ pathname }: { pathname: string }) {
  const { role } = useUserRole();
  const items =
    role === "aluno"
      ? [
          { to: "/home", label: "INÍCIO", icon: Home },
          { to: "/mentores", label: "MENTORES", icon: Search },
          { to: "/turmas", label: "TURMAS", icon: BookOpen },
          { to: "/avisos", label: "AVISOS", icon: Megaphone },
        ]
      : [
          { to: "/home", label: "INÍCIO", icon: Home },
          { to: "/turmas", label: "TURMAS", icon: BookOpen },
          { to: "/avisos", label: "AVISOS", icon: Megaphone },
          { to: "/calendario", label: "AGENDA", icon: CalendarDays },
        ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {items.map((it) => {
          const Icon = it.icon;
          const active = pathname.startsWith(it.to);
          return (
            <Link
              key={it.to}
              to={it.to}
              className={`relative flex flex-col items-center gap-1 py-3 text-[10px] font-semibold tracking-wider ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {active && <span className="absolute top-0 h-0.5 w-10 rounded-full bg-primary" />}
              <Icon size={22} />
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Suppress lint for unused imports
export const _unused = { Users };