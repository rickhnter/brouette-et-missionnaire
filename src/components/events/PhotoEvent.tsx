import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameEvent } from '@/hooks/useGameEvents';
import { Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { eventIcons } from './eventIcons';

interface PhotoEventProps {
  event: GameEvent;
  playerName: string;
  partnerName: string;
  onSubmit: (response: string | null) => void;
  onComplete: () => void;
  isWaiting?: boolean;
  playerResponse?: string | null;
  partnerResponse?: string | null;
  showReveal?: boolean;
}

export const PhotoEvent: React.FC<PhotoEventProps> = ({
  event,
  playerName,
  partnerName,
  onSubmit,
  onComplete,
  isWaiting = false,
  playerResponse,
  partnerResponse,
  showReveal = false
}) => {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const photoIcon = eventIcons.photo;

  const handleConfirm = () => {
    onSubmit('photo_sent');
    setHasSubmitted(true);
  };

  const handleSkip = () => {
    onSubmit(null);
    setHasSubmitted(true);
  };

  // État révélation - les deux ont confirmé (pour requires_both)
  if (showReveal && event.requires_both) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-rose-200 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-3">
            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full p-3 shadow-lg">
              <img src={photoIcon.icon} alt="" className="w-6 h-6 object-contain" />
            </div>
          </div>
          <CardTitle className="text-xl font-sans text-rose-800">
            {event.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">{event.description}</p>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-rose-50 rounded-lg p-3">
              <p className="text-sm text-rose-600 font-medium mb-1">{playerName}</p>
              <div className="flex items-center justify-center gap-2">
                {playerResponse === 'photo_sent' ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Photo envoyée</span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground italic">Passé</span>
                )}
              </div>
            </div>
            <div className="bg-rose-50 rounded-lg p-3">
              <p className="text-sm text-rose-600 font-medium mb-1">{partnerName}</p>
              <div className="flex items-center justify-center gap-2">
                {partnerResponse === 'photo_sent' ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Photo envoyée</span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground italic">Passé</span>
                )}
              </div>
            </div>
          </div>
          
          <Button 
            onClick={onComplete} 
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 mt-4"
          >
            Continuer
          </Button>
        </CardContent>
      </Card>
    );
  }

  // État attente - en attente de l'autre joueur
  if ((isWaiting || hasSubmitted) && event.requires_both) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-rose-200 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-3">
            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full p-3 shadow-lg">
              <img src={photoIcon.icon} alt="" className="w-6 h-6 object-contain" />
            </div>
          </div>
          <CardTitle className="text-xl font-sans text-rose-800">
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
          <p className="text-lg font-medium text-rose-800 mb-2">
            {playerResponse === 'photo_sent' ? 'Photo envoyée !' : 'Passé'}
          </p>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="text-sm">En attente de {partnerName}...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // État confirmation pour événement individuel (après soumission)
  if (hasSubmitted && !event.requires_both) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-rose-200 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-3">
            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full p-3 shadow-lg">
              <img src={photoIcon.icon} alt="" className="w-6 h-6 object-contain" />
            </div>
          </div>
          <CardTitle className="text-xl font-sans text-rose-800">
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
            onClick={onComplete} 
            className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
          >
            Continuer
          </Button>
        </CardContent>
      </Card>
    );
  }

  // État initial - affichage de l'action
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
        <CardTitle className="text-xl font-sans text-rose-800">
          {event.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground text-center">{event.description}</p>

        <p className="text-center text-sm text-muted-foreground">
          Envoie ta photo à {partnerName} via ta messagerie préférée, puis confirme ici !
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
            onClick={handleSkip} 
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
