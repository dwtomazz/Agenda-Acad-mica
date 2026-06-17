import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Home, Megaphone, CalendarDays, Menu, User, ArrowLeft, X, LogOut,
  BookOpen, ClipboardList, Award, Users, Inbox, Library, BarChart3, Settings, Shield, GraduationCap, Clock,
} from "lucide-react";
import { Logo } from "./Logo";
import { useUserRole, clearDemoSession, type AppRole } from "@/hooks/useAuth";
import { NotificationsBell } from "./NotificationsBell";

type NavItem = { to: string; label: string; icon: any };

function menuFor(role: AppRole | null): NavItem[] {
  if (role === "professor") {
    return [
      { to: "/home", label: "Início", icon: Home },
      { to: "/turmas", label: "Turmas", icon: BookOpen },
      { to: "/atividades", label: "Atividades", icon: ClipboardList },
      { to: "/entregas", label: "Entregas", icon: Inbox },
      { to: "/calendario", label: "Calendário", icon: CalendarDays },
      { to: "/avisos", label: "Avisos", icon: Megaphone },
      { to: "/horarios", label: "Horários", icon: Clock },
      { to: "/perfil", label: "Perfil", icon: User },
    ];
  }
  if (role === "administrador") {
    return [
      { to: "/home", label: "Dashboard", icon: BarChart3 },
      { to: "/admin/usuarios", label: "Usuários", icon: Users },
      { to: "/admin/turmas", label: "Turmas", icon: BookOpen },
      { to: "/admin/disciplinas", label: "Disciplinas", icon: Library },
      { to: "/admin/comunicados", label: "Comunicados", icon: Megaphone },
      { to: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
      { to: "/admin/configuracoes", label: "Configurações", icon: Settings },
      { to: "/perfil", label: "Perfil", icon: User },
    ];
  }
  // aluno
  return [
    { to: "/home", label: "Início", icon: Home },
    { to: "/atividades", label: "Atividades", icon: ClipboardList },
    { to: "/entregas", label: "Entregas", icon: Inbox },
    { to: "/calendario", label: "Calendário", icon: CalendarDays },
    { to: "/avisos", label: "Avisos", icon: Megaphone },
    { to: "/notas", label: "Notas e Frequência", icon: Award },
    { to: "/horarios", label: "Horários", icon: Clock },
    { to: "/perfil", label: "Perfil", icon: User },
  ];
}

function bottomFor(role: AppRole | null): NavItem[] {
  if (role === "professor") {
    return [
      { to: "/home", label: "INÍCIO", icon: Home },
      { to: "/turmas", label: "TURMAS", icon: BookOpen },
      { to: "/atividades", label: "ATIV.", icon: ClipboardList },
      { to: "/avisos", label: "AVISOS", icon: Megaphone },
    ];
  }
  if (role === "administrador") {
    return [
      { to: "/home", label: "INÍCIO", icon: BarChart3 },
      { to: "/admin/usuarios", label: "USUÁRIOS", icon: Users },
      { to: "/admin/turmas", label: "TURMAS", icon: BookOpen },
      { to: "/admin/comunicados", label: "AVISOS", icon: Megaphone },
    ];
  }
  return [
    { to: "/home", label: "INÍCIO", icon: Home },
    { to: "/atividades", label: "ATIV.", icon: ClipboardList },
    { to: "/notas", label: "NOTAS", icon: Award },
    { to: "/avisos", label: "AVISOS", icon: Megaphone },
  ];
}

export function AppShell({
  title, children, back, hideBottomNav = false,
}: { title: string; children: ReactNode; back?: string; hideBottomNav?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { role } = useUserRole();
  const navigate = useNavigate();
  const items = menuFor(role);
  const bottom = bottomFor(role);

  const signOut = async () => {
    clearDemoSession();
    navigate({ to: "/auth", replace: true });
  };

  const roleIcon = role === "administrador" ? <Shield size={14} /> : role === "professor" ? <Users size={14} /> : <GraduationCap size={14} />;

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 px-5 pb-5 pt-6 shadow-[0_4px_20px_rgba(0,0,0,0.4)]" style={{ background: "var(--gradient-header)" }}>
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          {back ? (
            <Link to={back} className="grid h-10 w-10 place-items-center rounded-full text-white hover:bg-white/10">
              <ArrowLeft size={22} />
            </Link>
          ) : (
            <button onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-full text-white hover:bg-white/10" aria-label="Abrir menu">
              <Menu size={24} />
            </button>
          )}
          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold text-white">{title}</h1>
            {role && (
              <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/90">
                {roleIcon} {role}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <NotificationsBell />
            <Link to="/perfil" className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-white/40 text-white hover:bg-white/10">
              <User size={20} />
            </Link>
          </div>
        </div>
      </header>

      <main className={`mx-auto max-w-md px-5 py-5 ${hideBottomNav ? "" : "pb-28"}`}>{children}</main>

      {!hideBottomNav && (
        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 backdrop-blur">
          <div className="mx-auto grid max-w-md grid-cols-4">
            {bottom.map((it) => {
              const Icon = it.icon;
              const active = pathname === it.to || pathname.startsWith(it.to + "/");
              return (
                <Link key={it.to} to={it.to} className={`relative flex flex-col items-center gap-1 py-3 text-[10px] font-semibold tracking-wider ${active ? "text-primary" : "text-muted-foreground"}`}>
                  {active && <span className="absolute top-0 h-0.5 w-10 rounded-full bg-primary" />}
                  <Icon size={22} />
                  {it.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {open && (
        <div className="fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="relative flex w-72 max-w-[85vw] flex-col bg-sidebar text-sidebar-foreground shadow-2xl">
            <div className="flex items-center justify-between p-5" style={{ background: "var(--gradient-header)" }}>
              <Logo size="sm" />
              <button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-full text-white hover:bg-white/10">
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-3">
              {items.map((it, i) => {
                const Icon = it.icon;
                const active = pathname === it.to || pathname.startsWith(it.to + "/");
                return (
                  <Link key={i} to={it.to} onClick={() => setOpen(false)} className={`flex items-center gap-4 border-b border-sidebar-border/40 px-5 py-4 text-sm ${active ? "text-primary" : "text-sidebar-foreground"} hover:bg-sidebar-accent`}>
                    <Icon size={20} />
                    <span className="font-medium">{it.label}</span>
                  </Link>
                );
              })}
              <button onClick={signOut} className="flex w-full items-center gap-4 border-b border-sidebar-border/40 px-5 py-4 text-left text-sm text-destructive hover:bg-sidebar-accent">
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
