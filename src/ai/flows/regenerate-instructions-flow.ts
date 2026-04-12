'use server';

/**
 * @fileOverview An AI agent for regenerating recipe instructions.
 *
 * - regenerateInstructions - A function that handles regenerating instructions.
 */

import {ai} from '@/ai/genkit';
import { RegenerateInstructionsInputSchema, RegenerateInstructionsOutputSchema, type RegenerateInstructionsInput, type RegenerateInstructionsOutput } from '@/ai/schemas';


export async function regenerateInstructions(input: RegenerateInstructionsInput): Promise<RegenerateInstructionsOutput> {
  return regenerateInstructionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'regenerateInstructionsPrompt',
  input: {schema: RegenerateInstructionsInputSchema},
  output: {schema: RegenerateInstructionsOutputSchema},
  prompt: `You are an expert chef. The user has removed some ingredients from a recipe and needs new instructions.

Dish Name: {{{dishName}}}
Remaining Ingredients: 
{{#each ingredients}}
- {{{this}}}
{{/each}}

Please generate new step-by-step instructions for the dish using only the remaining ingredients.
The instructions MUST be returned as a JSON array of strings. Each item in the array should be one cooking step. 
For example: ["Boil water in a pot.", "Add the remaining ingredients.", "Cook for 10 minutes."]
`,
});

const regenerateInstructionsFlow = ai.defineFlow(
  {
    name: 'regenerateInstructionsFlow',
    inputSchema: RegenerateInstructionsInputSchema,
    outputSchema: RegenerateInstructionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
