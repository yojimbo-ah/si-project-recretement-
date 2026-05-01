# 🚀 Talent-DZ : Plateforme Extranet de Recrutement

Ce projet a été réalisé dans le cadre du module **"Build & Ship" - Architecture Cloud & Vibe Programming**. Il s'agit d'une plateforme de recrutement moderne permettant aux talents algériens de postuler à des offres d'emploi et de suivre leurs candidatures en temps réel.

---

## 🎲 Mapping du Thème : Recrutement
Conformément aux exigences de la "Roulette des Thèmes", notre application **Talent-DZ** s'articule autour de la structure suivante :

*   **Table A (Utilisateurs) : `profiles`**
    *   Représente les candidats. Gérée via Supabase Auth.
*   **Table B (Ressources) : `job_offers`**
    *   Représente les offres d'emploi disponibles (Poste, Entreprise, Salaire, Lieu).
*   **Table C (Interactions) : `applications`**
    *   Table de jointure reliant un Candidat (A) à une Offre (B) avec une date et un statut évolutif (*Applied, In Review, Interview, Offer*).
*   **Storage (Fichiers) : `cv_bucket`**
    *   Stockage des fichiers PDF (Curriculum Vitae) liés à chaque candidature.

---

## 🏗️ Analyse d'Architecture Cloud (Rapport Architecte)

### 1. Pourquoi Vercel + Supabase au lieu d'un serveur classique ? (CAPEX vs OPEX)
L'utilisation de la stack **Vercel + Supabase** est économiquement plus logique pour lancer ce projet grâce au passage d'un modèle **CAPEX** à un modèle **OPEX**. 
*   Dans un modèle classique (**CAPEX**), nous aurions dû investir lourdement au départ dans l'achat de serveurs physiques, de systèmes de refroidissement et de bande passante, sans savoir si le projet allait réussir. 
*   Avec l'architecture Cloud/Serverless (**OPEX**), nous n'avons aucun coût d'entrée. Nous payons uniquement pour ce que nous consommons (Pay-as-you-go). Cela permet de réduire les risques financiers et de concentrer nos ressources sur le développement du produit plutôt que sur la maintenance du matériel.

### 2. Gestion de la scalabilité : Vercel vs Data Center physique
Contrairement à un Data Center physique local où la scalabilité est limitée par le nombre de "racks" disponibles et nécessite une intervention humaine pour ajouter des serveurs, **Vercel** gère la scalabilité de manière **élastique**. 
Grâce à son architecture de **Edge Network**, Vercel déploie notre application sur des centaines de points de présence à travers le monde. Si le trafic sur Talent-DZ explose soudainement, Vercel alloue automatiquement plus de ressources sans que nous ayons à nous soucier de la climatisation ou de la puissance électrique des serveurs. C'est une scalabilité horizontale et transparente.

### 3. Données Structurées vs Non-structurées
Dans notre application, nous gérons deux types de données :
*   **Données Structurées** : Ce sont les informations organisées en lignes et colonnes dans notre base de données PostgreSQL (Supabase). Les profils, les offres d'emploi et les dates de candidatures sont des données structurées car elles suivent un schéma SQL strict.
*   **Données Non-structurées** : Ce sont les fichiers **CV au format PDF**. Contrairement au texte d'une base de données, ces fichiers n'ont pas de format interne prévisible pour le moteur SQL. Ils sont donc stockés sous forme de "Blobs" dans le **Supabase Storage**, une solution optimisée pour les fichiers volumineux.

---

## 🛠️ Stack Technologique
*   **Frontend** : Next.js 15 (App Router)
*   **Styling** : Vanilla CSS (Modern Premium UI)
*   **BaaS (Backend as a Service)** : Supabase
*   **Hosting/Deployment** : Vercel
*   **Realtime** : PostgreSQL CDC (Change Data Capture) pour les notifications et les messages.

---

## 🔑 Identifiants de Test (Pour correction)
*   **Email** : `test@example.com`
*   **Mot de passe** : `password123`
