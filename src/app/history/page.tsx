
'use client';

import { useState, useEffect, Suspense } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { useUser } from '@/firebase';
import { getSavedRecipes, deleteRecipe, toggleFavourite, shareRecipePublic, unshareRecipePublic, type SavedRecipe } from '@/lib/save-recipe';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Trash2, Search, BookMarked, Filter, ArrowRight, ArrowLeft, Globe, Loader2, Share2, X } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { FoodDecorations } from '@/components/FoodDecorations';

function HistoryContent() {
  const { user } = useUser();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<SavedRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dietFilter, setDietFilter] = useState<'All' | 'Vegetarian' | 'Non-Vegetarian'>('All');

  // Share prompt states
  const [showSharePrompt, setShowSharePrompt] = useState(false);
  const [sharePromptRecipe, setSharePromptRecipe] = useState<SavedRecipe | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  // Pagination states
  const RECIPES_PER_PAGE = 12
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchRecipes = async () => {
      if (!user) return;
      try {
        const data = await getSavedRecipes(user.uid);
        setRecipes(data);
        
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
    
    if (dietFilter !== 'All') {
      result = result.filter(r => r.dietType === dietFilter);
    }
    
    if (searchQuery.trim()) {
      result = result.filter(r => 
        r.recipeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (searchParams.get('filter') === 'favourite') {
      result = result.filter(r => r.isFavourite);
    }

    setFilteredRecipes(result);
  }, [recipes, dietFilter, searchQuery, searchParams]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [dietFilter, searchQuery, searchParams]);

  const totalPages = Math.ceil(filteredRecipes.length / RECIPES_PER_PAGE)
  const paginatedRecipes = filteredRecipes.slice(
    (currentPage - 1) * RECIPES_PER_PAGE,
    currentPage * RECIPES_PER_PAGE
  )

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

  const handleToggleShare = async (recipe: SavedRecipe) => {
    if (!user || !recipe.id) return;
    
    try {
      if (recipe.isPublic) {
        if (!window.confirm("Remove this recipe from Explore? It will still be in your My Recipes.")) return;
        
        // Optimistic UI
        setRecipes(prev => prev.map(r => 
          r.id === recipe.id ? { ...r, isPublic: false } : r
        ));
        
        await unshareRecipePublic(user.uid, recipe.id);
        
        toast({
          title: "Removed from Explore",
          description: "Recipe still saved in My Recipes.",
        });
      } else {
        // Optimistic UI
        setRecipes(prev => prev.map(r => 
          r.id === recipe.id ? { ...r, isPublic: true } : r
        ));
        
        await shareRecipePublic(
          user.uid,
          user.displayName || 'Anonymous Chef',
          recipe.id,
          recipe
        );
        
        toast({
          title: "Recipe Shared! 🌍",
          description: "Your recipe is now in Explore.",
        });
      }
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Could not update. Try again." 
      });
    }
  };

  const handleShare = async (recipe: SavedRecipe) => {
    if (!recipe.id) return;

    const baseUrl = window.location.origin;

    // Type 2 — Saved from Explore
    // Recipe is already public
    // Share the original explore link directly
    if (recipe.savedFromExplore) {
      const shareUrl = `${baseUrl}/explore/recipe/${recipe.originalRecipeId || recipe.id}`;
      
      const shareData = {
        title: `${recipe.recipeName} — Cooking Lab`,
        text: `Check out this amazing recipe on Cooking Lab!`,
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
            description: "Please try again.",
          });
        }
      }
      return;
    }

    // Type 1 — User's own recipe
    // Check if already shared to Explore
    if (recipe.isPublic) {
      // Already public — share explore link directly
      const shareUrl = `${baseUrl}/explore/recipe/${recipe.id}`;
      
      const shareData = {
        title: `${recipe.recipeName} — Cooking Lab`,
        text: `Check out this amazing recipe on Cooking Lab!`,
        url: shareUrl,
      };

      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          await navigator.clipboard.writeText(shareUrl);
          toast({
            title: "Link Copied! 🔗",
            description: "Public recipe link copied.",
            duration: 2000,
          });
        }
      } catch {
        try {
          await navigator.clipboard.writeText(shareUrl);
          toast({
            title: "Link Copied! 🔗",
            description: "Public recipe link copied.",
            duration: 2000,
          });
        } catch {
          toast({
            variant: "destructive",
            title: "Could not share",
            description: "Please try again.",
          });
        }
      }
      return;
    }

    // Type 1 — Own recipe but NOT public yet
    // Show modal to publish to Explore first
    setSharePromptRecipe(recipe);
    setShowSharePrompt(true);
  };

  const handleShareToExploreAndShare = async () => {
    if (!user || !sharePromptRecipe?.id) return;
    
    setIsSharing(true);
    
    try {
      // Step 1 — Share to Explore first
      await shareRecipePublic(
        user.uid,
        user.displayName || 'Anonymous Chef',
        sharePromptRecipe.id,
        sharePromptRecipe
      );
      
      // Step 2 — Update local state
      setRecipes(prev => prev.map(r =>
        r.id === sharePromptRecipe.id
          ? { ...r, isPublic: true }
          : r
      ));
      
      // Step 3 — Close modal
      setShowSharePrompt(false);
      
      // Step 4 — Share the public explore link
      const shareUrl = `${window.location.origin}/explore/recipe/${sharePromptRecipe.id}`;
      
      const shareData = {
        title: `${sharePromptRecipe.recipeName} — Cooking Lab`,
        text: `Check out this amazing recipe on Cooking Lab!`,
        url: shareUrl,
      };

      toast({
        title: "Recipe Shared to Explore! 🌍",
        description: "Now sharing the public link...",
        duration: 2000,
      });

      setTimeout(async () => {
        try {
          if (navigator.share) {
            await navigator.share(shareData);
          } else {
            await navigator.clipboard.writeText(shareUrl);
            toast({
              title: "Link Copied! 🔗",
              description: "Public recipe link copied.",
              duration: 2000,
            });
          }
        } catch {
          await navigator.clipboard.writeText(shareUrl);
          toast({
            title: "Link Copied! 🔗",
            description: "Public recipe link copied.",
            duration: 2000,
          });
        }
      }, 500);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Could not share",
        description: "Please try again.",
      });
    } finally {
      setIsSharing(false);
      setSharePromptRecipe(null);
    }
  };

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
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground" style={{ fontFamily: "Inter, sans-serif", fontWeight: 800 }}>My Recipes</h1>
            <p className="text-muted-foreground text-lg">All your saved recipes in one place</p>
          </div>
          {!isLoading && (
            <div className="text-sm font-semibold bg-secondary/50 px-4 py-2 rounded-full border border-border text-secondary-foreground">
              {recipes.length} recipes saved
            </div>
          )}
        </div>

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

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-card border border-border rounded-lg p-5 space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-5 rounded-full" />
                </div>
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
                <div className="flex gap-3 pt-4">
                  <Skeleton className="h-9 w-24 rounded-md" />
                  <Skeleton className="h-9 w-24 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredRecipes.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedRecipes.map((recipe) => (
                <div 
                  key={recipe.id}
                  className="group relative bg-card border border-border rounded-lg p-5 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 flex flex-col h-full"
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <h3 className="font-bold text-base text-foreground line-clamp-2 pr-2">{recipe.recipeName}</h3>
                    <div className="flex gap-2 items-center shrink-0">
                      <button 
                        onClick={() => recipe.id && handleToggleFav(recipe.id, recipe.isFavourite)}
                        className="transition-transform active:scale-125"
                      >
                        <Star 
                          className={cn(
                            "h-5 w-5 transition-colors", 
                            recipe.isFavourite ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/40 hover:text-yellow-400"
                          )} 
                        />
                      </button>
                      <button
                        onClick={() => handleShare(recipe)}
                        className="text-muted-foreground/40 hover:text-primary transition-colors"
                        title="Share recipe link"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
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
                    {recipe.savedFromExplore && (
                      <p className="text-[11px] text-muted-foreground mt-1">
                        By{' '}
                        <span className="text-primary font-semibold">
                          {recipe.originalSharedByName || 'Anonymous Chef'}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="mt-auto">
                    <p className="text-[11px] text-muted-foreground mb-3">
                      Saved on {recipe.generatedAt?.toDate ? format(recipe.generatedAt.toDate(), 'dd MMM yyyy') : 'Recently'}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-white font-bold h-9 px-4 rounded-md">
                        <Link href={`/recipe/${recipe.id}`}>
                          View Recipe
                          <ArrowRight className="ml-1.5 h-3 w-3" />
                        </Link>
                      </Button>
                      
                      {!recipe.savedFromExplore && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleShare(recipe)}
                          className={cn(
                            "h-9 px-3 rounded-md text-[13px] font-medium border transition-colors flex items-center gap-2 flex-shrink-0 whitespace-nowrap",
                            recipe.isPublic
                              ? "bg-blue-500/10 border-blue-500 text-blue-500 hover:bg-blue-500/20"
                              : "bg-transparent border-border text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <Globe className={cn(
                            "h-4 w-4", 
                            recipe.isPublic && "fill-current"
                          )} />
                          {recipe.isPublic ? 'Shared ✓' : 'Share to Public'}
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex justify-end mt-3">
                      <button 
                        onClick={() => recipe.id && handleDelete(recipe.id)}
                        className="text-muted-foreground/40 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                marginTop: '32px',
                marginBottom: '32px',
                flexWrap: 'wrap',
              }}>
                {/* Previous button */}
                <button
                  onClick={() => {
                    setCurrentPage(p => Math.max(1, p - 1))
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={currentPage === 1}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '6px',
                    border: '0.5px solid hsl(var(--border))',
                    background: 'transparent',
                    color: currentPage === 1 ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))',
                    fontSize: '13px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.4 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6"/>
                  </svg>
                  Prev
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                  const isFirst = page === 1
                  const isLast = page === totalPages
                  const isCurrent = page === currentPage
                  const isNearCurrent = Math.abs(page - currentPage) <= 1

                  if (!isFirst && !isLast && !isNearCurrent) {
                    if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} style={{ padding: '7px 4px', fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>
                          ...
                        </span>
                      )
                    }
                    return null
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => {
                        setCurrentPage(page)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '6px',
                        border: '0.5px solid',
                        borderColor: isCurrent ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                        background: isCurrent ? 'hsl(var(--primary))' : 'transparent',
                        color: isCurrent ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
                        fontSize: '13px',
                        fontWeight: isCurrent ? 600 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {page}
                    </button>
                  )
                })}

                {/* Next button */}
                <button
                  onClick={() => {
                    setCurrentPage(p => Math.min(totalPages, p + 1))
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '6px',
                    border: '0.5px solid hsl(var(--border))',
                    background: 'transparent',
                    color: currentPage === totalPages ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))',
                    fontSize: '13px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPage === totalPages ? 0.4 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  Next
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              </div>
            )}
          </>
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

        {/* Share Prompt Modal */}
        {showSharePrompt && sharePromptRecipe && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.6)",
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
            onClick={() => {
              setShowSharePrompt(false);
              setSharePromptRecipe(null);
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                padding: "32px",
                maxWidth: "420px",
                width: "100%",
                position: "relative",
              }}
            >
              {/* Close Icon */}
              <button
                onClick={() => {
                  setShowSharePrompt(false);
                  setSharePromptRecipe(null);
                }}
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  color: "var(--muted-foreground)",
                  cursor: "pointer",
                }}
              >
                <X style={{ width: "20px", height: "20px" }} />
              </button>

              {/* Icon */}
              <div style={{
                width: "52px",
                height: "52px",
                borderRadius: "12px",
                background: "rgba(37,99,235,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}>
                <Share2 
                  style={{ 
                    width: "24px", 
                    height: "24px", 
                    color: "#2563eb" 
                  }} 
                />
              </div>

              {/* Title */}
              <h3 style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "var(--foreground)",
                marginBottom: "8px",
              }}>
                Share this recipe?
              </h3>

              {/* Description */}
              <p style={{
                fontSize: "14px",
                color: "var(--muted-foreground)",
                lineHeight: 1.6,
                marginBottom: "24px",
              }}>
                <strong style={{ color: "var(--foreground)" }}>
                  {sharePromptRecipe.recipeName}
                </strong>
                {" "}is currently private. To share it 
                with others, it needs to be published 
                to Explore first — then anyone with 
                the link can view it.
              </p>

              {/* Buttons */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}>
                {/* Primary — Share to Explore and share link */}
                <button
                  onClick={handleShareToExploreAndShare}
                  disabled={isSharing}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: isSharing ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    opacity: isSharing ? 0.7 : 1,
                    transition: "opacity 0.2s",
                  }}
                >
                  {isSharing ? (
                    <>
                      <Loader2 
                        style={{ 
                          width: "16px", 
                          height: "16px",
                        }} 
                        className="animate-spin"
                      />
                      Publishing to Explore...
                    </>
                  ) : (
                    <>
                      <Globe 
                        style={{ width: "16px", height: "16px" }} 
                      />
                      Publish to Explore & Share Link
                    </>
                  )}
                </button>

                {/* Secondary — Cancel */}
                <button
                  onClick={() => {
                    setShowSharePrompt(false);
                    setSharePromptRecipe(null);
                  }}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "transparent",
                    color: "var(--muted-foreground)",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <HistoryContent />
      </Suspense>
    </ProtectedRoute>
  );
}
