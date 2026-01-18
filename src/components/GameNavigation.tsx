import { Button } from '@/components/ui/button';
import { History, LogOut } from 'lucide-react';
import logo from '@/assets/logo.png';

interface GameNavigationProps {
  onShowHistory: () => void;
  onLogout: () => void;
  playerName: string;
}

export const GameNavigation = ({ onShowHistory, onLogout, playerName }: GameNavigationProps) => {
  return (
    <div className="fixed top-4 left-0 right-0 flex justify-center md:justify-between md:left-4 md:right-4 z-50 px-4">
      <img src={logo} alt="Logo" className="h-28 md:h-32 w-auto" />
      <div className="hidden md:flex items-center gap-2">
        <span className="text-sm text-rose-600 mr-2">
          {playerName}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="bg-white/80 backdrop-blur-sm border-rose-300 text-rose-700 hover:bg-rose-50"
          onClick={onShowHistory}
        >
          <History className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="bg-white/80 backdrop-blur-sm border-rose-300 text-rose-700 hover:bg-rose-50"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
