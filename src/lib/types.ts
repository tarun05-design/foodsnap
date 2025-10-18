export interface Ingredient {
  ingredient: string;
  measure: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  area: string;
  instructions: string[];
  thumbnail: string;
  youtubeUrl: string;
  ingredients: Ingredient[];
}

export interface Suggestions {
  dishName: string;
  suggestions: string[];
}
