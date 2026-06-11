
-- Enums
CREATE TYPE public.app_role AS ENUM ('aluno', 'mentor');
CREATE TYPE public.material_type AS ENUM ('arquivo', 'link', 'aula_gravada');
CREATE TYPE public.member_status AS ENUM ('pendente', 'aprovado');
CREATE TYPE public.event_type AS ENUM ('aula', 'prova', 'seminario', 'atividade');

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  bio TEXT,
  area TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by all auth users" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

-- Trigger: create profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _role public.app_role;
BEGIN
  _role := COALESCE(NEW.raw_user_meta_data->>'role', 'aluno')::public.app_role;
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role);
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- classes (turmas)
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  area TEXT,
  cover_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.classes TO authenticated;
GRANT ALL ON public.classes TO service_role;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All auth can browse classes" ON public.classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Mentors can create classes" ON public.classes FOR INSERT TO authenticated WITH CHECK (auth.uid() = mentor_id AND public.has_role(auth.uid(), 'mentor'));
CREATE POLICY "Mentor can update own class" ON public.classes FOR UPDATE TO authenticated USING (auth.uid() = mentor_id);
CREATE POLICY "Mentor can delete own class" ON public.classes FOR DELETE TO authenticated USING (auth.uid() = mentor_id);

-- class_members
CREATE TABLE public.class_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  status public.member_status NOT NULL DEFAULT 'aprovado',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(class_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_members TO authenticated;
GRANT ALL ON public.class_members TO service_role;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_class_member(_class_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.class_members WHERE class_id = _class_id AND user_id = _user_id AND status = 'aprovado'
    UNION SELECT 1 FROM public.classes WHERE id = _class_id AND mentor_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.is_class_mentor(_class_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.classes WHERE id = _class_id AND mentor_id = _user_id)
$$;

CREATE POLICY "Members can read membership" ON public.class_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_class_mentor(class_id, auth.uid()));
CREATE POLICY "Users request join" ON public.class_members FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Mentor manages members" ON public.class_members FOR UPDATE TO authenticated
  USING (public.is_class_mentor(class_id, auth.uid()));
CREATE POLICY "Mentor or self removes" ON public.class_members FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_class_mentor(class_id, auth.uid()));

-- messages (chat)
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read messages" ON public.messages FOR SELECT TO authenticated USING (public.is_class_member(class_id, auth.uid()));
CREATE POLICY "Members post messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND public.is_class_member(class_id, auth.uid()));
CREATE POLICY "Author or mentor deletes" ON public.messages FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.is_class_mentor(class_id, auth.uid()));
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- materials
CREATE TABLE public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type public.material_type NOT NULL,
  url TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.materials TO authenticated;
GRANT ALL ON public.materials TO service_role;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read materials" ON public.materials FOR SELECT TO authenticated USING (public.is_class_member(class_id, auth.uid()));
CREATE POLICY "Mentor adds materials" ON public.materials FOR INSERT TO authenticated WITH CHECK (public.is_class_mentor(class_id, auth.uid()));
CREATE POLICY "Mentor edits materials" ON public.materials FOR UPDATE TO authenticated USING (public.is_class_mentor(class_id, auth.uid()));
CREATE POLICY "Mentor deletes materials" ON public.materials FOR DELETE TO authenticated USING (public.is_class_mentor(class_id, auth.uid()));

-- assignments
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignments TO authenticated;
GRANT ALL ON public.assignments TO service_role;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read assignments" ON public.assignments FOR SELECT TO authenticated USING (public.is_class_member(class_id, auth.uid()));
CREATE POLICY "Mentor manages assignments" ON public.assignments FOR ALL TO authenticated USING (public.is_class_mentor(class_id, auth.uid())) WITH CHECK (public.is_class_mentor(class_id, auth.uid()));

-- submissions
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  body TEXT,
  file_url TEXT,
  grade NUMERIC,
  feedback TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(assignment_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.assignment_class(_assignment_id UUID)
RETURNS UUID LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT class_id FROM public.assignments WHERE id = _assignment_id
$$;

CREATE POLICY "Student reads own submission" ON public.submissions FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_class_mentor(public.assignment_class(assignment_id), auth.uid()));
CREATE POLICY "Student submits" ON public.submissions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND public.is_class_member(public.assignment_class(assignment_id), auth.uid()));
CREATE POLICY "Student updates own / mentor grades" ON public.submissions FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.is_class_mentor(public.assignment_class(assignment_id), auth.uid()));

-- announcements
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read announcements (global or class member)" ON public.announcements FOR SELECT TO authenticated USING (class_id IS NULL OR public.is_class_member(class_id, auth.uid()));
CREATE POLICY "Mentor posts announcement" ON public.announcements FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid() AND (class_id IS NULL OR public.is_class_mentor(class_id, auth.uid())) AND public.has_role(auth.uid(), 'mentor'));
CREATE POLICY "Author updates" ON public.announcements FOR UPDATE TO authenticated USING (author_id = auth.uid());
CREATE POLICY "Author deletes" ON public.announcements FOR DELETE TO authenticated USING (author_id = auth.uid());

-- events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes ON DELETE CASCADE,
  title TEXT NOT NULL,
  type public.event_type NOT NULL DEFAULT 'aula',
  starts_at TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read events" ON public.events FOR SELECT TO authenticated USING (public.is_class_member(class_id, auth.uid()));
CREATE POLICY "Mentor manages events" ON public.events FOR ALL TO authenticated USING (public.is_class_mentor(class_id, auth.uid())) WITH CHECK (public.is_class_mentor(class_id, auth.uid()));
