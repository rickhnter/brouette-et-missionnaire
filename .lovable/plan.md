
# Correction de l'ecran blanc lors d'une suggestion ou suppression de question

## Cause racine identifiee

Le probleme se produit dans deux cas lies :

**Cas 1 - Suppression admin en direct** (le plus probable d'apres les logs) :
Dans `Questions.tsx`, la fonction `handleDelete` (ligne 439-464) fait d'abord un `UPDATE` sur `game_sessions` pour mettre `current_question_id = null` quand la question active est supprimee. Le Realtime envoie aussitot cette mise a jour a Daisy. Dans `Index.tsx`, `currentQuestion` devient `null`, et la condition ligne 730 `if (gameState === 'question' && currentQuestion && ...)` ne matche plus. L'app tombe sur `return null` (ligne 878) → ecran blanc.

**Cas 2 - Suggestion en cours / etat instable** :
Quand une joueuse soumet une suggestion pendant le jeu (`SuggestionModal`), si le `gameState` est `'question'` mais que `currentQuestion` est temporairement `null` (chargement, race condition), le meme `return null` se produit.

## La vraie cause confirme par les logs reseau

On voit clairement dans les network requests :
- Plusieurs `PATCH` sur `game_sessions` changeant `current_question_id` (avancement de questions tres rapide, ~1 par seconde)
- Puis la session se trouve sur `question_id = b16ae68e` sans avancer : le polling `answers` tourne en boucle pendant plus de 20 secondes sans transition → **ecran de chargement/blanc pour le second joueur**

## Solutions a implementer

### 1. Ecran de secours ("fallback") dans Index.tsx

Remplacer le `return null` final (ligne 878) par un ecran de chargement/erreur avec un bouton "Actualiser" qui permet de sortir de l'etat bloque.

Ce fallback s'affiche quand :
- `gameState === 'question'` mais `currentQuestion === null` (question supprimee ou non chargee)
- Tout autre etat inconnu

### 2. Gestion du `current_question_id = null` en cours de partie

Quand le Realtime recoit une mise a jour de la session avec `current_question_id = null` alors que la partie est en cours (`status === 'playing'`), au lieu d'afficher un ecran blanc, le jeu doit avancer automatiquement vers la question suivante disponible.

Dans le `useEffect` du Realtime (ligne 140-161 d'Index.tsx), detecter ce cas et appeler `proceedToNextQuestion()`.

### 3. Protection dans Questions.tsx (panneau admin)

Quand une question est supprimee depuis le panneau admin, au lieu de mettre `current_question_id = null`, chercher la **question suivante** disponible et l'assigner directement. Ainsi, les joueurs passent automatiquement a la question suivante sans ecran blanc.

```text
Avant (Questions.tsx handleDelete) :
  UPDATE game_sessions SET current_question_id = null WHERE current_question_id = id_supprime

Apres :
  1. Trouver la question suivante dans l'ordre (sort_order > question.sort_order, meme niveau ou superieur)
  2. UPDATE game_sessions SET current_question_id = id_suivante WHERE current_question_id = id_supprime
  3. Si pas de question suivante : UPDATE avec null (cas extreme)
```

### 4. Protection dans SuggestionModal

La `SuggestionModal` insere dans `questions` avec `sort_order = 9999`. Cela ne cause pas d'ecran blanc directement, mais peut creer une confusion si la suggestion est visible dans le jeu immediatement. Pas de changement necessaire ici.

## Resume des fichiers a modifier

| Fichier | Modification |
|---------|-------------|
| `src/pages/Index.tsx` | Remplacer `return null` par un ecran de fallback avec message et bouton de rechargement. Gerer le cas `current_question_id = null` pendant une partie active. |
| `src/pages/Questions.tsx` | Dans `handleDelete`, remplacer le `current_question_id = null` par une recherche de la question suivante et assigner cette question aux sessions affectees. |

## Detail technique du fallback (Index.tsx)

Avant le `return null` final, ajouter une verification :

```text
if (currentRoom && playerName && gameState) {
  // L'etat existe mais aucun ecran ne correspond
  // Afficher un ecran de chargement/recuperation
  // Avec un bouton qui remet l'etat a 'question' apres rechargement des donnees
}
```

## Detail technique de la deletion (Questions.tsx)

```text
handleDelete(id):
  1. Requete : SELECT id, sort_order, level FROM questions WHERE sort_order > question.sort_order ORDER BY level, sort_order LIMIT 1
  2. Si nextQuestion existe :
     - UPDATE game_sessions SET current_question_id = nextQuestion.id, current_level = nextQuestion.level WHERE current_question_id = id
  3. Sinon :
     - UPDATE game_sessions SET current_question_id = null WHERE current_question_id = id
  4. DELETE question
```
