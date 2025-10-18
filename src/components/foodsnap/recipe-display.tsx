import Image from "next/image";
import { type Recipe } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Utensils, Soup, Youtube, ChefHat, RotateCw } from "lucide-react";

type RecipeDisplayProps = {
  recipe: Recipe;
  onReset: () => void;
};

export default function RecipeDisplay({ recipe, onReset }: RecipeDisplayProps) {
  return (
    <Card className="w-full animate-in fade-in-50 duration-500">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-3xl md:text-4xl">{recipe.name}</CardTitle>
        <CardDescription>
          A delicious {recipe.area} {recipe.category} dish.
        </CardDescription>
        <div className="flex justify-center gap-2 pt-2">
          <Badge variant="secondary">{recipe.area}</Badge>
          <Badge variant="secondary">{recipe.category}</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-8 md:grid-cols-5">
        <div className="relative md:col-span-2">
            <Image
              src={recipe.thumbnail}
              alt={recipe.name}
              width={400}
              height={400}
              className="aspect-square w-full rounded-lg object-cover shadow-lg"
              data-ai-hint="food meal"
            />
        </div>

        <div className="space-y-6 md:col-span-3">
          <div>
            <h3 className="mb-4 flex items-center gap-3 font-headline text-2xl text-primary">
              <Utensils />
              Ingredients
            </h3>
            <ul className="grid grid-cols-1 gap-x-6 gap-y-2 text-foreground sm:grid-cols-2">
              {recipe.ingredients.map((item, index) => (
                <li key={index} className="flex gap-2">
                  <span className="font-semibold text-primary">{item.measure}</span>
                  <span>{item.ingredient}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 flex items-center gap-3 font-headline text-2xl text-primary">
              <ChefHat />
              Instructions
            </h3>
            <div className="prose prose-sm max-w-none space-y-4 text-foreground">
              {recipe.instructions.map((step, index) => (
                <p key={index} className="flex gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent font-bold text-accent-foreground">{index + 1}</span>
                    <span>{step}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center gap-4 pt-6 sm:flex-row">
        <Button onClick={onReset}>
            <RotateCw className="mr-2 h-4 w-4" />
            Try Another
        </Button>
        {recipe.youtubeUrl && (
          <Button variant="outline" asChild>
            <a href={recipe.youtubeUrl} target="_blank" rel="noopener noreferrer">
              <Youtube className="mr-2 h-4 w-4" />
              Watch on YouTube
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
