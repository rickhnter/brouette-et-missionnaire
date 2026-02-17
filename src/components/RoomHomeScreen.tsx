import { useState } from "react";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/logo.png";
import { Plus, Users, History, Search } from "lucide-react";

interface RoomHomeScreenProps {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onMyRooms: () => void;
  onJoinWithCode: (code: string) => void;
  hasExistingRooms: boolean;
}

export const RoomHomeScreen = ({ 
  onCreateRoom, 
  onJoinRoom, 
  onMyRooms,
  onJoinWithCode,
  hasExistingRooms 
}: RoomHomeScreenProps) => {
  const [showRecoverInput, setShowRecoverInput] = useState(false);
  const [recoverCode, setRecoverCode] = useState("");

  const handleRecover = () => {
    if (recoverCode.trim().length === 6) {
      onJoinWithCode(recoverCode.trim().toUpperCase());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-rose-200 shadow-xl">
        <CardHeader className="text-center space-y-4">
          <img src={logo} alt="Brouette & Missionnaire" className="mx-auto w-64 h-auto" />
          <CardDescription className="text-rose-600">Découvrez-vous.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full h-14 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium text-lg gap-3"
            onClick={onCreateRoom}
          >
            <Plus className="w-5 h-5" />
            Créer une room
          </Button>
          
          <Button
            variant="outline"
            className="w-full h-14 border-rose-300 text-rose-700 hover:bg-rose-50 hover:border-rose-400 font-medium text-lg gap-3"
            onClick={onJoinRoom}
          >
            <Users className="w-5 h-5" />
            Rejoindre une room
          </Button>

          {hasExistingRooms && (
            <Button
              variant="ghost"
              className="w-full h-12 text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-medium gap-3"
              onClick={onMyRooms}
            >
              <History className="w-5 h-5" />
              Mes parties en cours
            </Button>
          )}

          {!showRecoverInput ? (
            <Button
              variant="ghost"
              className="w-full h-10 text-rose-400 hover:text-rose-600 hover:bg-rose-50 font-medium gap-2 text-sm"
              onClick={() => setShowRecoverInput(true)}
            >
              <Search className="w-4 h-4" />
              Récupérer une ancienne partie
            </Button>
          ) : (
            <div className="space-y-2 pt-1 border-t border-rose-100">
              <p className="text-xs text-rose-500 text-center">Entre le code de la room à récupérer</p>
              <div className="flex gap-2">
                <input
                  className="flex-1 border border-rose-200 rounded-md px-3 py-2 text-center text-lg font-mono tracking-widest uppercase focus:outline-none focus:border-rose-400"
                  placeholder="ABC123"
                  maxLength={6}
                  value={recoverCode}
                  autoFocus
                  onChange={e => setRecoverCode(e.target.value.toUpperCase().slice(0, 6))}
                  onKeyDown={e => e.key === 'Enter' && handleRecover()}
                />
                <Button
                  className="bg-rose-500 hover:bg-rose-600 text-white px-4"
                  onClick={handleRecover}
                  disabled={recoverCode.trim().length !== 6}
                >
                  OK
                </Button>
              </div>
              <button
                className="w-full text-xs text-rose-400 hover:text-rose-600"
                onClick={() => { setShowRecoverInput(false); setRecoverCode(""); }}
              >
                Annuler
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
