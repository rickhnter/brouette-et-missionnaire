
# Intégration du système premium dans Index.tsx

## Analyse de l'existant

Le fichier `Index.tsx` fait 939 lignes avec une architecture claire :
- Type union `GameState` à la ligne 27-39
- Effets `useEffect` organisés par responsabilité (realtime, auto-start, transitions)
- Rendu conditionnel séquentiel à partir de la ligne 659

### Points d'attention identifiés

1. **`answeredQuestionsCount`** existe déjà (ligne 66) comme `useRef`, mais il compte les questions répondues depuis le début de la session en cours (non persistées). Il faut une valeur distincte issue de la base de données pour l'affichage dans le paywall.

2. **`async` dans le rendu** : le brief propose `await calculateAnsweredQuestions()` directement dans le bloc `if (gameState === 'premium-paywall')`. Cela ne fonctionne pas dans un composant React synchrone. On utilisera un `useState` pour stocker `answeredCountForPaywall` et on le chargera dans un `useEffect`.

3. **Déclenchement du paywall** : deux moments distincts :
   - Quand `currentRoom.current_level >= 3` et `!premium_unlocked` (détecté via `useEffect` sur `currentRoom`)
   - Quand la question courante est de niveau 3+ sans premium (garde dans le rendu de `QuestionScreen`)

4. **Polling** : le projet utilise déjà `setInterval` avec `2000ms` pour les events (lignes 314-315). On suit le même pattern pour `waiting-premium`.

5. **Toast** : le projet utilise `sonner` (importé via `@/components/ui/sonner`). On importe `toast` depuis `sonner`.

6. **`useCallback`** : `calculateAnsweredQuestions` et `handlePaymentSuccess` devront utiliser `useCallback` avec les bonnes dépendances pour être stables.

## Modifications à apporter

### 1. Imports (lignes 1-23)

Ajouter :
- `useCallback` dans l'import React existant (ligne 1)
- `import { PremiumPaywallScreen } from '@/components/PremiumPaywallScreen';`
- `import { WaitingForPremiumScreen } from '@/components/WaitingForPremiumScreen';`
- `import { toast } from 'sonner';`

### 2. Type `GameState` (lignes 27-39)

Étendre l'union avec :
```
| 'premium-paywall'
| 'waiting-premium'
```

### 3. État local (après ligne 66)

Ajouter un état pour le count affiché dans le paywall :
```typescript
const [answeredCountForPaywall, setAnsweredCountForPaywall] = useState(0);
```

### 4. Nouveau `useEffect` — chargement du count au moment du paywall

Ce `useEffect` se déclenche quand `gameState` passe à `'premium-paywall'` :
```typescript
useEffect(() => {
  if (gameState !== 'premium-paywall' || !currentRoom?.id) return;
  supabase
    .from('answers')
    .select('question_id')
    .eq('session_id', currentRoom.id)
    .then(({ data }) => {
      if (data) {
        const unique = new Set(data.map(a => a.question_id));
        setAnsweredCountForPaywall(unique.size);
      }
    });
}, [gameState, currentRoom?.id]);
```

### 5. Calcul des questions restantes (helper pur)

Fonction utilitaire **non-async**, calculée à partir du tableau `questions` déjà chargé :
```typescript
const calculateRemainingQuestions = useCallback(() => {
  return questions.filter(q => q.level >= 3).length;
}, [questions]);
```

### 6. Handler `handlePaymentSuccess`

Met à jour `game_sessions` avec `premium_unlocked = true`, puis revient à `'question'` :
```typescript
const handlePaymentSuccess = useCallback(async () => {
  if (!currentRoom || !playerName) return;
  const { error } = await supabase
    .from('game_sessions')
    .update({
      premium_unlocked: true,
      premium_unlocked_by: playerName,
      premium_unlocked_at: new Date().toISOString()
    })
    .eq('id', currentRoom.id);
  if (!error) {
    toast.success('🎉 Premium débloqué ! Profitez de toutes les questions !');
    setGameState('question');
  }
}, [currentRoom, playerName]);
```

### 7. `useEffect` — détection du niveau 3 sans premium

Placé après les effets existants, avec des dépendances précises. 

**Logique importante** : ne déclencher le paywall QUE si l'état de jeu est en cours de partie (states pertinents : `'question'`, `'waiting-partner'`, `'reveal'`), pour éviter de surcharger les états d'événements ou d'historique.

```typescript
useEffect(() => {
  if (!currentRoom || !playerName) return;
  if (!currentRoom.current_level || currentRoom.current_level < 3) return;
  if (currentRoom.premium_unlocked) return;

  // Only intercept during active gameplay states
  const activeGameStates: GameState[] = ['question', 'waiting-partner', 'reveal'];
  if (!gameState || !activeGameStates.includes(gameState)) return;

  if (playerName === currentRoom.player1_name) {
    setGameState('premium-paywall');
  } else {
    setGameState('waiting-premium');
  }
}, [currentRoom?.current_level, currentRoom?.premium_unlocked, playerName, gameState]);
```

### 8. `useEffect` — polling pour `'waiting-premium'`

Pattern identique au polling des events (ligne 314) :
```typescript
useEffect(() => {
  if (gameState !== 'waiting-premium' || !currentRoom?.id) return;

  const checkPremiumUnlocked = async () => {
    const { data } = await supabase
      .from('game_sessions')
      .select('premium_unlocked')
      .eq('id', currentRoom.id)
      .maybeSingle();
    if (data?.premium_unlocked) {
      toast.success('🎉 Premium débloqué ! Continuons le jeu !');
      setGameState('question');
    }
  };

  const interval = setInterval(checkPremiumUnlocked, 2000);
  return () => clearInterval(interval);
}, [gameState, currentRoom?.id]);
```

Note : utilisation de `.maybeSingle()` plutôt que `.single()` (convention du projet).

### 9. Garde dans le rendu de `QuestionScreen` (ligne 771)

Avant le bloc `if (gameState === 'question' ...)`, ajouter une garde :
```typescript
if (gameState === 'question' && currentQuestion && currentQuestion.level >= 3 
    && currentRoom && !currentRoom.premium_unlocked && !currentEventId) {
  if (playerName === currentRoom.player1_name) {
    setGameState('premium-paywall');
  } else {
    setGameState('waiting-premium');
  }
  return null;
}
```

**Attention** : Ce bloc doit être placé **avant** le bloc `if (gameState === 'question' && currentQuestion && !currentEventId)` existant.

### 10. Rendu conditionnel des nouveaux états (avant le `return null` final)

```typescript
if (gameState === 'premium-paywall' && currentRoom && playerName && partnerName) {
  return (
    <>
      <GameNavigation 
        playerName={playerName} 
        onShowHistory={handleShowHistory} 
        onLogout={handleLogout} 
      />
      <PremiumPaywallScreen
        playerName={playerName}
        partnerName={partnerName}
        answeredQuestionsCount={answeredCountForPaywall}
        remainingQuestionsCount={calculateRemainingQuestions()}
        currentRoomId={currentRoom.id}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
}

if (gameState === 'waiting-premium' && currentRoom && playerName) {
  return (
    <>
      <GameNavigation 
        playerName={playerName} 
        onShowHistory={handleShowHistory} 
        onLogout={handleLogout} 
      />
      <WaitingForPremiumScreen
        creatorName={currentRoom.player1_name}
        partnerName={playerName}
      />
    </>
  );
}
```

## Résumé des fichiers modifiés

| Fichier | Action |
|---|---|
| `src/pages/Index.tsx` | Modifier — ajouter imports, types, états, effets et rendus |

## Ordre d'insertion des modifications

1. Imports (ligne ~1)
2. Type `GameState` (ligne ~27)
3. État `answeredCountForPaywall` (après ligne 66)
4. `useEffect` chargement count paywall (après l'effet ligne 336)
5. `handlePaymentSuccess` (près des handlers existants, après ligne 651)
6. `useEffect` détection niveau 3 (après les effets de notifications, ~ligne 440)
7. `useEffect` polling waiting-premium (après le précédent)
8. Garde dans le rendu (avant ligne 771)
9. Rendus conditionnels (avant le `return null` ligne 936)
