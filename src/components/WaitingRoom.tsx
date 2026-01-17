import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Loader2, Share2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import logo from '@/assets/logo.png';

interface WaitingRoomProps {
  playerName: string;
  partnerName?: string;
}

export const WaitingRoom = ({ playerName, partnerName }: WaitingRoomProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const partner = playerName === 'Pierrick' ? 'Daisy' : 'Pierrick';
  const shareUrl = `${window.location.origin}/?player=${partner}`;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Lien copié !",
        description: `Envoie ce lien à ${partner} pour commencer 💕`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-rose-200 shadow-xl">
        <CardHeader className="text-center space-y-4">
          <img 
            src={logo} 
            alt="Brouette & Missionnaire" 
            className="mx-auto w-48 h-auto"
          />
          <CardTitle className="text-xl font-serif text-rose-800">
            Bienvenue, {playerName} 💕
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="flex items-center justify-center gap-3 text-rose-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-lg">
              En attente de {partner}...
            </span>
          </div>
          
          <div className="bg-rose-50 rounded-lg p-4 space-y-3">
            <p className="text-sm text-rose-600">
              Partage ce lien avec {partner} :
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 text-xs bg-white border border-rose-200 rounded px-2 py-2 text-rose-700 truncate"
              />
              <Button
                onClick={handleShare}
                size="sm"
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
              >
                {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="text-sm text-rose-500 italic">
            L'aventure commence quand vous serez tous les deux connectés
          </div>
          <div className="pt-2">
            <div className="w-full h-2 bg-rose-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
