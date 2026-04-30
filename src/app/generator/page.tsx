'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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

const RECIPE_STORAGE_KEY = 'cooking_lab_last_recipe';
const FORM_STORAGE_KEY = 'cooking_lab_last_form';

function GeneratorContent() {
  const searchParams = useSearchParams();
  const [recipe, setRecipe] = useState<CreateRecipeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [selectedDish, setSelectedDish] = useState<string | null>(null);
  const [selectedServings, setSelectedServings] = useState<number | null>(null);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedDiet, setSelectedDiet] = useState<string | null>(null);
  const [originalRecipeInput, setOriginalRecipeInput] = useState<CreateRecipeInput | null>(null);
  const [restoredFromStorage, setRestoredFromStorage] = useState(false);

  const { user, isUserLoading } = useUser();

  // Initialization: Handle URL params and localStorage
  useEffect(() => {
    setIsClient(true);
    
    // 1. Check URL params first (Highest Priority)
    const dishParam = searchParams.get('dish');
    const servingsParam = searchParams.get('servings');
    const cuisineParam = searchParams.get('cuisine');
    const goalParam = searchParams.get('goal');
    const dietParam = searchParams.get('diet');

    if (dishParam) {
      // Clear any previous recipe when coming from a link
      setRecipe(null);
      setOriginalRecipeInput(null);
      setRestoredFromStorage(false);
      localStorage.removeItem(RECIPE_STORAGE_KEY);
      localStorage.removeItem(FORM_STORAGE_KEY);

      setSelectedDish(dishParam);
      if (servingsParam) setSelectedServings(parseInt(servingsParam));
      if (cuisineParam) setSelectedCuisine(cuisineParam);
      if (goalParam) setSelectedGoal(goalParam);
      if (dietParam) setSelectedDiet(dietParam);

      // Clean URL parameter
      window.history.replaceState({}, '', window.location.pathname);
      return; // Stop here, URL params take precedence
    }

    // 2. Fallback to localStorage if no URL params
    try {
      const savedRecipe = localStorage.getItem(RECIPE_STORAGE_KEY);
      const savedForm = localStorage.getItem(FORM_STORAGE_KEY);

      if (savedRecipe && savedForm) {
        const parsedRecipe = JSON.parse(savedRecipe);
        const parsedForm = JSON.parse(savedForm);
        setRecipe(parsedRecipe);
        setOriginalRecipeInput(parsedForm);
        setRestoredFromStorage(true);
        
        // Restore form state
        if (parsedForm.dishName) setSelectedDish(parsedForm.dishName);
        if (parsedForm.servings) setSelectedServings(parsedForm.servings);
        if (parsedForm.location) setSelectedCuisine(parsedForm.location);
        if (parsedForm.diet) setSelectedDiet(parsedForm.diet);
      }
    } catch (e) {
      console.error('Failed to restore recipe:', e);
    }
  }, [searchParams]);

  const handleGenerateRecipe = async (input: CreateRecipeInput) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    setRecipe(null);
    setRestoredFromStorage(false);
    
    if (!input.modifications) {
      setOriginalRecipeInput(input);
    }

    try {
      const newRecipe = await createRecipeAction(input);
      setRecipe(newRecipe);

      // Save to localStorage
      try {
        localStorage.setItem(RECIPE_STORAGE_KEY, JSON.stringify(newRecipe));
        // Save the form context (original input or modified input)
        localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(input.modifications ? { ...originalRecipeInput, modifications: input.modifications } : input));
      } catch (e) {
        console.error('Failed to save recipe to storage:', e);
      }

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

  const handleClearRestored = () => {
    setRecipe(null);
    setRestoredFromStorage(false);
    localStorage.removeItem(RECIPE_STORAGE_KEY);
    localStorage.removeItem(FORM_STORAGE_KEY);
  };

  const handleGenerateNew = () => {
    handleClearRestored();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isClient) return null;

  return (
    <div className="bg-background">
      {/* Typewriter Hero Section */}
      <TypewriterHero />

      <main className="max-content px-4 pt-6 pb-8 space-y-12">
        {isUserLoading ? (
          <div className="space-y-12">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        ) : user ? (
          <div className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-4">
                <DishSuggester onSuggestionSelect={handleSuggestionSelect} />
              </div>
              <div className="lg:col-span-8">
                <div id="recipe-form" className="scroll-mt-24">
                  {selectedGoal && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'hsl(var(--primary) / 0.06)',
                      border: '1px solid hsl(var(--primary) / 0.15)',
                      marginBottom: '12px',
                    }}>
                      <span style={{ fontSize: '16px' }}>🎯</span>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'hsl(var(--primary))',
                      }}>
                        Health Goal: {selectedGoal}
                      </span>
                      <button
                        onClick={() => setSelectedGoal(null)}
                        style={{
                          marginLeft: 'auto',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'hsl(var(--muted-foreground))',
                          fontSize: '16px',
                          lineHeight: 1,
                          padding: '0 2px',
                        }}
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <RecipeForm 
                    onSubmit={handleGenerateRecipe} 
                    isLoading={isLoading} 
                    selectedDishName={selectedDish}
                    selectedServings={selectedServings}
                    selectedCuisine={selectedCuisine}
                    selectedDiet={selectedDiet}
                  />
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
              {/* RESTORED BANNER */}
              {recipe && restoredFromStorage && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '0.5px solid hsl(var(--border))',
                  background: 'hsl(var(--muted))',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <svg 
                      width="14" height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{
                        color: 'hsl(var(--muted-foreground))',
                        flexShrink: 0,
                      }}
                    >
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 8v4M12 16h.01"/>
                    </svg>
                    <span style={{
                      fontSize: '12px',
                      color: 'hsl(var(--muted-foreground))',
                    }}>
                      Your last generated recipe
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '8px',
                  }}>
                    <button
                      onClick={handleGenerateNew}
                      style={{
                        fontSize: '12px',
                        padding: '5px 12px',
                        borderRadius: '6px',
                        border: '0.5px solid hsl(var(--border))',
                        background: 'hsl(var(--background))',
                        color: 'hsl(var(--foreground))',
                        cursor: 'pointer',
                        fontWeight: 500,
                      }}
                    >
                      Generate New
                    </button>
                    <button
                      onClick={handleClearRestored}
                      style={{
                        fontSize: '12px',
                        padding: '5px 12px',
                        borderRadius: '6px',
                        border: '0.5px solid hsl(var(--border))',
                        background: 'transparent',
                        color: 'hsl(var(--muted-foreground))',
                        cursor: 'pointer',
                      }}
                    >
                      Clear ×
                    </button>
                  </div>
                </div>
              )}

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

export default function GeneratorPage() {
  return (
    <Suspense fallback={null}>
      <GeneratorContent />
    </Suspense>
  );
}
