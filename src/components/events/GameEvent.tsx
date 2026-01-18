import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameEvent } from '@/hooks/useGameEvents';
import { Loader2, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface GameEventComponentProps {
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

const choices = [
  { emoji: '✊', name: 'Pierre' },
  { emoji: '✋', name: 'Feuille' },
  { emoji: '✌️', name: 'Ciseaux' },
];

const getWinner = (player: string, partner: string): 'player' | 'partner' | 'tie' => {
  if (player === partner) return 'tie';
  if (
    (player === 'Pierre' && partner === 'Ciseaux') ||
    (player === 'Feuille' && partner === 'Pierre') ||
    (player === 'Ciseaux' && partner === 'Feuille')
  ) {
    return 'player';
  }
  return 'partner';
};

export const GameEventComponent: React.FC<GameEventComponentProps> = ({
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
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleChoice = (choice: string) => {
    setSelectedChoice(choice);
    onSubmit(choice);
    setHasSubmitted(true);
  };

  // Reveal state - show result like a question answer
  if (showReveal && playerResponse && partnerResponse) {
    const winner = getWinner(playerResponse, partnerResponse);
    const playerEmoji = choices.find(c => c.name === playerResponse)?.emoji || '❓';
    const partnerEmoji = choices.find(c => c.name === partnerResponse)?.emoji || '❓';

    return (
      <Card className="bg-white/90 backdrop-blur-sm border-rose-200 shadow-xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl font-serif text-rose-800 flex items-center justify-center gap-2">
            <span>🎲</span> {event.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {/* Player's choice */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className={`rounded-xl p-4 border ${
                winner === 'player' ? 'bg-green-50/80 border-green-200' : 'bg-orange-50/80 border-orange-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-1">{playerName}</p>
                  <p className="text-foreground font-medium">{playerResponse}</p>
                </div>
                <motion.span
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="text-5xl"
                >
                  {playerEmoji}
                </motion.span>
              </div>
            </motion.div>

            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
              >
                <Heart className="h-6 w-6 text-orange-500 fill-orange-500" />
              </motion.div>
            </div>

            {/* Partner's choice */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`rounded-xl p-4 border ${
                winner === 'partner' ? 'bg-green-50/80 border-green-200' : 'bg-orange-50/80 border-orange-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-1">{partnerName}</p>
                  <p className="text-foreground font-medium">{partnerResponse}</p>
                </div>
                <motion.span
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="text-5xl"
                >
                  {partnerEmoji}
                </motion.span>
              </div>
            </motion.div>
          </div>

          {/* Result message */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center py-4"
          >
            {winner === 'tie' && (
              <p className="text-lg font-medium text-orange-600">Égalité ! 🤝</p>
            )}
            {winner === 'player' && (
              <p className="text-lg font-medium text-green-600">Tu as gagné ! 🎉</p>
            )}
            {winner === 'partner' && (
              <p className="text-lg font-medium text-rose-600">{partnerName} a gagné ! 💕</p>
            )}
          </motion.div>

          <Button 
            onClick={onComplete} 
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
          >
            Continuer
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Waiting state
  if (isWaiting || hasSubmitted) {
    const chosenEmoji = choices.find(c => c.name === selectedChoice)?.emoji || '❓';
    
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-rose-200 shadow-xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl font-serif text-rose-800 flex items-center justify-center gap-2">
            <span>🎲</span> {event.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-4"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
              className="text-6xl block"
            >
              {chosenEmoji}
            </motion.span>
            <p className="text-muted-foreground">Tu as choisi {selectedChoice} !</p>
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
            <p className="text-sm text-muted-foreground">
              En attente du choix de {partnerName}...
            </p>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  // Choice state
  return (
    <Card className="bg-white/90 backdrop-blur-sm border-rose-200 shadow-xl">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl font-serif text-rose-800 flex items-center justify-center gap-2">
          <span>🎲</span> {event.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground text-center">{event.description}</p>

        <div className="grid grid-cols-3 gap-3">
          {choices.map((choice, index) => (
            <motion.div
              key={choice.name}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col items-center justify-center gap-2 border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 transition-all"
                onClick={() => handleChoice(choice.name)}
              >
                <span className="text-4xl">{choice.emoji}</span>
                <span className="text-sm text-muted-foreground">{choice.name}</span>
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
