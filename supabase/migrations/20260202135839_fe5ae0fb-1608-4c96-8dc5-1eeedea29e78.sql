-- Ajouter les colonnes pour le système de rooms
ALTER TABLE public.game_sessions
ADD COLUMN room_code TEXT UNIQUE,
ADD COLUMN room_name TEXT;

-- Générer des codes pour les sessions existantes
UPDATE public.game_sessions 
SET room_code = UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6))
WHERE room_code IS NULL;

-- Rendre room_code obligatoire pour les nouvelles sessions
ALTER TABLE public.game_sessions
ALTER COLUMN room_code SET NOT NULL;