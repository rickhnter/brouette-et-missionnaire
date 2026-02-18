import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Lock } from 'lucide-react';

interface LevelSelectionProps {
  levels: number[];
  onSelectLevel: (level: number) => void;
  playerName: string;
  partnerName: string;
  isPremium?: boolean;
}

const levelLabels: Record<number, { name: string; icon: string; description: string }> = {
  1: { name: 'Niveau 1', icon: '💕', description: 'Découverte' },
  2: { name: 'Niveau 2', icon: '💖', description: 'Complicité' },
  3: { name: 'Niveau 3', icon: '🔥', description: 'Intimité' },
  4: { name: 'Niveau 4', icon: '💋', description: 'Passion' },
  5: { name: 'Niveau 5', icon: '🌶️', description: 'Sans limites' },
};

export const LevelSelection = ({
  levels,
  onSelectLevel,
  playerName,
  partnerName,
  isPremium = false,
}: LevelSelectionProps) => {
  // Afficher tous les niveaux de 1 à 5, même s'ils n'ont pas de questions
  const allLevels = [1, 2, 3, 4, 5];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white/80 backdrop-blur-sm border-rose-200 shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>
          <CardTitle className="text-2xl font-serif text-rose-800">
            {playerName} & {partnerName}
          </CardTitle>
          <CardDescription className="text-rose-600">
            Choisissez un niveau pour commencer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {allLevels.map((level) => {
            const hasQuestions = levels.includes(level);
            const isPremiumLevel = level >= 3;
            const isLocked = isPremiumLevel && !isPremium;
            const isDisabled = !hasQuestions || isLocked;
            const info = levelLabels[level];

            return (
              <Button
                key={level}
                variant="outline"
                className="w-full h-16 text-lg font-medium border-rose-300 text-rose-700 hover:bg-rose-50 hover:border-rose-400 transition-all justify-start gap-4 disabled:opacity-50"
                onClick={() => onSelectLevel(level)}
                disabled={isDisabled}
              >
                <span className="text-2xl">{info.icon}</span>
                <div className="flex flex-col items-start">
                  <span>{info.name}</span>
                  <span className="text-sm text-rose-500">{info.description}</span>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  {isLocked && (
                    <>
                      <Lock className="w-3.5 h-3.5 text-rose-400" />
                      <span className="text-xs font-semibold text-rose-500 bg-rose-100 border border-rose-200 rounded-full px-2 py-0.5">
                        Premium
                      </span>
                    </>
                  )}
                  {!isLocked && !hasQuestions && (
                    <span className="text-xs text-rose-400">Bientôt</span>
                  )}
                </div>
              </Button>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};
