

# Correction des bugs de synchronisation du jeu

## Problemes identifies

Apres analyse du code, voici les causes racines des bugs :

### Bug 1 : Double avancement des questions
Quand un evenement se termine, les **deux joueurs** ont un bouton "Continuer" qui appelle `proceedToNextQuestion()`. Les deux joueurs avancent donc la question **chacun de leur cote**, ce qui fait sauter une question ou desynchronise les ecrans.

- `handleEventComplete` (joueur actif) : efface l'evenement ET avance la question
- `handlePartnerEventContinue` (partenaire) : fait exactement la meme chose

Resultat : la question avance deux fois.

### Bug 2 : Ecran bloque en attente mutuelle (screenshot)
Le screenshot montre les deux joueurs bloques sur "Compliment" avec "En attente du message de...". Cela arrive quand :
- Un evenement `requires_both` (sync) est detecte
- Les deux joueurs soumettent leur reponse
- Mais la detection de la reponse du partenaire ne fonctionne pas car le polling dans `useGameEvents` et les `useEffect` de detection se marchent dessus

### Bug 3 : Confusion entre types d'evenements
Le joueur peut voir un "Compliment" (message) puis passer a une "Promesse" car les deux joueurs declenchent `proceedToNextQuestion` independamment, et le second appel fait encore avancer.

## Principe de la solution

**Un seul joueur doit etre responsable de l'avancement de la question.**

La regle simple : seul le joueur qui a **declenche** l'evenement (ou `player1` pour les sync) est autorise a appeler `proceedToNextQuestion`. L'autre joueur se contente de remettre a zero son etat local et attend que le realtime mette a jour `current_question_id`.

## Modifications

### 1. `src/pages/Index.tsx` - Separation des responsabilites

**handleEventComplete** (pour les evenements sync/reveal) :
- Verifier si le joueur est le "leader" (celui qui a declenche l'event, ou player1 pour les sync)
- Si leader : effacer l'evenement en DB + appeler `proceedToNextQuestion`
- Si non-leader : juste remettre a zero l'etat local (le realtime detectera le changement de `current_question_id`)

**handlePartnerEventContinue** (pour les evenements solo cote partenaire) :
- Ne PLUS appeler `proceedToNextQuestion`
- Juste remettre a zero l'etat local
- L'avancement est deja fait par le joueur actif via `handleEventComplete`

**Correction du flux de detection** :
- L'effet qui detecte le retour a `question` quand `currentEventId` passe a `null` (lignes 231-243) est deja en place mais entre en conflit avec les transitions manuelles

### 2. `src/pages/Index.tsx` - Correction des effects concurrents

**Effet de detection d'evenement (lignes 194-244)** :
- Ajouter un garde pour ne pas re-entrer dans un etat deja actif
- Quand `currentEventId` devient null et qu'on etait dans un etat d'evenement, ne pas forcer `question` immediatement mais laisser le changement de `current_question_id` gerer la transition

**Effet de changement de question (lignes 307-314)** :
- Ce useEffect detecte deja quand `current_question_id` change via realtime
- Il faut elargir les etats depuis lesquels il peut transitionner vers `question` pour inclure les etats d'evenement

### 3. `src/hooks/useGameEvents.ts` - Fiabiliser la detection des reponses

- Le hook utilise un state `responses` qui peut etre desynchronise entre les deux joueurs
- S'assurer que `fetchResponses` ne remplace pas les donnees deja presentes
- Ajouter un merge intelligent plutot qu'un remplacement complet

### 4. Evenements solo : empecher le double `proceedToNextQuestion`

Pour les evenements solo, le flux actuel est :
1. Joueur actif termine -> `handleEventComplete` -> efface event + avance question
2. Partenaire voit la notification -> clique "Continuer" -> `handlePartnerEventContinue` -> efface event + avance question (DOUBLON)

Correction : le partenaire ne doit PAS effacer l'event ni avancer. Il attend simplement que le realtime lui dise que `current_event_id` est null et `current_question_id` a change.

## Resume des changements par fichier

| Fichier | Changement |
|---------|-----------|
| `src/pages/Index.tsx` | Separer leader/follower pour l'avancement. Corriger les useEffects concurrents. Ne plus appeler `proceedToNextQuestion` cote partenaire. |
| `src/hooks/useGameEvents.ts` | Merger les reponses au lieu de les remplacer dans `fetchResponses`. |

## Details techniques

### Logique leader/follower

```text
Evenement SOLO :
  - Leader = eventPlayerNameFromRoom (le joueur qui a l'action)
  - Leader clique "Continuer" -> efface event + avance question
  - Follower clique "Continuer" -> remet a zero l'etat local uniquement

Evenement SYNC (requires_both) :
  - Leader = player1_name (convention arbitraire mais deterministe)
  - Les deux joueurs voient le reveal
  - Leader clique "Continuer" -> efface event + avance question  
  - Follower clique "Continuer" -> remet a zero l'etat local uniquement
```

### Transition d'etat quand l'evenement est efface

Le follower detecte le changement via l'effet existant (ligne 231-243) :
- `currentEventId` passe a null
- L'etat passe a `question`
- En parallele, le `current_question_id` change aussi via le realtime
- L'effet de changement de question (ligne 307-314) s'assure que le bon ecran s'affiche

### Merge des reponses dans useGameEvents

Au lieu de :
```text
setResponses(data || [])
```

Utiliser un merge par ID pour eviter de perdre des reponses deja detectees par le realtime :
```text
setResponses(prev => {
  const merged = [...prev];
  for (const item of data) {
    if (!merged.some(r => r.id === item.id)) {
      merged.push(item);
    }
  }
  return merged;
})
```

