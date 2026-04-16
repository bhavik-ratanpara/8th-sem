'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
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
  ShoppingCart, 
  Trash2, 
  CheckCircle2, 
  Sparkles,
  ShoppingBasket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Playfair_Display, Inter } from 'next/font/google';

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['700'], style: ['normal', 'italic'] });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });

function AnimatedItem({ children, index }: { children: React.ReactNode; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.4,
        delay: index * 0.06,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  );
}

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
        toast({ variant: 'destructive', title: 'Failed to load shopping list' });
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
        // The toast is omitted or kept based on existing functionality.
        toast({ title: 'Item removed! ✅', duration: 2000 });
      } catch (error) {
        setItems(previousItems);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not remove item. Try again.',
        });
      }
    }, 300);
  };

  const unpurchasedItems = items.filter(item => item.id !== removingId);
  const purchasedItems = items.filter(item => item.id === removingId);
  const isShortPage = items.length === 0;

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden"
      style={{
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url('/background_img.png')",
        backgroundAttachment: isShortPage ? "scroll" : "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >


      <div className="relative z-10 max-content px-4 pt-24 pb-12">

        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Link
            href="/meal-plan"
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-[13px] text-white hover:bg-white/15 transition-all group backdrop-blur-[8px] mb-10 w-max",
              inter.className
            )}
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <ArrowLeft className="h-4 w-4 text-white group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Meal Plan
          </Link>
        </motion.div>

        {/* Header row */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10"
        >
          {/* Left: title block */}
          <div className="space-y-3">
            <h1 
              className={cn(
                "italic text-[36px] md:text-[52px] font-[700] tracking-[-0.5px] text-white leading-[1.05] drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]",
                playfair.className
              )}
            >
              Items to Buy
            </h1>
            <p className={cn("text-[15px] text-[#d4b896] max-w-[420px] leading-relaxed", inter.className)}>
              Your kitchen is waiting. Here's what you need to grab before your next cook.
            </p>
          </div>

          {/* Right: warm amber glowing counter badge */}
          {!isLoading && items.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="self-start md:self-center flex items-center gap-3 px-[24px] py-[14px] rounded-[16px] shadow-[0_8px_32px_rgba(217,119,6,0.35)] w-max"
              style={{ background: 'linear-gradient(135deg, #d97706, #b45309)' }}
            >
              <ShoppingBasket className="h-6 w-6 text-white opacity-90" />
              <div className="flex flex-col">
                <span className={cn("text-[28px] font-bold text-white leading-none", inter.className)}>
                  {items.length}
                </span>
                <span className={cn("text-[13px] text-[#fef3c7] leading-tight font-medium mt-0.5", inter.className)}>
                  items to buy
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 max-w-[780px]">
            <Loader2 className="h-8 w-8 animate-spin text-[#d97706] mb-4" />
            <p className={cn("text-sm text-[#d4b896]", inter.className)}>Loading your list...</p>
          </div>
        ) : items.length > 0 ? (
          <div className="max-w-[780px] mt-10">
            
            {/* UNPURCHASED SECTION */}
            {unpurchasedItems.length > 0 && (
              <div className="mb-6">
                {purchasedItems.length > 0 && (
                  <div className={cn("mb-4 text-[11px] font-semibold text-[#9ca3af] tracking-widest uppercase", inter.className)}>
                    🛒 Still needed
                  </div>
                )}
                <div className="space-y-[10px]">
                  {unpurchasedItems.map((item, idx) => (
                    <AnimatedItem key={item.id} index={idx}>
                      <div className={cn(
                        "group flex items-center gap-4 rounded-[16px] border border-white/5 backdrop-blur-[20px] backdrop-saturate-[180%] px-[16px] py-[14px] md:px-[22px] md:py-[18px] shadow-[0_4px_24px_rgba(0,0,0,0.3)] transition-all duration-250 hover:-translate-x-[-4px] hover:border-[#d97706]/40 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
                        inter.className
                      )}
                      style={{ background: 'rgba(15, 15, 15, 0.82)' }}
                      >
                        {/* Number - hide on mobile */}
                        <div className="hidden md:block w-[28px] text-center text-[12px] text-[#6b7280] font-medium">
                          {String(items.findIndex(i => i.id === item.id) + 1).padStart(2, '0')}
                        </div>

                        {/* Custom Icon Circle */}
                        <div className="flex-shrink-0 w-[42px] h-[42px] rounded-full flex items-center justify-center border border-[#d97706]/25" style={{ background: 'rgba(217, 119, 6, 0.12)' }}>
                          <ShoppingCart className="h-[20px] w-[20px] text-[#d97706]" strokeWidth={2} />
                        </div>

                        {/* Name + Date */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-[600] text-[#f9fafb] truncate leading-tight">
                            {item.itemName}
                          </p>
                          <p className="text-[12px] text-[#6b7280] mt-0.5">
                            Added {item.addedOn?.toDate ? format(item.addedOn.toDate(), 'dd MMM yyyy') : 'Recently'}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <button
                            onClick={() => item.id && handleRemove(item.id)}
                            className="bg-transparent border-[1.5px] border-[#d97706] text-[#d97706] rounded-full px-[18px] py-[7px] text-[13px] font-[500] hover:bg-[#d97706] hover:text-white transition-colors duration-200"
                          >
                            Mark as Bought
                          </button>
                          <button
                            onClick={() => item.id && handleRemove(item.id)}
                            className="text-[#374151] hover:text-[#ef4444] hover:scale-110 bg-transparent transition-all duration-200"
                            title="Delete item"
                          >
                            <Trash2 className="h-[18px] w-[18px]" strokeWidth={2} />
                          </button>
                        </div>
                      </div>
                    </AnimatedItem>
                  ))}
                </div>
              </div>
            )}

            {/* PURCHASED SECTION (Visible during 300ms transition) */}
            {purchasedItems.length > 0 && (
              <div className="pt-6 border-t border-white/5">
                <div className={cn("mb-4 text-[11px] font-semibold text-[#4ade80] tracking-widest uppercase", inter.className)}>
                  ✓ Already grabbed
                </div>
                <div className="space-y-[10px]">
                  {purchasedItems.map((item, idx) => (
                    <div key={item.id} className={cn(
                      "flex items-center gap-4 rounded-[16px] border border-white/5 backdrop-blur-[20px] backdrop-saturate-[180%] px-[16px] py-[14px] md:px-[22px] md:py-[18px] shadow-sm transition-all duration-250",
                      inter.className
                    )}
                    style={{ background: 'rgba(10, 10, 10, 0.7)' }}
                    >
                      <div className="hidden md:block w-[28px] text-center text-[12px] text-[#4b5563] font-medium opacity-50">
                        {String(items.findIndex(i => i.id === item.id) + 1).padStart(2, '0')}
                      </div>
                      <div className="flex-shrink-0 w-[42px] h-[42px] rounded-full flex items-center justify-center border border-[#16a34a]/25" style={{ background: 'rgba(22, 101, 52, 0.12)' }}>
                        <CheckCircle2 className="h-[20px] w-[20px] text-[#4ade80]" strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-[600] text-[#6b7280] line-through truncate leading-tight">
                          {item.itemName}
                        </p>
                        <p className="text-[12px] text-[#4b5563] mt-0.5">
                          Added {item.addedOn?.toDate ? format(item.addedOn.toDate(), 'dd MMM yyyy') : 'Recently'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <button className="bg-[#166534]/30 border-[1.5px] border-[#16a34a] text-[#4ade80] rounded-full px-[18px] py-[7px] text-[13px] font-[500] cursor-default flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Purchased
                        </button>
                        <div className="w-[18px]" /> {/* Spacer for deleted trash icon */}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* EMPTY STATE */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-center text-center mt-24 max-w-[780px]"
          >
            <motion.div 
              animate={{ y: [-6, 6, -6] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-[56px] leading-none mb-6 drop-shadow-2xl"
            >
              🧑‍🍳
            </motion.div>
            
            <h2 className={cn("italic text-[32px] text-white mb-3 tracking-tight drop-shadow-md", playfair.className)}>
              You're all stocked up!
            </h2>
            
            <p className={cn("text-[#d4b896] text-[15px] max-w-[340px] mb-10 leading-relaxed drop-shadow-sm", inter.className)}>
              Nothing missing from your kitchen.<br className="hidden sm:block" /> 
              Head back and start cooking something delicious.
            </p>
            
            <Button
              asChild
              className={cn(
                "rounded-full px-[32px] h-[52px] text-[15px] font-[600] text-white border-0 shadow-[0_8px_24px_rgba(217,119,6,0.3)] hover:shadow-[0_12px_32px_rgba(217,119,6,0.4)] transition-all hover:-translate-y-0.5",
                inter.className
              )}
              style={{ background: 'linear-gradient(135deg, #d97706, #b45309)' }}
            >
              <Link href="/meal-plan" className="flex items-center gap-2.5">
                <Sparkles className="h-[18px] w-[18px]" />
                Go to Meal Plan
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
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-[#d97706]" />
          </div>
        }
      >
        <ShoppingListContent />
      </Suspense>
    </ProtectedRoute>
  );
}
