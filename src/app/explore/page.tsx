'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/firebase'
import { 
  getPublicRecipes,
  unshareRecipePublic,
  saveFromExplore,
  getSavedRecipes,
  toggleRecipeLike,
  isRecipeLikedByUser,
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
  ArrowLeft,
  Loader2,
  Share2,
  Heart,
  ChevronDown
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { FoodDecorations } from '@/components/FoodDecorations'

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
  const [userSavedIds, setUserSavedIds] = useState<string[]>([])
  const [likingId, setLikingId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'latest' | 'mostLiked'>('latest')

  const [selectedLanguage, setSelectedLanguage] = useState<string>('All')
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([])
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false)

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

  useEffect(() => {
    fetchRecipes()
  }, [])

  useEffect(() => {
    if (recipes.length === 0) return
    
    const languages = Array.from(
      new Set(
        recipes
          .map(r => r.language)
          .filter(Boolean)
      )
    ).sort() as string[]
    
    setAvailableLanguages(languages)
  }, [recipes])

  // Fetch user's saved recipes to mark already saved items
  useEffect(() => {
    const fetchUserSaved = async () => {
      if (!user) return
      try {
        const saved = await getSavedRecipes(user.uid)
        const ids = saved
          .filter(r => r.savedFromExplore)
          .map(r => r.originalRecipeId)
          .filter(Boolean) as string[]
        setUserSavedIds(ids)
      } catch (error) {
        console.error('Error fetching user saved recipes:', error)
      }
    }
    fetchUserSaved()
  }, [user])

  useEffect(() => {
    let result = recipes

    if (showMyShared && user) {
      result = result.filter(r => r.sharedBy === user.uid)
    }

    if (dietFilter !== 'All') {
      result = result.filter(r => r.dietType === dietFilter)
    }

    if (selectedLanguage !== 'All') {
      result = result.filter(r => r.language === selectedLanguage)
    }

    if (searchQuery.trim()) {
      result = result.filter(r =>
        r.recipeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredRecipes(result)
  }, [recipes, dietFilter, searchQuery, showMyShared, user, selectedLanguage])

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
    if (isAlreadySaved(recipe.id)) {
      toast({
        title: "Already Saved",
        description: "This recipe is already in your cookbook.",
      })
      return
    }
    
    setSavingIds(prev => [...prev, recipe.id!])
    
    try {
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

  const handleLike = async (recipe: any) => {
    if (!user) {
      toast({
        title: 'Sign in to like recipes',
        variant: 'destructive'
      })
      return
    }

    if (likingId) return

    const alreadyLiked = isRecipeLikedByUser(
      recipe, user.uid
    )

    // UPDATE UI INSTANTLY — dont wait server
    setRecipes(prev => prev.map(r => {
      if (r.id !== recipe.id) return r
      return {
        ...r,
        likes: alreadyLiked
          ? Math.max(0, (r.likes || 0) - 1)
          : (r.likes || 0) + 1,
        likedBy: alreadyLiked
          ? (r.likedBy || []).filter(
              (id: string) => id !== user.uid
            )
          : [...(r.likedBy || []), user.uid]
      }
    }))

    // THEN update server in background
    setLikingId(recipe.id)
    try {
      await toggleRecipeLike(recipe.id, user.uid)
    } catch (error) {
      // If server fails — revert UI back
      setRecipes(prev => prev.map(r => {
        if (r.id !== recipe.id) return r
        return {
          ...r,
          likes: alreadyLiked
            ? (r.likes || 0) + 1
            : Math.max(0, (r.likes || 0) - 1),
          likedBy: alreadyLiked
            ? [...(r.likedBy || []), user.uid]
            : (r.likedBy || []).filter(
                (id: string) => id !== user.uid
              )
        }
      }))
      toast({
        title: 'Failed to like recipe',
        variant: 'destructive'
      })
    } finally {
      setLikingId(null)
    }
  }

  const handleShare = async (recipeId: string, isExplore: boolean) => {
    const baseUrl = window.location.origin;
    const shareUrl = isExplore
      ? `${baseUrl}/explore/recipe/${recipeId}`
      : `${baseUrl}/recipe/${recipeId}`;

    const shareData = {
      title: 'Check out this recipe on Cooking Lab!',
      text: 'I found this amazing recipe on Cooking Lab — AI powered recipe generator!',
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
    } catch (error) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied! 🔗",
          description: "Recipe link copied to clipboard.",
          duration: 2000,
        });
      } catch {
        toast({
          variant: "destructive",
          title: "Could not share",
          description: "Please copy the link manually.",
        });
      }
    }
  };

  const isOwner = (recipe: SavedRecipe) => user?.uid === recipe.sharedBy
  const isSaving = (recipeId: string) => savingIds.includes(recipeId)
  
  const isAlreadySaved = (recipeId: string) => {
    return userSavedIds.includes(recipeId) || savedIds.includes(recipeId)
  }

  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    if (sortBy === 'mostLiked') {
      return (b.likes || 0) - (a.likes || 0)
    }
    // Default latest first
    const timeA = a.sharedAt?.seconds || 0
    const timeB = b.sharedAt?.seconds || 0
    return timeB - timeA
  })

  return (
    <div className="relative min-h-screen overflow-hidden">
      <FoodDecorations />
      <div className="max-content px-4 py-12 relative z-10">
        <Link 
          href="/"
          className="flex items-center gap-2 text-primary font-bold text-sm mb-10 hover:translate-x-[-4px] transition-transform w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Generator
        </Link>
        
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

        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between mb-10 bg-card p-6 rounded-xl border border-border shadow-sm relative overflow-visible">
          <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap overflow-visible relative">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            
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

            <div className="h-6 w-px bg-border hidden md:block" />

            <Button
              variant={sortBy === 'mostLiked' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy(sortBy === 'latest' ? 'mostLiked' : 'latest')}
              className={cn(
                "rounded-full px-5 h-9 text-xs font-semibold whitespace-nowrap",
                sortBy === 'mostLiked' ? "bg-primary text-white shadow-md" : "text-muted-foreground"
              )}
            >
              <Heart className={cn("h-3 w-3 mr-1.5", sortBy === 'mostLiked' && "fill-current")} />
              Most Liked
            </Button>

            {/* Language dropdown wrapper */}
            <div className="relative">
              <button
                onClick={() => 
                  setLanguageDropdownOpen(!languageDropdownOpen)
                }
                className={cn(
                  "flex items-center gap-2",
                  "px-3 py-1.5 rounded-md",
                  "text-sm font-medium border",
                  "transition-all duration-200",
                  selectedLanguage !== 'All'
                    ? "border-primary text-primary bg-primary/10"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                <Globe className="h-4 w-4" />
                {selectedLanguage === 'All' 
                  ? 'Language' 
                  : selectedLanguage
                }
                {selectedLanguage !== 'All' && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedLanguage('All')
                    }}
                    className="
                      ml-1 text-xs hover:text-destructive
                      transition-colors
                    "
                  >
                    ×
                  </span>
                )}
                <ChevronDown 
                  className="h-3 w-3"
                  style={{
                    transform: languageDropdownOpen 
                      ? 'rotate(180deg)' 
                      : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }}
                />
              </button>

              {/* Dropdown menu */}
              {languageDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setLanguageDropdownOpen(false)}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      marginTop: '6px',
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      zIndex: 50,
                      minWidth: '160px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                      overflow: 'hidden',
                    }}
                  >
                    <button
                      onClick={() => {
                        setSelectedLanguage('All')
                        setLanguageDropdownOpen(false)
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 14px',
                        fontSize: '13px',
                        color: selectedLanguage === 'All'
                          ? 'hsl(var(--primary))'
                          : 'hsl(var(--foreground))',
                        fontWeight: selectedLanguage === 'All'
                          ? 600 : 400,
                        backgroundColor: selectedLanguage === 'All'
                          ? 'hsl(var(--primary) / 0.05)'
                          : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '0',
                      }}
                      className="hover:bg-secondary/50 transition-colors"
                    >
                      All Languages
                    </button>

                    <div style={{
                      height: '1px',
                      background: 'hsl(var(--border))',
                      margin: '0',
                    }}/>

                    {availableLanguages.length === 0 ? (
                      <div style={{
                        padding: '10px 14px',
                        fontSize: '13px',
                        color: 'hsl(var(--muted-foreground))',
                      }}>
                        No languages found
                      </div>
                    ) : (
                      availableLanguages.map((lang) => (
                        <button
                          key={lang}
                          onClick={() => {
                            setSelectedLanguage(lang)
                            setLanguageDropdownOpen(false)
                          }}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '10px 14px',
                            fontSize: '13px',
                            color: selectedLanguage === lang
                              ? 'hsl(var(--primary))'
                              : 'hsl(var(--foreground))',
                            fontWeight: selectedLanguage === lang
                              ? 600 : 400,
                            backgroundColor: selectedLanguage === lang
                              ? 'hsl(var(--primary) / 0.05)'
                              : 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'block',
                          }}
                          className="hover:bg-secondary/50 transition-colors"
                        >
                          {lang}
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
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
        ) : sortedRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="group relative bg-card border border-border rounded-lg p-5 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-1.5">
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
                  <button
                    onClick={() => recipe.id && handleShare(recipe.id, true)}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    title="Share recipe link"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>

                <h3 className="font-bold text-base text-foreground line-clamp-2 mb-2 pr-2">
                  {recipe.recipeName}
                </h3>

                <div className="mb-4">
                  <p className="text-[13px] font-medium text-muted-foreground">
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

                <div className="mt-auto space-y-4">
                  <p className="text-[11px] text-muted-foreground font-medium">
                    Shared on{' '}
                    {recipe.sharedAt?.toDate ? format(recipe.sharedAt.toDate(), 'dd MMM yyyy') : 'Recently'}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-white font-bold h-9 px-4 rounded-md flex-1 flex-shrink-0 whitespace-nowrap">
                      <Link href={`/explore/recipe/${recipe.id}`}>
                        View Recipe
                        <ArrowRight className="ml-1.5 h-3 w-3" />
                      </Link>
                    </Button>

                    {!isOwner(recipe) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => !isAlreadySaved(recipe.id!) && handleSaveToCookbook(recipe)}
                        disabled={isSaving(recipe.id!) || isAlreadySaved(recipe.id!)}
                        className={cn(
                          "h-9 px-3 rounded-md text-[13px] font-medium border transition-colors flex items-center gap-2 flex-shrink-0 whitespace-nowrap",
                          isAlreadySaved(recipe.id!)
                            ? "border-green-500 text-green-500 bg-green-500/10 cursor-not-allowed"
                            : "border-border text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {isSaving(recipe.id!) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isAlreadySaved(recipe.id!) ? (
                          <>
                            <BookMarked className="h-4 w-4 mr-1" />
                            Saved ✓
                          </>
                        ) : (
                          <>
                            <BookMarked className="h-4 w-4 mr-1" />
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
                        className="h-9 px-3 border-destructive text-destructive hover:bg-destructive/10 rounded-md flex-shrink-0 whitespace-nowrap"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLike(recipe)
                      }}
                      disabled={likingId === recipe.id}
                      className={cn(
                        "flex items-center gap-1.5 h-9 px-3 py-1.5",
                        "rounded-md text-[13px] font-medium transition-all duration-200 border",
                        isRecipeLikedByUser(recipe, user?.uid || '')
                          ? "text-red-500 bg-red-500/10 border-red-500/20"
                          : "text-muted-foreground border-border hover:text-red-500 hover:bg-red-500/5 hover:border-red-500/20"
                      )}
                    >
                      {likingId === recipe.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Heart
                          className="h-4 w-4"
                          fill={
                            isRecipeLikedByUser(recipe, user?.uid || '')
                              ? 'currentColor'
                              : 'none'
                          }
                        />
                      )}
                      <span className="tabular-nums">
                        {recipe.likes || 0}
                      </span>
                    </button>
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
    </div>
  )
}
