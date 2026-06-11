
-- Avatars: authenticated read all, owner writes their folder
CREATE POLICY "Avatars read auth" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'avatars');
CREATE POLICY "Avatars upload own" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Avatars update own" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Materials: authenticated read, uploader (mentor) writes
CREATE POLICY "Materials read auth" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'materials');
CREATE POLICY "Materials upload auth" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'materials' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Submissions: only owner and (later) mentor can read; owner writes
CREATE POLICY "Submissions read own" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'submissions' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Submissions upload own" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'submissions' AND auth.uid()::text = (storage.foldername(name))[1]);
