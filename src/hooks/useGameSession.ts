import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GameSession {
  id: string;
  player1_name: string;
  player2_name: string | null;
  player1_connected: boolean;
  player2_connected: boolean;
  current_level: number | null;
  current_question_id: string | null;
  status: string;
}

export const useGameSession = (playerName: string | null) => {
  const [session, setSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findOrCreateSession = useCallback(async () => {
    if (!playerName) return;
    
    setLoading(true);
    setError(null);

    try {
      // 1. Chercher une session active où le joueur participe déjà
      const { data: activeSessions, error: activeError } = await supabase
        .from('game_sessions')
        .select('*')
        .or(`player1_name.eq.${playerName},player2_name.eq.${playerName}`)
        .in('status', ['waiting', 'playing'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (activeError) throw activeError;

      if (activeSessions && activeSessions.length > 0) {
        // Le joueur a déjà une session active
        const activeSession = activeSessions[0];
        
        // Mettre à jour la connexion
        const isPlayer1 = activeSession.player1_name === playerName;
        const updates = isPlayer1 
          ? { player1_connected: true }
          : { player2_connected: true };
        
        const { data: updated, error: updateError } = await supabase
          .from('game_sessions')
          .update(updates)
          .eq('id', activeSession.id)
          .select()
          .single();

        if (updateError) throw updateError;
        setSession(updated);
        return;
      }

      // 2. Chercher une session en attente à rejoindre
      const { data: waitingSessions, error: waitingError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('status', 'waiting')
        .is('player2_name', null)
        .neq('player1_name', playerName)
        .order('created_at', { ascending: false })
        .limit(1);

      if (waitingError) throw waitingError;

      if (waitingSessions && waitingSessions.length > 0) {
        // Rejoindre la session existante
        const waitingSession = waitingSessions[0];
        
        const { data: updated, error: updateError } = await supabase
          .from('game_sessions')
          .update({
            player2_name: playerName,
            player2_connected: true
          })
          .eq('id', waitingSession.id)
          .select()
          .single();

        if (updateError) throw updateError;
        setSession(updated);
        return;
      }

      // 3. Créer une nouvelle session
      const { data: newSession, error: createError } = await supabase
        .from('game_sessions')
        .insert({
          player1_name: playerName,
          player1_connected: true
        })
        .select()
        .single();

      if (createError) throw createError;
      setSession(newSession);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [playerName]);

  // Écouter les changements de session en temps réel
  useEffect(() => {
    if (!session?.id) return;

    const channel = supabase
      .channel(`session-${session.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_sessions',
          filter: `id=eq.${session.id}`
        },
        (payload) => {
          if (payload.new) {
            setSession(payload.new as GameSession);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.id]);

  const updateSession = async (updates: Partial<GameSession>) => {
    if (!session?.id) return;

    const { error } = await supabase
      .from('game_sessions')
      .update(updates)
      .eq('id', session.id);

    if (error) throw error;
  };

  const startGame = async () => {
    if (!session?.id) return;

    // Récupérer la première question du niveau 1
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id')
      .eq('level', 1)
      .order('sort_order', { ascending: true })
      .limit(1);

    if (questionsError) throw questionsError;

    await updateSession({
      current_level: 1,
      current_question_id: questions?.[0]?.id || null,
      status: 'playing'
    });
  };

  return {
    session,
    loading,
    error,
    findOrCreateSession,
    updateSession,
    startGame
  };
};
