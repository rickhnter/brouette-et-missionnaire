
# Finaliser l'intégration premium — analyse et corrections

## État actuel (déjà implémenté)

Après lecture complète du code, la majorité des éléments sont déjà en place :

- `PremiumPaywallScreen.tsx` appelle déjà `create-checkout-session` et redirige vers `window.location.href = data.url`. ✅
- `Index.tsx` gère déjà `?premium=success` et `?premium=cancelled` via `useSearchParams` (lignes 142-153). ✅
- Les états `premium-paywall` et `waiting-premium` et leurs rendus sont en place (lignes 1041-1075). ✅
- Le `useEffect` de détection niveau 3 sans premium est actif (lignes 477-491). ✅
- Le polling du joueur en attente est actif (lignes 493-511). ✅

## Problèmes identifiés

### 1. Anti-pattern : `setGameState` appelé pendant le rendu (ligne 866-874)

```typescript
// PROBLÈME — appel de setGameState dans le corps du rendu
if (gameState === 'question' && currentQuestion && currentQuestion.level >= 3
    && currentRoom && !currentRoom.premium_unlocked && !currentEventId) {
  if (playerName === currentRoom.player1_name) {
    setGameState('premium-paywall'); // ← INTERDIT dans le rendu
  } else {
    setGameState('waiting-premium');
  }
  return null;
}
```

React interdit de mettre à jour l'état pendant le rendu. Le `useEffect` à la ligne 477 gère déjà cette détection correctement. **Ce bloc doit être supprimé** — il est redondant et provoque des warnings/comportements indéfinis.

### 2. `LevelSelection.tsx` n'a pas de protection visuelle premium

Ce composant affiche les niveaux 1-5 mais n'est pas encore importé dans `Index.tsx`. Il faut :
- Ajouter une prop `isPremium?: boolean`
- Afficher un cadenas 🔒 et badge "Premium" sur les niveaux 3-5 quand non débloqué
- Désactiver le clic sur ces niveaux (le composant n'est pas encore utilisé dans le flux principal, mais il peut l'être à l'avenir)

### 3. Fichier `src/lib/premiumUtils.ts` manquant

Le helper utilitaire demandé n'existe pas encore.

### 4. Logs de debug manquants

Aucun `console.log` stratégique dans les chemins critiques.

## Modifications à apporter

### Fichier 1 : `src/pages/Index.tsx`

**Supprimer le bloc render-guard (lignes 865-874)** — le `useEffect` existant (ligne 477) gère déjà la transition vers `premium-paywall` / `waiting-premium` quand `current_level >= 3` et `!premium_unlocked`. Supprimer le bloc redondant élimine l'anti-pattern.

**Ajouter des logs de debug** à 3 endroits :
- Quand le `useEffect` de détection premium se déclenche (ligne 478)
- Quand le polling détecte `premium_unlocked = true` (ligne 503)
- Quand le retour Stripe est détecté (ligne 144)

**Améliorer le `useEffect` de retour Stripe** : après `?premium=success`, forcer un re-fetch de la room pour détecter `premium_unlocked` immédiatement sans attendre le prochain cycle du polling :

```typescript
useEffect(() => {
  const premiumParam = searchParams.get('premium');
  if (premiumParam === 'success') {
    console.log('[Premium] Retour Stripe — succès détecté');
    toast.success('🎉 Paiement réussi ! Le premium est en cours d\'activation...');
    setSearchParams({});
    // Force un re-fetch immédiat de la room si on est dans une session active
    if (currentRoom?.id) {
      supabase
        .from('game_sessions')
        .select('*')
        .eq('id', currentRoom.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setCurrentRoom(data as Room);
        });
    }
  } else if (premiumParam === 'cancelled') {
    console.log('[Premium] Retour Stripe — annulation');
    toast.info('Paiement annulé. Vous pouvez réessayer quand vous voulez.');
    setSearchParams({});
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

Note : `currentRoom` n'est pas dans les dépendances intentionnellement (effet de montage uniquement).

### Fichier 2 : `src/lib/premiumUtils.ts` (CRÉER)

```typescript
import { Room } from '@/hooks/useRoom';

export const isPremiumUnlocked = (room: Room | null): boolean => {
  return room?.premium_unlocked === true;
};

export const canAccessLevel = (level: number, room: Room | null): boolean => {
  if (level <= 2) return true;
  return isPremiumUnlocked(room);
};

export const getPremiumPrice = (): string => {
  return '3,99€';
};

export const getPremiumPriceInCents = (): number => {
  return 399;
};
```

### Fichier 3 : `src/components/LevelSelection.tsx` (MODIFIER)

Ajouter la prop `isPremium` et l'affichage visuel :

- Prop `isPremium?: boolean` (optionnelle, défaut `false`)
- Import `Lock` depuis `lucide-react`
- Les niveaux 3-5 : si `!isPremium`, désactiver le bouton + afficher un cadenas à droite + badge rose "Premium" au lieu de "Bientôt"
- Les niveaux 3-5 : si `isPremium`, comportement normal (pas de désactivation)
- Les niveaux 1-2 : comportement inchangé

## Résumé des fichiers

| Fichier | Action | Impact |
|---|---|---|
| `src/pages/Index.tsx` | Supprimer le render-guard + ajouter logs + améliorer retour Stripe | Correction anti-pattern React |
| `src/lib/premiumUtils.ts` | Créer le helper utilitaire | Nouveau fichier |
| `src/components/LevelSelection.tsx` | Ajouter protection visuelle premium | UI/UX |

## Ordre d'implémentation

1. Créer `src/lib/premiumUtils.ts`
2. Modifier `src/components/LevelSelection.tsx` (ajouter `isPremium` prop + UI)
3. Modifier `src/pages/Index.tsx` (supprimer render-guard, améliorer retour Stripe, ajouter logs)

## Note sur `@stripe/stripe-js`

Ce package **n'est pas nécessaire** pour notre flux (Stripe Checkout avec redirection). La ligne `window.location.href = data.url` dans `PremiumPaywallScreen.tsx` est suffisante. Ne pas installer ce package inutilement.

## Note sur `getNextQuestion` et `isPremium`

La protection est correctement assurée par le `useEffect` de détection (ligne 477-491) : dès que `current_level >= 3` et `!premium_unlocked`, l'état passe à `premium-paywall` ou `waiting-premium`, empêchant toute interaction avec les questions. Modifier la signature de `getNextQuestion` pour ajouter `isPremium` serait une duplication défensive non nécessaire qui risquerait de casser les appels existants.
