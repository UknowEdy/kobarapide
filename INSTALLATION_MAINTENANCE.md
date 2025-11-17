# 🔧 Installation du Mode Maintenance - Guide Complet

## Étape 1 : Intégrer le Middleware dans le Serveur

Modifiez `/api/server.js` pour ajouter le middleware de maintenance :

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const loanRoutes = require('./routes/loans');
const adminRoutes = require('./routes/admin');
const staffRoutes = require('./routes/staff');
const duplicatesRoutes = require('./routes/duplicates');
const waitingListRoutes = require('./routes/waiting-list');
const capacityRoutes = require('./routes/capacity');

// ⭐ NOUVEAU : Importer le middleware de maintenance
const maintenanceMode = require('./middleware/maintenanceMode');

const app = express();

// Middleware de base
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// ⭐ NOUVEAU : Activer le mode maintenance (AVANT les routes)
// Ce middleware doit être placé AVANT toutes les autres routes
app.use(maintenanceMode);

// Route de santé (pour Render health checks)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.get('/', (req, res) => {
    res.json({ message: "API Kobarapide en cours d'exécution" });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/duplicates', duplicatesRoutes);
app.use('/api/waiting-list', waitingListRoutes);
app.use('/api/capacity', capacityRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
    console.log(`Mode maintenance: ${process.env.MAINTENANCE_MODE === 'true' ? 'ACTIVÉ ⚠️' : 'Désactivé ✅'}`);
});
```

## Étape 2 : Servir la Page de Maintenance

Ajoutez cette route dans `/api/server.js` après la connexion DB :

```javascript
// Servir les fichiers statiques (pour la page de maintenance)
const path = require('path');
app.use(express.static(path.join(__dirname, '..')));

// Route explicite pour la page de maintenance
app.get('/maintenance.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../maintenance.html'));
});
```

## Étape 3 : Configuration sur Render

### Pour ACTIVER la maintenance :

1. Connectez-vous à [Render Dashboard](https://dashboard.render.com)
2. Sélectionnez votre service web **kobarapide**
3. Allez dans **Environment**
4. Cliquez sur **Add Environment Variable**
5. Ajoutez :
   ```
   Key: MAINTENANCE_MODE
   Value: true
   ```
6. Cliquez sur **Save Changes**
7. Render redémarrera automatiquement le service

**Le site affichera maintenant la page de maintenance à tous les visiteurs** 🔧

### Pour DÉSACTIVER la maintenance :

1. Retournez dans **Environment**
2. Trouvez la variable `MAINTENANCE_MODE`
3. Changez la valeur en `false`
4. **OU** supprimez complètement la variable
5. Cliquez sur **Save Changes**

**Le site redeviendra accessible normalement** ✅

## Étape 4 : Tester en Local

### 1. Créer un fichier `.env` local :

```bash
cp .env.maintenance.example .env
```

### 2. Modifier `.env` :

```env
MAINTENANCE_MODE=true
```

### 3. Démarrer le serveur :

```bash
cd api
npm start
```

### 4. Tester :

Ouvrez votre navigateur :
- `http://localhost:3001` → Devrait afficher la page de maintenance
- `http://localhost:3001/api/auth/login` → Devrait retourner JSON avec status 503

### 5. Désactiver :

Changez dans `.env` :
```env
MAINTENANCE_MODE=false
```

Redémarrez le serveur → Le site fonctionne normalement

---

## 📋 Checklist de Déploiement

Avant d'activer la maintenance en production :

- [ ] Les fichiers sont bien créés :
  - [ ] `/maintenance.html`
  - [ ] `/frontend/maintenance.html`
  - [ ] `/api/middleware/maintenanceMode.js`

- [ ] Le middleware est intégré dans `/api/server.js`

- [ ] Les routes statiques sont configurées

- [ ] Testé en local avec `MAINTENANCE_MODE=true`

- [ ] Testé en local avec `MAINTENANCE_MODE=false`

- [ ] Page de maintenance affiche correctement :
  - [ ] Logo et titre
  - [ ] Message de maintenance
  - [ ] Email de contact
  - [ ] Animations

---

## 🎯 Scénarios d'Usage

### Scénario 1 : Mise à jour planifiée

**Avant la mise à jour (10 minutes avant) :**
1. Connectez-vous à Render
2. Activez `MAINTENANCE_MODE=true`
3. Attendez le redémarrage (30-60 secondes)
4. Vérifiez que la page s'affiche sur votre domaine

**Pendant la mise à jour :**
- Les utilisateurs voient la page de maintenance
- Effectuez vos modifications sur la branche
- Mergez vers main
- Render déploie automatiquement

**Après la mise à jour :**
1. Vérifiez que tout fonctionne
2. Désactivez `MAINTENANCE_MODE=false`
3. Site de nouveau accessible

### Scénario 2 : Problème urgent

**Action immédiate :**
```bash
# Activez rapidement via Render dashboard
MAINTENANCE_MODE=true
```

**Communication :**
- Envoyez un email aux utilisateurs (optionnel)
- La page de maintenance s'affiche automatiquement

**Résolution :**
1. Corrigez le problème
2. Testez en local ou sur branche de dev
3. Déployez
4. Désactivez la maintenance

### Scénario 3 : Maintenance de la base de données

**Avant :**
```bash
# Sur Render
MAINTENANCE_MODE=true
```

**Pendant :**
- Effectuez les opérations sur MongoDB Atlas
- Sauvegardez les données
- Effectuez les migrations

**Après :**
```bash
# Testez la connexion DB
# Si OK, désactivez
MAINTENANCE_MODE=false
```

---

## ⚠️ Points Importants

### 1. Health Checks
Le middleware autorise `/health` pour que Render puisse vérifier que le service fonctionne.

### 2. Routes API
Les requêtes API retournent du JSON (status 503) au lieu de HTML.

### 3. Auto-Refresh
La page se rafraîchit toutes les 5 minutes pour détecter quand le site est de retour.

### 4. Pas d'Impact sur le Backend
Le backend continue de fonctionner, seul l'accès utilisateur est bloqué.

---

## 🔧 Dépannage

### Problème : La page ne s'affiche pas

**Solution :**
```javascript
// Vérifiez que le fichier maintenance.html existe
const fs = require('fs');
console.log(fs.existsSync('./maintenance.html')); // devrait être true
```

### Problème : Le site reste en maintenance après désactivation

**Solution :**
1. Vérifiez que `MAINTENANCE_MODE=false` sur Render
2. Redémarrez manuellement le service sur Render
3. Videz le cache de votre navigateur (Ctrl+Shift+R)

### Problème : Les requêtes API ne passent pas

**Solution :**
Le middleware bloque aussi les API. C'est normal. Pour permettre certaines API :

```javascript
// Dans maintenanceMode.js, ajoutez des exceptions
const allowedPaths = [
    '/maintenance.html',
    '/health',
    '/api/health',
    '/api/auth/login', // ⭐ Exemple : autoriser le login
];
```

---

## 📞 Support

Pour toute question :
- Email : contactkobarapide@gmail.com

---

**Kobarapide - Plateforme d'Entraide Sociale**
**Guide d'installation maintenance - v1.0**
