"use server";

import { identifyDishFromImage } from "@/ai/flows/identify-dish-from-image";
import { generateRecipeFromDishName } from "@/ai/flows/generate-recipe-from-dish-name";
import { suggestRecipeOnApiFailure } from "@/ai/flows/suggest-recipe-on-api-failure";
import type { Recipe, Suggestions } from "@/lib/types";

type RecipeState = {
  status: "recipe";
  data: Recipe;
  message?: never;
};

type SuggestionsState = {
  status: "suggestions";
  data: Suggestions;
  message?: never;
};

type InitialState = {
  status: "initial";
  data?: never;
  message?: never;
};

type LoadingState = {
  status: "loading";
  data?: never;
  message?: never;
};

type ErrorState = {
  status: "error";
  data?: never;
  message: string;
};

export type AppState =
  | InitialState
  | LoadingState
  | RecipeState
  | SuggestionsState
  | ErrorState;

// Helper to transform TheMealDB API response to our Recipe type
const transformMealData = (meal: any): Recipe => {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim() !== "") {
      ingredients.push({ ingredient, measure: measure || "" });
    }
  }

  return {
    id: meal.idMeal,
    name: meal.strMeal,
    category: meal.strCategory,
    area: meal.strArea,
    instructions: meal.strInstructions.split('\r\n').filter((line: string) => line.trim() !== ''),
    thumbnail: meal.strMealThumb,
    youtubeUrl: meal.strYoutube,
    ingredients,
  };
};

export async function getRecipeForImage(
  prevState: AppState,
  formData: FormData
): Promise<AppState> {
  const file = formData.get("image") as File;

  if (!file || file.size === 0) {
    return { status: "error", message: "Please upload an image." };
  }

  // Basic validation for image type
  if (!file.type.startsWith("image/")) {
    return { status: "error", message: "Please upload a valid image file." };
  }

  // You can't return "loading" from a server action to the client state during processing,
  // so the client must handle the pending state. This action returns the final state.
  try {
    const buffer = await file.arrayBuffer();
    const photoDataUri = `data:${file.type};base64,${Buffer.from(buffer).toString("base64")}`;

    const { dishName } = await identifyDishFromImage({ photoDataUri });

    if (!dishName) {
      return { status: "error", message: "Could not identify the dish. Please try another image." };
    }

    const recipeResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(dishName)}`);
    if (!recipeResponse.ok) {
       // Do not throw, handle gracefully
      console.error("Failed to fetch from recipe API.");
    }
    
    const recipeData = recipeResponse.ok ? await recipeResponse.json() : { meals: null };

    if (recipeData.meals && recipeData.meals.length > 0) {
      const recipe = transformMealData(recipeData.meals[0]);
      return { status: "recipe", data: recipe };
    } else {
      // API failed to find a recipe, so we suggest some alternatives.
      const { suggestedRecipes } = await suggestRecipeOnApiFailure({ dishName });
      if (suggestedRecipes && suggestedRecipes.length > 0) {
        return {
          status: "suggestions",
          data: { dishName, suggestions: suggestedRecipes },
        };
      }
      
      // If all else fails, generate a recipe as a last resort.
      const generatedRecipe = await generateRecipeFromDishName({ dishName });
      return { status: "recipe", data: generatedRecipe };
    }
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    if (errorMessage.includes('billing')) {
      return { status: "error", message: "AI processing failed due to a billing issue. Please check your project configuration." };
    }
    return { status: "error", message: "Failed to process the image. Please try again." };
  }
}
