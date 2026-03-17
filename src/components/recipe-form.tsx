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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { type CreateRecipeInput } from '@/ai/schemas';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

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
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    {/* Vegetarian Card */}
                    <div 
                      className={cn(
                        "flex items-center justify-between border rounded-lg px-4 h-14 cursor-pointer transition-all duration-200 group",
                        field.value === "Vegetarian" 
                          ? "bg-[#f0fdf4] border-[#16a34a] text-[#15803d] dark:bg-[#052e16] dark:text-[#4ade80]" 
                          : "bg-background border-border text-muted-foreground hover:border-muted-foreground/50"
                      )}
                      onClick={() => field.onChange("Vegetarian")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-[1.5px] border-[#16a34a] flex items-center justify-center shrink-0 rounded-[2px] bg-transparent">
                          <div className="w-3.5 h-3.5 rounded-full bg-[#16a34a]" />
                        </div>
                        <span className="text-[15px] font-semibold">Vegetarian</span>
                      </div>
                      <RadioGroupItem 
                        value="Vegetarian" 
                        className={cn(
                          "h-4 w-4",
                          field.value === "Vegetarian" ? "border-[#16a34a] text-[#16a34a]" : "border-muted-foreground/30"
                        )} 
                      />
                    </div>

                    {/* Non-Vegetarian Card */}
                    <div 
                      className={cn(
                        "flex items-center justify-between border rounded-lg px-4 h-14 cursor-pointer transition-all duration-200 group",
                        field.value === "Non-Vegetarian" 
                          ? "bg-[#fff1f2] border-[#dc2626] text-[#b91c1c] dark:bg-[#2d0a0a] dark:text-[#f87171]" 
                          : "bg-background border-border text-muted-foreground hover:border-muted-foreground/50"
                      )}
                      onClick={() => field.onChange("Non-Vegetarian")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-[1.5px] border-[#dc2626] flex items-center justify-center shrink-0 rounded-[2px] bg-transparent">
                          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="translate-y-[-0.5px]">
                            <path d="M7 1L13 12H1L7 1Z" fill="#dc2626" />
                          </svg>
                        </div>
                        <span className="text-[15px] font-semibold">Non-Vegetarian</span>
                      </div>
                      <RadioGroupItem 
                        value="Non-Vegetarian" 
                        className={cn(
                          "h-4 w-4",
                          field.value === "Non-Vegetarian" ? "border-[#dc2626] text-[#dc2626]" : "border-muted-foreground/30"
                        )} 
                      />
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading} className="w-full bg-primary text-primary-foreground h-12 font-semibold rounded-md text-base shadow-sm hover:brightness-110 active:scale-[0.98] transition-all">
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