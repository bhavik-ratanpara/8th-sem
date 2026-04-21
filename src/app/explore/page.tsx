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
  const [sortBy, setSortBy] = useState<'latest' | 'mostLiked'>('latest')

  const [selectedLanguage, setSelectedLanguage] = useState<string>('All')
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([])
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false)
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false)

  // Pagination states
  const CARDS_PER_PAGE = 12
  const [visibleCount, setVisibleCount] = useState(CARDS_PER_PAGE)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

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

  // Reset pagination on filter change
  useEffect(() => {
    setVisibleCount(CARDS_PER_PAGE)
  }, [dietFilter, sortBy, selectedLanguage, showMyShared, searchQuery])

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
        variant: 'destructive',
      })
      return
    }

    const recipeId = recipe.id
    const alreadyLiked = (recipe.likedBy || [])
      .includes(user.uid)

    // STEP 1 — Update UI instantly
    // Before calling Firestore
    setRecipes(prev => prev.map(r => {
      if (r.id !== recipeId) return r
      return {
        ...r,
        likes: alreadyLiked
          ? Math.max(0, (r.likes || 0) - 1)
          : (r.likes || 0) + 1,
        likedBy: alreadyLiked
          ? (r.likedBy || []).filter(
            (id: string) => id !== user.uid
          )
          : [...(r.likedBy || []), user.uid],
      }
    }))

    // STEP 2 — Update Firestore in background
    try {
      await toggleRecipeLike(recipeId, user.uid)
    } catch (error) {
      // STEP 3 — If Firestore fails revert UI
      setRecipes(prev => prev.map(r => {
        if (r.id !== recipeId) return r
        return {
          ...r,
          likes: alreadyLiked
            ? (r.likes || 0) + 1
            : Math.max(0, (r.likes || 0) - 1),
          likedBy: alreadyLiked
            ? [...(r.likedBy || []), user.uid]
            : (r.likedBy || []).filter(
              (id: string) => id !== user.uid
            ),
        }
      }))
      toast({
        title: 'Failed to update like',
        variant: 'destructive',
      })
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

  // Count active filters for mobile badge
  const activeFilterCount = [
    sortBy !== 'latest',
    selectedLanguage !== 'All',
    showMyShared,
    dietFilter !== 'All'
  ].filter(Boolean).length

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

        <div className="flex flex-col gap-6 mb-10 bg-card p-4 md:p-6 rounded-xl border border-border shadow-sm relative overflow-visible">
          {/* DESKTOP FILTER BAR */}
          <div className="hidden md:flex items-center gap-1.5 overflow-visible relative">
            {(['All', 'Vegetarian', 'Non-Vegetarian'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setDietFilter(filter)}
                className={cn(
                  "text-[12px] px-2.5 py-1 rounded-[6px] border font-medium whitespace-nowrap transition-all duration-200",
                  dietFilter === filter
                    ? "border-primary text-primary bg-primary/10"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {filter === 'All' ? 'All' : filter === 'Vegetarian' ? 'Veg' : 'Non-Veg'}
              </button>
            ))}

            <div className="w-[1px] h-4 bg-border mx-1 flex-shrink-0" />

            {user && (
              <button
                onClick={() => setShowMyShared(!showMyShared)}
                className={cn(
                  "text-[12px] px-2.5 py-1 rounded-[6px] border font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-1.5",
                  showMyShared
                    ? "border-primary text-primary bg-primary/10"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                <Globe className="h-3 w-3" />
                Shared by Me
              </button>
            )}

            <button
              onClick={() => setSortBy(sortBy === 'latest' ? 'mostLiked' : 'latest')}
              className={cn(
                "text-[12px] px-2.5 py-1 rounded-[6px] border font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-1.5",
                sortBy === 'mostLiked'
                  ? "border-primary text-primary bg-primary/10"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <Heart className={cn("h-3 w-3", sortBy === 'mostLiked' && "fill-current")} />
              Most Liked
            </button>

            {/* Language dropdown */}
            <div className="relative">
              <button
                onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                className={cn(
                  "text-[12px] px-2.5 py-1 rounded-[6px] border font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-1.5",
                  selectedLanguage !== 'All'
                    ? "border-primary text-primary bg-primary/10"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                <Globe className="h-3.5 w-3.5" />
                {selectedLanguage === 'All' ? 'Language' : selectedLanguage}
                <ChevronDown className={cn("h-3 w-3 transition-transform", languageDropdownOpen && "rotate-180")} />
              </button>

              {languageDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLanguageDropdownOpen(false)} />
                  <div className="absolute top-full left-0 mt-1.5 bg-card border border-border rounded-lg shadow-xl z-50 min-w-[160px] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <button
                      onClick={() => { setSelectedLanguage('All'); setLanguageDropdownOpen(false); }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-[13px] transition-colors",
                        selectedLanguage === 'All' ? "bg-primary/5 text-primary font-semibold" : "text-foreground hover:bg-secondary/50"
                      )}
                    >
                      All Languages
                    </button>
                    <div className="h-px bg-border" />
                    {availableLanguages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => { setSelectedLanguage(lang); setLanguageDropdownOpen(false); }}
                        className={cn(
                          "w-full text-left px-3 py-2 text-[13px] transition-colors",
                          selectedLanguage === lang ? "bg-primary/5 text-primary font-semibold" : "text-foreground hover:bg-secondary/50"
                        )}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="relative flex-1 max-w-[280px] ml-auto">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-[12px] bg-background border-border"
              />
            </div>
          </div>

          {/* MOBILE FILTER BAR */}
          <div className="flex md:hidden items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => {
                setDietFilter('All');
                setSortBy('latest');
                setSelectedLanguage('All');
                setShowMyShared(false);
              }}
              className={cn(
                "text-xs px-3 py-1.5 rounded-md border whitespace-nowrap flex-shrink-0 transition-colors duration-150",
                "hidden min-[400px]:block",
                dietFilter === 'All' && sortBy === 'latest' && selectedLanguage === 'All' && !showMyShared
                  ? "border-primary text-primary bg-primary/10"
                  : "border-border text-muted-foreground"
              )}
            >
              All
            </button>
            <button
              onClick={() => setDietFilter('Vegetarian')}
              className={cn(
                "text-xs px-3 py-1.5 rounded-md border whitespace-nowrap flex-shrink-0 transition-colors duration-150",
                "hidden min-[400px]:block",
                dietFilter === 'Vegetarian' ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground"
              )}
            >
              Veg
            </button>
            <button
              onClick={() => setDietFilter('Non-Vegetarian')}
              className={cn(
                "text-xs px-3 py-1.5 rounded-md border whitespace-nowrap flex-shrink-0 transition-colors duration-150",
                "hidden min-[400px]:block",
                dietFilter === 'Non-Vegetarian' ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground"
              )}
            >
              Non-Veg
            </button>
            <button
              onClick={() => setBottomSheetOpen(true)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-md border whitespace-nowrap flex-shrink-0 transition-colors duration-150 flex items-center gap-1.5",
                "w-full min-[400px]:w-auto ml-auto justify-center",
                activeFilterCount > 0
                  ? "border-primary text-primary bg-primary/10"
                  : "border-border text-muted-foreground"
              )}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-primary text-primary-foreground rounded-full text-[9px] font-bold px-1.5 py-0.5 ml-0.5">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          <div className="md:hidden relative w-full mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search community recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-lg border-border bg-background"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : sortedRecipes.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedRecipes.slice(0, visibleCount).map((recipe) => (
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
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          color: (recipe.likedBy || [])
                            .includes(user?.uid || '')
                            ? '#ef4444'
                            : 'hsl(var(--muted-foreground))',
                        }}
                      >
                        <Heart
                          style={{
                            width: '16px',
                            height: '16px',
                            fill: (recipe.likedBy || [])
                              .includes(user?.uid || '')
                              ? '#ef4444'
                              : 'none',
                            stroke: 'currentColor',
                            transition: 'all 0.15s ease',
                          }}
                        />
                        <span style={{
                          fontSize: '12px',
                          fontWeight: 500,
                          minWidth: '12px',
                        }}>
                          {recipe.likes || 0}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            {visibleCount < filteredRecipes.length && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '32px',
                marginBottom: '16px',
              }}>
                <button
                  onClick={async () => {
                    setIsLoadingMore(true)
                    await new Promise(resolve => setTimeout(resolve, 600))
                    setVisibleCount(prev => prev + CARDS_PER_PAGE)
                    setIsLoadingMore(false)
                  }}
                  disabled={isLoadingMore}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 28px',
                    borderRadius: '8px',
                    border: '0.5px solid hsl(var(--border))',
                    background: 'transparent',
                    color: 'hsl(var(--foreground))',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: isLoadingMore ? 'not-allowed' : 'pointer',
                    opacity: isLoadingMore ? 0.7 : 1,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isLoadingMore ? (
                    <>
                      <svg
                        width="14" height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{
                          animation: 'spin 1s linear infinite'
                        }}
                      >
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      Loading...
                    </>
                  ) : (
                    <>
                      Load More
                      <span style={{
                        fontSize: '11px',
                        color: 'hsl(var(--muted-foreground))',
                        background: 'hsl(var(--muted))',
                        padding: '1px 6px',
                        borderRadius: '999px',
                      }}>
                        {Math.min(CARDS_PER_PAGE, filteredRecipes.length - visibleCount)} more
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Showing count info */}
            {filteredRecipes.length > 0 && (
              <p style={{
                textAlign: 'center',
                fontSize: '12px',
                color: 'hsl(var(--muted-foreground))',
                marginTop: '8px',
                marginBottom: '32px',
              }}>
                Showing {Math.min(visibleCount, filteredRecipes.length)} of {filteredRecipes.length} recipes
              </p>
            )}
          </>
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

      {/* ── MOBILE BOTTOM SHEET ── */}
      {bottomSheetOpen && (
        <>
          <div
            onClick={() => setBottomSheetOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
          />
          <div
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              background: 'hsl(var(--background))',
              borderRadius: '16px 16px 0 0',
              borderTop: '0.5px solid hsl(var(--border))',
              zIndex: 50, padding: '0 0 32px 0'
            }}
          >
            <div style={{ width: '32px', height: '3px', background: 'hsl(var(--muted))', borderRadius: '999px', margin: '12px auto 0' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px', borderBottom: '0.5px solid hsl(var(--border))' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'hsl(var(--foreground))' }}>Filters</span>
              <button onClick={() => setBottomSheetOpen(false)} style={{ fontSize: '18px', color: 'hsl(var(--muted-foreground))', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px' }}>×</button>
            </div>
            <div style={{ padding: '16px 20px' }}>
              {/* Diet Type (Hidden Chips on main bar for narrow screens) */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', marginBottom: '10px' }}>Diet Type</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['All', 'Vegetarian', 'Non-Vegetarian'] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDietFilter(d)}
                      style={{
                        fontSize: '13px',
                        padding: '7px 14px',
                        borderRadius: '8px',
                        border: '0.5px solid',
                        borderColor: dietFilter === d ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                        color: dietFilter === d ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                        background: dietFilter === d ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                        cursor: 'pointer'
                      }}
                    >
                      {d === 'All' ? 'All' : d === 'Vegetarian' ? 'Veg' : 'Non-Veg'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', marginBottom: '10px' }}>Sort by</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setSortBy('latest')} style={{ fontSize: '13px', padding: '7px 14px', borderRadius: '8px', border: '0.5px solid', borderColor: sortBy === 'latest' ? 'hsl(var(--primary))' : 'hsl(var(--border))', color: sortBy === 'latest' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))', background: sortBy === 'latest' ? 'hsl(var(--primary) / 0.1)' : 'transparent', cursor: 'pointer' }}>Latest</button>
                  <button onClick={() => setSortBy('mostLiked')} style={{ fontSize: '13px', padding: '7px 14px', borderRadius: '8px', border: '0.5px solid', borderColor: sortBy === 'mostLiked' ? 'hsl(var(--primary))' : 'hsl(var(--border))', color: sortBy === 'mostLiked' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))', background: sortBy === 'mostLiked' ? 'hsl(var(--primary) / 0.1)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>♥ Most Liked</button>
                </div>
              </div>
              {user && (
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', marginBottom: '10px' }}>My Content</p>
                  <button onClick={() => setShowMyShared(!showMyShared)} style={{ fontSize: '13px', padding: '7px 14px', borderRadius: '8px', border: '0.5px solid', borderColor: showMyShared ? 'hsl(var(--primary))' : 'hsl(var(--border))', color: showMyShared ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))', background: showMyShared ? 'hsl(var(--primary) / 0.1)' : 'transparent', cursor: 'pointer' }}>Shared by Me</button>
                </div>
              )}
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', marginBottom: '10px' }}>Language</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <button onClick={() => setSelectedLanguage('All')} style={{ fontSize: '13px', padding: '7px 14px', borderRadius: '8px', border: '0.5px solid', borderColor: selectedLanguage === 'All' ? 'hsl(var(--primary))' : 'hsl(var(--border))', color: selectedLanguage === 'All' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))', background: selectedLanguage === 'All' ? 'hsl(var(--primary) / 0.1)' : 'transparent', cursor: 'pointer' }}>All</button>
                  {availableLanguages.map(lang => (
                    <button key={lang} onClick={() => setSelectedLanguage(lang)} style={{ fontSize: '13px', padding: '7px 14px', borderRadius: '8px', border: '0.5px solid', borderColor: selectedLanguage === lang ? 'hsl(var(--primary))' : 'hsl(var(--border))', color: selectedLanguage === lang ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))', background: selectedLanguage === lang ? 'hsl(var(--primary) / 0.1)' : 'transparent', cursor: 'pointer' }}>{lang}</button>
                  ))}
                </div>
              </div>
              <button onClick={() => setBottomSheetOpen(false)} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Apply Filters</button>
              {(dietFilter !== 'All' || sortBy !== 'latest' || selectedLanguage !== 'All' || showMyShared) && (
                <button
                  onClick={() => { setDietFilter('All'); setSortBy('latest'); setSelectedLanguage('All'); setShowMyShared(false); setBottomSheetOpen(false); }}
                  style={{ width: '100%', padding: '10px', marginTop: '8px', borderRadius: '10px', background: 'transparent', color: 'hsl(var(--muted-foreground))', fontSize: '13px', fontWeight: 500, border: '0.5px solid hsl(var(--border))', cursor: 'pointer' }}
                >
                  Reset All Filters
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
