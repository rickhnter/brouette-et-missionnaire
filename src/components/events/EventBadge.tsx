import React from 'react';
import { motion } from 'framer-motion';

export type EventType = 'message' | 'promise' | 'photo' | 'sync' | 'game' | 'confession';

interface EventBadgeProps {
  type: EventType;
  size?: 'sm' | 'md' | 'lg';
}

const eventConfig: Record<EventType, { icon: string; color: string; label: string }> = {
  message: { icon: '💌', color: 'bg-pink-500', label: 'Message' },
  promise: { icon: '🤞', color: 'bg-violet-500', label: 'Promesse' },
  photo: { icon: '📸', color: 'bg-cyan-500', label: 'Photo' },
  sync: { icon: '🔗', color: 'bg-blue-500', label: 'Action sync' },
  game: { icon: '🎲', color: 'bg-orange-500', label: 'Mini-jeu' },
  confession: { icon: '💋', color: 'bg-red-500', label: 'Confession' },
};

export const EventBadge: React.FC<EventBadgeProps> = ({ type, size = 'md' }) => {
  const config = eventConfig[type] || eventConfig.message;
  
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <motion.div
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`${config.color} text-white ${sizeClasses[size]} rounded-full font-medium shadow-lg inline-flex items-center gap-2`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </motion.div>
  );
};

export const getEventConfig = (type: EventType) => eventConfig[type] || eventConfig.message;
