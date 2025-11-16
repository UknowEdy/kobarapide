# 🚀 Guide de Déploiement - KobaRapide

## 📋 Prérequis

- Compte MongoDB Atlas (base de données cloud)
- Compte Render (backend)
- Compte Vercel (frontend)
- Compte Gmail avec App Password (pour les emails - optionnel)

---

## 🔧 Configuration Backend (Render)

### 1. Créer le service sur Render

1. Aller sur [render.com](https://render.com) et se connecter
2. Cliquer sur **"New +"** → **"Web Service"**
3. Connecter votre repository GitHub
4. Sélectionner le repository : `uknowedy/KobaRapide`
5. Configurer le service :
   - **Name** : `kobarapide` (ou un nom de votre choix)
   - **Region** : Choisir la région la plus proche
   - **Branch** : `main`
   - **Root Directory** : `api`
   - **Runtime** : `Node`
   - **Build Command** : `npm install`
   - **Start Command** : `node server.js`
   - **Plan** : Free (ou payant selon vos besoins)

### 2. Variables d'environnement à configurer

Aller dans **Settings** → **Environment** → **Add Environment Variable** et ajouter :

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kobarapide?retryWrites=true&w=majority
JWT_SECRET=VotreSecretJWTTresLongEtSecurise123456789
EMAIL_SERVICE=gmail
EMAIL_USER=votre-email@gmail.com
EMAIL_PASSWORD=votre-app-password-gmail
EMAIL_FROM=noreply@kobarapide.com
FRONTEND_URL=https://kobarapide.vercel.app
ADMIN_EMAIL=admin@kobarapide.com
ADMIN_PASSWORD=VotreMotDePasseSecurise123!
```

**Notes importantes** :
- **MONGODB_URI** : Créer un cluster sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), créer un utilisateur et récupérer la connection string
- **JWT_SECRET** : Générer une longue chaîne aléatoire sécurisée (min. 32 caractères)
- **EMAIL_PASSWORD** : Pour Gmail, créer un "App Password" dans les paramètres de sécurité de votre compte Google
- **ADMIN_EMAIL** et **ADMIN_PASSWORD** : Credentials du premier SUPER_ADMIN (à utiliser lors de l'initialisation)

### 3. Déploiement

1. Cliquer sur **"Create Web Service"**
2. Render va automatiquement déployer l'application (3-5 minutes)
3. Une fois déployé, votre backend sera accessible à : `https://kobarapide.onrender.com`

---

## 🎨 Configuration Frontend (Vercel)

### 1. Importer le projet

1. Aller sur [vercel.com](https://vercel.com) et se connecter
2. Cliquer sur **"New Project"**
3. Importer le repository GitHub : `uknowedy/KobaRapide`
4. Configurer le projet :
   - **Project Name** : `kobarapide`
   - **Framework Preset** : `Vite`
   - **Root Directory** : `frontend`
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`

### 2. Variables d'environnement

Aller dans **Settings** → **Environment Variables** et ajouter :

```
VITE_API_URL=https://kobarapide.onrender.com
```

**Important** : Remplacer par l'URL de votre backend Render si différente.

### 3. Déploiement

1. Cliquer sur **"Deploy"**
2. Vercel va automatiquement builder et déployer le frontend (2-3 minutes)
3. Une fois déployé, votre frontend sera accessible à : `https://kobarapide.vercel.app`

---

## 👤 Premier Déploiement - Création du SUPER_ADMIN

### Méthode choisie : **Option A - Endpoint d'initialisation**

Une fois le backend déployé, créer le premier SUPER_ADMIN via un appel API :

#### Méthode 1 : Utiliser curl (depuis un terminal)

```bash
curl -X POST https://kobarapide.onrender.com/api/auth/init-super-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@kobarapide.com",
    "password": "VotreMotDePasseSecurise123!",
    "nom": "Administrateur",
    "prenom": "Principal",
    "telephone": "0700000000",
    "pieceIdentite": "ADMIN_001",
    "dateDeNaissance": "1990-01-01"
  }'
```

#### Méthode 2 : Utiliser Postman ou un autre client HTTP

- **URL** : `POST https://kobarapide.onrender.com/api/auth/init-super-admin`
- **Headers** : `Content-Type: application/json`
- **Body (JSON)** :
```json
{
  "email": "admin@kobarapide.com",
  "password": "VotreMotDePasseSecurise123!",
  "nom": "Administrateur",
  "prenom": "Principal",
  "telephone": "0700000000",
  "pieceIdentite": "ADMIN_001",
  "dateDeNaissance": "1990-01-01"
}
```

#### Méthode 3 : Laisser l'endpoint utiliser les variables d'environnement

Si vous ne fournissez pas de body, l'endpoint utilisera automatiquement les valeurs de `ADMIN_EMAIL` et `ADMIN_PASSWORD` définies dans les variables d'environnement Render :

```bash
curl -X POST https://kobarapide.onrender.com/api/auth/init-super-admin \
  -H "Content-Type: application/json" \
  -d '{}'
```

#### Réponse attendue

Si tout se passe bien, vous recevrez :

```json
{
  "msg": "Super Admin créé avec succès",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@kobarapide.com",
    "nom": "Administrateur",
    "prenom": "Principal",
    "role": "SUPER_ADMIN",
    "status": "ACTIF"
  }
}
```

**⚠️ IMPORTANT** :
- Cet endpoint ne fonctionne **QUE SI aucun SUPER_ADMIN n'existe**.
- Une fois un SUPER_ADMIN créé, toute tentative ultérieure retournera une erreur 403.
- Conservez précieusement les identifiants du SUPER_ADMIN !

### Se connecter

1. Aller sur `https://kobarapide.vercel.app`
2. Utiliser les identifiants du SUPER_ADMIN créé ci-dessus
3. Vous serez redirigé vers le Dashboard Admin complet

---

## 👥 Gestion des Utilisateurs

### 1. Créer des Administrateurs et Modérateurs

1. Se connecter en tant que **SUPER_ADMIN**
2. Aller dans **Dashboard** → Section **"Staff"**
3. Cliquer sur **"➕ Ajouter Staff"**
4. Remplir le formulaire :
   - Email
   - Mot de passe (min. 6 caractères)
   - Nom, Prénom
   - Téléphone
   - Pièce d'identité
   - Date de naissance
   - **Rôle** : Choisir **ADMIN** ou **MODERATEUR**
5. Cliquer sur **"✅ Créer le compte staff"**

**Permissions** :
- **SUPER_ADMIN** peut créer : ADMIN et MODERATEUR
- **ADMIN** peut créer : MODERATEUR uniquement

### 2. Inscription des Clients

Les clients peuvent s'inscrire eux-mêmes via :

1. Page d'accueil : `https://kobarapide.vercel.app`
2. Cliquer sur le formulaire **"Inscription"** (à droite)
3. Remplir tous les champs requis :
   - Email
   - Mot de passe (min. 6 caractères)
   - Confirmation du mot de passe
   - Nom, Prénom
   - Téléphone
   - Pièce d'identité
   - Date de naissance
4. Cliquer sur **"S'inscrire"**

**Statut initial** :
- Si des **places disponibles** (capacité) → **ACTIF** (connexion immédiate)
- Si **capacité pleine** → **EN_ATTENTE** (attente validation admin)

Après l'inscription, le client reçoit un **token JWT** et peut se connecter immédiatement (s'il est ACTIF).

### 3. Gérer les Clients (Admin)

1. Se connecter en tant que **ADMIN** ou **SUPER_ADMIN**
2. Aller dans **Dashboard** → Section **"Clients"**
3. Filtrer par statut : **Actifs**, **En Attente**, **Suspendus**, **Bloqués**
4. Actions possibles pour chaque client :
   - **Changer le statut** : Utiliser le dropdown pour passer de EN_ATTENTE → ACTIF, ou ACTIF → SUSPENDU, etc.
   - **Voir le score de confiance** : Affiché dans la colonne "Score"

---

## ⚙️ Configuration de la Capacité

La capacité permet de limiter le nombre d'utilisateurs actifs simultanément.

### Vérifier la capacité actuelle

```bash
curl https://kobarapide.onrender.com/api/capacity
```

Réponse :
```json
{
  "totalCapacity": 100,
  "currentActiveUsers": 25,
  "isCapacityEnabled": true
}
```

### Modifier la capacité (ADMIN uniquement)

```bash
curl -X PUT https://kobarapide.onrender.com/api/capacity \
  -H "Content-Type: application/json" \
  -H "x-auth-token: VOTRE_TOKEN_JWT" \
  -d '{
    "totalCapacity": 200,
    "isCapacityEnabled": true
  }'
```

---

## ✅ Vérifications Post-Déploiement

### Backend

```bash
# 1. Vérifier que l'API répond
curl https://kobarapide.onrender.com

# Réponse attendue :
# {"message":"API Kobarapide en cours d'exécution"}

# 2. Tester la connexion
curl -X POST https://kobarapide.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kobarapide.com","password":"VotreMotDePasse"}'

# 3. Vérifier la capacité
curl https://kobarapide.onrender.com/api/capacity
```

### Frontend

1. Ouvrir `https://kobarapide.vercel.app`
2. Vérifier que la page charge correctement
3. Se connecter avec le SUPER_ADMIN
4. Vérifier que toutes les 7 sections du dashboard s'affichent :
   - 📊 Statistiques
   - 👥 Clients
   - 💰 Prêts
   - 👨‍💼 Staff
   - 🔄 Doublons
   - ⏳ Liste d'attente
   - ⚙️ Paramètres

---

## 🐛 Dépannage

### Le backend ne démarre pas sur Render

**Solutions** :
1. Vérifier les **logs** dans le Render Dashboard
2. Vérifier que **toutes les variables d'environnement** sont définies
3. Vérifier que `MONGODB_URI` est correct et que le cluster MongoDB est accessible
4. Vérifier que le port est bien `10000` (ou la valeur de `process.env.PORT`)

### Le frontend ne charge pas les données

**Solutions** :
1. Vérifier que `VITE_API_URL` pointe vers le bon backend
2. Ouvrir la **console du navigateur** (F12) pour voir les erreurs
3. Vérifier que le backend est bien déployé et accessible
4. Vérifier les **CORS** : le backend doit autoriser le domaine frontend

### Impossible de se connecter

**Solutions** :
1. Vérifier que le SUPER_ADMIN a bien été créé via `/api/auth/init-super-admin`
2. Vérifier les credentials dans les variables d'environnement
3. Vérifier les logs backend pour les erreurs d'authentification
4. Essayer de recréer le SUPER_ADMIN (si aucun n'existe)

### Erreur 404 sur /api/capacity

**Solutions** :
1. Vérifier que le fichier `api/routes/capacity.js` existe
2. Vérifier que la route est enregistrée dans `api/server.js` : `app.use('/api/capacity', capacityRoutes);`
3. Redéployer le backend sur Render

### Les clients ne peuvent pas s'inscrire

**Solutions** :
1. Vérifier les logs backend pour voir l'erreur exacte
2. Vérifier que la capacité est configurée (GET `/api/capacity`)
3. Vérifier que le modèle `CapacityConfig` existe
4. Vérifier les validations (email unique, téléphone unique, pièce d'identité unique)

---

## 🔄 Mises à jour et Redéploiements

### Backend (Render)

Render redéploie **automatiquement** à chaque push sur la branche `main` :

```bash
git add .
git commit -m "Mise à jour backend"
git push origin main
```

Render détectera le changement et redéploiera automatiquement.

### Frontend (Vercel)

Vercel redéploie **automatiquement** à chaque push sur la branche `main` :

```bash
git add .
git commit -m "Mise à jour frontend"
git push origin main
```

Vercel détectera le changement et redéploiera automatiquement.

---

## 📊 Surveillance et Maintenance

### Logs Backend (Render)

1. Aller dans le Render Dashboard
2. Sélectionner votre service `kobarapide`
3. Cliquer sur **"Logs"** pour voir les logs en temps réel
4. Utiliser les filtres pour rechercher des erreurs spécifiques

### Logs Frontend (Vercel)

1. Aller dans le Vercel Dashboard
2. Sélectionner votre projet `kobarapide`
3. Cliquer sur **"Deployments"** pour voir l'historique
4. Cliquer sur **"Functions"** → **"Logs"** pour voir les logs des fonctions serverless (si applicable)

### Monitoring de la base de données (MongoDB Atlas)

1. Aller sur [MongoDB Atlas](https://cloud.mongodb.com)
2. Sélectionner votre cluster
3. Onglet **"Metrics"** : Voir les performances, connexions, utilisation
4. Onglet **"Collections"** : Voir les données stockées

---

## 🔒 Sécurité

### Bonnes pratiques

1. **Ne JAMAIS commiter les fichiers `.env`** avec des vraies credentials
2. **Changer les mots de passe par défaut** après le premier déploiement
3. **Utiliser des mots de passe forts** (min. 12 caractères, mixte majuscules/minuscules/chiffres/symboles)
4. **Activer l'authentification à deux facteurs (2FA)** sur MongoDB Atlas, Render et Vercel
5. **Limiter les accès** : Ne donner les droits ADMIN qu'aux personnes de confiance
6. **Surveiller les logs** régulièrement pour détecter des activités suspectes
7. **Faire des sauvegardes régulières** de la base de données MongoDB
8. **Utiliser HTTPS** uniquement (déjà configuré par défaut sur Render et Vercel)

---

## 📞 Support

Pour toute question ou problème :

1. Vérifier d'abord cette documentation
2. Consulter les logs backend et frontend
3. Vérifier les issues GitHub du projet
4. Contacter l'équipe de développement

---

## 🎉 Félicitations !

Votre application KobaRapide est maintenant déployée en production !

**URLs importantes** :
- Frontend : https://kobarapide.vercel.app
- Backend API : https://kobarapide.onrender.com
- MongoDB Atlas : https://cloud.mongodb.com

**Workflow de test complet** :
1. ✅ Créer le SUPER_ADMIN
2. ✅ Se connecter en tant que SUPER_ADMIN
3. ✅ Créer 2-3 ADMIN et MODERATEUR via la section Staff
4. ✅ Se déconnecter et se reconnecter en tant qu'ADMIN
5. ✅ Inscrire 5-10 clients via le formulaire public
6. ✅ Admin active les clients (change statut EN_ATTENTE → ACTIF)
7. ✅ Clients se connectent et accèdent à leur dashboard
8. ✅ Clients demandent des prêts
9. ✅ Admin approuve/rejette les prêts

Bon déploiement ! 🚀
