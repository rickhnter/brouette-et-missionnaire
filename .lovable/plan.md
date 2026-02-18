
# Création de WaitingForPremiumScreen.tsx

## Objectif

Créer un écran simple et rassurant que voit le joueur 2 pendant que le créateur de la room débloque le premium. L'écran est purement informatif, sans interaction — le polling pour détecter `premium_unlocked` se fera dans `Index.tsx`.

## Fichier à créer

`src/components/WaitingForPremiumScreen.tsx`

## Pattern suivi

Le composant reprend exactement le même pattern que `WaitingForPartner.tsx` :
- Fond : `min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200`
- Card : `w-full max-w-md bg-white/80 backdrop-blur-sm border-rose-200 shadow-xl`
- Animations `framer-motion`
- Contenu centré avec `text-center`

## Structure du composant

### Props

```typescript
interface WaitingForPremiumScreenProps {
  creatorName: string;
  partnerName: string;
}
```

### Sections (de haut en bas)

```text
┌─────────────────────────────────┐
│  bg gradient rose               │
│  ┌───────────────────────────┐  │
│  │  Icône centrale animée 🔒 │  │
│  │  (pulse/rotate lent)      │  │
│  ├───────────────────────────┤  │
│  │  Titre principal          │  │
│  │  "{creatorName} complète  │  │
│  │   une action"             │  │
│  ├───────────────────────────┤  │
│  │  Message explicatif       │  │
│  │  "Pour continuer le jeu,  │  │
│  │  {creatorName} doit       │  │
│  │  débloquer les prochains  │  │
│  │  niveaux."                │  │
│  ├───────────────────────────┤  │
│  │  Loader animé (Loader2)   │  │
│  │  rose-500, animate-spin   │  │
│  ├───────────────────────────┤  │
│  │  Réassurance              │  │
│  │  "Vous serez notifié(e)   │  │
│  │   dès que ce sera fait 💝"│  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

## Détails d'implémentation

### Animation de l'icône 🔒

Utiliser `framer-motion` avec un `motion.div` animé en `scale` pulsant (comme les cercles concentriques dans `WaitingForPartner`), mais avec les mêmes cercles concentriques rose → pink autour de l'emoji 🔒 centré pour garder la cohérence visuelle.

```typescript
// Cercles concentriques pulsants (repris de WaitingForPartner)
<motion.div
  className="absolute inset-0 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full"
  animate={{ scale: [1, 1.1, 1] }}
  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
/>
// + inset-4 et inset-8 avec delays 0.2 et 0.4
// Au centre : emoji 🔒 en text-4xl
```

### Loader Loader2

```typescript
import { Loader2 } from 'lucide-react';

<Loader2 className="h-8 w-8 text-rose-500 animate-spin mx-auto" />
```

### Apparition avec framer-motion

```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: 'easeOut' }}
>
```

## Typage des props

```typescript
interface WaitingForPremiumScreenProps {
  creatorName: string;
  partnerName: string;   // disponible pour une personnalisation future ("Bonjour {partnerName}")
}
```

## Aucune modification d'autres fichiers dans ce prompt

L'intégration dans `Index.tsx` (déclenchement de cet écran + polling `premium_unlocked`) sera gérée dans un prompt séparé.

## Fichier à créer

| Fichier | Action |
|---|---|
| `src/components/WaitingForPremiumScreen.tsx` | Créer |
