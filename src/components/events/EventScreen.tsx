import React from 'react';
import { GameEvent } from '@/hooks/useGameEvents';
import { MessageEvent } from './MessageEvent';
import { PromiseEvent } from './PromiseEvent';
import { PhotoEvent } from './PhotoEvent';
import { SyncEvent } from './SyncEvent';
import { GameEventComponent } from './GameEvent';
import { ConfessionEvent } from './ConfessionEvent';
import { AnimatedEventBackground } from './AnimatedEventBackground';
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

const getColorTheme = (eventType: string): 'rose' | 'violet' | 'cyan' | 'blue' | 'orange' | 'red' => {
  switch (eventType) {
    case 'message': return 'rose';
    case 'promise': return 'violet';
    case 'photo': return 'cyan';
    case 'sync': return 'blue';
    case 'game': return 'orange';
    case 'confession': return 'red';
    default: return 'rose';
  }
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
  showReveal = false,
}) => {
  const colorTheme = getColorTheme(event.type);

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
    <AnimatedEventBackground colorTheme={colorTheme}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-md"
      >
        {renderEventContent()}
      </motion.div>
    </AnimatedEventBackground>
  );
};
