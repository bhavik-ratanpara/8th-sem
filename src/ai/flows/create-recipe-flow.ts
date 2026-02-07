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
  prompt: `You are an expert chef.
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

Now, provide the complete, updated recipe (title, description, ingredients, and instructions) that incorporates the changes. The ingredient quantities should be for {{{servings}}} servings, but base the modifications on the original recipe provided.
{{else}}
Create a new recipe for the following dish. 
  
The entire output, including the title, description, ingredients, and instructions, must be in the specified language.
The step-by-step instructions must be a numbered list in markdown format. Crucially, each step must be separated by a newline character (\\n).
For example: "1. Do this.\\n2. Do that.\\n3. Do another thing."

CRITICAL: For ingredients, provide the name, quantity, and unit for each item. The quantities MUST be realistic and accurate for the specified number of servings. A recipe for 4 servings should not contain 30kg of anything. Quantities should be consistent; generating the same recipe multiple times should result in similar measurements. The core recipe and its quantities should not change if only the language is different.

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
