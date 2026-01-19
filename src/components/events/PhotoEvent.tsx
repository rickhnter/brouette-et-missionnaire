import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameEvent } from '@/hooks/useGameEvents';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { eventIcons } from './eventIcons';

interface PhotoEventProps {
  event: GameEvent;
  playerName: string;
  onSubmit: (response: string | null) => void;
  onComplete: () => void;
}

export const PhotoEvent: React.FC<PhotoEventProps> = ({
  event,
  playerName,
  onSubmit,
  onComplete
}) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const photoIcon = eventIcons.photo;

  const handleConfirm = () => {
    onSubmit('photo_sent');
    setIsConfirmed(true);
  };

  const handleComplete = () => {
    onComplete();
  };

  if (isConfirmed) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-rose-200 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-3">
            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full p-3 shadow-lg">
              <img src={photoIcon.icon} alt="" className="w-6 h-6 object-contain" />
            </div>
          </div>
          <CardTitle className="text-xl font-serif text-rose-800">
            {event.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-4"
          >
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-full p-4 shadow-lg">
              <Check className="h-8 w-8 text-white" />
            </div>
          </motion.div>
          <p className="text-lg font-medium text-rose-800 mb-2">Photo envoyée !</p>
          <p className="text-muted-foreground text-sm mb-6">
            Ton/ta partenaire va adorer ❤️
          </p>
          <Button 
            onClick={handleComplete} 
            className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
          >
            Continuer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-rose-200 shadow-xl">
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center mb-3">
          <motion.div 
            className="bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full p-4 shadow-lg"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1 }}
          >
            <img src={photoIcon.icon} alt="" className="w-8 h-8 object-contain" />
          </motion.div>
        </div>
        <CardTitle className="text-xl font-serif text-rose-800">
          {event.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground text-center">{event.description}</p>

        <p className="text-center text-sm text-muted-foreground">
          Envoie ta photo à ton/ta partenaire via ta messagerie préférée, puis confirme ici !
        </p>

        <div className="space-y-2">
          <Button 
            onClick={handleConfirm} 
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
          >
            <img src={photoIcon.icon} alt="" className="w-4 h-4 mr-2 object-contain" />
            Photo envoyée !
          </Button>
          <Button 
            onClick={onComplete} 
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
          >
            Passer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
