'use server';

/**
 * @fileOverview A recipe generation AI agent.
 *
 * - createRecipe - A function that handles the recipe creation process.
 */

import {ai} from '@/ai/genkit';
import { CreateRecipeInputSchema, CreateRecipeOutputSchema, type CreateRecipeInput, type CreateRecipeOutput } from '@/ai/schemas';

export async function createRecipe(input: CreateRecipeInput): Promise<CreateRecipeOutput> {
  return createRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createRecipePrompt',
  input: {schema: CreateRecipeInputSchema},
  output: {schema: CreateRecipeOutputSchema},
  config: {
    temperature: 0.3, // Lower temperature for more consistent, less random output
  },
  prompt: `You are a professional chef and recipe writer.
When generating a recipe, you MUST follow these rules strictly:

SERVING SIZE ACCURACY:
- The user has selected {{{servings}}} servings.
- Every single ingredient quantity MUST be calculated for exactly {{{servings}}} people eating a full normal meal portion.
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

IMPORTANT: This recipe MUST serve exactly {{{servings}}} people.
Calculate ALL ingredient quantities for {{{servings}}} full portions.
Do not generate a base recipe and forget to scale it up.

{{#if currentRecipe}}
You will be modifying an existing recipe based on new user constraints. Your task is to adapt the provided recipe, keeping as much of it the same as possible, especially the ingredient list and quantities (unless the constraint requires changing them). Only alter the parts necessary to meet the user's new requirements.

Original Recipe to Modify:
Title: {{{currentRecipe.title}}}
Description: {{{currentRecipe.description}}}
Ingredients:
{{#each currentRecipe.ingredients}}
- {{{this.quantity}}} {{{this.unit}}} {{{this.name}}}
{{/each}}
Instructions:
{{{currentRecipe.instructions}}}

CRITICAL: The user has provided specific modifications. You MUST adapt the recipe above to follow these instructions exactly. They are absolute requirements.
New Constraints to apply: {{{modifications}}}

Return the complete updated recipe in the exact same structured format as the original recipe.
Format the steps as a numbered list:
1. First step here
2. Second step here
3. Third step here
Each step must be on its own line. Do not combine multiple steps into one paragraph.
Do not return steps as a single block of text.
Return ingredients as a list with exact quantities on separate lines.
Keep the same JSON structure as the original recipe response.
{{else}}
Create a new recipe for the following dish. 
  
The entire output, including the title, description, ingredients, and instructions, must be in the specified language.
The step-by-step instructions must be a numbered list in markdown format. Crucially, each step must be separated by a newline character (\\n).
For example: "1. Do this.\\n2. Do that.\\n3. Do another thing."

Dish Name: {{{dishName}}}
Number of Servings: {{{servings}}}
State, Country: {{{location}}}
Language: {{{language}}}
Dietary Preference: {{{diet}}}
{{#if modifications}}
CRITICAL INSTRUCTION: The user has provided specific modifications. You MUST follow these instructions exactly as written. They are absolute requirements, not suggestions. Failure to adhere to these constraints will result in a failed task.
Constraints to follow: {{{modifications}}}
{{/if}}
{{/if}}
`,
});

const createRecipeFlow = ai.defineFlow(
  {
    name: 'createRecipeFlow',
    inputSchema: CreateRecipeInputSchema,
    outputSchema: CreateRecipeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Ensure the output includes the original servings count
    if (output) {
      output.servings = input.servings;
    }
    return output!;
  }
);
