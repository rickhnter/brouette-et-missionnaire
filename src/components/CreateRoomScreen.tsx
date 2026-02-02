import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";

interface CreateRoomScreenProps {
  onBack: () => void;
  onCreate: (playerName: string, roomName?: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const CreateRoomScreen = ({ onBack, onCreate, loading, error }: CreateRoomScreenProps) => {
  const [playerName, setPlayerName] = useState("");
  const [roomName, setRoomName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      await onCreate(playerName.trim(), roomName.trim() || undefined);
    }
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
          <CardTitle className="text-2xl text-rose-700 pt-6">Créer une room</CardTitle>
          <CardDescription className="text-rose-500">
            Invite ton partenaire avec le code de room
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
            
            <div className="space-y-2">
              <Label htmlFor="roomName" className="text-rose-700">
                Nom de la room (optionnel)
              </Label>
              <Input
                id="roomName"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Ex: Notre aventure"
                className="border-rose-200 focus:border-rose-400 focus:ring-rose-400"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium"
              disabled={!playerName.trim() || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer la room"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
