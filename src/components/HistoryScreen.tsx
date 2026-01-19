import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Filter, X } from 'lucide-react';
import { useHistory } from '@/hooks/useHistory';
import { levelIcon, eventIcons, EventType } from '@/components/events/eventIcons';

interface HistoryScreenProps {
  sessionId: string;
  onBack: () => void;
}

const eventTypeLabels: Record<string, string> = {
  question: 'Questions',
  message: 'Messages',
  promise: 'Promesses',
  photo: 'Photos',
  sync: 'Sync',
  game: 'Jeux',
  confession: 'Confessions',
};

export const HistoryScreen = ({ sessionId, onBack }: HistoryScreenProps) => {
  const { history, loading } = useHistory(sessionId);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedLevels, setSelectedLevels] = useState<number[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // Get unique levels and types from history
  const availableLevels = useMemo(() => {
    const levels = new Set(history.map(e => e.level));
    return Array.from(levels).sort((a, b) => a - b);
  }, [history]);

  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    history.forEach(e => {
      if (e.type === 'question') {
        types.add('question');
      } else if (e.eventType) {
        types.add(e.eventType);
      }
    });
    return Array.from(types);
  }, [history]);

  // Filter history
  const filteredHistory = useMemo(() => {
    return history.filter(entry => {
      const levelMatch = selectedLevels.length === 0 || selectedLevels.includes(entry.level);
      const typeMatch = selectedTypes.length === 0 || 
        (entry.type === 'question' && selectedTypes.includes('question')) ||
        (entry.type === 'event' && entry.eventType && selectedTypes.includes(entry.eventType));
      return levelMatch && typeMatch;
    });
  }, [history, selectedLevels, selectedTypes]);

  const toggleLevel = (level: number) => {
    setSelectedLevels(prev => 
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSelectedLevels([]);
    setSelectedTypes([]);
  };

  const hasActiveFilters = selectedLevels.length > 0 || selectedTypes.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 p-4">
      <div className="max-w-2xl mx-auto space-y-6 pt-16">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-rose-700 hover:bg-rose-100"
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-serif text-rose-800">Historique</h1>
        </div>

        {loading ? (
          <div className="text-center py-12 text-rose-600">
            Chargement de l'historique...
          </div>
        ) : history.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-rose-200">
            <CardContent className="py-12 text-center text-rose-600">
              Aucune réponse pour le moment.
              <br />
              <span className="text-sm">Commencez à jouer pour voir l'historique ici !</span>
            </CardContent>
          </Card>
        ) : (
          <>
            {filteredHistory.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm border-rose-200">
                <CardContent className="py-12 text-center text-rose-600">
                  Aucun résultat avec ces filtres.
                </CardContent>
              </Card>
            ) : (
              filteredHistory.map((entry) => (
                <Card key={entry.id} className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-lg">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: entry.level }).map((_, i) => (
                          <img key={i} src={levelIcon} alt="" className="w-6 h-6 object-contain" />
                        ))}
                      </div>
                      {entry.type === 'event' && entry.eventType && (
                        <img 
                          src={eventIcons[entry.eventType as EventType]?.icon} 
                          alt="" 
                          className="w-7 h-7 object-contain" 
                        />
                      )}
                    </div>
                    <CardTitle className="text-lg font-serif text-rose-800">
                      {entry.type === 'event' ? entry.eventTitle : entry.content}
                    </CardTitle>
                    {entry.type === 'event' && (
                      <p className="text-sm text-muted-foreground mt-1">{entry.content}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className={`grid grid-cols-1 ${entry.player1_answer && entry.player2_answer ? 'md:grid-cols-2' : ''} gap-3`}>
                      {entry.player1_answer && (
                        <div className="p-3 bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg border border-rose-100">
                          <p className="text-xs font-medium text-rose-500 mb-1">{entry.player1_name}</p>
                          <p className="text-rose-800">{entry.player1_answer}</p>
                        </div>
                      )}
                      {entry.player2_answer && (
                        <div className="p-3 bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg border border-pink-100">
                          <p className="text-xs font-medium text-pink-500 mb-1">{entry.player2_name}</p>
                          <p className="text-pink-800">{entry.player2_answer}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </>
        )}
      </div>

      {/* Floating Filter Button */}
      {!loading && history.length > 0 && (
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all z-50 ${
            hasActiveFilters 
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white' 
              : 'bg-white/90 backdrop-blur-sm text-rose-600 border border-rose-200'
          }`}
        >
          <Filter className="w-5 h-5" />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-xs rounded-full flex items-center justify-center">
              {selectedLevels.length + selectedTypes.length}
            </span>
          )}
        </button>
      )}

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setIsFilterOpen(false)}>
          <div 
            className="fixed bottom-24 right-6 w-72 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-rose-200 p-4 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-rose-800">Filtres</h3>
              {hasActiveFilters && (
                <button 
                  onClick={clearFilters}
                  className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Effacer
                </button>
              )}
            </div>

            {/* Levels */}
            {availableLevels.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2">Niveau</p>
                <div className="flex flex-wrap gap-2">
                  {availableLevels.map(level => (
                    <button
                      key={level}
                      onClick={() => toggleLevel(level)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all ${
                        selectedLevels.includes(level)
                          ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      <img src={levelIcon} alt="" className="w-4 h-4 object-contain" />
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Types */}
            {availableTypes.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Type</p>
                <div className="flex flex-wrap gap-2">
                  {availableTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => toggleType(type)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                        selectedTypes.includes(type)
                          ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      {type !== 'question' && eventIcons[type as EventType] && (
                        <img src={eventIcons[type as EventType].icon} alt="" className="w-4 h-4 object-contain" />
                      )}
                      {eventTypeLabels[type] || type}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
