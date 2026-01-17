-- Table des questions avec catégorie et suggestions de réponses
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  category TEXT NOT NULL,
  category_icon TEXT NOT NULL DEFAULT '❓',
  suggestions TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des sessions de jeu
CREATE TABLE public.game_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player1_name TEXT NOT NULL,
  player2_name TEXT,
  player1_connected BOOLEAN DEFAULT true,
  player2_connected BOOLEAN DEFAULT false,
  current_category TEXT,
  current_question_id UUID REFERENCES public.questions(id),
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des réponses des joueurs
CREATE TABLE public.answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  answer TEXT,
  skipped BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX idx_answers_session_question ON public.answers(session_id, question_id);
CREATE INDEX idx_questions_category ON public.questions(category);
CREATE INDEX idx_game_sessions_status ON public.game_sessions(status);

-- Activer RLS sur toutes les tables
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- Politique pour les questions : lecture publique
CREATE POLICY "Questions are publicly readable"
ON public.questions FOR SELECT
USING (true);

-- Politique pour les sessions : lecture et écriture publique (jeu sans auth)
CREATE POLICY "Sessions are publicly readable"
ON public.game_sessions FOR SELECT
USING (true);

CREATE POLICY "Sessions can be created by anyone"
ON public.game_sessions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Sessions can be updated by anyone"
ON public.game_sessions FOR UPDATE
USING (true);

-- Politique pour les réponses : lecture et écriture publique
CREATE POLICY "Answers are publicly readable"
ON public.answers FOR SELECT
USING (true);

CREATE POLICY "Answers can be created by anyone"
ON public.answers FOR INSERT
WITH CHECK (true);

-- Activer le realtime pour la synchronisation
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.answers;

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_game_sessions_updated_at
BEFORE UPDATE ON public.game_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insérer quelques questions d'exemple pour tester
INSERT INTO public.questions (question, category, category_icon, suggestions, sort_order) VALUES
('Quelle est ta couleur préférée ?', 'Découverte', '💕', ARRAY['Rouge', 'Bleu', 'Vert', 'Rose', 'Violet'], 1),
('Quel est ton plat préféré ?', 'Découverte', '💕', ARRAY['Pâtes', 'Sushi', 'Pizza', 'Burger', 'Salade'], 2),
('Quel est ton film romantique préféré ?', 'Découverte', '💕', ARRAY['Titanic', 'Notebook', 'La La Land', 'Dirty Dancing'], 3);