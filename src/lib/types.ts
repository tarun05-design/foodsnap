export interface Ingredient {
  ingredient: string;
  measure: string;
}

export interface Nutrition {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  area: string;
  instructions: string[];
  thumbnail: string;
  youtubeUrl?: string;
  ingredients: Ingredient[];
  userImage?: string;
  nutrition?: Nutrition;
}

export interface Suggestions {
  dishName: string;
  suggestions: string[];
}

export interface MultiRecipe {
  userImage: string;
  recipes: Recipe[];
}
