'use client';

import { useState, useEffect } from 'react';
import { createRecipeAction } from '@/app/actions';
import { RecipeForm } from '@/components/recipe-form';
import { RecipeDisplay } from '@/components/recipe-display';
import { type CreateRecipeInput, type CreateRecipeOutput } from '@/ai/schemas';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Lock, LogIn } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { DishSuggester } from '@/components/dish-suggester';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function Home() {
  const [recipe, setRecipe] = useState<CreateRecipeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [selectedDish, setSelectedDish] = useState<string | null>(null);
  const [originalRecipeInput, setOriginalRecipeInput] = useState<CreateRecipeInput | null>(null);

  const { user, isUserLoading } = useUser();

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
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
    } catch (e: any) {
      const errorMessage = e.message || 'An unexpected error occurred.';
      setError(errorMessage);
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
    <div className="flex flex-col min-h-screen text-foreground">

      <main className="flex-grow container mx-auto px-4 pb-16 pt-8 md:pt-12">
        <div className="text-center mb-8 md:mb-12">
            <h1 className="text-4xl md:text-5xl font-headline font-bold wave-text">
                {'COOKING LAB'.split('').map((letter, index) => (
                <span key={index}>{letter === ' ' ? '\u00A0' : letter}</span>
                ))}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base max-w-2xl mx-auto">
                Your personal AI chef. Create any recipe, for any number of people, from anywhere in the world.
            </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {isUserLoading ? (
            <div className="space-y-8">
              <Skeleton className="h-72 w-full mb-8" />
              <Skeleton className="h-[400px] w-full" />
            </div>
          ) : user ? (
            <>
              <DishSuggester onSuggestionSelect={handleSuggestionSelect} />

              <section id="recipe-form" className="bg-card p-6 md:p-8 rounded-lg shadow-lg border border-border">
                <RecipeForm onSubmit={handleGenerateRecipe} isLoading={isLoading} selectedDishName={selectedDish} />
              </section>

              {error && (
                 <div className="mt-8">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            {error}
                        </AlertDescription>
                    </Alert>
                 </div>
              )}

              <section className="mt-8">
                <RecipeDisplay
                  recipe={recipe}
                  setRecipe={setRecipe}
                  isLoading={isLoading}
                  originalInput={originalRecipeInput}
                  onRegenerate={handleGenerateRecipe}
                />
              </section>
            </>
          ) : (
            <Card className="border-dashed border-2 bg-card/50 backdrop-blur">
              <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                  <Lock className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl font-headline font-bold">Authentication Required</CardTitle>
                <CardDescription className="text-lg">
                  Please log in to access the Cooking Lab features.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4 pb-8">
                <p className="text-muted-foreground text-center max-w-md">
                  Join our community of chefs to generate custom recipes, get AI dish suggestions, and search for cooking tutorials.
                </p>
                <div className="flex gap-4 w-full max-w-xs">
                  <Button asChild className="flex-1" size="lg">
                    <Link href="/login">
                      <LogIn className="mr-2 h-5 w-5" />
                      Log In
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1" size="lg">
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <footer className="text-center p-6 text-muted-foreground text-sm">
        <p>&copy; {currentYear} Cooking Lab. All rights reserved.</p>
      </footer>
    </div>
  );
}
