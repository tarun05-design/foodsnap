'use server';
/**
 * @fileOverview AI-powered recipe suggestion flow that provides alternative recipes if the primary recipe API fails.
 *
 * - suggestRecipeOnApiFailure - A function that suggests recipes based on the identified dish.
 * - SuggestRecipeOnApiFailureInput - The input type for the suggestRecipeOnApiFailure function.
 * - SuggestRecipeOnApiFailureOutput - The return type for the suggestRecipeOnApiFailure function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRecipeOnApiFailureInputSchema = z.object({
  dishName: z.string().describe('The name of the identified dish.'),
});
export type SuggestRecipeOnApiFailureInput = z.infer<typeof SuggestRecipeOnApiFailureInputSchema>;

const SuggestRecipeOnApiFailureOutputSchema = z.object({
  suggestedRecipes: z.array(
    z.string().describe('A suggested recipe based on the identified dish.')
  ).describe('An array of suggested recipes.'),
});
export type SuggestRecipeOnApiFailureOutput = z.infer<typeof SuggestRecipeOnApiFailureOutputSchema>;

export async function suggestRecipeOnApiFailure(
  input: SuggestRecipeOnApiFailureInput
): Promise<SuggestRecipeOnApiFailureOutput> {
  return suggestRecipeOnApiFailureFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRecipeOnApiFailurePrompt',
  input: {schema: SuggestRecipeOnApiFailureInputSchema},
  output: {schema: SuggestRecipeOnApiFailureOutputSchema},
  prompt: `The recipe API failed to provide results for the identified dish. Suggest alternative recipes based on the identified dish:

Identified Dish: {{{dishName}}}

Suggest at least 3 alternative recipes. Return as a JSON array of strings. Be creative and suggest interesting variations. Make sure each suggestion is different. The suggestions should be complete recipe names that a user can understand.

For example:

[
  "Spicy Chicken Fajitas with Pineapple Salsa",
  "Lemon Herb Roasted Chicken with Asparagus",
  "Mushroom and Swiss Cheese Stuffed Chicken Breast"
]
`,
});

const suggestRecipeOnApiFailureFlow = ai.defineFlow(
  {
    name: 'suggestRecipeOnApiFailureFlow',
    inputSchema: SuggestRecipeOnApiFailureInputSchema,
    outputSchema: SuggestRecipeOnApiFailureOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
