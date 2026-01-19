import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Question {
  id: string;
  question: string;
  level: number;
  suggestions: string[];
  sort_order: number;
  proposed_by?: string | null;
}

export const useQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [levels, setLevels] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuestions = useCallback(async () => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('level', { ascending: true })
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
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const getQuestionsByLevel = useCallback((level: number) => {
    return questions.filter(q => q.level === level);
  }, [questions]);

  const getQuestionById = useCallback((id: string) => {
    return questions.find(q => q.id === id);
  }, [questions]);

  // Get next question based on the GLOBAL order (level + sort_order)
  // This doesn't depend on the current index in a filtered array
  const getNextQuestion = useCallback((currentLevel: number, currentQuestionId: string | null): { question: Question; level: number } | null => {
    if (!currentQuestionId) {
      // No current question, return the first question in the list
      const firstQuestion = questions[0];
      return firstQuestion ? { question: firstQuestion, level: firstQuestion.level } : null;
    }

    // Find current question's position in the FULL sorted list
    const currentIndex = questions.findIndex(q => q.id === currentQuestionId);
    
    if (currentIndex === -1) {
      // Current question not found, start from beginning
      const firstQuestion = questions[0];
      return firstQuestion ? { question: firstQuestion, level: firstQuestion.level } : null;
    }

    // Get the next question in the global order
    const nextQuestion = questions[currentIndex + 1];
    
    if (nextQuestion) {
      return { question: nextQuestion, level: nextQuestion.level };
    }
    
    return null; // Plus de questions
  }, [questions]);

  const refetch = useCallback(async () => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('level', { ascending: true })
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching questions:', error);
      return;
    }

    setQuestions(data || []);
    const uniqueLevels = Array.from(
      new Set(data?.map(q => q.level) || [])
    ).sort((a, b) => a - b);
    setLevels(uniqueLevels);
  }, []);

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
