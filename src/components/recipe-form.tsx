'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Vegan, Beef } from 'lucide-react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { type CreateRecipeInput } from '@/ai/schemas';
import { useEffect } from 'react';

const formSchema = z.object({
  dishName: z.string().min(1, 'Please enter a recipe name.'),
  servings: z.coerce.number().min(1, 'Please enter 1 or more servings.'),
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
    <div className="bg-card border border-border p-8 rounded-lg shadow-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-10">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Create Your Recipe</h2>
            <p className="text-sm text-secondary-foreground">Fill in the details below to generate your recipe.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="dishName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] font-medium text-foreground">Recipe Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Pasta Carbonara" className="input-saas" {...field} />
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
                    <Input type="number" placeholder="4" className="input-saas" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} value={field.value ?? ''} />
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
                    <Input placeholder="e.g. Italian, Indian, Mexican" className="input-saas" {...field} />
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
                    <Input placeholder="English" className="input-saas" {...field} />
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
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    <FormItem className="flex items-center space-x-3 border border-border rounded-md px-5 py-4 flex-1 cursor-pointer bg-secondary/20 hover:bg-secondary/40 transition-colors">
                      <FormControl>
                        <RadioGroupItem value="Vegetarian" />
                      </FormControl>
                      <FormLabel className="font-medium text-sm cursor-pointer flex items-center gap-3">
                        <Vegan className="w-5 h-5 text-primary" /> Vegetarian
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 border border-border rounded-md px-5 py-4 flex-1 cursor-pointer bg-secondary/20 hover:bg-secondary/40 transition-colors">
                      <FormControl>
                        <RadioGroupItem value="Non-Vegetarian" />
                      </FormControl>
                      <FormLabel className="font-medium text-sm cursor-pointer flex items-center gap-3">
                        <Beef className="w-5 h-5 text-primary" /> Non-Vegetarian
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
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
