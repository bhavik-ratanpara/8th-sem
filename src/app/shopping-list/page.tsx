'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
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
  Trash2, 
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getIngredientCategory } from '@/lib/ingredient-categories';
import { Playfair_Display, Inter } from 'next/font/google';
import { motion, AnimatePresence } from 'framer-motion';

const playfair = Playfair_Display({ 
  subsets: ['latin'], 
  weight: ['600', '700'],
});
const inter = Inter({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600'] 
});

const CATEGORY_ORDER = [
  'Vegetables',
  'Fruits',
  'Grains & Cereals',
  'Lentils & Pulses',
  'Dairy & Eggs',
  'Meat & Poultry',
  'Seafood',
  'Spices & Masalas',
  'Oils & Condiments',
  'Others'
];

function ShoppingListContent() {
  const { user } = useUser();
  const { toast } = useToast();

  const [items, setItems] = useState<UnavailableItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      if (!user) return;
      try {
        const data = await getUnavailableItems(user.uid);
        setItems(data);
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
      setRemovingId(null);

      try {
        await removeUnavailableItem(user.uid, itemId);
      } catch (error) {
        setItems(previousItems);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not remove item. Try again.',
        });
      }
    }, 250);
  };

  const groupedItems = useMemo(() => {
    const groups: Record<string, { category: string, emoji: string, items: UnavailableItem[] }> = {};
    
    items.forEach(item => {
      const { category, emoji } = getIngredientCategory(item.itemName);
      if (!groups[category]) {
        groups[category] = { category, emoji, items: [] };
      }
      groups[category].items.push(item);
    });

    return Object.values(groups).sort((a, b) => {
      return CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
    });
  }, [items]);

  return (
    <div
      className={cn("min-h-screen w-full relative overflow-hidden bg-[#050505]", inter.className)}
      style={{
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url('/background_img.png')",
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      <div className="relative z-10 max-w-[1100px] mx-auto px-5 md:px-8 py-20 pb-28">
        
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Link
            href="/meal-plan"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-[#d4d4d4] hover:text-[#ffffff] hover:bg-white/5 transition-colors backdrop-blur-md w-max"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Planner
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
             <Loader2 className="h-6 w-6 animate-spin text-[#8ea690]" />
             <p className="text-[#d4d4d4] text-sm tracking-wide">Loading ingredients...</p>
          </div>
        ) : items.length > 0 ? (
          <>
            {/* Sticky Header Section */}
            <div className="sticky top-[52px] z-40 mb-12 pt-4">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6"
              >
                <div className="space-y-2">
                  <h1 className={cn("text-4xl md:text-5xl text-[#ffffff] tracking-tight", playfair.className)}>
                    Shopping List
                  </h1>
                  <p className="text-sm md:text-base text-[#d4d4d4]">
                    Ingredients missing from your upcoming meal plan
                  </p>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-[#8ea690]/30 bg-[#8ea690]/10 backdrop-blur-md w-max shrink-0"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-[#8ea690]"></div>
                  <span className="text-xs font-medium uppercase tracking-wider">
                    <span className="text-[#ffffff]">{items.length}</span> <span className="text-[#d4d4d4]">items to buy</span>
                  </span>
                </motion.div>
              </motion.div>
              <div className="h-px w-full bg-[rgba(255,255,255,0.15)]" />
            </div>

            {/* Categories */}
            <div className="space-y-12">
              {groupedItems.map((group, groupIdx) => (
                <div key={group.category} className="space-y-5">
                  {/* Category Header */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-20px" }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-2"
                  >
                    <h2 className="text-[13px] uppercase tracking-widest font-semibold flex items-center gap-2">
                      <span className="opacity-90 grayscale-[20%]">{group.emoji}</span>
                      <span className="text-[#ffffff]">{group.category}</span>
                      <span className="text-[#a3a3a3] ml-1">({group.items.length})</span>
                    </h2>
                    <div className="h-px w-full bg-[rgba(255,255,255,0.15)]" />
                  </motion.div>

                  {/* Items Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                    <AnimatePresence>
                      {group.items.map((item, idx) => {
                        const isRemoving = removingId === item.id;

                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: isRemoving ? 0 : 1, y: isRemoving ? -5 : 0, scale: isRemoving ? 0.96 : 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ duration: 0.2, delay: isRemoving ? 0 : Math.min(idx * 0.03, 0.3) }}
                            className="group flex flex-col justify-between rounded-xl border border-[#2a2a2a] p-3 md:p-4 transition-all duration-200 hover:border-[#444444] hover:-translate-y-[1px]"
                            style={{ background: '#1a1a1a' }}
                          >
                            <div>
                              <div className="flex justify-end items-start w-full mb-1">
                                <button
                                  onClick={() => item.id && handleRemove(item.id)}
                                  className="text-[#555555] hover:text-[#ef4444] transition-colors p-1 -mr-1 -mt-1 rounded-md bg-transparent"
                                  title="Remove item"
                                  disabled={isRemoving}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="mb-4">
                                <h3 className="font-medium text-white/95 text-[15px] leading-snug line-clamp-2 mb-1.5">
                                  {item.itemName}
                                </h3>
                                <p className="text-[#9ca3af]/70 text-[10px] font-medium tracking-wide uppercase">
                                  Added {item.addedOn?.toDate ? format(item.addedOn.toDate(), 'MMM d') : 'Recently'}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => item.id && handleRemove(item.id)}
                              disabled={isRemoving}
                              className={cn(
                                "w-full px-3 py-1.5 flex items-center justify-center rounded-lg text-[12px] font-[500] transition-colors duration-200",
                                isRemoving 
                                  ? "bg-[#2a2a2a] text-[#e0e0e0] border border-[#666] cursor-default" 
                                  : "bg-transparent text-[#e0e0e0] border border-[#444444] hover:bg-[#2a2a2a] hover:border-[#666]"
                              )}
                            >
                              {isRemoving ? 'Bought' : 'Mark Bought'}
                            </button>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* EMPTY STATE */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center text-center mt-24 max-w-sm mx-auto"
          >
            <div className="h-14 w-14 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mx-auto mb-6 shadow-sm backdrop-blur-md">
              <Check className="h-6 w-6 text-white/40" />
            </div>
            
            <h2 className={cn("text-3xl text-[#ffffff] mb-3 tracking-tight", playfair.className)}>
              All set
            </h2>
            
            <p className="text-[#a3a3a3] text-sm leading-relaxed mb-8">
              Your shopping list is clear. You have all the ingredients needed for your meal plan.
            </p>
            
            <Button
              asChild
              className="rounded-full px-6 h-11 text-xs font-semibold text-[#0a0a0a] bg-[#8ea690] hover:bg-[#a6bfb0] transition-colors border-0"
            >
              <Link href="/meal-plan">
                Return to Planner
              </Link>
            </Button>
          </motion.div>
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
          <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 className="h-6 w-6 animate-spin text-[#8ea690]" />
          </div>
        }
      >
        <ShoppingListContent />
      </Suspense>
    </ProtectedRoute>
  );
}
