import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardBottomActions } from './CardBottomActions';
import { motion } from 'framer-motion';

interface WaitingForPartnerProps {
  partnerName: string;
  onShowHistory: () => void;
  onLogout: () => void;
}

const TypingDots = () => {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-3 h-3 bg-rose-400 rounded-full"
          animate={{
            y: [0, -8, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export const WaitingForPartner = ({ partnerName, onShowHistory, onLogout }: WaitingForPartnerProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-rose-200 shadow-xl">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-xl font-serif text-rose-800">
            {partnerName} répond...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="py-8">
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
                <TypingDots />
              </div>
            </div>
          </div>
          
          <p className="text-sm text-rose-600">
            En attente de sa réponse...
          </p>
          
          <p className="text-xs text-rose-400">
            Rafraîchissement automatique toutes les 5 secondes
          </p>

          <CardBottomActions onShowHistory={onShowHistory} onLogout={onLogout} />
        </CardContent>
      </Card>
    </div>
  );
};
