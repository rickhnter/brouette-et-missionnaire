import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Lightbulb } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import levelIcon from '@/assets/level-icon.jpg';
import { SuggestionModal } from './SuggestionModal';
import { CardBottomActions } from './CardBottomActions';

interface Question {
  id: string;
  question: string;
  level: number;
  suggestions: string[];
}

interface QuestionScreenProps {
  question: Question;
  playerName: string;
  currentIndex: number;
  totalQuestions: number;
  onAnswer: (answer: string) => void;
  onSkip: () => void;
  onShowHistory: () => void;
  onLogout: () => void;
}

const LevelIcons = ({ level }: { level: number }) => {
  return (
    <div className="flex items-center justify-center gap-1">
      {Array.from({ length: level }).map((_, index) => (
        <img 
          key={index} 
          src={levelIcon} 
          alt="18+" 
          className="w-8 h-8 object-contain"
        />
      ))}
    </div>
  );
};

export const QuestionScreen = ({
  question,
  playerName,
  currentIndex,
  totalQuestions,
  onAnswer,
  onSkip,
  onShowHistory,
  onLogout
}: QuestionScreenProps) => {
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [customAnswer, setCustomAnswer] = useState('');
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const handleSubmit = () => {
    const answer = selectedSuggestion || customAnswer.trim();
    if (answer) {
      onAnswer(answer);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (selectedSuggestion === suggestion) {
      setSelectedSuggestion(null);
    } else {
      setSelectedSuggestion(suggestion);
      setCustomAnswer('');
    }
  };
  const handleConfirmSkip = () => {
    setShowSkipModal(false);
    onSkip();
  };

  if (!showAnswerForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg bg-white/80 backdrop-blur-sm border-rose-200 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="text-sm text-rose-400 font-medium">
              Question {currentIndex} / {totalQuestions}
            </div>
            <LevelIcons level={question.level} />
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-xl text-center text-rose-800 font-serif leading-relaxed">
              {question.question}
            </p>
            
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowAnswerForm(true)}
                className="flex-1 h-14 text-lg bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600"
              >
                Je réponds
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowSkipModal(true)}
                className="h-14 px-6 text-2xl bg-rose-50 text-rose-400 hover:text-rose-600 hover:bg-rose-100"
              >
                🫣
              </Button>
            </div>

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

        <AlertDialog open={showSkipModal} onOpenChange={setShowSkipModal}>
          <AlertDialogContent className="border-rose-200">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-rose-800">Passer cette question ?</AlertDialogTitle>
              <AlertDialogDescription className="text-rose-600">
                Si vous passez cette question, vous ne pourrez pas voir la réponse de l'autre.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-rose-300 text-rose-700 hover:bg-rose-50">
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmSkip}
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
              >
                Passer quand même
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <SuggestionModal
          isOpen={showSuggestionModal}
          onClose={() => setShowSuggestionModal(false)}
          currentLevel={question.level}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white/80 backdrop-blur-sm border-rose-200 shadow-xl">
        <CardHeader className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowAnswerForm(false);
              setSelectedSuggestion(null);
              setCustomAnswer('');
            }}
            className="w-fit text-rose-500 hover:text-rose-700 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Retour
          </Button>
          <p className="text-lg text-rose-800 font-serif">
            {question.question}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {question.suggestions && question.suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {question.suggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant={selectedSuggestion === suggestion ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={
                    selectedSuggestion === suggestion
                      ? "bg-rose-500 hover:bg-rose-600"
                      : "border-rose-300 text-rose-600 hover:bg-rose-50"
                  }
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}
          
          <Textarea
            placeholder="Ou écris ta propre réponse..."
            value={customAnswer}
            onChange={(e) => {
              setCustomAnswer(e.target.value);
              if (e.target.value) setSelectedSuggestion(null);
            }}
            className="min-h-24 border-rose-300 focus:border-rose-400"
          />
          
          <Button
            onClick={handleSubmit}
            disabled={!selectedSuggestion && !customAnswer.trim()}
            className="w-full bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600"
          >
            <Send className="w-4 h-4 mr-2" />
            Envoyer
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
        currentLevel={question.level}
      />
    </div>
  );
};
