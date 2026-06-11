import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Users, BookOpen, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/mentores/$id")({
  component: MentorProfile,
});

function MentorProfile() {
  const { id } = useParams({ from: "/_authenticated/mentores/$id" });
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("profiles").select("*").eq("id", id).maybeSingle().then(({ data }) => setProfile(data));
    supabase.from("classes").select("*").eq("mentor_id", id).then(({ data }) => setClasses(data ?? []));
  }, [id]);

  async function join(classId: string) {
    if (!user) return;
    const { error } = await supabase.from("class_members").insert({ class_id: classId, user_id: user.id, status: "pendente" });
    if (error) return toast.error(error.message);
    toast.success("Solicitação enviada!");
  }

  if (!profile) return <AppShell title="Mentor" back="/mentores"><p className="text-center text-sm text-muted-foreground">Carregando...</p></AppShell>;

  return (
    <AppShell title={profile.full_name || "Mentor"} back="/mentores" hideBottomNav>
      <div className="mb-5 rounded-2xl border border-border bg-card p-6 text-center">
        <div className="mx-auto mb-3 grid h-20 w-20 place-items-center rounded-full text-primary-foreground" style={{ background: "var(--gradient-primary)" }}><Users size={32} /></div>
        <p className="text-xl font-bold">{profile.full_name}</p>
        {profile.area && <p className="text-sm text-muted-foreground">{profile.area}</p>}
        {profile.bio && <p className="mt-3 text-sm">{profile.bio}</p>}
      </div>
      <h2 className="mb-3 text-lg font-bold">Turmas disponíveis</h2>
      {classes.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Sem turmas no momento.</p>}
      <div className="space-y-2">
        {classes.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <BookOpen className="text-primary" size={20} />
              <div><p className="text-sm font-semibold">{c.title}</p><p className="text-xs text-muted-foreground">{c.area}</p></div>
            </div>
            <button onClick={() => join(c.id)} className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}><Plus size={14} /> Entrar</button>
          </div>
        ))}
      </div>
    </AppShell>
  );
}