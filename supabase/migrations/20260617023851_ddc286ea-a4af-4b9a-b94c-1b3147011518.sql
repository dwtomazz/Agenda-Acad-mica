
-- 1) Privilege escalation: drop self-promotion function and add RESTRICTIVE policy on user_roles
DROP FUNCTION IF EXISTS public.promote_to_admin(text);

CREATE POLICY "user_roles_only_admin_write" ON public.user_roles
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'administrador'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'administrador'::public.app_role));

-- 2) Fix mutable search_path on set_updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END
$$;

-- 3) Revoke EXECUTE from anon/PUBLIC on SECURITY DEFINER functions (keep authenticated for policy use)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_turma_professor(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_turma_aluno(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.entrega_turma(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- 4) Avatars: DELETE policy scoped to owner folder
CREATE POLICY "Avatars delete own"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- 5) Submissions: DELETE for own file + admin
CREATE POLICY "Submissions delete own"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'submissions' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Submissions delete admin"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'submissions' AND public.has_role(auth.uid(), 'administrador'::public.app_role));

-- 6) Submissions: professor read via join to entregas/atividades/turmas
CREATE POLICY "Submissions read professor"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'submissions' AND EXISTS (
      SELECT 1
      FROM public.entregas e
      JOIN public.atividades a ON a.id = e.atividade_id
      JOIN public.turmas t ON t.id = a.turma_id
      WHERE t.professor_id = auth.uid()
        AND e.arquivo_url IS NOT NULL
        AND position(storage.objects.name in e.arquivo_url) > 0
    )
  );

CREATE POLICY "Submissions read admin"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'submissions' AND public.has_role(auth.uid(), 'administrador'::public.app_role));

-- 7) Materials: restrict reads. Replace open-read policy with admin/professor-only + uploader own folder
DROP POLICY IF EXISTS "Materials read auth" ON storage.objects;

CREATE POLICY "Materials read own"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'materials' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Materials read staff"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'materials' AND (
      public.has_role(auth.uid(), 'administrador'::public.app_role)
      OR public.has_role(auth.uid(), 'professor'::public.app_role)
    )
  );

CREATE POLICY "Materials delete own"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'materials' AND (auth.uid())::text = (storage.foldername(name))[1]);
