'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { useUser } from '@/firebase';
import { getSavedRecipes, deleteRecipe, toggleFavourite, shareRecipePublic, unshareRecipePublic, type SavedRecipe } from '@/lib/save-recipe';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Trash2, Search, BookMarked, Filter, ArrowRight, ArrowLeft, Globe, Loader2, Share2, X, ArrowUpDown, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useSearchParams, useRouter } from 'next/navigation';
import { FoodDecorations } from '@/components/FoodDecorations';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

function HistoryContent() {
  const { user } = useUser();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<SavedRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dietFilter, setDietFilter] = useState<'All' | 'Vegetarian' | 'Non-Vegetarian'>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Share prompt states
  const [showSharePrompt, setShowSharePrompt] = useState(false);
  const [sharePromptRecipe, setSharePromptRecipe] = useState<SavedRecipe | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  // Pagination states
  // Pagination states
  const RECIPES_PER_PAGE = 12;
  const [currentPage, setCurrentPage] = useState(1);

  // Layout Measurement
  const [navbarH, setNavbarH] = useState(52);
  const [headerH, setHeaderH] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Measure navbar height
    const navbar = document.querySelector('header.fixed.top-0');
    if (navbar) setNavbarH(navbar.getBoundingClientRect().height);

    // Measure fixed header height
    if (!headerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) setHeaderH(entry.contentRect.height);
    });
    observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

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
    let result = [...recipes];
    
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

    // Apply Sorting by generatedAt timestamp
    result.sort((a, b) => {
      const dateA = a.generatedAt?.seconds || 0;
      const dateB = b.generatedAt?.seconds || 0;
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredRecipes(result);
  }, [recipes, dietFilter, searchQuery, searchParams, sortBy]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [dietFilter, searchQuery, searchParams, sortBy]);

  const totalPages = Math.ceil(filteredRecipes.length / RECIPES_PER_PAGE);
  const paginatedRecipes = filteredRecipes.slice(
    (currentPage - 1) * RECIPES_PER_PAGE,
    currentPage * RECIPES_PER_PAGE
  );

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
        
        setRecipes(prev => prev.map(r => 
          r.id === recipe.id ? { ...r, isPublic: false } : r
        ));
        
        await unshareRecipePublic(user.uid, recipe.id);
        
        toast({
          title: "Removed from Explore",
          description: "Recipe still saved in My Recipes.",
        });
      } else {
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

    if (recipe.isPublic) {
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

    setSharePromptRecipe(recipe);
    setShowSharePrompt(true);
  };

  const handleShareToExploreAndShare = async () => {
    if (!user || !sharePromptRecipe?.id) return;
    
    setIsSharing(true);
    
    try {
      await shareRecipePublic(
        user.uid,
        user.displayName || 'Anonymous Chef',
        sharePromptRecipe.id,
        sharePromptRecipe
      );
      
      setRecipes(prev => prev.map(r =>
        r.id === sharePromptRecipe.id
          ? { ...r, isPublic: true }
          : r
      ));
      
      setShowSharePrompt(false);
      
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

  const filterButtonStyle = (isActive: boolean) => ({
    fontSize: '12px',
    padding: '4px 10px',
    height: 'auto',
    borderRadius: '6px',
    border: '0.5px solid',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    borderColor: isActive ? 'hsl(var(--primary))' : 'hsl(var(--border))',
    color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
    background: isActive ? 'hsl(var(--primary) / 0.1)' : 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  } as const);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div style={{ position: 'absolute', inset: 0, top: navbarH + headerH - 51, pointerEvents: 'none' }}>
        <FoodDecorations />
      </div>

      {/* FIXED HEADER — flush against navbar */}
      <div
        ref={headerRef}
        className="fixed left-0 right-0 bg-background z-20 border-b border-border"
        style={{ top: navbarH }}
      >
        <div className="w-full px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 pt-3 pb-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium text-sm mb-2 hover:translate-x-[-4px] transition-all w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="relative flex flex-col items-center justify-center mt-2 md:mt-0">
            <div className="space-y-1 text-center">
              <h1
                className="text-4xl tracking-tight text-foreground uppercase"
                style={{ fontFamily: "'Regalia Monarch', serif", fontWeight: 'normal' }}
              >
                {searchParams.get('filter') === 'favourite' ? 'MY FAVOURITES' : 'MY RECIPES'}
              </h1>
              <p className="text-muted-foreground text-base" style={{ fontFamily: "'Dropline', sans-serif" }}>
                {searchParams.get('filter') === 'favourite' ? 'Your top picks in one place' : 'All your saved recipes in one place'}
              </p>
            </div>
            
            {!isLoading && (
              <div className="mt-4 md:mt-0 md:absolute md:right-0 md:bottom-0 text-sm font-semibold bg-secondary/50 px-4 py-1.5 rounded-full border border-border text-secondary-foreground mb-2 md:mb-0">
                {filteredRecipes.length} recipes {searchParams.get('filter') === 'favourite' ? 'favourited' : 'saved'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div 
        className="max-content px-4 pb-16 relative z-10"
        style={{ paddingTop: navbarH + headerH + 24 }}
      >
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-8 bg-card p-4 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
            {(['All', 'Vegetarian', 'Non-Vegetarian'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setDietFilter(filter)}
                style={filterButtonStyle(dietFilter === filter)}
              >
                {filter}
              </button>
            ))}

            <div className="w-[1px] h-4 bg-border mx-1 flex-shrink-0" />

            <Popover open={isSortOpen} onOpenChange={setIsSortOpen}>
              <PopoverTrigger asChild>
                <button
                  style={filterButtonStyle(sortBy !== 'newest')}
                  className="flex items-center gap-1.5"
                >
                  <ArrowUpDown className="h-3 w-3" />
                  Sort
                  <ChevronDown className={cn("h-3 w-3 transition-transform", isSortOpen && "rotate-180")} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[160px] p-1" align="start">
                <button
                  onClick={() => { setSortBy('newest'); setIsSortOpen(false); }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-[13px] rounded-md transition-colors",
                    sortBy === 'newest' ? "bg-primary/5 text-primary font-semibold" : "text-foreground hover:bg-secondary/50"
                  )}
                >
                  Newest First
                </button>
                <button
                  onClick={() => { setSortBy('oldest'); setIsSortOpen(false); }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-[13px] rounded-md transition-colors",
                    sortBy === 'oldest' ? "bg-primary/5 text-primary font-semibold" : "text-foreground hover:bg-secondary/50"
                  )}
                >
                  Oldest First
                </button>
              </PopoverContent>
            </Popover>
          </div>

          <div className="relative w-full lg:w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm rounded-lg border-border focus:ring-primary/20 bg-background"
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
                  className="group relative bg-card border border-border rounded-lg shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 flex flex-col h-full overflow-hidden"
                >
                  {/* Recipe Image */}
                  {recipe.imageUrl && (
                    <div className="relative w-full h-36 overflow-hidden bg-secondary">
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.recipeName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent" />
                    </div>
                  )}

                  <div className="p-5 flex flex-col flex-1">
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
                <button
                  onClick={() => {
                    setCurrentPage(p => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
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

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                  const isFirst = page === 1;
                  const isLast = page === totalPages;
                  const isCurrent = page === currentPage;
                  const isNearCurrent = Math.abs(page - currentPage) <= 1;

                  if (!isFirst && !isLast && !isNearCurrent) {
                    if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} style={{ padding: '7px 4px', fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
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
                  );
                })}

                <button
                  onClick={() => {
                    setCurrentPage(p => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
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
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "16px",
                padding: "32px",
                maxWidth: "420px",
                width: "100%",
                position: "relative",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
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
                  color: "hsl(var(--muted-foreground))",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "50%"
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
                color: "hsl(var(--foreground))",
                marginBottom: "8px",
              }}>
                Share this recipe?
              </h3>

              {/* Description */}
              <p style={{
                fontSize: "14px",
                color: "hsl(var(--muted-foreground))",
                lineHeight: 1.6,
                marginBottom: "24px",
              }}>
                <strong style={{ color: "hsl(var(--foreground))" }}>
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

                <button
                  onClick={() => {
                    setShowSharePrompt(false);
                    setSharePromptRecipe(null);
                  }}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "transparent",
                    color: "hsl(var(--muted-foreground))",
                    border: "1px solid hsl(var(--border))",
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
