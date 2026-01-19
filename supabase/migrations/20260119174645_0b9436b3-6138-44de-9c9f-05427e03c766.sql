-- Ajouter les colonnes pour tracker l'événement en cours
ALTER TABLE game_sessions 
ADD COLUMN IF NOT EXISTS current_event_id UUID REFERENCES game_events(id),
ADD COLUMN IF NOT EXISTS event_player_name TEXT;