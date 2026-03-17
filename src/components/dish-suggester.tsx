'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { suggestDishesAction } from '@/app/actions';
import { type SuggestDishesOutput } from '@/ai/schemas';
import { Loader2, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const formSchema = z.object({
  thoughts: z.string().min(10, "Tell us a bit more about what you want."),
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
      setError(e.message || 'Could not get suggestions.');
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
    <div className="space-y-8">
      <div className="card-saas p-6 bg-card border border-border shadow-sm rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-secondary-foreground">AI Recipe Assistant</h2>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="thoughts"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="What ingredients do you have? What are you craving?"
                      className="input-saas h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full text-sm font-medium h-10">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Get Suggestions
            </Button>
          </form>
        </Form>
      </div>

      {error && (
        <Alert variant="destructive" className="text-xs py-2 px-3 rounded-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {suggestions && suggestions.length > 0 && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <h3 className="text-[13px] font-semibold text-secondary-foreground ml-1">Ideas for You</h3>
          <div className="space-y-2">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.dish_name}
                className="bg-card border border-border p-4 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors group"
                onClick={() => handleSuggestionClick(suggestion.dish_name)}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{suggestion.dish_name}</h4>
                  <span className="text-[11px] font-medium text-secondary-foreground bg-secondary px-2 py-0.5 rounded">
                    {suggestion.difficulty}
                  </span>
                </div>
                <p className="text-xs text-secondary-foreground line-clamp-2">{suggestion.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
