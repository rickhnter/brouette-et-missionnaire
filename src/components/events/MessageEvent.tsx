import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { GameEvent } from '@/hooks/useGameEvents';
import { Loader2, Send, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface MessageEventProps {
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

export const MessageEvent: React.FC<MessageEventProps> = ({
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
  const [message, setMessage] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = () => {
    if (message.trim()) {
      onSubmit(message.trim());
      setHasSubmitted(true);
    }
  };

  // Reveal state - show both messages
  if (showReveal) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-rose-200 shadow-xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl font-serif text-rose-800">{event.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-center text-sm mb-4">{event.description}</p>
          
          <div className="space-y-4">
            {/* Player's message */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-rose-50/80 rounded-xl p-4 border border-rose-100"
            >
              <p className="text-sm font-medium text-rose-600 mb-1">{playerName}</p>
              <p className="text-foreground">{playerResponse || 'Pas de message'}</p>
            </motion.div>

            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />
              </motion.div>
            </div>

            {/* Partner's message */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-rose-50/80 rounded-xl p-4 border border-rose-100"
            >
              <p className="text-sm font-medium text-rose-600 mb-1">{partnerName}</p>
              <p className="text-foreground">{partnerResponse || 'Pas de message'}</p>
            </motion.div>
          </div>

          <Button 
            onClick={onComplete} 
            className="w-full mt-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
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
          <CardTitle className="text-xl font-serif text-rose-800">{event.title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-4"
          >
            <p className="text-muted-foreground">Ton message a été envoyé ! 💌</p>
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
            </div>
            <p className="text-sm text-muted-foreground">
              En attente du message de {partnerName}...
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
        <CardTitle className="text-xl font-serif text-rose-800">{event.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-center">{event.description}</p>

        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Écris ton message ici..."
          className="min-h-[120px] bg-white/80 border-rose-200 focus:border-rose-400 focus:ring-rose-400"
        />

        <Button 
          onClick={handleSubmit} 
          className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
          disabled={!message.trim()}
        >
          <Send className="h-4 w-4 mr-2" />
          Envoyer
        </Button>
      </CardContent>
    </Card>
  );
};
