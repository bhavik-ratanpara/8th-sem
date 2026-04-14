'use client';

import { useState, useEffect, Suspense } from 'react';
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
  Package,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { FoodDecorations } from '@/components/FoodDecorations';

function ShoppingListContent() {
  const { user } = useUser();
  const { toast } = useToast();
  
  const [items, setItems] = useState<UnavailableItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      if (!user) return;
      try {
        const data = await getUnavailableItems(user.uid);
        setItems(data);
      } catch (error) {
        console.error("Error fetching shopping list:", error);
        toast({ variant: "destructive", title: "Failed to load shopping list" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, [user, toast]);

  const handleRemove = async (itemId: string) => {
    if (!user || !itemId) return;

    // Optimistic UI update
    const previousItems = [...items];
    setItems(prev => prev.filter(item => item.id !== itemId));

    try {
      await removeUnavailableItem(user.uid, itemId);
      toast({
        title: "Item removed! ✅",
        duration: 2000,
      });
    } catch (error) {
      setItems(previousItems); // Rollback on error
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not remove item. Try again.",
      });
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <FoodDecorations />
      <div className="max-content px-4 py-8 relative z-10">
        
        {/* Back Link */}
        <Link 
          href="/meal-plan"
          className="flex items-center gap-2 text-primary font-bold text-sm mb-6 hover:translate-x-[-4px] transition-transform w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Meal Plan
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground" style={{ fontFamily: "Inter, sans-serif", fontWeight: 800 }}>
              Shopping List
            </h1>
            <p className="text-muted-foreground text-base">Ingredients you need to restock</p>
          </div>
          {!isLoading && items.length > 0 && (
            <div className="text-xs font-semibold bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 text-primary flex items-center gap-2">
              <ShoppingCart className="h-3 w-3" />
              {items.length} {items.length === 1 ? 'item' : 'items'} to buy
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : items.length > 0 ? (
          <div className="max-w-2xl mx-auto space-y-4 mb-20">
            {items.map((item) => (
              <div 
                key={item.id}
                className="group bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-secondary/50 p-2 rounded-lg text-muted-foreground group-hover:text-primary transition-colors">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground leading-tight mb-1">{item.itemName}</h3>
                    <p className="text-xs text-muted-foreground font-medium">
                      Added on {item.addedOn?.toDate ? format(item.addedOn.toDate(), 'dd MMM yyyy') : 'Recently'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => item.id && handleRemove(item.id)}
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 rounded-lg bg-green-600/10 text-green-600 border-green-600/30 hover:bg-green-600 hover:text-white transition-all font-bold gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Purchased</span>
                  </Button>
                  <Button
                    onClick={() => item.id && handleRemove(item.id)}
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-secondary/10 rounded-3xl border-2 border-dashed border-border max-w-2xl mx-auto">
            <div className="bg-secondary/20 p-8 rounded-full mb-6">
              <ShoppingCart className="h-16 w-16 text-muted-foreground/30" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Your shopping list is empty</h2>
            <p className="text-muted-foreground mb-10 max-w-sm px-6">
              Ingredients you mark as missing while exploring or planning will appear here.
            </p>
            <Button asChild className="bg-primary text-white font-bold h-12 px-10 rounded-xl shadow-lg hover:shadow-primary/20 transition-all">
              <Link href="/meal-plan">Go to Meal Plan</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShoppingListPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <ShoppingListContent />
      </Suspense>
    </ProtectedRoute>
  );
}
