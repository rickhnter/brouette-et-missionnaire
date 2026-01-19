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

export const EventScreen: React.FC<EventScreenProps> = ({
  event,
  playerName,
  partnerName,
  onSubmit,
  onComplete,
  isWaiting = false,
  playerResponse,
  partnerResponse,
  showReveal = false,
}) => {
  const renderEventContent = () => {
    const commonProps = {
      event,
      playerName,
      partnerName,
      onSubmit,
      onComplete,
      isWaiting,
      playerResponse,
      partnerResponse,
      showReveal,
    };

    switch (event.type) {
      case 'message':
        return <MessageEvent {...commonProps} />;
      case 'promise':
        return <PromiseEvent {...commonProps} />;
      case 'photo':
        return <PhotoEvent {...commonProps} />;
      case 'sync':
        return <SyncEvent {...commonProps} />;
      case 'game':
        return <GameEventComponent {...commonProps} />;
      case 'confession':
        return <ConfessionEvent {...commonProps} />;
      default:
        return <MessageEvent {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-md"
      >
        {/* Event Content - Badge is now integrated inside each event component */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {renderEventContent()}
        </motion.div>
      </motion.div>
    </div>
  );
};
