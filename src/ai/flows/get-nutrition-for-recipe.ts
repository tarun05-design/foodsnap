'use server';
/**
 * @fileOverview This file defines a Genkit flow to get estimated nutritional
 * information for a given list of ingredients.
 *
 * @exports {
 *   getNutritionForRecipe: (input: GetNutritionInput) => Promise<GetNutritionOutput>;
 *   GetNutritionInput: z.infer<typeof GetNutritionInputSchema>;
 *   GetNutritionOutput: z.infer<typeof GetNutritionOutputSchema>;
 * }
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IngredientSchema = z.object({
  ingredient: z.string().describe('The name of the ingredient.'),
  measure: z.string().describe('The measurement for the ingredient (e.g., "1 cup", "200g").'),
});

const GetNutritionInputSchema = z.object({
  ingredients: z.array(IngredientSchema).describe('A list of ingredients and their measures.'),
});
export type GetNutritionInput = z.infer<typeof GetNutritionInputSchema>;

const GetNutritionOutputSchema = z.object({
  calories: z.string().describe('Estimated calories for the entire dish, e.g., "1200 kcal".'),
  protein: z.string().describe('Estimated protein in grams for the entire dish, e.g., "60g".'),
  carbs: z.string().describe('Estimated carbohydrates in grams for the entire dish, e.g., "150g".'),
  fat: z.string().describe('Estimated fat in grams for the entire dish, e.g., "45g".'),
});
export type GetNutritionOutput = z.infer<typeof GetNutritionOutputSchema>;

export async function getNutritionForRecipe(input: GetNutritionInput): Promise<GetNutritionOutput> {
  return getNutritionFlow(input);
}

const getNutritionPrompt = ai.definePrompt({
  name: 'getNutritionForRecipePrompt',
  input: {schema: GetNutritionInputSchema},
  output: {schema: GetNutritionOutputSchema},
  prompt: `You are an expert nutritionist. Based on the following list of ingredients and their measurements, calculate the estimated total nutritional information for the entire recipe.
  
  Please provide the result as a JSON object with the estimated total calories, protein, carbs, and fat. Format the values as strings with units (e.g., "1200 kcal", "60g").

  Ingredients:
  {{#each ingredients}}
  - {{measure}} {{ingredient}}
  {{/each}}
  `,
});

const getNutritionFlow = ai.defineFlow(
  {
    name: 'getNutritionForRecipeFlow',
    inputSchema: GetNutritionInputSchema,
    outputSchema: GetNutritionOutputSchema,
  },
  async input => {
    const {output} = await getNutritionPrompt(input);
    return output!;
  }
);
