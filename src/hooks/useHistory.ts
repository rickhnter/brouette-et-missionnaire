import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HistoryEntry {
  id: string;
  question: string;
  category: string;
  category_icon: string;
  player1_answer: string | null;
  player2_answer: string | null;
  player1_name: string;
  player2_name: string;
  created_at: string;
}

export const useHistory = (sessionId: string | null) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      const { data: answers, error: answersError } = await supabase
        .from('answers')
        .select(`
          *,
          questions:question_id (
            question,
            category,
            category_icon
          ),
          game_sessions:session_id (
            player1_name,
            player2_name
          )
        `)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (answersError) {
        console.error('Error fetching history:', answersError);
        setLoading(false);
        return;
      }

      // Grouper les réponses par question
      const grouped = new Map<string, HistoryEntry>();

      answers?.forEach((answer: any) => {
        const questionId = answer.question_id;
        const session = answer.game_sessions;
        const question = answer.questions;

        if (!grouped.has(questionId)) {
          grouped.set(questionId, {
            id: questionId,
            question: question?.question || '',
            category: question?.category || '',
            category_icon: question?.category_icon || '',
            player1_answer: null,
            player2_answer: null,
            player1_name: session?.player1_name || '',
            player2_name: session?.player2_name || '',
            created_at: answer.created_at
          });
        }

        const entry = grouped.get(questionId)!;
        if (answer.player_name === session?.player1_name) {
          entry.player1_answer = answer.skipped ? '🫣 (passé)' : answer.answer;
        } else {
          entry.player2_answer = answer.skipped ? '🫣 (passé)' : answer.answer;
        }
      });

      setHistory(Array.from(grouped.values()));
      setLoading(false);
    };

    fetchHistory();
  }, [sessionId]);

  return { history, loading };
};
