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
      <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl text-foreground">{event.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-center text-sm mb-4">{event.description}</p>
          
          <div className="space-y-4">
            {/* Player's message */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-white/80 rounded-lg p-4 border border-pink-200"
            >
              <p className="text-sm font-medium text-primary mb-1">{playerName}</p>
              <p className="text-foreground">{playerResponse || 'Pas de message'}</p>
            </motion.div>

            <div className="flex justify-center">
              <Heart className="h-6 w-6 text-primary fill-primary" />
            </div>

            {/* Partner's message */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 rounded-lg p-4 border border-pink-200"
            >
              <p className="text-sm font-medium text-primary mb-1">{partnerName}</p>
              <p className="text-foreground">{partnerResponse || 'Pas de message'}</p>
            </motion.div>
          </div>

          <Button onClick={onComplete} className="w-full mt-4">
            Continuer
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Waiting state
  if (isWaiting || hasSubmitted) {
    return (
      <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl text-foreground">{event.title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground mb-4">Ton message a été envoyé !</p>
          <div className="flex justify-center mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            En attente du message de {partnerName}...
          </p>
        </CardContent>
      </Card>
    );
  }

  // Input state
  return (
    <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl text-foreground">{event.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-center">{event.description}</p>

        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Écris ton message ici..."
          className="min-h-[120px] bg-white/80 border-pink-200 focus:border-primary"
        />

        <Button 
          onClick={handleSubmit} 
          className="w-full"
          disabled={!message.trim()}
        >
          <Send className="h-4 w-4 mr-2" />
          Envoyer
        </Button>
      </CardContent>
    </Card>
  );
};
