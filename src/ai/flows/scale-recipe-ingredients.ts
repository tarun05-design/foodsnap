'use server';
/**
 * @fileOverview This file defines a Genkit flow to scale recipe ingredients based on the number of servings.
 * @exports scaleRecipeIngredients
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IngredientSchema = z.object({
  ingredient: z.string().describe('The name of the ingredient.'),
  measure: z.string().describe('The measurement for the ingredient (e.g., "1 cup", "200g").'),
});

const ScaleRecipeIngredientsInputSchema = z.object({
  ingredients: z.array(IngredientSchema).describe('The original list of ingredients.'),
  originalServings: z.number().describe('The original number of servings the recipe was for.'),
  newServings: z.number().describe('The target number of servings to scale the recipe to.'),
});
export type ScaleRecipeIngredientsInput = z.infer<typeof ScaleRecipeIngredientsInputSchema>;

const ScaleRecipeIngredientsOutputSchema = z.object({
    scaledIngredients: z.array(IngredientSchema).describe('The scaled list of ingredients with adjusted measures.')
});
export type ScaleRecipeIngredientsOutput = z.infer<typeof ScaleRecipeIngredientsOutputSchema>;

export async function scaleRecipeIngredients(input: ScaleRecipeIngredientsInput): Promise<ScaleRecipeIngredientsOutput> {
  return scaleRecipeIngredientsFlow(input);
}

const scaleIngredientsPrompt = ai.definePrompt({
  name: 'scaleRecipeIngredientsPrompt',
  input: {schema: ScaleRecipeIngredientsInputSchema},
  output: {schema: ScaleRecipeIngredientsOutputSchema},
  prompt: `You are an expert recipe scaler. Your task is to adjust the ingredient quantities of a recipe from an original number of servings to a new number of servings.

  Original Servings: {{originalServings}}
  New Servings: {{newServings}}

  Original Ingredients:
  {{#each ingredients}}
  - {{measure}} {{ingredient}}
  {{/each}}

  Please provide the new list of ingredients with adjusted measurements.
  - Be intelligent about scaling. For example, if scaling from 2 to 3 servings and an ingredient is "1 egg", you can't have "1.5 eggs". You might suggest "2 small eggs" or keep it at 2 and note that it will be slightly richer. Prefer to adjust to common measurements.
  - If scaling results in a fraction, try to convert it to a more common unit (e.g., "1.5 cups" is fine, but "0.375 cups" should be converted to "6 tablespoons").
  - Maintain the same JSON structure for the output.

  Return a JSON object with a single key "scaledIngredients".
  `,
});

const scaleRecipeIngredientsFlow = ai.defineFlow(
  {
    name: 'scaleRecipeIngredientsFlow',
    inputSchema: ScaleRecipeIngredientsInputSchema,
    outputSchema: ScaleRecipeIngredientsOutputSchema,
  },
  async input => {
    const {output} = await scaleIngredientsPrompt(input);
    return output!;
  }
);
