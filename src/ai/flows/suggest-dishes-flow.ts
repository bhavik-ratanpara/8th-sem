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

  console.log('[AI] Raw response from AI:', response);
  
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('[AI] No JSON found in response. Raw response:', response);
    throw new Error('Failed to parse AI response');
  }

  let parsed;
  try {
    parsed = SuggestDishesOutputSchema.safeParse(JSON.parse(jsonMatch[0]));
  } catch (e) {
    console.error('[AI] JSON parse error. Trying to fix response...');
    try {
      const fixed = response.replace(/'/g, '"').replace(/(\w+):/g, '"$1":');
      parsed = SuggestDishesOutputSchema.safeParse(JSON.parse(fixed));
    } catch (e2) {
      console.error('[AI] Failed to fix. Raw response:', response);
      throw new Error('Failed to parse AI response');
    }
  }

  if (!parsed.success) {
    console.error('Schema validation error:', parsed.error.flatten());
    throw new Error('Invalid suggestion format from AI');
  }

  return parsed.data;
}