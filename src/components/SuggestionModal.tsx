import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Lightbulb } from 'lucide-react';

interface SuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: number;
}

const EVENT_TYPES = [
  { value: 'message', label: '💌 Message' },
  { value: 'promise', label: '🤞 Promesse' },
  { value: 'photo', label: '📸 Photo' },
  { value: 'sync', label: '🔗 Action synchronisée' },
  { value: 'game', label: '🎲 Mini-jeu' },
  { value: 'confession', label: '💋 Confession' },
];

export const SuggestionModal = ({ isOpen, onClose, currentLevel }: SuggestionModalProps) => {
  const [type, setType] = useState<'question' | 'event'>('question');
  const [selectedLevel, setSelectedLevel] = useState<number>(Math.max(currentLevel, 1));
  const [content, setContent] = useState('');
  const [eventType, setEventType] = useState('message');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Écris ton idée !');
      return;
    }

    setIsSubmitting(true);

    try {
      if (type === 'question') {
        const { error } = await supabase.from('questions').insert({
          question: content.trim(),
          level: selectedLevel,
          suggestions: [],
          sort_order: 9999
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('game_events').insert({
          type: eventType,
          title: 'Suggestion',
          description: content.trim(),
          level: selectedLevel,
          requires_both: eventType === 'sync',
          is_private: false,
          sort_order: 9999
        });
        if (error) throw error;
      }

      toast.success('Merci pour ta suggestion ! 💕');
      setContent('');
      setType('question');
      setSelectedLevel(Math.max(currentLevel, 1));
      onClose();
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const levels = [1, 2, 3, 4, 5];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white/95 backdrop-blur-sm border-rose-200 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif text-rose-800 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Proposer une idée
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Type selection */}
          <div className="space-y-2">
            <Label className="text-rose-700">Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={type === 'question' ? 'default' : 'outline'}
                className={type === 'question' 
                  ? 'flex-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white' 
                  : 'flex-1 border-rose-300 text-rose-700 hover:bg-rose-50'}
                onClick={() => setType('question')}
              >
                Question
              </Button>
              <Button
                type="button"
                variant={type === 'event' ? 'default' : 'outline'}
                className={type === 'event' 
                  ? 'flex-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white' 
                  : 'flex-1 border-rose-300 text-rose-700 hover:bg-rose-50'}
                onClick={() => setType('event')}
              >
                Action
              </Button>
            </div>
          </div>

          {/* Level selection */}
          <div className="space-y-2">
            <Label className="text-rose-700">Niveau</Label>
            <div className="flex gap-2">
              {levels.map((level) => (
                <Button
                  key={level}
                  type="button"
                  variant={selectedLevel === level ? 'default' : 'outline'}
                  size="icon"
                  disabled={level < currentLevel}
                  className={
                    selectedLevel === level
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white'
                      : level < currentLevel
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                        : 'border-rose-300 text-rose-700 hover:bg-rose-50'
                  }
                  onClick={() => setSelectedLevel(level)}
                >
                  {level}
                </Button>
              ))}
            </div>
            {currentLevel > 1 && (
              <p className="text-xs text-rose-400">
                Les niveaux déjà passés ne sont plus disponibles
              </p>
            )}
          </div>

          {/* Event type (only for events) */}
          {type === 'event' && (
            <div className="space-y-2">
              <Label className="text-rose-700">Type d'action</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger className="border-rose-200 focus:ring-rose-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-rose-200">
                  {EVENT_TYPES.map((et) => (
                    <SelectItem key={et.value} value={et.value}>
                      {et.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Content */}
          <div className="space-y-2">
            <Label className="text-rose-700">
              {type === 'question' ? 'Ta question' : 'Description de l\'action'}
            </Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={type === 'question' 
                ? 'Écris ta question ici...' 
                : 'Décris l\'action à faire...'}
              className="min-h-[100px] border-rose-200 focus:border-rose-400 focus:ring-rose-400"
            />
          </div>

          {/* Submit button */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !content.trim()}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Envoi...
              </>
            ) : (
              'Envoyer ma suggestion'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
