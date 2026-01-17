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
      // Chercher une session en attente
      const { data: existingSessions, error: fetchError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('status', 'waiting')
        .is('player2_name', null)
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      if (existingSessions && existingSessions.length > 0) {
        // Rejoindre la session existante
        const existingSession = existingSessions[0];
        
        if (existingSession.player1_name !== playerName) {
          const { data: updated, error: updateError } = await supabase
            .from('game_sessions')
            .update({
              player2_name: playerName,
              player2_connected: true,
              status: 'playing'
            })
            .eq('id', existingSession.id)
            .select()
            .single();

          if (updateError) throw updateError;
          setSession(updated);
        } else {
          setSession(existingSession);
        }
      } else {
        // Créer une nouvelle session
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
      }
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

  const selectLevel = async (level: number) => {
    if (!session?.id) return;

    // Récupérer la première question du niveau
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id')
      .eq('level', level)
      .order('sort_order', { ascending: true })
      .limit(1);

    if (questionsError) throw questionsError;

    await updateSession({
      current_level: level,
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
    selectLevel
  };
};
