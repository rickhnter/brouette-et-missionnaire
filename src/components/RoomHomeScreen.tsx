import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import { Plus, Users, History } from "lucide-react";

interface RoomHomeScreenProps {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onMyRooms: () => void;
  hasExistingRooms: boolean;
}

export const RoomHomeScreen = ({ 
  onCreateRoom, 
  onJoinRoom, 
  onMyRooms,
  hasExistingRooms 
}: RoomHomeScreenProps) => {
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
        </CardContent>
      </Card>
    </div>
  );
};
