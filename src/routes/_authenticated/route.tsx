import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { readDemoSession } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const s = readDemoSession();
    if (!s) throw redirect({ to: "/auth" });
    return { role: s.role };
  },
  component: () => <Outlet />,
});