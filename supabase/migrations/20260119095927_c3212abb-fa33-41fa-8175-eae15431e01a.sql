-- Add proposed_by column to questions table
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS proposed_by TEXT DEFAULT NULL;

-- Add proposed_by column to game_events table  
ALTER TABLE public.game_events ADD COLUMN IF NOT EXISTS proposed_by TEXT DEFAULT NULL;