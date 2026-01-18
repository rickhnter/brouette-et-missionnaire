-- Create game_events table for random events during gameplay
CREATE TABLE public.game_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('message', 'promise', 'photo', 'sync', 'game', 'confession')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1 AND level <= 5),
  requires_both BOOLEAN NOT NULL DEFAULT false,
  is_private BOOLEAN NOT NULL DEFAULT false,
  options TEXT[] DEFAULT NULL,
  sort_order INTEGER DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_events ENABLE ROW LEVEL SECURITY;

-- Public read access for events
CREATE POLICY "Events are publicly readable"
ON public.game_events
FOR SELECT
USING (true);

-- Public insert/update/delete for admin management
CREATE POLICY "Events can be managed publicly"
ON public.game_events
FOR ALL
USING (true)
WITH CHECK (true);

-- Create event_responses table for saving responses to events
CREATE TABLE public.event_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.game_events(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  response TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, event_id, player_name)
);

-- Enable RLS
ALTER TABLE public.event_responses ENABLE ROW LEVEL SECURITY;

-- Public access for event responses
CREATE POLICY "Event responses are publicly readable"
ON public.event_responses
FOR SELECT
USING (true);

CREATE POLICY "Event responses can be inserted publicly"
ON public.event_responses
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Event responses can be updated publicly"
ON public.event_responses
FOR UPDATE
USING (true);

-- Add current_event_id to game_sessions for tracking active events
ALTER TABLE public.game_sessions
ADD COLUMN current_event_id UUID REFERENCES public.game_events(id) ON DELETE SET NULL;

-- Insert initial events content

-- NIVEAU 1 - Découverte
INSERT INTO public.game_events (type, title, description, level, requires_both) VALUES
('message', 'Mot doux', 'Écris un petit mot doux à ton/ta partenaire. Quelque chose de simple et sincère.', 1, true),
('message', 'Compliment', 'Dis une chose que tu apprécies particulièrement chez l''autre.', 1, true),
('photo', 'Selfie sourire', 'Envoie un selfie avec ton plus beau sourire à ton/ta partenaire !', 1, false),
('promise', 'Petite attention', 'Promets une petite attention que tu feras pour l''autre la prochaine fois que vous vous verrez.', 1, true);

-- NIVEAU 2 - Complicité
INSERT INTO public.game_events (type, title, description, level, requires_both) VALUES
('confession', 'Premier souvenir', 'Raconte ton premier souvenir marquant de votre relation.', 2, true),
('confession', 'Ce qui m''a fait craquer', 'Qu''est-ce qui t''a fait craquer chez l''autre au début ?', 2, true),
('sync', 'Compte jusqu''à 3', 'Comptez ensemble jusqu''à 3 et dites en même temps un mot qui représente votre couple.', 2, true),
('game', 'Pierre-feuille-ciseaux', 'Pierre, feuille, ciseaux ! Le perdant devra envoyer un vocal de 10 secondes déclarant son amour.', 2, true),
('photo', 'Photo souvenir', 'Partage une photo d''un moment ensemble que tu gardes précieusement.', 2, false);

-- NIVEAU 3 - Intimité
INSERT INTO public.game_events (type, title, description, level, requires_both) VALUES
('promise', 'Rendez-vous à planifier', 'Propose une idée de rendez-vous que tu aimerais faire avec l''autre.', 3, true),
('promise', 'Surprise à préparer', 'Promets une surprise que tu prépareras pour votre prochaine rencontre.', 3, true),
('message', 'Ce que tu m''apportes', 'Explique ce que l''autre t''apporte dans ta vie au quotidien.', 3, true),
('photo', 'Lieu qui te fait penser à nous', 'Partage une photo d''un endroit qui te fait penser à votre couple.', 3, false),
('confession', 'Mon moment préféré', 'Quel est ton moment préféré passé ensemble ?', 3, true);

-- NIVEAU 4 - Passion
INSERT INTO public.game_events (type, title, description, level, requires_both) VALUES
('confession', 'Ce que je n''ai jamais dit', 'Avoue quelque chose que tu n''as jamais osé dire à l''autre.', 4, true),
('confession', 'Mon plus grand souhait', 'Quel est ton plus grand souhait pour votre couple ?', 4, true),
('sync', 'Ferme les yeux', 'Fermez les yeux pendant 30 secondes et pensez à l''autre. Décrivez ensuite ce que vous avez visualisé.', 4, true),
('promise', 'Engagement spécial', 'Fais une promesse spéciale, quelque chose d''important pour toi.', 4, true),
('message', 'Déclaration', 'Écris une mini déclaration d''amour en 3 phrases.', 4, true);

-- NIVEAU 5 - Fusion
INSERT INTO public.game_events (type, title, description, level, requires_both) VALUES
('message', 'Lettre intime', 'Écris une courte lettre intime exprimant tes sentiments les plus profonds.', 5, true),
('message', 'Notre futur', 'Décris comment tu imagines votre futur ensemble.', 5, true),
('confession', 'Mon secret', 'Partage un secret ou une pensée intime que tu n''as jamais partagée.', 5, true),
('promise', 'Promesse éternelle', 'Fais une promesse qui te tient vraiment à cœur pour votre avenir.', 5, true),
('sync', 'Dire je t''aime', 'Dites-vous "je t''aime" en même temps, de la manière la plus sincère possible.', 5, true);