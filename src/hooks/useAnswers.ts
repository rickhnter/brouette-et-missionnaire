import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Answer {
  id: string;
  session_id: string;
  question_id: string;
  player_name: string;
  answer: string | null;
  skipped: boolean;
  created_at: string;
}

export const useAnswers = (sessionId: string | null, questionId: string | null) => {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAnswers = useCallback(async () => {
    if (!sessionId || !questionId) {
      setAnswers([]);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('answers')
      .select('*')
      .eq('session_id', sessionId)
      .eq('question_id', questionId);

    if (error) {
      console.error('[Answers] Erreur fetch:', error);
    } else {
      // Toujours remplacer le state avec les réponses strictement pour cette questionId
      setAnswers(data || []);
    }
    setLoading(false);
  }, [sessionId, questionId]);

  // Reset answers quand la question change — critique pour éviter les mélanges
  useEffect(() => {
    console.log('[Answers] Question changée →', questionId, '— reset du state');
    setAnswers([]);
    fetchAnswers();
  }, [questionId, fetchAnswers]);

  // Polling toutes les 3 secondes pour synchronisation
  useEffect(() => {
    if (!sessionId || !questionId) return;
    
    const interval = setInterval(fetchAnswers, 3000);
    return () => clearInterval(interval);
  }, [fetchAnswers, sessionId, questionId]);

  // Écouter les nouvelles réponses en temps réel — filtre strict par question_id
  useEffect(() => {
    if (!sessionId || !questionId) return;

    const channel = supabase
      .channel(`answers-${sessionId}-${questionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'answers',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          const newAnswer = payload.new as Answer;
          // Filtrage strict : ignorer les réponses qui ne sont pas pour la question ACTUELLE
          if (newAnswer.question_id !== questionId) {
            console.log('[Answers] Réponse realtime ignorée — question_id différent:', newAnswer.question_id, '!==', questionId);
            return;
          }
          setAnswers(prev => {
            // Éviter les doublons
            if (prev.some(a => a.id === newAnswer.id)) return prev;
            console.log('[Answers] Nouvelle réponse realtime pour', newAnswer.player_name);
            return [...prev, newAnswer];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, questionId]);

  const submitAnswer = async (
    playerName: string,
    answer: string | null,
    skipped: boolean = false
  ) => {
    if (!sessionId || !questionId) return;

    // Vérifier si le joueur a déjà répondu à cette question
    const existingAnswer = answers.find(a => a.player_name === playerName && a.question_id === questionId);
    if (existingAnswer) {
      console.log('[Answers] Joueur a déjà répondu à cette question — ignoré');
      return;
    }

    // Double-check BDD : vérifier que la question est toujours la question active de la session
    const { data: sessionData } = await supabase
      .from('game_sessions')
      .select('current_question_id')
      .eq('id', sessionId)
      .maybeSingle();

    if (sessionData?.current_question_id !== questionId) {
      console.warn('[Answers] submitAnswer bloqué — la question active en BDD a changé:', sessionData?.current_question_id, '!== local:', questionId);
      return;
    }

    try {
      const { error } = await supabase
        .from('answers')
        .insert({
          session_id: sessionId,
          question_id: questionId,
          player_name: playerName,
          answer,
          skipped
        });

      if (error) {
        // Si c'est une erreur de doublon, ignorer silencieusement
        if (error.code === '23505') {
          console.log('[Answers] Réponse déjà existante (contrainte BDD)');
          return;
        }
        throw error;
      }
      
      // Refetch immédiatement après l'insertion
      await fetchAnswers();
    } catch (err) {
      console.error('[Answers] Erreur soumission:', err);
    }
  };

  // Filtrage strict par questionId pour éviter les mélanges entre questions
  const getPlayerAnswer = (playerName: string) => {
    return answers.find(a => a.player_name === playerName && a.question_id === questionId);
  };

  const getPartnerAnswer = (playerName: string) => {
    return answers.find(a => a.player_name !== playerName && a.question_id === questionId);
  };

  const hasPlayerAnswered = (playerName: string) => {
    return answers.some(a => a.player_name === playerName && a.question_id === questionId);
  };

  const hasPartnerAnswered = (playerName: string) => {
    return answers.some(a => a.player_name !== playerName && a.question_id === questionId);
  };

  return {
    answers,
    loading,
    submitAnswer,
    getPlayerAnswer,
    getPartnerAnswer,
    hasPlayerAnswered,
    hasPartnerAnswered,
    fetchAnswers
  };
};
