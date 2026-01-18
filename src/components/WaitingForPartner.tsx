import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { CardBottomActions } from './CardBottomActions';

interface WaitingForPartnerProps {
  partnerName: string;
  onShowHistory: () => void;
  onLogout: () => void;
}

export const WaitingForPartner = ({ partnerName, onShowHistory, onLogout }: WaitingForPartnerProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-rose-200 shadow-xl">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-xl font-serif text-rose-800">
            {partnerName} répond...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="py-8">
            <div className="relative mx-auto w-32 h-32">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full animate-pulse" />
              <div className="absolute inset-4 bg-gradient-to-br from-rose-300 to-pink-300 rounded-full animate-pulse delay-100" />
              <div className="absolute inset-8 bg-gradient-to-br from-rose-400 to-pink-400 rounded-full animate-pulse delay-200" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-rose-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm italic">En attente de sa réponse...</span>
          </div>
          
          <p className="text-xs text-rose-400">
            Rafraîchissement automatique toutes les 5 secondes
          </p>

          <CardBottomActions onShowHistory={onShowHistory} onLogout={onLogout} />
        </CardContent>
      </Card>
    </div>
  );
};
