import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

interface CategorySelectionProps {
  categories: { name: string; icon: string }[];
  onSelectCategory: (category: string) => void;
  playerName: string;
  partnerName: string;
}

export const CategorySelection = ({
  categories,
  onSelectCategory,
  playerName,
  partnerName
}: CategorySelectionProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white/80 backdrop-blur-sm border-rose-200 shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>
          <CardTitle className="text-2xl font-serif text-rose-800">
            {playerName} & {partnerName}
          </CardTitle>
          <CardDescription className="text-rose-600">
            Choisissez une catégorie pour commencer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {categories.length === 0 ? (
            <div className="text-center text-rose-500 py-8">
              Aucune catégorie disponible pour le moment.
              <br />
              <span className="text-sm">Importez des questions dans la base de données.</span>
            </div>
          ) : (
            categories.map((category) => (
              <Button
                key={category.name}
                variant="outline"
                className="w-full h-16 text-lg font-medium border-rose-300 text-rose-700 hover:bg-rose-50 hover:border-rose-400 transition-all justify-start gap-4"
                onClick={() => onSelectCategory(category.name)}
              >
                <span className="text-2xl">{category.icon}</span>
                <span>{category.name}</span>
              </Button>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
