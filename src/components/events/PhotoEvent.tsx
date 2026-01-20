import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GameEvent } from '@/hooks/useGameEvents';
import { Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { eventIcons } from './eventIcons';
import { EventCardLayout } from './EventCardLayout';

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
    // For individual events, allow immediate completion
    if (!event.requires_both) {
      // Don't auto-complete - let user click continue
    }
  };

  const handleSkip = () => {
    onSubmit(null);
    setHasSubmitted(true);
    if (!event.requires_both) {
      // Don't auto-complete - let user click continue
    }
  };

  // État révélation - les deux ont confirmé (pour requires_both)
  if (showReveal && event.requires_both) {
    return (
      <EventCardLayout icon={photoIcon.icon} title={event.title} colorTheme="cyan">
        <p className="text-muted-foreground text-center mb-4">{event.description}</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-cyan-50/80 rounded-2xl p-4 border border-cyan-200">
            <p className="text-sm text-cyan-600 font-medium mb-2">{playerName}</p>
            <div className="flex items-center justify-center gap-2">
              {playerResponse === 'photo_sent' ? (
                <>
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Envoyée</span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground italic">Passé</span>
              )}
            </div>
          </div>
          <div className="bg-cyan-50/80 rounded-2xl p-4 border border-cyan-200">
            <p className="text-sm text-cyan-600 font-medium mb-2">{partnerName}</p>
            <div className="flex items-center justify-center gap-2">
              {partnerResponse === 'photo_sent' ? (
                <>
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Envoyée</span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground italic">Passé</span>
              )}
            </div>
          </div>
        </div>
        
        <Button 
          onClick={onComplete} 
          className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl h-12"
        >
          Continuer
        </Button>
      </EventCardLayout>
    );
  }

  // État attente - en attente de l'autre joueur
  if ((isWaiting || hasSubmitted) && event.requires_both) {
    return (
      <EventCardLayout icon={photoIcon.icon} title={event.title} colorTheme="cyan">
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
        <p className="text-lg font-medium text-center text-cyan-700 mb-2">
          {playerResponse === 'photo_sent' ? 'Photo envoyée !' : 'Passé'}
        </p>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-sm">En attente de {partnerName}...</p>
        </div>
      </EventCardLayout>
    );
  }

  // État confirmation pour événement individuel (après soumission)
  if (hasSubmitted && !event.requires_both) {
    return (
      <EventCardLayout icon={photoIcon.icon} title={event.title} colorTheme="cyan">
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
        <p className="text-lg font-medium text-center text-cyan-700 mb-2">
          {playerResponse === 'photo_sent' ? 'Photo envoyée !' : 'Passé'}
        </p>
        {playerResponse === 'photo_sent' && (
          <p className="text-muted-foreground text-sm text-center mb-4">
            Ton/ta partenaire va adorer ❤️
          </p>
        )}
        <Button 
          onClick={onComplete} 
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl h-12"
        >
          Continuer
        </Button>
      </EventCardLayout>
    );
  }

  // État initial - affichage de l'action
  return (
    <EventCardLayout icon={photoIcon.icon} title={event.title} colorTheme="cyan">
      <p className="text-muted-foreground text-center mb-4">{event.description}</p>

      <p className="text-center text-sm text-muted-foreground mb-6">
        Envoie ta photo à {partnerName} via ta messagerie préférée, puis confirme ici !
      </p>

      <div className="space-y-3">
        <Button 
          onClick={handleConfirm} 
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl h-12"
        >
          📸 Photo envoyée !
        </Button>
        <Button 
          onClick={handleSkip} 
          variant="ghost"
          className="w-full text-muted-foreground hover:text-foreground rounded-xl"
        >
          Passer
        </Button>
      </div>
    </EventCardLayout>
  );
};
