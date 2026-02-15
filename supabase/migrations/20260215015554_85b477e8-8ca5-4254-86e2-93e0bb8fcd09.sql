
-- Table for storing push notification subscriptions per player per room
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  subscription JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Unique constraint: one subscription per player per room
CREATE UNIQUE INDEX idx_push_subscriptions_session_player ON public.push_subscriptions(session_id, player_name);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Public read/write (no auth in this project)
CREATE POLICY "Push subscriptions are publicly readable"
  ON public.push_subscriptions FOR SELECT USING (true);

CREATE POLICY "Push subscriptions can be created by anyone"
  ON public.push_subscriptions FOR INSERT WITH CHECK (true);

CREATE POLICY "Push subscriptions can be updated by anyone"
  ON public.push_subscriptions FOR UPDATE USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.push_subscriptions;
