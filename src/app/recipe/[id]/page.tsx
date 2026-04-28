'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { useUser, initializeFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { type SavedRecipe, deleteRecipe, toggleFavourite } from '@/lib/save-recipe';
import { addUnavailableItem } from '@/lib/meal-plan';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  ChefHat, 
  Clock, 
  Users, 
  Globe, 
  Trash2, 
  Star, 
  ListTodo, 
  Utensils,
  Share2,
  ShoppingCart
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const { firestore: db } = initializeFirebase();

function RecipeDetailContent() {
  const { user } = useUser();
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [recipe, setRecipe] = useState<SavedRecipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!user || !id) return;
      try {
        const docRef = doc(db, 'users', user.uid, 'savedRecipes', id as string);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setRecipe({ id: docSnap.id, ...docSnap.data() } as SavedRecipe);
        } else {
          toast({ variant: "destructive", title: "Recipe not found" });
          router.push('/history');
        }
      } catch (error) {
        console.error("Error fetching recipe", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecipe();
  }, [user, id, router, toast]);

  const handleDelete = async () => {
    if (!user || !id || !window.confirm("Are you sure you want to delete this recipe?")) return;
    try {
      await deleteRecipe(user.uid, id as string);
      toast({ title: "Recipe Deleted" });
      router.push('/history');
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not delete recipe." });
    }
  };

  const handleToggleFav = async () => {
    if (!user || !recipe || !id) return;
    try {
      await toggleFavourite(user.uid, id as string, recipe.isFavourite);
      setRecipe(prev => prev ? { ...prev, isFavourite: !recipe.isFavourite } : null);
      toast({ title: !recipe.isFavourite ? "Added to Favourites ⭐" : "Removed from Favourites" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not update favourite status." });
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/recipe/${id}`;
    
    const shareData = {
      title: 'Check out this recipe on Cooking Lab!',
      text: 'Amazing recipe from Cooking Lab!',
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied! 🔗",
          description: "Recipe link copied to clipboard.",
          duration: 2000,
        });
      }
    } catch {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied! 🔗",
        description: "Recipe link copied to clipboard.",
        duration: 2000,
      });
    }
  };
  
  const handleAddToShoppingList = async (ingredientName: string) => {
    if (!user) {
      toast({ title: "Please log in to use the shopping list.", variant: "destructive" })
      return;
    }
    try {
      await addUnavailableItem(user.uid, ingredientName);
      toast({
        title: `${ingredientName} added to shopping list 🛒`,
        duration: 2500,
      });
    } catch (error) {
      console.error('Failed to add to shopping list', error);
      toast({
        title: `Failed to add ${ingredientName}`,
        variant: 'destructive',
        duration: 2500,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-content px-4 py-12 space-y-12">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-2/3" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 space-y-4">
            <Skeleton className="h-8 w-32" />
            {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
          <div className="lg:col-span-8 space-y-6">
            <Skeleton className="h-8 w-48" />
            {[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) return null;

  return (
    <div className="max-content px-4 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Navigation */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-primary font-bold text-sm mb-10 hover:translate-x-[-4px] transition-transform"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Hero Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-10 mb-16">
        <div className="space-y-6 flex-1">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary p-2 rounded-lg">
              <ChefHat className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary/80">Premium Generated Recipe</p>
          </div>
          
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground leading-[1.1]">{recipe.recipeName}</h1>
          
          <div className="flex flex-wrap gap-4 items-center pt-2">
             <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full border border-border text-sm font-semibold">
                <Globe className="h-4 w-4 text-blue-500" /> {recipe.cuisine}
             </div>
             <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full border border-border text-sm font-semibold">
                <Users className="h-4 w-4 text-green-500" /> {recipe.servings} Servings
             </div>
             <div className={cn(
               "flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold",
               recipe.dietType === 'Vegetarian' ? "bg-green-50 text-green-700 border-green-100" : "bg-rose-50 text-rose-700 border-rose-100"
             )}>
                <Utensils className="h-4 w-4" /> {recipe.dietType}
             </div>
             <p className="text-sm text-muted-foreground font-medium pl-2 border-l border-border">
                Saved {recipe.generatedAt?.toDate ? format(recipe.generatedAt.toDate(), 'dd MMM yyyy') : 'Recently'}
             </p>
          </div>
        </div>

        <div className="flex gap-3 shrink-0">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleToggleFav}
            className={cn(
              "h-12 w-12 rounded-xl transition-all shadow-sm",
              recipe.isFavourite ? "bg-amber-50 border-amber-200 text-amber-500" : "border-border text-muted-foreground"
            )}
          >
            <Star className={cn("h-6 w-6", recipe.isFavourite && "fill-current")} />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleShare}
            className="h-12 w-12 rounded-xl border-border text-muted-foreground hover:text-primary transition-colors"
          >
            <Share2 className="h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleDelete}
            className="h-12 w-12 rounded-xl border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Ingredients */}
        <div className="lg:col-span-4">
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
            <div className="p-8 bg-secondary/20 border-b border-border flex items-center gap-3">
              <Utensils className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Ingredients</h2>
            </div>
            <div className="p-6">
              <ul className="space-y-1">
                {recipe.ingredients.map((item, index) => (
                  <li key={index} className="flex items-center justify-between py-4 border-b border-border/50 last:border-0 group">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                      <span className="text-base font-medium text-foreground">{item}</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-foreground hover:text-amber-600"
                        title="Add to shopping list"
                        onClick={() => handleAddToShoppingList(item)}
                    >
                        <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center gap-3 mb-4">
            <ListTodo className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">How to Cook</h2>
          </div>
          
          <div className="space-y-10">
            {recipe.steps.map((step, index) => (
              <div key={index} className="flex gap-6 group">
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 bg-primary text-white rounded-full flex items-center justify-center font-extrabold text-sm shadow-lg shadow-primary/20 shrink-0">
                    {index + 1}
                  </div>
                  {index !== recipe.steps.length - 1 && (
                    <div className="w-0.5 h-full bg-border/50 mt-2 group-hover:bg-primary/20 transition-colors" />
                  )}
                </div>
                <div className="pt-1.5 space-y-2">
                  <p className="text-lg font-medium leading-[1.6] text-foreground/90">{step.replace(/^\d+\.\s*/, '')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecipeDetailPage() {
  return (
    <ProtectedRoute>
      <RecipeDetailContent />
    </ProtectedRoute>
  );
}
