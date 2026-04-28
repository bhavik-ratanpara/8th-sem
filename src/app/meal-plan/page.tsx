'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { useUser } from '@/firebase';
import {
  saveMealPlan,
  getMealPlan,
  saveGroceryList,
  deleteGrocerySection,
  type WeeklyMealPlan,
  type DayPlan,
  type MealSlot,
  type GroceryItem,
  type GrocerySection
} from '@/lib/meal-plan';
import { generateMealPlan } from '@/ai/flows/generate-meal-plan-flow';
import { generateGroceryListBatched as generateGroceryList } from '@/ai/flows/generate-grocery-list-flow';
import {
  startOfWeek,
  addDays,
  format,
  addWeeks,
  subWeeks,
  parseISO
} from 'date-fns';
import {
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Loader2,
  ArrowLeft,
  Sparkles,
  Check,
  X,
  Save,
  ShoppingCart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { FoodDecorations } from '@/components/FoodDecorations';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const MEALS = ['breakfast', 'lunch', 'dinner'] as const;

const CATEGORY_EMOJI: Record<string, string> = {
  'Vegetables': '🥬',
  'Fruits': '🍎',
  'Grains & Cereals': '🌾',
  'Lentils & Pulses': '🫘',
  'Dairy & Eggs': '🥛',
  'Meat & Poultry': '🍗',
  'Seafood': '🐟',
  'Spices & Masalas': '🌶️',
  'Oils & Condiments': '🫒',
  'Others': '📦',
};

function MealPlanContent() {
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  // ── STATE ──
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [plan, setPlan] = useState<WeeklyMealPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // AI Inputs
  const [dietType, setDietType] = useState<'Vegetarian' | 'Non-Vegetarian' | 'Mixed'>('Mixed');
  const [cuisinePreference, setCuisinePreference] = useState('');
  const [healthGoal, setHealthGoal] = useState<
    'No Preference' | 'Weight Loss' | 'Muscle Gain' |
    'Diabetic Friendly' | 'Heart Healthy'
  >('No Preference');

  // Editing State
  const [editingSlot, setEditingSlot] = useState<{ day: typeof DAYS[number], meal: typeof MEALS[number] } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editServings, setEditServings] = useState<number>(2);
  const [editCuisine, setEditCuisine] = useState('');

  // Grocery List State
  const [grocerySections, setGrocerySections] = useState<GrocerySection[]>([]);
  const [isGeneratingGrocery, setIsGeneratingGrocery] = useState(false);
  const [groceryStartDay, setGroceryStartDay] = useState<typeof DAYS[number]>('monday');
  const [grocerySelectedDays, setGrocerySelectedDays] = useState<Set<number>>(new Set([0, 1, 2]));
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

  const weekStartDateStr = format(weekStart, 'yyyy-MM-dd');

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

  // ── DATA FETCHING ──
  useEffect(() => {
    const fetchPlan = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const data = await getMealPlan(user.uid, weekStartDateStr);
        setPlan(data || { weekStartDate: weekStartDateStr });
        if (data?.grocerySections) {
          setGrocerySections(data.grocerySections);
        } else {
          setGrocerySections([]);
        }
        setOpenSections(new Set());
        setOpenCategories(new Set());
        setHasChanges(false);
      } catch (error) {
        console.error("Error fetching meal plan:", error);
        toast({ variant: "destructive", title: "Failed to load meal plan" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlan();
  }, [user, weekStartDateStr, toast]);

  // ── ACTIONS ──
  const handleSave = async () => {
    if (!user || !plan) return;
    setIsSaving(true);
    try {
      await saveMealPlan(user.uid, plan);
      setHasChanges(false);
      toast({ title: "Meal plan saved! 🥗", description: "Your week is all planned out." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error saving plan" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const dishesArray: string[] = [];
      const result = await generateMealPlan({
        dietType,
        cuisinePreference: cuisinePreference || 'Mixed',
        specificDishes: dishesArray,
        healthGoal: healthGoal === 'No Preference' ? undefined : healthGoal,
      });

      const newPlan: WeeklyMealPlan = {
        weekStartDate: weekStartDateStr,
      };

      DAYS.forEach(day => {
        newPlan[day] = {
          breakfast: { dishName: result[day].breakfast, servings: 2, cuisine: cuisinePreference || 'Mixed' },
          lunch: { dishName: result[day].lunch, servings: 2, cuisine: cuisinePreference || 'Mixed' },
          dinner: { dishName: result[day].dinner, servings: 2, cuisine: cuisinePreference || 'Mixed' },
        };
      });

      setPlan(newPlan);
      setHasChanges(true);
      toast({ title: "Plan generated! ✨", description: "AI has filled your week." });
    } catch (error) {
      toast({ variant: "destructive", title: "Generation failed", description: "Please try again." });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateGroceryList = async () => {
    if (!plan || !user) return;

    const startIndex = DAYS.indexOf(groceryStartDay);
    const selectedDays = [0, 1, 2]
      .filter(offset => grocerySelectedDays.has(offset))
      .map(offset => DAYS[(startIndex + offset) % 7]);

    const daysKey = selectedDays.join(',');
    const daysLabel = selectedDays.map(d =>
      d.charAt(0).toUpperCase() + d.slice(1)
    ).join(' → ');

    const meals: { dishName: string; servings: number; cuisine: string }[] = [];

    selectedDays.forEach(day => {
      MEALS.forEach(meal => {
        const slot = plan[day]?.[meal];
        if (slot?.dishName) {
          meals.push({
            dishName: slot.dishName,
            servings: slot.servings || 2,
            cuisine: slot.cuisine || 'Mixed',
          });
        }
      });
    });

    if (meals.length === 0) {
      toast({
        variant: "destructive",
        title: "No meals found",
        description: `No meals planned for ${daysLabel}`
      });
      return;
    }

    setIsGeneratingGrocery(true);
    try {
      const result = await generateGroceryList({ meals });

      const newSection: GrocerySection = {
        days: daysKey,
        daysLabel: daysLabel,
        items: result.items,
        generatedAt: Date.now(),
      };

      const updatedSections = grocerySections.filter(
        s => s.days !== daysKey
      );
      updatedSections.push(newSection);

      setGrocerySections(updatedSections);
      setOpenSections(new Set());
      setOpenCategories(new Set());

      await saveGroceryList(user.uid, weekStartDateStr, newSection, grocerySections);

      toast({ title: "Grocery list ready! 🛒" });
      setTimeout(() => {
        document.getElementById('grocery-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } catch (error) {
      console.error('Grocery list error:', error);
      toast({
        variant: "destructive",
        title: "Failed to generate grocery list",
        description: String(error)
      });
    } finally {
      setIsGeneratingGrocery(false);
    }
  };

  const toggleSection = (days: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(days)) {
        next.delete(days);
      } else {
        next.add(days);
      }
      return next;
    });
  };

  const toggleCategory = (key: string) => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleDeleteGrocerySection = async (days: string) => {
    if (!user) return;
    const updated = grocerySections.filter(s => s.days !== days);
    setGrocerySections(updated);
    try {
      await deleteGrocerySection(user.uid, weekStartDateStr, days, grocerySections);
      toast({ title: "Section removed 🗑️" });
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to delete section" });
    }
  };

  const toggleGroceryDay = (offset: number) => {
    if (offset === 0) return; // starting day always selected
    setGrocerySelectedDays(prev => {
      const next = new Set(prev);
      if (next.has(offset)) {
        next.delete(offset);
      } else {
        next.add(offset);
      }
      return next;
    });
  };

  const updateSlot = (day: typeof DAYS[number], meal: typeof MEALS[number], slot: MealSlot | null) => {
    setPlan(prev => {
      if (!prev) return prev;
      const dayPlan = { ...(prev[day] || {}) };
      if (slot === null) {
        delete dayPlan[meal];
      } else {
        dayPlan[meal] = slot;
      }
      return { ...prev, [day]: dayPlan };
    });
    setHasChanges(true);
    setEditingSlot(null);
  };

  const startEditing = (day: typeof DAYS[number], meal: typeof MEALS[number], currentSlot?: MealSlot) => {
    setEditingSlot({ day, meal });
    setEditValue(currentSlot?.dishName || '');
    setEditServings(currentSlot?.servings || 2);
    setEditCuisine(currentSlot?.cuisine || '');
  };

  const weekRange = `${format(weekStart, 'MMM d')} – ${format(addDays(weekStart, 6), 'MMM d, yyyy')}`;

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
                className="text-4xl tracking-tight text-foreground"
                style={{ fontFamily: "'Regalia Monarch', serif", fontWeight: 'normal' }}
              >
                WEEKLY MEAL PLAN
              </h1>
              <p className="text-muted-foreground text-base" style={{ fontFamily: "'Dropline', sans-serif" }}>
                Plan your healthy meals for the week ahead
              </p>
            </div>

            <div className="mt-4 md:mt-0 md:absolute md:right-0 md:bottom-0 flex items-center gap-4 bg-card border border-border p-1.5 rounded-xl shadow-sm mb-2 md:mb-0">
              <Button variant="ghost" size="icon" onClick={() => setWeekStart(subWeeks(weekStart, 1))} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-bold min-w-[140px] text-center">{weekRange}</span>
              <Button variant="ghost" size="icon" onClick={() => setWeekStart(addWeeks(weekStart, 1))} className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div
        className="max-content px-4 pb-16 relative z-10"
        style={{ paddingTop: navbarH + headerH + 24 }}
      >
        {/* ── AI Generator ── */}
        <div className="bg-card border border-border rounded-2xl shadow-sm mb-10 overflow-hidden">
          {/* Top row: title + generate button */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border/50">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-base font-bold text-foreground tracking-tight">AI Plan Generator</span>
            </div>
            <Button
              onClick={handleGenerateAI}
              disabled={isGenerating}
              size="default"
              className="bg-primary hover:bg-primary/90 text-white text-sm font-bold px-6 rounded-lg shadow-sm gap-2 h-9"
            >
              {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {isGenerating ? 'Generating…' : 'Generate Plan'}
            </Button>
          </div>
          {/* Bottom row: controls */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3">
            {/* Diet pills */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mr-1">Diet</span>
              <div className="flex bg-secondary/30 p-1 rounded-lg border border-border/40">
                {(['Vegetarian', 'Non-Vegetarian', 'Mixed'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setDietType(type)}
                    className={cn(
                      "text-xs px-4 py-2 rounded-md font-semibold transition-all whitespace-nowrap",
                      dietType === type
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {type === 'Non-Vegetarian' ? 'Non-Veg' : type}
                  </button>
                ))}
              </div>
            </div>
            {/* Cuisine */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cuisine</span>
              <Input
                placeholder="e.g. Indian"
                value={cuisinePreference}
                onChange={(e) => setCuisinePreference(e.target.value)}
                className="h-9 w-[150px] text-sm rounded-lg border-border/50"
              />
            </div>
            {/* Health Goal */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Goal</span>
              <div className="relative">
                <select
                  value={healthGoal}
                  onChange={(e) => setHealthGoal(e.target.value as any)}
                  className="h-9 pl-4 pr-8 text-sm bg-background border border-border/50 rounded-lg text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/50"
                >
                  <option value="No Preference">Any</option>
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Muscle Gain">Muscle Gain</option>
                  <option value="Diabetic Friendly">Diabetic Friendly</option>
                  <option value="Heart Healthy">Heart Healthy</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Meal Plan Grid ── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-10 mb-20">
            {/* Desktop Grid */}
            <div className="hidden lg:block overflow-x-auto">
              <div className="min-w-[1000px] bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                {/* Header Row */}
                <div className="grid grid-cols-8 border-b border-border">
                  <div className="p-3 bg-secondary/5" />
                  {DAYS.map(day => (
                    <div key={day} className="p-4 text-center border-l border-border/50 bg-secondary/5">
                      <span className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground">{day.slice(0, 3)}</span>
                    </div>
                  ))}
                </div>

                {/* Meal Rows */}
                {MEALS.map((meal, mealIdx) => {
                  const mealColor = meal === 'breakfast' ? 'text-amber-500' : meal === 'lunch' ? 'text-emerald-500' : 'text-indigo-400';
                  const mealBg = meal === 'breakfast' ? 'bg-amber-500/5' : meal === 'lunch' ? 'bg-emerald-500/5' : 'bg-indigo-500/5';
                  return (
                    <div key={meal} className={cn("grid grid-cols-8", mealIdx < 2 && "border-b border-border")} style={{ minHeight: '130px' }}>
                      <div className={cn("p-4 flex items-center justify-center border-r border-border/50", mealBg)}>
                        <span className={cn("text-xs font-black uppercase tracking-[0.2em] rotate-[-90deg] whitespace-nowrap", mealColor)}>{meal}</span>
                      </div>
                      {DAYS.map(day => {
                        const dish = plan?.[day]?.[meal]?.dishName;
                        const isEditing = editingSlot?.day === day && editingSlot?.meal === meal;

                        return (

                          <div key={`${day}-${meal}`} className={cn("p-3 transition-colors relative group border-l border-border/50", dish && mealBg)}>
                            {isEditing ? (
                              <div className="space-y-2">
                                <Input
                                  autoFocus
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && editValue.trim() && updateSlot(day, meal, { dishName: editValue.trim(), servings: editServings, cuisine: editCuisine })}
                                  className="h-7 text-xs"
                                  placeholder="Dish name..."
                                />
                                <div className="flex gap-1">
                                  <Input
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={editServings}
                                    onChange={(e) => setEditServings(parseInt(e.target.value) || 2)}
                                    className="h-7 text-xs w-16"
                                    placeholder="Srv"
                                    title="Servings"
                                  />
                                  <Input
                                    value={editCuisine}
                                    onChange={(e) => setEditCuisine(e.target.value)}
                                    className="h-7 text-xs flex-1"
                                    placeholder="Cuisine"
                                  />
                                </div>
                                <div className="flex gap-1 justify-end">
                                  <Button size="icon" variant="ghost" className="h-6 w-6 text-green-600" onClick={() => editValue.trim() && updateSlot(day, meal, { dishName: editValue.trim(), servings: editServings, cuisine: editCuisine })}>
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => setEditingSlot(null)}>
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ) : dish ? (
                              <div className="h-full flex flex-col justify-between">
                                <div>
                                  <button
                                    onClick={() => {
                                      const slot = plan?.[day]?.[meal];
                                      router.push(`/?dish=${encodeURIComponent(slot?.dishName || '')}${slot?.servings ? `&servings=${slot.servings}` : ''}${slot?.cuisine ? `&cuisine=${encodeURIComponent(slot.cuisine)}` : ''}${healthGoal !== 'No Preference' ? `&goal=${encodeURIComponent(healthGoal)}` : ''}`);
                                    }}
                                    className="text-sm font-semibold text-foreground text-left hover:text-primary transition-colors line-clamp-2"
                                  >
                                    {dish}
                                  </button>
                                  <div className="text-[10px] text-muted-foreground mt-1">
                                    {plan?.[day]?.[meal]?.servings && <span>{plan[day]![meal]!.servings} srv</span>}
                                    {plan?.[day]?.[meal]?.cuisine && <span> · {plan[day]![meal]!.cuisine}</span>}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => startEditing(day, meal, plan?.[day]?.[meal])}>
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => updateSlot(day, meal, null)}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="h-full flex items-center justify-center">
                                <Button
                                  variant="ghost"
                                  className="text-xs text-muted-foreground hover:text-primary gap-1.5 h-8 border border-dashed border-border"
                                  onClick={() => startEditing(day, meal)}
                                >
                                  <Plus className="h-3 w-3" /> Add Meal
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile / Tablet Vertical List */}
            <div className="lg:hidden space-y-4">
              {DAYS.map(day => (
                <div key={day} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                  <div className="px-5 py-4 bg-secondary/5 border-b border-border flex items-center justify-between">
                    <span className="text-sm font-black uppercase tracking-[0.15em] text-foreground">{day}</span>
                    <span className="text-xs text-muted-foreground font-medium">{weekRange}</span>
                  </div>
                  <div className="divide-y divide-border/50">
                    {MEALS.map(meal => {
                      const dish = plan?.[day]?.[meal]?.dishName;
                      const isEditing = editingSlot?.day === day && editingSlot?.meal === meal;
                      const mobileColor = meal === 'breakfast' ? 'border-l-amber-500' : meal === 'lunch' ? 'border-l-emerald-500' : 'border-l-indigo-400';
                      const mobileLabelColor = meal === 'breakfast' ? 'text-amber-500' : meal === 'lunch' ? 'text-emerald-500' : 'text-indigo-400';

                      return (
                        <div key={`${day}-${meal}`} className={cn("border-l-2 px-4 py-3", mobileColor)}>
                          <span className={cn("text-xs font-black uppercase tracking-[0.15em]", mobileLabelColor)}>{meal}</span>
                          <div className="mt-2">
                            {isEditing ? (
                              <div className="flex flex-col gap-2 w-full">
                                <Input
                                  autoFocus
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="h-9 text-sm"
                                  placeholder="Dish name..."
                                />
                                <div className="flex gap-2">
                                  <Input
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={editServings}
                                    onChange={(e) => setEditServings(parseInt(e.target.value) || 2)}
                                    className="h-9 text-sm w-20"
                                    placeholder="Servings"
                                  />
                                  <Input
                                    value={editCuisine}
                                    onChange={(e) => setEditCuisine(e.target.value)}
                                    className="h-9 text-sm flex-1"
                                    placeholder="Cuisine"
                                  />
                                </div>
                                <div className="flex gap-1 justify-end">
                                  <Button size="icon" className="h-8 w-8 bg-green-600" onClick={() => editValue.trim() && updateSlot(day, meal, { dishName: editValue.trim(), servings: editServings, cuisine: editCuisine })}>
                                    <Check className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button size="icon" variant="outline" className="h-8 w-8 border-destructive text-destructive" onClick={() => setEditingSlot(null)}>
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            ) : dish ? (
                              <div className="flex items-center justify-between w-full">
                                <div className="flex-1">
                                  <button
                                    onClick={() => {
                                      const slot = plan?.[day]?.[meal];
                                      router.push(`/?dish=${encodeURIComponent(slot?.dishName || '')}${slot?.servings ? `&servings=${slot.servings}` : ''}${slot?.cuisine ? `&cuisine=${encodeURIComponent(slot.cuisine)}` : ''}${healthGoal !== 'No Preference' ? `&goal=${encodeURIComponent(healthGoal)}` : ''}`);
                                    }}
                                    className="text-sm font-semibold text-foreground hover:text-primary transition-colors text-left line-clamp-2"
                                  >
                                    {dish}
                                  </button>
                                  <div className="text-xs text-muted-foreground mt-0.5">
                                    {plan?.[day]?.[meal]?.servings && <span>{plan[day]![meal]!.servings} srv</span>}
                                    {plan?.[day]?.[meal]?.cuisine && <span> · {plan[day]![meal]!.cuisine}</span>}
                                  </div>
                                </div>
                                <div className="flex gap-1 ml-4 shrink-0">
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => startEditing(day, meal, plan?.[day]?.[meal])}>
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => updateSlot(day, meal, null)}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <button
                                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                                onClick={() => startEditing(day, meal)}
                              >
                                <Plus className="h-3 w-3" /> Add meal
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Grocery List Section */}
            <div id="grocery-section" className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              {/* Header row */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  <span className="text-base font-bold text-foreground tracking-tight">Weekly Grocery List</span>
                  <span className="text-xs text-muted-foreground">3 days at a time</span>
                </div>
                <Button
                  onClick={handleGenerateGroceryList}
                  disabled={isGeneratingGrocery}
                  size="default"
                  className="bg-primary hover:bg-primary/90 text-white text-sm font-bold px-6 rounded-lg shadow-sm gap-2 h-9"
                >
                  {isGeneratingGrocery ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShoppingCart className="h-3.5 w-3.5" />}
                  {isGeneratingGrocery ? 'Generating…' : grocerySections.length > 0 ? 'Generate More' : 'Generate List'}
                </Button>
              </div>
              {/* Day selector row */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mr-1">Start</span>
                  <div className="flex bg-secondary/30 p-1 rounded-lg border border-border/40">
                    {DAYS.map(day => (
                      <button
                        key={day}
                        onClick={() => {
                          setGroceryStartDay(day);
                          setGrocerySelectedDays(new Set([0, 1, 2]));
                        }}
                        className={cn(
                          "text-xs px-3 py-1.5 rounded font-semibold uppercase tracking-wider transition-all",
                          day === groceryStartDay
                            ? "bg-primary text-white shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Days</span>
                  {[0, 1, 2].map(offset => {
                    const startIndex = DAYS.indexOf(groceryStartDay);
                    const day = DAYS[(startIndex + offset) % 7];
                    const isSelected = grocerySelectedDays.has(offset);
                    const isStart = offset === 0;
                    return (
                      <button
                        key={offset}
                        onClick={() => toggleGroceryDay(offset)}
                        className={cn(
                          "text-sm px-4 py-2 rounded-lg border font-semibold capitalize transition-all",
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/50 text-muted-foreground/50"
                        )}
                      >
                        {day.slice(0, 3)}
                        {isSelected && !isStart && <span className="ml-2 text-xs opacity-70">×</span>}
                        {isStart && isSelected && <span className="ml-2 text-xs opacity-70">✓</span>}
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs text-muted-foreground">
                  {[0, 1, 2]
                    .filter(offset => grocerySelectedDays.has(offset))
                    .map(offset => {
                      const startIndex = DAYS.indexOf(groceryStartDay);
                      const d = DAYS[(startIndex + offset) % 7];
                      return d.charAt(0).toUpperCase() + d.slice(1, 3);
                    })
                    .join(' → ')
                  }
                </span>
              </div>

              {isGeneratingGrocery && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}

              {grocerySections.length > 0 && !isGeneratingGrocery && (
                <div className="divide-y divide-border">
                  {grocerySections
                    .sort((a, b) => a.generatedAt - b.generatedAt)
                    .map((section) => {
                      const isSectionOpen = openSections.has(section.days);

                      const categoryOrder = [
                        'Vegetables', 'Fruits', 'Grains & Cereals',
                        'Lentils & Pulses', 'Dairy & Eggs',
                        'Meat & Poultry', 'Seafood',
                        'Spices & Masalas', 'Oils & Condiments', 'Others',
                      ];

                      const grouped = categoryOrder.reduce((acc, cat) => {
                        const items = section.items.filter(item => item.category === cat);
                        if (items.length > 0) acc[cat] = items;
                        return acc;
                      }, {} as Record<string, GroceryItem[]>);

                      return (
                        <div key={section.days} className="bg-background/50">
                          <div className="flex items-center pr-2 border-b border-border/40">
                            <button
                              onClick={() => toggleSection(section.days)}
                              className="flex-1 px-5 py-3.5 flex items-center justify-between hover:bg-secondary/10 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-1.5 rounded-lg">
                                  <ShoppingCart className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <span className="text-sm font-bold text-foreground">
                                  {section.daysLabel}
                                </span>
                                <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase bg-secondary px-2 py-0.5 rounded border border-border/50">
                                  {section.items.length} items
                                </span>
                              </div>
                              <ChevronDown className={cn(
                                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                                isSectionOpen && "rotate-180"
                              )} />
                            </button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteGrocerySection(section.days)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                              title="Delete section"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {isSectionOpen && (
                            <div className="border-b border-border/40 bg-secondary/5">
                              {Object.entries(grouped).map(([category, items]) => {
                                const catKey = `${section.days}-${category}`;
                                const isCatOpen = openCategories.has(catKey);

                                return (
                                  <div key={catKey} className="border-t border-border/20 first:border-t-0">
                                    <button
                                      onClick={() => toggleCategory(catKey)}
                                      className="w-full pl-12 pr-5 py-2.5 flex items-center justify-between hover:bg-secondary/10 transition-colors"
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <span className="text-sm">
                                          {CATEGORY_EMOJI[category] || '📦'}
                                        </span>
                                        <span className="text-sm font-semibold text-foreground">
                                          {category}
                                        </span>
                                        <span className="text-xs font-medium text-muted-foreground">
                                          ({items.length})
                                        </span>
                                      </div>
                                      <ChevronDown className={cn(
                                        "h-3 w-3 text-muted-foreground transition-transform duration-200",
                                        isCatOpen && "rotate-180"
                                      )} />
                                    </button>

                                    {isCatOpen && (
                                      <div className="pb-2 bg-background/50">
                                        {items.map((item, index) => (
                                          <div
                                            key={index}
                                            className="flex items-start pl-[4.5rem] pr-5 py-2 hover:bg-secondary/10 transition-colors border-l-2 border-transparent hover:border-primary/50 relative"
                                          >
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-[13px] font-medium text-foreground">
                                                  {item.name}
                                                </span>
                                                <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                                                  {item.quantity}
                                                </span>
                                              </div>
                                              <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                                                {item.neededFor.join(', ')}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}

                  <div className="px-6 py-3 bg-secondary/5">
                    <p className="text-[11px] text-muted-foreground font-medium">
                      {grocerySections.length} {grocerySections.length === 1 ? 'section' : 'sections'} · {grocerySections.reduce((sum, s) => sum + s.items.length, 0)} total items
                    </p>
                  </div>
                </div>
              )}

              {grocerySections.length === 0 && !isGeneratingGrocery && (
                <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                  <ShoppingCart className="h-10 w-10 text-muted-foreground/20 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Select starting day and click "Generate List" to get your grocery list
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Floating Save Button */}
        <div className={cn(
          "fixed bottom-6 right-6 z-[40] transition-all duration-300",
          hasChanges ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
        )}>
          <Button
            size="sm"
            disabled={isSaving}
            onClick={handleSave}
            className="h-11 px-6 rounded-full bg-primary text-white font-bold shadow-xl shadow-primary/25 gap-2 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? "Saving…" : "Save Plan"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function MealPlanPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <MealPlanContent />
      </Suspense>
    </ProtectedRoute>
  );
}
