import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (name: string) => void;
}

export const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  const handleLogin = () => {
    if (selectedPlayer) {
      onLogin(selectedPlayer);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-rose-200 shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>
          <CardTitle className="text-2xl font-serif text-rose-800">
            Jeu des Questions
          </CardTitle>
          <CardDescription className="text-rose-600">
            Découvrez-vous à travers des questions intimes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center text-sm text-rose-600 mb-4">
            Qui êtes-vous ?
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={selectedPlayer === 'Pierrick' ? 'default' : 'outline'}
              className={`h-20 text-lg font-medium transition-all ${
                selectedPlayer === 'Pierrick'
                  ? 'bg-gradient-to-br from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white border-0'
                  : 'border-rose-300 text-rose-700 hover:bg-rose-50 hover:border-rose-400'
              }`}
              onClick={() => setSelectedPlayer('Pierrick')}
            >
              Pierrick
            </Button>
            <Button
              variant={selectedPlayer === 'Daisy' ? 'default' : 'outline'}
              className={`h-20 text-lg font-medium transition-all ${
                selectedPlayer === 'Daisy'
                  ? 'bg-gradient-to-br from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white border-0'
                  : 'border-rose-300 text-rose-700 hover:bg-rose-50 hover:border-rose-400'
              }`}
              onClick={() => setSelectedPlayer('Daisy')}
            >
              Daisy
            </Button>
          </div>
          <Button
            className="w-full h-12 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium"
            disabled={!selectedPlayer}
            onClick={handleLogin}
          >
            Commencer l'aventure
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
