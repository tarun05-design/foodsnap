'use server';

/**
 * @fileOverview Identifies a dish from an image.
 *
 * - identifyDishFromImage - A function that identifies the dish from an image.
 * - IdentifyDishFromImageInput - The input type for the identifyDishFromImage function.
 * - IdentifyDishFromImageOutput - The return type for the identifyDishFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyDishFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of a dish, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'      
    ),
});
export type IdentifyDishFromImageInput = z.infer<typeof IdentifyDishFromImageInputSchema>;

const IdentifyDishFromImageOutputSchema = z.object({
  dishName: z.string().describe('The most specific and accurate name of the identified dish.'),
});
export type IdentifyDishFromImageOutput = z.infer<typeof IdentifyDishFromImageOutputSchema>;

export async function identifyDishFromImage(input: IdentifyDishFromImageInput): Promise<IdentifyDishFromImageOutput> {
  return identifyDishFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyDishFromImagePrompt',
  input: {schema: IdentifyDishFromImageInputSchema},
  output: {schema: IdentifyDishFromImageOutputSchema},
  prompt: `You are an expert food identifier specializing in world cuisines, including regional variations.
  Your task is to identify the dish in the provided photo with the highest possible accuracy.

  Pay close attention to the texture, ingredients, and presentation. For example, distinguish between South Indian dishes like 'Sweet Pongal' (made with rice and lentils) and 'Kesari Bath' (made with semolina/rava) even if they look similar.

  Provide the most specific name for the dish.

  Photo: {{media url=photoDataUri}}
  
  Dish Name:`,
});

const identifyDishFromImageFlow = ai.defineFlow(
  {
    name: 'identifyDishFromImageFlow',
    inputSchema: IdentifyDishFromImageInputSchema,
    outputSchema: IdentifyDishFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
