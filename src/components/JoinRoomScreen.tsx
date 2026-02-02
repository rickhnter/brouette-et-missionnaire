import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";

interface JoinRoomScreenProps {
  onBack: () => void;
  onJoin: (roomCode: string, playerName: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  prefilledCode?: string;
}

export const JoinRoomScreen = ({ onBack, onJoin, loading, error, prefilledCode }: JoinRoomScreenProps) => {
  const [roomCode, setRoomCode] = useState(prefilledCode || "");
  const [playerName, setPlayerName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim() && playerName.trim()) {
      await onJoin(roomCode.trim().toUpperCase(), playerName.trim());
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convertir en majuscules et limiter à 6 caractères
    const value = e.target.value.toUpperCase().slice(0, 6);
    setRoomCode(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-rose-200 shadow-xl">
        <CardHeader className="text-center space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-4 top-4 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Retour
          </Button>
          <CardTitle className="text-2xl text-rose-700 pt-6">Rejoindre une room</CardTitle>
          <CardDescription className="text-rose-500">
            Entre le code partagé par ton partenaire
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="roomCode" className="text-rose-700">
                Code de la room *
              </Label>
              <Input
                id="roomCode"
                value={roomCode}
                onChange={handleCodeChange}
                placeholder="ABC123"
                className="border-rose-200 focus:border-rose-400 focus:ring-rose-400 text-center text-2xl tracking-widest font-mono uppercase"
                required
                autoFocus
                maxLength={6}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="playerName" className="text-rose-700">
                Ton prénom *
              </Label>
              <Input
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Entre ton prénom"
                className="border-rose-200 focus:border-rose-400 focus:ring-rose-400"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium"
              disabled={!roomCode.trim() || !playerName.trim() || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Rejoindre"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
