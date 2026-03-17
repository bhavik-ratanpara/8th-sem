'use client';

import { Loader2, Settings2 } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { RecipeCard } from './recipe-card';
import { useEffect, useState } from 'react';
import { type CreateRecipeOutput, type Ingredient, type CreateRecipeInput } from '@/ai/schemas';
import { regenerateInstructionsAction } from '@/app/actions';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';

type RecipeDisplayProps = {
  recipe: CreateRecipeOutput | null;
  setRecipe: (recipe: CreateRecipeOutput | null) => void;
  isLoading: boolean;
  originalInput: CreateRecipeInput | null;
  onRegenerate: (input: CreateRecipeInput) => Promise<void>;
};

const RecipeSkeleton = () => (
  <div className="border border-border rounded-lg overflow-hidden bg-card">
    <div className="p-8 bg-secondary/30 border-b border-border">
      <Skeleton className="h-8 w-1/3 rounded-md" />
      <Skeleton className="h-4 w-full max-w-lg rounded-md mt-4" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2">
       <div className="p-8 border-r border-border space-y-4">
          <Skeleton className="h-4 w-20 rounded-md" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full rounded-md" />
          ))}
       </div>
       <div className="p-8 space-y-4">
          <Skeleton className="h-4 w-20 rounded-md" />
          <Skeleton className="h-32 w-full rounded-md" />
          <Skeleton className="h-32 w-full rounded-md" />
       </div>
    </div>
  </div>
);

export function RecipeDisplay({ recipe, setRecipe, isLoading, originalInput, onRegenerate }: RecipeDisplayProps) {
  const [displayedRecipe, setDisplayedRecipe] = useState<CreateRecipeOutput | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [ingredientsChanged, setIngredientsChanged] = useState(false);
  const [servings, setServings] = useState(1);
  const [modificationText, setModificationText] = useState('');

  useEffect(() => {
    if (recipe) {
      setDisplayedRecipe(recipe);
      setServings(recipe.servings);
      setIngredientsChanged(false);
    } else {
      setDisplayedRecipe(null);
    }
  }, [recipe]);

  const handleIngredientRemove = (ingredientToRemove: Ingredient) => {
    if (!displayedRecipe) return;

    const newIngredients = displayedRecipe.ingredients.filter(
      (ingredient) => ingredient.name !== ingredientToRemove.name
    );
    setDisplayedRecipe({ ...displayedRecipe, ingredients: newIngredients });
    setIngredientsChanged(true);
  };
  
  const handleInstructionRegenerate = async () => {
    if (!displayedRecipe) return;
    setIsRegenerating(true);
    try {
        const newInstructions = await regenerateInstructionsAction({
            dishName: displayedRecipe.title,
            ingredients: displayedRecipe.ingredients.map(i => i.name),
        });
        setDisplayedRecipe({ ...displayedRecipe, instructions: newInstructions });
        setIngredientsChanged(false);
    } catch (error) {
        console.error("Failed to regenerate instructions", error);
    } finally {
        setIsRegenerating(false);
    }
  };

  const handleRecipeRegenerate = async () => {
    if (!originalInput || !modificationText.trim() || !displayedRecipe) return;

    const currentRecipeContext = {
      title: displayedRecipe.title,
      description: displayedRecipe.description,
      ingredients: displayedRecipe.ingredients,
      instructions: displayedRecipe.instructions,
    };

    await onRegenerate({ 
      ...originalInput, 
      servings: servings,
      modifications: modificationText,
      currentRecipe: currentRecipeContext 
    });
    setModificationText('');
  };

  if (isLoading && !recipe) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
          <h2 className="text-sm font-medium">Writing your recipe...</h2>
        </div>
        <RecipeSkeleton />
      </div>
    );
  }

  if (!displayedRecipe) {
    return (
       <div className="text-center py-24 border border-border border-dashed rounded-lg bg-secondary/10">
        <h3 className="text-sm font-medium text-secondary-foreground">Your recipe will appear here</h3>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <RecipeCard 
        recipe={displayedRecipe} 
        onIngredientRemove={handleIngredientRemove}
        onRegenerate={handleInstructionRegenerate}
        isRegenerating={isRegenerating}
        ingredientsChanged={ingredientsChanged}
        servings={servings}
        onServingsChange={setServings}
      />

      <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Settings2 className="h-4 w-4 text-primary" />
            <h3 className="text-[13px] font-semibold text-foreground uppercase tracking-wider">Make Changes</h3>
          </div>
          <Textarea
            value={modificationText}
            onChange={(e) => setModificationText(e.target.value)}
            placeholder="Want to change something? (e.g. 'no nuts', 'make it spicy')"
            className="input-saas min-h-[100px]"
          />
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleRecipeRegenerate}
              disabled={isLoading || !modificationText.trim()}
              className="font-medium h-10 px-6"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</>
              ) : (
                'Update Recipe'
              )}
            </Button>
          </div>
      </div>
    </div>
  );
}
