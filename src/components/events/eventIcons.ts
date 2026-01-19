// Centralized event icons configuration
import iconMessage from '@/assets/icon-message.svg';
import iconConfession from '@/assets/icon-confession.svg';
import iconPhoto from '@/assets/icon-photo.svg';
import iconSync from '@/assets/icon-sync.svg';
import iconMagicpen from '@/assets/icon-magicpen.svg';
import iconGame from '@/assets/icon-game.svg';
import levelIcon from '@/assets/icon-flamme.svg';

export type EventType = 'message' | 'promise' | 'photo' | 'sync' | 'game' | 'confession';

export interface EventIconConfig {
  icon: string;
  color: string;
  label: string;
}

export const eventIcons: Record<EventType, EventIconConfig> = {
  message: { icon: iconMessage, color: 'bg-pink-500', label: 'Message' },
  promise: { icon: iconMagicpen, color: 'bg-violet-500', label: 'Promesse' },
  photo: { icon: iconPhoto, color: 'bg-cyan-500', label: 'Photo' },
  sync: { icon: iconSync, color: 'bg-blue-500', label: 'Action sync' },
  game: { icon: iconGame, color: 'bg-orange-500', label: 'Mini-jeu' },
  confession: { icon: iconConfession, color: 'bg-red-500', label: 'Confession' },
};

export { levelIcon };

export const getEventIcon = (type: EventType) => eventIcons[type] || eventIcons.message;
