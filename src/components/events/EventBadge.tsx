import React from 'react';
import { motion } from 'framer-motion';
import { eventIcons, EventType, EventIconConfig } from './eventIcons';

interface EventBadgeProps {
  type: EventType;
  size?: 'sm' | 'md' | 'lg';
}

export const EventBadge: React.FC<EventBadgeProps> = ({ type, size = 'md' }) => {
  const config = eventIcons[type] || eventIcons.message;
  
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <motion.div
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`${config.color} text-white ${sizeClasses[size]} rounded-full font-medium shadow-lg inline-flex items-center gap-2`}
    >
      <img src={config.icon} alt="" className={`${iconSizes[size]} object-contain`} />
      <span>{config.label}</span>
    </motion.div>
  );
};

export const getEventConfig = (type: EventType): EventIconConfig => eventIcons[type] || eventIcons.message;

export type { EventType };
