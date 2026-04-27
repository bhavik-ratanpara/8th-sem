'use server';

/**
 * @fileOverview An AI agent for regenerating recipe instructions.
 */

import { generateWithFallback } from '@/ai/kilo';
import { RegenerateInstructionsInputSchema, RegenerateInstructionsOutputSchema, type RegenerateInstructionsInput, type RegenerateInstructionsOutput } from '@/ai/schemas';

export async function regenerateInstructions(input: RegenerateInstructionsInput): Promise<RegenerateInstructionsOutput> {
  const prompt = `You are an expert chef. The user has removed some ingredients from a recipe and needs new instructions.

Dish Name: ${input.dishName}
Remaining Ingredients: 
${input.ingredients.map(i => `- ${i}`).join('\n')}

Please generate new step-by-step instructions for the dish using only the remaining ingredients.
The instructions MUST be returned as a JSON object in this exact format:
{
  "instructions": ["Boil water in a pot.", "Add the remaining ingredients.", "Cook for 10 minutes."]
}
No extra text. No markdown.`;

  const response = await generateWithFallback(
    [{ role: 'user', content: prompt }],
    { temperature: 0.3 }
  );

  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse AI response as JSON');

  const parsed = RegenerateInstructionsOutputSchema.safeParse(JSON.parse(jsonMatch[0]));
  if (!parsed.success) {
    console.error('Parse error:', parsed.error);
    throw new Error('Invalid instructions format from AI');
  }

  return parsed.data;
}
