'use server';

import { generateWithFallback } from '@/ai/kilo';
import { CreateRecipeInputSchema, CreateRecipeOutputSchema, type CreateRecipeInput, type CreateRecipeOutput } from '@/ai/schemas';
import { z } from 'zod';

export async function createRecipe(input: CreateRecipeInput): Promise<CreateRecipeOutput> {
  return createRecipeFlow(input);
}

const systemPrompt = `You are a professional chef and recipe writer.
When generating a recipe, you MUST follow these rules strictly:

SERVING SIZE ACCURACY:
- The user has selected {{servings}} servings.
- Every single ingredient quantity MUST be calculated for exactly {{servings}} people eating a full normal meal portion.
- A normal meal portion per person means:
    Protein (meat/paneer/dal): 150g to 200g per person
    Rice or bread: 80g to 100g dry weight per person
    Vegetables: 100g to 150g per person
    Oil: 1 tablespoon per 2 persons
    Spices: scale proportionally, do not under-specify
- MULTIPLY base recipe quantities by the serving count.
- Do NOT guess or approximate — calculate precisely.

CONSISTENCY RULE:
- If the same recipe name and serving count is given twice, output the EXACT same quantities both times.
- Never randomize, vary, or approximate ingredient amounts.
- Quantities must be deterministic for same inputs.

FORMAT RULE:
- Always use standard measurable units:
    Solids: grams (g) or kilograms (kg)
    Liquids: ml or liters
    Small amounts: teaspoon (tsp) or tablespoon (tbsp)
- Never say 'some', 'a handful', 'as needed', 'to taste' for main ingredients — give exact amounts.
- 'To taste' is only allowed for salt and pepper adjustment.
- Round to clean numbers: 250g not 237g, 500ml not 473ml.

IMPORTANT: This recipe MUST serve exactly {{servings}} people.
Calculate ALL ingredient quantities for {{servings}} full portions.
Do not generate a base recipe and forget to scale it up.

Output MUST be valid JSON in this exact format:
{
  "title": "string",
  "description": "string",
  "ingredients": [{"name": "string", "quantity": number, "unit": "string"}],
  "instructions": ["string"],
  "servings": number
}`;

function buildUserPrompt(input: CreateRecipeInput): string {
  if (input.currentRecipe) {
    const ingredientsList = input.currentRecipe.ingredients
      .map(i => `- ${i.quantity} ${i.unit || ''} ${i.name}`)
      .join('\n');
    const instructionsList = input.currentRecipe.instructions.join('\n');
    
    return `You will be modifying an existing recipe based on new user constraints.

Original Recipe to Modify:
Title: ${input.currentRecipe.title}
Description: ${input.currentRecipe.description}
Ingredients:
${ingredientsList}
Instructions:
${instructionsList}

CRITICAL: The user has provided specific modifications. You MUST adapt the recipe above.
New Constraints to apply: ${input.modifications || 'None'}

Return the complete updated recipe in JSON format.`;
  }

  return `Create a new recipe for the following dish.
The output must be in the specified language.

Dish Name: ${input.dishName}
Number of Servings: ${input.servings}
State, Country: ${input.location}
Language: ${input.language}
Dietary Preference: ${input.diet}
${input.modifications ? `Constraints: ${input.modifications}` : ''}

Return valid JSON with title, description, ingredients array, and instructions array.`;
}

async function createRecipeFlow(input: CreateRecipeInput): Promise<CreateRecipeOutput> {
  const userPrompt = buildUserPrompt(input);
  
  const response = await generateWithFallback(
    [
      { role: 'system', content: systemPrompt.replace(/{{servings}}/g, String(input.servings)) },
      { role: 'user', content: userPrompt }
    ],
    { temperature: 0.3 }
  );

  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse AI response as JSON');
  }

  const parsed = CreateRecipeOutputSchema.safeParse(JSON.parse(jsonMatch[0]));
  
  if (!parsed.success) {
    console.error('Parse error:', parsed.error);
    throw new Error('Invalid recipe format from AI');
  }

  parsed.data.servings = input.servings;
  return parsed.data;
}
