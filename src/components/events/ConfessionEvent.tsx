import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { GameEvent } from '@/hooks/useGameEvents';
import { Loader2, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

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

  const handleSubmit = () => {
    if (confession.trim()) {
      onSubmit(confession.trim());
      setHasSubmitted(true);
    }
  };

  // Reveal state
  if (showReveal) {
    return (
      <Card className="border-red-200 bg-gradient-to-br from-red-50 to-rose-50">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl text-foreground flex items-center justify-center gap-2">
            <span>💋</span> {event.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-center text-sm mb-4">{event.description}</p>
          
          <div className="space-y-4">
            <motion.div
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white/80 rounded-lg p-4 border border-red-200"
            >
              <p className="text-sm font-medium text-red-500 mb-1">{playerName} confesse :</p>
              <p className="text-foreground italic">"{playerResponse}"</p>
            </motion.div>

            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Heart className="h-8 w-8 text-red-500 fill-red-500" />
              </motion.div>
            </div>

            <motion.div
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white/80 rounded-lg p-4 border border-red-200"
            >
              <p className="text-sm font-medium text-red-500 mb-1">{partnerName} confesse :</p>
              <p className="text-foreground italic">"{partnerResponse}"</p>
            </motion.div>
          </div>

          <Button onClick={onComplete} className="w-full mt-4 bg-red-500 hover:bg-red-600">
            Continuer
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Waiting state
  if (isWaiting || hasSubmitted) {
    return (
      <Card className="border-red-200 bg-gradient-to-br from-red-50 to-rose-50">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl text-foreground flex items-center justify-center gap-2">
            <span>💋</span> {event.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground mb-4">Ta confession est enregistrée...</p>
          <div className="flex justify-center mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-red-500" />
          </div>
          <p className="text-sm text-muted-foreground">
            En attente de la confession de {partnerName}...
          </p>
        </CardContent>
      </Card>
    );
  }

  // Input state
  return (
    <Card className="border-red-200 bg-gradient-to-br from-red-50 to-rose-50">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl text-foreground flex items-center justify-center gap-2">
          <span>💋</span> {event.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-center">{event.description}</p>

        <Textarea
          value={confession}
          onChange={(e) => setConfession(e.target.value)}
          placeholder="Je confesse que..."
          className="min-h-[120px] bg-white/80 border-red-200 focus:border-red-500"
        />

        <Button 
          onClick={handleSubmit} 
          className="w-full bg-red-500 hover:bg-red-600"
          disabled={!confession.trim()}
        >
          Avouer 💋
        </Button>
      </CardContent>
    </Card>
  );
};
