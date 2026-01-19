import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Lightbulb } from 'lucide-react';
import { SuggestionModal } from './SuggestionModal';
import { CardBottomActions } from './CardBottomActions';

interface RevealAnswersProps {
  question: string;
  playerName: string;
  partnerName: string;
  playerAnswer: string | null;
  partnerAnswer: string | null;
  playerSkipped: boolean;
  partnerSkipped: boolean;
  onNext: () => void;
  currentLevel: number;
  onShowHistory: () => void;
  onLogout: () => void;
}

export const RevealAnswers = ({
  question,
  playerName,
  partnerName,
  playerAnswer,
  partnerAnswer,
  playerSkipped,
  partnerSkipped,
  onNext,
  currentLevel,
  onShowHistory,
  onLogout
}: RevealAnswersProps) => {
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white/80 backdrop-blur-sm border-rose-200 shadow-xl">
        <CardHeader className="text-center">
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
                <p className="text-rose-400 italic">🫣 Tu as passé cette question</p>
              ) : (
                <p className="text-rose-800 font-medium">{playerAnswer}</p>
              )}
            </div>

            {/* Réponse du partenaire - masquée si le joueur a skip */}
            <div className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-pink-200">
              <p className="text-sm font-medium text-pink-600 mb-2">{partnerName}</p>
              {playerSkipped ? (
                <p className="text-pink-400 italic">🔒 Tu n'as pas répondu, sa réponse reste secrète...</p>
              ) : partnerSkipped ? (
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

          <button
            onClick={() => setShowSuggestionModal(true)}
            className="flex items-center justify-center gap-1 text-xs text-rose-400 hover:text-rose-600 transition-colors mx-auto mt-2"
          >
            <Lightbulb className="w-3 h-3" />
            Proposer une idée
          </button>

          <CardBottomActions onShowHistory={onShowHistory} onLogout={onLogout} />
        </CardContent>
      </Card>

      <SuggestionModal
        isOpen={showSuggestionModal}
        onClose={() => setShowSuggestionModal(false)}
        currentLevel={currentLevel}
        playerName={playerName}
      />
    </div>
  );
};
