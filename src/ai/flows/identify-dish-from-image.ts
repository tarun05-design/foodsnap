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
  prompt: `You are an expert food identifier specializing in world cuisines, with deep knowledge of regional variations. Your task is to identify the dish in the provided photo with the highest possible accuracy.

  **Crucial Instructions for High Accuracy:**
  1.  **Analyze Visual Evidence First:** Before naming the dish, carefully examine the texture, color, and visible ingredients.
  2.  **Differentiate Similar Dishes:** Many dishes look alike. You must be able to distinguish them based on subtle visual cues. For example:
      *   **Sweet Pongal vs. Kesari Bath:** Sweet Pongal is made with rice and lentils, giving it a coarser, grainier texture. Kesari Bath is made from semolina (rava), which results in a smoother, more uniform appearance. Look for the distinct grains of rice and lentils to identify Pongal.
      *   If you see whole cashews, raisins, and a glossy ghee finish, it could be either. The core differentiating factor is the base ingredient's texture.
  3.  **Provide the Most Specific Name:** Avoid generic names. If it's a specific regional variant, name it.

  Based on this rigorous analysis of the photo, identify the dish.

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
