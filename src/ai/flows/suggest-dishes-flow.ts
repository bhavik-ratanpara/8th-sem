'use server';

import { generateWithFallback } from '@/ai/kilo';
import { SuggestDishesInputSchema, SuggestDishesOutputSchema, type SuggestDishesInput, type SuggestDishesOutput } from '@/ai/schemas';

export async function suggestDishes(input: SuggestDishesInput): Promise<SuggestDishesOutput> {
  const response = await generateWithFallback(
    [
      { 
        role: 'system', 
        content: 'You are a Culinary AI Assistant. Suggest 4-5 dishes as JSON with array "suggestions" containing {dish_name, description, difficulty}.' 
      },
      { 
        role: 'user', 
        content: `${input.thoughts}

Return JSON: {"suggestions": [{"dish_name": "Name", "description": "Why", "difficulty": "Easy/Medium/Hard"}]}` 
      }
    ],
    { temperature: 0.7 }
  );

  const jsonMatch = response.match(/\{"suggestions"\s*:\s*\[[\s\S]*\]\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse AI response');
  }

  const parsed = SuggestDishesOutputSchema.safeParse(JSON.parse(jsonMatch[0]));
  if (!parsed.success) {
    throw new Error('Invalid suggestion format from AI');
  }

  return parsed.data;
}