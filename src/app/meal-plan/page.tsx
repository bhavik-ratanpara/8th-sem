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
  const [planServings, setPlanServings] = useState<number>(2);
  const [healthGoal, setHealthGoal] = useState<
    'No Preference' | 'Weight Loss' | 'Muscle Gain' |
    'Diabetic Friendly' | 'Heart Healthy'
  >('No Preference');
  const [goalDropdownOpen, setGoalDropdownOpen] = useState(false);

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
  const handleSave = async (planToSave?: WeeklyMealPlan) => {
    const targetPlan = planToSave || plan;
    if (!user || !targetPlan) return;
    setIsSaving(true);
    try {
      await saveMealPlan(user.uid, targetPlan);
      setHasChanges(false);
      // No toast for auto-save to keep it silent and smooth, 
      // or a subtle one if preferred. We'll keep it silent for a premium feel.
    } catch (error) {
      toast({ variant: "destructive", title: "Auto-save failed", description: "Please check your connection." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearMenu = () => {
    if (!plan || !user) return;
    const confirmClear = window.confirm("Are you sure you want to delete the entire menu for this week?");
    if (!confirmClear) return;
    
    const clearedPlan: WeeklyMealPlan = { weekStartDate: weekStartDateStr };
    setPlan(clearedPlan);
    handleSave(clearedPlan);
    toast({ title: "Menu deleted", description: "The plan for this week has been cleared." });
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const dishesArray: string[] = [];
      const result = await generateMealPlan({
        dietType,
        cuisinePreference: cuisinePreference || '',
        specificDishes: dishesArray,
        healthGoal: healthGoal === 'No Preference' ? undefined : healthGoal,
      });

      const newPlan: WeeklyMealPlan = {
        weekStartDate: weekStartDateStr,
      };

      DAYS.forEach(day => {
        newPlan[day] = {
          breakfast: { 
            dishName: result[day].breakfast.name, 
            servings: planServings, 
            cuisine: cuisinePreference || '',
            dietType: result[day].breakfast.diet,
          },
          lunch: { 
            dishName: result[day].lunch.name, 
            servings: planServings, 
            cuisine: cuisinePreference || '',
            dietType: result[day].lunch.diet,
          },
          dinner: { 
            dishName: result[day].dinner.name, 
            servings: planServings, 
            cuisine: cuisinePreference || '',
            dietType: result[day].dinner.diet,
          },
        };
      });

      setPlan(newPlan);
      setHasChanges(true);
      toast({ title: "Plan generated! ✨", description: "Saving your weekly menu..." });
      handleSave(newPlan);
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
    if (!plan) return;

    const dayPlan = { ...(plan[day] || {}) };
    if (slot === null) {
      delete dayPlan[meal];
    } else {
      dayPlan[meal] = slot;
    }

    const nextPlan = { ...plan, [day]: dayPlan };
    setPlan(nextPlan);
    setHasChanges(true);
    setEditingSlot(null);

    // Auto-save the change
    handleSave(nextPlan);
  };

  const startEditing = (day: typeof DAYS[number], meal: typeof MEALS[number], currentSlot?: MealSlot) => {
    setEditingSlot({ day, meal });
    setEditValue(currentSlot?.dishName || '');
    setEditServings(currentSlot?.servings || 2);
    setEditCuisine(currentSlot?.cuisine || '');
    setEditDiet(currentSlot?.dietType || 'Vegetarian');
  };

  const [editDiet, setEditDiet] = useState('Vegetarian');

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
        <div className="bg-card border border-border rounded-2xl shadow-sm mb-10 overflow-visible relative z-30">
          <div className="px-5 py-3 flex flex-wrap items-end gap-x-5 gap-y-3">
            {/* Title */}
            <div className="flex items-center gap-2 mr-auto">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-foreground tracking-tight">AI Plan Generator</span>
            </div>

            {/* Diet pills */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Diet</span>
              <div className="flex bg-secondary/30 p-0.5 rounded-md border border-border/40">
                {(['Vegetarian', 'Non-Vegetarian', 'Mixed'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setDietType(type)}
                    className={cn(
                      "text-[11px] px-3 py-1.5 rounded font-semibold transition-all whitespace-nowrap",
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
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Cuisine <span className="text-destructive">*</span></span>
              <Input
                placeholder="e.g. Indian"
                value={cuisinePreference}
                onChange={(e) => setCuisinePreference(e.target.value)}
                className="h-8 w-[130px] text-xs rounded-md"
              />
            </div>

            {/* Servings */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Servings</span>
              <Input
                type="number"
                min="1"
                max="20"
                value={planServings}
                onChange={(e) => setPlanServings(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                className="h-8 w-[65px] text-xs rounded-md"
              />
            </div>

            {/* Goal */}
            <div className="space-y-1 relative">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Goal</span>
              <button
                onClick={() => setGoalDropdownOpen(!goalDropdownOpen)}
                className={cn(
                  "h-8 px-2.5 text-xs bg-background border border-input rounded-md text-foreground flex items-center gap-1.5 transition-all duration-200 min-w-[110px] justify-between hover:border-primary",
                  healthGoal !== 'No Preference' && "border-primary text-primary bg-primary/5"
                )}
              >
                <span className="truncate">
                  {healthGoal === 'No Preference' ? 'No Preference' : healthGoal === 'Diabetic Friendly' ? 'Diabetic' : healthGoal}
                </span>
                <ChevronDown className={cn("h-3 w-3 transition-transform shrink-0", goalDropdownOpen && "rotate-180")} />
              </button>

              {goalDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setGoalDropdownOpen(false)} />
                  <div className="absolute top-full right-0 mt-1.5 bg-popover border border-border rounded-lg shadow-2xl z-50 min-w-[180px] py-1 animate-in fade-in zoom-in-95 duration-100">
                    {(['No Preference', 'Weight Loss', 'Muscle Gain', 'Diabetic Friendly', 'Heart Healthy'] as const).map((goal) => (
                      <button
                        key={goal}
                        onClick={() => { setHealthGoal(goal); setGoalDropdownOpen(false); }}
                        className={cn(
                          "w-full text-left px-3 py-2 text-[12px] transition-colors",
                          healthGoal === goal ? "bg-primary/10 text-primary font-bold" : "text-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Generate */}
            <Button
              onClick={() => {
                if (!cuisinePreference.trim()) {
                  toast({ variant: "destructive", title: "Cuisine required", description: "Enter a cuisine (e.g. Indian)." });
                  return;
                }
                handleGenerateAI();
              }}
              disabled={isGenerating}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white text-xs font-bold px-5 rounded-md shadow-sm gap-1.5 h-8"
            >
              {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {isGenerating ? 'Generating…' : 'Generate'}
            </Button>
          </div>
        </div>

        {/* ── Meal Plan Grid ── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6 mb-20">
            {/* Menu Header with Clear Button */}
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">Your Weekly Menu</h3>
              {plan && Object.keys(plan).some(k => DAYS.includes(k as any) && Object.keys((plan as any)[k] || {}).length > 0) && (
                <Button
                  onClick={handleClearMenu}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive hover:text-destructive transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Delete Menu
                </Button>
              )}
            </div>

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
                              <div className="space-y-1.5 text-[10px]">
                                <div className="space-y-0.5">
                                  <span className="text-muted-foreground font-semibold uppercase tracking-wide text-[9px]">Dish Name</span>
                                  <Input
                                    autoFocus
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && editValue.trim() && updateSlot(day, meal, { dishName: editValue.trim(), servings: editServings, cuisine: editCuisine, dietType: editDiet })}
                                    className="h-7 text-xs"
                                    placeholder="e.g. Paneer Butter Masala"
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  <span className="text-muted-foreground font-semibold uppercase tracking-wide text-[9px]">Servings</span>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={editServings}
                                    onChange={(e) => setEditServings(parseInt(e.target.value) || 2)}
                                    className="h-7 text-xs"
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  <span className="text-muted-foreground font-semibold uppercase tracking-wide text-[9px]">Cuisine / Region</span>
                                  <Input
                                    value={editCuisine}
                                    onChange={(e) => setEditCuisine(e.target.value)}
                                    className="h-7 text-xs"
                                    placeholder="e.g. Indian"
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  <span className="text-muted-foreground font-semibold uppercase tracking-wide text-[9px]">Diet Type</span>
                                  <select
                                    value={editDiet}
                                    onChange={(e) => setEditDiet(e.target.value)}
                                    className="w-full h-7 text-xs bg-background border border-input rounded-md px-2"
                                  >
                                    <option value="Vegetarian">Vegetarian</option>
                                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                                  </select>
                                </div>
                                <div className="flex gap-1 justify-end pt-0.5">
                                  <Button size="icon" variant="ghost" className="h-6 w-6 text-green-600" onClick={() => editValue.trim() && updateSlot(day, meal, { dishName: editValue.trim(), servings: editServings, cuisine: editCuisine, dietType: editDiet })}>
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
                                      const dietParam = slot?.dietType ? `&diet=${encodeURIComponent(slot.dietType)}` : '';
                                      router.push(`/generator?dish=${encodeURIComponent(slot?.dishName || '')}${slot?.servings ? `&servings=${slot.servings}` : ''}${slot?.cuisine ? `&cuisine=${encodeURIComponent(slot.cuisine)}` : ''}${healthGoal !== 'No Preference' ? `&goal=${encodeURIComponent(healthGoal)}` : ''}${dietParam}`);
                                    }}
                                    className="text-sm font-semibold text-foreground text-left hover:text-primary transition-colors line-clamp-2"
                                  >
                                    {dish}
                                  </button>
                                  <div className="text-[10px] text-muted-foreground mt-1">
                                    {plan?.[day]?.[meal]?.servings && <span>{plan[day]![meal]!.servings} srv</span>}
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
                                <div className="space-y-1">
                                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Dish Name</span>
                                  <Input
                                    autoFocus
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="h-9 text-sm"
                                    placeholder="e.g. Paneer Butter Masala"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Servings</span>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={editServings}
                                    onChange={(e) => setEditServings(parseInt(e.target.value) || 2)}
                                    className="h-9 text-sm"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Cuisine / Region</span>
                                  <Input
                                    value={editCuisine}
                                    onChange={(e) => setEditCuisine(e.target.value)}
                                    className="h-9 text-sm"
                                    placeholder="e.g. Indian"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Diet Type</span>
                                  <select
                                    value={editDiet}
                                    onChange={(e) => setEditDiet(e.target.value)}
                                    className="w-full h-9 text-sm bg-background border border-input rounded-md px-2"
                                  >
                                    <option value="Vegetarian">Vegetarian</option>
                                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                                  </select>
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <Button size="icon" className="h-8 w-8 bg-green-600" onClick={() => editValue.trim() && updateSlot(day, meal, { dishName: editValue.trim(), servings: editServings, cuisine: editCuisine, dietType: editDiet })}>
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
                                      const dietParam = slot?.dietType ? `&diet=${encodeURIComponent(slot.dietType)}` : '';
                                      router.push(`/generator?dish=${encodeURIComponent(slot?.dishName || '')}${slot?.servings ? `&servings=${slot.servings}` : ''}${slot?.cuisine ? `&cuisine=${encodeURIComponent(slot.cuisine)}` : ''}${healthGoal !== 'No Preference' ? `&goal=${encodeURIComponent(healthGoal)}` : ''}${dietParam}`);
                                    }}
                                    className="text-sm font-semibold text-foreground hover:text-primary transition-colors text-left line-clamp-2"
                                  >
                                    {dish}
                                  </button>
                                  <div className="text-xs text-muted-foreground mt-0.5">
                                    {plan?.[day]?.[meal]?.servings && <span>{plan[day]![meal]!.servings} srv</span>}
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
