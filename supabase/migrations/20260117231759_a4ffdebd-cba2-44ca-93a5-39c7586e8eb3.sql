-- Ajouter une contrainte unique pour éviter les doublons de réponses
ALTER TABLE public.answers 
ADD CONSTRAINT unique_answer_per_player_per_question 
UNIQUE (session_id, question_id, player_name);