import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Room {
  id: string;
  room_code: string;
  room_name: string | null;
  player1_name: string;
  player2_name: string | null;
  player1_connected: boolean;
  player2_connected: boolean;
  status: string;
  current_level: number | null;
  current_question_id: string | null;
  created_at: string;
  updated_at: string;
}

interface LocalRoomEntry {
  roomId: string;
  roomCode: string;
  playerName: string;
  roomName: string | null;
  lastAccess: string;
}

const LOCAL_STORAGE_KEY = 'lovable_rooms';

const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sans I, O, 0, 1 pour éviter confusion
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const getLocalRooms = (): LocalRoomEntry[] => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveLocalRoom = (entry: LocalRoomEntry) => {
  const rooms = getLocalRooms().filter(r => r.roomId !== entry.roomId);
  rooms.unshift(entry);
  // Garder max 20 rooms
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rooms.slice(0, 20)));
};

const removeLocalRoom = (roomId: string) => {
  const rooms = getLocalRooms().filter(r => r.roomId !== roomId);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rooms));
};

export const useRoom = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

  const createRoom = useCallback(async (playerName: string, roomName?: string): Promise<Room | null> => {
    setLoading(true);
    setError(null);

    try {
      // Générer un code unique
      let roomCode = generateRoomCode();
      let attempts = 0;
      
      // Vérifier l'unicité du code
      while (attempts < 5) {
        const { data: existing } = await supabase
          .from('game_sessions')
          .select('id')
          .eq('room_code', roomCode)
          .single();
        
        if (!existing) break;
        roomCode = generateRoomCode();
        attempts++;
      }

      const { data, error: createError } = await supabase
        .from('game_sessions')
        .insert({
          player1_name: playerName,
          player1_connected: true,
          room_code: roomCode,
          room_name: roomName || null,
          status: 'waiting'
        })
        .select()
        .single();

      if (createError) throw createError;

      const room = data as Room;
      setCurrentRoom(room);
      
      // Sauvegarder localement
      saveLocalRoom({
        roomId: room.id,
        roomCode: room.room_code,
        playerName,
        roomName: room.room_name,
        lastAccess: new Date().toISOString()
      });

      return room;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const joinRoom = useCallback(async (roomCode: string, playerName: string): Promise<Room | null> => {
    setLoading(true);
    setError(null);

    try {
      // Chercher la room par code
      const { data: room, error: findError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('room_code', roomCode.toUpperCase())
        .single();

      if (findError || !room) {
        setError('Room introuvable. Vérifiez le code.');
        return null;
      }

      // Vérifier si la room est déjà pleine
      if (room.player2_name && room.player2_name !== playerName) {
        setError('Cette room est déjà complète.');
        return null;
      }

      // Vérifier si c'est le même joueur qui a créé la room
      if (room.player1_name === playerName) {
        // Mettre à jour la connexion
        const { data: updated, error: updateError } = await supabase
          .from('game_sessions')
          .update({ player1_connected: true })
          .eq('id', room.id)
          .select()
          .single();

        if (updateError) throw updateError;
        
        const updatedRoom = updated as Room;
        setCurrentRoom(updatedRoom);
        
        saveLocalRoom({
          roomId: updatedRoom.id,
          roomCode: updatedRoom.room_code,
          playerName,
          roomName: updatedRoom.room_name,
          lastAccess: new Date().toISOString()
        });
        
        return updatedRoom;
      }

      // Rejoindre en tant que player2
      const { data: updated, error: updateError } = await supabase
        .from('game_sessions')
        .update({
          player2_name: playerName,
          player2_connected: true
        })
        .eq('id', room.id)
        .select()
        .single();

      if (updateError) throw updateError;

      const updatedRoom = updated as Room;
      setCurrentRoom(updatedRoom);
      
      saveLocalRoom({
        roomId: updatedRoom.id,
        roomCode: updatedRoom.room_code,
        playerName,
        roomName: updatedRoom.room_name,
        lastAccess: new Date().toISOString()
      });

      return updatedRoom;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMyRooms = useCallback(async (): Promise<Room[]> => {
    const localRooms = getLocalRooms();
    if (localRooms.length === 0) return [];

    try {
      const roomIds = localRooms.map(r => r.roomId);
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .in('id', roomIds)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Filtrer les rooms qui n'existent plus
      const existingRoomIds = new Set((data || []).map(r => r.id));
      localRooms.forEach(lr => {
        if (!existingRoomIds.has(lr.roomId)) {
          removeLocalRoom(lr.roomId);
        }
      });

      return (data || []) as Room[];
    } catch {
      return [];
    }
  }, []);

  const resumeRoom = useCallback(async (roomId: string, playerName: string): Promise<Room | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data: room, error: findError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('id', roomId)
        .single();

      if (findError || !room) {
        removeLocalRoom(roomId);
        setError('Cette room n\'existe plus.');
        return null;
      }

      // Mettre à jour la connexion
      const isPlayer1 = room.player1_name === playerName;
      const updates = isPlayer1 
        ? { player1_connected: true }
        : { player2_connected: true };

      const { data: updated, error: updateError } = await supabase
        .from('game_sessions')
        .update(updates)
        .eq('id', roomId)
        .select()
        .single();

      if (updateError) throw updateError;

      const updatedRoom = updated as Room;
      setCurrentRoom(updatedRoom);
      
      saveLocalRoom({
        roomId: updatedRoom.id,
        roomCode: updatedRoom.room_code,
        playerName,
        roomName: updatedRoom.room_name,
        lastAccess: new Date().toISOString()
      });

      return updatedRoom;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const leaveRoom = useCallback(() => {
    if (currentRoom) {
      removeLocalRoom(currentRoom.id);
    }
    setCurrentRoom(null);
  }, [currentRoom]);

  const getLocalRoomEntries = useCallback((): LocalRoomEntry[] => {
    return getLocalRooms();
  }, []);

  return {
    loading,
    error,
    currentRoom,
    setCurrentRoom,
    createRoom,
    joinRoom,
    getMyRooms,
    resumeRoom,
    leaveRoom,
    getLocalRoomEntries
  };
};
