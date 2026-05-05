🚀 Talent-DZ : Plateforme de Recrutement Cloud
🎯 Mapping du Thème (Version Multi-Rôles)
Conformément aux consignes du module "Build & Ship", voici le mapping de notre application incluant la gestion des rôles :

Table A (Utilisateurs) : profiles (Utilisateurs inscrits via Supabase Auth. Un champ role permet de distinguer les Candidats des Recruteurs).

Table B (Ressources) : job_offers (Les offres d'emploi, publiées et gérées exclusivement par les profils de type "Recruteur").

Table C (Interactions) : applications (La table de jointure : un profil "Candidat" postule à une offre avec un statut de suivi).

Storage (Fichiers) : cv_bucket (Espace de stockage sécurisé pour les CV des candidats au format PDF).

🏗️ Analyse d'Architecture Cloud (Rapport Architecte)
1. Pourquoi Vercel + Supabase au lieu d'un serveur classique ? (OPEX vs CAPEX)
L'utilisation de solutions Serverless comme Vercel et Supabase transforme radicalement la structure des coûts du projet :

CAPEX (Capital Expenditure) : Avec un serveur classique, nous aurions dû investir dans du matériel physique (serveur, switch, onduleur) avant même d'écrire la première ligne de code. Ici, le CAPEX est de 0 €.

OPEX (Operational Expenditure) : Nous passons à un modèle de "Pay-as-you-go". Les coûts sont opérationnels et proportionnels à l'utilisation réelle (nombre de candidats et recruteurs actifs). Pour un lancement, nous restons dans le "Free Tier", ce qui est financièrement bien plus logique pour une startup ou un prototype.

2. Gestion de la scalabilité : Vercel vs Data Center physique
Dans un Data Center physique, la scalabilité est verticale et manuelle : il faut acheter de la RAM, installer des baies de serveurs et gérer le refroidissement.
Vercel utilise une scalabilité horizontale automatique via des "Edge Functions". Le code est déployé au plus proche de l'utilisateur. Si le trafic augmente brutalement (par exemple, lors de la publication d'une offre très attendue), Vercel réplique instantanément les instances sans intervention humaine.

3. Données Structurées vs Non-structurées
Données Structurées : Informations stockées dans notre base PostgreSQL (Supabase). Elles suivent un schéma strict (ID, textes, dates, relations entre recruteurs et offres).

Données Non-structurées : Fichiers binaires sans schéma fixe. Il s'agit des fichiers CV (PDF) stockés dans le bucket de Storage. Nous ne les stockons pas "dans" la table, mais nous y enregistrons uniquement un lien (URL) vers le fichier.

🛠️ Instructions pour la Correction
URL de production : [VOTRE_LIEN_VERCEL_ICI]

🔑 Identifiants de test :
1. Profil Candidat (Candidate)

Email : candidate@gmail.com

Mot de passe : password123

Fonctionnalités : Consultation d'offres, upload de CV, dépôt de candidatures.

2. Profil Recruteur (Recruiter)

Email : recruiter@gmail.com

Mot de passe : password123

Fonctionnalités : Publication d'offres, gestion des candidats, changement de statut des candidatures.
