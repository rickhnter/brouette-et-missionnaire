# Configuration Stripe — Brouette & Missionnaire

## Flux de paiement

```
[PremiumPaywallScreen] → [Edge function: create-checkout-session]
        → [Stripe Checkout] → [/?premium=success]
        → [Edge function: stripe-webhook] → [premium_unlocked = true]
        → [Jeu reprend]
```

## 1. Variables d'environnement (déjà configurées)

Les secrets suivants sont configurés dans Lovable Cloud et disponibles dans les edge functions :
- `STRIPE_SECRET_KEY` : clé secrète Stripe (`sk_test_...` ou `sk_live_...`)
- `STRIPE_WEBHOOK_SECRET` : secret de signature du webhook (`whsec_...`)

## 2. Configurer le webhook Stripe

1. Aller dans le **dashboard Stripe → Developers → Webhooks**
2. Cliquer **"Add endpoint"**
3. URL de l'endpoint :
   ```
   https://soeaybmnzinytliqdzao.supabase.co/functions/v1/stripe-webhook
   ```
4. Sélectionner l'événement : **`checkout.session.completed`**
5. Après création, copier le **"Signing secret"** (`whsec_...`)
6. Mettre à jour le secret `STRIPE_WEBHOOK_SECRET` dans Lovable Cloud avec cette valeur

## 3. Tester en mode test Stripe

Cartes de test disponibles sur [stripe.com/docs/testing](https://stripe.com/docs/testing) :
- **Succès** : `4242 4242 4242 4242`
- **Échec** : `4000 0000 0000 0002`
- **Authentification 3DS** : `4000 0025 0000 3155`

Pour les tests, utiliser la date d'expiration n'importe quelle date future et n'importe quel CVC à 3 chiffres.

## 4. Edge functions déployées

| Fonction | URL |
|---|---|
| `create-checkout-session` | `https://soeaybmnzinytliqdzao.supabase.co/functions/v1/create-checkout-session` |
| `stripe-webhook` | `https://soeaybmnzinytliqdzao.supabase.co/functions/v1/stripe-webhook` |

## 5. Tables de base de données

- **`game_sessions`** : champs `premium_unlocked`, `premium_unlocked_by`, `premium_unlocked_at`, `stripe_payment_id` mis à jour par le webhook
- **`payments`** : enregistrement de chaque transaction Stripe avec statut, montant, IDs Stripe
