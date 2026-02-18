import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import logo from '@/assets/logo.png';
import iconFlamme from '@/assets/icon-flamme.svg';
import iconMessage from '@/assets/icon-message.svg';
import iconPhoto from '@/assets/icon-photo.svg';
import iconSync from '@/assets/icon-sync.svg';
import iconConfession from '@/assets/icon-confession.svg';
import iconGame from '@/assets/icon-game.svg';
import iconMagicpen from '@/assets/icon-magicpen.svg';

interface TutorialScreenProps {
  playerName: string;
  partnerName: string;
  roomCode?: string;
  onComplete: () => void;
}

const TOTAL_SLIDES = 5;

// Floating hearts background
const FloatingHearts = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 12 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute text-2xl"
        initial={{ 
          x: Math.random() * 100 + '%', 
          y: '110%', 
          opacity: 0 
        }}
        animate={{ 
          y: '-10%', 
          opacity: [0, 0.7, 0],
          rotate: [0, Math.random() > 0.5 ? 15 : -15, 0]
        }}
        transition={{ 
          duration: 4 + Math.random() * 3, 
          repeat: Infinity, 
          delay: Math.random() * 5,
          ease: 'easeOut'
        }}
      >
        💕
      </motion.div>
    ))}
  </div>
);

// Slide 1: Bienvenue
const WelcomeSlide: React.FC<{ playerName: string; partnerName: string; roomCode?: string }> = ({ playerName, partnerName, roomCode }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    if (!roomCode) return;
    await navigator.clipboard.writeText(roomCode);
    setCopied(true);
    toast({ title: 'Code copié !', description: 'Partage ce code à ton partenaire 💕' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!roomCode) return;
    const shareData = {
      title: 'Brouette & Missionnaire',
      text: `Rejoins-moi pour jouer ! Code: ${roomCode}`,
      url: `${window.location.origin}/?code=${roomCode}`
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        toast({ title: 'Lien copié !', description: 'Partage ce lien à ton partenaire 💕' });
      }
    } catch (_) { /* user cancelled */ }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 relative">
      <FloatingHearts />
      <motion.img
        src={logo}
        alt="Logo"
        className="w-28 h-28 rounded-2xl shadow-lg"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
      />
      <motion.h1
        className="text-2xl font-bold text-rose-700 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        Bienvenue dans la partie !
      </motion.h1>
      <div className="flex items-center gap-4">
        <motion.span
          className="text-xl font-semibold text-rose-600 bg-white/60 px-4 py-2 rounded-full"
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.7, type: 'spring' }}
        >
          {playerName}
        </motion.span>
        <motion.span
          className="text-2xl"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.3, 1] }}
          transition={{ delay: 1 }}
        >
          💗
        </motion.span>
        <motion.span
          className="text-xl font-semibold text-rose-600 bg-white/60 px-4 py-2 rounded-full"
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.7, type: 'spring' }}
        >
          {partnerName}
        </motion.span>
      </div>

      {/* Room code for creator waiting alone */}
      {roomCode && (
        <motion.div
          className="bg-white/70 backdrop-blur rounded-2xl p-4 w-full max-w-xs shadow-md space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <p className="text-sm text-rose-600 text-center font-medium">
            📲 Partage ce code à ton partenaire
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="bg-white border-2 border-rose-300 rounded-xl px-5 py-2">
              <span className="text-2xl font-mono font-bold text-rose-700 tracking-widest">
                {roomCode}
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl border-2 border-rose-300 text-rose-600 bg-white hover:bg-rose-50 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold py-2.5 rounded-xl text-sm"
          >
            <Share2 className="w-4 h-4" />
            Partager le code
          </button>
        </motion.div>
      )}
    </div>
  );
};

// Slide 2: Les questions
const QuestionsSlide = () => (
  <div className="flex flex-col items-center justify-center h-full gap-6 px-4">
    <motion.div
      className="text-4xl"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', delay: 0.2 }}
    >
      🤔
    </motion.div>
    <motion.h2
      className="text-xl font-bold text-rose-700 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      Comment ça marche ?
    </motion.h2>
    <div className="flex flex-col gap-3 w-full max-w-xs">
      <motion.div
        className="bg-white/70 backdrop-blur rounded-xl p-4 shadow text-center"
        initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <p className="text-rose-600 font-medium text-sm">📝 Vous répondez chacun de votre côté...</p>
      </motion.div>
      <motion.div
        className="bg-white/70 backdrop-blur rounded-xl p-4 shadow text-center"
        initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <p className="text-rose-600 font-medium text-sm">👀 ...puis vous découvrez la réponse de l'autre !</p>
      </motion.div>
      <motion.div
        className="bg-white/70 backdrop-blur rounded-xl p-4 shadow text-center"
        initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <p className="text-rose-600 font-medium text-sm">💬 Surprises et fous rires garantis !</p>
      </motion.div>
    </div>
  </div>
);

// Slide 3: Les niveaux
const levels = [
  { label: 'Découverte', color: 'from-pink-300 to-pink-400' },
  { label: 'Complicité', color: 'from-pink-400 to-rose-500' },
  { label: 'Intimité', color: 'from-rose-500 to-red-500' },
  { label: 'Passion', color: 'from-red-500 to-red-600' },
  { label: 'Sans limites', color: 'from-red-600 to-red-700' },
];

const LevelsSlide = () => (
  <div className="flex flex-col items-center justify-center h-full gap-5 px-4">
    <motion.h2
      className="text-xl font-bold text-rose-700 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      5 niveaux d'intensité 🔥
    </motion.h2>
    <div className="flex flex-col gap-2.5 w-full max-w-xs">
      {levels.map((level, i) => (
        <motion.div
          key={level.label}
          className={`flex items-center gap-3 bg-gradient-to-r ${level.color} text-white rounded-full px-4 py-2.5 shadow-md`}
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 + i * 0.2, type: 'spring', stiffness: 150 }}
        >
          <img src={iconFlamme} alt="" className="w-6 h-6" />
          <span className="font-semibold text-sm">{level.label}</span>
        </motion.div>
      ))}
    </div>
    <motion.p
      className="text-rose-500 text-xs text-center mt-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
    >
      Les questions deviennent de plus en plus intenses !
    </motion.p>
  </div>
);

// Slide 4: Les événements
const eventTypes = [
  { icon: iconMessage, label: 'Message', color: 'bg-pink-500' },
  { icon: iconMagicpen, label: 'Promesse', color: 'bg-violet-500' },
  { icon: iconPhoto, label: 'Photo', color: 'bg-cyan-500' },
  { icon: iconSync, label: 'Action sync', color: 'bg-blue-500' },
  { icon: iconGame, label: 'Mini-jeu', color: 'bg-orange-500' },
  { icon: iconConfession, label: 'Confession', color: 'bg-red-500' },
];

const EventsSlide = () => (
  <div className="flex flex-col items-center justify-center h-full gap-5 px-4">
    <motion.h2
      className="text-xl font-bold text-rose-700 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      Des surprises entre les questions ! ✨
    </motion.h2>
    <div className="grid grid-cols-3 gap-3 max-w-xs">
      {eventTypes.map((event, i) => (
        <motion.div
          key={event.label}
          className="flex flex-col items-center gap-1.5"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 + i * 0.15, type: 'spring', stiffness: 200 }}
        >
          <motion.div
            className={`${event.color} p-3 rounded-2xl shadow-lg`}
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ delay: 1 + i * 0.2, duration: 0.6, repeat: 1 }}
          >
            <img src={event.icon} alt="" className="w-7 h-7 brightness-0 invert" />
          </motion.div>
          <span className="text-xs font-medium text-rose-600">{event.label}</span>
        </motion.div>
      ))}
    </div>
    <motion.p
      className="text-rose-500 text-xs text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
    >
      6 types d'événements pour pimenter le jeu !
    </motion.p>
  </div>
);

// Slide 5: C'est parti
const StartSlide: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const [countdown, setCountdown] = useState(3);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 700);
      return () => clearTimeout(t);
    } else {
      setShowButton(true);
    }
  }, [countdown]);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 relative">
      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: ['#f43f5e', '#ec4899', '#f97316', '#a855f7', '#06b6d4'][i % 5],
              left: `${Math.random() * 100}%`,
            }}
            initial={{ y: -20, opacity: 0 }}
            animate={{ 
              y: '100vh', 
              opacity: [0, 1, 1, 0],
              x: (Math.random() - 0.5) * 100,
              rotate: Math.random() * 720
            }}
            transition={{ 
              duration: 2 + Math.random() * 2, 
              delay: 2 + Math.random() * 1, 
              repeat: Infinity,
              repeatDelay: Math.random() * 2
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {countdown > 0 ? (
          <motion.span
            key={countdown}
            className="text-7xl font-black text-rose-500"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.3, 1], opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {countdown}
          </motion.span>
        ) : (
          <motion.div
            key="ready"
            className="flex flex-col items-center gap-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <span className="text-4xl">🎉</span>
            <h2 className="text-2xl font-bold text-rose-700">C'est parti !</h2>
          </motion.div>
        )}
      </AnimatePresence>

      {showButton && (
        <motion.button
          onClick={onStart}
          className="bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold px-8 py-4 rounded-full text-lg shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            boxShadow: [
              '0 0 0 0 rgba(244, 63, 94, 0.4)',
              '0 0 0 15px rgba(244, 63, 94, 0)',
              '0 0 0 0 rgba(244, 63, 94, 0.4)',
            ]
          }}
          transition={{ 
            opacity: { delay: 0.3 },
            y: { delay: 0.3 },
            boxShadow: { duration: 2, repeat: Infinity }
          }}
          whileTap={{ scale: 0.95 }}
        >
          Commencer 🚀
        </motion.button>
      )}
    </div>
  );
};

// Dot indicators
const Dots: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <div className="flex gap-2 justify-center">
    {Array.from({ length: total }).map((_, i) => (
      <motion.div
        key={i}
        className={`rounded-full ${i === current ? 'bg-rose-500 w-6 h-2.5' : 'bg-rose-300 w-2.5 h-2.5'}`}
        layout
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      />
    ))}
  </div>
);

// Main component
export const TutorialScreen: React.FC<TutorialScreenProps> = ({ playerName, partnerName, roomCode, onComplete }) => {
  const [slide, setSlide] = useState(0);
  const [[direction, slideKey], setSlideData] = useState<[number, number]>([0, 0]);

  const goNext = useCallback(() => {
    if (slide < TOTAL_SLIDES - 1) {
      const next = slide + 1;
      setSlideData([1, next]);
      setSlide(next);
    }
  }, [slide]);

  const goPrev = useCallback(() => {
    if (slide > 0) {
      const prev = slide - 1;
      setSlideData([-1, prev]);
      setSlide(prev);
    }
  }, [slide]);

  const handleDragEnd = useCallback((_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    const swipe = info.offset.x;
    const velocity = info.velocity.x;
    if (swipe < -50 || velocity < -300) goNext();
    else if (swipe > 50 || velocity > 300) goPrev();
  }, [goNext, goPrev]);

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  const slides = [
    <WelcomeSlide playerName={playerName} partnerName={partnerName} roomCode={roomCode} />,
    <QuestionsSlide />,
    <LevelsSlide />,
    <EventsSlide />,
    <StartSlide onStart={onComplete} />,
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 flex flex-col relative overflow-hidden">
      {/* Skip button */}
      {slide < TOTAL_SLIDES - 1 && (
        <motion.button
          onClick={onComplete}
          className="absolute top-4 right-4 z-50 text-rose-400 text-sm font-medium px-3 py-1.5 rounded-full bg-white/50 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Passer ›
        </motion.button>
      )}

      {/* Slide content */}
      <div className="flex-1 relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={slideKey}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 250, damping: 25 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 flex items-center justify-center p-6"
          >
            {slides[slide]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      <div className="pb-8 pt-4 flex flex-col items-center gap-4 z-10">
        <Dots current={slide} total={TOTAL_SLIDES} />
        {slide < TOTAL_SLIDES - 1 && (
          <motion.button
            onClick={goNext}
            className="bg-white/70 backdrop-blur text-rose-600 font-semibold px-6 py-2.5 rounded-full shadow"
            whileTap={{ scale: 0.95 }}
          >
            Suivant →
          </motion.button>
        )}
      </div>
    </div>
  );
};
