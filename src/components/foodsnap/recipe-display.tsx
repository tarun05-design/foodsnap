import Image from "next/image";
import { type Recipe } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";
import RecipeDetailView from "./recipe-detail-view";

type RecipeDisplayProps = {
  recipe: Recipe;
  onReset: () => void;
};

export default function RecipeDisplay({ recipe, onReset }: RecipeDisplayProps) {
  const displayImage = recipe.userImage || recipe.thumbnail;
  const isAiRecipe = !recipe.id.match(/^\d+$/);

  return (
    <Card className="w-full animate-in fade-in-50 duration-500">
      <CardHeader className="p-0">
        <div className="relative mb-4 h-64 w-full md:h-80">
            <Image
              src={displayImage}
              alt={recipe.name}
              fill
              objectFit="cover"
              className="rounded-t-lg"
              data-ai-hint="food meal"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <div className="px-6 pb-4 text-center">
            <div className="flex justify-center gap-2">
              <Badge variant="secondary">{recipe.area}</Badge>
              <Badge variant="secondary">{recipe.category}</Badge>
            </div>
            <CardTitle className="font-headline text-3xl md:text-4xl pt-2">{recipe.name}</CardTitle>
            {isAiRecipe && (
              <CardDescription className="mx-auto max-w-lg pt-1">
                We couldn't find an exact match, but our AI chef cooked up this delicious idea for you!
              </CardDescription>
            )}
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <RecipeDetailView recipe={recipe} />
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center gap-4 border-t pt-6 sm:flex-row">
        <Button onClick={onReset}>
            <RotateCw className="mr-2 h-4 w-4" />
            Try Another
        </Button>
      </CardFooter>
    </Card>
  );
}
