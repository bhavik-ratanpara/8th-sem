import { z } from 'zod';

/**
 * @fileOverview Schemas for AI flows
 */

// Schema for a single ingredient
export const IngredientSchema = z.object({
  name: z.string().describe('The name of the ingredient.'),
  quantity: z.number().describe('The amount of the ingredient.'),
  unit: z.string().optional().describe('The unit of measurement (e.g., "grams", "ml", "cups").'),
});
export type Ingredient = z.infer<typeof IngredientSchema>;

// Schema for creating a recipe
export const CreateRecipeInputSchema = z.object({
    dishName: z.string().describe('The name of the dish to create a recipe for.'),
    servings: z.number().describe('The number of servings the recipe should be for.'),
    location: z.string().describe('The state and country to tailor the recipe to (e.g., for local ingredients).'),
    language: z.string().describe('The language the recipe should be written in.'),
    diet: z.enum(['Vegetarian', 'Non-Vegetarian']).describe('The dietary preference.'),
    modifications: z.string().optional().describe("User-provided constraints or modifications for the recipe (e.g., 'no oven', 'allergic to nuts')."),
    currentRecipe: z.object({
        title: z.string(),
        description: z.string(),
        ingredients: z.array(IngredientSchema),
        instructions: z.array(z.string()),
    }).optional().describe('The current recipe that needs to be modified. If provided, the AI should adapt this recipe based on the new constraints, keeping as much of the original recipe as possible.'),
});
export type CreateRecipeInput = z.infer<typeof CreateRecipeInputSchema>;

export const CreateRecipeOutputSchema = z.object({
    title: z.string().describe('The title of the recipe.'),
    description: z.string().describe('A short, engaging description of the dish.'),
    ingredients: z.array(IngredientSchema).describe('A list of ingredients for the recipe, including name, quantity, and unit.'),
    instructions: z.array(z.string()).describe('The step-by-step instructions for the recipe as a list of strings.'),
    servings: z.number().describe('The number of servings this recipe is for.'),
});
export type CreateRecipeOutput = z.infer<typeof CreateRecipeOutputSchema>;

// Schema for regenerating instructions
export const RegenerateInstructionsInputSchema = z.object({
  dishName: z.string().describe('The name of the dish.'),
  ingredients: z.array(z.string()).describe('The updated list of ingredient names.'),
});
export type RegenerateInstructionsInput = z.infer<typeof RegenerateInstructionsInputSchema>;

export const RegenerateInstructionsOutputSchema = z.object({
  instructions: z.array(z.string()).describe('The newly generated step-by-step instructions as a list of strings.'),
});
export type RegenerateInstructionsOutput = z.infer<typeof RegenerateInstructionsOutputSchema>;


// Schema for suggesting dishes
export const SuggestDishesInputSchema = z.object({
  thoughts: z.string().describe("The user's abstract thoughts, mood, or cravings."),
});
export type SuggestDishesInput = z.infer<typeof SuggestDishesInputSchema>;

export const DishSuggestionSchema = z.object({
    dish_name: z.string().describe('Name of the Dish'),
    description: z.string().describe("A short, appetizing one-line description of why this fits the user's thought."),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('The difficulty to prepare the dish.'),
});

export const SuggestDishesOutputSchema = z.object({
  suggestions: z.array(DishSuggestionSchema),
});
export type SuggestDishesOutput = z.infer<typeof SuggestDishesOutputSchema>;
