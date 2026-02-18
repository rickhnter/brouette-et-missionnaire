
# Migration Supabase : Système Premium

## Objectif

Créer une migration SQL qui prépare la base de données pour le système de paiement premium. Cela implique d'étendre la table `game_sessions` existante et de créer une nouvelle table `payments`.

## Ce qui sera créé

### 1. Colonnes ajoutées à `game_sessions`

| Colonne | Type | Description |
|---|---|---|
| `premium_unlocked` | boolean (default: false) | Indique si la room a débloqué le premium |
| `premium_unlocked_by` | text (nullable) | Nom du joueur ayant payé |
| `premium_unlocked_at` | timestamptz (nullable) | Date/heure du déblocage |
| `stripe_payment_id` | text (nullable) | Référence au paiement Stripe |

### 2. Nouvelle table `payments`

| Colonne | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Identifiant unique |
| `session_id` | uuid (FK → game_sessions) | Room concernée |
| `player_name` | text | Joueur qui a payé |
| `amount` | integer | Montant en centimes (ex: 500 = 5€) |
| `currency` | text (default: 'eur') | Devise |
| `stripe_payment_intent_id` | text (unique) | ID du PaymentIntent Stripe |
| `stripe_session_id` | text (nullable) | ID de la session Checkout Stripe |
| `status` | text (default: 'pending') | État: pending / completed / failed |
| `created_at` | timestamptz | Date de création |
| `completed_at` | timestamptz (nullable) | Date de complétion |

### 3. Index de performance

- `payments(session_id)` — récupérer les paiements d'une room
- `payments(stripe_payment_intent_id)` — lookup depuis le webhook Stripe
- `game_sessions(premium_unlocked)` — filtres éventuels sur le statut premium

### 4. Politiques RLS (Row Level Security)

**Table `payments` :**
- SELECT : accessible à tous (pour vérifier le statut depuis le client)
- INSERT : accessible à tous (pour créer un paiement en attente)

**Table `game_sessions` (UPDATE déjà existante) :**
- La politique `Sessions can be updated by anyone` couvre déjà les colonnes premium — aucune politique supplémentaire requise.

## Fichier de migration

Le fichier sera nommé avec le timestamp actuel (format `YYYYMMDDHHMMSS`) suivi d'un UUID, conformément aux conventions existantes du projet.

## Aucun changement de code nécessaire dans cette étape

Cette migration prépare uniquement la structure de données. L'intégration Stripe (edge functions, UI) fera l'objet d'une étape séparée.
