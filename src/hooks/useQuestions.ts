import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Question {
  id: string;
  question: string;
  category: string;
  category_icon: string;
  suggestions: string[];
  sort_order: number;
}

export const useQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<{ name: string; icon: string }[]>([]);
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

      // Extraire les catégories uniques
      const uniqueCategories = Array.from(
        new Map(data?.map(q => [q.category, { name: q.category, icon: q.category_icon }]) || []).values()
      );
      setCategories(uniqueCategories);
      setLoading(false);
    };

    fetchQuestions();
  }, []);

  const getQuestionsByCategory = (category: string) => {
    return questions.filter(q => q.category === category);
  };

  const getQuestionById = (id: string) => {
    return questions.find(q => q.id === id);
  };

  const getNextQuestion = (category: string, currentQuestionId: string | null) => {
    const categoryQuestions = getQuestionsByCategory(category);
    if (!currentQuestionId) return categoryQuestions[0] || null;
    
    const currentIndex = categoryQuestions.findIndex(q => q.id === currentQuestionId);
    return categoryQuestions[currentIndex + 1] || null;
  };

  return {
    questions,
    categories,
    loading,
    getQuestionsByCategory,
    getQuestionById,
    getNextQuestion
  };
};
