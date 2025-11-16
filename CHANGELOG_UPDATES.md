# 📋 Changelog - Mises à Jour Majeures KobaRapide

**Date** : 2025-01-16
**Version** : 2.0.0

---

## 🎯 Résumé des Modifications

Cette mise à jour majeure apporte des améliorations critiques au flux de prêt, à la gestion des utilisateurs, à la sécurité et à l'expérience utilisateur.

---

## ✅ 1. FLUX DE PRÊT CORRIGÉ

### Problème Résolu
Les échéances étaient créées lors de l'approbation au lieu du déblocage, ce qui causait des incohérences dans le calendrier de remboursement.

### Modifications Apportées

#### Backend (`api/routes/loans.js`)
- **Ligne 119-122** : Suppression de la génération d'échéances à l'approbation
- **Ligne 124-146** : Génération d'échéances au moment du DÉBLOCAGE uniquement
- **Calcul automatique** : 2 tranches de 50% chacune
  - Tranche 1 : 50% à rembourser à J+30 après déblocage
  - Tranche 2 : 50% à rembourser à J+60 après déblocage

#### Frontend (`frontend/components/client/ClientDashboard.tsx`)
- **Ligne 341-348** : Ajout d'un encadré informatif sur le calendrier de remboursement
- **Ligne 79-83** : Suppression du champ "durée" du formulaire
- **Affichage** : Informations claires sur les échéances (30 et 60 jours)

### Nouveau Flux Complet

```
1. CLIENT : Demande de prêt (montant + raison)
   → Statut : EN_ATTENTE

2. ADMIN : Examine et APPROUVE la demande
   → Statut : APPROUVE
   → Aucune échéance créée à ce stade

3. ADMIN : DÉBLOQUE le prêt (verse les fonds)
   → Statut : DEBLOQUE
   → ✅ Création automatique des 2 échéances :
      • Échéance 1 : 50% à J+30
      • Échéance 2 : 50% à J+60

4. CLIENT : Soumet preuve de paiement pour chaque échéance
   → Statut échéance : EN_ATTENTE_CONFIRMATION

5. ADMIN : Confirme le paiement
   → Statut échéance : PAYEE

6. SYSTÈME : Vérifie si toutes les échéances sont payées
   → Si oui : Statut prêt : REMBOURSE
   → Incrémente nombrePretsRembourses du client
   → Génère code de parrainage si c'est le 1er prêt remboursé
```

---

## 🗑️ 2. NETTOYAGE DATABASE & SUPER ADMIN

### Script Créé : `api/scripts/resetDatabase.js`

#### Fonctionnalités
✅ Supprime **TOUS** les utilisateurs (clients, staff, admins)
✅ Supprime **TOUTES** les demandes de prêts
✅ Supprime **TOUS** les doublons potentiels
✅ Crée un SuperAdmin avec identifiants définis

#### Utilisation

```bash
# Depuis la racine du projet
node api/scripts/resetDatabase.js
```

**⚠️ ATTENTION** : Ce script affiche un compte à rebours de 3 secondes avant exécution. Appuyez sur **Ctrl+C** pour annuler.

#### Identifiants SuperAdmin

Après exécution du script :
- **Email** : `edemkukuz@gmail.com`
- **Password** : `admin123`
- **Rôle** : `SUPER_ADMIN`
- **Statut** : `ACTIF`
- **Score** : 10

#### Sortie du Script

```
========================================
✅ RÉINITIALISATION TERMINÉE

📊 Résumé :
   • X utilisateurs supprimés
   • Y demandes de prêts supprimées
   • Z doublons supprimés
   • 1 SuperAdmin créé

🔐 Connexion SuperAdmin :
   Email    : edemkukuz@gmail.com
   Password : admin123
========================================
```

---

## ❓ 3. SECTION FAQ COMPLÈTE

### Fichier Créé : `frontend/components/shared/FAQ.tsx`

#### Contenu de la FAQ

La FAQ couvre **6 catégories** avec **25+ questions** :

1. **Général** (4 questions)
   - Qu'est-ce que Kobarapide ?
   - Comment fonctionne le système de score ?
   - Comment créer un compte ?
   - Le service est-il gratuit ?

2. **Demande de Prêt** (4 questions)
   - Comment demander un prêt ?
   - Quels montants puis-je emprunter ?
   - Quels sont les frais appliqués ?
   - Combien de temps pour obtenir une réponse ?

3. **Remboursement** (4 questions)
   - Comment fonctionne le remboursement ?
   - Comment payer une échéance ?
   - Que se passe-t-il si je rate une échéance ?
   - Comment augmenter mon score ?

4. **Compte et Sécurité** (4 questions)
   - Comment modifier mon mot de passe ?
   - J'ai oublié mon mot de passe, que faire ?
   - Mes données sont-elles sécurisées ?
   - Comment supprimer mon compte ?

5. **Parrainage** (2 questions)
   - Comment fonctionne le parrainage ?
   - Quels sont les avantages du parrainage ?

6. **Support** (3 questions)
   - Comment contacter le support ?
   - Que faire si j'ai un problème technique ?
   - La plateforme est-elle disponible 24/7 ?

#### Caractéristiques
✅ **Accordéons interactifs** : Cliquer pour ouvrir/fermer
✅ **Design responsive** : S'adapte à tous les écrans
✅ **Mode sombre/clair** : Compatible avec le thème
✅ **Formatage HTML** : Texte enrichi (gras, listes, etc.)
✅ **Contact rapide** : Bouton email direct

#### Intégration

Pour ajouter la FAQ à votre navigation :

```tsx
import FAQ from './components/shared/FAQ';

// Dans votre routeur
<Route path="/faq" element={<FAQ darkMode={darkMode} />} />
```

---

## 🔒 4. GESTION DES MOTS DE PASSE

### A. Changement de Mot de Passe

#### Backend : `POST /api/auth/change-password`

**Headers** :
```
x-auth-token: [JWT_TOKEN]
```

**Body** :
```json
{
  "oldPassword": "ancien_mot_de_passe",
  "newPassword": "nouveau_mot_de_passe"
}
```

**Réponse succès** :
```json
{
  "msg": "Mot de passe modifié avec succès"
}
```

**Réponses d'erreur** :
- `400` : Ancien mot de passe incorrect
- `400` : Nouveau mot de passe trop court (< 6 caractères)
- `401` : Token invalide
- `404` : Utilisateur non trouvé

#### Sécurité
✅ Vérification de l'ancien mot de passe obligatoire
✅ Hash bcrypt (10 rounds)
✅ Authentification JWT requise

---

### B. Réinitialisation de Mot de Passe

#### Modèle Créé : `api/models/PasswordReset.js`

Stocke les tokens de réinitialisation avec :
- `userId` : Référence à l'utilisateur
- `resetToken` : Token hashé (SHA-256)
- `expiresAt` : Date d'expiration (1 heure)
- `used` : Booléen pour empêcher la réutilisation
- **TTL Index** : Suppression automatique après 2 heures

#### Étape 1 : Demander une Réinitialisation

**Endpoint** : `POST /api/auth/forgot-password`

**Body** :
```json
{
  "email": "user@example.com"
}
```

**Réponse** :
```json
{
  "msg": "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.",
  "resetUrl": "http://localhost:3000/reset-password/abc123..." // Développement uniquement
}
```

**Processus** :
1. Génère un token cryptographiquement sécurisé (32 bytes)
2. Hash le token avec SHA-256
3. Supprime les anciens tokens de l'utilisateur
4. Enregistre le nouveau token (expire dans 1h)
5. Log le lien de réinitialisation dans la console
6. *(À implémenter)* : Envoie l'email

#### Étape 2 : Réinitialiser avec le Token

**Endpoint** : `POST /api/auth/reset-password/:token`

**Body** :
```json
{
  "newPassword": "nouveau_mot_de_passe"
}
```

**Réponse succès** :
```json
{
  "msg": "Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter."
}
```

**Réponses d'erreur** :
- `400` : Token invalide ou expiré
- `400` : Mot de passe trop court
- `404` : Utilisateur non trouvé

#### Sécurité
✅ Token unique et cryptographiquement sécurisé
✅ Hash SHA-256 pour le stockage
✅ Expiration après 1 heure
✅ Usage unique (marqué comme `used` après utilisation)
✅ Suppression automatique après 2 heures (TTL)
✅ Message générique pour empêcher l'énumération d'emails

---

## 📧 5. ENVOI D'EMAILS (À CONFIGURER)

### Configuration Nodemailer (Exemple)

Pour activer l'envoi réel d'emails, installez nodemailer :

```bash
cd api
npm install nodemailer
```

Puis configurez dans `api/routes/auth.js` (ligne 393) :

```javascript
const nodemailer = require('nodemailer');

// Configuration Gmail
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // contactkobarapide@gmail.com
        pass: process.env.EMAIL_PASSWORD // Mot de passe d'application Gmail
    }
});

// Envoi de l'email
await transporter.sendMail({
    from: '"KobaRapide" <contactkobarapide@gmail.com>',
    to: email,
    subject: 'Réinitialisation de votre mot de passe - Kobarapide',
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #D97706;">🔒 Réinitialisation de mot de passe</h1>
            <p>Bonjour,</p>
            <p>Vous avez demandé une réinitialisation de mot de passe pour votre compte Kobarapide.</p>
            <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
            <a href="${resetUrl}" style="display: inline-block; background-color: #D97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                Réinitialiser mon mot de passe
            </a>
            <p><strong>Ce lien expire dans 1 heure.</strong></p>
            <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
            <p style="color: #666; font-size: 12px;">
                Kobarapide - Plateforme d'Entraide Sociale<br>
                Email : contactkobarapide@gmail.com
            </p>
        </div>
    `
});
```

### Variables d'Environnement

Ajoutez dans `.env` :

```env
EMAIL_USER=contactkobarapide@gmail.com
EMAIL_PASSWORD=votre_mot_de_passe_application
FRONTEND_URL=https://kobarapide.vercel.app
```

---

## 🧪 6. TESTS

### Test 1 : Script de Réinitialisation DB

```bash
node api/scripts/resetDatabase.js
```

**Vérifications** :
- [ ] Tous les utilisateurs sont supprimés
- [ ] Tous les prêts sont supprimés
- [ ] SuperAdmin créé avec `edemkukuz@gmail.com`
- [ ] Connexion réussie avec `admin123`

---

### Test 2 : Flux de Prêt Complet

#### 2.1 Créer un Client de Test

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "nom": "Test",
    "prenom": "User",
    "telephone": "0612345678",
    "pieceIdentite": "TEST001",
    "dateDeNaissance": "1995-05-15"
  }'
```

**Attendu** : Token JWT + utilisateur créé avec score 0

#### 2.2 Demander un Prêt

```bash
curl -X POST http://localhost:3001/api/loans \
  -H "Content-Type: application/json" \
  -H "x-auth-token: [TOKEN_CLIENT]" \
  -d '{
    "montant": 5000,
    "raison": "Projet personnel"
  }'
```

**Attendu** :
- Prêt créé avec `status: EN_ATTENTE`
- `requestedAmount: 5000`
- `fees: 250` (5%)
- `netAmount: 4750`
- Pas d'échéances encore

#### 2.3 Approuver le Prêt (Admin)

```bash
curl -X PUT http://localhost:3001/api/loans/[LOAN_ID]/status \
  -H "Content-Type: application/json" \
  -H "x-auth-token: [TOKEN_ADMIN]" \
  -d '{
    "status": "APPROUVE"
  }'
```

**Attendu** :
- `status: APPROUVE`
- `approvedAt`: Date actuelle
- **Pas d'échéances créées**

#### 2.4 Débloquer le Prêt (Admin)

```bash
curl -X PUT http://localhost:3001/api/loans/[LOAN_ID]/status \
  -H "Content-Type: application/json" \
  -H "x-auth-token: [TOKEN_ADMIN]" \
  -d '{
    "status": "DEBLOQUE"
  }'
```

**Attendu** :
- `status: DEBLOQUE`
- `disbursedAt`: Date actuelle
- **✅ 2 échéances créées** :
  - Échéance 1 : `dueAmount: 2500`, `dueDate`: J+30
  - Échéance 2 : `dueAmount: 2500`, `dueDate`: J+60

---

### Test 3 : Changement de Mot de Passe

```bash
curl -X POST http://localhost:3001/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "x-auth-token: [TOKEN]" \
  -d '{
    "oldPassword": "test123",
    "newPassword": "newpass456"
  }'
```

**Attendu** :
- `200 OK` : "Mot de passe modifié avec succès"
- Connexion avec ancien mot de passe échoue
- Connexion avec nouveau mot de passe réussit

---

### Test 4 : Réinitialisation de Mot de Passe

#### 4.1 Demander Réinitialisation

```bash
curl -X POST http://localhost:3001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

**Attendu** :
- `200 OK`
- `resetUrl` dans la réponse (développement)
- Log dans la console avec le lien

#### 4.2 Utiliser le Token

```bash
curl -X POST http://localhost:3001/api/auth/reset-password/[TOKEN] \
  -H "Content-Type: application/json" \
  -d '{
    "newPassword": "resetpass789"
  }'
```

**Attendu** :
- `200 OK` : "Mot de passe réinitialisé avec succès"
- Connexion avec nouveau mot de passe réussit
- Token marqué comme `used: true`

#### 4.3 Réutiliser le Même Token

```bash
curl -X POST http://localhost:3001/api/auth/reset-password/[MÊME_TOKEN] \
  -H "Content-Type: application/json" \
  -d '{
    "newPassword": "anotherpass"
  }'
```

**Attendu** :
- `400 Bad Request` : "Token invalide ou expiré"

---

## 📦 7. FICHIERS MODIFIÉS/CRÉÉS

### Backend

**Modifiés** :
- `api/routes/auth.js` : +175 lignes (changement et réinitialisation MDP)
- `api/routes/loans.js` : Flux de déblocage corrigé
- `api/server.js` : Intégration maintenance mode (précédemment)

**Créés** :
- `api/models/PasswordReset.js` : Modèle pour tokens de réinitialisation
- `api/scripts/resetDatabase.js` : Script de nettoyage DB + création SuperAdmin

### Frontend

**Modifiés** :
- `frontend/components/client/ClientDashboard.tsx` : Retrait champ durée + info remboursement

**Créés** :
- `frontend/components/shared/FAQ.tsx` : Page FAQ complète

### Documentation

**Créés** :
- `CHANGELOG_UPDATES.md` : Ce fichier
- `MAINTENANCE.md` : Doc page de maintenance (précédemment)
- `INSTALLATION_MAINTENANCE.md` : Guide installation (précédemment)

---

## 🚀 8. DÉPLOIEMENT

### Étapes

1. **Nettoyer la base de données** (optionnel, recommandé en dev) :
   ```bash
   node api/scripts/resetDatabase.js
   ```

2. **Vérifier les variables d'environnement sur Render** :
   ```env
   ADMIN_EMAIL=edemkukuz@gmail.com
   ADMIN_PASSWORD=admin123
   JWT_SECRET=[votre_secret]
   MONGODB_URI=[votre_uri]
   NODE_ENV=production
   FRONTEND_URL=https://kobarapide.vercel.app
   ```

3. **Push vers GitHub** :
   ```bash
   git add .
   git commit -m "✅ Mise à jour majeure v2.0.0"
   git push origin main
   ```

4. **Render déploie automatiquement**

5. **Initialiser le SuperAdmin** (si DB vide) :
   ```bash
   curl -X POST https://kobarapide.onrender.com/api/auth/init-super-admin
   ```

---

## 📞 9. SUPPORT

Pour toute question ou problème :
- **Email** : contactkobarapide@gmail.com
- **GitHub Issues** : [Créer une issue](https://github.com/UknowEdy/kobarapide/issues)

---

## 🎉 10. CONCLUSION

Cette mise à jour corrige les problèmes critiques du flux de prêt, améliore la sécurité avec la gestion des mots de passe, et enrichit l'expérience utilisateur avec une FAQ complète.

**Testez tout minutieusement avant de déployer en production !**

---

**Version** : 2.0.0
**Date** : 2025-01-16
**Auteur** : @UknowEdy
**Plateforme** : Kobarapide - Entraide Sociale
