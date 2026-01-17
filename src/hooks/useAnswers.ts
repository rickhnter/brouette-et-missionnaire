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
      console.error('Error fetching answers:', error);
    } else {
      setAnswers(data || []);
    }
    setLoading(false);
  }, [sessionId, questionId]);

  // Reset answers quand la question change
  useEffect(() => {
    setAnswers([]);
    fetchAnswers();
  }, [questionId]);

  // Polling toutes les 3 secondes pour synchronisation
  useEffect(() => {
    if (!sessionId || !questionId) return;
    
    const interval = setInterval(fetchAnswers, 3000);
    return () => clearInterval(interval);
  }, [fetchAnswers, sessionId, questionId]);

  // Écouter les nouvelles réponses en temps réel
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
          // Ne pas ajouter si la réponse n'est pas pour la question actuelle
          if (newAnswer.question_id === questionId) {
            setAnswers(prev => {
              // Éviter les doublons
              if (prev.some(a => a.id === newAnswer.id)) return prev;
              return [...prev, newAnswer];
            });
          }
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
    const existingAnswer = answers.find(a => a.player_name === playerName);
    if (existingAnswer) {
      console.log('Player already answered this question');
      return;
    }

    const { error } = await supabase
      .from('answers')
      .insert({
        session_id: sessionId,
        question_id: questionId,
        player_name: playerName,
        answer,
        skipped
      });

    if (error) throw error;
    
    // Refetch immédiatement après l'insertion
    await fetchAnswers();
  };

  const getPlayerAnswer = (playerName: string) => {
    return answers.find(a => a.player_name === playerName);
  };

  const getPartnerAnswer = (playerName: string) => {
    return answers.find(a => a.player_name !== playerName);
  };

  const hasPlayerAnswered = (playerName: string) => {
    return answers.some(a => a.player_name === playerName);
  };

  const hasPartnerAnswered = (playerName: string) => {
    return answers.some(a => a.player_name !== playerName);
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
