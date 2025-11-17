# 🗑️ Suppression de Compte Client - Documentation

## 📋 Vue d'Ensemble

La fonctionnalité de suppression de compte permet aux clients de supprimer leur compte s'ils ne souhaitent plus utiliser Kobarapide. Cependant, des **vérifications strictes** sont effectuées pour garantir que le client n'a aucune dette envers la plateforme.

---

## ⚠️ Règles de Suppression

### ✅ Conditions Requises

Pour pouvoir supprimer son compte, le client DOIT :

1. **Être un CLIENT** (pas un staff, admin ou modérateur)
2. **N'avoir AUCUN prêt en cours** :
   - Statut `EN_ATTENTE`
   - Statut `APPROUVE`
   - Statut `DEBLOQUE`
3. **N'avoir AUCUN prêt impayé** :
   - Statut `DEFAUT`
4. **Confirmer avec son mot de passe**

### ❌ Impossibilité de Supprimer

La suppression est **REFUSÉE** si :
- Le client a des prêts en cours (non remboursés)
- Le client a des prêts en défaut de paiement
- Le mot de passe fourni est incorrect

---

## 🔒 Suppression "Soft Delete" (Archivage)

**IMPORTANT** : Les données du client ne sont **PAS supprimées physiquement** de la base de données.

### Ce Qui Se Passe

1. Le statut du compte passe à `COMPTE_SUPPRIME`
2. La raison de suppression est enregistrée dans `deletionReason`
3. La date de suppression est enregistrée dans `deletedAt`
4. **Toutes les données historiques sont CONSERVÉES** :
   - Informations personnelles
   - Historique des prêts
   - Transactions
   - Score
   - Dates d'inscription et activités

### Pourquoi Conserver les Données ?

✅ **Conformité légale** : Obligations d'archivage comptable et fiscal
✅ **Audit interne** : Traçabilité des opérations financières
✅ **Prévention de la fraude** : Éviter les réinscriptions multiples
✅ **Historique** : Garder trace des clients passés

---

## 🔧 API - Endpoint de Suppression

### POST `/api/users/delete-account`

**Authentification** : Requise (JWT token)
**Accès** : CLIENT uniquement

#### Headers

```
x-auth-token: [JWT_TOKEN]
Content-Type: application/json
```

#### Body

```json
{
  "password": "mot_de_passe_du_client",
  "reason": "Raison optionnelle de la suppression"
}
```

#### Exemple de Requête

```bash
curl -X POST http://localhost:3001/api/users/delete-account \
  -H "Content-Type: application/json" \
  -H "x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "password": "monmotdepasse123",
    "reason": "Je n'\''utilise plus le service"
  }'
```

#### Réponse Succès (200 OK)

```json
{
  "msg": "Votre compte a été supprimé avec succès.",
  "details": "Vos données ont été archivées conformément à nos obligations légales. Merci d'avoir utilisé Kobarapide."
}
```

#### Réponses d'Erreur

**400 Bad Request - Mot de passe manquant**

```json
{
  "msg": "Mot de passe requis pour confirmer la suppression"
}
```

**400 Bad Request - Mot de passe incorrect**

```json
{
  "msg": "Mot de passe incorrect"
}
```

**400 Bad Request - Prêts en cours**

```json
{
  "msg": "Impossible de supprimer votre compte. Vous avez des prêts en cours.",
  "activeLoans": 2,
  "details": "Vous devez rembourser tous vos prêts avant de pouvoir supprimer votre compte."
}
```

**400 Bad Request - Prêts impayés**

```json
{
  "msg": "Impossible de supprimer votre compte. Vous avez des prêts impayés.",
  "unpaidLoans": 1,
  "details": "Veuillez contacter le support pour régulariser votre situation : contactkobarapide@gmail.com"
}
```

**403 Forbidden - Non-CLIENT**

```json
{
  "msg": "Seuls les clients peuvent supprimer leur compte via cette route"
}
```

**404 Not Found**

```json
{
  "msg": "Utilisateur non trouvé"
}
```

---

## 👨‍💼 Côté Admin - Voir les Comptes Supprimés

### GET `/api/users/deleted`

**Authentification** : Requise (JWT token)
**Accès** : ADMIN ou SUPER_ADMIN uniquement

#### Exemple de Requête

```bash
curl -X GET http://localhost:3001/api/users/deleted \
  -H "x-auth-token: [ADMIN_TOKEN]"
```

#### Réponse

```json
{
  "total": 5,
  "users": [
    {
      "_id": "60f7c8b8e1234567890abcde",
      "email": "client@example.com",
      "nom": "Dupont",
      "prenom": "Jean",
      "status": "COMPTE_SUPPRIME",
      "deletionReason": "Plus besoin du service",
      "deletedAt": "2025-01-16T10:30:00.000Z",
      "nombrePretsRembourses": 3,
      "score": 7,
      "dateInscription": "2024-06-01T08:00:00.000Z"
    }
  ]
}
```

---

## 📊 Modèle de Données - Nouveaux Champs

### User Schema

Deux nouveaux champs ont été ajoutés au modèle `User` :

```javascript
{
  // ... autres champs existants

  status: {
    type: String,
    enum: [
      'EN_ATTENTE',
      'ACTIF',
      'SUSPENDU',
      'BLOQUE',
      'REACTIVATION_EN_ATTENTE',
      'INACTIF_EXCLU',
      'EN_VERIFICATION_DOUBLON',
      'REJETE',
      'COMPTE_SUPPRIME' // ✅ NOUVEAU
    ],
    default: 'EN_ATTENTE'
  },

  deletionReason: {
    type: String // ✅ NOUVEAU - Raison de suppression
  },

  deletedAt: {
    type: Date // ✅ NOUVEAU - Date de suppression
  }
}
```

---

## 🔍 Logs d'Audit

Chaque suppression de compte génère un **log détaillé** dans la console du serveur :

```
📋 SUPPRESSION DE COMPTE - Client ID: 60f7c8b8e1234567890abcde
   Email: client@example.com
   Nom: Jean Dupont
   Raison: Plus besoin du service
   Date: 2025-01-16T10:30:00.000Z
   Prêts remboursés: 3
```

Ces logs permettent :
- ✅ Traçabilité complète
- ✅ Audit interne
- ✅ Détection de patterns de suppression
- ✅ Analyse des raisons de départ

---

## 🧪 Tests

### Test 1 : Suppression Réussie

**Prérequis** :
- Client sans prêt en cours
- Tous les prêts remboursés

```bash
curl -X POST http://localhost:3001/api/users/delete-account \
  -H "Content-Type: application/json" \
  -H "x-auth-token: [CLIENT_TOKEN]" \
  -d '{
    "password": "test123",
    "reason": "Test de suppression"
  }'
```

**Attendu** : `200 OK` avec message de confirmation

---

### Test 2 : Suppression Refusée (Prêt en Cours)

**Prérequis** :
- Client avec au moins 1 prêt en statut `EN_ATTENTE`, `APPROUVE` ou `DEBLOQUE`

```bash
curl -X POST http://localhost:3001/api/users/delete-account \
  -H "Content-Type: application/json" \
  -H "x-auth-token: [CLIENT_TOKEN]" \
  -d '{
    "password": "test123"
  }'
```

**Attendu** : `400 Bad Request` avec message "Vous avez des prêts en cours"

---

### Test 3 : Suppression Refusée (Mot de Passe Incorrect)

```bash
curl -X POST http://localhost:3001/api/users/delete-account \
  -H "Content-Type: application/json" \
  -H "x-auth-token: [CLIENT_TOKEN]" \
  -d '{
    "password": "mauvais_password"
  }'
```

**Attendu** : `400 Bad Request` avec message "Mot de passe incorrect"

---

### Test 4 : Vérifier les Comptes Supprimés (Admin)

```bash
curl -X GET http://localhost:3001/api/users/deleted \
  -H "x-auth-token: [ADMIN_TOKEN]"
```

**Attendu** : Liste des utilisateurs avec `status: COMPTE_SUPPRIME`

---

## 🎯 Workflow Complet

```
1. CLIENT se connecte à son compte

2. CLIENT demande la suppression de son compte
   └─> Fournit son mot de passe

3. SYSTÈME vérifie :
   ├─> Mot de passe correct ? ✅
   ├─> Prêts en cours ? ❌ (aucun)
   └─> Prêts impayés ? ❌ (aucun)

4. SYSTÈME marque le compte comme SUPPRIMÉ
   ├─> status = 'COMPTE_SUPPRIME'
   ├─> deletionReason = "Raison fournie"
   ├─> deletedAt = Date actuelle
   └─> Données conservées (soft delete)

5. SYSTÈME enregistre un LOG d'audit

6. CLIENT reçoit confirmation

7. ADMIN peut consulter l'historique via /api/users/deleted
```

---

## 📞 Support

En cas de problème avec un compte supprimé, le client peut contacter :
- **Email** : contactkobarapide@gmail.com

L'équipe admin peut :
- Consulter les comptes supprimés via `/api/users/deleted`
- Vérifier les logs d'audit
- Restaurer un compte si nécessaire (manuellement via MongoDB)

---

## 🔐 Sécurité

### Mesures de Protection

✅ **Vérification du mot de passe** : Confirmation d'identité obligatoire
✅ **Vérification des prêts** : Impossible si dettes
✅ **Soft delete** : Données jamais perdues
✅ **Logs d'audit** : Traçabilité complète
✅ **Accès restreint** : Seul le client peut supprimer son propre compte
✅ **Archivage** : Conformité RGPD et obligations légales

### Conformité RGPD

Bien que les données soient conservées, cela est conforme au RGPD pour :
- **Obligation légale** (Art. 6.1.c) : Archivage comptable et fiscal
- **Intérêt légitime** (Art. 6.1.f) : Prévention de la fraude

Le client en est informé via le message de confirmation.

---

## 📁 Fichiers Modifiés

### Backend

**Modifiés** :
- `api/models/User.js` : Ajout de `deletionReason` et `deletedAt`
- `api/routes/users.js` : Ajout des endpoints de suppression et consultation

**Nouveaux** :
- `ACCOUNT_DELETION.md` : Ce fichier de documentation

---

## 🚀 Déploiement

Les modifications sont compatibles avec la base de données existante :
- Les nouveaux champs sont **optionnels**
- Pas de migration nécessaire
- Compatible avec les utilisateurs existants

---

**Version** : 1.0.0
**Date** : 2025-01-16
**Auteur** : @UknowEdy
**Plateforme** : Kobarapide - Entraide Sociale
