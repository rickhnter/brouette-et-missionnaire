import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameEvent } from '@/hooks/useGameEvents';
import { EventBadge, getEventConfig } from './EventBadge';
import { motion } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';

interface PartnerEventNotificationProps {
  event: GameEvent;
  partnerName: string;
  partnerResponse?: string | null;
  onContinue: () => void;
  isWaiting?: boolean;
}

export const PartnerEventNotification: React.FC<PartnerEventNotificationProps> = ({
  event,
  partnerName,
  partnerResponse,
  onContinue,
  isWaiting = false,
}) => {
  const config = getEventConfig(event.type as any);
  const showResponse = !event.is_private && partnerResponse;

  // État de chargement - en attente que le partenaire termine son action
  if (isWaiting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-full max-w-md"
        >
          <Card className="bg-white/90 backdrop-blur-sm border-rose-200 shadow-xl overflow-hidden">
            <CardHeader className="text-center pb-2 pt-6">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center mb-4"
              >
                <div className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-full p-3 shadow-lg">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
              </motion.div>
              
              <motion.h2
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xl font-sans text-rose-800"
              >
                Action en cours ✨
              </motion.h2>
              
              <motion.p
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground mt-2"
              >
                <span className="font-medium text-rose-600">{partnerName}</span> a une action spéciale à réaliser...
              </motion.p>
            </CardHeader>

            <CardContent className="space-y-4 px-6 pb-6">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-rose-50/80 rounded-xl p-4 border border-rose-100"
              >
                <div className="flex justify-center mb-3">
                  <EventBadge type={event.type as any} size="sm" />
                </div>
                
                <h3 className="text-lg font-medium text-rose-800 text-center mb-2">
                  {event.title}
                </h3>
                
                <p className="text-muted-foreground text-center text-sm">
                  {event.description}
                </p>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center justify-center gap-2 mt-4 text-muted-foreground"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p className="text-sm">En attente de {partnerName}...</p>
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // État complet - le partenaire a terminé son action
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white/90 backdrop-blur-sm border-rose-200 shadow-xl overflow-hidden">
          <CardHeader className="text-center pb-2 pt-6">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-4"
            >
              <div className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-full p-3 shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </motion.div>
            
            <motion.h2
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-sans text-rose-800"
            >
              Action secrète ✨
            </motion.h2>
            
            <motion.p
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground mt-2"
            >
              <span className="font-medium text-rose-600">{partnerName}</span> a eu une action spéciale !
            </motion.p>
          </CardHeader>

          <CardContent className="space-y-4 px-6 pb-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-rose-50/80 rounded-xl p-4 border border-rose-100"
            >
              <div className="flex justify-center mb-3">
                <EventBadge type={event.type as any} size="sm" />
              </div>
              
              <h3 className="text-lg font-medium text-rose-800 text-center mb-2">
                {event.title}
              </h3>
              
              <p className="text-muted-foreground text-center text-sm">
                {event.description}
              </p>

              {showResponse && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-4 bg-white rounded-lg p-3 border border-rose-200"
                >
                  <p className="text-sm text-rose-600 font-medium mb-1">
                    {partnerName} a répondu :
                  </p>
                  <p className="text-foreground italic">"{partnerResponse}"</p>
                </motion.div>
              )}

              {event.is_private && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-center text-sm text-muted-foreground mt-3 italic"
                >
                  Cette action est privée 🤫
                </motion.p>
              )}
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                onClick={onContinue}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg"
              >
                Continuer
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
