'use server';

/**
 * @fileOverview This file defines a Genkit flow to suggest recipes from an image of food.
 *
 * It uses a combination of image analysis and LLM prompting to provide recipe suggestions.
 * The flow takes an image data URI as input and returns a recipe suggestion as a string.
 *
 * @exports {
 *   suggestRecipeFromImage: (input: SuggestRecipeFromImageInput) => Promise<string>;
 *   SuggestRecipeFromImageInput: z.infer<typeof SuggestRecipeFromImageInputSchema>;
 *   SuggestRecipeFromImageOutput: z.infer<typeof SuggestRecipeFromImageOutputSchema>;
 * }
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRecipeFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of the food, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
  dishDescription: z.string().optional().describe('Optional description of the dish.'),
});
export type SuggestRecipeFromImageInput = z.infer<typeof SuggestRecipeFromImageInputSchema>;

const SuggestRecipeFromImageOutputSchema = z.string().describe('Suggested recipe as a string.');
export type SuggestRecipeFromImageOutput = z.infer<typeof SuggestRecipeFromImageOutputSchema>;

export async function suggestRecipeFromImage(input: SuggestRecipeFromImageInput): Promise<string> {
  return suggestRecipeFromImageFlow(input);
}

const suggestRecipeFromImagePrompt = ai.definePrompt({
  name: 'suggestRecipeFromImagePrompt',
  input: {schema: SuggestRecipeFromImageInputSchema},
  output: {schema: SuggestRecipeFromImageOutputSchema},
  prompt: `You are a helpful assistant that suggests recipes based on an image of a dish.

  Analyze the image of the food and provide a recipe suggestion.
  Consider any provided description of the dish.

  Image: {{media url=photoDataUri}}
  Description: {{dishDescription}}

  Recipe suggestion:`,
});

const suggestRecipeFromImageFlow = ai.defineFlow(
  {
    name: 'suggestRecipeFromImageFlow',
    inputSchema: SuggestRecipeFromImageInputSchema,
    outputSchema: SuggestRecipeFromImageOutputSchema,
  },
  async input => {
    const {output} = await suggestRecipeFromImagePrompt(input);
    return output!;
  }
);
