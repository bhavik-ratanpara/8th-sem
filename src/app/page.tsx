'use client';

import { useState, useEffect } from 'react';
import { createRecipeAction } from '@/app/actions';
import { RecipeForm } from '@/components/recipe-form';
import { RecipeDisplay } from '@/components/recipe-display';
import { type CreateRecipeInput, type CreateRecipeOutput } from '@/ai/schemas';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Lock, LogIn, ChefHat, Sparkles, BookOpen } from 'lucide-react';
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
      // Smooth scroll to recipe
      setTimeout(() => {
        document.getElementById('recipe-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
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
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="hero-gradient absolute inset-0 -z-10" />
        <div className="ingredient-float top-20 left-[10%]">🌿</div>
        <div className="ingredient-float top-40 right-[15%]">🧄</div>
        <div className="ingredient-float bottom-20 left-[20%]">🍅</div>
        
        <div className="container mx-auto px-4 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest mb-6">
            <Sparkles className="w-4 h-4" />
            Culinary AI Excellence
          </div>
          <h1 className="text-5xl md:text-7xl font-headline font-bold mb-6 max-w-4xl mx-auto leading-tight italic">
            Master the Art of <span className="text-primary not-italic">Fine Dining</span> at Home
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Join our elite digital food lab where artificial intelligence meets gourmet inspiration. 
            Create, refine, and master any dish with professional precision.
          </p>
          {!user && (
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button asChild className="pill-button text-lg bg-primary hover:bg-primary/90" size="lg">
                <Link href="/signup">Join the Lab</Link>
              </Button>
              <Button asChild variant="outline" className="pill-button text-lg border-primary/20 text-primary" size="lg">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      <main className="container mx-auto px-4 pb-24">
        <div className="max-w-4xl mx-auto">
          {isUserLoading ? (
            <div className="space-y-12">
              <Skeleton className="h-96 w-full rounded-3xl" />
              <Skeleton className="h-[500px] w-full rounded-3xl" />
            </div>
          ) : user ? (
            <div className="space-y-16">
              <DishSuggester onSuggestionSelect={handleSuggestionSelect} />

              <div id="recipe-form" className="scroll-mt-24">
                <RecipeForm onSubmit={handleGenerateRecipe} isLoading={isLoading} selectedDishName={selectedDish} />
              </div>

              {error && (
                 <div className="animate-fade-in">
                    <Alert variant="destructive" className="rounded-2xl border-destructive/50">
                        <AlertCircle className="h-5 w-5" />
                        <AlertTitle className="font-headline text-lg">Culinary Error</AlertTitle>
                        <AlertDescription className="text-base">
                            {error}
                        </AlertDescription>
                    </Alert>
                 </div>
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
            <Card className="culinary-card border-dashed border-2 bg-card/50 backdrop-blur-xl py-12">
              <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-6">
                  <Lock className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-3xl font-headline font-bold mb-2 italic">Exclusive Access</CardTitle>
                <CardDescription className="text-lg">
                  Please authenticate to enter the professional Cooking Lab.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-center">
                  <div className="space-y-2">
                    <BookOpen className="h-6 w-6 text-accent mx-auto" />
                    <p className="font-bold text-sm uppercase tracking-wider">AI Recipes</p>
                  </div>
                  <div className="space-y-2">
                    <Sparkles className="h-6 w-6 text-accent mx-auto" />
                    <p className="font-bold text-sm uppercase tracking-wider">Smart Suggestions</p>
                  </div>
                  <div className="space-y-2">
                    <ChefHat className="h-6 w-6 text-accent mx-auto" />
                    <p className="font-bold text-sm uppercase tracking-wider">Chef Tutorials</p>
                  </div>
                </div>
                <div className="flex gap-4 w-full max-w-sm">
                  <Button asChild className="flex-1 pill-button bg-primary" size="lg">
                    <Link href="/login">
                      <LogIn className="mr-2 h-5 w-5" />
                      Log In
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}