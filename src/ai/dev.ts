import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-recipe-from-image.ts';
import '@/ai/flows/identify-dish-from-image.ts';
import '@/ai/flows/suggest-recipe-on-api-failure.ts';
import '@/ai/flows/generate-recipe-from-dish-name.ts';
import '@/ai/flows/get-nutrition-for-recipe.ts';
import '@/ai/flows/scale-recipe-ingredients.ts';
