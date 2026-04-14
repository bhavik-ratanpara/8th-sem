'use client';

import { useState, useEffect, Suspense } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { useUser } from '@/firebase';
import { 
  saveMealPlan, 
  getMealPlan, 
  type WeeklyMealPlan, 
  type DayPlan, 
  type MealSlot 
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
  const [specificDishes, setSpecificDishes] = useState('');

  // Editing State
  const [editingSlot, setEditingSlot] = useState<{ day: typeof DAYS[number], meal: typeof MEALS[number] } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editServings, setEditServings] = useState<number>(2);
  const [editCuisine, setEditCuisine] = useState('');

  // Grocery List State
  const [groceryList, setGroceryList] = useState<{
    name: string;
    quantity: string;
    neededFor: string[];
    category: string;
  }[] | null>(null);
  const [isGeneratingGrocery, setIsGeneratingGrocery] = useState(false);
  const [groceryStartDay, setGroceryStartDay] = useState<typeof DAYS[number]>('monday');

  const weekStartDateStr = format(weekStart, 'yyyy-MM-dd');

  // ── DATA FETCHING ──
  useEffect(() => {
    setGroceryList(null);
    const fetchPlan = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const data = await getMealPlan(user.uid, weekStartDateStr);
        setPlan(data || { weekStartDate: weekStartDateStr });
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
      const dishesArray = specificDishes ? specificDishes.split(',').map(d => d.trim()) : [];
      const result = await generateMealPlan({
        dietType,
        cuisinePreference: cuisinePreference || 'Mixed',
        specificDishes: dishesArray
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
    if (!plan) return;

    const startIndex = DAYS.indexOf(groceryStartDay);
    const selectedDays = [
      DAYS[startIndex % 7],
      DAYS[(startIndex + 1) % 7],
      DAYS[(startIndex + 2) % 7],
    ];

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
      toast({ variant: "destructive", title: "No meals found", description: `No meals planned for ${selectedDays.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}` });
      return;
    }

    setIsGeneratingGrocery(true);
    try {
      const result = await generateGroceryList({ meals });
      setGroceryList(result.items);
      toast({ title: "Grocery list ready! 🛒" });
      setTimeout(() => {
        document.getElementById('grocery-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } catch (error) {
      console.error('Grocery list error:', error);
      toast({ variant: "destructive", title: "Failed to generate grocery list", description: String(error) });
    } finally {
      setIsGeneratingGrocery(false);
    }
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
      <FoodDecorations />
      <div className="max-content px-4 py-8 relative z-10">
        
        {/* Navigation */}
        <Link 
          href="/"
          className="flex items-center gap-2 text-primary font-bold text-sm mb-6 hover:translate-x-[-4px] transition-transform w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Generator
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground" style={{ fontFamily: "Inter, sans-serif", fontWeight: 800 }}>
              Weekly Meal Plan
            </h1>
            <p className="text-muted-foreground text-base">Plan your healthy meals for the week ahead</p>
          </div>

          <div className="flex items-center gap-4 bg-card border border-border p-2 rounded-xl shadow-sm">
            <Button variant="ghost" size="icon" onClick={() => setWeekStart(subWeeks(weekStart, 1))}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-sm font-bold min-w-[180px] text-center">{weekRange}</span>
            <Button variant="ghost" size="icon" onClick={() => setWeekStart(addWeeks(weekStart, 1))}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* AI Generator Section */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Sparkles className="h-24 w-24 text-primary" />
          </div>
          <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate Plan with AI
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Diet Type</label>
              <div className="flex gap-2">
                {(['Vegetarian', 'Non-Vegetarian', 'Mixed'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setDietType(type)}
                    className={cn(
                      "text-xs px-3 py-2 rounded-md border font-medium flex-1 transition-all",
                      dietType === type 
                        ? "border-primary text-primary bg-primary/10" 
                        : "border-border text-muted-foreground hover:bg-secondary/50"
                    )}
                  >
                    {type === 'Non-Vegetarian' ? 'Non-Veg' : type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cuisine Preference</label>
              <Input 
                placeholder="e.g. Indian, Italian, Mixed" 
                value={cuisinePreference}
                onChange={(e) => setCuisinePreference(e.target.value)}
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Specific Dishes (optional)</label>
              <Input 
                placeholder="e.g. Pasta, Dal Rice..." 
                value={specificDishes}
                onChange={(e) => setSpecificDishes(e.target.value)}
                className="h-10 text-sm"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button 
              onClick={handleGenerateAI} 
              disabled={isGenerating}
              className="bg-primary hover:bg-primary/90 text-white font-bold h-11 px-8 rounded-xl gap-2 shadow-lg shadow-primary/20"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate Plan ✨
            </Button>
          </div>
        </div>

        {/* Meal Plan Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-10 mb-20">
            {/* Desktop Grid */}
            <div className="hidden lg:block overflow-x-auto">
              <div className="min-w-[1000px] bg-card border border-border rounded-2xl shadow-sm divide-y divide-border">
                {/* Header Row */}
                <div className="grid grid-cols-8 divide-x divide-border">
                  <div className="p-4 bg-secondary/5" />
                  {DAYS.map(day => (
                    <div key={day} className="p-4 text-center">
                      <span className="text-sm font-black uppercase tracking-widest text-foreground">{day}</span>
                    </div>
                  ))}
                </div>

                {/* Meal Rows */}
                {MEALS.map(meal => (
                  <div key={meal} className="grid grid-cols-8 divide-x divide-border" style={{ minHeight: '120px' }}>
                    <div className="p-4 bg-secondary/5 flex items-center justify-center border-r border-border">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground rotate-[-90deg] whitespace-nowrap">{meal}</span>
                    </div>
                    {DAYS.map(day => {
                      const dish = plan?.[day]?.[meal]?.dishName;
                      const isEditing = editingSlot?.day === day && editingSlot?.meal === meal;

                      return (
                        <div key={`${day}-${meal}`} className={cn("p-3 transition-colors relative group", dish && "bg-primary/[0.02]")}>
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
                                    router.push(`/?dish=${encodeURIComponent(slot?.dishName || '')}${slot?.servings ? `&servings=${slot.servings}` : ''}${slot?.cuisine ? `&cuisine=${encodeURIComponent(slot.cuisine)}` : ''}`);
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
                ))}
              </div>
            </div>

            {/* Mobile / Tablet Vertical List */}
            <div className="lg:hidden space-y-6">
              {DAYS.map(day => (
                <div key={day} className="bg-card border border-border rounded-xl p-5 shadow-sm">
                  <h3 className="text-base font-black uppercase tracking-widest text-foreground mb-4 border-b border-border pb-3 flex items-center justify-between">
                    {day}
                    <span className="text-[10px] text-muted-foreground font-medium">Week of {weekStartDateStr}</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {MEALS.map(meal => {
                      const dish = plan?.[day]?.[meal]?.dishName;
                      const isEditing = editingSlot?.day === day && editingSlot?.meal === meal;

                      return (
                        <div key={`${day}-${meal}`} className="flex flex-col gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">{meal}</span>
                          <div className={cn(
                            "min-h-[60px] rounded-lg border border-border flex items-center px-4 py-3",
                            dish ? "bg-primary/[0.03] border-primary/20" : "bg-secondary/10 border-dashed"
                          )}>
                            {isEditing ? (
                              <div className="flex flex-col gap-2 w-full">
                                <Input 
                                  autoFocus
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="h-10 text-sm"
                                  placeholder="Dish name..."
                                />
                                <div className="flex gap-2">
                                  <Input
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={editServings}
                                    onChange={(e) => setEditServings(parseInt(e.target.value) || 2)}
                                    className="h-10 text-sm w-20"
                                    placeholder="Servings"
                                  />
                                  <Input
                                    value={editCuisine}
                                    onChange={(e) => setEditCuisine(e.target.value)}
                                    className="h-10 text-sm flex-1"
                                    placeholder="Cuisine"
                                  />
                                </div>
                                <div className="flex gap-1 justify-end">
                                  <Button size="icon" className="h-10 w-10 bg-green-600" onClick={() => editValue.trim() && updateSlot(day, meal, { dishName: editValue.trim(), servings: editServings, cuisine: editCuisine })}>
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button size="icon" variant="outline" className="h-10 w-10 border-destructive text-destructive" onClick={() => setEditingSlot(null)}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ) : dish ? (
                              <div className="flex items-center justify-between w-full">
                                <div className="flex-1">
                                  <button 
                                    onClick={() => {
                                      const slot = plan?.[day]?.[meal];
                                      router.push(`/?dish=${encodeURIComponent(slot?.dishName || '')}${slot?.servings ? `&servings=${slot.servings}` : ''}${slot?.cuisine ? `&cuisine=${encodeURIComponent(slot.cuisine)}` : ''}`);
                                    }}
                                    className="text-sm font-bold text-foreground hover:text-primary transition-colors text-left line-clamp-2"
                                  >
                                    {dish}
                                  </button>
                                  <div className="text-[10px] text-muted-foreground mt-0.5">
                                    {plan?.[day]?.[meal]?.servings && <span>{plan[day]![meal]!.servings} srv</span>}
                                    {plan?.[day]?.[meal]?.cuisine && <span> · {plan[day]![meal]!.cuisine}</span>}
                                  </div>
                                </div>
                                <div className="flex gap-1 ml-4 shrink-0">
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => startEditing(day, meal, plan?.[day]?.[meal])}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => updateSlot(day, meal, null)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button 
                                variant="ghost" 
                                className="w-full text-xs text-muted-foreground hover:text-primary gap-2 h-10 border-none"
                                onClick={() => startEditing(day, meal)}
                              >
                                <Plus className="h-4 w-4" /> Add Meal
                              </Button>
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
              <div className="p-6 border-b border-border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2.5 rounded-xl">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-foreground">Weekly Grocery List</h2>
                      <p className="text-xs text-muted-foreground">Generate grocery list for 3 days at a time</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Starting from</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {DAYS.map(day => {
                        const startIndex = DAYS.indexOf(groceryStartDay);
                        const selectedDays = [
                          DAYS[startIndex % 7],
                          DAYS[(startIndex + 1) % 7],
                          DAYS[(startIndex + 2) % 7],
                        ];
                        const isStart = day === groceryStartDay;
                        const isSelected = selectedDays.includes(day);

                        return (
                          <button
                            key={day}
                            onClick={() => setGroceryStartDay(day)}
                            className={cn(
                              "text-[11px] px-2.5 py-1.5 rounded-md border font-semibold uppercase tracking-wider transition-all",
                              isStart
                                ? "border-primary text-white bg-primary"
                                : isSelected
                                ? "border-primary/40 text-primary bg-primary/10"
                                : "border-border text-muted-foreground hover:bg-secondary/50"
                            )}
                          >
                            {day.slice(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Generating for: {(() => {
                        const startIndex = DAYS.indexOf(groceryStartDay);
                        return [
                          DAYS[startIndex % 7],
                          DAYS[(startIndex + 1) % 7],
                          DAYS[(startIndex + 2) % 7],
                        ].map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(' → ');
                      })()}
                    </p>
                  </div>

                  <Button
                    onClick={handleGenerateGroceryList}
                    disabled={isGeneratingGrocery}
                    className="bg-primary hover:bg-primary/90 text-white font-bold h-10 px-6 rounded-xl gap-2"
                  >
                    {isGeneratingGrocery ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                    {isGeneratingGrocery ? 'Generating...' : groceryList ? 'Regenerate' : 'Generate List'}
                  </Button>
                </div>
              </div>

              {isGeneratingGrocery && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}

              {groceryList && !isGeneratingGrocery && (() => {
                const categoryOrder = [
                  'Vegetables',
                  'Fruits', 
                  'Grains & Cereals',
                  'Lentils & Pulses',
                  'Dairy & Eggs',
                  'Meat & Poultry',
                  'Seafood',
                  'Spices & Masalas',
                  'Oils & Condiments',
                  'Others',
                ];

                const grouped = categoryOrder.reduce((acc, cat) => {
                  const items = groceryList.filter(item => item.category === cat);
                  if (items.length > 0) acc[cat] = items;
                  return acc;
                }, {} as Record<string, typeof groceryList>);

                return (
                  <div>
                    {Object.entries(grouped).map(([category, items]) => (
                      <div key={category}>
                        <div className="px-6 py-3 bg-secondary/10 border-b border-border">
                          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                            {category}
                          </span>
                          <span className="ml-2 text-xs text-muted-foreground font-medium">
                            ({items!.length} {items!.length === 1 ? 'item' : 'items'})
                          </span>
                        </div>
                        {items!.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-start justify-between px-6 py-4 hover:bg-secondary/5 transition-colors border-b border-border/50 last:border-b-0"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-sm font-bold text-foreground">
                                  {item.name}
                                </span>
                                <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                  {item.quantity}
                                </span>
                              </div>
                              <div className="text-[11px] text-muted-foreground mt-1">
                                Needed for: {item.neededFor.join(', ')}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                    <div className="px-6 py-4 bg-secondary/5 border-t border-border">
                      <p className="text-xs text-muted-foreground font-medium">
                        Total: {groceryList.length} items across {Object.keys(grouped).length} categories · {(() => {
                          const startIndex = DAYS.indexOf(groceryStartDay);
                          return [
                            DAYS[startIndex % 7],
                            DAYS[(startIndex + 1) % 7],
                            DAYS[(startIndex + 2) % 7],
                          ].map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ');
                        })()}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {!groceryList && !isGeneratingGrocery && (
                <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                  <ShoppingCart className="h-10 w-10 text-muted-foreground/20 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Click "Generate Grocery List" to get a combined shopping list for your entire week
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Button - Floating/Fixed */}
        <div className="fixed bottom-8 right-8 z-[40]">
          <Button 
            size="lg"
            disabled={!hasChanges || isSaving}
            onClick={handleSave}
            className={cn(
              "h-14 px-8 rounded-full shadow-2xl font-bold gap-3 transition-all transform hover:scale-105 active:scale-95",
              hasChanges ? "bg-primary text-white" : "bg-muted text-muted-foreground cursor-not-allowed border border-border"
            )}
          >
            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {isSaving ? "Saving..." : "Save Plan"}
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