'use server';
/**
 * @fileOverview A grocery list generation AI agent.
 *
 * - generateGroceryList - A function that handles the grocery list generation process.
 * - GenerateGroceryListInput - The input type for the generateGroceryList function.
 * - GenerateGroceryListOutput - The return type for the generateGroceryList function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateGroceryListInputSchema = z.object({
  meals: z.array(z.object({
    dishName: z.string().describe('The name of the dish.'),
    servings: z.number().describe('The number of servings.'),
    cuisine: z.string().describe('The cuisine type.'),
  })).describe('The list of meals to generate a grocery list for.'),
});
export type GenerateGroceryListInput = z.infer<typeof GenerateGroceryListInputSchema>;

const GroceryItemSchema = z.object({
  name: z.string().describe('The name of the ingredient.'),
  quantity: z.string().describe('The combined quantity needed (e.g., "2 kg", "500g").'),
  neededFor: z.array(z.string()).describe('The list of dishes that require this ingredient.'),
});

const GenerateGroceryListOutputSchema = z.object({
  items: z.array(GroceryItemSchema).describe('The consolidated list of grocery items.'),
});
export type GenerateGroceryListOutput = z.infer<typeof GenerateGroceryListOutputSchema>;

/**
 * Generates a consolidated grocery list for a set of meals.
 */
export async function generateGroceryList(input: GenerateGroceryListInput): Promise<GenerateGroceryListOutput> {
  return generateGroceryListFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateGroceryListPrompt',
  input: { schema: GenerateGroceryListInputSchema },
  output: { schema: GenerateGroceryListOutputSchema },
  prompt: `Generate a combined grocery/shopping list for these meals:

{{#each meals}}
- {{this.dishName}} ({{this.servings}} servings, {{this.cuisine}} cuisine)
{{/each}}

Rules:
- Combine same ingredients across all dishes into one entry
- Add up quantities for same ingredient
- Use practical grocery quantities (kg, g, liters, pieces, dozen)
- Include all ingredients needed: vegetables, spices, grains, dairy, oils, etc
- For each item, list which dishes need it
- Sort by category: vegetables first, then grains, then dairy, then spices, then others
- Keep ingredient names simple and commonly known

Return only valid JSON matching the output schema.
No extra text. No markdown.`,
});

export const generateGroceryListFlow = ai.defineFlow(
  {
    name: 'generateGroceryListFlow',
    inputSchema: GenerateGroceryListInputSchema,
    outputSchema: GenerateGroceryListOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
