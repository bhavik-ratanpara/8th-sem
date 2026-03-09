'use client';

import { ChefHat, Loader2, RefreshCw, Sparkles } from 'lucide-react';
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
  <Card className="culinary-card border-none shadow-xl overflow-hidden">
    <CardHeader className="p-12 text-center bg-muted/20">
      <Skeleton className="h-12 w-2/3 mx-auto rounded-xl" />
      <Skeleton className="h-6 w-full max-w-md mx-auto rounded-lg mt-4" />
    </CardHeader>
    <CardContent className="p-12">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/3 rounded-lg" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full rounded-md" />
            ))}
          </div>
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/3 rounded-lg" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
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
      <div className="space-y-8 py-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
          <h2 className="text-3xl font-headline font-bold italic">Consulting the Chef...</h2>
          <p className="text-muted-foreground">Orchestrating flavors and balancing techniques for your masterpiece.</p>
        </div>
        <RecipeSkeleton />
      </div>
    );
  }

  if (!displayedRecipe) {
    return (
       <div className="text-center py-20 px-8 border-2 border-dashed border-border rounded-3xl bg-card/50 backdrop-blur-sm group hover:border-primary/50 transition-all duration-500">
        <div className="bg-primary/5 p-6 rounded-full w-fit mx-auto mb-6 group-hover:scale-110 transition-transform">
          <ChefHat className="h-12 w-12 text-primary/40 group-hover:text-primary transition-colors" />
        </div>
        <h3 className="text-2xl font-headline font-bold italic mb-2">Ready for Service</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">Your high-precision recipe will manifest here once initialized.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      <RecipeCard 
        recipe={displayedRecipe} 
        onIngredientRemove={handleIngredientRemove}
        onRegenerate={handleInstructionRegenerate}
        isRegenerating={isRegenerating}
        ingredientsChanged={ingredientsChanged}
        servings={servings}
        onServingsChange={setServings}
      />

      <div className="culinary-card p-8 md:p-12 bg-accent/5 border-accent/20">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="h-6 w-6 text-accent" />
            <h3 className="text-2xl font-headline font-bold italic">Culinary Modification</h3>
          </div>
          <p className="text-muted-foreground mb-6 text-base">
            Need to substitute an ingredient, adjust for kitchen equipment, or tailor the flavor profile? Describe your constraints below.
          </p>
          <Textarea
            value={modificationText}
            onChange={(e) => setModificationText(e.target.value)}
            placeholder="e.g., 'Replace white wine with chicken broth', 'Adjust for a pressure cooker', 'Make it spicier'..."
            rows={4}
            className="text-lg md:text-base rounded-2xl border-border/50 bg-background/50 focus:bg-background h-32 p-6"
          />
          <Button
            onClick={handleRecipeRegenerate}
            disabled={isLoading || !modificationText.trim()}
            className="pill-button w-full mt-8 h-16 text-lg bg-primary hover:bg-primary/90 text-white shadow-xl"
          >
            {isLoading ? (
              <><Loader2 className="mr-3 h-6 w-6 animate-spin" />Consulting...</>
            ) : (
              <><RefreshCw className="mr-3 h-6 w-6" />Re-Craft Masterpiece</>
            )}
          </Button>
      </div>
    </div>
  );
}