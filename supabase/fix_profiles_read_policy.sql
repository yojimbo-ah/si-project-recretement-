-- Allow authenticated users to read profiles for chat and talent browsing.

CREATE POLICY "Les utilisateurs authentifiés voient les profils"
ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
