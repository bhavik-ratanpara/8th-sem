'use server';
/**
 * @fileOverview A grocery list generation AI agent.
 */

import { generateWithFallback } from '@/ai/kilo';
import { z } from 'zod';

const GenerateGroceryListInputSchema = z.object({
  meals: z.array(z.object({
    dishName: z.string().describe('The name of the dish.'),
    servings: z.number().describe('The number of servings.'),
    cuisine: z.string().describe('The cuisine type.'),
  })).describe('The list of meals to generate a grocery list for.'),
});
export type GenerateGroceryListInput = z.infer<typeof GenerateGroceryListInputSchema>;

const GroceryItemSchema = z.object({
  name: z.string().describe('The ingredient name.'),
  quantity: z.string().describe('Realistic practical quantity for home cooking.'),
  neededFor: z.array(z.string()).describe('Dishes that need this ingredient.'),
  category: z.enum([
    'Vegetables',
    'Fruits',
    'Grains & Cereals',
    'Dairy & Eggs',
    'Meat & Poultry',
    'Seafood',
    'Spices & Masalas',
    'Oils & Condiments',
    'Lentils & Pulses',
    'Others'
  ]).describe('Category this ingredient belongs to.'),
});

const GenerateGroceryListOutputSchema = z.object({
  items: z.array(GroceryItemSchema).describe('The consolidated list of grocery items.'),
});
export type GenerateGroceryListOutput = z.infer<typeof GenerateGroceryListOutputSchema>;

export async function generateGroceryList(input: GenerateGroceryListInput): Promise<GenerateGroceryListOutput> {
  const mealsList = input.meals.map(m => `- ${m.dishName} (${m.servings} servings, ${m.cuisine} cuisine)`).join('\n');
  
  const prompt = `Generate a realistic combined grocery/shopping list for a home cook making these meals:

${mealsList}

QUANTITY RULES — follow these strictly:
- Always use standard measurable units only
- Vegetables: use kg or grams (e.g. '500g', '1 kg', '200g')
- Fruits: use kg or grams (e.g. '250g', '500g')
- Liquids: use ml or liters (e.g. '500ml', '1 liter')
- Grains, flour, dal, rice: use kg or grams (e.g. '1 kg', '500g')
- Dairy (milk, curd, cream): use ml or grams (e.g. '500ml', '200g')
- Spices and masalas: use grams only (e.g. '50g', '100g')
- Oils: use ml or liters (e.g. '250ml', '500ml')
- Eggs: use count only (e.g. '6 eggs', '12 eggs')
- Never write 'small packet', 'medium onion', 'large tomato'
- Never count vegetables or fruits in pieces
- Always calculate quantity based on number of servings
- Combine same ingredients from all dishes

CATEGORY RULES:
- Assign each item to exactly one category
- Use: Vegetables, Fruits, Grains & Cereals, Dairy & Eggs, Meat & Poultry, Seafood, Spices & Masalas, Oils & Condiments, Lentils & Pulses, Others

OTHER RULES:
- Combine same ingredients across all dishes
- No duplicate items
- Keep ingredient names simple and clear
- Include ALL ingredients needed

Output MUST be valid JSON in exactly this format:
{
  "items": [
    {
      "name": "string",
      "quantity": "string",
      "neededFor": ["dishName1", "dishName2"],
      "category": "Vegetables"
    }
  ]
}
Do not include extra text or markdown formatting.`;

  const response = await generateWithFallback(
    [{ role: 'user', content: prompt }],
    { temperature: 0.3 }
  );

  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse AI response as JSON');

  const parsed = GenerateGroceryListOutputSchema.safeParse(JSON.parse(jsonMatch[0]));
  if (!parsed.success) {
    console.error('Parse error:', parsed.error);
    throw new Error('Invalid grocery list format from AI');
  }

  return parsed.data;
}

export async function generateGroceryListBatched(
  input: GenerateGroceryListInput
): Promise<GenerateGroceryListOutput> {
  const BATCH_SIZE = 7;
  const meals = input.meals;

  if (meals.length <= BATCH_SIZE) {
    return generateGroceryList(input);
  }

  const batches: typeof meals[] = [];
  for (let i = 0; i < meals.length; i += BATCH_SIZE) {
    batches.push(meals.slice(i, i + BATCH_SIZE));
  }

  const batchResults: GenerateGroceryListOutput[] = [];
  for (const batch of batches) {
    const result = await generateGroceryList({ meals: batch });
    batchResults.push(result);
  }

  const mergedMap = new Map<string, {
    name: string;
    quantity: string;
    neededFor: string[];
    category: string;
  }>();

  batchResults.forEach(result => {
    result.items.forEach(item => {
      const key = item.name.toLowerCase().trim();
      if (mergedMap.has(key)) {
        const existing = mergedMap.get(key)!;
        const merged = {
          ...existing,
          neededFor: Array.from(new Set([...existing.neededFor, ...item.neededFor])),
        };
        mergedMap.set(key, merged);
      } else {
        mergedMap.set(key, item);
      }
    });
  });

  return { items: Array.from(mergedMap.values()) as any };
}
