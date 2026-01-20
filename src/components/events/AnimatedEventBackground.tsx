import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedEventBackgroundProps {
  colorTheme: 'rose' | 'violet' | 'cyan' | 'blue' | 'orange' | 'red';
  children: React.ReactNode;
}

const gradientClasses = {
  rose: 'from-rose-200 via-pink-100 to-rose-300',
  violet: 'from-violet-200 via-purple-100 to-violet-300',
  cyan: 'from-cyan-200 via-sky-100 to-cyan-300',
  blue: 'from-blue-200 via-sky-100 to-blue-300',
  orange: 'from-orange-200 via-amber-100 to-orange-300',
  red: 'from-red-200 via-rose-100 to-red-300',
};

const particleColors = {
  rose: ['bg-rose-300', 'bg-pink-300', 'bg-rose-400'],
  violet: ['bg-violet-300', 'bg-purple-300', 'bg-violet-400'],
  cyan: ['bg-cyan-300', 'bg-sky-300', 'bg-cyan-400'],
  blue: ['bg-blue-300', 'bg-sky-300', 'bg-blue-400'],
  orange: ['bg-orange-300', 'bg-amber-300', 'bg-orange-400'],
  red: ['bg-red-300', 'bg-rose-300', 'bg-red-400'],
};

const FloatingParticle: React.FC<{ 
  colorClass: string; 
  delay: number; 
  size: number;
  startX: number;
  startY: number;
}> = ({ colorClass, delay, size, startX, startY }) => (
  <motion.div
    className={`absolute rounded-full ${colorClass} opacity-40 blur-sm`}
    style={{ 
      width: size, 
      height: size,
      left: `${startX}%`,
      top: `${startY}%`,
    }}
    animate={{
      y: [-20, -100, -20],
      x: [0, Math.random() * 40 - 20, 0],
      opacity: [0.3, 0.6, 0.3],
      scale: [1, 1.2, 1],
    }}
    transition={{
      duration: 4 + Math.random() * 2,
      repeat: Infinity,
      delay,
      ease: 'easeInOut',
    }}
  />
);

const ConcentricCircle: React.FC<{ 
  colorClass: string; 
  size: number; 
  delay: number 
}> = ({ colorClass, size, delay }) => (
  <motion.div
    className={`absolute rounded-full border-2 ${colorClass} opacity-20`}
    style={{ 
      width: size, 
      height: size,
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
    }}
    animate={{
      scale: [0.8, 1.2, 0.8],
      opacity: [0.1, 0.3, 0.1],
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      delay,
      ease: 'easeInOut',
    }}
  />
);

export const AnimatedEventBackground: React.FC<AnimatedEventBackgroundProps> = ({
  colorTheme,
  children,
}) => {
  const gradient = gradientClasses[colorTheme];
  const colors = particleColors[colorTheme];
  const borderColor = colorTheme === 'rose' ? 'border-rose-300' 
    : colorTheme === 'violet' ? 'border-violet-300'
    : colorTheme === 'cyan' ? 'border-cyan-300'
    : colorTheme === 'blue' ? 'border-blue-300'
    : colorTheme === 'orange' ? 'border-orange-300'
    : 'border-red-300';

  // Generate random particles
  const particles = Array.from({ length: 12 }, (_, i) => ({
    colorClass: colors[i % colors.length],
    delay: i * 0.3,
    size: 8 + Math.random() * 12,
    startX: Math.random() * 100,
    startY: 50 + Math.random() * 50,
  }));

  return (
    <div className={`min-h-screen bg-gradient-to-br ${gradient} relative overflow-hidden`}>
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 50%)`,
            `radial-gradient(circle at 70% 70%, rgba(255,255,255,0.4) 0%, transparent 50%)`,
            `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 50%)`,
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Concentric circles */}
      <div className="absolute inset-0 pointer-events-none">
        <ConcentricCircle colorClass={borderColor} size={300} delay={0} />
        <ConcentricCircle colorClass={borderColor} size={400} delay={0.5} />
        <ConcentricCircle colorClass={borderColor} size={500} delay={1} />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p, i) => (
          <FloatingParticle key={i} {...p} />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        {children}
      </div>
    </div>
  );
};
