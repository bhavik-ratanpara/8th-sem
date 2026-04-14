'use server';
/**
 * @fileOverview An AI agent for suggesting alternatives when ingredients are missing.
 *
 * - suggestAlternative - A wrapper function for the suggestAlternativeFlow.
 * - suggestAlternativeFlow - The Genkit flow that handles the logic.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestAlternativeInputSchema = z.object({
  dishName: z.string().describe('The name of the dish the user wants to cook.'),
  missingIngredient: z.string().describe('The ingredient the user is missing.'),
  allIngredients: z.array(z.string()).describe('The full list of ingredients for the dish.'),
});
export type SuggestAlternativeInput = z.infer<typeof SuggestAlternativeInputSchema>;

const SuggestAlternativeOutputSchema = z.object({
  alternativeIngredient: z.string().describe('An alternative ingredient that can replace the missing one.'),
  alternativeDish: z.string().describe('A completely different dish user can make without the missing ingredient.'),
  reason: z.string().describe('A one-line explanation for why these match.'),
});
export type SuggestAlternativeOutput = z.infer<typeof SuggestAlternativeOutputSchema>;

/**
 * Suggests an alternative ingredient or a different dish based on missing ingredients.
 */
export async function suggestAlternative(input: SuggestAlternativeInput): Promise<SuggestAlternativeOutput> {
  return suggestAlternativeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAlternativePrompt',
  input: { schema: SuggestAlternativeInputSchema },
  output: { schema: SuggestAlternativeOutputSchema },
  prompt: `The user wants to cook {{{dishName}}}.
They have all ingredients except {{{missingIngredient}}}.
Full ingredient list: {{{allIngredients}}}.

Give two suggestions:
1. An alternative ingredient that can replace {{{missingIngredient}}} to still make {{{dishName}}}
2. A completely different dish they can make with the remaining ingredients they have

Return only valid JSON matching the output schema.
No extra text. No markdown.`,
});

export const suggestAlternativeFlow = ai.defineFlow(
  {
    name: 'suggestAlternativeFlow',
    inputSchema: SuggestAlternativeInputSchema,
    outputSchema: SuggestAlternativeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
