'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { type CreateRecipeInput } from '@/ai/schemas';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  dishName: z.string().min(1, 'Please enter a recipe name.'),
  servings: z.coerce.number().min(1, 'Minimum 1 serving.').max(100, 'Maximum 100 servings.'),
  location: z.string().min(1, 'Please enter a region or cuisine.'),
  language: z.string().min(1, 'Please enter a language.'),
  diet: z.enum(['Vegetarian', 'Non-Vegetarian'], { required_error: 'Please pick a diet type.' }),
});

type RecipeFormProps = {
  onSubmit: (values: CreateRecipeInput) => void;
  isLoading: boolean;
  selectedDishName?: string | null;
};

export function RecipeForm({ onSubmit, isLoading, selectedDishName }: RecipeFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dishName: '',
      servings: undefined,
      location: '',
      language: 'English',
      diet: 'Vegetarian',
    },
  });
  
  useEffect(() => {
    if (selectedDishName) {
      form.setValue('dishName', selectedDishName);
    }
  }, [selectedDishName, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
  };

  return (
    <div className="relative bg-card border border-border p-8 rounded-lg shadow-sm mt-24">
      {/* Peeking Chef Image - Positioned so hands sit naturally on the border */}
      <img 
        src="/chefsee.png" 
        alt="Chef looking into form" 
        className="absolute -top-[92px] left-6 w-[130px] h-auto pointer-events-none z-20" 
      />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-10">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Create Your Recipe</h2>
            <p className="text-[15px] text-muted-foreground">Fill in the details below to generate your recipe.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="dishName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] font-medium text-foreground">Recipe Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Pasta Carbonara" className="input-saas h-12" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="servings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] font-medium text-foreground">Number of Servings</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      max="100" 
                      placeholder="4" 
                      className="input-saas h-12" 
                      {...field} 
                      onChange={(e) => {
                        let val = e.target.value;
                        if (val === '') {
                          field.onChange(undefined);
                          return;
                        }
                        let value = parseInt(val);
                        if (isNaN(value) || value < 1) {
                          value = 1;
                          toast({ description: "Minimum 1 serving", duration: 2000 });
                        }
                        if (value > 100) {
                          value = 100;
                          toast({ description: "Maximum 100 servings", duration: 2000 });
                        }
                        field.onChange(value);
                      }} 
                      value={field.value ?? ''} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] font-medium text-foreground">Cuisine / Region</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Italian, Indian, Mexican" className="input-saas h-12" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] font-medium text-foreground">Language</FormLabel>
                  <FormControl>
                    <Input placeholder="English" className="input-saas h-12" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="diet"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel className="text-[13px] font-medium text-foreground">Diet Type</FormLabel>
                <FormControl>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label 
                      htmlFor="diet-veg"
                      className={cn(
                        "flex items-center border rounded-lg px-4 h-12 cursor-pointer transition-all duration-200 group",
                        field.value === "Vegetarian" 
                          ? "bg-[#f0fdf4] border-2 border-[#16a34a] text-[#15803d] dark:bg-[#052e16] dark:text-[#4ade80]" 
                          : "bg-background border-border text-muted-foreground hover:border-muted-foreground/50"
                      )}
                    >
                      <input 
                        type="radio"
                        id="diet-veg"
                        name={field.name}
                        value="Vegetarian"
                        checked={field.value === "Vegetarian"}
                        onChange={() => field.onChange("Vegetarian")}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3 w-full">
                        <div className={cn(
                          "w-5 h-5 border flex items-center justify-center shrink-0 rounded-[2px] bg-transparent transition-colors",
                          field.value === "Vegetarian" ? "border-[#16a34a]" : "border-gray-400"
                        )}>
                          <span className={cn(
                            "text-[14px] leading-none mb-[1px]",
                            field.value === "Vegetarian" ? "text-[#16a34a]" : "text-gray-400"
                          )}>●</span>
                        </div>
                        <span className="text-[14px] font-semibold">Vegetarian</span>
                      </div>
                    </label>

                    <label 
                      htmlFor="diet-nonveg"
                      className={cn(
                        "flex items-center border rounded-lg px-4 h-12 cursor-pointer transition-all duration-200 group",
                        field.value === "Non-Vegetarian" 
                          ? "bg-[#fff1f2] border-2 border-[#dc2626] text-[#b91c1c] dark:bg-[#2d0a0a] dark:text-[#f87171]" 
                          : "bg-background border-border text-muted-foreground hover:border-muted-foreground/50"
                      )}
                    >
                      <input 
                        type="radio"
                        id="diet-nonveg"
                        name={field.name}
                        value="Non-Vegetarian"
                        checked={field.value === "Non-Vegetarian"}
                        onChange={() => field.onChange("Non-Vegetarian")}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3 w-full">
                        <div className={cn(
                          "w-5 h-5 border flex items-center justify-center shrink-0 rounded-[2px] bg-transparent transition-colors",
                          field.value === "Non-Vegetarian" ? "border-[#dc2626]" : "border-gray-400"
                        )}>
                          <span className={cn(
                            "text-[14px] leading-none mb-[2px]",
                            field.value === "Non-Vegetarian" ? "text-[#dc2626]" : "text-gray-400"
                          )}>▲</span>
                        </div>
                        <span className="text-[14px] font-semibold">Non-Vegetarian</span>
                      </div>
                    </label>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading} className="w-full bg-primary text-primary-foreground h-12 font-semibold rounded-md text-base shadow-sm">
            {isLoading ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                Creating Recipe...
              </>
            ) : (
              'Generate Recipe'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}