import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type EventType = 'message' | 'promise' | 'photo' | 'sync' | 'game' | 'confession';

type RawEventType = string;

export interface GameEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  level: number;
  requires_both: boolean;
  is_private: boolean;
  options: string[] | null;
  sort_order: number | null;
}

export interface EventResponse {
  id: string;
  session_id: string;
  event_id: string;
  player_name: string;
  response: string | null;
  completed: boolean;
  created_at: string;
}

const EVENT_TRIGGER_PROBABILITY = 0.40; // 40% chance

export const useGameEvents = (sessionId: string | null, currentEventId?: string | null) => {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [responses, setResponses] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const usedEventIds = useRef<Set<string>>(new Set());

  // Fetch all events
  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('game_events')
        .select('*')
        .order('level', { ascending: true })
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('[Events] Erreur fetch events:', error);
      } else {
        const typedData = (data || []).map(event => ({
          ...event,
          type: event.type as EventType
        }));
        setEvents(typedData);
      }
      setLoading(false);
    };

    fetchEvents();
  }, []);

  // CORRECTION 2 : Réinitialiser les réponses à chaque changement d'événement actif
  // Cela évite que les réponses d'un événement précédent contaminent l'événement courant
  useEffect(() => {
    console.log('[Events] currentEventId changé →', currentEventId, '— reset des réponses');
    setResponses([]);
  }, [currentEventId]);

  // Fetch responses pour l'événement actif — remplace proprement le state (pas de merge)
  const fetchResponses = useCallback(async (eventId: string) => {
    if (!sessionId || !eventId) return;

    const { data, error } = await supabase
      .from('event_responses')
      .select('*')
      .eq('session_id', sessionId)
      .eq('event_id', eventId);

    if (error) {
      console.error('[Events] Erreur fetch responses:', error);
    } else {
      // Remplacement propre : on ne garde que les réponses de cet eventId
      // (pas de merge qui accumulerait les réponses d'événements passés)
      setResponses(prev => {
        const merged = [...prev];
        for (const item of (data || [])) {
          // Ne traiter que les réponses pour l'eventId demandé
          if (item.event_id !== eventId) continue;
          const existingIdx = merged.findIndex(r => r.id === item.id);
          if (existingIdx >= 0) {
            merged[existingIdx] = item;
          } else {
            merged.push(item);
          }
        }
        // Purger les réponses qui ne correspondent plus à l'eventId actif
        return merged.filter(r => r.event_id === eventId);
      });
    }
  }, [sessionId]);

  // Listen for real-time response updates — filtre strict par currentEventId
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`event-responses-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_responses',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newResponse = payload.new as EventResponse;
            
            // Filtrage strict : ignorer les réponses qui ne sont pas pour l'événement courant
            if (currentEventId && newResponse.event_id !== currentEventId) {
              console.log('[Events] Réponse realtime ignorée — event_id différent:', newResponse.event_id, '!==', currentEventId);
              return;
            }
            
            setResponses(prev => {
              if (prev.some(r => r.id === newResponse.id)) return prev;
              console.log('[Events] Nouvelle réponse realtime de', newResponse.player_name, 'pour event', newResponse.event_id);
              return [...prev, newResponse];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedResponse = payload.new as EventResponse;
            
            // Filtrage strict pour les updates aussi
            if (currentEventId && updatedResponse.event_id !== currentEventId) {
              return;
            }
            
            setResponses(prev => 
              prev.map(r => r.id === updatedResponse.id ? updatedResponse : r)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, currentEventId]);

  // Determine if an event should trigger
  const shouldTriggerEvent = useCallback((questionIndex: number): boolean => {
    // Don't trigger on the first question
    if (questionIndex <= 1) return false;
    
    // Random probability
    return Math.random() < EVENT_TRIGGER_PROBABILITY;
  }, []);

  // Get a random event for the current level with type balancing
  const getRandomEvent = useCallback((level: number, forcedType?: string): GameEvent | null => {
    let eligibleEvents = events.filter(
      e => e.level <= level && !usedEventIds.current.has(e.id)
    );

    if (forcedType) {
      const typedEvents = eligibleEvents.filter(e => e.type === forcedType);
      if (typedEvents.length > 0) {
        eligibleEvents = typedEvents;
      }
    } else {
      const gameEvents = eligibleEvents.filter(e => e.type === 'game');
      if (gameEvents.length > 0 && Math.random() < 0.5) {
        eligibleEvents = gameEvents;
      }
    }

    if (eligibleEvents.length === 0) {
      usedEventIds.current.clear();
      let allEligible = events.filter(e => e.level <= level);
      
      if (forcedType) {
        const typedEvents = allEligible.filter(e => e.type === forcedType);
        if (typedEvents.length > 0) {
          allEligible = typedEvents;
        }
      }
      
      if (allEligible.length === 0) return null;
      
      const randomIndex = Math.floor(Math.random() * allEligible.length);
      const selected = allEligible[randomIndex];
      usedEventIds.current.add(selected.id);
      return selected;
    }

    const randomIndex = Math.floor(Math.random() * eligibleEvents.length);
    const selected = eligibleEvents[randomIndex];
    usedEventIds.current.add(selected.id);
    return selected;
  }, [events]);

  // Submit a response to an event
  const submitResponse = async (
    eventId: string,
    playerName: string,
    response: string | null,
    completed: boolean = true
  ) => {
    if (!sessionId) return;

    const existingResponse = responses.find(
      r => r.event_id === eventId && r.player_name === playerName
    );

    if (existingResponse) {
      const { error } = await supabase
        .from('event_responses')
        .update({ response, completed })
        .eq('id', existingResponse.id);

      if (error) {
        console.error('[Events] Erreur update response:', error);
      }
    } else {
      const { error } = await supabase
        .from('event_responses')
        .insert({
          session_id: sessionId,
          event_id: eventId,
          player_name: playerName,
          response,
          completed
        });

      if (error) {
        console.error('[Events] Erreur insert response:', error);
      }
    }
  };

  // Get response helpers — filtrage par eventId strict
  const getPlayerResponse = (eventId: string, playerName: string) => {
    return responses.find(r => r.event_id === eventId && r.player_name === playerName);
  };

  const getPartnerResponse = (eventId: string, playerName: string) => {
    return responses.find(r => r.event_id === eventId && r.player_name !== playerName);
  };

  const hasPlayerResponded = (eventId: string, playerName: string) => {
    return responses.some(r => r.event_id === eventId && r.player_name === playerName && r.completed);
  };

  const hasPartnerResponded = (eventId: string, playerName: string) => {
    return responses.some(r => r.event_id === eventId && r.player_name !== playerName && r.completed);
  };

  const resetResponses = () => {
    setResponses([]);
  };

  return {
    events,
    responses,
    loading,
    shouldTriggerEvent,
    getRandomEvent,
    submitResponse,
    fetchResponses,
    getPlayerResponse,
    getPartnerResponse,
    hasPlayerResponded,
    hasPartnerResponded,
    resetResponses
  };
};
