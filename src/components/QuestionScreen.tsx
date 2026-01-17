import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, Send, EyeOff } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  category: string;
  category_icon: string;
  suggestions: string[];
}

interface QuestionScreenProps {
  question: Question;
  playerName: string;
  onAnswer: (answer: string) => void;
  onSkip: () => void;
}

export const QuestionScreen = ({
  question,
  playerName,
  onAnswer,
  onSkip
}: QuestionScreenProps) => {
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [customAnswer, setCustomAnswer] = useState('');

  const handleSubmit = () => {
    const answer = selectedSuggestion || customAnswer;
    if (answer.trim()) {
      onAnswer(answer);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white/80 backdrop-blur-sm border-rose-200 shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <div className="text-3xl">{question.category_icon}</div>
          <CardTitle className="text-xl font-serif text-rose-800 leading-relaxed">
            {question.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!showAnswerForm ? (
            <div className="grid grid-cols-2 gap-4">
              <Button
                className="h-16 text-lg font-medium bg-gradient-to-br from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
                onClick={() => setShowAnswerForm(true)}
              >
                <Send className="w-5 h-5 mr-2" />
                Je réponds
              </Button>
              <Button
                variant="outline"
                className="h-16 text-lg font-medium border-rose-300 text-rose-700 hover:bg-rose-50"
                onClick={onSkip}
              >
                <EyeOff className="w-5 h-5 mr-2" />
                🫣
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {question.suggestions && question.suggestions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-rose-600 font-medium">Suggestions :</p>
                  <div className="flex flex-wrap gap-2">
                    {question.suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant={selectedSuggestion === suggestion ? 'default' : 'outline'}
                        size="sm"
                        className={`${
                          selectedSuggestion === suggestion
                            ? 'bg-rose-500 text-white hover:bg-rose-600'
                            : 'border-rose-300 text-rose-700 hover:bg-rose-50'
                        }`}
                        onClick={() => {
                          setSelectedSuggestion(suggestion);
                          setCustomAnswer('');
                        }}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <p className="text-sm text-rose-600 font-medium">Ou écrivez votre réponse :</p>
                <Textarea
                  placeholder="Votre réponse personnelle..."
                  value={customAnswer}
                  onChange={(e) => {
                    setCustomAnswer(e.target.value);
                    setSelectedSuggestion(null);
                  }}
                  className="border-rose-300 focus:border-rose-500 focus:ring-rose-500"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-rose-300 text-rose-700 hover:bg-rose-50"
                  onClick={() => setShowAnswerForm(false)}
                >
                  Retour
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
                  disabled={!selectedSuggestion && !customAnswer.trim()}
                  onClick={handleSubmit}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
