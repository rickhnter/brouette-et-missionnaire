import { useState, useEffect } from 'react';
import { LoginScreen } from '@/components/LoginScreen';
import { WaitingRoom } from '@/components/WaitingRoom';
import { CategorySelection } from '@/components/CategorySelection';
import { QuestionScreen } from '@/components/QuestionScreen';
import { WaitingForPartner } from '@/components/WaitingForPartner';
import { RevealAnswers } from '@/components/RevealAnswers';
import { HistoryScreen } from '@/components/HistoryScreen';
import { GameNavigation } from '@/components/GameNavigation';
import { EndScreen } from '@/components/EndScreen';
import { useGameSession } from '@/hooks/useGameSession';
import { useQuestions } from '@/hooks/useQuestions';
import { useAnswers } from '@/hooks/useAnswers';
import { supabase } from '@/integrations/supabase/client';

type GameState = 
  | 'login'
  | 'waiting'
  | 'category-selection'
  | 'question'
  | 'waiting-partner'
  | 'reveal'
  | 'history'
  | 'end';

const Index = () => {
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>('login');
  const [previousState, setPreviousState] = useState<GameState>('login');

  const { session, loading, findOrCreateSession, selectCategory, updateSession } = useGameSession(playerName);
  const { categories, getQuestionById, getNextQuestion, loading: questionsLoading } = useQuestions();
  const { 
    submitAnswer, 
    hasPlayerAnswered, 
    hasPartnerAnswered, 
    getPlayerAnswer, 
    getPartnerAnswer 
  } = useAnswers(session?.id || null, session?.current_question_id || null);

  const currentQuestion = session?.current_question_id 
    ? getQuestionById(session.current_question_id) 
    : null;

  const partnerName = session?.player1_name === playerName 
    ? session?.player2_name 
    : session?.player1_name;

  // Gérer la connexion
  const handleLogin = (name: string) => {
    setPlayerName(name);
  };

  // Trouver ou créer une session après login
  useEffect(() => {
    if (playerName && !session) {
      findOrCreateSession();
    }
  }, [playerName, session, findOrCreateSession]);

  // Gérer les transitions d'état basées sur la session
  useEffect(() => {
    if (!session) return;

    if (gameState === 'login' && playerName) {
      setGameState('waiting');
    }

    // Les deux joueurs sont connectés
    if (session.player1_connected && session.player2_connected) {
      if (gameState === 'waiting') {
        setGameState('category-selection');
      }
    }

    // Une catégorie a été sélectionnée
    if (session.current_category && session.current_question_id) {
      if (gameState === 'category-selection') {
        setGameState('question');
      }
    }
  }, [session, gameState, playerName]);

  // Gérer la logique de révélation des réponses
  useEffect(() => {
    if (!session?.current_question_id || !playerName) return;

    const playerAnswered = hasPlayerAnswered(playerName);
    const partnerAnswered = hasPartnerAnswered(playerName);

    if (gameState === 'question' && playerAnswered && !partnerAnswered) {
      setGameState('waiting-partner');
    }

    if ((gameState === 'waiting-partner' || gameState === 'question') && playerAnswered && partnerAnswered) {
      setGameState('reveal');
    }
  }, [hasPlayerAnswered, hasPartnerAnswered, playerName, session?.current_question_id, gameState]);

  const handleSelectCategory = async (category: string) => {
    await selectCategory(category);
    setGameState('question');
  };

  const handleAnswer = async (answer: string) => {
    if (!playerName) return;
    await submitAnswer(playerName, answer, false);
  };

  const handleSkip = async () => {
    if (!playerName) return;
    await submitAnswer(playerName, null, true);
  };

  const handleNextQuestion = async () => {
    if (!session?.current_category || !session?.current_question_id) return;

    const nextQuestion = getNextQuestion(session.current_category, session.current_question_id);
    
    if (nextQuestion) {
      await updateSession({ current_question_id: nextQuestion.id });
      setGameState('question');
    } else {
      setGameState('end');
    }
  };

  const handleShowHistory = () => {
    setPreviousState(gameState);
    setGameState('history');
  };

  const handleBackFromHistory = () => {
    setGameState(previousState);
  };

  const handleLogout = () => {
    setPlayerName(null);
    setGameState('login');
  };

  const handlePlayAgain = () => {
    setGameState('category-selection');
  };

  // Rendu conditionnel basé sur l'état du jeu
  if (gameState === 'login') {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (loading || questionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 flex items-center justify-center">
        <div className="text-rose-600">Chargement...</div>
      </div>
    );
  }

  if (gameState === 'history' && session?.id) {
    return (
      <>
        <GameNavigation 
          playerName={playerName!} 
          onShowHistory={handleShowHistory} 
          onLogout={handleLogout} 
        />
        <HistoryScreen sessionId={session.id} onBack={handleBackFromHistory} />
      </>
    );
  }

  if (gameState === 'waiting') {
    return (
      <>
        <GameNavigation 
          playerName={playerName!} 
          onShowHistory={handleShowHistory} 
          onLogout={handleLogout} 
        />
        <WaitingRoom 
          playerName={playerName!} 
          partnerName={partnerName || undefined} 
        />
      </>
    );
  }

  if (gameState === 'category-selection') {
    return (
      <>
        <GameNavigation 
          playerName={playerName!} 
          onShowHistory={handleShowHistory} 
          onLogout={handleLogout} 
        />
        <CategorySelection
          categories={categories}
          onSelectCategory={handleSelectCategory}
          playerName={playerName!}
          partnerName={partnerName!}
        />
      </>
    );
  }

  if (gameState === 'question' && currentQuestion) {
    return (
      <>
        <GameNavigation 
          playerName={playerName!} 
          onShowHistory={handleShowHistory} 
          onLogout={handleLogout} 
        />
        <QuestionScreen
          question={currentQuestion}
          playerName={playerName!}
          onAnswer={handleAnswer}
          onSkip={handleSkip}
        />
      </>
    );
  }

  if (gameState === 'waiting-partner' && partnerName) {
    return (
      <>
        <GameNavigation 
          playerName={playerName!} 
          onShowHistory={handleShowHistory} 
          onLogout={handleLogout} 
        />
        <WaitingForPartner partnerName={partnerName} />
      </>
    );
  }

  if (gameState === 'reveal' && currentQuestion) {
    const playerAnswer = getPlayerAnswer(playerName!);
    const partnerAnswer = getPartnerAnswer(playerName!);

    return (
      <>
        <GameNavigation 
          playerName={playerName!} 
          onShowHistory={handleShowHistory} 
          onLogout={handleLogout} 
        />
        <RevealAnswers
          question={currentQuestion.question}
          playerName={playerName!}
          partnerName={partnerName!}
          playerAnswer={playerAnswer?.answer || null}
          partnerAnswer={partnerAnswer?.answer || null}
          playerSkipped={playerAnswer?.skipped || false}
          partnerSkipped={partnerAnswer?.skipped || false}
          onNext={handleNextQuestion}
        />
      </>
    );
  }

  if (gameState === 'end') {
    return (
      <>
        <GameNavigation 
          playerName={playerName!} 
          onShowHistory={handleShowHistory} 
          onLogout={handleLogout} 
        />
        <EndScreen
          playerName={playerName!}
          partnerName={partnerName!}
          onShowHistory={handleShowHistory}
          onPlayAgain={handlePlayAgain}
        />
      </>
    );
  }

  return null;
};

export default Index;
