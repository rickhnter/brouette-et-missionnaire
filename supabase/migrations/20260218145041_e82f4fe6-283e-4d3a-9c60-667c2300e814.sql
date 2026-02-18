
-- 1. Ajouter les colonnes premium à game_sessions
ALTER TABLE public.game_sessions
  ADD COLUMN IF NOT EXISTS premium_unlocked boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS premium_unlocked_by text,
  ADD COLUMN IF NOT EXISTS premium_unlocked_at timestamptz,
  ADD COLUMN IF NOT EXISTS stripe_payment_id text;

-- 2. Créer la table payments
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  player_name text NOT NULL,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'eur',
  stripe_payment_intent_id text UNIQUE,
  stripe_session_id text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

-- 3. Index de performance
CREATE INDEX IF NOT EXISTS idx_payments_session_id ON public.payments(session_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id ON public.payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_premium_unlocked ON public.game_sessions(premium_unlocked);

-- 4. Activer RLS sur payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Politique SELECT : accessible à tous
CREATE POLICY "Payments are publicly readable"
  ON public.payments
  FOR SELECT
  USING (true);

-- Politique INSERT : accessible à tous
CREATE POLICY "Payments can be created by anyone"
  ON public.payments
  FOR INSERT
  WITH CHECK (true);

-- Politique UPDATE : pour permettre la mise à jour du statut (ex: webhook)
CREATE POLICY "Payments can be updated by anyone"
  ON public.payments
  FOR UPDATE
  USING (true);
