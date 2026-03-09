import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ReactMarkdown from 'react-markdown';
import { type CreateRecipeOutput, type Ingredient } from '@/ai/schemas';
import { Button } from './ui/button';
import { Trash2, RefreshCw, Minus, Plus, Users, UtensilsCrossed } from 'lucide-react';

type RecipeCardProps = {
  recipe: CreateRecipeOutput;
  onIngredientRemove: (ingredient: Ingredient) => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
  ingredientsChanged: boolean;
  servings: number;
  onServingsChange: (servings: number) => void;
};

export function RecipeCard({
  recipe,
  onIngredientRemove,
  onRegenerate,
  isRegenerating,
  ingredientsChanged,
  servings,
  onServingsChange
}: RecipeCardProps) {

  const scaleIngredient = (ingredient: Ingredient) => {
    const scaleFactor = servings / recipe.servings;
    const newQuantity = ingredient.quantity * scaleFactor;
    const displayQuantity = newQuantity % 1 !== 0 ? newQuantity.toFixed(2) : newQuantity;
    return `${displayQuantity} ${ingredient.unit || ''}`;
  };

  return (
    <Card className="culinary-card border-none shadow-xl overflow-hidden animate-fade-in">
      <div className="h-3 bg-primary" />
      <CardHeader className="p-8 md:p-12 text-center bg-muted/30">
        <div className="flex justify-center mb-6">
          <UtensilsCrossed className="h-10 w-10 text-primary opacity-50" />
        </div>
        <CardTitle className="font-headline text-4xl md:text-5xl italic mb-4">{recipe.title}</CardTitle>
        <CardDescription className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
          {recipe.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-8 md:p-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Ingredients Column */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex justify-between items-center border-b border-primary/10 pb-4">
              <h3 className="font-headline text-2xl italic">Ingredients</h3>
              <div className="flex items-center gap-3 bg-background rounded-full p-1 border shadow-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => onServingsChange(Math.max(1, servings - 1))}
                  disabled={servings <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <div className="flex items-center gap-2 px-1">
                  <Users className="h-3 w-3 text-primary" />
                  <span className="font-bold text-sm min-w-[1rem] text-center">{servings}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => onServingsChange(servings + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <ul className="space-y-4">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start justify-between group py-2">
                  <div className="flex gap-4 items-baseline">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0 mt-2.5" />
                    <div className="flex flex-col">
                      <span className="font-bold text-base">{ingredient.name}</span>
                      <span className="text-sm text-muted-foreground uppercase tracking-widest font-bold text-[10px]">
                        {scaleIngredient(ingredient)}
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10" 
                    onClick={() => onIngredientRemove(ingredient)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions Column */}
          <div className="lg:col-span-7 space-y-8">
            <h3 className="font-headline text-2xl italic border-b border-primary/10 pb-4">Culinary Instructions</h3>
            <div className="prose prose-slate max-w-none prose-headings:font-headline prose-headings:italic prose-p:leading-relaxed prose-li:leading-relaxed">
              <ReactMarkdown>{recipe.instructions}</ReactMarkdown>
            </div>
          </div>
        </div>
      </CardContent>

      {ingredientsChanged && (
        <CardFooter className="p-8 md:p-12 bg-muted/10 border-t">
            <Button onClick={onRegenerate} disabled={isRegenerating} className="pill-button w-full h-14 text-lg shadow-lg">
                {isRegenerating ? (
                    <>
                        <RefreshCw className="mr-3 h-5 w-5 animate-spin" />
                        Refining Instructions...
                    </>
                ) : (
                    <>
                        <RefreshCw className="mr-3 h-5 w-5" />
                        Refine to Ingredients
                    </>
                )}
            </Button>
        </CardFooter>
      )}
    </Card>
  );
}