'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { suggestDishesAction } from '@/app/actions';
import { type SuggestDishesOutput } from '@/ai/schemas';
import { Loader2, Sparkles, ChefHat } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle } from 'lucide-react';

const formSchema = z.object({
  thoughts: z.string().min(10, "A more descriptive culinary thought will yield better results."),
});

type DishSuggesterProps = {
  onSuggestionSelect: (dishName: string) => void;
};

export function DishSuggester({ onSuggestionSelect }: DishSuggesterProps) {
  const [suggestions, setSuggestions] = useState<SuggestDishesOutput['suggestions'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      thoughts: '',
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);
    setSuggestions(null);
    try {
      const result = await suggestDishesAction(values);
      setSuggestions(result.suggestions);
    } catch (e: any) {
      setError(e.message || 'Failed to get suggestions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (dishName: string) => {
    onSuggestionSelect(dishName);
    setSuggestions(null);
    form.reset();
  };

  return (
    <section className="culinary-card p-8 md:p-12 bg-background border-none shadow-xl animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <ChefHat className="w-8 h-8 text-primary" />
        <h2 className="text-3xl md:text-4xl font-headline font-bold italic uppercase tracking-tight">Culinary Inspiration</h2>
      </div>
      <p className="text-muted-foreground mb-8 text-lg max-w-xl">
        Share your mood, cravings, or context. We'll curate a list of exquisite dishes tailored to your state of mind.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="thoughts"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">What's your current culinary muse?</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., 'A light but sophisticated dinner for a garden party' or 'Elevated comfort food for a winter evening'"
                    className="rounded-2xl border-border/50 bg-background/50 focus:bg-background h-32 p-6 text-lg"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="pill-button w-full h-16 text-lg bg-primary hover:bg-primary/90 shadow-xl">
            {isLoading ? (
              <>
                <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                Curating Ideas...
              </>
            ) : (
              'Curate Suggestions'
            )}
          </Button>
        </form>
      </Form>

      {error && (
        <div className="mt-8 animate-fade-in">
            <Alert variant="destructive" className="rounded-2xl border-destructive/50">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle className="font-headline italic text-lg">Inspiration Failed</AlertTitle>
                <AlertDescription className="text-base">
                    {error}
                </AlertDescription>
            </Alert>
        </div>
      )}

      {suggestions && suggestions.length > 0 && (
        <div className="mt-12 space-y-8">
          <h3 className="font-headline text-2xl italic border-b pb-4">Curated Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {suggestions.map((suggestion) => (
              <Card
                key={suggestion.dish_name}
                className="group cursor-pointer culinary-card hover:border-accent hover:bg-accent/5 transition-all duration-500 overflow-hidden"
                onClick={() => handleSuggestionClick(suggestion.dish_name)}
              >
                <CardContent className="p-8 space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-headline text-2xl group-hover:text-primary transition-colors italic">{suggestion.dish_name}</h4>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-accent px-2 py-1 bg-accent/10 rounded-full">
                      {suggestion.difficulty}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{suggestion.description}</p>
                  <div className="pt-4 flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                    Craft Recipe <Sparkles className="w-3 h-3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}