import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { GameEvent } from '@/hooks/useGameEvents';
import { Loader2, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { eventIcons } from './eventIcons';
import { EventCardLayout } from './EventCardLayout';

interface ConfessionEventProps {
  event: GameEvent;
  playerName: string;
  partnerName: string;
  onSubmit: (response: string | null) => void;
  isWaiting?: boolean;
  playerResponse?: string | null;
  partnerResponse?: string | null;
  showReveal?: boolean;
  onComplete: () => void;
}

export const ConfessionEvent: React.FC<ConfessionEventProps> = ({
  event,
  playerName,
  partnerName,
  onSubmit,
  isWaiting = false,
  playerResponse,
  partnerResponse,
  showReveal = false,
  onComplete
}) => {
  const [confession, setConfession] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const confessionIcon = eventIcons.confession;

  const handleSubmit = () => {
    if (confession.trim()) {
      onSubmit(confession.trim());
      setHasSubmitted(true);
    }
  };

  // Reveal state
  if (showReveal) {
    return (
      <EventCardLayout icon={confessionIcon.icon} title={event.title} colorTheme="red">
        <p className="text-muted-foreground text-center text-sm mb-4">{event.description}</p>
        
        <div className="space-y-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-red-50/80 rounded-2xl p-4 border border-red-200"
          >
            <p className="text-sm font-medium text-red-600 mb-1">{playerName} confesse :</p>
            <p className="text-foreground italic">"{playerResponse}"</p>
          </motion.div>

          <div className="flex justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              <Heart className="h-6 w-6 text-red-500 fill-red-500" />
            </motion.div>
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-red-50/80 rounded-2xl p-4 border border-red-200"
          >
            <p className="text-sm font-medium text-red-600 mb-1">{partnerName} confesse :</p>
            <p className="text-foreground italic">"{partnerResponse}"</p>
          </motion.div>
        </div>

        <Button 
          onClick={onComplete} 
          className="w-full mt-4 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 rounded-xl h-12"
        >
          Continuer
        </Button>
      </EventCardLayout>
    );
  }

  // Waiting state
  if (isWaiting || hasSubmitted) {
    return (
      <EventCardLayout icon={confessionIcon.icon} title={event.title} colorTheme="red">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-4 py-4"
        >
          <p className="text-muted-foreground">Ta confession a été enregistrée ! 💋</p>
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-red-500" />
          </div>
          <p className="text-sm text-muted-foreground">
            En attente de la confession de {partnerName}...
          </p>
        </motion.div>
      </EventCardLayout>
    );
  }

  // Input state
  return (
    <EventCardLayout icon={confessionIcon.icon} title={event.title} colorTheme="red">
      <p className="text-muted-foreground text-center mb-4">{event.description}</p>

      <Textarea
        value={confession}
        onChange={(e) => setConfession(e.target.value)}
        placeholder="Ma confession..."
        className="min-h-[120px] bg-white/80 border-red-200 focus:border-red-400 focus:ring-red-400 rounded-xl"
      />

      <Button 
        onClick={handleSubmit} 
        className="w-full mt-4 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 rounded-xl h-12"
        disabled={!confession.trim()}
      >
        Je confesse 💋
      </Button>
    </EventCardLayout>
  );
};
