'use client';

import { useState, useEffect, Suspense, useMemo, useRef } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { useUser } from '@/firebase';
import {
  getUnavailableItems,
  removeUnavailableItem,
  addUnavailableItem,
  addBoughtItem,
  getBoughtItems,
  clearAllUnavailableItems,
  type UnavailableItem
} from '@/lib/meal-plan';
import {
  ArrowLeft,
  Loader2,
  Check,
  ShoppingCart,
  PartyPopper,
  ClipboardList,
  Plus,
  Trash2,
  History,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const CATEGORY_CONFIG = [
  { id: 'Vegetables', keywords: ['potato', 'onion', 'tomato', 'garlic', 'spinach', 'mushroom', 'broccoli', 'mint'], emoji: '🥬', accent: 'border-l-green-500', badge: 'bg-green-500/10 text-green-400 border-green-500/20', text: 'text-green-500 dark:text-green-400', gradient: 'from-green-500/60 via-green-500/20 to-transparent' },
  { id: 'Fruits', keywords: ['lemon', 'mango', 'banana', 'coconut', 'avocado', 'tamarind'], emoji: '🍎', accent: 'border-l-orange-400', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20', text: 'text-orange-500 dark:text-orange-400', gradient: 'from-orange-500/60 via-orange-500/20 to-transparent' },
  { id: 'Grains & Cereals', keywords: ['rice', 'wheat', 'flour', 'pasta', 'oats', 'bread', 'quinoa', 'ragi'], emoji: '🍞', accent: 'border-l-yellow-500', badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', text: 'text-yellow-600 dark:text-yellow-400', gradient: 'from-yellow-500/60 via-yellow-500/20 to-transparent' },
  { id: 'Dairy & Eggs', keywords: ['milk', 'curd', 'paneer', 'butter', 'ghee', 'cheese', 'eggs'], emoji: '🥛', accent: 'border-l-blue-400', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20', text: 'text-blue-500 dark:text-blue-400', gradient: 'from-blue-500/60 via-blue-500/20 to-transparent' },
  { id: 'Meat & Poultry', keywords: ['chicken', 'mutton', 'lamb', 'beef', 'pork', 'bacon', 'keema'], emoji: '🍗', accent: 'border-l-red-500', badge: 'bg-red-500/10 text-red-400 border-red-500/20', text: 'text-red-500 dark:text-red-400', gradient: 'from-red-500/60 via-red-500/20 to-transparent' },
  { id: 'Seafood', keywords: ['fish', 'prawn', 'shrimp', 'crab', 'salmon', 'tuna'], emoji: '🐟', accent: 'border-l-cyan-500', badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', text: 'text-cyan-600 dark:text-cyan-400', gradient: 'from-cyan-500/60 via-cyan-500/20 to-transparent' },
  { id: 'Spices & Masalas', keywords: ['turmeric', 'cumin', 'garam masala', 'cardamom', 'saffron', 'salt'], emoji: '🧂', accent: 'border-l-amber-500', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', text: 'text-amber-600 dark:text-amber-400', gradient: 'from-amber-500/60 via-amber-500/20 to-transparent' },
  { id: 'Lentils & Pulses', keywords: ['dal', 'rajma', 'chickpeas', 'peanuts', 'cashew', 'almond'], emoji: '🥜', accent: 'border-l-lime-500', badge: 'bg-lime-500/10 text-lime-400 border-lime-500/20', text: 'text-lime-600 dark:text-lime-400', gradient: 'from-lime-500/60 via-lime-500/20 to-transparent' },
  { id: 'Oils & Condiments', keywords: ['oil', 'vinegar', 'soy sauce', 'honey', 'sugar', 'ketchup', 'chutney'], emoji: '🫗', accent: 'border-l-purple-500', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20', text: 'text-purple-500 dark:text-purple-400', gradient: 'from-purple-500/60 via-purple-500/20 to-transparent' },
  { id: 'Others', keywords: [], emoji: '📦', accent: 'border-l-zinc-500', badge: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20', text: 'text-zinc-500 dark:text-zinc-400', gradient: 'from-zinc-500/60 via-zinc-500/20 to-transparent' },
];

const getIngredientCategory = (itemName: string) => {
  const name = itemName.toLowerCase().trim();
  for (const cat of CATEGORY_CONFIG) {
    if (cat.keywords.some(k => name.includes(k))) return cat;
  }
  return CATEGORY_CONFIG[CATEGORY_CONFIG.length - 1];
};

const CATEGORY_ORDER = CATEGORY_CONFIG.map(c => c.id);

function SidebarCategoryRow({
  group,
}: {
  group: { category: string; emoji: string; badge: string; items: UnavailableItem[] };
}) {
  const [hovered, setHovered] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const [popoverStyle, setPopoverStyle] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const handleMouseEnter = () => {
    if (rowRef.current) {
      const rect = rowRef.current.getBoundingClientRect();
      setPopoverStyle({
        top: rect.top,
        // CHANGED: position popover to the RIGHT of the sidebar row
        left: rect.right + 22,
      });
    }
    setHovered(true);
  };

  return (
    <div
      ref={rowRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={cn(
        'flex items-center justify-between gap-2 px-2 py-1.5 rounded-md transition-colors cursor-default',
        hovered ? 'bg-secondary/60' : 'hover:bg-secondary/30'
      )}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm leading-none w-5 text-center shrink-0">{group.emoji}</span>
          <span className="text-sm text-muted-foreground truncate">{group.category}</span>
        </div>
        <span className="text-xs font-normal text-muted-foreground tabular-nums shrink-0">
          {group.items.length}
        </span>
      </div>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: -6, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              top: popoverStyle.top,
              left: popoverStyle.left,
              zIndex: 9999,
              width: '13rem',
            }}
            className="bg-card border border-border rounded-xl shadow-xl overflow-hidden"
            // CHANGED: Prevent scroll from propagating to page when hovering popover
            onWheel={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-secondary/30">
              <span className="text-sm leading-none">{group.emoji}</span>
              <span className="text-sm font-semibold text-foreground">{group.category}</span>
              <span className="ml-auto text-xs font-normal text-muted-foreground tabular-nums">
                {group.items.length}
              </span>
            </div>
            {/* CHANGED: Added explicit max-height and overflow-y-auto for scrolling */}
            <div
              className="py-1.5 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-secondary scrollbar-track-transparent"
              style={{
                // Ensure scroll works within popover
                overscrollBehavior: 'contain',
              }}
            >
              {group.items.map((item, i) => (
                <div
                  key={item.id ?? i}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-secondary/30 transition-colors"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                  <span className="text-sm text-foreground leading-snug">{item.itemName}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ShoppingListSkeleton() {
  return (
    <div className="lg:pr-72 space-y-8 animate-pulse pt-2 w-full">
      {[...Array(3)].map((_, i) => (
        <div key={i}>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-5 w-5 bg-secondary rounded-full" />
            <div className="h-5 w-32 bg-secondary rounded-md" />
            <div className="h-[2px] flex-1 bg-secondary" />
            <div className="h-5 w-8 bg-secondary rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="bg-card border border-border rounded-lg px-4 py-3 flex items-center justify-between gap-3 h-[72px]">
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-3/4 bg-secondary rounded-md" />
                  <div className="h-3 w-1/3 bg-secondary rounded-md" />
                </div>
                <div className="h-8 w-24 bg-secondary rounded-md shrink-0" />
              </div>
            ))}
          </div>
        </div>
      ))}
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
  const [boughtHistory, setBoughtHistory] = useState<UnavailableItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const [navbarH, setNavbarH] = useState(64);
  const [headerH, setHeaderH] = useState(148);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const navbar = document.querySelector('nav, header, [data-navbar]') as HTMLElement | null;
    if (navbar) setNavbarH(navbar.offsetHeight);
    if (headerRef.current) setHeaderH(headerRef.current.offsetHeight);
  }, []);

  useEffect(() => {
    if (!isLoading && headerRef.current) {
      setHeaderH(headerRef.current.offsetHeight);
    }
  }, [isLoading]);

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
    const fetchHistory = async () => {
      if (!user) return;
      try {
        const historyData = await getBoughtItems(user.uid);
        setBoughtHistory(historyData);
      } catch (error) {
        console.error('Error fetching bought history:', error);
      }
    };
    fetchItems();
    fetchHistory();
  }, [user, toast]);

  const handleRemove = async (itemId: string) => {
    if (!user || !itemId) return;
    setRemovingId(itemId);

    setTimeout(async () => {
      const itemToRemove = items.find(i => i.id === itemId);
      const previousItems = [...items];
      setItems(prev => prev.filter(item => item.id !== itemId));
      setBoughtCount(prev => prev + 1);
      setRemovingId(null);

      try {
        await removeUnavailableItem(user.uid, itemId);
        if (itemToRemove) {
          const newBoughtId = await addBoughtItem(user.uid, itemToRemove);
          setBoughtHistory(prev => [{ ...itemToRemove, id: newBoughtId, boughtOn: new Date() }, ...prev]);
        }
      } catch (error) {
        setItems(previousItems);
        setBoughtCount(prev => prev - 1);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not remove item. Try again.' });
      }
    }, 250);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newItemName.trim() || isAdding) return;
    setIsAdding(true);
    try {
      const name = newItemName.trim();
      const newId = await addUnavailableItem(user.uid, name);
      const newItem: UnavailableItem = { id: newId, itemName: name, addedOn: new Date() };
      setItems(prev => [newItem, ...prev]);
      setTotalAtLoad(prev => prev + 1);
      setNewItemName('');
      setShowAdd(false);
      toast({ title: 'Item added' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not add item.' });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!user || items.length === 0 || isDeletingAll) return;
    if (!confirm('Are you sure you want to delete all items from your shopping list?')) return;

    setIsDeletingAll(true);
    try {
      await clearAllUnavailableItems(user.uid);
      setItems([]);
      toast({ title: 'Shopping list cleared' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not clear list.' });
    } finally {
      setIsDeletingAll(false);
    }
  };

  const groupedItems = useMemo(() => {
    const groups: Record<string, { category: string; emoji: string; accent: string; badge: string; text: string; gradient: string; items: UnavailableItem[] }> = {};
    items.forEach(item => {
      const cat = getIngredientCategory(item.itemName);
      if (!groups[cat.id]) groups[cat.id] = { category: cat.id, emoji: cat.emoji, accent: cat.accent, badge: cat.badge, text: cat.text, gradient: cat.gradient, items: [] };
      groups[cat.id].items.push(item);
    });
    return Object.values(groups).sort((a, b) =>
      CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category)
    );
  }, [items]);

  const progressPercent = totalAtLoad > 0 ? Math.round((boughtCount / totalAtLoad) * 100) : 0;
  const allDone = totalAtLoad > 0 && boughtCount === totalAtLoad;
  const SUMMARY_TOP = navbarH + headerH + 40;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -50, y: 50 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="fixed bottom-0 left-0 hidden md:block"
        style={{ zIndex: 0 }}
      >
        <Image
          src="/design1.png"
          alt=""
          width={320}
          height={320}
          className="opacity-50 md:w-64 md:h-64 lg:w-80 lg:h-80"
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 50, y: 50 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="fixed bottom-0 right-0 hidden md:block"
        style={{ zIndex: 0 }}
      >
        <Image
          src="/design2.png"
          alt=""
          width={320}
          height={320}
          className="opacity-50 md:w-64 md:h-64 lg:w-80 lg:h-80 object-contain"
        />
      </motion.div>

      {/* FIXED HEADER — flush against navbar, no gap */}
      <div
        ref={headerRef}
        className="fixed left-0 right-0 bg-background z-20 border-b border-border"
        style={{ top: navbarH }}
      >
        <div className="w-full px-8 sm:px-16 md:px-24 lg:px-32 xl:px-40 pt-3 pb-1">
          <Link
            href="/meal-plan"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium text-sm mb-1 hover:translate-x-[-4px] transition-all w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Planner
          </Link>
          <div className="relative flex flex-col items-center justify-center mt-2 md:mt-0">
            <div className="space-y-1 text-center">
              <h1
                className="text-4xl tracking-tight text-foreground"
                style={{ fontFamily: "'Regalia Monarch', serif", fontWeight: 'normal' }}
              >
                SHOPPING LIST
              </h1>
              <p className="text-muted-foreground text-base" style={{ fontFamily: "'Dropline', sans-serif" }}>
                Manage your ingredients for upcoming meals
              </p>
            </div>
            {!isLoading && (
              <div className="mt-4 md:mt-0 md:absolute md:right-0 md:bottom-0 flex items-center gap-2 mb-2 md:mb-0">
                <button
                  onClick={() => setShowAdd(true)}
                  className="bg-secondary/50 hover:bg-secondary text-foreground p-2 rounded-full border border-border transition-colors"
                  title="Add Item"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowHistory(true)}
                  className="bg-secondary/50 hover:bg-secondary text-foreground p-2 rounded-full border border-border transition-colors"
                  title="Bought History"
                >
                  <History className="h-4 w-4" />
                </button>
                {items.length > 0 && (
                  <button
                    onClick={handleDeleteAll}
                    disabled={isDeletingAll}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2 rounded-full border border-red-500/20 transition-colors disabled:opacity-50"
                    title="Delete All"
                  >
                    {isDeletingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                )}
                <div className="text-base font-semibold bg-secondary/50 px-4 py-1.5 rounded-full border border-border text-secondary-foreground whitespace-nowrap ml-2">
                  {items.length} {items.length === 1 ? 'item' : 'items'} to buy
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FIXED SUMMARY SIDEBAR */}
      {!isLoading && (items.length > 0 || boughtCount > 0) && (
        <div
          className="hidden lg:block fixed z-20"
          style={{
            top: SUMMARY_TOP,
            right: 'max(2rem, calc((100vw - 1280px) / 2 + 1rem))',
            width: '16rem',
            maxHeight: `calc(100vh - ${SUMMARY_TOP + 8}px)`,
            overflowY: 'auto',
          }}
        >
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4 pb-4 border-b border-border">
              <ClipboardList className="h-4 w-4 text-foreground" />
              <span className="text-sm font-medium text-foreground tracking-wide" style={{ fontFamily: "'Roboto Condensed', sans-serif" }}>Summary</span>
              <span className="ml-auto text-xs font-normal text-muted-foreground">
                {items.length} left
              </span>
            </div>
            <div className="space-y-0.5 mb-5">
              {groupedItems.map((group) => (
                <SidebarCategoryRow key={group.category} group={group} />
              ))}
            </div>
            <div className="pt-4 border-t border-border">
              <div className="flex justify-between text-xs mb-2">
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
              <p className="text-xs text-muted-foreground mt-1.5 text-right">
                {progressPercent}% complete
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SCROLLABLE CARDS */}
      <div
        className="max-content px-4 pb-16"
        style={{ paddingTop: navbarH + headerH - 8 }}
      >
        {isLoading ? (
          <ShoppingListSkeleton />
        ) : items.length === 0 && boughtCount === 0 ? (
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
          <div className="lg:pr-72 space-y-5">
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
                    <p className="text-base font-bold text-green-400">All items bought!</p>
                    <p className="text-sm text-green-400/70">You're all stocked up for your meal plan.</p>
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
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-lg leading-none">{group.emoji}</span>
                    <h2 className={cn("text-base font-bold uppercase tracking-widest", group.text)}>
                      {group.category}
                    </h2>
                    <div className={cn("h-[2px] flex-1 bg-gradient-to-r", group.gradient)} />
                    <span className="text-sm font-semibold text-muted-foreground tabular-nums bg-secondary/50 px-2.5 py-0.5 rounded-full border border-border/50">{group.items.length}</span>
                  </div>

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
                            <p
                              className="font-normal text-lg text-foreground leading-snug line-clamp-2 tracking-wide"
                              style={{ fontFamily: "'Roboto Condensed', sans-serif", wordSpacing: '0.15em' }}
                            >
                              {item.itemName}
                            </p>
                            <p
                              className="text-xs text-muted-foreground mt-1"
                              style={{ fontFamily: "'Roboto Condensed', sans-serif" }}
                            >
                              {item.addedOn?.toDate ? format(item.addedOn.toDate(), 'MMM d') : 'Recently'}
                            </p>
                          </div>
                          <button
                            onClick={() => item.id && handleRemove(item.id)}
                            disabled={isRemoving}
                            className={cn(
                              'shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-md transition-all duration-200 whitespace-nowrap mt-0.5',
                              isRemoving
                                ? 'bg-emerald-600 text-white cursor-default'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
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
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowAdd(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden p-6"
            >
              <button
                onClick={() => setShowAdd(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-base font-bold uppercase tracking-widest mb-4">Add Item</h2>
              <form onSubmit={handleAddItem} className="space-y-4">
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="E.g., Milk, Bread, Tomatoes"
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  autoFocus
                />
                <Button type="submit" disabled={!newItemName.trim() || isAdding} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                  {isAdding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Add to List
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-end sm:justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowHistory(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg max-h-[85vh] flex flex-col bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-border bg-secondary/30">
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-foreground" />
                  <h2 className="text-base font-bold uppercase tracking-widest">Bought History</h2>
                </div>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-secondary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {boughtHistory.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <p>No items have been bought recently.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {boughtHistory.map((item) => (
                      <div key={item.id} className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-secondary/30 transition-colors">
                        <div>
                          <p className="font-normal text-lg text-foreground tracking-wide" style={{ fontFamily: "'Roboto Condensed', sans-serif", wordSpacing: '0.15em' }}>
                            {item.itemName}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.boughtOn?.toDate ? format(item.boughtOn.toDate(), 'MMM d, h:mm a') : 'Recently'}
                          </p>
                        </div>
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function ShoppingListPage() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <div className="max-content px-4 pb-16" style={{ paddingTop: 212 }}>
            <ShoppingListSkeleton />
          </div>
        }
      >
        <ShoppingListContent />
      </Suspense>
    </ProtectedRoute>
  );
}