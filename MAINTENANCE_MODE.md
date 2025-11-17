# 🔧 Mode Maintenance - Guide d'utilisation

Ce guide explique comment activer et désactiver le mode maintenance sur Kobarapide.

---

## 📋 Qu'est-ce que le mode maintenance ?

Le mode maintenance permet de mettre temporairement hors ligne la plateforme Kobarapide pour effectuer des mises à jour, des corrections de bugs ou des opérations de maintenance sans que les utilisateurs puissent accéder aux services.

Quand le mode maintenance est activé :
- ✅ Une page de maintenance professionnelle est affichée aux utilisateurs
- ✅ Toutes les requêtes API sont bloquées (sauf `/health`)
- ✅ Les utilisateurs ne peuvent pas se connecter ou utiliser la plateforme
- ✅ Le système reste accessible pour les tests de santé (monitoring)

---

## 🚀 Comment ACTIVER le mode maintenance

### Sur Render.com (Production)

1. **Allez sur Render** : https://render.com
2. **Sélectionnez votre service** : `kobarapide` (backend)
3. **Cliquez sur "Environment"** dans le menu de gauche
4. **Trouvez la variable** : `MAINTENANCE_MODE`
5. **Changez la valeur** de `false` à `true`
6. **Sauvegardez** les modifications

> ⚠️ **Le service va automatiquement redémarrer** (prend environ 1-2 minutes)

### En local (Développement)

1. Ouvrez le fichier `.env` à la racine du projet backend
2. Changez `MAINTENANCE_MODE=false` en `MAINTENANCE_MODE=true`
3. Redémarrez le serveur backend :
   ```bash
   cd api
   npm run dev
   ```

---

## ✅ Comment DÉSACTIVER le mode maintenance

### Sur Render.com (Production)

1. **Allez sur Render** : https://render.com
2. **Sélectionnez votre service** : `kobarapide` (backend)
3. **Cliquez sur "Environment"** dans le menu de gauche
4. **Trouvez la variable** : `MAINTENANCE_MODE`
5. **Changez la valeur** de `true` à `false`
6. **Sauvegardez** les modifications

> ✅ **Le service va automatiquement redémarrer et redevenir accessible**

### En local (Développement)

1. Ouvrez le fichier `.env` à la racine du projet backend
2. Changez `MAINTENANCE_MODE=true` en `MAINTENANCE_MODE=false`
3. Redémarrez le serveur backend :
   ```bash
   cd api
   npm run dev
   ```

---

## 🔍 Comment vérifier l'état du mode maintenance

### Via le endpoint /health

Vous pouvez vérifier l'état de la maintenance en appelant :

```bash
curl https://kobarapide.onrender.com/health
```

**Réponse attendue :**
```json
{
  "status": "ok",
  "timestamp": "2025-01-17T10:30:00.000Z",
  "maintenance": false
}
```

- Si `maintenance: true` → Mode maintenance **ACTIVÉ** 🔧
- Si `maintenance: false` → Mode maintenance **DÉSACTIVÉ** ✅

### Via les logs serveur

Quand le serveur démarre, vous verrez dans les logs :

```
✅ Serveur démarré sur le port 3001
🔧 Mode maintenance: ⚠️  ACTIVÉ
🌐 Environnement: production
```

ou

```
✅ Serveur démarré sur le port 3001
🔧 Mode maintenance: ✅ Désactivé
🌐 Environnement: production
```

---

## 📱 Ce que voient les utilisateurs

### Quand le mode maintenance est activé

Les utilisateurs verront une page professionnelle avec :
- 🔧 Icône et titre "Maintenance en cours"
- 📝 Message explicatif
- 📧 Email de contact : contactkobarapide@gmail.com
- ⏳ Animation de chargement
- 🎨 Design moderne avec fond dégradé

### Quand le mode maintenance est désactivé

Les utilisateurs accèdent normalement à la plateforme :
- Page de connexion/inscription
- Tableau de bord client
- Tableau de bord admin
- Toutes les fonctionnalités normales

---

## 🛠️ Architecture technique

### Backend (api/server.js)

Le middleware `maintenanceMode` est appliqué **AVANT** toutes les routes :

```javascript
const maintenanceMode = require('./middleware/maintenanceMode');
app.use(maintenanceMode); // Ligne 29
```

### Frontend (App.tsx)

Au démarrage de l'application, le frontend :
1. Appelle le endpoint `/health`
2. Vérifie si `maintenance === true`
3. Affiche `<MaintenanceMode />` si activé
4. Sinon, affiche l'app normalement

---

## ⚡ Bonnes pratiques

### Quand activer le mode maintenance ?

- ✅ Avant une mise à jour majeure de la base de données
- ✅ Pour corriger un bug critique en production
- ✅ Pour effectuer des migrations de données
- ✅ Pour des opérations de sauvegarde complexes
- ✅ Quand le système est instable

### Quand NE PAS activer le mode maintenance ?

- ❌ Pour des petites corrections de bugs (utilisez des déploiements progressifs)
- ❌ Pour des mises à jour de textes ou CSS
- ❌ Pour ajouter de nouvelles fonctionnalités (testez d'abord en staging)

### Durée recommandée

- ⏱️ **Courte maintenance** : 5-15 minutes (petites mises à jour)
- ⏱️ **Maintenance moyenne** : 30-60 minutes (migrations, corrections)
- ⏱️ **Longue maintenance** : 2-4 heures (refonte majeure)

> 💡 **Conseil** : Prévenez toujours les utilisateurs à l'avance via email ou notification !

---

## 📞 Support

Pour toute question sur le mode maintenance, contactez :

**Email** : contactkobarapide@gmail.com

---

## 📝 Historique des maintenances

Gardez une trace des maintenances effectuées :

| Date | Durée | Raison | Responsable |
|------|-------|--------|-------------|
| _À compléter_ | _À compléter_ | _À compléter_ | _À compléter_ |

---

**Dernière mise à jour** : 17 janvier 2025
**Version** : 1.0.0
