-- Projet Talent-DZ - Schéma Supabase

-- 1. Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Création de la table profiles (Table A - Utilisateurs/Candidats)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'candidate',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Trigger pour insérer automatiquement un profile lors de l'inscription via auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 3. Création de la table job_offers (Table B - Offres d'emploi)
CREATE TABLE public.job_offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  description TEXT,
  salary TEXT,
  location TEXT,
  type TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);


-- 4. Création de la table applications (Table C - Candidatures)
CREATE TABLE public.applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES public.job_offers ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, review, interview, offer, rejected
  cv_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, job_id) -- Un candidat ne peut postuler qu'une fois à la même offre
);


-- =========================================================================
-- MISSION 1 : SECURITE CRITIQUE (ROW LEVEL SECURITY - RLS)
-- =========================================================================

-- Activer RLS sur les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Politiques pour 'profiles'
CREATE POLICY "Les utilisateurs voient leur propre profil" 
ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs modifient leur propre profil" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Politiques pour 'job_offers'
-- Tout le monde peut voir les offres d'emploi
CREATE POLICY "Tout le monde peut voir les offres d'emploi" 
ON public.job_offers FOR SELECT USING (true);

-- Politiques pour 'applications'
-- MISSION 1 : Un candidat ne peut voir et gérer QUE ses propres candidatures
CREATE POLICY "Candidats voient leurs propres candidatures" 
ON public.applications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Candidats créent leurs propres candidatures" 
ON public.applications FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Candidats mettent à jour leurs propres candidatures" 
ON public.applications FOR UPDATE USING (auth.uid() = user_id);


-- =========================================================================
-- STORAGE : BUCKET POUR LES CV
-- =========================================================================

-- Créer le bucket (si possible via SQL, sinon à faire manuellement dans le Dashboard Supabase)
INSERT INTO storage.buckets (id, name, public) VALUES ('cv_bucket', 'cv_bucket', false)
ON CONFLICT (id) DO NOTHING;

-- Activer RLS sur le storage
-- (Déjà activé par défaut sur Supabase Storage, on ajoute les politiques)

CREATE POLICY "Utilisateurs uploadent leurs propres CV"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'cv_bucket' 
  AND auth.uid() = owner
);

CREATE POLICY "Utilisateurs voient leurs propres CV"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'cv_bucket' 
  AND auth.uid() = owner
);

CREATE POLICY "Utilisateurs mettent à jour leurs propres CV"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'cv_bucket' 
  AND auth.uid() = owner
);

CREATE POLICY "Utilisateurs suppriment leurs propres CV"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'cv_bucket' 
  AND auth.uid() = owner
);

-- =========================================================================
-- DONNEES DE TEST (Optionnel)
-- =========================================================================
INSERT INTO public.job_offers (title, company, salary, location, type, tags) VALUES 
('Senior Frontend Engineer', 'Sonatrach Digital', '150k – 220k DA', 'Alger', 'Full-time', ARRAY['React', 'TypeScript', 'Remote']),
('UX/UI Designer', 'Orange Algérie', '120k – 180k DA', 'Oran', 'Full-time', ARRAY['Figma', 'On-site']),
('Backend Developer (Node.js)', 'Djezzy Digital Hub', '160k – 240k DA', 'Alger', 'Hybrid', ARRAY['Node.js', 'PostgreSQL']);
