# Talent-DZ : Extranet de Recrutement Cloud

## Mission 4 : Architecture Cloud (README "Architecte")

Bienvenue sur le projet **Talent-DZ**, notre extranet de recrutement développé avec une approche 100% Cloud et Serverless en utilisant Next.js, Supabase et Vercel.

### 1. CAPEX vs OPEX : Le modèle économique du Serverless
Dans un projet informatique classique, la mise en place de serveurs physiques nécessite un **CAPEX** (Capital Expenditure - Dépenses d'investissement) important : achat de serveurs, racks, climatisation, licences réseau.
Avec notre architecture Vercel/Supabase, notre **CAPEX est de 0 €**. Nous avons opté pour un modèle **OPEX** (Operational Expenditure - Dépenses opérationnelles) de type "Pay-As-You-Go". Nous ne payons que pour les requêtes réellement effectuées, le temps de calcul utilisé (Serverless Functions sur Vercel) et le stockage consommé (Supabase). Cela permet de démarrer le projet sans budget initial et de maîtriser les coûts tout au long du cycle de vie de l'application.

### 2. Scalabilité automatisée
Contrairement à une infrastructure "On-Premise" (serveur local) où la montée en charge nécessite l'ajout manuel de RAM ou de nouveaux serveurs (processus lent et coûteux), notre architecture Serverless offre une **scalabilité horizontale et verticale transparente**.
*   **Frontend (Vercel)** : Le contenu statique est distribué mondialement via le réseau Edge. Lors de pics d'utilisation (par exemple, si 10 000 candidats postulent le même jour), les fonctions serverless de Next.js s'instancient automatiquement pour absorber la charge.
*   **Backend (Supabase)** : Construit au-dessus de PostgreSQL, il permet une évolution fluide des capacités de traitement et de stockage. Si la charge diminue, les ressources s'ajustent pour ne pas payer pour des capacités inutilisées.

### 3. Gestion des Données : Structurées et Non-structurées
Pour répondre aux besoins d'une plateforme de recrutement, nous gérons deux types de données :
*   **Données Structurées** : Stockées dans la base de données relationnelle **PostgreSQL (Supabase)**. Elles sont facilement requêtables et organisées en tables claires (`profiles` pour les utilisateurs, `job_offers` pour les offres, et `applications` pour lier les candidats aux offres).
*   **Données Non-structurées** : Les fichiers PDF représentant les CV des candidats. Ces données lourdes et non formatables en tables sont stockées dans **Supabase Storage** (un bucket nommé `cv_bucket`). Les URL générées sont ensuite sauvegardées dans la table `applications` pour un référencement facile.

### 4. Sécurité (RLS) - Mission 1
L'intégrité de notre plateforme repose sur les politiques **RLS (Row Level Security)** de Supabase. Chaque candidat s'authentifie via `Supabase Auth`, et les règles PostgreSQL garantissent de manière stricte au niveau de la base qu'**un candidat ne peut voir et gérer que ses propres candidatures et son propre CV**.

---

### Instructions pour lancer le projet

1. Clonez ce dépôt.
2. Installez les dépendances : `npm install`
3. Copiez `.env.example` vers `.env.local` et remplissez vos identifiants Supabase.
4. Démarrez le serveur de développement : `npm run dev`

### Contributeurs
* Binôme 1
* Binôme 2
*(Assurez-vous de faire des commits réguliers avec les comptes GitHub de chaque membre !)*
