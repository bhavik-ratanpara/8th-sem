'use server';

/**
 * @fileOverview An AI agent for suggesting dishes based on user thoughts.
 */

import { generateWithFallback } from '@/ai/kilo';
import { SuggestDishesInputSchema, SuggestDishesOutputSchema, type SuggestDishesInput, type SuggestDishesOutput } from '@/ai/schemas';

export async function suggestDishes(input: SuggestDishesInput): Promise<SuggestDishesOutput> {
  const prompt = `ROLE:
You are an intelligent Culinary AI Assistant. Your goal is to interpret the user's abstract thoughts, current mood, weather context, or vague cravings and suggest 4 to 5 distinct, real dish names that match their intent.

INPUT:
The user will provide a statement. It could be ingredients, a mood (e.g., "I'm sad"), a situation (e.g., "Late night snack"), or specific constraints.

TASK:
1. Analyze the user's input for emotional context, available time, and flavor profile.
2. Brainstorm 4-5 creative and suitable dishes.
3. For each dish, provide the exact Name and a very short "Why this matches" description.

OUTPUT FORMAT:
Strictly return a JSON object with a "suggestions" array. Do not include markdown formatting like \`\`\`json.
{
  "suggestions": [
    {
      "dish_name": "Name of the Dish",
      "description": "A short, appetizing one-line description of why this fits the user's thought.",
      "difficulty": "Easy"
    }
  ]
}

Note: difficulty must be one of: "Easy", "Medium", "Hard"

USER INPUT:
"${input.thoughts}"`;

  const response = await generateWithFallback(
    [{ role: 'user', content: prompt }],
    { temperature: 0.7 }
  );

  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse AI response as JSON');

  const parsed = SuggestDishesOutputSchema.safeParse(JSON.parse(jsonMatch[0]));
  if (!parsed.success) {
    console.error('Parse error:', parsed.error);
    throw new Error('Invalid suggestions format from AI');
  }

  return parsed.data;
}
