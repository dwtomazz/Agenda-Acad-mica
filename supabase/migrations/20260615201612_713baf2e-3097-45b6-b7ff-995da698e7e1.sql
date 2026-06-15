
-- Drop modelo antigo
DROP TABLE IF EXISTS public.submissions CASCADE;
DROP TABLE IF EXISTS public.assignments CASCADE;
DROP TABLE IF EXISTS public.materials CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.announcements CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.class_members CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;
DROP FUNCTION IF EXISTS public.is_class_member(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_class_mentor(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.assignment_class(uuid) CASCADE;

-- Drop policies do user_roles que dependem do enum antigo
DROP POLICY IF EXISTS "user_roles_admin_all" ON public.user_roles;

-- Drop função has_role para liberar o tipo
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role) CASCADE;

-- Reseta enum
DELETE FROM public.user_roles;
ALTER TYPE public.app_role RENAME TO app_role_old;
CREATE TYPE public.app_role AS ENUM ('aluno','professor','administrador');
ALTER TABLE public.user_roles
  ALTER COLUMN role TYPE public.app_role USING role::text::public.app_role;
DROP TYPE public.app_role_old;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ativo boolean NOT NULL DEFAULT true;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _role public.app_role;
BEGIN
  _role := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role',''), 'aluno')::public.app_role;
  IF _role NOT IN ('aluno','professor') THEN _role := 'aluno'; END IF;
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- DISCIPLINAS
CREATE TABLE public.disciplinas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  codigo text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.disciplinas TO authenticated;
GRANT ALL ON public.disciplinas TO service_role;
ALTER TABLE public.disciplinas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "disciplinas_read_all" ON public.disciplinas FOR SELECT TO authenticated USING (true);
CREATE POLICY "disciplinas_admin_write" ON public.disciplinas FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'administrador'))
  WITH CHECK (public.has_role(auth.uid(),'administrador'));
CREATE TRIGGER trg_disciplinas_updated BEFORE UPDATE ON public.disciplinas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- TURMAS + TURMA_ALUNOS
CREATE TABLE public.turmas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  ano int NOT NULL DEFAULT EXTRACT(YEAR FROM now())::int,
  disciplina_id uuid REFERENCES public.disciplinas(id) ON DELETE SET NULL,
  professor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.turmas TO authenticated;
GRANT ALL ON public.turmas TO service_role;
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.turma_alunos (
  turma_id uuid NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  aluno_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (turma_id, aluno_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.turma_alunos TO authenticated;
GRANT ALL ON public.turma_alunos TO service_role;
ALTER TABLE public.turma_alunos ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_turma_professor(_turma_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.turmas WHERE id = _turma_id AND professor_id = _user_id)
$$;
CREATE OR REPLACE FUNCTION public.is_turma_aluno(_turma_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.turma_alunos WHERE turma_id = _turma_id AND aluno_id = _user_id)
$$;

CREATE POLICY "turmas_admin_all" ON public.turmas FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'administrador'))
  WITH CHECK (public.has_role(auth.uid(),'administrador'));
CREATE POLICY "turmas_prof_read_own" ON public.turmas FOR SELECT TO authenticated
  USING (professor_id = auth.uid());
CREATE POLICY "turmas_prof_update_own" ON public.turmas FOR UPDATE TO authenticated
  USING (professor_id = auth.uid());
CREATE POLICY "turmas_aluno_read_member" ON public.turmas FOR SELECT TO authenticated
  USING (public.is_turma_aluno(id, auth.uid()));
CREATE TRIGGER trg_turmas_updated BEFORE UPDATE ON public.turmas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "ta_admin" ON public.turma_alunos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'administrador'))
  WITH CHECK (public.has_role(auth.uid(),'administrador'));
CREATE POLICY "ta_prof_read" ON public.turma_alunos FOR SELECT TO authenticated
  USING (public.is_turma_professor(turma_id, auth.uid()));
CREATE POLICY "ta_aluno_read_self" ON public.turma_alunos FOR SELECT TO authenticated
  USING (aluno_id = auth.uid() OR public.is_turma_aluno(turma_id, auth.uid()));

-- ATIVIDADES + concluida
CREATE TABLE public.atividades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id uuid NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  disciplina_id uuid REFERENCES public.disciplinas(id) ON DELETE SET NULL,
  titulo text NOT NULL,
  descricao text,
  prazo timestamptz,
  criada_por uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.atividades TO authenticated;
GRANT ALL ON public.atividades TO service_role;
ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ativ_admin" ON public.atividades FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'administrador'))
  WITH CHECK (public.has_role(auth.uid(),'administrador'));
CREATE POLICY "ativ_prof_manage" ON public.atividades FOR ALL TO authenticated
  USING (public.is_turma_professor(turma_id, auth.uid()))
  WITH CHECK (public.is_turma_professor(turma_id, auth.uid()));
CREATE POLICY "ativ_aluno_read" ON public.atividades FOR SELECT TO authenticated
  USING (public.is_turma_aluno(turma_id, auth.uid()));
CREATE TRIGGER trg_ativ_updated BEFORE UPDATE ON public.atividades
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.atividade_concluida (
  atividade_id uuid NOT NULL REFERENCES public.atividades(id) ON DELETE CASCADE,
  aluno_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  concluida_em timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (atividade_id, aluno_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.atividade_concluida TO authenticated;
GRANT ALL ON public.atividade_concluida TO service_role;
ALTER TABLE public.atividade_concluida ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ac_self" ON public.atividade_concluida FOR ALL TO authenticated
  USING (aluno_id = auth.uid()) WITH CHECK (aluno_id = auth.uid());

-- ENTREGAS
CREATE TABLE public.entregas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  atividade_id uuid NOT NULL REFERENCES public.atividades(id) ON DELETE CASCADE,
  aluno_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  arquivo_url text,
  comentario_aluno text,
  nota numeric(5,2),
  comentario_prof text,
  entregue_em timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (atividade_id, aluno_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.entregas TO authenticated;
GRANT ALL ON public.entregas TO service_role;
ALTER TABLE public.entregas ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.entrega_turma(_atividade_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT turma_id FROM public.atividades WHERE id = _atividade_id
$$;

CREATE POLICY "ent_admin" ON public.entregas FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'administrador'))
  WITH CHECK (public.has_role(auth.uid(),'administrador'));
CREATE POLICY "ent_aluno_self" ON public.entregas FOR ALL TO authenticated
  USING (aluno_id = auth.uid()) WITH CHECK (aluno_id = auth.uid());
CREATE POLICY "ent_prof_read" ON public.entregas FOR SELECT TO authenticated
  USING (public.is_turma_professor(public.entrega_turma(atividade_id), auth.uid()));
CREATE POLICY "ent_prof_grade" ON public.entregas FOR UPDATE TO authenticated
  USING (public.is_turma_professor(public.entrega_turma(atividade_id), auth.uid()));
CREATE TRIGGER trg_ent_updated BEFORE UPDATE ON public.entregas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- AVISOS
CREATE TABLE public.avisos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  conteudo text NOT NULL,
  turma_id uuid REFERENCES public.turmas(id) ON DELETE CASCADE,
  escopo text NOT NULL DEFAULT 'turma' CHECK (escopo IN ('turma','geral')),
  criado_por uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.avisos TO authenticated;
GRANT ALL ON public.avisos TO service_role;
ALTER TABLE public.avisos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "av_admin" ON public.avisos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'administrador'))
  WITH CHECK (public.has_role(auth.uid(),'administrador'));
CREATE POLICY "av_prof_manage" ON public.avisos FOR ALL TO authenticated
  USING (escopo='turma' AND turma_id IS NOT NULL AND public.is_turma_professor(turma_id, auth.uid()))
  WITH CHECK (escopo='turma' AND turma_id IS NOT NULL AND public.is_turma_professor(turma_id, auth.uid()));
CREATE POLICY "av_read_geral" ON public.avisos FOR SELECT TO authenticated USING (escopo='geral');
CREATE POLICY "av_read_turma" ON public.avisos FOR SELECT TO authenticated
  USING (escopo='turma' AND turma_id IS NOT NULL AND (
    public.is_turma_aluno(turma_id, auth.uid()) OR public.is_turma_professor(turma_id, auth.uid())
  ));
CREATE TRIGGER trg_av_updated BEFORE UPDATE ON public.avisos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- EVENTOS
CREATE TABLE public.eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text,
  data timestamptz NOT NULL,
  tipo text NOT NULL DEFAULT 'evento' CHECK (tipo IN ('prova','trabalho','seminario','evento')),
  turma_id uuid REFERENCES public.turmas(id) ON DELETE CASCADE,
  criado_por uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.eventos TO authenticated;
GRANT ALL ON public.eventos TO service_role;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ev_admin" ON public.eventos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'administrador'))
  WITH CHECK (public.has_role(auth.uid(),'administrador'));
CREATE POLICY "ev_prof_manage" ON public.eventos FOR ALL TO authenticated
  USING (turma_id IS NOT NULL AND public.is_turma_professor(turma_id, auth.uid()))
  WITH CHECK (turma_id IS NOT NULL AND public.is_turma_professor(turma_id, auth.uid()));
CREATE POLICY "ev_read_aluno" ON public.eventos FOR SELECT TO authenticated
  USING (turma_id IS NOT NULL AND public.is_turma_aluno(turma_id, auth.uid()));
CREATE POLICY "ev_read_global" ON public.eventos FOR SELECT TO authenticated
  USING (turma_id IS NULL);
CREATE TRIGGER trg_ev_updated BEFORE UPDATE ON public.eventos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- NOTAS
CREATE TABLE public.notas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  turma_id uuid NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  descricao text NOT NULL,
  valor numeric(5,2) NOT NULL,
  peso numeric(5,2) NOT NULL DEFAULT 1,
  lancada_por uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notas TO authenticated;
GRANT ALL ON public.notas TO service_role;
ALTER TABLE public.notas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nt_admin" ON public.notas FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'administrador'))
  WITH CHECK (public.has_role(auth.uid(),'administrador'));
CREATE POLICY "nt_prof_manage" ON public.notas FOR ALL TO authenticated
  USING (public.is_turma_professor(turma_id, auth.uid()))
  WITH CHECK (public.is_turma_professor(turma_id, auth.uid()));
CREATE POLICY "nt_aluno_read_self" ON public.notas FOR SELECT TO authenticated
  USING (aluno_id = auth.uid());
CREATE TRIGGER trg_nt_updated BEFORE UPDATE ON public.notas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- FREQUENCIAS
CREATE TABLE public.frequencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  turma_id uuid NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  data date NOT NULL,
  presente boolean NOT NULL DEFAULT true,
  lancada_por uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (aluno_id, turma_id, data)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.frequencias TO authenticated;
GRANT ALL ON public.frequencias TO service_role;
ALTER TABLE public.frequencias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fr_admin" ON public.frequencias FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'administrador'))
  WITH CHECK (public.has_role(auth.uid(),'administrador'));
CREATE POLICY "fr_prof_manage" ON public.frequencias FOR ALL TO authenticated
  USING (public.is_turma_professor(turma_id, auth.uid()))
  WITH CHECK (public.is_turma_professor(turma_id, auth.uid()));
CREATE POLICY "fr_aluno_read_self" ON public.frequencias FOR SELECT TO authenticated
  USING (aluno_id = auth.uid());

-- profiles + user_roles policies para admin
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'administrador'))
  WITH CHECK (public.has_role(auth.uid(),'administrador'));

CREATE POLICY "user_roles_admin_all" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'administrador'))
  WITH CHECK (public.has_role(auth.uid(),'administrador'));

-- promote_to_admin via código
CREATE OR REPLACE FUNCTION public.promote_to_admin(_code text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _code IS NULL OR _code <> 'AGENDA-ADMIN-2026' THEN
    RAISE EXCEPTION 'Código de administrador inválido';
  END IF;
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Não autenticado'; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'administrador')
    ON CONFLICT (user_id, role) DO NOTHING;
  DELETE FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('aluno','professor');
  RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.promote_to_admin(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.promote_to_admin(text) TO authenticated;
