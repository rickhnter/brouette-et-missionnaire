import React from 'react';
import { GameEvent } from '@/hooks/useGameEvents';
import { MessageEvent } from './MessageEvent';
import { PromiseEvent } from './PromiseEvent';
import { PhotoEvent } from './PhotoEvent';
import { SyncEvent } from './SyncEvent';
import { GameEventComponent } from './GameEvent';
import { ConfessionEvent } from './ConfessionEvent';
import { motion } from 'framer-motion';

interface EventScreenProps {
  event: GameEvent;
  playerName: string;
  partnerName: string;
  onSubmit: (response: string | null) => void;
  onComplete: () => void;
  isWaiting?: boolean;
  playerResponse?: string | null;
  partnerResponse?: string | null;
  showReveal?: boolean;
}

const eventIcons: Record<string, string> = {
  message: '💌',
  promise: '🤞',
  photo: '📸',
  sync: '🔗',
  game: '🎲',
  confession: '💋'
};

const eventColors: Record<string, string> = {
  message: 'from-pink-500 to-rose-500',
  promise: 'from-violet-500 to-purple-500',
  photo: 'from-cyan-500 to-blue-500',
  sync: 'from-blue-500 to-indigo-500',
  game: 'from-orange-500 to-amber-500',
  confession: 'from-red-500 to-rose-600'
};

export const EventScreen: React.FC<EventScreenProps> = ({
  event,
  playerName,
  partnerName,
  onSubmit,
  onComplete,
  isWaiting = false,
  playerResponse,
  partnerResponse,
  showReveal = false
}) => {
  const icon = eventIcons[event.type] || '✨';
  const gradientColor = eventColors[event.type] || 'from-pink-500 to-rose-500';

  const renderEventContent = () => {
    switch (event.type) {
      case 'message':
        return (
          <MessageEvent
            event={event}
            playerName={playerName}
            partnerName={partnerName}
            onSubmit={onSubmit}
            isWaiting={isWaiting}
            playerResponse={playerResponse}
            partnerResponse={partnerResponse}
            showReveal={showReveal}
            onComplete={onComplete}
          />
        );
      case 'promise':
        return (
          <PromiseEvent
            event={event}
            playerName={playerName}
            partnerName={partnerName}
            onSubmit={onSubmit}
            isWaiting={isWaiting}
            playerResponse={playerResponse}
            partnerResponse={partnerResponse}
            showReveal={showReveal}
            onComplete={onComplete}
          />
        );
      case 'photo':
        return (
          <PhotoEvent
            event={event}
            playerName={playerName}
            onSubmit={onSubmit}
            onComplete={onComplete}
          />
        );
      case 'sync':
        return (
          <SyncEvent
            event={event}
            playerName={playerName}
            partnerName={partnerName}
            onSubmit={onSubmit}
            isWaiting={isWaiting}
            playerResponse={playerResponse}
            partnerResponse={partnerResponse}
            showReveal={showReveal}
            onComplete={onComplete}
          />
        );
      case 'game':
        return (
          <GameEventComponent
            event={event}
            playerName={playerName}
            partnerName={partnerName}
            onSubmit={onSubmit}
            isWaiting={isWaiting}
            playerResponse={playerResponse}
            partnerResponse={partnerResponse}
            showReveal={showReveal}
            onComplete={onComplete}
          />
        );
      case 'confession':
        return (
          <ConfessionEvent
            event={event}
            playerName={playerName}
            partnerName={partnerName}
            onSubmit={onSubmit}
            isWaiting={isWaiting}
            playerResponse={playerResponse}
            partnerResponse={partnerResponse}
            showReveal={showReveal}
            onComplete={onComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-full max-w-md"
      >
        {/* Event Type Badge */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-4"
        >
          <div className={`bg-gradient-to-r ${gradientColor} text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg`}>
            <span className="text-2xl">{icon}</span>
            <span className="font-semibold capitalize">{event.type === 'game' ? 'Jeu' : event.type}</span>
          </div>
        </motion.div>

        {/* Event Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {renderEventContent()}
        </motion.div>
      </motion.div>
    </div>
  );
};
