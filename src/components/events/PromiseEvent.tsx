import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { GameEvent } from '@/hooks/useGameEvents';
import { Loader2, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface PromiseEventProps {
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

export const PromiseEvent: React.FC<PromiseEventProps> = ({
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
  const [promise, setPromise] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = () => {
    if (promise.trim()) {
      onSubmit(promise.trim());
      setHasSubmitted(true);
    }
  };

  // Reveal state
  if (showReveal) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-rose-200 shadow-xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl font-serif text-rose-800 flex items-center justify-center gap-2">
            <span>🤞</span> {event.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-center text-sm mb-4">{event.description}</p>
          
          <div className="space-y-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-violet-50/80 rounded-xl p-4 border border-violet-100"
            >
              <p className="text-sm font-medium text-violet-600 mb-1">{playerName} promet :</p>
              <p className="text-foreground italic">"{playerResponse}"</p>
            </motion.div>

            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                <Heart className="h-6 w-6 text-violet-500 fill-violet-500" />
              </motion.div>
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-violet-50/80 rounded-xl p-4 border border-violet-100"
            >
              <p className="text-sm font-medium text-violet-600 mb-1">{partnerName} promet :</p>
              <p className="text-foreground italic">"{partnerResponse}"</p>
            </motion.div>
          </div>

          <Button 
            onClick={onComplete} 
            className="w-full mt-4 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
          >
            Continuer
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Waiting state
  if (isWaiting || hasSubmitted) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-rose-200 shadow-xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl font-serif text-rose-800 flex items-center justify-center gap-2">
            <span>🤞</span> {event.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-4"
          >
            <p className="text-muted-foreground">Ta promesse a été enregistrée ! 🤞</p>
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            </div>
            <p className="text-sm text-muted-foreground">
              En attente de la promesse de {partnerName}...
            </p>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  // Input state
  return (
    <Card className="bg-white/90 backdrop-blur-sm border-rose-200 shadow-xl">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl font-serif text-rose-800 flex items-center justify-center gap-2">
          <span>🤞</span> {event.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-center">{event.description}</p>

        <Textarea
          value={promise}
          onChange={(e) => setPromise(e.target.value)}
          placeholder="Je promets de..."
          className="min-h-[120px] bg-white/80 border-violet-200 focus:border-violet-400 focus:ring-violet-400"
        />

        <Button 
          onClick={handleSubmit} 
          className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
          disabled={!promise.trim()}
        >
          Je promets 🤞
        </Button>
      </CardContent>
    </Card>
  );
};
