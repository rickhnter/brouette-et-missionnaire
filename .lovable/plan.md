
# Stratégie de synchronisation — Diagnostic complet et plan de correction

## Diagnostic des 3 problèmes rapportés

### Problème 1 : "On reprend et on reparcourt toutes les questions"

**Cause racine** : Quand on reprend la partie (`resumeRoom`), le `useEffect` de restauration d'état (lignes 241-259 de Index.tsx) contient cette logique :

```typescript
if (playerAnswered && partnerAnswered) {
  setGameState('reveal');
} else if (playerAnswered && !partnerAnswered) {
  setGameState('waiting-partner');
} else {
  setGameState('question');  // ← TOUJOURS atteint car useAnswers prend du temps à charger
}
```

Le problème : `useAnswers` est **asynchrone**. Au moment où ce `useEffect` s'exécute, `playerAnswered` et `partnerAnswered` sont `false` (les réponses n'ont pas encore été chargées depuis la base). Il part donc toujours en `'question'` — mais la question actuelle est correcte (elle vient de `current_question_id` en BDD). Ce n'est pas le problème.

**Vrai problème** : `answeredQuestionsCount.current` est remis à 0 à chaque reprise. Cette valeur locale contrôle le déclenchement des événements via `shouldTriggerEvent`. Elle est réinitialisée via `initializeAnsweredCount` (lignes 354-371), mais ce code compte les questions **avec au moins une réponse** — pas les questions complètes. Si le partenaire n'a pas répondu à toutes, le compte peut être faux.

**Deuxième vrai problème — le plus grave** : Dans `getNextQuestion` (useQuestions.ts ligne 64-66), si `currentQuestionId` n'est pas trouvé dans la liste locale `questions[]` (race condition entre realtime et chargement des questions), il retourne la **première question** du jeu. Cela provoque un retour au début.

### Problème 2 : "L'action récupère les réponses d'une action précédente"

**Cause racine** : `useGameEvents` stocke `responses` dans un state React global pour la session entière. Il n'est **jamais réinitialisé** entre événements sauf lors d'un appel explicite à `resetResponses()`. Or :

1. `fetchResponses(eventId)` fait un **merge** des réponses (ligne 77-88 de useGameEvents.ts) mais ne filtre **jamais** par `eventId` dans le state — il ajoute tout. Résultat : `responses` accumule les réponses de TOUS les événements passés.

2. `hasPlayerResponded(eventId, playerName)` et `hasPartnerResponded(eventId, playerName)` filtrent bien par `eventId`. MAIS `getPlayerResponse` et `getPartnerResponse` font `responses.find(r => r.event_id === eventId && ...)` — correct en principe.

3. Le vrai bug : Quand le realtime reçoit une INSERT sur `event_responses`, il l'ajoute dans `responses` **sans vérifier si c'est l'événement courant**. Si un ancien événement avait une réponse qui arrive en retard via realtime, elle s'ajoute et peut fausser les comptages.

4. **Pire** : `fetchResponses` est appelé sans `eventId` — il prend l'`eventId` en paramètre mais le state `responses` n'est jamais vidé avant un nouveau fetch pour un nouvel événement. La résiduelle des anciennes réponses reste.

### Problème 3 : "L'autre joueur saute une question et les réponses sont mélangées"

**Cause racine** : Dans `useAnswers`, `getPartnerAnswer(playerName)` est défini comme :
```typescript
return answers.find(a => a.player_name !== playerName);
```

Si la question change (partenaire avance) mais que `answers` n'est pas encore rafraîchi, cette fonction peut retourner une réponse de l'ancienne question. Plus précisément :

- Le partenaire répond et appelle `handleNextQuestion` qui met à jour `current_question_id` en BDD.
- Le realtime déclenche la mise à jour de `currentRoom` avec le nouveau `current_question_id`.
- `useAnswers` devrait se réinitialiser (via `useEffect` sur `questionId`), mais il y a un délai.
- Si `answers` contient encore les réponses de l'ancienne question quand `playerAnswered && partnerAnswered` est évalué, on se retrouve en `reveal` avec les mauvaises réponses — ou pire, on passe à la question suivante sans que l'autre ait répondu.

**Root cause complémentaire** : Le réinitialisateur de `answers` dans `useAnswers` fait `setAnswers([])` puis `fetchAnswers()`, mais si la question change rapidement (race condition), le state peut contenir temporairement des réponses mixtes.

---

## Solution : 4 corrections précises

### Correction 1 — `useAnswers.ts` : Filtrage strict par `question_id` dans le state

**Problème** : Le state `answers` peut contenir des réponses d'autres questions (race condition + realtime).

**Fix** : Toujours filtrer le state par `questionId` courant avant d'exposer les données. Ajouter une protection dans `submitAnswer` pour s'assurer qu'on ne soumet une réponse qu'à la question **actuellement active** en BDD.

```typescript
// Dans getPlayerAnswer et getPartnerAnswer, filtrer aussi par question_id
const getPlayerAnswer = (playerName: string) => {
  return answers.find(a => a.player_name === playerName && a.question_id === questionId);
};
const getPartnerAnswer = (playerName: string) => {
  return answers.find(a => a.player_name !== playerName && a.question_id === questionId);
};
```

Et dans les computed values du state :
```typescript
const playerAnswered = playerName 
  ? answers.some(a => a.player_name === playerName && a.question_id === currentRoom?.current_question_id) 
  : false;
```

### Correction 2 — `useGameEvents.ts` : Isolation des réponses par événement courant

**Problème** : Le state `responses` accumule toutes les réponses d'événements passés.

**Fix** : 
1. Ajouter `currentEventId` comme param à `useGameEvents` pour filtrer le state automatiquement.
2. Réinitialiser `responses` à chaque changement d'`eventId` actif (via `useEffect`).
3. Dans `fetchResponses`, remplacer la stratégie de merge par un remplacement propre filtré par `eventId`.

```typescript
// Dans le hook, réinitialiser responses quand l'événement change
useEffect(() => {
  setResponses([]);
}, [currentEventId]); // currentEventId passé en paramètre
```

### Correction 3 — `Index.tsx` : Restauration d'état fiable au resume/refresh

**Problème** : L'état est restauré avant que les réponses soient chargées, résultant toujours en `gameState('question')`.

**Fix** : Séparer la restauration d'état en deux phases :
1. Phase 1 (immédiate) : Récupérer `current_question_id` et `current_event_id` depuis la room.
2. Phase 2 (après chargement des réponses) : Corriger le `gameState` en fonction des réponses réelles.

Nouveau `useEffect` de "stabilisation post-chargement" :
```typescript
// Quand les réponses sont chargées ET qu'on est en état 'question' mais 
// les deux joueurs ont déjà répondu → restaurer 'reveal'
useEffect(() => {
  if (gameState !== 'question') return;
  if (!currentRoom?.current_question_id || !playerName) return;
  if (answers.length < 2) return; // Attendre que les réponses soient chargées
  
  if (playerAnswered && partnerAnswered) {
    // Les deux ont répondu : aller directement au reveal
    const playerAns = getPlayerAnswer(playerName);
    const partnerAns = getPartnerAnswer(playerName);
    if (currentQuestion && playerAns && partnerAns) {
      setRevealData({ ... });
      setGameState('reveal');
    }
  } else if (playerAnswered && !partnerAnswered) {
    setGameState('waiting-partner');
  }
}, [answers, gameState]);
```

### Correction 4 — `Index.tsx` : Protection contre les sauts de question

**Problème** : `handleNextQuestion` peut être appelé avant que les deux joueurs aient répondu.

**Fix** : La condition `if (!playerAnswered || !partnerAnswered) return;` existe déjà (ligne 631), mais elle utilise les variables locales potentiellement périmées. Ajouter une **vérification BDD en temps réel** avant d'avancer :

```typescript
const handleNextQuestion = async () => {
  if (!currentRoom?.current_level || !currentRoom?.current_question_id) return;
  
  // Double-check : relire les réponses depuis la BDD avant d'avancer
  const { data: freshAnswers } = await supabase
    .from('answers')
    .select('player_name')
    .eq('session_id', currentRoom.id)
    .eq('question_id', currentRoom.current_question_id);
  
  const freshPlayerAnswered = freshAnswers?.some(a => a.player_name === playerName);
  const freshPartnerAnswered = freshAnswers?.some(a => a.player_name !== playerName);
  
  if (!freshPlayerAnswered || !freshPartnerAnswered) {
    console.warn('[Sync] handleNextQuestion bloqué — partenaire pas encore répondu');
    return;
  }
  
  // ... rest of the function
};
```

---

## Résumé des fichiers à modifier

| Fichier | Changement |
|---|---|
| `src/hooks/useAnswers.ts` | Filtrage strict par `question_id` dans `getPlayerAnswer`, `getPartnerAnswer` + double-check avant submit |
| `src/hooks/useGameEvents.ts` | Réinitialisation automatique de `responses` au changement d'événement + isolation des réponses |
| `src/pages/Index.tsx` | Restauration d'état post-chargement réponses + double-check BDD dans `handleNextQuestion` + correction du filtrage `playerAnswered`/`partnerAnswered` |

## Ordre d'implémentation

1. Corriger `useAnswers.ts` (filtre question_id)
2. Corriger `useGameEvents.ts` (isolation par eventId)
3. Corriger `Index.tsx` (restauration, double-check, filtrage)

## Ce qui n'est PAS dans ce plan

- Aucune migration de BDD requise — tous les bugs sont logiques, pas de schéma manquant
- Aucune modification de l'architecture — on corrige les bugs dans les hooks existants
- Le système Realtime reste en place — on l'améliore, on ne le remplace pas
