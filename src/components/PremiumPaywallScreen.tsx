import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Heart, Check, Shield, Sparkles } from "lucide-react";
import { getPremiumPrice } from "@/lib/premiumUtils";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

interface PremiumPaywallScreenProps {
  playerName: string;
  partnerName: string;
  answeredQuestionsCount: number;
  remainingQuestionsCount: number;
  currentRoomId: string;
  onPaymentSuccess: () => void;
  onDismiss?: () => void;
}

const benefits = [
  "+100 nouvelles questions",
  "Intensités 3, 4 et 5 débloquées",
  "Nouvelles cartes actions spéciales",
  "Accès illimité à l'historique complet",
];

// Floating heart animation component
const FloatingHeart = ({ delay, x, size }: { delay: number; x: string; size: number }) => (
  <motion.div
    className="absolute pointer-events-none select-none"
    style={{ left: x, bottom: "-10%" }}
    initial={{ y: 0, opacity: 0 }}
    animate={{
      y: [0, -600],
      opacity: [0, 0.6, 0.6, 0],
    }}
    transition={{
      duration: 6 + delay,
      repeat: Infinity,
      delay: delay,
      ease: "easeOut",
    }}
  >
    <span style={{ fontSize: size }}>💕</span>
  </motion.div>
);

export const PremiumPaywallScreen = ({
  playerName,
  partnerName,
  answeredQuestionsCount,
  remainingQuestionsCount,
  currentRoomId,
  onPaymentSuccess,
  onDismiss,
}: PremiumPaywallScreenProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { roomId: currentRoomId, playerName },
      });
      if (error || !data?.url) {
        throw new Error(error?.message || "Impossible de créer la session de paiement");
      }
      window.location.href = data.url;
    } catch (err: any) {
      toast.error("Erreur lors du paiement : " + err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 flex flex-col items-center justify-start md:justify-center p-4 pt-36 md:pt-4 relative overflow-hidden">
      {/* Floating hearts background */}
      <FloatingHeart delay={0} x="10%" size={16} />
      <FloatingHeart delay={1.5} x="25%" size={12} />
      <FloatingHeart delay={3} x="50%" size={20} />
      <FloatingHeart delay={0.8} x="70%" size={14} />
      <FloatingHeart delay={2.2} x="85%" size={10} />
      <FloatingHeart delay={4} x="40%" size={18} />

      {/* Main card */}
      <motion.div
        className="w-full max-w-md z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card className="shadow-2xl bg-white/90 backdrop-blur-sm border-rose-200 overflow-hidden">
          {/* Top gradient stripe */}
          <div className="h-2 bg-gradient-to-r from-rose-400 via-pink-500 to-rose-400" />

          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* HEADER */}
            <div className="text-center space-y-2">
              {/* Logo on mobile, emoji on desktop */}
              <motion.div
                className="mb-3 flex justify-center"
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 1.2, delay: 0.6, ease: "easeInOut" }}
              >
                <img src={logo} alt="Logo" className="h-16 w-auto md:hidden" />
                <span className="hidden md:block text-4xl">🔓</span>
              </motion.div>
              <h1 className="text-2xl font-bold text-rose-800 leading-tight">Continuez votre aventure à deux</h1>
              <p className="text-rose-500 text-sm font-medium">Ne vous arrêtez pas maintenant, {playerName} !</p>
            </div>

            {/* SOCIAL PROOF */}
            <motion.div
              className="flex justify-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <div className="bg-gradient-to-r from-rose-100 to-pink-100 border border-rose-200 rounded-full px-5 py-2.5 flex items-center gap-2 shadow-sm">
                <Sparkles className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="text-rose-700 text-sm font-semibold">
                  Vous avez déjà partagé{" "}
                  <span className="font-black text-rose-600">{answeredQuestionsCount} questions</span> ensemble, vous ne
                  voulez pas en savoir plus?
                </span>
              </div>
            </motion.div>

            {/* BENEFITS */}
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.08 }}
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-rose-800 text-sm font-medium">{benefit}</span>
                </motion.div>
              ))}
            </div>

            {/* PRICE ANCHOR */}
            <motion.div
              className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 rounded-2xl p-5 text-center space-y-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <p className="text-rose-500 text-sm font-medium">Pimentez la suite du jeu pour le prix d'un café</p>
              <div className="flex items-baseline justify-center gap-3">
                <span className="text-4xl font-black text-rose-700">{getPremiumPrice()}</span>
                <span className="line-through text-muted-foreground text-sm">6,99€</span>
              </div>
              <p className="text-rose-400 text-xs">Promotion active pour les 50 prochaines rooms seulement.</p>
            </motion.div>

            {/* CTA BUTTON */}
            <motion.button
              className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-4 px-8 rounded-xl text-lg font-bold shadow-lg shadow-rose-300/50 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed transition-shadow"
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onClick={handlePayment}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Traitement en cours...</span>
                </>
              ) : (
                <>
                  <motion.div
                    key={isHovering ? "heart" : "lock"}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.15 }}
                  >
                    {isHovering ? <Heart className="w-5 h-5" fill="white" /> : <Lock className="w-5 h-5" />}
                  </motion.div>
                  <span>Continuer le jeu</span>
                </>
              )}
            </motion.button>

            {/* REASSURANCE */}
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Shield className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-medium">Paiement 100% sécurisé via Stripe</span>
              </div>
            </div>

            {/* DISMISS */}
            {onDismiss && (
              <div className="text-center pt-1">
                <button
                  onClick={onDismiss}
                  className="text-xs text-muted-foreground hover:text-rose-400 transition-colors underline-offset-2 hover:underline"
                  disabled={isLoading}
                >
                  Peut-être plus tard
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
