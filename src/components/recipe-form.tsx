'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Utensils, MapPin, Languages, Users, Vegan, Beef, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { type CreateRecipeInput } from '@/ai/schemas';
import { useEffect } from 'react';

const formSchema = z.object({
  dishName: z.string().min(1, 'Please specify the dish name.'),
  servings: z.coerce.number().min(1, 'At least 1 serving is required.'),
  location: z.string().min(1, 'Specify a location for local flavor.'),
  language: z.string().min(1, 'Select a language for the recipe.'),
  diet: z.enum(['Vegetarian', 'Non-Vegetarian'], { required_error: 'Select a dietary preference.' }),
});

type RecipeFormProps = {
  onSubmit: (values: CreateRecipeInput) => void;
  isLoading: boolean;
  selectedDishName?: string | null;
};

export function RecipeForm({ onSubmit, isLoading, selectedDishName }: RecipeFormProps) {
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
    <div className="culinary-card p-8 md:p-12 animate-fade-in">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-10">
          <div className="text-center md:text-left space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent font-bold text-[10px] uppercase tracking-widest">
                <Utensils className="w-3 h-3" />
                Recipe Creation
              </div>
              <h2 className="text-3xl md:text-4xl font-headline font-bold italic">Craft Your Masterpiece</h2>
              <p className="text-muted-foreground text-base max-w-xl">
                Define the parameters for your next culinary creation. Our AI chef will tailor every detail to your needs.
              </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="dishName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <Utensils size={14} className="text-primary" /> Dish Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Boeuf Bourguignon" className="rounded-xl border-border/50 h-12 bg-background/50" {...field} />
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
                  <FormLabel className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <Users size={14} className="text-primary" /> Guest Count
                  </FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="4" className="rounded-xl border-border/50 h-12 bg-background/50" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} value={field.value ?? ''} />
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
                  <FormLabel className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <MapPin size={14} className="text-primary" /> Regional Influence
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Tuscany, Italy" className="rounded-xl border-border/50 h-12 bg-background/50" {...field} />
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
                  <FormLabel className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <Languages size={14} className="text-primary" /> Language
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="English" className="rounded-xl border-border/50 h-12 bg-background/50" {...field} />
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
                <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Dietary Preference</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0 px-6 py-4 rounded-2xl border border-border/50 bg-background/30 hover:bg-accent/5 transition-colors cursor-pointer flex-1">
                      <FormControl>
                        <RadioGroupItem value="Vegetarian" className="border-accent text-accent" />
                      </FormControl>
                      <FormLabel className="font-bold flex items-center gap-2 cursor-pointer">
                        <Vegan className="text-accent w-4 h-4" /> Vegetarian
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0 px-6 py-4 rounded-2xl border border-border/50 bg-background/30 hover:bg-accent/5 transition-colors cursor-pointer flex-1">
                      <FormControl>
                        <RadioGroupItem value="Non-Vegetarian" className="border-primary text-primary" />
                      </FormControl>
                      <FormLabel className="font-bold flex items-center gap-2 cursor-pointer">
                        <Beef className="text-primary w-4 h-4" /> Non-Vegetarian
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading} className="pill-button w-full h-16 text-lg bg-accent hover:bg-accent/90 text-white shadow-xl">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                Crafting...
              </>
            ) : (
              <>Initialize Recipe <Sparkles className="ml-2 h-5 w-5"/></>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}