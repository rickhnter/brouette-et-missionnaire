import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Question {
  id: string;
  question: string;
  level: number;
  suggestions: string[];
  sort_order: number;
}

export const useQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [levels, setLevels] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching questions:', error);
        return;
      }

      setQuestions(data || []);

      // Extraire les niveaux uniques
      const uniqueLevels = Array.from(
        new Set(data?.map(q => q.level) || [])
      ).sort((a, b) => a - b);
      setLevels(uniqueLevels);
      setLoading(false);
    };

    fetchQuestions();
  }, []);

  const getQuestionsByLevel = (level: number) => {
    return questions.filter(q => q.level === level);
  };

  const getQuestionById = (id: string) => {
    return questions.find(q => q.id === id);
  };

  const getNextQuestion = (level: number, currentQuestionId: string | null) => {
    const levelQuestions = getQuestionsByLevel(level);
    if (!currentQuestionId) return levelQuestions[0] || null;
    
    const currentIndex = levelQuestions.findIndex(q => q.id === currentQuestionId);
    return levelQuestions[currentIndex + 1] || null;
  };

  const refetch = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching questions:', error);
      setLoading(false);
      return;
    }

    setQuestions(data || []);
    const uniqueLevels = Array.from(
      new Set(data?.map(q => q.level) || [])
    ).sort((a, b) => a - b);
    setLevels(uniqueLevels);
    setLoading(false);
  };

  return {
    questions,
    levels,
    loading,
    getQuestionsByLevel,
    getQuestionById,
    getNextQuestion,
    refetch
  };
};
