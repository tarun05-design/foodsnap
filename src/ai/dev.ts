import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-recipe-from-image.ts';
import '@/ai/flows/identify-dish-from-image.ts';
import '@/ai/flows/suggest-recipe-on-api-failure.ts';