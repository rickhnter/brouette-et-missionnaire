
# Plan: Système de Rooms pour le jeu

## Vue d'ensemble

Le système actuel utilise déjà `game_sessions` comme base pour les "rooms", mais il est limité à 2 joueurs hardcodés (Pierrick/Daisy) et ne permet pas de créer plusieurs parties distinctes. L'objectif est de créer un vrai système de rooms où:

1. Un joueur peut créer une room avec un code unique
2. Un autre joueur peut rejoindre cette room avec le code
3. Chaque room a sa propre progression, historique et réponses
4. Les joueurs peuvent avoir plusieurs rooms (avec différents partenaires ou pour rejouer)

## Architecture proposée

### 1. Modification de la base de données

**Table `game_sessions` (modifiée):**
```
id: uuid (existant)
room_code: text (NOUVEAU - code unique de 6 caractères)
room_name: text (NOUVEAU - nom optionnel de la room)
player1_name: text (existant - mais dynamique maintenant)
player2_name: text (existant)
player1_connected: boolean (existant)
player2_connected: boolean (existant)
current_level: integer (existant)
current_question_id: uuid (existant)
current_event_id: uuid (existant)
event_player_name: text (existant)
status: text (existant - 'waiting', 'playing', 'finished')
created_at, updated_at (existants)
```

**Nouvelles colonnes:**
- `room_code`: Code unique de 6 caractères (ex: "ABC123") pour partager et rejoindre
- `room_name`: Nom personnalisé optionnel pour identifier la room (ex: "Notre aventure")

### 2. Flux utilisateur

```
┌─────────────────────────────────────────────────────────────┐
│                      Écran d'accueil                        │
│                                                             │
│   ┌─────────────────────┐    ┌─────────────────────┐       │
│   │   Créer une room    │    │  Rejoindre une room │       │
│   └─────────────────────┘    └─────────────────────┘       │
│                                                             │
│              ┌─────────────────────────┐                    │
│              │   Mes rooms en cours    │                    │
│              └─────────────────────────┘                    │
└─────────────────────────────────────────────────────────────┘

Créer une room:
1. Entrer son prénom
2. (Optionnel) Nommer la room
3. Room créée avec un code unique
4. Partager le code au partenaire
5. Attendre le partenaire

Rejoindre une room:
1. Entrer le code de la room
2. Entrer son prénom
3. Rejoindre la room
4. Le jeu démarre automatiquement

Mes rooms en cours:
- Liste des rooms où le joueur participe
- Statut de chaque room (en attente, en cours, terminée)
- Possibilité de reprendre une partie
```

### 3. Composants à créer/modifier

**Nouveaux composants:**
- `RoomHomeScreen.tsx`: Écran d'accueil avec les 3 options (créer/rejoindre/mes rooms)
- `CreateRoomScreen.tsx`: Formulaire de création de room
- `JoinRoomScreen.tsx`: Formulaire pour entrer un code et rejoindre
- `MyRoomsScreen.tsx`: Liste des rooms du joueur

**Composants à modifier:**
- `LoginScreen.tsx`: Transformer en écran de saisie de prénom (après sélection de la room)
- `WaitingRoom.tsx`: Afficher le code de room à partager
- `Index.tsx`: Nouveau flux de navigation avec les rooms

### 4. Hook useRoom

Nouveau hook pour gérer les rooms:

```typescript
interface Room {
  id: string;
  room_code: string;
  room_name: string | null;
  player1_name: string;
  player2_name: string | null;
  status: 'waiting' | 'playing' | 'finished';
  current_level: number | null;
}

const useRoom = () => {
  // Créer une room
  const createRoom = (playerName: string, roomName?: string) => {...}
  
  // Rejoindre une room par code
  const joinRoom = (roomCode: string, playerName: string) => {...}
  
  // Récupérer les rooms d'un joueur (basé sur localStorage ou prénom)
  const getMyRooms = (playerName: string) => {...}
  
  // Reprendre une room existante
  const resumeRoom = (roomId: string, playerName: string) => {...}
}
```

### 5. Génération du code de room

Fonction pour générer un code unique de 6 caractères:
```typescript
const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sans I, O, 0, 1 pour éviter confusion
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
```

### 6. Stockage local

Pour retrouver "mes rooms" sans authentification:
- Stocker les room IDs et playerName dans localStorage
- Structure: `{ rooms: [{ roomId, playerName, lastAccess }] }`
- Permet de lister les parties en cours du joueur

## Migration SQL

```sql
-- Ajouter les colonnes pour le système de rooms
ALTER TABLE public.game_sessions
ADD COLUMN room_code TEXT UNIQUE,
ADD COLUMN room_name TEXT;

-- Créer un index pour la recherche par code
CREATE UNIQUE INDEX idx_game_sessions_room_code ON public.game_sessions(room_code);

-- Générer des codes pour les sessions existantes (optionnel)
UPDATE public.game_sessions 
SET room_code = UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6))
WHERE room_code IS NULL;

-- Rendre room_code obligatoire pour les nouvelles sessions
ALTER TABLE public.game_sessions
ALTER COLUMN room_code SET NOT NULL;
```

## Fichiers impactés

| Fichier | Action |
|---------|--------|
| `src/pages/Index.tsx` | Refactoring majeur du flux de navigation |
| `src/components/LoginScreen.tsx` | Simplifier en écran de prénom uniquement |
| `src/components/WaitingRoom.tsx` | Afficher le code de room |
| `src/components/RoomHomeScreen.tsx` | Nouveau - Écran d'accueil |
| `src/components/CreateRoomScreen.tsx` | Nouveau - Création de room |
| `src/components/JoinRoomScreen.tsx` | Nouveau - Rejoindre une room |
| `src/components/MyRoomsScreen.tsx` | Nouveau - Liste des rooms |
| `src/hooks/useRoom.ts` | Nouveau - Gestion des rooms |
| `src/hooks/useGameSession.ts` | Adapter pour utiliser room_code |
| Migration SQL | Ajouter room_code et room_name |

## Considérations techniques

### Sécurité
- Le code de room est public, pas de données sensibles exposées
- RLS existant reste valide (accès public pour un jeu sans auth)

### Performance  
- Index sur room_code pour recherche rapide
- Realtime déjà activé sur game_sessions

### Rétrocompatibilité
- Les sessions existantes recevront un code généré automatiquement
- Les anciennes URLs avec `?player=` peuvent rediriger vers le nouveau flux

## Résultat attendu

1. Les joueurs peuvent créer des rooms avec un code unique partageable
2. Chaque room est indépendante avec sa propre progression
3. Les joueurs peuvent reprendre leurs parties en cours
4. L'historique et les réponses sont bien isolés par room
5. Possibilité de jouer avec différentes personnes (plusieurs rooms)
