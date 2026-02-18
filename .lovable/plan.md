
# Création de PremiumPaywallScreen.tsx

## Objectif

Créer un écran de paywall marketing ultra-optimisé pour la conversion, en suivant exactement les spécifications du brief. Le composant sera autonome, réutilisable, et préparé pour l'intégration Stripe au prochain prompt.

## Structure du composant

### Props

```typescript
interface PremiumPaywallScreenProps {
  playerName: string;
  partnerName: string;
  answeredQuestionsCount: number;
  remainingQuestionsCount: number;
  currentRoomId: string;
  onPaymentSuccess: () => void;
  onDismiss?: () => void;
}
```

`onDismiss` est ajouté (optionnel) pour permettre le bouton "Peut-être plus tard" de revenir en arrière — le parent décide quoi faire.

### Architecture des sections (du haut vers le bas)

```text
┌─────────────────────────────┐
│  FloatingHearts (bg anim)   │
│  ┌─────────────────────┐    │
│  │  HEADER             │    │
│  │  🔓 Continuez...    │    │
│  │  Ne vous arrêtez... │    │
│  ├─────────────────────┤    │
│  │  PREUVE SOCIALE     │    │
│  │  ✨ X moments       │    │
│  ├─────────────────────┤    │
│  │  BÉNÉFICES          │    │
│  │  ✓ X questions      │    │
│  │  ✓ Niveaux 3,4,5    │    │
│  │  ✓ Actions spécial  │    │
│  │  ✓ Historique       │    │
│  ├─────────────────────┤    │
│  │  ANCRAGE PRIX       │    │
│  │  💝 Prix d'un café  │    │
│  │  3,99€ (~~9,99~~)   │    │
│  ├─────────────────────┤    │
│  │  CTA PRINCIPAL      │    │
│  │  [Débloquer - 3,99] │    │
│  ├─────────────────────┤    │
│  │  RÉASSURANCE        │    │
│  │  🔐 Paiement Stripe │    │
│  │  Satisfait/remboursé│    │
│  ├─────────────────────┤    │
│  │  Peut-être plus tard│    │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

## Détails d'implémentation

### Animations (framer-motion)

- **Entrée du composant** : `motion.div` avec `initial={{ opacity: 0, y: 20 }}` → `animate={{ opacity: 1, y: 0 }}`, durée 0.5s
- **Bouton CTA** : `whileHover={{ scale: 1.02 }}`, `whileTap={{ scale: 0.98 }}`
- **Badge preuve sociale** : `initial={{ scale: 0.9 }}` → `animate={{ scale: 1 }}` avec un léger delay

### Icône Lock → Heart au hover

L'état local `isHovering` bascule entre `<Lock />` et `<Heart />` au survol du bouton CTA grâce à `onMouseEnter` / `onMouseLeave`.

### État loading

```typescript
const [isLoading, setIsLoading] = useState(false);

const handlePayment = async () => {
  setIsLoading(true);
  // Pour l'instant : simulation courte puis callback
  await new Promise(resolve => setTimeout(resolve, 800));
  onPaymentSuccess();
  setIsLoading(false);
};
```

Pendant le loading : spinner `animate-spin` + texte "Traitement en cours..." + bouton désactivé.

### Styling clé

- **Fond** : `min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200`
- **Card** : `shadow-2xl bg-white/90 backdrop-blur-sm border-rose-200 max-w-md w-full`
- **Bouton CTA** : `bg-gradient-to-r from-rose-500 to-pink-600 text-white py-4 px-8 rounded-xl text-lg font-bold`
- **Badge preuve sociale** : `bg-gradient-to-r from-rose-100 to-pink-100 border border-rose-200 rounded-full px-4 py-2`
- **Prix barré** : `line-through text-muted-foreground text-sm`
- **Prix principal** : `text-4xl font-black text-rose-700`
- **Checkmarks** : couleur `text-rose-500` pour chaque item bénéfice

### Icônes lucide-react utilisées

- `Lock` / `Heart` — bouton CTA (toggle au hover)
- `Check` — items bénéfices
- `Shield` — section réassurance
- `Star` — badge preuve sociale (optionnel)

## Fichier à créer

- `src/components/PremiumPaywallScreen.tsx` — composant complet, autonome

## Aucune modification d'autres fichiers dans ce prompt

L'intégration dans `Index.tsx` (déclenchement du paywall au bon moment) et l'intégration Stripe seront traitées dans les prochains prompts, comme prévu.
