-- =============================================
-- TALENT-DZ : Promouvoir un utilisateur en Recruteur
-- =============================================
-- ÉTAPE 1 : Créez d'abord le compte normalement sur http://localhost:3000
--           avec un vrai email (ex: ahmed.recruiter@gmail.com)
-- ÉTAPE 2 : Collez ce SQL dans Supabase Dashboard > SQL Editor
--           et remplacez 'VOTRE_EMAIL_ICI' par l'email utilisé
-- =============================================

UPDATE public.profiles
SET 
  role = 'recruiter',
  first_name = 'Ahmed',
  last_name = 'Recruteur'
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'VOTRE_EMAIL_ICI'
);

-- Vérifier que ça a marché :
SELECT id, first_name, last_name, role 
FROM public.profiles 
WHERE role = 'recruiter';
