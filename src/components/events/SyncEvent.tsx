import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { GameEvent } from '@/hooks/useGameEvents';
import { Loader2, Heart, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { eventIcons } from './eventIcons';

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
  const [countdown, setCountdown] = useState(3);
  const [response, setResponse] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const syncIcon = eventIcons.sync;

  useEffect(() => {
    if (isReady && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (isReady && countdown === 0) {
      setShowInput(true);
    }
  }, [isReady, countdown]);

  const handleReady = () => {
    setIsReady(true);
  };

  const handleSubmit = () => {
    if (response.trim()) {
      onSubmit(response.trim());
      setHasSubmitted(true);
    }
  };

  // Reveal state - show both responses like question answers
  if (showReveal) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-rose-200 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-3">
            <div className="bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full p-3 shadow-lg">
              <img src={syncIcon.icon} alt="" className="w-6 h-6 object-contain" />
            </div>
          </div>
          <CardTitle className="text-xl font-serif text-rose-800">{event.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-center text-sm mb-4">{event.description}</p>
          
          <div className="space-y-4">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-blue-50/80 rounded-xl p-4 border border-blue-100"
            >
              <p className="text-sm font-medium text-blue-600 mb-1">{playerName}</p>
              <p className="text-foreground">{playerResponse || 'Pas de réponse'}</p>
            </motion.div>

            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                <Heart className="h-6 w-6 text-blue-500 fill-blue-500" />
              </motion.div>
            </div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-blue-50/80 rounded-xl p-4 border border-blue-100"
            >
              <p className="text-sm font-medium text-blue-600 mb-1">{partnerName}</p>
              <p className="text-foreground">{partnerResponse || 'Pas de réponse'}</p>
            </motion.div>
          </div>

          <Button 
            onClick={onComplete} 
            className="w-full mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
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
          <div className="flex justify-center mb-3">
            <div className="bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full p-3 shadow-lg">
              <img src={syncIcon.icon} alt="" className="w-6 h-6 object-contain" />
            </div>
          </div>
          <CardTitle className="text-xl font-serif text-rose-800">{event.title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-4"
          >
            <p className="text-muted-foreground">Ta réponse a été envoyée ! 🔗</p>
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
            <p className="text-sm text-muted-foreground">
              En attente de la réponse de {partnerName}...
            </p>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  // Countdown state
  if (isReady && countdown > 0) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-rose-200 shadow-xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl font-serif text-rose-800">{event.title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <motion.div
            key={countdown}
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="text-6xl font-bold text-blue-500"
          >
            {countdown}
          </motion.div>
          <p className="text-muted-foreground mt-4">Prépare-toi...</p>
        </CardContent>
      </Card>
    );
  }

  // Input after countdown
  if (showInput) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-rose-200 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-3">
            <div className="bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full p-3 shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl font-serif text-rose-800">Vite !</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <p className="text-muted-foreground text-center mb-4">{event.description}</p>
            
            <Textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Ta première pensée..."
              className="min-h-[100px] bg-white/80 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              autoFocus
            />

            <Button 
              onClick={handleSubmit} 
              className="w-full mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              disabled={!response.trim()}
            >
              <Zap className="h-4 w-4 mr-2" />
              Envoyer vite !
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  // Initial ready state
  return (
    <Card className="bg-white/90 backdrop-blur-sm border-rose-200 shadow-xl">
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center mb-3">
          <motion.div 
            className="bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full p-4 shadow-lg"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ repeat: Infinity, repeatType: 'reverse', duration: 0.8 }}
          >
            <img src={syncIcon.icon} alt="" className="w-8 h-8 object-contain" />
          </motion.div>
        </div>
        <CardTitle className="text-xl font-serif text-rose-800">{event.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-center">{event.description}</p>

        <p className="text-center text-sm text-muted-foreground">
          Un compte à rebours va démarrer. Réponds le plus vite possible !
        </p>

        <Button 
          onClick={handleReady}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
        >
          Je suis prêt(e) !
        </Button>
      </CardContent>
    </Card>
  );
};
