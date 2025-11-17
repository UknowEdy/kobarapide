# 📱 StokTracker - MVP

Application Progressive Web App (PWA) de gestion commerciale mobile-first pour micro-entrepreneurs togolais et africains.

## 🎯 Objectif

Remplacer la gestion "au feeling" par une gestion basée sur la donnée, sans ordinateur ni logiciel coûteux.

## ✨ Fonctionnalités MVP

### Gestion des produits
- ✅ Ajouter/modifier/supprimer des produits
- ✅ Prix d'achat, prix de vente, stock actuel
- ✅ Seuil d'alerte pour stock faible
- ✅ Support code-barres/QR code

### Enregistrement des ventes
- ✅ Interface rapide type caisse
- ✅ Scanner via caméra (code-barres)
- ✅ Recherche par nom de produit
- ✅ Déduction automatique du stock
- ✅ Génération de reçu

### Gestion du stock
- ✅ Vue en temps réel de l'inventaire
- ✅ Alertes produits en rupture
- ✅ Liste de réapprovisionnement automatique

### Rapports financiers
- ✅ Chiffre d'affaires (jour/semaine/mois)
- ✅ Bénéfices nets avec marges
- ✅ Historique des ventes
- ✅ Produits les plus vendus

### Mode hors-ligne (PRIORITAIRE)
- ✅ Toutes les opérations fonctionnent sans connexion
- ✅ Synchronisation automatique dès retour du réseau
- ✅ Stockage local sécurisé (IndexedDB)

## 🛠️ Stack Technique

### Frontend
- **React** 18.2 + **TypeScript**
- **Vite** - Build rapide
- **TailwindCSS** - UI responsive
- **Workbox** - Service Worker pour PWA
- **html5-qrcode** - Scanner de code-barres
- **idb** - IndexedDB pour mode offline
- **React Router** - Navigation
- **Axios** - Requêtes HTTP

### Backend
- **Node.js** + **Express**
- **MongoDB** - Base de données flexible
- **JWT** - Authentification
- **bcryptjs** - Hashage des PINs

## 📦 Installation

### Prérequis
- Node.js 18+ et npm
- MongoDB installé et en cours d'exécution

### 1. Backend

```bash
cd stoktracker/backend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env

# Éditer .env avec vos paramètres
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/stoktracker
# JWT_SECRET=votre_secret_super_securise

# Démarrer le serveur
npm run dev
```

Le backend sera accessible sur `http://localhost:5000`

### 2. Frontend

```bash
cd stoktracker/frontend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env

# Éditer .env si nécessaire
# VITE_API_URL=http://localhost:5000/api

# Démarrer l'application
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 🚀 Utilisation

### Premier lancement

1. **Créer un compte**
   - Ouvrez l'application
   - Cliquez sur "S'inscrire"
   - Remplissez le formulaire (nom, téléphone, PIN, nom du commerce)
   - Créez votre compte

2. **Ajouter vos produits**
   - Allez dans "Produits"
   - Cliquez sur le bouton "+"
   - Renseignez les informations (nom, prix achat/vente, stock, etc.)
   - Sauvegardez

3. **Enregistrer une vente**
   - Allez dans "Vendre"
   - Recherchez ou scannez les produits
   - Ajustez les quantités
   - Validez la vente

4. **Consulter les rapports**
   - Allez dans "Rapports"
   - Sélectionnez la période (jour/semaine/mois)
   - Consultez vos statistiques

### Mode hors-ligne

L'application fonctionne **entièrement hors ligne** :
- Toutes les données sont stockées localement dans IndexedDB
- Les opérations en mode hors-ligne sont mises en queue
- La synchronisation se fait automatiquement au retour du réseau
- Un indicateur visuel montre l'état de connexion

### Scanner de code-barres

1. Dans la page "Vendre", cliquez sur l'icône caméra
2. Autorisez l'accès à la caméra
3. Pointez vers le code-barres du produit
4. Le produit est ajouté automatiquement au panier

## 📱 Installation comme PWA

### Sur Android (Chrome/Edge)
1. Ouvrez l'application dans le navigateur
2. Menu (⋮) → "Ajouter à l'écran d'accueil"
3. Confirmez l'installation

### Sur iOS (Safari)
1. Ouvrez l'application dans Safari
2. Icône Partage → "Sur l'écran d'accueil"
3. Confirmez l'ajout

## 🔧 Développement

### Backend

```bash
# Mode développement avec hot-reload
npm run dev

# Production
npm start
```

### Frontend

```bash
# Mode développement
npm run dev

# Build pour production
npm run build

# Prévisualiser le build
npm run preview
```

## 📊 Structure du projet

```
stoktracker/
├── backend/
│   ├── config/           # Configuration DB
│   ├── middleware/       # Auth, validation
│   ├── models/          # Schémas MongoDB
│   ├── routes/          # Routes API
│   └── server.js        # Point d'entrée
│
├── frontend/
│   ├── public/          # Assets statiques
│   ├── src/
│   │   ├── components/  # Composants réutilisables
│   │   ├── config/      # Configuration
│   │   ├── context/     # Contexts React
│   │   ├── pages/       # Pages de l'app
│   │   ├── services/    # API, DB, Sync
│   │   ├── types/       # Types TypeScript
│   │   ├── App.tsx      # Composant racine
│   │   └── main.tsx     # Point d'entrée
│   └── package.json
│
└── README.md
```

## 🎨 Principes UX

- **Mobile-first** : Interface optimisée pour mobile
- **Gros boutons** : Taille minimale de 44x44px
- **Actions rapides** : Maximum 2 clics
- **Feedback visuel** : Indicateurs de chargement et confirmations
- **Contraste élevé** : Lisibilité en plein soleil
- **Mode sombre** : Optionnel (économie batterie)

## 🔐 Sécurité

- Authentification par PIN (4-6 chiffres)
- Tokens JWT pour les sessions
- PINs hashés avec bcrypt
- Données chiffrées localement
- Pas de données sensibles en clair

## 🐛 Dépannage

### Le backend ne démarre pas
- Vérifiez que MongoDB est en cours d'exécution
- Vérifiez le fichier `.env`
- Consultez les logs d'erreur

### L'application ne se synchronise pas
- Vérifiez votre connexion Internet
- Consultez l'indicateur de sync dans l'en-tête
- Essayez une synchronisation manuelle (Settings → Synchroniser)

### Le scanner ne fonctionne pas
- Vérifiez les permissions de la caméra
- Utilisez HTTPS (requis pour accès caméra)
- Essayez dans un autre navigateur

## 📝 Roadmap (Phase 2)

- [ ] Scanner optimisé avec détection améliorée
- [ ] Graphiques avancés (courbes de ventes)
- [ ] Multi-utilisateurs (employés)
- [ ] Export Excel/PDF
- [ ] Notifications push (alertes stock)
- [ ] Gestion des clients et crédit
- [ ] Historique détaillé par produit
- [ ] Mode sombre complet

## 📄 Licence

MIT License - Libre d'utilisation

## 👥 Support

Pour tout problème ou suggestion :
- Ouvrez une issue sur GitHub
- Contactez le support

## 🙏 Remerciements

Application développée pour aider les micro-entrepreneurs africains à digitaliser leur activité.

---

**StokTracker** - Gérez votre commerce simplement, même sans Internet ! 🚀
