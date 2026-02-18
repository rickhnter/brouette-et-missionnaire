import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface WaitingForPremiumScreenProps {
  creatorName: string;
  partnerName: string;
}

export const WaitingForPremiumScreen = ({ creatorName, partnerName }: WaitingForPremiumScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Card className="w-full bg-white/80 backdrop-blur-sm border-rose-200 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-xl font-serif text-rose-800">
              {creatorName} complète une action
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 text-center">
            {/* Animated lock icon with concentric circles */}
            <div className="py-4">
              <div className="relative mx-auto w-32 h-32">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute inset-4 bg-gradient-to-br from-rose-300 to-pink-300 rounded-full"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                />
                <motion.div
                  className="absolute inset-8 bg-gradient-to-br from-rose-400 to-pink-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl select-none">🔒</span>
                </div>
              </div>
            </div>

            {/* Explanatory message */}
            <p className="text-base text-rose-700 leading-relaxed px-2">
              Pour continuer le jeu, <span className="font-semibold">{creatorName}</span> doit débloquer les prochains niveaux.
            </p>

            {/* Animated loader */}
            <Loader2 className="h-8 w-8 text-rose-500 animate-spin mx-auto" />

            {/* Reassurance message */}
            <p className="text-sm text-rose-600">
              Vous serez notifié(e) dès que ce sera fait&nbsp;💝
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
