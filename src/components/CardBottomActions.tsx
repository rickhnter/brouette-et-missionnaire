import { Button } from '@/components/ui/button';
import { History, LogOut } from 'lucide-react';

interface CardBottomActionsProps {
  onShowHistory: () => void;
  onLogout: () => void;
}

export const CardBottomActions = ({ onShowHistory, onLogout }: CardBottomActionsProps) => {
  return (
    <div className="flex md:hidden justify-center gap-3 mt-4 pt-4 border-t border-rose-100">
      <Button
        variant="outline"
        size="sm"
        className="border-rose-300 text-rose-700 hover:bg-rose-50"
        onClick={onShowHistory}
      >
        <History className="w-4 h-4 mr-2" />
        Historique
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="border-rose-300 text-rose-700 hover:bg-rose-50"
        onClick={onLogout}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Déconnexion
      </Button>
    </div>
  );
};
