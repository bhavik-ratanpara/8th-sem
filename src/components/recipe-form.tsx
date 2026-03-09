'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Utensils, MapPin, Languages, Users, Vegan, Beef, UtensilsCrossed } from 'lucide-react';
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
  dishName: z.string().min(1, 'Dish name is required.'),
  servings: z.coerce.number().min(1, 'Number of servings must be at least 1.'),
  location: z.string().min(1, 'State, Country is required.'),
  language: z.string().min(1, 'Language is required.'),
  diet: z.enum(['Vegetarian', 'Non-Vegetarian'], { required_error: 'Please select a dietary preference.' }),
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
      language: '',
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
            <Utensils className="w-6 h-6 text-primary" />
            <h2 className="text-xl md:text-2xl font-headline font-bold">CREATE A NEW RECIPE</h2>
        </div>
        <p className="text-muted-foreground -mt-2 mb-6 text-sm md:text-base">Fill in the details below and let our AI chef craft a recipe for you.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="dishName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Utensils size={16} /> Dish Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Pizza" {...field} />
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
                <FormLabel className="flex items-center gap-2"><Users size={16} /> Number of Servings</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 4" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} value={field.value ?? ''} />
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
                <FormLabel className="flex items-center gap-2"><MapPin size={16} /> State, Country (For specific taste)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., California, USA" {...field} />
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
                <FormLabel className="flex items-center gap-2"><Languages size={16} /> Language</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., English" {...field} />
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
            <FormItem className="space-y-3">
              <FormLabel>Dietary Preference</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Vegetarian" />
                    </FormControl>
                    <FormLabel className="font-normal flex items-center gap-2"><Vegan className="text-green-600" /> Vegetarian</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Non-Vegetarian" />
                    </FormControl>
                    <FormLabel className="font-normal flex items-center gap-2"><Beef className="text-red-500"/> Non-Vegetarian</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full text-base md:text-lg py-5 md:py-6 bg-accent hover:bg-accent/90 text-white shadow-lg transition-transform hover:scale-[1.01]">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>Generate Recipe <UtensilsCrossed className="ml-2 h-5 w-5"/></>
          )}
        </Button>
      </form>
    </Form>
  );
}