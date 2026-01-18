-- Add event_player_name to track who received the event
ALTER TABLE public.game_sessions 
ADD COLUMN event_player_name TEXT;