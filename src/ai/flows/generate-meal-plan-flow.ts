'use server';
/**
 * @fileOverview A weekly meal plan generation AI agent.
 *
 * - generateMealPlan - A function that handles the meal plan generation process.
 * - GenerateMealPlanInput - The input type for the generateMealPlan function.
 * - GenerateMealPlanOutput - The return type for the generateMealPlan function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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

/**
 * Generates a weekly meal plan based on user preferences.
 */
export async function generateMealPlan(input: GenerateMealPlanInput): Promise<GenerateMealPlanOutput> {
  return generateMealPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMealPlanPrompt',
  input: { schema: GenerateMealPlanInputSchema },
  output: { schema: GenerateMealPlanOutputSchema },
  prompt: `Generate a weekly meal plan for 7 days (Monday to Sunday).
Each day must have breakfast, lunch, and dinner.

User preferences:
- Diet: {{{dietType}}}
- Cuisine preference: {{{cuisinePreference}}}
{{#if healthGoal}}- Health Goal: {{{healthGoal}}}{{/if}}
{{#if specificDishes}}- Must include these dishes somewhere in the week: {{{specificDishes}}}{{/if}}

Rules:
- Keep variety across the week
- No dish should repeat more than once
- Each meal should be a real, commonly known dish name
- Keep dish names short (2-4 words max)
- If specific dishes are provided, place them in appropriate meal slots

{{#if healthGoal}}
Health Goal Rules:
- If Weight Loss: suggest low calorie, light meals, steamed or boiled dishes, lots of vegetables, avoid fried food
- If Muscle Gain: suggest high protein meals, include dal, paneer, eggs, chicken, filling portions
- If Diabetic Friendly: avoid sugar, white rice, maida, suggest whole grains, vegetables, low glycemic foods
- If Heart Healthy: avoid fried food, suggest low fat, high fiber meals, lots of vegetables and fruits
{{/if}}

Return only valid JSON matching the output schema.
No extra text. No markdown.`,
});

export const generateMealPlanFlow = ai.defineFlow(
  {
    name: 'generateMealPlanFlow',
    inputSchema: GenerateMealPlanInputSchema,
    outputSchema: GenerateMealPlanOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
