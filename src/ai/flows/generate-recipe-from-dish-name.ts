'use server';
/**
 * @fileOverview This file defines a Genkit flow to generate a complete recipe
 * for a given dish name when TheMealDB API fails to find one.
 *
 * @exports {
 *   generateRecipeFromDishName: (input: GenerateRecipeInput) => Promise<GenerateRecipeOutput>;
 *   GenerateRecipeInput: z.infer<typeof GenerateRecipeInputSchema>;
 *   GenerateRecipeOutput: z.infer<typeof GenerateRecipeOutputSchema>;
 * }
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRecipeInputSchema = z.object({
  dishName: z.string().describe('The name of the dish to generate a recipe for.'),
});
export type GenerateRecipeInput = z.infer<typeof GenerateRecipeInputSchema>;

const IngredientSchema = z.object({
  ingredient: z.string().describe('The name of the ingredient.'),
  measure: z.string().describe('The measurement for the ingredient (e.g., "1 cup", "200g").'),
});

const NutritionSchema = z.object({
    calories: z.string().describe('Estimated calories for a single serving, e.g., "350 kcal".'),
    protein: z.string().describe('Estimated protein in grams, e.g., "15g".'),
    carbs: z.string().describe('Estimated carbohydrates in grams, e.g., "40g".'),
    fat: z.string().describe('Estimated fat in grams, e.g., "12g".'),
});

const GenerateRecipeOutputSchema = z.object({
    id: z.string().describe('A unique identifier for the recipe, can be a generated UUID.'),
    name: z.string().describe('The name of the recipe.'),
    category: z.string().describe('The category of the dish (e.g., "Dessert", "Main Course").'),
    area: z.string().describe('The geographical area or cuisine of origin (e.g., "Italian", "Mexican").'),
    instructions: z.array(z.string()).describe('An array of strings, where each string is a step in the recipe instructions.'),
    thumbnail: z.string().describe('A URL for a placeholder thumbnail image for the dish.'),
    youtubeUrl: z.string().optional().describe('An optional URL to a YouTube video for the recipe.'),
    ingredients: z.array(IngredientSchema).describe('An array of ingredients with their measures.'),
    nutrition: NutritionSchema.describe('Estimated nutritional information for a single serving of the dish.'),
});
export type GenerateRecipeOutput = z.infer<typeof GenerateRecipeOutputSchema>;

export async function generateRecipeFromDishName(input: GenerateRecipeInput): Promise<GenerateRecipeOutput> {
  return generateRecipeFlow(input);
}

const generateRecipePrompt = ai.definePrompt({
  name: 'generateRecipeFromDishNamePrompt',
  input: {schema: GenerateRecipeInputSchema},
  output: {schema: GenerateRecipeOutputSchema},
  prompt: `You are an expert chef and a clear, concise copywriter specializing in recipes. You also have expertise as a nutritionist.
  A user has requested a recipe for a dish called "{{dishName}}".
  The primary recipe database did not find a match. Your task is to generate a complete, delicious, and easy-to-follow recipe.

  **Crucially, the instructions must be short, clear, and highly readable.** Break down complex steps into smaller, simple actions. Each step should be one or two short sentences at most.

  Based on the generated ingredients, you must also provide an estimated nutritional breakdown for a single serving.

  Please provide the following details in a JSON object:
  - id: A unique ID for this recipe. A random string is fine.
  - name: The name of the dish, which should be "{{dishName}}".
  - category: The best-fitting category for this dish (e.g., "Seafood", "Vegetarian", "Dessert").
  - area: The cuisine of origin (e.g., "Italian", "Thai", "American").
  - instructions: A list of short, step-by-step instructions. For example: ["Mix the dry ingredients.", "Add the eggs and milk.", "Bake for 20 minutes at 350°F."].
  - thumbnail: Provide a placeholder image URL from picsum.photos. e.g. https://picsum.photos/seed/random-seed-123/500/500
  - youtubeUrl: If possible, a relevant YouTube link. If not, omit this field.
  - ingredients: A list of objects, each with an "ingredient" and a "measure".
  - nutrition: An object with estimated calories, protein, carbs, and fat for a single serving. Format these as strings with units (e.g., "350 kcal", "15g").

  Ensure the recipe is practical for a home cook and the instructions are exceptionally easy to follow.
  `,
});

const generateRecipeFlow = ai.defineFlow(
  {
    name: 'generateRecipeFromDishNameFlow',
    inputSchema: GenerateRecipeInputSchema,
    outputSchema: GenerateRecipeOutputSchema,
  },
  async input => {
    const {output} = await generateRecipePrompt(input);
    return output!;
  }
);
