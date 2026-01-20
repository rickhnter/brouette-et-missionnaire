import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface EventCardLayoutProps {
  icon: string;
  title: string;
  children: React.ReactNode;
  colorTheme: 'rose' | 'violet' | 'cyan' | 'blue' | 'orange' | 'red';
}

const colorClasses = {
  rose: {
    iconGlow: 'shadow-rose-500/40',
    titleColor: 'text-rose-700',
  },
  violet: {
    iconGlow: 'shadow-violet-500/40',
    titleColor: 'text-violet-700',
  },
  cyan: {
    iconGlow: 'shadow-cyan-500/40',
    titleColor: 'text-cyan-700',
  },
  blue: {
    iconGlow: 'shadow-blue-500/40',
    titleColor: 'text-blue-700',
  },
  orange: {
    iconGlow: 'shadow-orange-500/40',
    titleColor: 'text-orange-700',
  },
  red: {
    iconGlow: 'shadow-red-500/40',
    titleColor: 'text-red-700',
  },
};

export const EventCardLayout: React.FC<EventCardLayoutProps> = ({
  icon,
  title,
  children,
  colorTheme,
}) => {
  const colors = colorClasses[colorTheme];

  return (
    <Card className="bg-white/95 backdrop-blur-md border-white/50 shadow-2xl rounded-3xl overflow-hidden">
      <CardContent className="p-6 space-y-5">
        {/* Animated Icon */}
        <div className="flex justify-center">
          <motion.div
            className={`relative`}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <motion.div
              className={`w-20 h-20 flex items-center justify-center ${colors.iconGlow}`}
              animate={{ 
                filter: ['drop-shadow(0 0 20px currentColor)', 'drop-shadow(0 0 35px currentColor)', 'drop-shadow(0 0 20px currentColor)'],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ filter: 'drop-shadow(0 0 25px currentColor)' }}
            >
              <img 
                src={icon} 
                alt="" 
                className="w-16 h-16 object-contain drop-shadow-lg"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`text-2xl font-bold text-center ${colors.titleColor}`}
        >
          {title}
        </motion.h2>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {children}
        </motion.div>
      </CardContent>
    </Card>
  );
};
