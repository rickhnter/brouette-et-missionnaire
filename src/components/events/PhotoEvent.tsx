import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameEvent } from '@/hooks/useGameEvents';
import { Camera, Check } from 'lucide-react';
import { motion } from 'framer-motion';

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

  const handleConfirm = () => {
    onSubmit('photo_sent');
    setIsConfirmed(true);
  };

  const handleComplete = () => {
    onComplete();
  };

  if (isConfirmed) {
    return (
      <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl text-foreground flex items-center justify-center gap-2">
            <span>📸</span> {event.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-4"
          >
            <div className="bg-green-500 rounded-full p-4">
              <Check className="h-8 w-8 text-white" />
            </div>
          </motion.div>
          <p className="text-lg font-medium text-foreground mb-2">Photo envoyée ! 📷</p>
          <p className="text-muted-foreground text-sm mb-6">
            Ton/ta partenaire va adorer ❤️
          </p>
          <Button onClick={handleComplete} className="bg-cyan-500 hover:bg-cyan-600">
            Continuer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl text-foreground flex items-center justify-center gap-2">
          <span>📸</span> {event.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground text-center">{event.description}</p>

        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1 }}
          className="flex justify-center"
        >
          <div className="bg-cyan-100 rounded-full p-6">
            <Camera className="h-12 w-12 text-cyan-600" />
          </div>
        </motion.div>

        <p className="text-center text-sm text-muted-foreground">
          Envoie ta photo à ton/ta partenaire via ta messagerie préférée, puis confirme ici !
        </p>

        <div className="space-y-2">
          <Button 
            onClick={handleConfirm} 
            className="w-full bg-cyan-500 hover:bg-cyan-600"
          >
            <Camera className="h-4 w-4 mr-2" />
            Photo envoyée !
          </Button>
          <Button 
            onClick={onComplete} 
            variant="ghost"
            className="w-full text-muted-foreground"
          >
            Passer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
