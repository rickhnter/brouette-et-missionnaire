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
    <div className="fixed top-4 left-4 right-4 flex items-center justify-between z-50">
      <img src={logo} alt="Logo" className="h-10 w-auto" />
      <div className="flex items-center gap-2">
        <span className="text-sm text-rose-600 mr-2 hidden sm:inline">
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
