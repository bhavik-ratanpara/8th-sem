'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/firebase'
import { 
  getPublicRecipes,
  unshareRecipePublic,
  saveFromExplore,
  getSavedRecipes,
  type SavedRecipe 
} from '@/lib/save-recipe'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Filter, 
  Globe, 
  BookMarked,
  Trash2,
  ArrowRight,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function ExplorePage() {
  const { user } = useUser()
  const { toast } = useToast()
  
  const [recipes, setRecipes] = useState<SavedRecipe[]>([])
  const [filteredRecipes, setFilteredRecipes] = useState<SavedRecipe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dietFilter, setDietFilter] = useState<'All' | 'Vegetarian' | 'Non-Vegetarian'>('All')
  const [showMyShared, setShowMyShared] = useState(false)
  const [savingIds, setSavingIds] = useState<string[]>([])
  const [savedIds, setSavedIds] = useState<string[]>([])

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await getPublicRecipes()
        setRecipes(data)
        setFilteredRecipes(data)
      } catch (error) {
        console.error('Error fetching public recipes:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchRecipes()
  }, [])

  useEffect(() => {
    let result = recipes

    if (showMyShared && user) {
      result = result.filter(r => r.sharedBy === user.uid)
    }

    if (dietFilter !== 'All') {
      result = result.filter(r => r.dietType === dietFilter)
    }

    if (searchQuery.trim()) {
      result = result.filter(r =>
        r.recipeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredRecipes(result)
  }, [recipes, dietFilter, searchQuery, showMyShared, user])

  const handleRemoveFromExplore = async (recipe: SavedRecipe) => {
    if (!user || !recipe.id) return

    if (!window.confirm("Remove this recipe from Explore? It will still be in your My Recipes.")) return

    try {
      setRecipes(prev => prev.filter(r => r.id !== recipe.id))
      
      await unshareRecipePublic(user.uid, recipe.id)
      
      toast({
        title: "Removed from Explore",
        description: "Recipe still saved in My Recipes.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not remove. Try again.",
      })
    }
  }

  const handleSaveToCookbook = async (recipe: SavedRecipe) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to save recipes.",
      })
      return
    }

    if (!recipe.id) return
    
    // Check if already saved in current session
    if (isSaved(recipe.id)) {
      toast({
        title: "Already Saved",
        description: "This recipe is already in your cookbook.",
      })
      return
    }
    
    setSavingIds(prev => [...prev, recipe.id!])
    
    try {
      // Check in Firestore if already saved previously
      const existingRecipes = await getSavedRecipes(user.uid)
      const alreadySaved = existingRecipes.some(r => 
        r.originalSharedBy === recipe.sharedBy &&
        r.recipeName === recipe.recipeName
      )

      if (alreadySaved) {
        toast({
          title: "Already in Cookbook",
          description: "You already have this recipe saved.",
        })
        setSavedIds(prev => [...prev, recipe.id!])
        return
      }

      await saveFromExplore(
        user.uid,
        user.displayName || 'Chef',
        recipe
      )
      
      setSavedIds(prev => [...prev, recipe.id!])
      
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
      setSavingIds(prev => prev.filter(id => id !== recipe.id))
    }
  }

  const isOwner = (recipe: SavedRecipe) => user?.uid === recipe.sharedBy
  const isSaved = (recipeId: string) => savedIds.includes(recipeId)
  const isSaving = (recipeId: string) => savingIds.includes(recipeId)

  return (
    <div className="max-content px-4 py-12">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground" style={{ fontFamily: "Inter, sans-serif", fontWeight: 800 }}>
            Explore Recipes
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover recipes shared by the community
          </p>
        </div>
        {!isLoading && (
          <div className="text-sm font-semibold bg-secondary/50 px-4 py-2 rounded-full border border-border text-secondary-foreground">
            {recipes.length} recipes shared
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between mb-10 bg-card p-6 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
          
          {(['All', 'Vegetarian', 'Non-Vegetarian'] as const).map((filter) => (
            <Button
              key={filter}
              variant={dietFilter === filter && !showMyShared ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setDietFilter(filter)
                setShowMyShared(false)
              }}
              className={cn(
                "rounded-full px-5 h-9 text-xs font-semibold whitespace-nowrap",
                dietFilter === filter && !showMyShared ? "bg-primary text-white shadow-md" : "text-muted-foreground"
              )}
            >
              {filter}
            </Button>
          ))}

          {user && (
            <Button
              variant={showMyShared ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowMyShared(!showMyShared)}
              className={cn(
                "rounded-full px-5 h-9 text-xs font-semibold whitespace-nowrap",
                showMyShared ? "bg-primary text-white shadow-md" : "text-muted-foreground"
              )}
            >
              <Globe className="h-3 w-3 mr-1.5" />
              Shared by Me
            </Button>
          )}
        </div>

        <div className="relative w-full lg:w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search community recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-lg border-border focus:ring-primary/20 bg-background"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="group relative bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-xl hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
            >
              <div className="flex items-center gap-1.5 mb-3">
                <Globe className="h-3 w-3 text-primary" />
                <span className="text-[11px] text-muted-foreground">
                  Shared by{' '}
                  <span className={cn(
                    "font-semibold",
                    isOwner(recipe) ? "text-primary" : "text-foreground"
                  )}>
                    {isOwner(recipe) ? 'You' : recipe.sharedByName || 'Anonymous Chef'}
                  </span>
                </span>
              </div>

              <h3 className="font-bold text-lg text-foreground line-clamp-2 mb-4">
                {recipe.recipeName}
              </h3>

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
                  Shared on{' '}
                  {recipe.sharedAt?.toDate ? format(recipe.sharedAt.toDate(), 'dd MMM yyyy') : 'Recently'}
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-white font-bold h-9 px-5 rounded-lg flex-1 flex-shrink-0 whitespace-nowrap">
                    <Link href={`/explore/recipe/${recipe.id}`}>
                      View Recipe
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </Link>
                  </Button>

                  {!isOwner(recipe) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSaveToCookbook(recipe)}
                      disabled={isSaving(recipe.id!) || isSaved(recipe.id!)}
                      className={cn(
                        "h-9 px-3 rounded-md text-[13px] font-medium border transition-colors flex items-center gap-2 flex-shrink-0 whitespace-nowrap",
                        isSaved(recipe.id!) && "border-green-500 text-green-500 bg-green-500/10"
                      )}
                    >
                      {isSaving(recipe.id!) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isSaved(recipe.id!) ? (
                        <>
                          <BookMarked className="h-4 w-4" />
                          Saved ✓
                        </>
                      ) : (
                        <>
                          <BookMarked className="h-4 w-4" />
                          Save
                        </>
                      )}
                    </Button>
                  )}

                  {isOwner(recipe) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveFromExplore(recipe)}
                      className="h-9 px-3 border-destructive text-destructive hover:bg-destructive/10 rounded-lg flex-shrink-0 whitespace-nowrap"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-secondary/10 rounded-2xl border-2 border-dashed border-border">
          <div className="bg-secondary/20 p-6 rounded-full mb-6">
            <Globe className="h-12 w-12 text-muted-foreground/40" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            {showMyShared ? "You haven't shared any recipes yet" : "No recipes shared yet"}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-sm">
            {showMyShared ? "Go to My Recipes and share your recipes with the community!" : "Be the first to share a recipe with the community!"}
          </p>
          <Button asChild className="bg-primary text-white font-bold h-12 px-8 rounded-xl">
            <Link href={showMyShared ? "/history" : "/"}>
              {showMyShared ? "Go to My Recipes" : "Generate a Recipe"}
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
