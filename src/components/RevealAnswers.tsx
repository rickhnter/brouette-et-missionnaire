import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ArrowRight } from 'lucide-react';

interface RevealAnswersProps {
  question: string;
  playerName: string;
  partnerName: string;
  playerAnswer: string | null;
  partnerAnswer: string | null;
  playerSkipped: boolean;
  partnerSkipped: boolean;
  onNext: () => void;
}

export const RevealAnswers = ({
  question,
  playerName,
  partnerName,
  playerAnswer,
  partnerAnswer,
  playerSkipped,
  partnerSkipped,
  onNext
}: RevealAnswersProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white/80 backdrop-blur-sm border-rose-200 shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <CardTitle className="text-lg font-serif text-rose-800 leading-relaxed">
            {question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {/* Réponse du joueur */}
            <div className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border border-rose-200">
              <p className="text-sm font-medium text-rose-600 mb-2">{playerName}</p>
              {playerSkipped ? (
                <p className="text-rose-400 italic">🫣 A préféré passer</p>
              ) : (
                <p className="text-rose-800 font-medium">{playerAnswer}</p>
              )}
            </div>

            {/* Séparateur cœur */}
            <div className="flex items-center justify-center">
              <Heart className="w-6 h-6 text-rose-400 fill-rose-400" />
            </div>

            {/* Réponse du partenaire */}
            <div className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-pink-200">
              <p className="text-sm font-medium text-pink-600 mb-2">{partnerName}</p>
              {partnerSkipped ? (
                <p className="text-pink-400 italic">🫣 A préféré passer</p>
              ) : (
                <p className="text-pink-800 font-medium">{partnerAnswer}</p>
              )}
            </div>
          </div>

          <Button
            className="w-full h-12 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium"
            onClick={onNext}
          >
            Question suivante
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
