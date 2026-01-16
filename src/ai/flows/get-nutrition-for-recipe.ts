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
  servings: z.number().describe('The estimated number of servings this recipe makes.'),
  calories: z.string().describe('Estimated calories for a single serving as a numerical string, e.g., "350".'),
  protein: z.string().describe('Estimated protein in grams for a single serving as a numerical string, e.g., "15".'),
  carbs: z.string().describe('Estimated carbohydrates in grams for a single serving as a numerical string, e.g., "40".'),
  fat: z.string().describe('Estimated fat in grams for a single serving as a numerical string, e.g., "12".'),
});
export type GetNutritionOutput = z.infer<typeof GetNutritionOutputSchema>;

export async function getNutritionForRecipe(input: GetNutritionInput): Promise<GetNutritionOutput> {
  return getNutritionFlow(input);
}

const getNutritionPrompt = ai.definePrompt({
  name: 'getNutritionForRecipePrompt',
  input: {schema: GetNutritionInputSchema},
  output: {schema: GetNutritionOutputSchema},
  prompt: `You are an expert nutritionist and chef. Based on the following list of ingredients and their measurements, first estimate how many servings this recipe likely makes (e.g., 2, 4, 6).
  
  Then, calculate the estimated nutritional information **for a single serving**.

  Please provide the result as a JSON object with:
  - servings: The estimated number of servings.
  - calories: Estimated calories for ONE serving.
  - protein: Estimated protein in grams for ONE serving.
  - carbs: Estimated carbohydrates in grams for ONE serving.
  - fat: Estimated fat in grams for ONE serving.
  
  Format the nutritional values as numerical strings without units.

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
