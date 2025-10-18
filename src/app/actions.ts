"use server";

import { identifyDishFromImage } from "@/ai/flows/identify-dish-from-image";
import { generateRecipeFromDishName } from "@/ai/flows/generate-recipe-from-dish-name";
import { getNutritionForRecipe } from "@/ai/flows/get-nutrition-for-recipe";
import { suggestRecipeOnApiFailure } from "@/ai/flows/suggest-recipe-on-api-failure";
import type { Recipe, Suggestions, MultiRecipe, Nutrition } from "@/lib/types";

type RecipeState = {
  status: "recipe";
  data: Recipe;
  message?: never;
};

type MultiRecipeState = {
  status: "multi-recipe";
  data: MultiRecipe;
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
  | MultiRecipeState
  | ErrorState;

// Helper to transform TheMealDB API response to our Recipe type
const transformMealData = (meal: any, userImage?: string): Omit<Recipe, 'nutrition'> => {
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
    userImage,
  };
};

const getRecipe = async (dishName: string): Promise<Recipe | null> => {
  const recipeResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(dishName)}`);
  if (!recipeResponse.ok) {
     // Do not throw, handle gracefully
    console.error(`Failed to fetch from recipe API for ${dishName}.`);
    return null;
  }
  
  const recipeData = await recipeResponse.json();

  if (recipeData.meals && recipeData.meals.length > 0) {
    const basicRecipe = transformMealData(recipeData.meals[0]);
    // Now, get nutrition data for this recipe
    try {
        const nutrition = await getNutritionForRecipe({ ingredients: basicRecipe.ingredients });
        return { ...basicRecipe, nutrition };
    } catch (e) {
        console.error("Failed to get nutrition data", e);
        // Return recipe without nutrition if the AI call fails
        return { ...basicRecipe };
    }

  } else {
    // API failed to find a recipe, so we generate one with the AI cooker.
    // This already includes nutrition info.
    const generatedRecipe = await generateRecipeFromDishName({ dishName });
    return generatedRecipe;
  }
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

  try {
    const buffer = await file.arrayBuffer();
    const photoDataUri = `data:${file.type};base64,${Buffer.from(buffer).toString("base64")}`;

    const { dishes } = await identifyDishFromImage({ photoDataUri });

    if (!dishes || dishes.length === 0) {
      return { status: "error", message: "Could not identify any dish. Please try another image." };
    }

    if (dishes.length === 1) {
      const recipe = await getRecipe(dishes[0]);
      if (recipe) {
        return { status: "recipe", data: { ...recipe, userImage: photoDataUri } };
      } else {
        return { status: "error", message: `Could not find or generate a recipe for ${dishes[0]}.` };
      }
    } else {
      const recipes = await Promise.all(dishes.map(dish => getRecipe(dish)));
      const successfulRecipes = recipes.filter((r): r is Recipe => r !== null);
      
      if (successfulRecipes.length > 0) {
        return {
          status: "multi-recipe",
          data: {
            userImage: photoDataUri,
            recipes: successfulRecipes,
          },
        };
      } else {
         return { status: "error", message: "Could not find or generate recipes for the identified dishes." };
      }
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
