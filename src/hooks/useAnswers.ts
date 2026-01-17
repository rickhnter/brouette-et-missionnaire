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
    if (!sessionId || !questionId) return;

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

  // Polling toutes les 5 secondes
  useEffect(() => {
    fetchAnswers();
    const interval = setInterval(fetchAnswers, 5000);
    return () => clearInterval(interval);
  }, [fetchAnswers]);

  // Écouter les nouvelles réponses en temps réel
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`answers-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'answers',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          setAnswers(prev => [...prev, payload.new as Answer]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const submitAnswer = async (
    playerName: string,
    answer: string | null,
    skipped: boolean = false
  ) => {
    if (!sessionId || !questionId) return;

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
