'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { getUnavailableItems, getMealPlan } from '@/lib/meal-plan';
import Link from 'next/link';
import { ShoppingCart, X, AlertTriangle } from 'lucide-react';
import { format, startOfWeek } from 'date-fns';

export function MissingItemsPopup() {
  const { user, isUserLoading } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    if (isUserLoading || !user) return;

    const checkMissingItems = async () => {
      try {
        const hasBeenShown = sessionStorage.getItem('missingItemsPopupShown');
        if (hasBeenShown === 'true') {
          return;
        }

        const items = await getUnavailableItems(user.uid);
        if (items && items.length > 0) {
          setItemCount(items.length);
          setIsOpen(true);
          sessionStorage.setItem('missingItemsPopupShown', 'true');
        }
      } catch (error) {
        console.error('Failed to check missing items:', error);
      }
    };

    checkMissingItems();
  }, [user, isUserLoading]);

  if (!isOpen) return null;

  const today = format(new Date(), 'EEEE, MMMM do');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-[420px] rounded-2xl shadow-2xl border border-border/40 mt-[-40px] animate-in slide-in-from-bottom-8 duration-300 relative overflow-hidden">
        
        {/* Top Accent Line */}
        <div className="h-1.5 w-full bg-amber-500" />
        
        {/* Close Button */}
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 md:p-8">
          <div className="flex justify-center mb-5">
            <div className="h-14 w-14 rounded-full bg-amber-500/10 flex items-center justify-center ring-4 ring-amber-500/5">
              <AlertTriangle className="h-7 w-7 text-amber-500" />
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-center text-foreground mb-1 tracking-tight">
            Missing Ingredients Alert
          </h2>
          <p className="text-[11px] font-bold text-center text-muted-foreground uppercase tracking-widest mb-6 border-b border-border/40 pb-5">
            {today}
          </p>
          
          <p className="text-[15px] text-center text-muted-foreground leading-relaxed mb-8">
            You have <strong className="text-foreground">{itemCount}</strong> missing ingredient{itemCount !== 1 ? 's' : ''} in your shopping list. Check before you start cooking today!
          </p>

          <div className="flex flex-col gap-2.5">
            <Link 
              href="/shopping-list" 
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground text-[14px] font-[600] h-11 rounded-xl shadow-sm hover:opacity-90 transition-opacity w-full"
            >
              <ShoppingCart className="h-[18px] w-[18px]" />
              View Shopping List
            </Link>
            <button 
              onClick={() => setIsOpen(false)}
              className="h-11 rounded-xl text-muted-foreground text-[14px] font-medium hover:text-foreground hover:bg-secondary/40 transition-colors border border-border/60 w-full"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
