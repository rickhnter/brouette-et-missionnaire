import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RoomInfo {
  player1_name: string;
  player2_name: string | null;
}

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
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [lookingUp, setLookingUp] = useState(false);

  // Lookup room when code is complete
  useEffect(() => {
    const code = roomCode.trim();
    if (code.length !== 6) {
      setRoomInfo(null);
      return;
    }
    const lookup = async () => {
      setLookingUp(true);
      const { data } = await supabase
        .from('game_sessions')
        .select('player1_name, player2_name')
        .eq('room_code', code.toUpperCase())
        .single();
      setRoomInfo(data ? { player1_name: data.player1_name, player2_name: data.player2_name } : null);
      setLookingUp(false);
    };
    lookup();
  }, [roomCode]);

  // Pre-lookup if code is prefilled
  useEffect(() => {
    if (prefilledCode && prefilledCode.length === 6) {
      setRoomCode(prefilledCode);
    }
  }, [prefilledCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim() && playerName.trim()) {
      await onJoin(roomCode.trim().toUpperCase(), playerName.trim());
    }
  };

  const handleSelectPlayer = async (name: string) => {
    setPlayerName(name);
    await onJoin(roomCode.trim().toUpperCase(), name);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().slice(0, 6);
    setRoomCode(value);
    setPlayerName("");
  };

  const bothPlayersKnown = roomInfo?.player1_name && roomInfo?.player2_name;

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
                autoFocus={!prefilledCode}
                maxLength={6}
              />
              {lookingUp && (
                <div className="flex items-center justify-center gap-2 text-rose-400 text-sm">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Recherche de la room...
                </div>
              )}
            </div>

            {/* Player selection when both players are known */}
            {roomInfo && bothPlayersKnown && !lookingUp ? (
              <div className="space-y-3">
                <Label className="text-rose-700">Qui es-tu ?</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-16 flex flex-col gap-1 border-rose-300 text-rose-700 hover:bg-rose-50 hover:border-rose-400"
                    onClick={() => handleSelectPlayer(roomInfo.player1_name)}
                    disabled={loading}
                  >
                    <User className="w-5 h-5 text-rose-500" />
                    <span className="font-medium">{roomInfo.player1_name}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-16 flex flex-col gap-1 border-rose-300 text-rose-700 hover:bg-rose-50 hover:border-rose-400"
                    onClick={() => handleSelectPlayer(roomInfo.player2_name!)}
                    disabled={loading}
                  >
                    <User className="w-5 h-5 text-rose-500" />
                    <span className="font-medium">{roomInfo.player2_name}</span>
                  </Button>
                </div>
                {loading && (
                  <div className="flex items-center justify-center gap-2 text-rose-500 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connexion...
                  </div>
                )}
              </div>
            ) : roomInfo && !bothPlayersKnown && !lookingUp ? (
              // Only player1 exists, ask for name
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
                  autoFocus
                />
              </div>
            ) : !roomInfo && roomCode.length === 6 && !lookingUp ? (
              // Room not found
              <p className="text-sm text-amber-600 text-center">Room introuvable. Vérifie le code.</p>
            ) : roomCode.length < 6 ? (
              // Code not complete yet, show name field
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
            ) : null}

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            {/* Show submit button only when name field is visible */}
            {(!bothPlayersKnown || !roomInfo) && roomCode.length < 6 && (
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
            )}

            {/* Show submit button when room not found or only p1 known */}
            {roomInfo && !bothPlayersKnown && !lookingUp && playerName.trim() && (
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium"
                disabled={!playerName.trim() || loading}
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
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
