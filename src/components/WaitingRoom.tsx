import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Share2, Check, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WaitingRoomProps {
  playerName: string;
  partnerName?: string;
  roomCode?: string;
  roomName?: string;
}

export const WaitingRoom = ({ playerName, partnerName, roomCode, roomName }: WaitingRoomProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyCode = async () => {
    if (!roomCode) return;
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      toast({
        title: "Code copié !",
        description: "Partage ce code à ton partenaire 💕",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le code",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (!roomCode) return;
    const shareData = {
      title: 'Brouette & Missionnaire',
      text: `Rejoins-moi pour jouer ! Code: ${roomCode}`,
      url: `${window.location.origin}/?code=${roomCode}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        toast({
          title: "Lien copié !",
          description: "Partage ce lien à ton partenaire 💕",
        });
      }
    } catch (err) {
      // User cancelled sharing
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-rose-200 shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="py-4">
            <div className="relative mx-auto w-32 h-32">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full animate-pulse" />
              <div className="absolute inset-4 bg-gradient-to-br from-rose-300 to-pink-300 rounded-full animate-pulse delay-100" />
              <div className="absolute inset-8 bg-gradient-to-br from-rose-400 to-pink-400 rounded-full animate-pulse delay-200" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          {roomName && (
            <p className="text-lg font-medium text-rose-700">{roomName}</p>
          )}
          
          <div className="flex items-center justify-center gap-3 text-rose-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-lg">En attente de ton partenaire...</span>
          </div>

          <div className="text-sm text-rose-500 italic">
            L'aventure commence quand vous serez tous les deux connectés
          </div>
          
          <div className="pt-2">
            <div className="w-full h-2 bg-rose-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full animate-pulse"
                style={{ width: "60%" }}
              />
            </div>
          </div>

          {roomCode && (
            <div className="bg-rose-50 rounded-lg p-4 space-y-3">
              <p className="text-sm text-rose-600">Code de la room :</p>
              <div className="flex items-center justify-center gap-2">
                <div className="bg-white border-2 border-rose-300 rounded-lg px-6 py-3">
                  <span className="text-3xl font-mono font-bold text-rose-700 tracking-widest">
                    {roomCode}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyCode}
                  className="border-rose-300 text-rose-600 hover:bg-rose-50"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <Button
                onClick={handleShare}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Partager le code
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
