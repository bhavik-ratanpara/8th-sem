'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@/firebase'
import { 
  getPublicRecipes,
  unshareRecipePublic,
  saveFromExplore,
  getSavedRecipes,
  type SavedRecipe
} from '@/lib/save-recipe'
import { addUnavailableItem } from '@/lib/meal-plan'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  BookMarked, 
  Trash2, 
  Globe,
  Loader2,
  Share2,
  ShoppingCart
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const DietIcon = ({ type }: { type: string }) => {
  const isVeg = type === 'Vegetarian';
  return (
    <div className={cn(
      "flex items-center justify-center w-[15px] h-[15px] border-[1.5px] rounded-sm shrink-0",
      isVeg ? "border-green-600" : "border-red-700"
    )}>
      <div className={cn(
        "w-[7px] h-[7px] rounded-full",
        isVeg ? "bg-green-600" : "bg-red-700"
      )} />
    </div>
  );
};

export default function ExploreRecipeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const { toast } = useToast()
  
  const [recipe, setRecipe] = useState<SavedRecipe | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const all = await getPublicRecipes()
        const found = all.find(r => r.id === params.id)
        setRecipe(found || null)
      } catch (error) {
        console.error('Error fetching recipe:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchRecipe()
  }, [params.id])

  const isOwner = recipe && user?.uid === recipe.sharedBy

  const handleSaveToCookbook = async () => {
    if (!user) {
      router.push('/login')
      return
    }
    if (!recipe || isSaved) return

    setIsSaving(true)
    try {
      // Check if already saved
      const existingRecipes = await getSavedRecipes(user.uid)
      const alreadySaved = existingRecipes.some(r =>
        r.originalSharedBy === recipe.sharedBy &&
        r.recipeName === recipe.recipeName
      )

      if (alreadySaved) {
        setIsSaved(true)
        toast({
          title: "Already in Cookbook",
          description: "You already have this recipe saved.",
        })
        return
      }

      await saveFromExplore(
        user.uid,
        user.displayName || 'Chef',
        recipe
      )
      setIsSaved(true)
      toast({
        title: "Saved to Cookbook! 📚",
        description: "Recipe added to My Recipes.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Could not save",
        description: "Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveFromExplore = async () => {
    if (!user || !recipe?.id) return

    if (!window.confirm("Remove this recipe from Explore? It will still be in your My Recipes.")) return

    try {
      await unshareRecipePublic(user.uid, recipe.id)
      toast({
        title: "Removed from Explore",
        description: "Recipe still saved in My Recipes.",
      })
      router.push('/explore')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not remove. Try again.",
      })
    }
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/explore/recipe/${params.id}`;
    
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-2xl font-bold mb-4">Recipe not found</h2>
        <Button onClick={() => router.push('/explore')}>Back to Explore</Button>
      </div>
    )
  }

  return (
    <div className="max-content px-4 py-12 max-w-3xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-primary font-bold text-sm mb-10 hover:translate-x-[-4px] transition-transform"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Hero Image */}
      {recipe.imageUrl && (
        <div className="relative w-full h-[300px] md:h-[450px] rounded-3xl overflow-hidden mb-12 shadow-xl border border-border/50">
          <img 
            src={recipe.imageUrl} 
            alt={recipe.recipeName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-8 mb-6">
        <div className="flex items-center gap-1.5 mb-4">
          <Globe className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            Shared by{' '}
            <span className="font-semibold text-foreground">
              {isOwner ? 'You' : recipe.sharedByName}
            </span>
          </span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-4">
          {recipe.recipeName}
        </h1>

        <div className="mb-6">
          <div className="flex items-center gap-2 text-[14px] font-medium text-muted-foreground">
            {recipe.cuisine} · {recipe.servings} Servings · <DietIcon type={recipe.dietType} />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {!isOwner && (
            <Button
              onClick={handleSaveToCookbook}
              disabled={isSaving || isSaved}
              className={cn(
                "bg-primary text-white font-bold",
                isSaved && "bg-green-600 hover:bg-green-700"
              )}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : isSaved ? (
                null
              ) : (
                <BookMarked className="h-4 w-4 mr-2" />
              )}
              {isSaved ? 'Saved to Cookbook ✓' : 'Save to My Cookbook'}
            </Button>
          )}

          <Button
            variant="outline"
            onClick={handleShare}
            className="border-border text-muted-foreground hover:text-primary transition-colors"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Link
          </Button>

          {isOwner && (
            <Button
              variant="outline"
              onClick={handleRemoveFromExplore}
              className="border-destructive text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove from Explore
            </Button>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-8 mb-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Ingredients</h2>
        <ul className="space-y-2">
          {recipe.ingredients?.map((ingredient, index) => (
            <li key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-sm text-foreground">{ingredient}</span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-foreground hover:text-amber-600"
                    title="Add to shopping list"
                    onClick={() => handleAddToShoppingList(ingredient)}
                >
                    <ShoppingCart className="h-4 w-4" />
                </Button>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-card border border-border rounded-xl p-8">
        <h2 className="text-xl font-bold text-foreground mb-6">How to Cook</h2>
        <ol className="space-y-6">
          {recipe.steps?.map((step, index) => (
            <li key={index} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              <p className="text-sm text-foreground leading-relaxed pt-1">
                {step}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
