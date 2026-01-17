import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Loader2 } from 'lucide-react';

interface WaitingRoomProps {
  playerName: string;
  partnerName?: string;
}

export const WaitingRoom = ({ playerName, partnerName }: WaitingRoomProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-rose-200 shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>
          <CardTitle className="text-2xl font-serif text-rose-800">
            Bienvenue, {playerName} 💕
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="flex items-center justify-center gap-3 text-rose-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-lg">
              En attente de {partnerName || 'votre partenaire'}...
            </span>
          </div>
          <div className="text-sm text-rose-500 italic">
            L'aventure commence quand vous serez tous les deux connectés
          </div>
          <div className="pt-4">
            <div className="w-full h-2 bg-rose-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
