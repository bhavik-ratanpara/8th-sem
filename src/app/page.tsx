'use client';

import { useState, useEffect } from 'react';
import { createRecipeAction } from '@/app/actions';
import { RecipeForm } from '@/components/recipe-form';
import { RecipeDisplay } from '@/components/recipe-display';
import { type CreateRecipeInput, type CreateRecipeOutput } from '@/ai/schemas';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Lock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { DishSuggester } from '@/components/dish-suggester';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { TypewriterHero } from '@/components/typewriter-hero';
import Link from 'next/link';

export default function Home() {
  const [recipe, setRecipe] = useState<CreateRecipeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [selectedDish, setSelectedDish] = useState<string | null>(null);
  const [originalRecipeInput, setOriginalRecipeInput] = useState<CreateRecipeInput | null>(null);

  const { user, isUserLoading } = useUser();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleGenerateRecipe = async (input: CreateRecipeInput) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    setRecipe(null);
    
    if (!input.modifications) {
      setOriginalRecipeInput(input);
    }

    try {
      const newRecipe = await createRecipeAction(input);
      setRecipe(newRecipe);
      setTimeout(() => {
        document.getElementById('recipe-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSuggestionSelect = (dishName: string) => {
    setSelectedDish(dishName);
    document.getElementById('recipe-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isClient) return null;

  return (
    <div className="bg-background">
      {/* Typewriter Hero Section */}
      <TypewriterHero />

      <main className="max-content px-4 py-16 space-y-24">
        {isUserLoading ? (
          <div className="space-y-12">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        ) : user ? (
          <div className="space-y-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-4">
                <DishSuggester onSuggestionSelect={handleSuggestionSelect} />
              </div>
              <div className="lg:col-span-8">
                <div id="recipe-form" className="scroll-mt-24">
                  <RecipeForm onSubmit={handleGenerateRecipe} isLoading={isLoading} selectedDishName={selectedDish} />
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Oops!</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div id="recipe-section" className="scroll-mt-24">
              <RecipeDisplay
                recipe={recipe}
                setRecipe={setRecipe}
                isLoading={isLoading}
                originalInput={originalRecipeInput}
                onRegenerate={handleGenerateRecipe}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-20 border border-border rounded-lg bg-secondary/30">
            <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Please Sign In</h2>
            <p className="text-secondary-foreground mb-8">Sign in to start creating recipes.</p>
            <Button asChild className="bg-primary text-primary-foreground">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
