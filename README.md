# 🚀 Talent-DZ : Plateforme de Recrutement Cloud

## 🎯 Mapping du Thème
Conformément aux consignes du module "Build & Ship", voici le mapping de notre application :
- **Table A (Utilisateurs)** : `profiles` (Candidats inscrits via Supabase Auth).
- **Table B (Ressources)** : `job_offers` (Les offres d'emploi disponibles).
- **Table C (Interactions)** : `applications` (La jointure : un candidat postule à une offre avec un statut).
- **Storage (Fichiers)** : `cv_bucket` (Stockage des CV au format PDF).

---

## 🏗️ Analyse d'Architecture Cloud (Rapport Architecte)

### 1. Pourquoi Vercel + Supabase au lieu d'un serveur classique ? (OPEX vs CAPEX)
L'utilisation de solutions Serverless comme Vercel et Supabase transforme radicalement la structure des coûts du projet :
- **CAPEX (Capital Expenditure)** : Avec un serveur classique, nous aurions dû investir dans du matériel physique (serveur, switch, onduleur) avant même d'écrire la première ligne de code. Ici, le CAPEX est de **0 €**.
- **OPEX (Operational Expenditure)** : Nous passons à un modèle de "Pay-as-you-go". Les coûts sont opérationnels et proportionnels à l'utilisation réelle. Pour un lancement, nous restons dans le "Free Tier", ce qui est financièrement bien plus logique pour une startup ou un prototype.

### 2. Gestion de la scalabilité : Vercel vs Data Center physique
Dans un Data Center physique, la scalabilité est **verticale et manuelle** : il faut acheter de la RAM, installer des baies de serveurs et gérer le refroidissement (climatisation).
Vercel utilise une **scalabilité horizontale automatique** via des "Edge Functions". Le code est déployé au plus proche de l'utilisateur. Si le trafic augmente brutalement, Vercel réplique instantanément les instances sans intervention humaine, ce qui est impossible à gérer seul avec un serveur rack local.

### 3. Données Structurées vs Non-structurées
- **Données Structurées** : Ce sont les informations stockées dans notre base PostgreSQL (Supabase). Elles suivent un schéma strict (ID, textes, dates, relations). Exemple : La liste des offres d'emploi et les détails des profils.
- **Données Non-structurées** : Ce sont les fichiers binaires qui n'ont pas de schéma fixe. Dans notre cas, il s'agit des **fichiers CV (PDF)** stockés dans le bucket de Storage. On ne les stocke pas "dans" la table, mais on stocke seulement un lien (URL) vers le fichier.

---

## 🛠️ Instructions pour la Correction
- **URL de production** : [VOTRE_LIEN_VERCEL_ICI]
- **Identifiants de test** : 
  cancdidate :
  - Email : `candidate@gmail.com`
  - Password : `password123`
  recruiter
  - Email : `recruiter@gmail.com`
  - Password : `password123`
  
