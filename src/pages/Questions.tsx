import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuestions } from '@/hooks/useQuestions';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus, Pencil, Check, X, GripVertical, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EventType } from '@/hooks/useGameEvents';

interface Question {
  id: string;
  question: string;
  level: number;
  sort_order: number | null;
  suggestions: string[] | null;
}

interface GameEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  level: number;
  requires_both: boolean;
  is_private: boolean;
  options: string[] | null;
  sort_order: number | null;
}

interface SortableRowProps {
  q: Question;
  index: number;
  editingId: string | null;
  editingText: string;
  setEditingText: (text: string) => void;
  handleEdit: (id: string, text: string) => void;
  handleSaveEdit: (id: string) => void;
  handleCancelEdit: () => void;
  handleDelete: (id: string) => void;
  levelLabels: Record<number, string>;
  isDuplicate: boolean;
}

const SortableRow = ({ 
  q, 
  index, 
  editingId, 
  editingText, 
  setEditingText,
  handleEdit, 
  handleSaveEdit, 
  handleCancelEdit, 
  handleDelete,
  levelLabels,
  isDuplicate
}: SortableRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: q.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-rose-100">
      <td className="p-3 text-rose-500 w-8">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-rose-100 rounded">
          <GripVertical className="w-4 h-4 text-rose-400" />
        </button>
      </td>
      <td className="p-3 text-rose-500 w-12 flex items-center gap-1">
        {isDuplicate && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertCircle className="w-4 h-4 text-amber-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Question en double</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {index + 1}
      </td>
      <td className="p-3 w-32">
        <span className="text-sm">
          {levelLabels[q.level]?.split(' - ')[0] || `Niveau ${q.level}`}
        </span>
      </td>
      <td className="p-3 text-rose-700">
        {editingId === q.id ? (
          <Input
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            className="border-rose-300"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveEdit(q.id);
              if (e.key === 'Escape') handleCancelEdit();
            }}
          />
        ) : (
          q.question
        )}
      </td>
      <td className="p-3 w-24">
        <div className="flex gap-1">
          {editingId === q.id ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSaveEdit(q.id)}
                className="text-green-500 hover:text-green-700 hover:bg-green-100"
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(q.id, q.question)}
                className="text-rose-400 hover:text-rose-600 hover:bg-rose-100"
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(q.id)}
                className="text-rose-400 hover:text-rose-600 hover:bg-rose-100"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

// Event Row Component
interface SortableEventRowProps {
  event: GameEvent;
  index: number;
  editingId: string | null;
  editingData: Partial<GameEvent>;
  setEditingData: (data: Partial<GameEvent>) => void;
  handleEdit: (event: GameEvent) => void;
  handleSaveEdit: (id: string) => void;
  handleCancelEdit: () => void;
  handleDelete: (id: string) => void;
  levelLabels: Record<number, string>;
  typeLabels: Record<string, string>;
}

const SortableEventRow = ({ 
  event, 
  index, 
  editingId, 
  editingData,
  setEditingData,
  handleEdit, 
  handleSaveEdit, 
  handleCancelEdit, 
  handleDelete,
  levelLabels,
  typeLabels
}: SortableEventRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: event.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-rose-100">
      <td className="p-3 text-rose-500 w-8">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-rose-100 rounded">
          <GripVertical className="w-4 h-4 text-rose-400" />
        </button>
      </td>
      <td className="p-3 text-rose-500 w-12">{index + 1}</td>
      <td className="p-3 w-24">
        <span className="text-lg">{typeLabels[event.type]}</span>
      </td>
      <td className="p-3 w-24">
        <span className="text-sm">Niv. {event.level}</span>
      </td>
      <td className="p-3 text-rose-700">
        {editingId === event.id ? (
          <div className="space-y-2">
            <Input
              value={editingData.title || ''}
              onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
              placeholder="Titre"
              className="border-rose-300"
            />
            <Textarea
              value={editingData.description || ''}
              onChange={(e) => setEditingData({ ...editingData, description: e.target.value })}
              placeholder="Description"
              className="border-rose-300 min-h-16"
            />
          </div>
        ) : (
          <div>
            <div className="font-medium">{event.title}</div>
            <div className="text-sm text-muted-foreground truncate max-w-xs">{event.description}</div>
          </div>
        )}
      </td>
      <td className="p-3 w-20 text-center">
        {event.requires_both ? '👥' : '👤'}
      </td>
      <td className="p-3 w-24">
        <div className="flex gap-1">
          {editingId === event.id ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSaveEdit(event.id)}
                className="text-green-500 hover:text-green-700 hover:bg-green-100"
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(event)}
                className="text-rose-400 hover:text-rose-600 hover:bg-rose-100"
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(event.id)}
                className="text-rose-400 hover:text-rose-600 hover:bg-rose-100"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

const Questions = () => {
  const { questions, loading, refetch } = useQuestions();
  const { toast } = useToast();
  const [importText, setImportText] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('1');
  const [isImporting, setIsImporting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // Events state
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventEditingId, setEventEditingId] = useState<string | null>(null);
  const [eventEditingData, setEventEditingData] = useState<Partial<GameEvent>>({});
  const [newEventData, setNewEventData] = useState({
    type: 'message' as EventType,
    title: '',
    description: '',
    level: 1,
    requires_both: true
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch events
  const fetchEvents = async () => {
    setEventsLoading(true);
    const { data, error } = await supabase
      .from('game_events')
      .select('*')
      .order('level', { ascending: true })
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
    } else {
      setEvents((data || []).map(e => ({ ...e, type: e.type as EventType })));
    }
    setEventsLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleImport = async () => {
    if (!importText.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer au moins une question',
        variant: 'destructive'
      });
      return;
    }

    setIsImporting(true);
    const lines = importText.split('\n').filter(line => line.trim());
    
    try {
      const { data: maxData } = await supabase
        .from('questions')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1);
      
      let currentSortOrder = maxData?.[0]?.sort_order || 0;

      const questionsToInsert = lines.map(line => {
        currentSortOrder++;
        return {
          question: line.trim(),
          level: parseInt(selectedLevel),
          suggestions: [],
          sort_order: currentSortOrder
        };
      });

      const { error } = await supabase
        .from('questions')
        .insert(questionsToInsert);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: `${questionsToInsert.length} question(s) importée(s)`,
      });
      
      setImportText('');
      refetch();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await supabase
        .from('game_sessions')
        .update({ current_question_id: null })
        .eq('current_question_id', id);

      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Supprimée',
        description: 'Question supprimée',
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (id: string, currentText: string) => {
    setEditingId(id);
    setEditingText(currentText);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingText.trim()) return;

    try {
      const { error } = await supabase
        .from('questions')
        .update({ question: editingText.trim() })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Modifiée',
        description: 'Question mise à jour',
      });
      
      setEditingId(null);
      setEditingText('');
      refetch();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);
      
      const reorderedQuestions = arrayMove(questions, oldIndex, newIndex);
      
      try {
        const updates = reorderedQuestions.map((q, index) => 
          supabase
            .from('questions')
            .update({ sort_order: index + 1 })
            .eq('id', q.id)
        );
        
        await Promise.all(updates);
        refetch();
        
        toast({
          title: 'Réorganisé',
          description: 'Ordre des questions mis à jour',
        });
      } catch (error: any) {
        toast({
          title: 'Erreur',
          description: error.message,
          variant: 'destructive'
        });
      }
    }
  };

  // Event handlers
  const handleEventDelete = async (id: string) => {
    try {
      await supabase
        .from('game_sessions')
        .update({ current_event_id: null })
        .eq('current_event_id', id);

      const { error } = await supabase
        .from('game_events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Supprimé',
        description: 'Événement supprimé',
      });
      
      fetchEvents();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleEventEdit = (event: GameEvent) => {
    setEventEditingId(event.id);
    setEventEditingData({
      title: event.title,
      description: event.description,
      type: event.type,
      level: event.level,
      requires_both: event.requires_both
    });
  };

  const handleEventCancelEdit = () => {
    setEventEditingId(null);
    setEventEditingData({});
  };

  const handleEventSaveEdit = async (id: string) => {
    if (!eventEditingData.title?.trim() || !eventEditingData.description?.trim()) return;

    try {
      const { error } = await supabase
        .from('game_events')
        .update({
          title: eventEditingData.title.trim(),
          description: eventEditingData.description.trim()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Modifié',
        description: 'Événement mis à jour',
      });
      
      setEventEditingId(null);
      setEventEditingData({});
      fetchEvents();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleEventDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = events.findIndex((e) => e.id === active.id);
      const newIndex = events.findIndex((e) => e.id === over.id);
      
      const reorderedEvents = arrayMove(events, oldIndex, newIndex);
      setEvents(reorderedEvents);
      
      try {
        const updates = reorderedEvents.map((e, index) => 
          supabase
            .from('game_events')
            .update({ sort_order: index + 1 })
            .eq('id', e.id)
        );
        
        await Promise.all(updates);
        
        toast({
          title: 'Réorganisé',
          description: 'Ordre des événements mis à jour',
        });
      } catch (error: any) {
        toast({
          title: 'Erreur',
          description: error.message,
          variant: 'destructive'
        });
      }
    }
  };

  const handleAddEvent = async () => {
    if (!newEventData.title.trim() || !newEventData.description.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir le titre et la description',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data: maxData } = await supabase
        .from('game_events')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1);
      
      const nextSortOrder = (maxData?.[0]?.sort_order || 0) + 1;

      const { error } = await supabase
        .from('game_events')
        .insert({
          type: newEventData.type,
          title: newEventData.title.trim(),
          description: newEventData.description.trim(),
          level: newEventData.level,
          requires_both: newEventData.requires_both,
          sort_order: nextSortOrder
        });

      if (error) throw error;

      toast({
        title: 'Ajouté',
        description: 'Événement créé',
      });
      
      setNewEventData({
        type: 'message',
        title: '',
        description: '',
        level: 1,
        requires_both: true
      });
      fetchEvents();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const levelLabels: Record<number, string> = {
    1: '💕 Niveau 1 - Découverte',
    2: '💖 Niveau 2 - Complicité',
    3: '🔥 Niveau 3 - Intimité',
    4: '💋 Niveau 4 - Passion',
    5: '🌶️ Niveau 5 - Sans limites',
  };

  const typeLabels: Record<string, string> = {
    message: '💌',
    promise: '🤞',
    photo: '📸',
    sync: '🔗',
    game: '🎲',
    confession: '💋'
  };

  const typeOptions: { value: EventType; label: string }[] = [
    { value: 'message', label: '💌 Message' },
    { value: 'promise', label: '🤞 Promesse' },
    { value: 'photo', label: '📸 Photo' },
    { value: 'sync', label: '🔗 Action sync' },
    { value: 'game', label: '🎲 Jeu' },
    { value: 'confession', label: '💋 Confession' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 flex items-center justify-center">
        <div className="text-rose-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 p-4">
      <div className="max-w-5xl mx-auto">
        <Tabs defaultValue="questions" className="space-y-6">
          <TabsList className="bg-white/80 border-rose-200">
            <TabsTrigger value="questions" className="data-[state=active]:bg-rose-500 data-[state=active]:text-white">
              Questions ({questions.length})
            </TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-rose-500 data-[state=active]:text-white">
              Événements ({events.length})
            </TabsTrigger>
          </TabsList>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-6">
            {/* Import Section */}
            <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-xl">
              <CardHeader>
                <CardTitle className="text-rose-800 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Importer des questions
                </CardTitle>
                <CardDescription className="text-rose-600">
                  Une question par ligne
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 items-center">
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger className="w-64 border-rose-300">
                      <SelectValue placeholder="Niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(level => (
                        <SelectItem key={level} value={level.toString()}>
                          {levelLabels[level]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Textarea
                  placeholder="Quelle est ta plus grande peur ?&#10;Quel est ton rêve le plus fou ?&#10;Si tu pouvais vivre n'importe où..."
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="min-h-32 border-rose-300 focus:border-rose-400"
                />
                
                <Button 
                  onClick={handleImport} 
                  disabled={isImporting}
                  className="bg-rose-500 hover:bg-rose-600"
                >
                  {isImporting ? 'Import en cours...' : 'Importer'}
                </Button>
              </CardContent>
            </Card>

            {/* Questions List */}
            <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-xl">
              <CardHeader>
                <CardTitle className="text-rose-800">
                  Questions ({questions.length})
                </CardTitle>
                <CardDescription className="text-rose-600">
                  Glissez-déposez pour réorganiser
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-rose-200">
                        <th className="p-3 text-left text-rose-600 font-medium w-8"></th>
                        <th className="p-3 text-left text-rose-600 font-medium w-12">#</th>
                        <th className="p-3 text-left text-rose-600 font-medium w-32">Niveau</th>
                        <th className="p-3 text-left text-rose-600 font-medium">Question</th>
                        <th className="p-3 text-left text-rose-600 font-medium w-24"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <SortableContext
                        items={questions.map(q => q.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {questions.map((q, index) => {
                          const normalizedText = q.question.trim().toLowerCase();
                          const isDuplicate = questions.some(
                            (other) => other.id !== q.id && other.question.trim().toLowerCase() === normalizedText
                          );
                          return (
                            <SortableRow
                              key={q.id}
                              q={q}
                              index={index}
                              editingId={editingId}
                              editingText={editingText}
                              setEditingText={setEditingText}
                              handleEdit={handleEdit}
                              handleSaveEdit={handleSaveEdit}
                              handleCancelEdit={handleCancelEdit}
                              handleDelete={handleDelete}
                              levelLabels={levelLabels}
                              isDuplicate={isDuplicate}
                            />
                          );
                        })}
                      </SortableContext>
                      {questions.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center text-rose-400 py-8">
                            Aucune question. Importez-en ci-dessus.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </DndContext>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            {/* Add Event Section */}
            <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-xl">
              <CardHeader>
                <CardTitle className="text-rose-800 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Ajouter un événement
                </CardTitle>
                <CardDescription className="text-rose-600">
                  Créez des défis, promesses, jeux et confessions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select 
                    value={newEventData.type} 
                    onValueChange={(v) => setNewEventData({ ...newEventData, type: v as EventType })}
                  >
                    <SelectTrigger className="border-rose-300">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select 
                    value={newEventData.level.toString()} 
                    onValueChange={(v) => setNewEventData({ ...newEventData, level: parseInt(v) })}
                  >
                    <SelectTrigger className="border-rose-300">
                      <SelectValue placeholder="Niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(level => (
                        <SelectItem key={level} value={level.toString()}>
                          {levelLabels[level]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select 
                    value={newEventData.requires_both ? 'true' : 'false'} 
                    onValueChange={(v) => setNewEventData({ ...newEventData, requires_both: v === 'true' })}
                  >
                    <SelectTrigger className="border-rose-300">
                      <SelectValue placeholder="Participants" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">👥 Les deux joueurs</SelectItem>
                      <SelectItem value="false">👤 Un seul joueur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Input
                  placeholder="Titre de l'événement"
                  value={newEventData.title}
                  onChange={(e) => setNewEventData({ ...newEventData, title: e.target.value })}
                  className="border-rose-300"
                />
                
                <Textarea
                  placeholder="Description / Instructions..."
                  value={newEventData.description}
                  onChange={(e) => setNewEventData({ ...newEventData, description: e.target.value })}
                  className="min-h-24 border-rose-300 focus:border-rose-400"
                />
                
                <Button 
                  onClick={handleAddEvent}
                  className="bg-rose-500 hover:bg-rose-600"
                >
                  Ajouter l'événement
                </Button>
              </CardContent>
            </Card>

            {/* Events List */}
            <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-xl">
              <CardHeader>
                <CardTitle className="text-rose-800">
                  Événements ({events.length})
                </CardTitle>
                <CardDescription className="text-rose-600">
                  Glissez-déposez pour réorganiser • 👥 = les deux joueurs • 👤 = un seul
                </CardDescription>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="text-center text-rose-400 py-8">Chargement...</div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleEventDragEnd}
                  >
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-rose-200">
                          <th className="p-3 text-left text-rose-600 font-medium w-8"></th>
                          <th className="p-3 text-left text-rose-600 font-medium w-12">#</th>
                          <th className="p-3 text-left text-rose-600 font-medium w-24">Type</th>
                          <th className="p-3 text-left text-rose-600 font-medium w-24">Niveau</th>
                          <th className="p-3 text-left text-rose-600 font-medium">Titre / Description</th>
                          <th className="p-3 text-center text-rose-600 font-medium w-20">Sync</th>
                          <th className="p-3 text-left text-rose-600 font-medium w-24"></th>
                        </tr>
                      </thead>
                      <tbody>
                        <SortableContext
                          items={events.map(e => e.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {events.map((event, index) => (
                            <SortableEventRow
                              key={event.id}
                              event={event}
                              index={index}
                              editingId={eventEditingId}
                              editingData={eventEditingData}
                              setEditingData={setEventEditingData}
                              handleEdit={handleEventEdit}
                              handleSaveEdit={handleEventSaveEdit}
                              handleCancelEdit={handleEventCancelEdit}
                              handleDelete={handleEventDelete}
                              levelLabels={levelLabels}
                              typeLabels={typeLabels}
                            />
                          ))}
                        </SortableContext>
                        {events.length === 0 && (
                          <tr>
                            <td colSpan={7} className="text-center text-rose-400 py-8">
                              Aucun événement. Ajoutez-en ci-dessus.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </DndContext>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Questions;
