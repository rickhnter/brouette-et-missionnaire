
# Intégration Stripe pour le paiement premium

## Contexte et analyse

- La table `payments` existe déjà en base de données avec toutes les colonnes nécessaires (`stripe_session_id`, `stripe_payment_intent_id`, `status`, `amount`, etc.)
- La table `game_sessions` a déjà `premium_unlocked`, `premium_unlocked_by`, `premium_unlocked_at`, `stripe_payment_id`
- Les secrets Stripe (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) ne sont pas encore configurés — ils doivent être ajoutés avant de déployer les fonctions
- La clé publique Stripe doit être ajoutée dans le code frontend (elle est publique, donc on peut la mettre directement dans le code)
- Le package `@stripe/stripe-js` sera installé pour la redirection vers Stripe Checkout

## Flux de paiement

```text
[PremiumPaywallScreen]
        |
        | Clic "Débloquer"
        v
[Edge function: create-checkout-session]
        |
        | → Crée session Stripe Checkout
        | ← Retourne l'URL de paiement Stripe
        |
        v
[Redirection vers Stripe Checkout]
        |
        | Paiement réussi
        v
[Retour sur le site: /?premium=success&session_id=xxx]
        |
        | (webhook Stripe en parallèle)
        v
[Edge function: stripe-webhook]
        | checkout.session.completed
        | → Met à jour game_sessions.premium_unlocked = true
        | → Insère dans payments
        v
[Index.tsx détecte premium=success dans l'URL]
        | → Confirme visuellement
        | → polling détecte premium_unlocked = true
        v
[Jeu reprend normalement]
```

## Pré-requis : secrets à ajouter

Avant d'écrire le code, deux secrets Stripe doivent être configurés :
1. `STRIPE_SECRET_KEY` : clé secrète depuis le dashboard Stripe (commence par `sk_test_` ou `sk_live_`)
2. `STRIPE_WEBHOOK_SECRET` : secret du webhook (commence par `whsec_`) — obtenu après avoir créé l'endpoint webhook dans Stripe

Je demanderai ces secrets avec l'outil `add_secret` lors de l'implémentation.

## Fichiers à créer / modifier

### 1. `supabase/functions/create-checkout-session/index.ts` (CRÉER)

Edge function qui :
- Reçoit `{ roomId, playerName }` en POST
- Crée une session Stripe Checkout (mode `payment`, 3,99€)
- Passe `game_session_id` et `player_name` dans les métadonnées Stripe
- Les URLs de retour incluent `?premium=success` (succès) et `?premium=cancelled` (annulation)
- Retourne `{ url }` pour la redirection

Structure clé :
```typescript
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{ price_data: { currency: 'eur', unit_amount: 399, ... }, quantity: 1 }],
  mode: 'payment',
  success_url: `${origin}/?premium=success`,
  cancel_url: `${origin}/?premium=cancelled`,
  metadata: { game_session_id: roomId, player_name: playerName },
});
```

Note technique : utilise `verify_jwt = false` dans `config.toml` (pattern du projet), pas d'auth requise car le jeu n'a pas de comptes utilisateurs.

### 2. `supabase/functions/stripe-webhook/index.ts` (CRÉER)

Webhook Stripe qui :
- Vérifie la signature Stripe (`stripe.webhooks.constructEvent`)
- Sur `checkout.session.completed` :
  - Met à jour `game_sessions` : `premium_unlocked = true`, `premium_unlocked_by`, `premium_unlocked_at`, `stripe_payment_id`
  - Insère dans `payments` : statut `completed`, montants, IDs Stripe
- Utilise `SUPABASE_SERVICE_ROLE_KEY` pour écrire en base (contournement RLS non nécessaire ici car les policies sont publiques, mais c'est une bonne pratique pour les webhooks)
- Pas de CORS headers (appelé directement par Stripe, pas depuis le navigateur)

### 3. `supabase/config.toml` (MODIFIER)

Ajouter les entrées pour les deux nouvelles fonctions :
```toml
[functions.create-checkout-session]
verify_jwt = false

[functions.stripe-webhook]
verify_jwt = false
```

### 4. `src/components/PremiumPaywallScreen.tsx` (MODIFIER)

Remplacer la simulation `setTimeout` par un vrai appel à l'edge function :
```typescript
const handlePayment = async () => {
  setIsLoading(true);
  try {
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { roomId: currentRoomId, playerName }
    });
    if (error || !data?.url) throw new Error(error?.message || 'Erreur');
    window.location.href = data.url; // Redirection vers Stripe Checkout
  } catch (err: any) {
    toast.error('Erreur lors du paiement : ' + err.message);
    setIsLoading(false);
  }
  // Note: setIsLoading(false) non appelé après succès car on redirige
};
```

Import `supabase` et `toast` ajoutés au composant. La prop `currentRoomId` est déjà présente.

### 5. `src/pages/Index.tsx` (MODIFIER)

Gérer le retour depuis Stripe Checkout :
- Lire le paramètre URL `?premium=success` ou `?premium=cancelled` avec `useSearchParams` (déjà importé)
- Si `premium=success` : afficher un toast de succès et nettoyer l'URL
- Si `premium=cancelled` : afficher un toast d'info
- Le polling `waiting-premium` existant (toutes les 2s) détectera automatiquement `premium_unlocked = true`

```typescript
useEffect(() => {
  const premiumParam = searchParams.get('premium');
  if (premiumParam === 'success') {
    toast.success('🎉 Paiement réussi ! Le premium va être activé...');
    setSearchParams({}); // Nettoyer l'URL
  } else if (premiumParam === 'cancelled') {
    toast.info('Paiement annulé. Vous pouvez réessayer quand vous voulez.');
    setSearchParams({});
  }
}, []);
```

## Configuration webhook Stripe (instructions pour l'utilisateur)

Une fois les fonctions déployées, l'URL du webhook à configurer dans le dashboard Stripe sera :
```
https://soeaybmnzinytliqdzao.supabase.co/functions/v1/stripe-webhook
```
Événement à écouter : `checkout.session.completed`

## Ordre d'implémentation

1. Demander `STRIPE_SECRET_KEY` via `add_secret`
2. Demander `STRIPE_WEBHOOK_SECRET` via `add_secret`
3. Créer `supabase/functions/create-checkout-session/index.ts`
4. Créer `supabase/functions/stripe-webhook/index.ts`
5. Modifier `supabase/config.toml` pour les deux nouvelles fonctions
6. Modifier `PremiumPaywallScreen.tsx` pour appeler l'edge function
7. Modifier `Index.tsx` pour gérer le retour Stripe

## Note sur `@stripe/stripe-js`

Ce package n'est **pas nécessaire** pour notre implémentation. On utilise Stripe Checkout (redirection vers la page hébergée par Stripe), donc on n'a pas besoin du SDK JS Stripe côté client. La seule chose côté client est `window.location.href = data.url` pour la redirection. Cela simplifie l'implémentation.

## Résumé des fichiers

| Fichier | Action |
|---|---|
| `supabase/functions/create-checkout-session/index.ts` | Créer |
| `supabase/functions/stripe-webhook/index.ts` | Créer |
| `supabase/config.toml` | Modifier |
| `src/components/PremiumPaywallScreen.tsx` | Modifier (brancher sur l'edge function) |
| `src/pages/Index.tsx` | Modifier (gérer retour Stripe via URL params) |
