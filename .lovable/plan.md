
# Tutoriel anime au lancement de partie

## Concept

Une sequence d'ecrans animes de type "onboarding" qui s'affiche pour les deux joueurs juste apres que les deux se soient connectes a la room, AVANT la premiere question. Chaque ecran explique un aspect du jeu avec des animations Framer Motion.

## Sequence des ecrans (5 slides)

1. **Bienvenue** - Logo + noms des deux joueurs avec animation de coeurs
2. **Les questions** - Explication : "Vous allez repondre chacun de votre cote, puis decouvrir la reponse de l'autre"  
3. **Les niveaux** - Icones flamme + explication des 5 niveaux (Decouverte -> Sans limites)
4. **Les evenements** - Icones des 6 types d'evenements (message, photo, sync, confession, game, promesse) avec un apercu rapide
5. **C'est parti !** - Animation de lancement + bouton "Commencer"

## Synchronisation entre les deux joueurs

- Le tutoriel est **individuel** : chaque joueur avance a son rythme dans les slides
- Le dernier slide affiche "Commencer" qui declenche `startGame()`
- Si un joueur finit le tuto avant l'autre, le `startGame()` est appele par le premier joueur pret. Le second verra automatiquement la premiere question grace au realtime (le `current_question_id` sera deja defini)
- Aucune modification de base de donnees necessaire : le tutoriel est purement cote client

## Fichiers a creer / modifier

### 1. Nouveau : `src/components/TutorialScreen.tsx`

Composant principal du tutoriel contenant :
- Un state `currentSlide` (0 a 4)
- 5 sous-composants de slides avec animations Framer Motion (AnimatePresence pour les transitions)
- Des indicateurs de progression (petits points en bas)
- Boutons "Suivant" et "Passer le tutoriel"
- Utilisation des icones SVG existantes (`icon-flamme.svg`, `icon-message.svg`, `icon-photo.svg`, `icon-sync.svg`, `icon-confession.svg`, `icon-game.svg`, `icon-magicpen.svg`)
- Animation de swipe / slide entre les ecrans
- Au dernier slide, le bouton "Commencer" appelle `onComplete()`

### 2. Modifier : `src/pages/Index.tsx`

- Ajouter `'tutorial'` au type `GameState`
- Apres que les deux joueurs soient connectes (dans l'effet `auto-start`), si c'est une **nouvelle partie** (pas de `current_question_id` encore), passer a `gameState = 'tutorial'` au lieu de lancer `startGame()` directement
- A la fin du tutoriel (`onComplete`), appeler `startGame()` pour demarrer la premiere question
- Si c'est une partie **reprise** (resume avec `current_question_id` deja defini), sauter le tutoriel et aller directement a l'etat de jeu
- Ajouter le rendu conditionnel pour `gameState === 'tutorial'`

## Details des animations par slide

**Slide 1 - Bienvenue** :
- Logo qui apparait en scale-in depuis le centre
- Noms des deux joueurs qui glissent depuis les cotes opposes (gauche/droite) pour se rejoindre au centre
- Coeurs flottants en arriere-plan

**Slide 2 - Les questions** :
- Carte de question simulee qui apparait
- Deux bulles de reponse qui se revelent avec un delai
- Animation de "revelation" : les reponses se retournent comme des cartes

**Slide 3 - Les niveaux** :
- Les 5 flammes apparaissent une par une avec un effet de cascade
- Chaque flamme porte son label (Decouverte, Complicite, Intimite, Passion, Sans limites)
- Intensite croissante des couleurs

**Slide 4 - Les evenements** :
- Les 6 icones d'evenements apparaissent en cercle autour d'un point central
- Chaque icone tourne legerement et s'illumine a tour de role
- Texte explicatif : "Des surprises apparaitront entre les questions !"

**Slide 5 - C'est parti** :
- Animation de compte a rebours visuel (3, 2, 1)
- Bouton "Commencer" qui pulse avec un glow rose
- Particules / confettis en arriere-plan

## Aspects techniques

- Le composant utilise `framer-motion` (deja installe) pour toutes les animations
- Fond coherent avec le reste de l'app : `bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200`
- Le tutoriel ne s'affiche qu'une seule fois par nouvelle partie (quand `current_question_id` est `null` au moment de la connexion des deux joueurs)
- Support du swipe tactile pour naviguer entre les slides (utilisation des gestes Framer Motion `drag="x"`)
- Responsive : les animations s'adaptent a la taille de l'ecran
