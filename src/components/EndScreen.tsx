import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, History, RotateCcw } from 'lucide-react';

interface EndScreenProps {
  playerName: string;
  partnerName: string;
  onShowHistory: () => void;
  onPlayAgain: () => void;
}

export const EndScreen = ({
  playerName,
  partnerName,
  onShowHistory,
  onPlayAgain
}: EndScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-rose-200 shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center">
            <Heart className="w-10 h-10 text-white fill-white" />
          </div>
          <CardTitle className="text-2xl font-serif text-rose-800">
            Bravo ! 🎉
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-rose-600">
            {playerName} & {partnerName}, vous avez terminé cette catégorie !
          </p>
          <p className="text-sm text-rose-500 italic">
            Vous vous connaissez un peu mieux maintenant... 💕
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-4">
            <Button
              variant="outline"
              className="h-12 border-rose-300 text-rose-700 hover:bg-rose-50"
              onClick={onShowHistory}
            >
              <History className="w-4 h-4 mr-2" />
              Historique
            </Button>
            <Button
              className="h-12 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
              onClick={onPlayAgain}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Rejouer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
