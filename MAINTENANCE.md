# 🔧 Page de Maintenance - Kobarapide

## 📋 Description

Page de maintenance professionnelle pour KobaRapide. À utiliser lors de :
- Mises à jour du système
- Maintenance planifiée
- Problèmes techniques temporaires
- Déploiements importants

---

## 📁 Fichiers

Deux versions de la page de maintenance ont été créées :

1. **`/maintenance.html`** (racine du projet)
2. **`/frontend/maintenance.html`** (frontend)

---

## 🎨 Caractéristiques

✅ Design cohérent avec la charte graphique Kobarapide
✅ Responsive (mobile, tablette, desktop)
✅ Animations fluides et professionnelles
✅ Auto-refresh toutes les 5 minutes
✅ Email de contact visible : contactkobarapide@gmail.com
✅ SEO-friendly (noindex, nofollow)
✅ Loader animé
✅ Indicateur de statut en temps réel

---

## 🚀 Comment Utiliser

### Option 1 : Sur Render (Recommandé)

#### Méthode A : Redirection via Node.js

1. **Créer un fichier de contrôle de maintenance** :

Créez `/api/middleware/maintenanceMode.js` :

```javascript
// Middleware de mode maintenance
const maintenanceMode = (req, res, next) => {
    // Activer/désactiver le mode maintenance
    const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === 'true';

    if (MAINTENANCE_MODE) {
        // Permettre l'accès à la page de maintenance elle-même
        if (req.path === '/maintenance.html') {
            return next();
        }

        // Rediriger toutes les autres requêtes vers la page de maintenance
        return res.redirect(301, '/maintenance.html');
    }

    next();
};

module.exports = maintenanceMode;
```

2. **Modifier `/api/server.js`** :

```javascript
const maintenanceMode = require('./middleware/maintenanceMode');

// Ajouter AVANT vos autres routes
app.use(maintenanceMode);
```

3. **Sur Render, ajouter la variable d'environnement** :

```
MAINTENANCE_MODE=true
```

4. **Pour désactiver** :

Changez sur Render :
```
MAINTENANCE_MODE=false
```

#### Méthode B : Fichier statique sur Render

1. **Sur Render Dashboard** :
   - Allez dans votre service web
   - Settings → Redirects/Rewrites
   - Ajoutez une règle :
     - Source : `/*`
     - Destination : `/maintenance.html`
     - Action : Rewrite

2. **Pour désactiver** :
   - Supprimez simplement la règle de redirection

---

### Option 2 : Via Vercel (Frontend)

1. **Créer `vercel.json`** dans `/frontend` :

```json
{
  "routes": [
    {
      "src": "/maintenance.html",
      "dest": "/maintenance.html"
    },
    {
      "src": "/(.*)",
      "dest": "/maintenance.html"
    }
  ]
}
```

2. **Pour activer** : Déployez avec ce fichier
3. **Pour désactiver** : Supprimez ou commentez les routes

---

### Option 3 : Manuellement (Local ou serveur)

1. **Renommez temporairement vos fichiers** :

```bash
# Sauvegarder l'index actuel
mv index.html index.html.backup

# Activer la maintenance
cp maintenance.html index.html
```

2. **Pour désactiver** :

```bash
# Restaurer l'index original
mv index.html.backup index.html
```

---

## 🛠️ Personnalisation

### Changer le message

Éditez le fichier `maintenance.html`, section `<div class="message-box">` :

```html
<div class="message-box">
    <p><strong>🔧 Votre message personnalisé</strong></p>
    <p>Détails de la maintenance...</p>
</div>
```

### Changer la durée estimée

Ajoutez avant le loader :

```html
<div style="margin: 20px 0; font-size: 18px; color: #D97706;">
    ⏱️ Retour estimé : <strong>dans 2 heures</strong>
</div>
```

### Désactiver l'auto-refresh

Supprimez ou commentez le script en bas du fichier :

```javascript
// setTimeout(function() {
//     location.reload();
// }, 300000);
```

---

## 📊 Fonctionnalités Intégrées

### 1. Auto-Refresh (5 minutes)
La page se rafraîchit automatiquement toutes les 5 minutes pour vérifier si le site est de retour.

### 2. Animations
- Logo pulsant
- Indicateur de statut clignotant
- Loader rotatif
- Apparition progressive des éléments

### 3. Contact
Email de contact cliquable : `contactkobarapide@gmail.com`

### 4. SEO
Balises meta appropriées :
- `noindex, nofollow` (ne pas indexer la page)
- Description et theme-color

---

## 🎯 Scénarios d'Utilisation

### Mise à jour planifiée
```env
# Sur Render, ajouter :
MAINTENANCE_MODE=true
MAINTENANCE_MESSAGE="Mise à jour en cours. Retour prévu à 14h00."
```

### Problème technique urgent
1. Activez rapidement via Render dashboard
2. Les utilisateurs voient immédiatement la page
3. Communiquez via email si nécessaire

### Déploiement majeur
1. Activez 5 minutes avant
2. Effectuez le déploiement
3. Testez tout
4. Désactivez une fois validé

---

## 🔒 Sécurité

- La page n'expose aucune information sensible
- Email de contact : `contactkobarapide@gmail.com` (email public)
- Pas d'accès aux données utilisateurs
- Pas de formulaires ou d'inputs

---

## 📱 Compatibilité

✅ Desktop (Chrome, Firefox, Safari, Edge)
✅ Mobile (iOS Safari, Chrome Mobile, Samsung Internet)
✅ Tablette (iPad, Android tablets)
✅ Tous les navigateurs modernes

---

## 🧪 Tester la Page

### En local
```bash
# Ouvrez directement dans le navigateur
open maintenance.html
# ou
firefox maintenance.html
```

### En ligne
Accédez temporairement à :
```
https://votre-domaine.com/maintenance.html
```

---

## 💡 Conseils

1. **Testez d'abord** la page de maintenance avant de l'activer en production
2. **Communiquez** à l'avance si possible (email, réseaux sociaux)
3. **Estimez** un temps de maintenance réaliste
4. **Surveillez** : gardez un œil sur les logs pendant la maintenance
5. **Validez** tout avant de désactiver la maintenance

---

## 📞 Support

Pour toute question sur la page de maintenance :
- Email : contactkobarapide@gmail.com

---

**Créé pour Kobarapide - Plateforme d'Entraide Sociale**
**Version 1.0 - 2025**
