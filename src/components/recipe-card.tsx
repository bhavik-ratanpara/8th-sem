'use client';

import { useState } from 'react';
import {
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import { type CreateRecipeOutput, type Ingredient } from '@/ai/schemas';
import { Button } from './ui/button';
import { Trash2, RefreshCw, Minus, Plus, Users, ShoppingCart, Loader2, Lightbulb, X } from 'lucide-react';
import { Badge } from './ui/badge';
import { addUnavailableItem } from '@/lib/meal-plan';
import { suggestAlternative } from '@/ai/flows/suggest-alternative-flow';
import { useToast } from '@/hooks/use-toast';

type AlternativeSuggestion = {
  missingIngredient: string;
  alternativeIngredient: string;
  alternativeDish: string;
  reason: string;
};

type RecipeCardProps = {
  recipe: CreateRecipeOutput;
  onIngredientRemove: (ingredient: Ingredient) => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
  ingredientsChanged: boolean;
  servings: number;
  onServingsChange: (servings: number) => void;
  userId?: string | null;
};

export function RecipeCard({
  recipe,
  onIngredientRemove,
  onRegenerate,
  isRegenerating,
  ingredientsChanged,
  servings,
  onServingsChange,
  userId
}: RecipeCardProps) {
  const [missingIngredients, setMissingIngredients] = useState<string[]>([]);
  const [isCheckingAlternatives, setIsCheckingAlternatives] = useState(false);
  const [alternativeSuggestions, setAlternativeSuggestions] = useState<AlternativeSuggestion[]>([]);
  const { toast } = useToast();

  const handleAddMissingIngredient = async (ingredientName: string) => {
    if (missingIngredients.includes(ingredientName)) return;

    const newMissingIngredients = [...missingIngredients, ingredientName];
    setMissingIngredients(newMissingIngredients);

    if (userId) {
      try {
        await addUnavailableItem(userId, ingredientName);
        toast({
          title: `${ingredientName} added to shopping list 🛒`,
          duration: 2500,
        });
      } catch (error) {
        console.error('Failed to add to shopping list', error);
      }
    }
  };

  const handleRemoveMissingIngredient = (ingredientName: string) => {
    setMissingIngredients(missingIngredients.filter(item => item !== ingredientName));
  };

  const handleSuggestAlternatives = async () => {
    setIsCheckingAlternatives(true);
    setAlternativeSuggestions([]);
    try {
      const suggestions = await Promise.all(
        missingIngredients.map(async (ingredientName) => {
          const result = await suggestAlternative({
            dishName: recipe.title,
            missingIngredient: ingredientName,
            allIngredients: recipe.ingredients.map(i => i.name),
          });
          return { ...result, missingIngredient: ingredientName };
        })
      );
      setAlternativeSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to get alternatives', error);
      toast({
        title: 'Error finding alternatives',
        description: 'There was an issue getting suggestions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCheckingAlternatives(false);
    }
  };

  const scaleIngredient = (ingredient: Ingredient) => {
    const scaleFactor = servings / recipe.servings;
    const newQuantity = ingredient.quantity * scaleFactor;
    const displayQuantity = newQuantity % 1 !== 0 ? newQuantity.toFixed(2) : newQuantity;
    return `${displayQuantity} ${ingredient.unit || ''}`;
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
      <CardHeader className="p-8 bg-secondary/30 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 rounded-full px-3">Recipe</Badge>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary/80 bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                <Users className="h-3 w-3" />
                This recipe serves: {recipe.servings} people
              </div>
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-foreground">{recipe.title}</CardTitle>
            <p className="text-secondary-foreground max-w-2xl text-base leading-relaxed">
              {recipe.description}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-background border border-border rounded-md p-1 h-11 shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => onServingsChange(Math.max(1, servings - 1))}
              disabled={servings <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 px-3 min-w-[70px] justify-center border-x border-border/50">
              <span className="text-base font-bold text-foreground">{servings}</span>
              <span className="text-[13px] text-secondary-foreground font-medium">Servings</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => onServingsChange(servings + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Ingredients Column */}
        <div className="lg:col-span-4 p-8 border-b lg:border-b-0 lg:border-r border-border bg-secondary/10">
          <h3 className="text-[13px] font-semibold uppercase tracking-wider text-secondary-foreground mb-6">Ingredients</h3>
          <ul className="space-y-4">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-start justify-between py-2 border-b border-border/30 last:border-0">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-foreground">{ingredient.name}</div>
                  <div className="text-[13px] text-secondary-foreground font-medium">
                    {scaleIngredient(ingredient)}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:text-amber-600"
                    title="I don't have this"
                    onClick={() => handleAddMissingIngredient(ingredient.name)}
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:text-destructive"
                    onClick={() => onIngredientRemove(ingredient)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          {missingIngredients.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3">Missing Ingredients</h4>
              <div className="space-y-2 mb-4">
                {missingIngredients.map(item => (
                  <div key={item} className="flex items-center justify-between bg-secondary/30 p-2 rounded-md">
                    <span className="text-sm">{item}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveMissingIngredient(item)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button onClick={handleSuggestAlternatives} disabled={isCheckingAlternatives} className="w-full">
                {isCheckingAlternatives ?
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Working...</> :
                  'Suggest Alternatives'}
              </Button>
            </div>
          )}

          {isCheckingAlternatives && !alternativeSuggestions.length && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Finding alternatives...
            </div>
          )}

          {alternativeSuggestions.length > 0 && (
            <div className="mt-6 space-y-4">
              {alternativeSuggestions.map((suggestion, index) => (
                <div key={index} style={{
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid',
                  borderColor: 'hsl(45 90% 60% / 0.4)',
                  background: 'hsl(45 90% 95% / 0.3)',
                  position: 'relative',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '10px',
                  }}>
                    <Lightbulb className="h-4 w-4" style={{ color: 'hsl(45 90% 50%)' }} />
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: 'hsl(var(--foreground))',
                    }}>
                      Missing: {suggestion.missingIngredient}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'hsl(var(--foreground))', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600 }}>Use instead: </span>
                    {suggestion.alternativeIngredient}
                  </div>
                  <div style={{ fontSize: '13px', color: 'hsl(var(--foreground))', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600 }}>Or make: </span>
                    {suggestion.alternativeDish}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: 'hsl(var(--muted-foreground))',
                    lineHeight: 1.5,
                  }}>
                    {suggestion.reason}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions Column */}
        <div className="lg:col-span-8 p-8 bg-card">
          <h3 className="text-[13px] font-semibold uppercase tracking-wider text-secondary-foreground mb-6">How to Cook</h3>
          <div className="space-y-6">
            {recipe.instructions.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-bold">
                  {index + 1}
                </div>
                <div className="text-sm text-foreground leading-relaxed pt-0.5">
                  <ReactMarkdown>{step.replace(/^\d+\.\s*/, '')}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {ingredientsChanged && (
        <div className="p-6 bg-secondary/20 border-t border-border">
          <Button onClick={onRegenerate} disabled={isRegenerating} className="w-full h-11 text-sm font-semibold rounded-md">
            {isRegenerating ? (
              <>
                <RefreshCw className="mr-3 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
