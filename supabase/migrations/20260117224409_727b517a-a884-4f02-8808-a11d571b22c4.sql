-- Rename category to level (1-5 integer)
ALTER TABLE public.questions 
DROP COLUMN category,
DROP COLUMN category_icon;

-- Add level column (1-5)
ALTER TABLE public.questions 
ADD COLUMN level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1 AND level <= 5);

-- Update game_sessions to use level instead of category
ALTER TABLE public.game_sessions 
DROP COLUMN current_category;

ALTER TABLE public.game_sessions 
ADD COLUMN current_level INTEGER DEFAULT NULL;