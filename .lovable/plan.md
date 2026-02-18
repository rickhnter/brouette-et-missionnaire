
# Tutoriel visible dès la création d'une room

## Problème actuel

Le créateur de la room voit un écran "En attente de ton partenaire..." (`WaitingRoom`) jusqu'à ce que le second joueur se connecte. Le tutoriel ne se déclenche que lorsque les deux joueurs sont simultanément connectés, ce qui signifie que le créateur ne voit jamais le tutoriel ou le voit seulement une fraction de seconde.

## Solution

Modifier le flux de `gameState` pour que le créateur voit le tutoriel **immédiatement** après la création de la room, en parallèle de l'attente du partenaire. Le code de partage sera intégré dans le tutoriel (slide 1) pour que le joueur puisse partager le code tout en découvrant l'application.

## Changements techniques

### 1. `src/pages/Index.tsx` — Modifier la transition vers `waiting`

Actuellement (ligne ~193) :
```text
useEffect: currentRoom + playerName + !gameState → setGameState('waiting')
```

Nouveau comportement : si la room n'a pas encore de partenaire (`!currentRoom.player2_name`) ET pas de `current_question_id`, passer directement à `'tutorial'` au lieu de `'waiting'`.

```text
if (!currentRoom.player2_name && !currentRoom.current_question_id) {
  setGameState('tutorial');   // tutoriel dès la création
} else {
  setGameState('waiting');
}
```

### 2. `src/pages/Index.tsx` — Modifier le `onComplete` du tutoriel pour le créateur seul

Quand le créateur clique "Commencer" à la fin du tutoriel :
- Si le partenaire **n'est pas encore connecté** → passer à `'waiting'` (afficher l'écran d'attente habituel)
- Si le partenaire **est déjà connecté** → démarrer la partie normalement (appeler `proceedToNextQuestion`)

### 3. `src/components/TutorialScreen.tsx` — Afficher le code de room dans le slide 1

Ajouter une prop optionnelle `roomCode?: string` au composant `TutorialScreen`. Dans le `WelcomeSlide`, si `roomCode` est fourni, afficher le code et un bouton de partage sous les noms des joueurs (même UI que dans `WaitingRoom`).

Cela évite au créateur de rater le code de partage pendant qu'il lit le tutoriel.

### 4. Garder la logique actuelle pour le partenaire qui rejoint

Le joueur qui rejoint une nouvelle room passe toujours par le tutoriel via l'effet existant (ligne 200-220) qui détecte `player1_connected && player2_connected && !current_question_id`. Pas de changement ici.

## Résumé des fichiers à modifier

| Fichier | Modification |
|---------|-------------|
| `src/pages/Index.tsx` | Transition vers `'tutorial'` au lieu de `'waiting'` pour le créateur. Gérer le `onComplete` du tutoriel selon si le partenaire est connecté ou non. |
| `src/components/TutorialScreen.tsx` | Ajouter prop `roomCode` optionnelle et l'afficher dans le premier slide. |

## Flux après le fix

```text
Créateur :
  Créer room → gameState = 'tutorial' (avec code de partage affiché)
  → Swipe le tutoriel → clique "Commencer"
    → Partenaire pas encore là : gameState = 'waiting'
    → Partenaire déjà connecté : démarrage de la partie

Partenaire :
  Rejoindre room (nouvelle) → gameState = 'waiting'
  → Realtime détecte player2_connected → gameState = 'tutorial'
  → Tutoriel → Commencer → démarrage de la partie
```
