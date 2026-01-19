import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LoginScreen } from '@/components/LoginScreen';
import { WaitingRoom } from '@/components/WaitingRoom';
import { QuestionScreen } from '@/components/QuestionScreen';
import { WaitingForPartner } from '@/components/WaitingForPartner';
import { RevealAnswers } from '@/components/RevealAnswers';
import { HistoryScreen } from '@/components/HistoryScreen';
import { GameNavigation } from '@/components/GameNavigation';
import { EndScreen } from '@/components/EndScreen';
import { EventScreen } from '@/components/events/EventScreen';
import { PartnerEventNotification } from '@/components/events/PartnerEventNotification';
import { useGameSession } from '@/hooks/useGameSession';
import { useQuestions } from '@/hooks/useQuestions';
import { useAnswers } from '@/hooks/useAnswers';
import { useGameEvents, GameEvent } from '@/hooks/useGameEvents';

type GameState = 
  | 'login'
  | 'waiting'
  | 'question'
  | 'waiting-partner'
  | 'reveal'
  | 'history'
  | 'end'
  | 'event'
  | 'event-waiting'
  | 'event-reveal'
  | 'partner-event-waiting'
  | 'partner-event-notification';

interface RevealData {
  questionId: string;
  questionText: string;
  playerAnswer: { answer: string | null; skipped: boolean } | null;
  partnerAnswer: { answer: string | null; skipped: boolean } | null;
}

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const playerFromUrl = searchParams.get('player');
  
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>('login');
  const [previousState, setPreviousState] = useState<GameState>('login');
  const [revealData, setRevealData] = useState<RevealData | null>(null);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [partnerEvent, setPartnerEvent] = useState<GameEvent | null>(null);
  const [partnerEventResponse, setPartnerEventResponse] = useState<string | null>(null);
  // Track answered questions to persist event trigger logic across page reloads
  const answeredQuestionsCount = useRef(0);
  const answeredQuestionsInitialized = useRef(false);
  const { session, loading, findOrCreateSession, startGame, updateSession } = useGameSession(playerName);
  const { questions, getQuestionById, getNextQuestion, loading: questionsLoading } = useQuestions();
  const { 
    answers,
    submitAnswer, 
    getPlayerAnswer, 
    getPartnerAnswer 
  } = useAnswers(session?.id || null, session?.current_question_id || null);

  const {
    events,
    shouldTriggerEvent,
    getRandomEvent,
    submitResponse,
    getPlayerResponse,
    getPartnerResponse,
    hasPlayerResponded,
    hasPartnerResponded,
    resetResponses,
    fetchResponses
  } = useGameEvents(session?.id || null);

  const playerAnswered = playerName ? answers.some(a => a.player_name === playerName) : false;
  const partnerAnswered = playerName ? answers.some(a => a.player_name !== playerName) : false;

  const currentQuestion = session?.current_question_id 
    ? getQuestionById(session.current_question_id) 
    : null;

  const partnerName = session?.player1_name === playerName 
    ? session?.player2_name 
    : session?.player1_name;

  const handleLogin = (name: string) => {
    setPlayerName(name);
  };

  useEffect(() => {
    if (playerName && !session) {
      findOrCreateSession();
    }
  }, [playerName, session, findOrCreateSession]);

  useEffect(() => {
    if (!session) return;

    if (gameState === 'login' && playerName) {
      setGameState('waiting');
    }

    // Quand les deux joueurs sont connectés, démarrer automatiquement
    if (session.player1_connected && session.player2_connected) {
      if (gameState === 'waiting' && !session.current_question_id) {
        startGame();
      }
    }

    // Si une question est déjà sélectionnée et on est en waiting, restaurer l'état approprié
    if (session.current_question_id && gameState === 'waiting') {
      // Déterminer le bon état en fonction des réponses existantes
      if (playerAnswered && partnerAnswered) {
        setGameState('reveal');
      } else if (playerAnswered && !partnerAnswered) {
        setGameState('waiting-partner');
      } else {
        setGameState('question');
      }
    }
  }, [session, gameState, playerName, startGame, playerAnswered, partnerAnswered]);

  // Détecter quand le partenaire a un événement individuel en cours
  useEffect(() => {
    if (!session || !playerName || !events.length) return;
    
    const sessionAny = session as any;
    const currentEventId = sessionAny.current_event_id;
    const eventPlayerName = sessionAny.event_player_name;
    
    // Si un événement est en cours et ce n'est pas pour ce joueur
    if (currentEventId && eventPlayerName && eventPlayerName !== playerName) {
      const event = events.find(e => e.id === currentEventId);
      if (event && !event.requires_both) {
        setPartnerEvent(event);
        
        // Vérifier si le partenaire a déjà répondu
        fetchResponses(currentEventId).then(() => {
          const partnerResp = getPartnerResponse(currentEventId, playerName);
          if (partnerResp?.completed) {
            setPartnerEventResponse(partnerResp.response);
            setGameState('partner-event-notification');
          } else {
            setGameState('partner-event-waiting');
          }
        });
      }
    } else if (!currentEventId && (gameState === 'partner-event-waiting' || gameState === 'partner-event-notification')) {
      // L'événement est terminé, retourner à la question
      setPartnerEvent(null);
      setPartnerEventResponse(null);
      setGameState('question');
    }
  }, [session, playerName, events, gameState, fetchResponses, getPartnerResponse]);

  // Surveiller les réponses du partenaire pendant partner-event-waiting
  useEffect(() => {
    if (gameState !== 'partner-event-waiting' || !partnerEvent || !playerName) return;

    const checkPartnerResponse = async () => {
      await fetchResponses(partnerEvent.id);
      const partnerResp = getPartnerResponse(partnerEvent.id, playerName);
      if (partnerResp?.completed) {
        setPartnerEventResponse(partnerResp.response);
        setGameState('partner-event-notification');
      }
    };

    const interval = setInterval(checkPartnerResponse, 2000);
    return () => clearInterval(interval);
  }, [gameState, partnerEvent, playerName, fetchResponses, getPartnerResponse]);

  // Initialiser le compteur de questions répondues à partir de la base de données
  useEffect(() => {
    const initializeAnsweredCount = async () => {
      if (!session?.id || answeredQuestionsInitialized.current) return;
      
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from('answers')
        .select('question_id')
        .eq('session_id', session.id);
      
      if (!error && data) {
        // Compter les questions uniques répondues (chaque question a 2 réponses)
        const uniqueQuestions = new Set(data.map(a => a.question_id));
        answeredQuestionsCount.current = uniqueQuestions.size;
        answeredQuestionsInitialized.current = true;
        console.log('Initialized answered questions count:', answeredQuestionsCount.current);
      }
    };
    
    initializeAnsweredCount();
  }, [session?.id]);

  // Réinitialiser l'état quand la question change
  const [lastQuestionId, setLastQuestionId] = useState<string | null>(null);
  
  useEffect(() => {
    if (session?.current_question_id && session.current_question_id !== lastQuestionId) {
      setLastQuestionId(session.current_question_id);
      // Quand la question change via la session (sync avec l'autre joueur), repasser en mode question
      if (gameState === 'reveal' || gameState === 'waiting-partner') {
        setGameState('question');
      }
    }
  }, [session?.current_question_id, lastQuestionId, gameState]);

  useEffect(() => {
    if (!session?.current_question_id || !playerName) return;

    // Seulement changer d'état si on est en mode question
    if (gameState === 'question' && playerAnswered && !partnerAnswered) {
      setGameState('waiting-partner');
    }

    // Les deux ont répondu : passer à la révélation et capturer les données
    if ((gameState === 'waiting-partner' || gameState === 'question') && playerAnswered && partnerAnswered) {
      // Capturer les données de révélation avant de changer d'état
      const playerAns = getPlayerAnswer(playerName);
      const partnerAns = getPartnerAnswer(playerName);
      
      if (currentQuestion) {
        setRevealData({
          questionId: currentQuestion.id,
          questionText: currentQuestion.question,
          playerAnswer: playerAns ? { answer: playerAns.answer, skipped: playerAns.skipped } : null,
          partnerAnswer: partnerAns ? { answer: partnerAns.answer, skipped: partnerAns.skipped } : null,
        });
      }
      
      setGameState('reveal');
    }
  }, [playerAnswered, partnerAnswered, playerName, session?.current_question_id, gameState, currentQuestion, getPlayerAnswer, getPartnerAnswer]);

  const handleAnswer = async (answer: string) => {
    if (!playerName) return;
    await submitAnswer(playerName, answer, false);
  };

  const handleSkip = async () => {
    if (!playerName) return;
    await submitAnswer(playerName, null, true);
  };

  const handleNextQuestion = async () => {
    if (!session?.current_level || !session?.current_question_id) return;

    if (!playerAnswered || !partnerAnswered) {
      console.warn('Les deux joueurs n\'ont pas encore répondu à cette question');
      return;
    }

    setRevealData(null);
    answeredQuestionsCount.current += 1;

    // Check if we should trigger an event (~25% chance, not on first 2 questions)
    if (answeredQuestionsCount.current >= 2 && shouldTriggerEvent(answeredQuestionsCount.current)) {
      const event = getRandomEvent(session.current_level);
      if (event) {
        setCurrentEvent(event);
        resetResponses();
        
        // Stocker l'événement dans la session pour synchroniser les deux joueurs
        await updateSession({
          current_event_id: event.id,
          event_player_name: playerName
        } as any);
        
        setGameState('event');
        return;
      }
    }

    await proceedToNextQuestion();
  };

  const proceedToNextQuestion = async () => {
    if (!session?.current_level || !session?.current_question_id) return;

    const next = getNextQuestion(session.current_level, session.current_question_id);
    
    if (next) {
      await updateSession({ 
        current_question_id: next.question.id,
        current_level: next.level,
        current_event_id: null,
        event_player_name: null
      } as any);
      setGameState('question');
    } else {
      setGameState('end');
    }
  };

  const handleEventSubmit = async (response: string | null) => {
    if (!currentEvent || !playerName) return;
    await submitResponse(currentEvent.id, playerName, response, true);
    
    if (currentEvent.requires_both) {
      setGameState('event-waiting');
      await fetchResponses(currentEvent.id);
    }
  };

  const handleEventComplete = async () => {
    // Effacer l'événement de la session
    await updateSession({
      current_event_id: null,
      event_player_name: null
    } as any);
    
    setCurrentEvent(null);
    resetResponses();
    await proceedToNextQuestion();
  };

  const handlePartnerEventContinue = async () => {
    // Effacer l'événement de la session
    await updateSession({
      current_event_id: null,
      event_player_name: null
    } as any);
    
    setPartnerEvent(null);
    setPartnerEventResponse(null);
    await proceedToNextQuestion();
  };

  // Watch for partner response during events
  useEffect(() => {
    if (gameState !== 'event-waiting' || !currentEvent || !playerName) return;

    const playerDone = hasPlayerResponded(currentEvent.id, playerName);
    const partnerDone = hasPartnerResponded(currentEvent.id, playerName);

    if (playerDone && partnerDone) {
      setGameState('event-reveal');
    }
  }, [gameState, currentEvent, playerName, hasPlayerResponded, hasPartnerResponded]);

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
    setSearchParams({});
  };

  const handlePlayAgain = async () => {
    await startGame();
    setGameState('question');
  };

  if (gameState === 'login') {
    const validPlayer = playerFromUrl === 'Pierrick' || playerFromUrl === 'Daisy' ? playerFromUrl : null;
    return <LoginScreen onLogin={handleLogin} preSelectedPlayer={validPlayer} />;
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
          currentIndex={questions.findIndex(q => q.id === currentQuestion.id) + 1}
          totalQuestions={questions.length}
          onAnswer={handleAnswer}
          onSkip={handleSkip}
          onShowHistory={handleShowHistory}
          onLogout={handleLogout}
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
        <WaitingForPartner 
          partnerName={partnerName}
          currentLevel={session?.current_level || 1}
          playerName={playerName!}
          onShowHistory={handleShowHistory}
          onLogout={handleLogout}
        />
      </>
    );
  }

  // Event states
  if ((gameState === 'event' || gameState === 'event-waiting' || gameState === 'event-reveal') && currentEvent && playerName && partnerName) {
    const playerResp = getPlayerResponse(currentEvent.id, playerName);
    const partnerResp = getPartnerResponse(currentEvent.id, playerName);
    
    return (
      <>
        <GameNavigation 
          playerName={playerName} 
          onShowHistory={handleShowHistory} 
          onLogout={handleLogout} 
        />
        <EventScreen
          event={currentEvent}
          playerName={playerName}
          partnerName={partnerName}
          onSubmit={handleEventSubmit}
          onComplete={handleEventComplete}
          isWaiting={gameState === 'event-waiting'}
          playerResponse={playerResp?.response}
          partnerResponse={partnerResp?.response}
          showReveal={gameState === 'event-reveal'}
        />
      </>
    );
  }

  // Partner event waiting (when partner is performing an individual action)
  if (gameState === 'partner-event-waiting' && partnerEvent && partnerName) {
    return (
      <>
        <GameNavigation 
          playerName={playerName!} 
          onShowHistory={handleShowHistory} 
          onLogout={handleLogout} 
        />
        <PartnerEventNotification
          event={partnerEvent}
          partnerName={partnerName}
          onContinue={handlePartnerEventContinue}
          isWaiting={true}
        />
      </>
    );
  }

  // Partner event notification (when partner has completed an individual action)
  if (gameState === 'partner-event-notification' && partnerEvent && partnerName) {
    return (
      <>
        <GameNavigation 
          playerName={playerName!} 
          onShowHistory={handleShowHistory} 
          onLogout={handleLogout} 
        />
        <PartnerEventNotification
          event={partnerEvent}
          partnerName={partnerName}
          partnerResponse={partnerEventResponse}
          onContinue={handlePartnerEventContinue}
        />
      </>
    );
  }

  if (gameState === 'reveal' && revealData) {
    return (
      <>
        <GameNavigation 
          playerName={playerName!} 
          onShowHistory={handleShowHistory} 
          onLogout={handleLogout} 
        />
        <RevealAnswers
          question={revealData.questionText}
          playerName={playerName!}
          partnerName={partnerName!}
          playerAnswer={revealData.playerAnswer?.answer || null}
          partnerAnswer={revealData.partnerAnswer?.answer || null}
          playerSkipped={revealData.playerAnswer?.skipped || false}
          partnerSkipped={revealData.partnerAnswer?.skipped || false}
          onNext={handleNextQuestion}
          currentLevel={session?.current_level || 1}
          onShowHistory={handleShowHistory}
          onLogout={handleLogout}
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
          onLogout={handleLogout}
        />
      </>
    );
  }

  return null;
};

export default Index;
