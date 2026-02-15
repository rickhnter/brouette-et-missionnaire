

# Plan : Notifications Push + In-App

## Vue d'ensemble

Quand un joueur repond a une question ou termine un evenement, son partenaire recevra :
- **En arriere-plan** : une notification push navigateur (meme si l'onglet est ferme)
- **Au premier plan** : un son + un toast visuel dans l'app

## Architecture

```text
Joueur A repond
       |
       v
  Index.tsx detecte la reponse
       |
       v
  Appel Edge Function "send-push-notification"
       |
       v
  Edge Function envoie via Web Push API
       |
       v
  Service Worker de Joueur B recoit la notification
  + Toast in-app via Realtime (deja en place)
```

## Etapes d'implementation

### 1. Generation des cles VAPID

Les notifications push Web necessitent des cles VAPID (Voluntary Application Server Identification). Ce sont des cles cryptographiques qui identifient votre serveur aupres des navigateurs.

- Generer une paire de cles publique/privee VAPID
- Stocker la cle privee en secret backend (`VAPID_PRIVATE_KEY`)
- Stocker la cle publique en variable d'environnement frontend (`VITE_VAPID_PUBLIC_KEY`)
- Stocker un email de contact en secret (`VAPID_SUBJECT`, ex: `mailto:you@example.com`)

### 2. Table `push_subscriptions` (nouvelle)

Stocker les abonnements push de chaque joueur par room :

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | Cle primaire |
| session_id | uuid | FK vers game_sessions |
| player_name | text | Nom du joueur |
| subscription | jsonb | Objet PushSubscription du navigateur |
| created_at | timestamp | Date de creation |

- Index unique sur `(session_id, player_name)` pour eviter les doublons
- RLS : lecture/ecriture publique (pas d'auth dans le projet)

### 3. Service Worker (`public/sw.js`)

Un fichier Service Worker qui :
- Ecoute les evenements `push` pour afficher les notifications systeme
- Gere le clic sur la notification pour ramener l'utilisateur dans l'app
- S'enregistre automatiquement au chargement de l'app

### 4. Hook `usePushNotifications`

Nouveau hook qui :
- Verifie si le navigateur supporte les notifications push
- Demande la permission a l'utilisateur
- S'abonne au push via le Service Worker
- Enregistre l'abonnement en base (table `push_subscriptions`)
- Expose une fonction `sendPushToPartner(title, body)` qui appelle l'edge function

### 5. Edge Function `send-push-notification`

Fonction backend qui :
- Recoit `session_id`, `player_name` (expediteur), `title`, `body`
- Cherche l'abonnement push du partenaire dans `push_subscriptions`
- Envoie la notification via le protocole Web Push (utilisant la lib `web-push`)
- Retourne le statut d'envoi

### 6. Notifications in-app (son + toast)

Dans `Index.tsx`, aux moments cles (reponse partenaire, evenement termine) :
- Jouer un son de notification discret
- Afficher un toast avec `sonner` (deja installe) : "Ton partenaire a repondu !"
- Conditionner : ne pas notifier si le joueur est deja sur l'ecran de reveal

### 7. Integration dans le flux de jeu

Declencheurs de notification (dans `Index.tsx`) :
- **Reponse a une question** : quand le realtime detecte que le partenaire a repondu, envoyer un push + toast
- **Evenement sync** : quand le partenaire repond a un evenement synchronise
- **Evenement solo termine** : quand le joueur actif termine son evenement

Detection intelligente :
- Si l'app est au premier plan (document visible) : toast uniquement
- Si l'app est en arriere-plan : notification push
- Utiliser `document.visibilityState` pour determiner l'etat

## Fichiers impactes

| Fichier | Action |
|---------|--------|
| `public/sw.js` | Nouveau - Service Worker |
| `src/hooks/usePushNotifications.ts` | Nouveau - Gestion push |
| `supabase/functions/send-push-notification/index.ts` | Nouveau - Edge function |
| `src/pages/Index.tsx` | Modifier - Ajouter les declencheurs de notification |
| `public/notification-sound.mp3` | Nouveau - Son de notification |
| Migration SQL | Nouvelle table `push_subscriptions` |

## Details techniques

### Compatibilite navigateur
- Les notifications push fonctionnent sur Chrome, Firefox, Edge, Safari 16+
- Sur iOS Safari, les notifications push necessitent que l'app soit installee en PWA (Add to Home Screen)
- Un fallback gracieux sera mis en place : si le navigateur ne supporte pas les push, seules les notifications in-app seront actives

### Flux de permission
1. Au premier lancement dans une room, un bouton discret "Activer les notifications" apparait
2. Le joueur clique et le navigateur affiche sa propre popup de permission
3. Si accepte : l'abonnement est enregistre en base
4. Si refuse : seules les notifications in-app (toast + son) fonctionnent

### Securite
- Les cles VAPID privees restent cote serveur (edge function)
- L'abonnement push est stocke par room + joueur
- Pas de donnees sensibles dans le payload de notification

