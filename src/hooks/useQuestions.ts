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

  const getNextQuestion = (currentLevel: number, currentQuestionId: string | null): { question: Question; level: number } | null => {
    const levelQuestions = getQuestionsByLevel(currentLevel);
    
    if (!currentQuestionId) {
      const firstQ = levelQuestions[0];
      return firstQ ? { question: firstQ, level: currentLevel } : null;
    }
    
    const currentIndex = levelQuestions.findIndex(q => q.id === currentQuestionId);
    const nextInLevel = levelQuestions[currentIndex + 1];
    
    if (nextInLevel) {
      return { question: nextInLevel, level: currentLevel };
    }
    
    // Passer au niveau suivant
    for (let nextLevel = currentLevel + 1; nextLevel <= 5; nextLevel++) {
      const nextLevelQuestions = getQuestionsByLevel(nextLevel);
      if (nextLevelQuestions.length > 0) {
        return { question: nextLevelQuestions[0], level: nextLevel };
      }
    }
    
    return null; // Plus de questions
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
