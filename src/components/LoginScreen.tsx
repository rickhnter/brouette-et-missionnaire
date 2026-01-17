import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import logo from "@/assets/logo.png";

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
          <img src={logo} alt="Brouette & Missionnaire" className="mx-auto w-64 h-auto" />
          <CardDescription className="text-rose-600">Découvrez-vous.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center text-sm text-rose-600 mb-4">Qui êtes-vous ?</div>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={selectedPlayer === "Pierrick" ? "default" : "outline"}
              className={`h-20 text-lg font-medium transition-all ${
                selectedPlayer === "Pierrick"
                  ? "bg-gradient-to-br from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white border-0"
                  : "border-rose-300 text-rose-700 hover:bg-rose-50 hover:border-rose-400"
              }`}
              onClick={() => setSelectedPlayer("Pierrick")}
            >
              Pierrick
            </Button>
            <Button
              variant={selectedPlayer === "Daisy" ? "default" : "outline"}
              className={`h-20 text-lg font-medium transition-all ${
                selectedPlayer === "Daisy"
                  ? "bg-gradient-to-br from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white border-0"
                  : "border-rose-300 text-rose-700 hover:bg-rose-50 hover:border-rose-400"
              }`}
              onClick={() => setSelectedPlayer("Daisy")}
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
