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
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  BookMarked, 
  Trash2, 
  Globe,
  Loader2,
  Share2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

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
        onClick={() => router.push('/explore')}
        className="flex items-center gap-2 text-primary font-bold text-sm mb-10 hover:translate-x-[-4px] transition-transform"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Explore
      </button>

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
          <p className="text-[14px] font-medium text-muted-foreground">
            {recipe.cuisine} · {recipe.servings} Servings ·{' '}
            <span className={cn(
              "font-semibold",
              recipe.dietType === 'Vegetarian' 
                ? "text-green-600 dark:text-green-400" 
                : "text-red-600 dark:text-red-400"
            )}>
              {recipe.dietType}
            </span>
          </p>
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
            <li key={index} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
              <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span className="text-sm text-foreground">{ingredient}</span>
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
