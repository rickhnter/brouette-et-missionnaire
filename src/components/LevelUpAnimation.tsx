import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import levelIcon from '@/assets/icon-flamme.svg';

interface LevelUpAnimationProps {
  level: number;
  onComplete: () => void;
}

export const LevelUpAnimation = ({ level, onComplete }: LevelUpAnimationProps) => {
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(false);
      setTimeout(onComplete, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {showContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-rose-900/90 via-pink-800/90 to-red-900/90 backdrop-blur-sm"
        >
          {/* Particles Background */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-orange-400/60 rounded-full"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: window.innerHeight + 50,
                  scale: Math.random() * 0.5 + 0.5,
                }}
                animate={{
                  y: -50,
                  x: Math.random() * window.innerWidth,
                }}
                transition={{
                  duration: Math.random() * 2 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: 'linear',
                }}
              />
            ))}
          </div>

          {/* Main Content */}
          <div className="relative flex flex-col items-center gap-6">
            {/* Glowing Ring */}
            <motion.div
              className="absolute w-64 h-64 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(251,146,60,0.3) 0%, transparent 70%)',
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Flame Icons Container */}
            <motion.div
              className="relative flex items-center justify-center gap-2"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay: 0.2,
              }}
            >
              {Array.from({ length: level }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0, y: 50, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                    delay: 0.3 + index * 0.15,
                  }}
                  className="relative"
                >
                  {/* Flame Glow */}
                  <motion.div
                    className="absolute inset-0 blur-xl"
                    style={{
                      background: 'radial-gradient(circle, rgba(251,146,60,0.8) 0%, transparent 70%)',
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: index * 0.2,
                    }}
                  />
                  <motion.img
                    src={levelIcon}
                    alt="Flamme"
                    className="w-16 h-16 md:w-20 md:h-20 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(251,146,60,0.8)]"
                    animate={{
                      y: [0, -8, 0],
                      filter: [
                        'drop-shadow(0 0 15px rgba(251,146,60,0.8))',
                        'drop-shadow(0 0 25px rgba(251,146,60,1))',
                        'drop-shadow(0 0 15px rgba(251,146,60,0.8))',
                      ],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: index * 0.2,
                      ease: 'easeInOut',
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Level Text */}
            <motion.div
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <motion.span
                className="text-orange-300 text-lg font-medium tracking-widest uppercase"
                animate={{
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                Nouveau niveau
              </motion.span>
              <motion.h1
                className="text-5xl md:text-6xl font-bold text-white"
                style={{
                  textShadow: '0 0 30px rgba(251,146,60,0.8), 0 0 60px rgba(251,146,60,0.4)',
                }}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 10,
                  delay: 0.7,
                }}
              >
                Niveau {level}
              </motion.h1>
            </motion.div>

            {/* Sparkles */}
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={`sparkle-${i}`}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                }}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: Math.cos((i * Math.PI * 2) / 8) * 120,
                  y: Math.sin((i * Math.PI * 2) / 8) * 120,
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: 0.8 + i * 0.1,
                  repeatDelay: 0.5,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
