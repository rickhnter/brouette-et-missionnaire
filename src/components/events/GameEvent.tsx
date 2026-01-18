import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameEvent } from '@/hooks/useGameEvents';
import { Loader2, Trophy } from 'lucide-react';
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
  { value: 'rock', label: '🪨', name: 'Pierre' },
  { value: 'paper', label: '📄', name: 'Feuille' },
  { value: 'scissors', label: '✂️', name: 'Ciseaux' }
];

const getWinner = (player: string, partner: string): 'player' | 'partner' | 'tie' => {
  if (player === partner) return 'tie';
  if (
    (player === 'rock' && partner === 'scissors') ||
    (player === 'paper' && partner === 'rock') ||
    (player === 'scissors' && partner === 'paper')
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

  // Reveal state
  if (showReveal && playerResponse && partnerResponse) {
    const winner = getWinner(playerResponse, partnerResponse);
    const playerChoice = choices.find(c => c.value === playerResponse);
    const partnerChoice = choices.find(c => c.value === partnerResponse);

    return (
      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl text-foreground flex items-center justify-center gap-2">
            <span>🎲</span> {event.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center items-center gap-8">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-center"
            >
              <div className="text-5xl mb-2">{playerChoice?.label}</div>
              <p className="text-sm font-medium text-foreground">{playerName}</p>
              <p className="text-xs text-muted-foreground">{playerChoice?.name}</p>
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl"
            >
              ⚔️
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-center"
            >
              <div className="text-5xl mb-2">{partnerChoice?.label}</div>
              <p className="text-sm font-medium text-foreground">{partnerName}</p>
              <p className="text-xs text-muted-foreground">{partnerChoice?.name}</p>
            </motion.div>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-4"
          >
            {winner === 'tie' ? (
              <div className="bg-gray-100 rounded-lg p-4">
                <p className="text-lg font-semibold text-gray-600">Égalité ! 🤝</p>
                <p className="text-sm text-muted-foreground">Vous pensez pareil...</p>
              </div>
            ) : (
              <div className={`rounded-lg p-4 ${winner === 'player' ? 'bg-green-100' : 'bg-rose-100'}`}>
                <div className="flex justify-center mb-2">
                  <Trophy className={`h-8 w-8 ${winner === 'player' ? 'text-green-500' : 'text-rose-500'}`} />
                </div>
                <p className="text-lg font-semibold">
                  {winner === 'player' ? `${playerName} gagne !` : `${partnerName} gagne !`}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {winner === 'player' 
                    ? `${partnerName} doit faire le gage ! 😈`
                    : `Tu dois faire le gage... 😅`
                  }
                </p>
              </div>
            )}
          </motion.div>

          <Button onClick={onComplete} className="w-full mt-4 bg-orange-500 hover:bg-orange-600">
            Continuer
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Waiting state
  if (isWaiting || hasSubmitted) {
    const choice = choices.find(c => c.value === selectedChoice);
    
    return (
      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl text-foreground flex items-center justify-center gap-2">
            <span>🎲</span> {event.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-5xl mb-4">{choice?.label}</div>
          <p className="text-muted-foreground mb-4">Tu as choisi {choice?.name} !</p>
          <div className="flex justify-center mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
          <p className="text-sm text-muted-foreground">
            En attente du choix de {partnerName}...
          </p>
        </CardContent>
      </Card>
    );
  }

  // Choice state
  return (
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl text-foreground flex items-center justify-center gap-2">
          <span>🎲</span> {event.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground text-center">{event.description}</p>

        <div className="flex justify-center gap-4">
          {choices.map((choice) => (
            <motion.button
              key={choice.value}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleChoice(choice.value)}
              className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-orange-300"
            >
              <div className="text-4xl mb-1">{choice.label}</div>
              <div className="text-xs text-muted-foreground">{choice.name}</div>
            </motion.button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
