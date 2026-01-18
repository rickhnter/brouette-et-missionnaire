import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HistoryEntry {
  id: string;
  type: 'question' | 'event';
  content: string;
  level: number;
  player1_answer: string | null;
  player2_answer: string | null;
  player1_name: string;
  player2_name: string;
  created_at: string;
  eventType?: string;
  eventTitle?: string;
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

      // Fetch question answers
      const { data: answers, error: answersError } = await supabase
        .from('answers')
        .select(`
          *,
          questions:question_id (
            question,
            level
          ),
          game_sessions:session_id (
            player1_name,
            player2_name
          )
        `)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      // Fetch event responses
      const { data: eventResponses, error: eventError } = await supabase
        .from('event_responses')
        .select(`
          *,
          game_events:event_id (
            type,
            title,
            description,
            level
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
      }
      if (eventError) {
        console.error('Error fetching event history:', eventError);
      }

      // Group question answers
      const grouped = new Map<string, HistoryEntry>();

      answers?.forEach((answer: any) => {
        const questionId = answer.question_id;
        const session = answer.game_sessions;
        const question = answer.questions;

        if (!grouped.has(`q-${questionId}`)) {
          grouped.set(`q-${questionId}`, {
            id: `q-${questionId}`,
            type: 'question',
            content: question?.question || '',
            level: question?.level || 1,
            player1_answer: null,
            player2_answer: null,
            player1_name: session?.player1_name || '',
            player2_name: session?.player2_name || '',
            created_at: answer.created_at
          });
        }

        const entry = grouped.get(`q-${questionId}`)!;
        if (answer.player_name === session?.player1_name) {
          entry.player1_answer = answer.skipped ? '🫣 (passé)' : answer.answer;
        } else {
          entry.player2_answer = answer.skipped ? '🫣 (passé)' : answer.answer;
        }
      });

      // Group event responses
      eventResponses?.forEach((response: any) => {
        const eventId = response.event_id;
        const session = response.game_sessions;
        const event = response.game_events;

        if (!grouped.has(`e-${eventId}-${response.created_at}`)) {
          grouped.set(`e-${eventId}-${response.created_at}`, {
            id: `e-${eventId}-${response.created_at}`,
            type: 'event',
            content: event?.description || '',
            level: event?.level || 1,
            player1_answer: null,
            player2_answer: null,
            player1_name: session?.player1_name || '',
            player2_name: session?.player2_name || '',
            created_at: response.created_at,
            eventType: event?.type,
            eventTitle: event?.title
          });
        }

        const entry = grouped.get(`e-${eventId}-${response.created_at}`)!;
        if (response.player_name === session?.player1_name) {
          entry.player1_answer = response.response || '✓';
        } else {
          entry.player2_answer = response.response || '✓';
        }
      });

      // Sort by created_at
      const sortedHistory = Array.from(grouped.values()).sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      setHistory(sortedHistory);
      setLoading(false);
    };

    fetchHistory();
  }, [sessionId]);

  return { history, loading };
};
