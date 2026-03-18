'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { useUser } from '@/firebase';
import { getSavedRecipes, deleteRecipe, toggleFavourite, type SavedRecipe } from '@/lib/save-recipe';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Trash2, Eye, Search, BookMarked, Filter, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

function HistoryContent() {
  const { user } = useUser();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<SavedRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dietFilter, setDietFilter] = useState<'All' | 'Vegetarian' | 'Non-Vegetarian'>('All');

  useEffect(() => {
    const fetchRecipes = async () => {
      if (!user) return;
      try {
        const data = await getSavedRecipes(user.uid);
        setRecipes(data);
        
        // Handle URL-based filter (e.g. ?filter=favourite)
        const filterParam = searchParams.get('filter');
        if (filterParam === 'favourite') {
          setFilteredRecipes(data.filter(r => r.isFavourite));
        } else {
          setFilteredRecipes(data);
        }
      } catch (error) {
        console.error("Error fetching recipes", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecipes();
  }, [user, searchParams]);

  useEffect(() => {
    let result = recipes;
    
    // Diet filter
    if (dietFilter !== 'All') {
      result = result.filter(r => r.dietType === dietFilter);
    }
    
    // Search filter
    if (searchQuery.trim()) {
      result = result.filter(r => 
        r.recipeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Special handling for fav filter from dropdown
    if (searchParams.get('filter') === 'favourite') {
      result = result.filter(r => r.isFavourite);
    }

    setFilteredRecipes(result);
  }, [recipes, dietFilter, searchQuery, searchParams]);

  const handleDelete = async (recipeId: string) => {
    if (!user || !window.confirm("Are you sure you want to delete this recipe?")) return;
    
    try {
      await deleteRecipe(user.uid, recipeId);
      setRecipes(prev => prev.filter(r => r.id !== recipeId));
      toast({
        title: "Recipe Deleted",
        description: "Recipe has been removed from your history.",
      });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not delete recipe." });
    }
  };

  const handleToggleFav = async (recipeId: string, current: boolean) => {
    if (!user) return;
    try {
      await toggleFavourite(user.uid, recipeId, current);
      setRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, isFavourite: !current } : r));
      toast({
        title: !current ? "Added to Favourites ⭐" : "Removed from Favourites",
        duration: 2000,
      });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not update favourite status." });
    }
  };

  return (
    <div className="max-content px-4 py-12">
      {/* Navigation */}
      <Link 
        href="/"
        className="flex items-center gap-2 text-primary font-bold text-sm mb-10 hover:translate-x-[-4px] transition-transform w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Generator
      </Link>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground" style={{ fontFamily: "'Cal Sans', sans-serif" }}>My Recipes</h1>
          <p className="text-muted-foreground text-lg">All your saved recipes in one place</p>
        </div>
        {!isLoading && (
          <div className="text-sm font-semibold bg-secondary/50 px-4 py-2 rounded-full border border-border text-secondary-foreground">
            {recipes.length} recipes saved
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between mb-10 bg-card p-6 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0">
          <Filter className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
          {(['All', 'Vegetarian', 'Non-Vegetarian'] as const).map((filter) => (
            <Button
              key={filter}
              variant={dietFilter === filter ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDietFilter(filter)}
              className={cn(
                "rounded-full px-5 h-9 text-xs font-semibold whitespace-nowrap",
                dietFilter === filter ? "bg-primary text-white shadow-md" : "text-muted-foreground"
              )}
            >
              {filter}
            </Button>
          ))}
        </div>

        <div className="relative w-full lg:w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-lg border-border focus:ring-primary/20 bg-background"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-card border border-border rounded-xl p-6 space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-3 pt-4">
                <Skeleton className="h-9 w-24 rounded-md" />
                <Skeleton className="h-9 w-20 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRecipes.map((recipe) => (
            <div 
              key={recipe.id}
              className="group relative bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-xl hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-foreground line-clamp-2 pr-2">{recipe.recipeName}</h3>
                <button 
                  onClick={() => recipe.id && handleToggleFav(recipe.id, recipe.isFavourite)}
                  className="transition-transform active:scale-125"
                >
                  <Star 
                    className={cn(
                      "h-6 w-6 transition-colors", 
                      recipe.isFavourite ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30 hover:text-amber-400"
                    )} 
                  />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-[11px] font-bold px-3 py-1 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-800">
                  {recipe.cuisine}
                </span>
                <span className="text-[11px] font-bold px-3 py-1 bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-full border border-green-100 dark:border-green-800">
                  {recipe.servings} Servings
                </span>
                <span className={cn(
                  "text-[11px] font-bold px-3 py-1 rounded-full border",
                  recipe.dietType === 'Vegetarian' 
                    ? "bg-green-50 text-green-600 border-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800" 
                    : "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800"
                )}>
                  {recipe.dietType}
                </span>
              </div>

              <div className="mt-auto space-y-4">
                <p className="text-[12px] text-muted-foreground font-medium">
                  Saved on {recipe.generatedAt?.toDate ? format(recipe.generatedAt.toDate(), 'dd MMM yyyy') : 'Recently'}
                </p>
                <div className="flex items-center gap-3">
                  <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-white font-bold h-9 px-5 rounded-lg flex-1">
                    <Link href={`/recipe/${recipe.id}`}>
                      View Recipe
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => recipe.id && handleDelete(recipe.id)}
                    className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-secondary/10 rounded-2xl border-2 border-dashed border-border">
          <div className="bg-secondary/20 p-6 rounded-full mb-6">
            <BookMarked className="h-12 w-12 text-muted-foreground/40" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">No recipes saved yet</h2>
          <p className="text-muted-foreground mb-8 max-w-sm">Generate a professional recipe and save it to your collection to see it here.</p>
          <Button asChild className="bg-primary text-white font-bold h-12 px-8 rounded-xl shadow-lg hover:shadow-primary/20 transition-all">
            <Link href="/">Generate Your First Recipe</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  return (
    <ProtectedRoute>
      <HistoryContent />
    </ProtectedRoute>
  );
}
