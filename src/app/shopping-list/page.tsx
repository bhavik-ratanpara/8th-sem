'use client';

import { useState, useEffect, Suspense, useMemo, useRef } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { useUser } from '@/firebase';
import {
  getUnavailableItems,
  removeUnavailableItem,
  type UnavailableItem
} from '@/lib/meal-plan';
import {
  ArrowLeft,
  Loader2,
  Check,
  ShoppingCart,
  PartyPopper,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_CONFIG = [
  { id: 'Vegetables', keywords: ['potato', 'onion', 'tomato', 'garlic', 'spinach', 'mushroom', 'broccoli', 'mint'], emoji: '🥬', accent: 'border-l-green-500', badge: 'bg-green-500/10 text-green-400 border-green-500/20' },
  { id: 'Fruits', keywords: ['lemon', 'mango', 'banana', 'coconut', 'avocado', 'tamarind'], emoji: '🍎', accent: 'border-l-orange-400', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  { id: 'Grains & Cereals', keywords: ['rice', 'wheat', 'flour', 'pasta', 'oats', 'bread', 'quinoa', 'ragi'], emoji: '🍞', accent: 'border-l-yellow-500', badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  { id: 'Dairy & Eggs', keywords: ['milk', 'curd', 'paneer', 'butter', 'ghee', 'cheese', 'eggs'], emoji: '🥛', accent: 'border-l-blue-400', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { id: 'Meat & Poultry', keywords: ['chicken', 'mutton', 'lamb', 'beef', 'pork', 'bacon', 'keema'], emoji: '🍗', accent: 'border-l-red-500', badge: 'bg-red-500/10 text-red-400 border-red-500/20' },
  { id: 'Seafood', keywords: ['fish', 'prawn', 'shrimp', 'crab', 'salmon', 'tuna'], emoji: '🐟', accent: 'border-l-cyan-500', badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  { id: 'Spices & Masalas', keywords: ['turmeric', 'cumin', 'garam masala', 'cardamom', 'saffron', 'salt'], emoji: '🧂', accent: 'border-l-amber-500', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { id: 'Lentils & Pulses', keywords: ['dal', 'rajma', 'chickpeas', 'peanuts', 'cashew', 'almond'], emoji: '🥜', accent: 'border-l-lime-500', badge: 'bg-lime-500/10 text-lime-400 border-lime-500/20' },
  { id: 'Oils & Condiments', keywords: ['oil', 'vinegar', 'soy sauce', 'honey', 'sugar', 'ketchup', 'chutney'], emoji: '🫗', accent: 'border-l-purple-500', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { id: 'Others', keywords: [], emoji: '📦', accent: 'border-l-zinc-500', badge: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
];

const getIngredientCategory = (itemName: string) => {
  const name = itemName.toLowerCase().trim();
  for (const cat of CATEGORY_CONFIG) {
    if (cat.keywords.some(k => name.includes(k))) return cat;
  }
  return CATEGORY_CONFIG[CATEGORY_CONFIG.length - 1];
};

const CATEGORY_ORDER = CATEGORY_CONFIG.map(c => c.id);

// ── Sidebar category row with hover popover ──
function SidebarCategoryRow({
  group,
}: {
  group: { category: string; emoji: string; badge: string; items: UnavailableItem[] };
}) {
  const [hovered, setHovered] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const [popoverTop, setPopoverTop] = useState(0);

  const handleMouseEnter = () => {
    if (rowRef.current) {
      const rect = rowRef.current.getBoundingClientRect();
      setPopoverTop(rowRef.current.offsetTop);
    }
    setHovered(true);
  };

  return (
    <div
      ref={rowRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Row */}
      <div className={cn(
        'flex items-center justify-between gap-2 px-2 py-1.5 rounded-md transition-colors cursor-default',
        hovered ? 'bg-secondary/60' : 'hover:bg-secondary/30'
      )}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs leading-none">{group.emoji}</span>
          <span className="text-xs text-muted-foreground truncate">{group.category}</span>
        </div>
        <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0', group.badge)}>
          {group.items.length}
        </span>
      </div>

      {/* Popover — CHANGED: Now floats to the RIGHT of the sidebar */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: 6, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            /* CHANGED: left-[calc(100%+12px)] positions popover to the RIGHT */
            style={{ top: 0 }}
            className="absolute left-[calc(100%+12px)] top-0 w-52 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
          >
            {/* Popover header */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-secondary/30">
              <span className="text-sm leading-none">{group.emoji}</span>
              <span className="text-xs font-semibold text-foreground">{group.category}</span>
              <span className={cn('ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded border', group.badge)}>
                {group.items.length}
              </span>
            </div>

            {/* Ingredient list */}
            <div className="py-1.5 max-h-60 overflow-y-auto">
              {group.items.map((item, i) => (
                <div
                  key={item.id ?? i}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-secondary/30 transition-colors"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                  <span className="text-xs text-foreground leading-snug">{item.itemName}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ShoppingListContent() {
  const { user } = useUser();
  const { toast } = useToast();

  const [items, setItems] = useState<UnavailableItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [totalAtLoad, setTotalAtLoad] = useState(0);
  const [boughtCount, setBoughtCount] = useState(0);

  useEffect(() => {
    const fetchItems = async () => {
      if (!user) return;
      try {
        const data = await getUnavailableItems(user.uid);
        setItems(data);
        setTotalAtLoad(data.length);
      } catch (error) {
        console.error('Error fetching shopping list:', error);
        toast({ variant: 'destructive', title: 'Failed to load list' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, [user, toast]);

  const handleRemove = async (itemId: string) => {
    if (!user || !itemId) return;
    setRemovingId(itemId);
    setTimeout(async () => {
      const previousItems = [...items];
      setItems(prev => prev.filter(item => item.id !== itemId));
      setBoughtCount(prev => prev + 1);
      setRemovingId(null);
      try {
        await removeUnavailableItem(user.uid, itemId);
      } catch (error) {
        setItems(previousItems);
        setBoughtCount(prev => prev - 1);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not remove item. Try again.' });
      }
    }, 250);
  };

  const groupedItems = useMemo(() => {
    const groups: Record<string, { category: string; emoji: string; accent: string; badge: string; items: UnavailableItem[] }> = {};
    items.forEach(item => {
      const cat = getIngredientCategory(item.itemName);
      if (!groups[cat.id]) groups[cat.id] = { category: cat.id, emoji: cat.emoji, accent: cat.accent, badge: cat.badge, items: [] };
      groups[cat.id].items.push(item);
    });
    return Object.values(groups).sort((a, b) =>
      CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category)
    );
  }, [items]);

  const progressPercent = totalAtLoad > 0 ? Math.round((boughtCount / totalAtLoad) * 100) : 0;
  const allDone = totalAtLoad > 0 && boughtCount === totalAtLoad;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="max-content px-4 py-12 relative z-10">

        {/* Back */}
        <Link
          href="/meal-plan"
          className="flex items-center gap-2 text-primary font-bold text-sm mb-10 hover:translate-x-[-4px] transition-transform w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Planner
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800 }}>
              Shopping List
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your ingredients for upcoming meals
            </p>
          </div>
          {!isLoading && (
            <div className="text-sm font-semibold bg-secondary/50 px-4 py-2 rounded-full border border-border text-secondary-foreground whitespace-nowrap">
              {items.length} {items.length === 1 ? 'item' : 'items'} to buy
            </div>
          )}
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>

        ) : items.length === 0 && boughtCount === 0 ? (
          /* Empty */
          <div className="flex flex-col items-center justify-center py-24 text-center bg-secondary/10 rounded-2xl border-2 border-dashed border-border">
            <div className="bg-secondary/20 p-6 rounded-full mb-6">
              <Check className="h-12 w-12 text-muted-foreground/40" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">All set</h2>
            <p className="text-muted-foreground mb-8 max-w-sm">
              Your shopping list is clear. You have all the ingredients needed for your meal plan.
            </p>
            <Button asChild className="bg-primary text-white font-bold h-12 px-8 rounded-xl">
              <Link href="/meal-plan">Return to Planner</Link>
            </Button>
          </div>

        ) : (
          <div className="flex gap-8 items-start">

            {/* ── LEFT: Main list ── */}
            <div className="flex-1 min-w-0 space-y-8">

              {/* All done banner */}
              <AnimatePresence>
                {allDone && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-xl px-5 py-4"
                  >
                    <PartyPopper className="h-5 w-5 text-green-400 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-green-400">All items bought!</p>
                      <p className="text-xs text-green-400/70">You're all stocked up for your meal plan.</p>
                    </div>
                    <Button asChild size="sm" className="ml-auto bg-green-600 hover:bg-green-500 text-white font-bold shrink-0">
                      <Link href="/meal-plan">Back to Planner</Link>
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="popLayout">
                {groupedItems.map((group) => (
                  <motion.div
                    key={group.category}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Category Header */}
                    <div className="flex items-center gap-2.5 mb-3">
                      <span className="text-sm leading-none">{group.emoji}</span>
                      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                        {group.category}
                      </h2>
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-xs text-muted-foreground tabular-nums">{group.items.length}</span>
                    </div>

                    {/* 3-col grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                      {group.items.map((item) => {
                        const isRemoving = removingId === item.id;
                        return (
                          <motion.div
                            key={item.id}
                            layout
                            animate={{ opacity: isRemoving ? 0.35 : 1 }}
                            exit={{ opacity: 0, scale: 0.97 }}
                            transition={{ duration: 0.18 }}
                            className={cn(
                              'bg-card border border-border rounded-lg px-4 py-3',
                              'border-l-2', group.accent,
                              'flex items-start justify-between gap-3',
                              'hover:shadow-sm transition-all duration-200'
                            )}
                          >
                            <div className="flex-1 min-w-0 pt-0.5">
                              {/* ── line-clamp-2 instead of truncate ── */}
                              <p className="font-semibold text-sm text-foreground leading-snug line-clamp-2">
                                {item.itemName}
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-1">
                                {item.addedOn?.toDate ? format(item.addedOn.toDate(), 'MMM d') : 'Recently'}
                              </p>
                            </div>
                            <button
                              onClick={() => item.id && handleRemove(item.id)}
                              disabled={isRemoving}
                              className={cn(
                                'shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-md border transition-all duration-200 whitespace-nowrap mt-0.5',
                                isRemoving
                                  ? 'bg-green-600 border-green-500 text-white cursor-default'
                                  : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary hover:text-white hover:border-primary'
                              )}
                            >
                              {isRemoving ? (
                                <span className="flex items-center gap-1">
                                  <Check className="h-3 w-3" /> Bought
                                </span>
                              ) : 'Mark Bought'}
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* ── RIGHT: Sticky Sidebar ── */}
            <div className="hidden lg:block w-64 shrink-0 sticky top-8">
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm overflow-visible">

                {/* Header */}
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                  <ShoppingCart className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">Summary</span>
                  <span className="ml-auto text-xs font-semibold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                    {items.length} left
                  </span>
                </div>

                {/* Category rows with hover popover */}
                <div className="space-y-0.5 mb-5">
                  {groupedItems.map((group) => (
                    <SidebarCategoryRow key={group.category} group={group} />
                  ))}
                </div>

                {/* Progress */}
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between text-[11px] mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className={cn('font-semibold', allDone ? 'text-green-400' : 'text-foreground')}>
                      {boughtCount} / {totalAtLoad} bought
                    </span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className={cn('h-full rounded-full', allDone ? 'bg-green-500' : 'bg-primary')}
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5 text-right">
                    {progressPercent}% complete
                  </p>
                </div>

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default function ShoppingListPage() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <ShoppingListContent />
      </Suspense>
    </ProtectedRoute>
  );
}