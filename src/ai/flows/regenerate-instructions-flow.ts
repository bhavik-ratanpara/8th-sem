'use server';

import { generateWithFallback } from '@/ai/kilo';
import { RegenerateInstructionsInputSchema, RegenerateInstructionsOutputSchema, type RegenerateInstructionsInput, type RegenerateInstructionsOutput } from '@/ai/schemas';

export async function regenerateInstructions(input: RegenerateInstructionsInput): Promise<RegenerateInstructionsOutput> {
  const response = await generateWithFallback(
    [
      { 
        role: 'system', 
        content: 'You are an expert chef. Generate new instructions as a JSON array of strings.' 
      },
      { 
        role: 'user', 
        content: `The user has removed some ingredients from a recipe.

Dish Name: ${input.dishName}
Remaining Ingredients: ${input.ingredients.join(', ')}

Generate new step-by-step instructions using only these ingredients. Return JSON: {"instructions": ["step1", "step2"]}` 
      }
    ],
    { temperature: 0.3 }
  );

  const jsonMatch = response.match(/\{"instructions"\s*:\s*\[[\s\S]*\]\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse AI response');
  }

  const parsed = RegenerateInstructionsOutputSchema.safeParse(JSON.parse(jsonMatch[0]));
  if (!parsed.success) {
    throw new Error('Invalid instruction format from AI');
  }

  return parsed.data;
}
