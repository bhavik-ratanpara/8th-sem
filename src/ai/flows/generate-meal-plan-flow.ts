'use server';
/**
 * @fileOverview A weekly meal plan generation AI agent.
 */

import { generateWithFallback } from '@/ai/kilo';
import { z } from 'zod';

const GenerateMealPlanInputSchema = z.object({
  dietType: z.enum(['Vegetarian', 'Non-Vegetarian', 'Mixed']).describe('The dietary preference. Mixed means both veg and non-veg dishes can be included.'),
  cuisinePreference: z.string().describe('The preferred cuisine (e.g., "Indian", "Italian"). Empty means any cuisine.'),
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

const MealItemSchema = z.object({
  name: z.string().describe('Dish name, 2-4 words.'),
  diet: z.enum(['Vegetarian', 'Non-Vegetarian']).describe('The actual diet type of this specific dish.'),
});

const DayPlanSchema = z.object({
  breakfast: MealItemSchema,
  lunch: MealItemSchema,
  dinner: MealItemSchema,
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
  const dietInstruction = input.dietType === 'Mixed'
    ? 'Include a balanced mix of Vegetarian and Non-Vegetarian dishes. CRITICAL: Distribute non-vegetarian meals randomly across different meal times (breakfast, lunch, dinner). Do NOT put non-vegetarian meals exclusively at lunch. Mix them up unpredictably each day.'
    : `All dishes must be ${input.dietType}.`;

  const prompt = `Generate a weekly meal plan for 7 days (Monday to Sunday).
Each day must have breakfast, lunch, and dinner.

User preferences:
- Diet: ${input.dietType}. ${dietInstruction}
${input.cuisinePreference ? `- Cuisine preference: ${input.cuisinePreference}` : '- Cuisine: Any (varied)'}
${input.healthGoal && input.healthGoal !== 'No Preference' ? `- Health Goal: ${input.healthGoal}` : ''}
${input.specificDishes && input.specificDishes.length > 0 ? `- Must include these dishes: ${input.specificDishes.join(', ')}` : ''}

Rules:
- Keep variety across the week
- No dish should repeat more than once
- Each meal should be a real, commonly known dish name
- Keep dish names short (2-4 words max)
- For each dish, label its "diet" as exactly "Vegetarian" or "Non-Vegetarian" based on what that dish actually is
- Do NOT label a dish as "Mixed" — only "Vegetarian" or "Non-Vegetarian"

${input.healthGoal && input.healthGoal !== 'No Preference' ? `Health Goal Rules:
- Weight Loss: low calorie, steamed/boiled, lots of vegetables, no fried food
- Muscle Gain: high protein, dal, paneer, eggs, chicken, filling portions
- Diabetic Friendly: avoid sugar/white rice/maida, whole grains, low glycemic
- Heart Healthy: no fried food, low fat, high fiber, lots of vegetables` : ''}

Output MUST be valid JSON in EXACTLY this format (no extra text or markdown):
{
  "monday": {
    "breakfast": { "name": "Dish Name", "diet": "Vegetarian or Non-Vegetarian" },
    "lunch": { "name": "Dish Name", "diet": "Vegetarian or Non-Vegetarian" },
    "dinner": { "name": "Dish Name", "diet": "Vegetarian or Non-Vegetarian" }
  },
  "tuesday": { ... same structure ... },
  "wednesday": { ... },
  "thursday": { ... },
  "friday": { ... },
  "saturday": { ... },
  "sunday": { ... }
}`;

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
