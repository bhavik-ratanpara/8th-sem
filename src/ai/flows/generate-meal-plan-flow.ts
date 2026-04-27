'use server';
/**
 * @fileOverview A weekly meal plan generation AI agent.
 */

import { generateWithFallback } from '@/ai/kilo';
import { z } from 'zod';

const GenerateMealPlanInputSchema = z.object({
  dietType: z.enum(['Vegetarian', 'Non-Vegetarian', 'Mixed']).describe('The dietary preference.'),
  cuisinePreference: z.string().describe('The preferred cuisine (e.g., "Indian", "Italian", "Mixed").'),
  specificDishes: z.array(z.string()).optional().describe('Dishes the user definitely wants to include in the week.'),
  healthGoal: z.enum([
    'No Preference',
    'Weight Loss', 
    'Muscle Gain',
    'Diabetic Friendly',
    'Heart Healthy'
  ]).optional().describe('Health goal for meal planning.'),
});
export type GenerateMealPlanInput = z.infer<typeof GenerateMealPlanInputSchema>;

const DayPlanSchema = z.object({
  breakfast: z.string().describe('Dish name for breakfast.'),
  lunch: z.string().describe('Dish name for lunch.'),
  dinner: z.string().describe('Dish name for dinner.'),
});

const GenerateMealPlanOutputSchema = z.object({
  monday: DayPlanSchema,
  tuesday: DayPlanSchema,
  wednesday: DayPlanSchema,
  thursday: DayPlanSchema,
  friday: DayPlanSchema,
  saturday: DayPlanSchema,
  sunday: DayPlanSchema,
});
export type GenerateMealPlanOutput = z.infer<typeof GenerateMealPlanOutputSchema>;

export async function generateMealPlan(input: GenerateMealPlanInput): Promise<GenerateMealPlanOutput> {
  const prompt = `Generate a weekly meal plan for 7 days (Monday to Sunday).
Each day must have breakfast, lunch, and dinner.

User preferences:
- Diet: ${input.dietType}
- Cuisine preference: ${input.cuisinePreference}
${input.healthGoal ? `- Health Goal: ${input.healthGoal}` : ''}
${input.specificDishes && input.specificDishes.length > 0 ? `- Must include these dishes somewhere in the week: ${input.specificDishes.join(', ')}` : ''}

Rules:
- Keep variety across the week
- No dish should repeat more than once
- Each meal should be a real, commonly known dish name
- Keep dish names short (2-4 words max)
- If specific dishes are provided, place them in appropriate meal slots

${input.healthGoal ? `Health Goal Rules:
- If Weight Loss: suggest low calorie, light meals, steamed or boiled dishes, lots of vegetables, avoid fried food
- If Muscle Gain: suggest high protein meals, include dal, paneer, eggs, chicken, filling portions
- If Diabetic Friendly: avoid sugar, white rice, maida, suggest whole grains, vegetables, low glycemic foods
- If Heart Healthy: avoid fried food, suggest low fat, high fiber meals, lots of vegetables and fruits` : ''}

Output MUST be valid JSON in exactly this format:
{
  "monday": { "breakfast": "string", "lunch": "string", "dinner": "string" },
  "tuesday": { "breakfast": "string", "lunch": "string", "dinner": "string" },
  "wednesday": { "breakfast": "string", "lunch": "string", "dinner": "string" },
  "thursday": { "breakfast": "string", "lunch": "string", "dinner": "string" },
  "friday": { "breakfast": "string", "lunch": "string", "dinner": "string" },
  "saturday": { "breakfast": "string", "lunch": "string", "dinner": "string" },
  "sunday": { "breakfast": "string", "lunch": "string", "dinner": "string" }
}
Do not include extra text or markdown formatting.`;

  const response = await generateWithFallback(
    [{ role: 'user', content: prompt }],
    { temperature: 0.7 }
  );

  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse AI response as JSON');

  const parsed = GenerateMealPlanOutputSchema.safeParse(JSON.parse(jsonMatch[0]));
  if (!parsed.success) {
    console.error('Parse error:', parsed.error);
    throw new Error('Invalid meal plan format from AI');
  }

  return parsed.data;
}
