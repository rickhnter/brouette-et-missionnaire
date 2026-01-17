import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuestions } from '@/hooks/useQuestions';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus } from 'lucide-react';

const Questions = () => {
  const { questions, loading, refetch } = useQuestions();
  const { toast } = useToast();
  const [importText, setImportText] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('1');
  const [isImporting, setIsImporting] = useState(false);

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
      // Récupérer le sort_order max actuel
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

  const levelLabels: Record<number, string> = {
    1: '💕 Niveau 1 - Découverte',
    2: '💖 Niveau 2 - Complicité',
    3: '🔥 Niveau 3 - Intimité',
    4: '💋 Niveau 4 - Passion',
    5: '🌶️ Niveau 5 - Sans limites',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 flex items-center justify-center">
        <div className="text-rose-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
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
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead className="w-32">Niveau</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((q, index) => (
                  <TableRow key={q.id}>
                    <TableCell className="text-rose-500">{index + 1}</TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {levelLabels[q.level]?.split(' - ')[0] || `Niveau ${q.level}`}
                      </span>
                    </TableCell>
                    <TableCell className="text-rose-700">{q.question}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(q.id)}
                        className="text-rose-400 hover:text-rose-600 hover:bg-rose-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {questions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-rose-400 py-8">
                      Aucune question. Importez-en ci-dessus.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Questions;
