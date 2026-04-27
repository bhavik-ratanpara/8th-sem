'use server';
/**
 * @fileOverview An AI agent for suggesting alternatives when ingredients are missing.
 */

import { generateWithFallback } from '@/ai/kilo';
import { z } from 'zod';

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

export async function suggestAlternative(input: SuggestAlternativeInput): Promise<SuggestAlternativeOutput> {
  const prompt = `The user wants to cook ${input.dishName}.
They have all ingredients except ${input.missingIngredient}.
Full ingredient list: ${input.allIngredients.join(', ')}.

Give two suggestions:
1. An alternative ingredient that can replace ${input.missingIngredient} to still make ${input.dishName}
2. A completely different dish they can make with the remaining ingredients they have

Return ONLY valid JSON matching this exact format:
{
  "alternativeIngredient": "string",
  "alternativeDish": "string",
  "reason": "string"
}
No extra text. No markdown.`;

  const response = await generateWithFallback(
    [{ role: 'user', content: prompt }],
    { temperature: 0.7 }
  );

  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse AI response as JSON');

  const parsed = SuggestAlternativeOutputSchema.safeParse(JSON.parse(jsonMatch[0]));
  if (!parsed.success) {
    console.error('Parse error:', parsed.error);
    throw new Error('Invalid alternative format from AI');
  }

  return parsed.data;
}
