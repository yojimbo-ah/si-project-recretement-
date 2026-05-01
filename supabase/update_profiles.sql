-- Fichier pour ajouter les nouvelles colonnes à la table profiles

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT[],
ADD COLUMN IF NOT EXISTS cv_name TEXT,
ADD COLUMN IF NOT EXISTS cv_url TEXT;
