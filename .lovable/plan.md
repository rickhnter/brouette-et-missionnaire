
## Mise à jour du prix à 3,99 € + stratégie de stockage du statut de paiement

### 1. Correction du prix (3 fichiers)

**`supabase/functions/create-checkout-session/index.ts`**
- `unit_amount: 199` → `unit_amount: 399` (3,99€ en centimes)

**`src/lib/premiumUtils.ts`**
- `getPremiumPrice()` retourne `"1,99€"` → `"3,99€"`
- `getPremiumPriceInCents()` retourne `199` → `399`

**`src/components/PremiumPaywallScreen.tsx`**
- Affichage du prix : `1,99€` → `3,99€`
- Prix barré : `4,99€` → `6,99€` (pour maintenir la cohérence marketing)
- Utiliser `getPremiumPrice()` depuis `premiumUtils.ts` pour centraliser

---

### 2. Stratégie de stockage du statut de paiement

Le schéma actuel est déjà bien pensé. Voici l'architecture en place et les améliorations proposées :

**Ce qui existe déjà (et qu'on garde) :**

```text
game_sessions
  ├── premium_unlocked       boolean  (source de vérité pour le jeu)
  ├── premium_unlocked_by    text     (nom du joueur payeur)
  ├── premium_unlocked_at    timestamp
  └── stripe_payment_id      text     (payment_intent Stripe)

payments (table de log)
  ├── session_id             uuid     (lien vers la game_session)
  ├── stripe_session_id      text
  ├── stripe_payment_intent_id text
  ├── amount                 integer  (en centimes)
  ├── currency               text
  ├── status                 text     ('pending' | 'completed')
  ├── player_name            text
  ├── created_at
  └── completed_at
```

**Problème identifié — double source de vérité incohérente :**

Actuellement `getPremiumPriceInCents()` retourne `399` dans `premiumUtils.ts` mais l'edge function envoie `199` à Stripe. Après la mise à jour, tout sera aligné sur `399`.

**Problème identifié — le fallback dans le webhook :**

```ts
amount: session.amount_total || 399
```

`session.amount_total` est toujours renvoyé par Stripe pour un paiement réussi, donc ce fallback ne sert qu'en cas d'erreur. On le mettra à jour à `399` aussi par cohérence.

**Ce qui fonctionne correctement :**

1. **Flux principal** : Stripe Checkout → webhook → `game_sessions.premium_unlocked = true` + insert dans `payments`
2. **Sécurité** : la mise à jour se fait côté serveur (edge function avec `SUPABASE_SERVICE_ROLE_KEY`), pas côté client
3. **Sync temps réel** : `Index.tsx` fait un polling de la room toutes les 2s pour détecter le déblocage premium pour le partenaire
4. **Redirection post-paiement** : `?premium=success` dans l'URL force un re-fetch immédiat

**Recommandation architecture (pas de changement de schema nécessaire) :**

La structure actuelle est robuste. Le seul vrai risque est un webhook qui échoue après le paiement Stripe (ex: timeout). Pour y remédier à l'avenir (hors scope de ce ticket) on pourrait ajouter une vérification côté client du `stripe_session_id` via l'API Stripe, mais c'est facultatif car le webhook Stripe réessaie automatiquement en cas d'échec.

---

### Résumé des changements

| Fichier | Changement |
|---|---|
| `supabase/functions/create-checkout-session/index.ts` | `unit_amount: 199` → `399` |
| `src/lib/premiumUtils.ts` | Prix affiché et en centimes → 3,99€ / 399 |
| `src/components/PremiumPaywallScreen.tsx` | Affichage `1,99€` → `3,99€`, prix barré `4,99€` → `6,99€`, import `getPremiumPrice` |
| `supabase/functions/stripe-webhook/index.ts` | Fallback `amount || 399` déjà correct, aucun changement |

L'edge function sera redéployée automatiquement après la modification.
