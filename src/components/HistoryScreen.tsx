import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ArrowLeft } from 'lucide-react';
import { useHistory } from '@/hooks/useHistory';

interface HistoryScreenProps {
  sessionId: string;
  onBack: () => void;
}

export const HistoryScreen = ({ sessionId, onBack }: HistoryScreenProps) => {
  const { history, loading } = useHistory(sessionId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-rose-700 hover:bg-rose-100"
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-serif text-rose-800">Historique</h1>
        </div>

        {loading ? (
          <div className="text-center py-12 text-rose-600">
            Chargement de l'historique...
          </div>
        ) : history.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-rose-200">
            <CardContent className="py-12 text-center text-rose-600">
              Aucune réponse pour le moment.
              <br />
              <span className="text-sm">Commencez à jouer pour voir l'historique ici !</span>
            </CardContent>
          </Card>
        ) : (
          history.map((entry, index) => (
            <Card key={entry.id} className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-lg">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-sm text-rose-500">
                  <span>{entry.category_icon}</span>
                  <span>{entry.category}</span>
                </div>
                <CardTitle className="text-lg font-serif text-rose-800">
                  {entry.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg border border-rose-100">
                    <p className="text-xs font-medium text-rose-500 mb-1">{entry.player1_name}</p>
                    <p className="text-rose-800">{entry.player1_answer || '—'}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg border border-pink-100">
                    <p className="text-xs font-medium text-pink-500 mb-1">{entry.player2_name}</p>
                    <p className="text-pink-800">{entry.player2_answer || '—'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
