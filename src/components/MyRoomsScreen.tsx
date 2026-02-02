import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Clock, Play, Loader2 } from "lucide-react";
import { Room } from "@/hooks/useRoom";

interface LocalRoomEntry {
  roomId: string;
  roomCode: string;
  playerName: string;
  roomName: string | null;
  lastAccess: string;
}

interface MyRoomsScreenProps {
  onBack: () => void;
  onResume: (roomId: string, playerName: string) => Promise<void>;
  getMyRooms: () => Promise<Room[]>;
  getLocalRoomEntries: () => LocalRoomEntry[];
  loading: boolean;
}

export const MyRoomsScreen = ({ onBack, onResume, getMyRooms, getLocalRoomEntries, loading }: MyRoomsScreenProps) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [localEntries, setLocalEntries] = useState<LocalRoomEntry[]>([]);
  const [fetchingRooms, setFetchingRooms] = useState(true);
  const [resumingRoomId, setResumingRoomId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      setFetchingRooms(true);
      const entries = getLocalRoomEntries();
      setLocalEntries(entries);
      const fetchedRooms = await getMyRooms();
      setRooms(fetchedRooms);
      setFetchingRooms(false);
    };
    fetchRooms();
  }, [getMyRooms, getLocalRoomEntries]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'waiting': return { label: 'En attente', color: 'text-amber-600 bg-amber-50' };
      case 'playing': return { label: 'En cours', color: 'text-green-600 bg-green-50' };
      case 'finished': return { label: 'Terminée', color: 'text-gray-600 bg-gray-50' };
      default: return { label: status, color: 'text-gray-600 bg-gray-50' };
    }
  };

  const getPlayerNameForRoom = (room: Room): string => {
    const entry = localEntries.find(e => e.roomId === room.id);
    return entry?.playerName || room.player1_name;
  };

  const handleResume = async (room: Room) => {
    setResumingRoomId(room.id);
    const playerName = getPlayerNameForRoom(room);
    await onResume(room.id, playerName);
    setResumingRoomId(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <CardTitle className="text-2xl text-rose-700 pt-6">Mes parties</CardTitle>
          <CardDescription className="text-rose-500">
            Reprends là où tu t'es arrêté
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fetchingRooms ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-rose-500 animate-spin" />
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-8 text-rose-500">
              <p>Aucune partie en cours</p>
              <Button
                variant="link"
                className="text-rose-600 hover:text-rose-700 mt-2"
                onClick={onBack}
              >
                Créer une nouvelle room
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {rooms.map((room) => {
                const status = getStatusLabel(room.status || 'waiting');
                const playerName = getPlayerNameForRoom(room);
                const partnerName = room.player1_name === playerName ? room.player2_name : room.player1_name;
                const isResuming = resumingRoomId === room.id;

                return (
                  <div
                    key={room.id}
                    className="bg-white rounded-lg border border-rose-200 p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-rose-800">
                          {room.room_name || `Room ${room.room_code}`}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-rose-500 mt-1">
                          <Users className="w-4 h-4" />
                          <span>{playerName}</span>
                          {partnerName && (
                            <>
                              <span>&</span>
                              <span>{partnerName}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-rose-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(room.updated_at)}</span>
                      </div>
                      
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
                        onClick={() => handleResume(room)}
                        disabled={loading || isResuming}
                      >
                        {isResuming ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-1" />
                            Reprendre
                          </>
                        )}
                      </Button>
                    </div>

                    {room.current_level && (
                      <div className="text-xs text-rose-400">
                        Niveau {room.current_level}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
