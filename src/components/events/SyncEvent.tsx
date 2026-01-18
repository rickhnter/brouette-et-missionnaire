import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { GameEvent } from '@/hooks/useGameEvents';
import { Loader2, Heart, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface SyncEventProps {
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

export const SyncEvent: React.FC<SyncEventProps> = ({
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
  const [isReady, setIsReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [response, setResponse] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Countdown effect
  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleReady = () => {
    setIsReady(true);
    setCountdown(3);
  };

  const handleSubmit = () => {
    if (response.trim()) {
      onSubmit(response.trim());
      setHasSubmitted(true);
    }
  };

  // Reveal state
  if (showReveal) {
    return (
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl text-foreground flex items-center justify-center gap-2">
            <span>🔗</span> {event.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-white/80 rounded-lg p-4 border border-blue-200"
            >
              <p className="text-sm font-medium text-blue-600 mb-1">{playerName}</p>
              <p className="text-foreground">{playerResponse}</p>
            </motion.div>

            <div className="flex justify-center">
              <Heart className="h-6 w-6 text-blue-500 fill-blue-500" />
            </div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 rounded-lg p-4 border border-blue-200"
            >
              <p className="text-sm font-medium text-blue-600 mb-1">{partnerName}</p>
              <p className="text-foreground">{partnerResponse}</p>
            </motion.div>
          </div>

          <Button onClick={onComplete} className="w-full mt-4 bg-blue-500 hover:bg-blue-600">
            Continuer
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Waiting state
  if (isWaiting || hasSubmitted) {
    return (
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl text-foreground flex items-center justify-center gap-2">
            <span>🔗</span> {event.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="flex justify-center mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
          <p className="text-muted-foreground">
            En attente de {partnerName}...
          </p>
        </CardContent>
      </Card>
    );
  }

  // Countdown state
  if (countdown !== null && countdown > 0) {
    return (
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl text-foreground flex items-center justify-center gap-2">
            <span>🔗</span> {event.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <motion.div
            key={countdown}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="text-6xl font-bold text-blue-500 mb-4"
          >
            {countdown}
          </motion.div>
          <p className="text-muted-foreground">Prépare-toi...</p>
        </CardContent>
      </Card>
    );
  }

  // Input after countdown
  if (countdown === 0) {
    return (
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl text-foreground flex items-center justify-center gap-2">
            <span>🔗</span> {event.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-center">{event.description}</p>

          <Textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Qu'as-tu dit/fait ?"
            className="min-h-[100px] bg-white/80 border-blue-200 focus:border-blue-500"
          />

          <Button 
            onClick={handleSubmit} 
            className="w-full bg-blue-500 hover:bg-blue-600"
            disabled={!response.trim()}
          >
            Valider
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Ready state
  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl text-foreground flex items-center justify-center gap-2">
          <span>🔗</span> {event.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground text-center">{event.description}</p>

        <div className="flex justify-center">
          <div className="bg-blue-100 rounded-full p-6">
            <Clock className="h-12 w-12 text-blue-600" />
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Quand tu es prêt(e), lance le compte à rebours !
        </p>

        <Button 
          onClick={handleReady} 
          className="w-full bg-blue-500 hover:bg-blue-600"
        >
          Je suis prêt(e) !
        </Button>
      </CardContent>
    </Card>
  );
};
