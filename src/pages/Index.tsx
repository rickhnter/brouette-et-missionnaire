import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RoomHomeScreen } from '@/components/RoomHomeScreen';
import { CreateRoomScreen } from '@/components/CreateRoomScreen';
import { JoinRoomScreen } from '@/components/JoinRoomScreen';
import { MyRoomsScreen } from '@/components/MyRoomsScreen';
import { WaitingRoom } from '@/components/WaitingRoom';
import { QuestionScreen } from '@/components/QuestionScreen';
import { WaitingForPartner } from '@/components/WaitingForPartner';
import { RevealAnswers } from '@/components/RevealAnswers';
import { HistoryScreen } from '@/components/HistoryScreen';
import { GameNavigation } from '@/components/GameNavigation';
import { EndScreen } from '@/components/EndScreen';
import { EventScreen } from '@/components/events/EventScreen';
import { PartnerEventNotification } from '@/components/events/PartnerEventNotification';
import { LevelUpAnimation } from '@/components/LevelUpAnimation';
import { useRoom, Room } from '@/hooks/useRoom';
import { useQuestions } from '@/hooks/useQuestions';
import { useAnswers } from '@/hooks/useAnswers';
import { useGameEvents, GameEvent } from '@/hooks/useGameEvents';
import { supabase } from '@/integrations/supabase/client';

type RoomState = 'home' | 'create' | 'join' | 'my-rooms';

type GameState =
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
  const codeFromUrl = searchParams.get('code');
  
  // Room management
  const [roomState, setRoomState] = useState<RoomState | null>(codeFromUrl ? 'join' : null);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [hasExistingRooms, setHasExistingRooms] = useState(false);
  
  // Game state
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [previousState, setPreviousState] = useState<GameState>('waiting');
  const [revealData, setRevealData] = useState<RevealData | null>(null);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [partnerEvent, setPartnerEvent] = useState<GameEvent | null>(null);
  const [partnerEventResponse, setPartnerEventResponse] = useState<string | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpLevel, setLevelUpLevel] = useState<number>(1);
  const answeredQuestionsCount = useRef(0);
  const answeredQuestionsInitialized = useRef(false);

  const { 
    loading: roomLoading, 
    error: roomError, 
    currentRoom, 
    setCurrentRoom,
    createRoom, 
    joinRoom, 
    getMyRooms, 
    resumeRoom,
    leaveRoom,
    getLocalRoomEntries 
  } = useRoom();

  const { questions, getQuestionById, getNextQuestion, loading: questionsLoading } = useQuestions();
  const { 
    answers,
    submitAnswer, 
    getPlayerAnswer, 
    getPartnerAnswer 
  } = useAnswers(currentRoom?.id || null, currentRoom?.current_question_id || null);

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
  } = useGameEvents(currentRoom?.id || null);

  const playerAnswered = playerName ? answers.some(a => a.player_name === playerName) : false;
  const partnerAnswered = playerName ? answers.some(a => a.player_name !== playerName) : false;

  const currentQuestion = currentRoom?.current_question_id 
    ? getQuestionById(currentRoom.current_question_id) 
    : null;

  const partnerName = currentRoom?.player1_name === playerName 
    ? currentRoom?.player2_name 
    : currentRoom?.player1_name;

  // Extract event fields from room for sync logic
  const currentEventId = currentRoom?.current_event_id || null;
  const eventPlayerNameFromRoom = currentRoom?.event_player_name || null;

  // Check for existing rooms on mount
  useEffect(() => {
    const checkExistingRooms = () => {
      const entries = getLocalRoomEntries();
      setHasExistingRooms(entries.length > 0);
    };
    checkExistingRooms();
  }, [getLocalRoomEntries]);

  // Room realtime subscription
  useEffect(() => {
    if (!currentRoom?.id) return;

    const channel = supabase
      .channel(`room-${currentRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_sessions',
          filter: `id=eq.${currentRoom.id}`
        },
        (payload) => {
          if (payload.new) {
            setCurrentRoom(payload.new as Room);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentRoom?.id, setCurrentRoom]);

  // Transition from room state to game state when room is set
  useEffect(() => {
    if (currentRoom && playerName && !gameState) {
      setGameState('waiting');
      setRoomState(null);
    }
  }, [currentRoom, playerName, gameState]);

  // Auto-start game when both players connected
  useEffect(() => {
    if (!currentRoom || gameState !== 'waiting') return;

    if (currentRoom.player1_connected && currentRoom.player2_connected) {
      if (!currentRoom.current_question_id) {
        startGame();
      } else if (!currentEventId) {
        // No active event - restore state based on answers
        if (playerAnswered && partnerAnswered) {
          setGameState('reveal');
        } else if (playerAnswered && !partnerAnswered) {
          setGameState('waiting-partner');
        } else {
          setGameState('question');
        }
      }
      // If currentEventId is set, the event detection effect will handle state
    }
  }, [currentRoom, gameState, playerAnswered, partnerAnswered, currentEventId]);

  // Unified event state management - detects active events and routes to correct screen
  useEffect(() => {
    if (!currentRoom || !playerName || !events.length) return;
    if (gameState === 'history') return;
    
    if (currentEventId) {
      const event = events.find(e => e.id === currentEventId);
      if (!event) return;
      
      if (event.requires_both) {
        // SYNC EVENT: both players participate
        setCurrentEvent(event);
        setPartnerEvent(null);
        fetchResponses(currentEventId);
        
        if (gameState !== 'event' && gameState !== 'event-waiting' && gameState !== 'event-reveal') {
          setGameState('event');
        }
      } else {
        // SOLO EVENT
        if (eventPlayerNameFromRoom === playerName) {
          // I'm the active player
          setCurrentEvent(event);
          setPartnerEvent(null);
          if (gameState !== 'event') {
            setGameState('event');
          }
        } else {
          // I'm the partner - watching
          setPartnerEvent(event);
          setCurrentEvent(null);
          fetchResponses(currentEventId);
          
          if (gameState !== 'partner-event-waiting' && gameState !== 'partner-event-notification') {
            setGameState('partner-event-waiting');
          }
        }
      }
    } else if (
      gameState === 'event' || 
      gameState === 'event-waiting' || 
      gameState === 'event-reveal' || 
      gameState === 'partner-event-waiting' || 
      gameState === 'partner-event-notification'
    ) {
      // Event was cleared - return to question
      setCurrentEvent(null);
      setPartnerEvent(null);
      setPartnerEventResponse(null);
      setGameState('question');
    }
  }, [currentEventId, eventPlayerNameFromRoom, playerName, events, currentRoom]);

  // Event response polling - periodically checks for partner responses
  useEffect(() => {
    if (!currentEventId || !playerName) return;
    
    const isPollingState = gameState === 'event' || gameState === 'event-waiting' || 
      gameState === 'partner-event-waiting';
    if (!isPollingState) return;

    const pollResponses = async () => {
      await fetchResponses(currentEventId);
      
      const event = events.find(e => e.id === currentEventId);
      if (!event) return;

      if (event.requires_both) {
        const playerDone = hasPlayerResponded(currentEventId, playerName);
        const partnerDone = hasPartnerResponded(currentEventId, playerName);
        
        if (playerDone && partnerDone) {
          setGameState('event-reveal');
        } else if (playerDone) {
          setGameState('event-waiting');
        }
      } else if (eventPlayerNameFromRoom !== playerName) {
        // Solo event: partner side - check if active player completed
        const partnerResp = getPartnerResponse(currentEventId, playerName);
        if (partnerResp?.completed) {
          setPartnerEventResponse(partnerResp.response);
          setGameState('partner-event-notification');
        }
      }
    };

    pollResponses();
    const interval = setInterval(pollResponses, 2000);
    return () => clearInterval(interval);
  }, [currentEventId, gameState, playerName, eventPlayerNameFromRoom, events]);

  // Initialize answered count
  useEffect(() => {
    const initializeAnsweredCount = async () => {
      if (!currentRoom?.id || answeredQuestionsInitialized.current) return;
      
      const { data, error } = await supabase
        .from('answers')
        .select('question_id')
        .eq('session_id', currentRoom.id);
      
      if (!error && data) {
        const uniqueQuestions = new Set(data.map(a => a.question_id));
        answeredQuestionsCount.current = uniqueQuestions.size;
        answeredQuestionsInitialized.current = true;
      }
    };
    
    initializeAnsweredCount();
  }, [currentRoom?.id]);

  // Question change detection
  const [lastQuestionId, setLastQuestionId] = useState<string | null>(null);
  
  useEffect(() => {
    if (currentRoom?.current_question_id && currentRoom.current_question_id !== lastQuestionId) {
      setLastQuestionId(currentRoom.current_question_id);
      if (!currentEventId && (gameState === 'reveal' || gameState === 'waiting-partner')) {
        setGameState('question');
      }
    }
  }, [currentRoom?.current_question_id, lastQuestionId, gameState, currentEventId]);

  // Answer state transitions (blocked during active events)
  useEffect(() => {
    if (!currentRoom?.current_question_id || !playerName) return;
    if (currentEventId) return; // Block during events

    if (gameState === 'question' && playerAnswered && !partnerAnswered) {
      setGameState('waiting-partner');
    }

    if ((gameState === 'waiting-partner' || gameState === 'question') && playerAnswered && partnerAnswered) {
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
  }, [playerAnswered, partnerAnswered, playerName, currentRoom?.current_question_id, gameState, currentQuestion, getPlayerAnswer, getPartnerAnswer, currentEventId]);

  // Sync event response detection from realtime updates
  useEffect(() => {
    if (gameState !== 'event-waiting' && gameState !== 'event') return;
    if (!currentEvent?.requires_both || !playerName) return;

    const playerDone = hasPlayerResponded(currentEvent.id, playerName);
    const partnerDone = hasPartnerResponded(currentEvent.id, playerName);

    if (playerDone && partnerDone) {
      setGameState('event-reveal');
    } else if (playerDone && !partnerDone) {
      setGameState('event-waiting');
    }
  }, [gameState, currentEvent, playerName, hasPlayerResponded, hasPartnerResponded]);

  const startGame = async () => {
    if (!currentRoom?.id) return;

    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .select('id')
      .eq('level', 1)
      .order('sort_order', { ascending: true })
      .limit(1);

    if (questionsError) return;

    await supabase
      .from('game_sessions')
      .update({
        current_level: 1,
        current_question_id: questionsData?.[0]?.id || null,
        status: 'playing'
      })
      .eq('id', currentRoom.id);
    
    setGameState('question');
  };

  const updateSession = async (updates: Partial<Room>) => {
    if (!currentRoom?.id) return;
    await supabase
      .from('game_sessions')
      .update(updates)
      .eq('id', currentRoom.id);
  };

  // Room handlers
  const handleCreateRoom = async (name: string, roomName?: string) => {
    const room = await createRoom(name, roomName);
    if (room) {
      setPlayerName(name);
      setSearchParams({});
    }
  };

  const handleJoinRoom = async (code: string, name: string) => {
    const room = await joinRoom(code, name);
    if (room) {
      setPlayerName(name);
      setSearchParams({});
    }
  };

  const handleResumeRoom = async (roomId: string, name: string) => {
    const room = await resumeRoom(roomId, name);
    if (room) {
      setPlayerName(name);
    }
  };

  // Game handlers
  const handleAnswer = async (answer: string) => {
    if (!playerName) return;
    await submitAnswer(playerName, answer, false);
  };

  const handleSkip = async () => {
    if (!playerName) return;
    await submitAnswer(playerName, null, true);
  };

  const handleNextQuestion = async () => {
    if (!currentRoom?.current_level || !currentRoom?.current_question_id) return;
    if (!playerAnswered || !partnerAnswered) return;

    setRevealData(null);
    answeredQuestionsCount.current += 1;

    if (answeredQuestionsCount.current >= 2 && shouldTriggerEvent(answeredQuestionsCount.current)) {
      const event = getRandomEvent(currentRoom.current_level);
      if (event) {
        setCurrentEvent(event);
        resetResponses();
        
        // Sync events: event_player_name = null (both participate)
        // Solo events: event_player_name = triggering player
        await updateSession({
          current_event_id: event.id,
          event_player_name: event.requires_both ? null : playerName
        });
        
        setGameState('event');
        return;
      }
    }

    await proceedToNextQuestion();
  };

  const proceedToNextQuestion = async () => {
    if (!currentRoom?.current_level || !currentRoom?.current_question_id) return;

    const next = getNextQuestion(currentRoom.current_level, currentRoom.current_question_id);
    
    if (next) {
      const isLevelUp = next.level > currentRoom.current_level;
      
      await updateSession({ 
        current_question_id: next.question.id,
        current_level: next.level,
        current_event_id: null,
        event_player_name: null
      });
      
      if (isLevelUp) {
        setLevelUpLevel(next.level);
        setShowLevelUp(true);
      } else {
        setGameState('question');
      }
    } else {
      setGameState('end');
    }
  };

  const handleLevelUpComplete = () => {
    setShowLevelUp(false);
    setGameState('question');
  };

  const handleEventSubmit = async (response: string | null) => {
    if (!currentEvent || !playerName) return;
    await submitResponse(currentEvent.id, playerName, response, true);
    
    if (currentEvent.requires_both) {
      // Sync event: wait for partner response
      setGameState('event-waiting');
      await fetchResponses(currentEvent.id);
    }
    // Solo event: stay on event screen, player will click Continue
  };

  const handleEventComplete = async () => {
    // Guard: only advance if event is still active (prevents double-advance)
    if (!currentEventId) {
      setCurrentEvent(null);
      resetResponses();
      return;
    }
    
    setCurrentEvent(null);
    resetResponses();
    
    await updateSession({
      current_event_id: null,
      event_player_name: null
    });
    
    await proceedToNextQuestion();
  };

  const handlePartnerEventContinue = async () => {
    // Guard: only advance if event is still active (prevents double-advance)
    if (!currentEventId) {
      setPartnerEvent(null);
      setPartnerEventResponse(null);
      return;
    }
    
    setPartnerEvent(null);
    setPartnerEventResponse(null);
    resetResponses();
    
    await updateSession({
      current_event_id: null,
      event_player_name: null
    });
    
    await proceedToNextQuestion();
  };

  const handleShowHistory = () => {
    setPreviousState(gameState || 'waiting');
    setGameState('history');
  };

  const handleBackFromHistory = () => {
    setGameState(previousState);
  };

  const handleLogout = () => {
    leaveRoom();
    setPlayerName(null);
    setGameState(null);
    setRoomState(null);
    answeredQuestionsInitialized.current = false;
    answeredQuestionsCount.current = 0;
    setSearchParams({});
  };

  const handlePlayAgain = async () => {
    await startGame();
    setGameState('question');
  };

  // Level Up Animation
  if (showLevelUp) {
    return <LevelUpAnimation level={levelUpLevel} onComplete={handleLevelUpComplete} />;
  }

  // Room selection screens
  if (!currentRoom) {
    if (roomState === 'create') {
      return (
        <CreateRoomScreen
          onBack={() => setRoomState(null)}
          onCreate={handleCreateRoom}
          loading={roomLoading}
          error={roomError}
        />
      );
    }

    if (roomState === 'join') {
      return (
        <JoinRoomScreen
          onBack={() => {
            setRoomState(null);
            setSearchParams({});
          }}
          onJoin={handleJoinRoom}
          loading={roomLoading}
          error={roomError}
          prefilledCode={codeFromUrl || undefined}
        />
      );
    }

    if (roomState === 'my-rooms') {
      return (
        <MyRoomsScreen
          onBack={() => setRoomState(null)}
          onResume={handleResumeRoom}
          getMyRooms={getMyRooms}
          getLocalRoomEntries={getLocalRoomEntries}
          loading={roomLoading}
        />
      );
    }

    return (
      <RoomHomeScreen
        onCreateRoom={() => setRoomState('create')}
        onJoinRoom={() => setRoomState('join')}
        onMyRooms={() => setRoomState('my-rooms')}
        hasExistingRooms={hasExistingRooms}
      />
    );
  }

  // Loading state
  if (roomLoading || questionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 flex items-center justify-center">
        <div className="text-rose-600">Chargement...</div>
      </div>
    );
  }

  // Game states
  if (gameState === 'history' && currentRoom?.id) {
    return (
      <>
        <GameNavigation 
          playerName={playerName!} 
          onShowHistory={handleShowHistory} 
          onLogout={handleLogout} 
        />
        <HistoryScreen sessionId={currentRoom.id} onBack={handleBackFromHistory} />
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
          roomCode={currentRoom.room_code}
          roomName={currentRoom.room_name || undefined}
        />
      </>
    );
  }

  if (gameState === 'question' && currentQuestion && !currentEventId) {
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
          currentLevel={currentRoom?.current_level || 1}
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
          currentLevel={currentRoom?.current_level || 1}
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
