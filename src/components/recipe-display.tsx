'use client';

import { ChefHat, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
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
  <Card className="overflow-hidden">
    <CardHeader>
      <Skeleton className="h-8 w-1/2 rounded-md" />
    </CardHeader>
    <CardContent className="space-y-6">
       <div className="space-y-2">
          <Skeleton className="h-4 w-1/4 rounded-md" />
          <Skeleton className="h-4 w-3/4 rounded-md" />
          <Skeleton className="h-4 w-5/6 rounded-md" />
        </div>
       <div className="space-y-2">
          <Skeleton className="h-4 w-1/3 rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-4/5 rounded-md" />
        </div>
    </CardContent>
  </Card>
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
        // Optionally, show an error to the user
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
      servings: servings, // Pass the possibly updated servings count
      modifications: modificationText,
      currentRecipe: currentRecipeContext 
    });
    setModificationText('');
  };

  if (isLoading && !recipe) {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-headline font-semibold text-center text-primary">Crafting your recipe...</h2>
        <RecipeSkeleton />
      </div>
    );
  }

  if (!displayedRecipe) {
    return (
       <div className="text-center py-10 px-4 border-2 border-dashed border-border rounded-lg bg-card/50">
        <ChefHat className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">Your generated recipe will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <RecipeCard 
        recipe={displayedRecipe} 
        onIngredientRemove={handleIngredientRemove}
        onRegenerate={handleInstructionRegenerate}
        isRegenerating={isRegenerating}
        ingredientsChanged={ingredientsChanged}
        servings={servings}
        onServingsChange={setServings}
      />

      <div className="bg-card p-6 md:p-8 rounded-lg shadow-lg border border-border">
          <h3 className="text-xl font-headline font-bold mb-4">Need to make a change?</h3>
          <Textarea
            value={modificationText}
            onChange={(e) => setModificationText(e.target.value)}
            placeholder="Don't have certain ingredients or equipment? Tell us what to avoid or substitute..."
            rows={3}
            className="text-base md:text-sm"
          />
          <Button
            onClick={handleRecipeRegenerate}
            disabled={isLoading || !modificationText.trim()}
            className="w-full mt-4"
          >
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Regenerating...</>
            ) : (
              <><RefreshCw className="mr-2 h-4 w-4" />Regenerate Recipe</>
            )}
          </Button>
      </div>
    </div>
  );
}
