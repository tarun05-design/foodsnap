import Image from "next/image";
import { type Recipe } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Utensils, ChefHat, Youtube, RotateCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type RecipeDisplayProps = {
  recipe: Recipe;
  onReset: () => void;
};

export default function RecipeDisplay({ recipe, onReset }: RecipeDisplayProps) {
  const displayImage = recipe.userImage || recipe.thumbnail;

  return (
    <Card className="w-full animate-in fade-in-50 duration-500">
      <CardHeader className="p-0">
        <div className="relative mb-4 h-64 w-full">
            <Image
              src={displayImage}
              alt={recipe.name}
              layout="fill"
              objectFit="cover"
              className="rounded-t-lg"
              data-ai-hint="food meal"
            />
        </div>
        <div className="px-6 pb-4 text-center">
            <div className="flex justify-center gap-2 pt-2">
              <Badge variant="secondary">{recipe.area}</Badge>
              <Badge variant="secondary">{recipe.category}</Badge>
            </div>
            <CardTitle className="font-headline text-3xl md:text-4xl pt-2">{recipe.name}</CardTitle>
            <CardDescription>
              A delicious {recipe.area} {recipe.category} dish.
            </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <Tabs defaultValue="ingredients" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ingredients"><Utensils className="mr-2 h-4 w-4"/>Ingredients</TabsTrigger>
                <TabsTrigger value="instructions"><ChefHat className="mr-2 h-4 w-4"/>Instructions</TabsTrigger>
            </TabsList>
            <TabsContent value="ingredients" className="py-6">
                 <ul className="grid grid-cols-1 gap-x-6 gap-y-3 text-foreground sm:grid-cols-2">
                  {recipe.ingredients.map((item, index) => (
                    <li key={index} className="flex gap-2 items-start">
                      <span className="font-semibold text-primary w-24 flex-shrink-0">{item.measure}</span>
                      <span>{item.ingredient}</span>
                    </li>
                  ))}
                </ul>
            </TabsContent>
            <TabsContent value="instructions" className="py-6">
                <ol className="prose prose-sm max-w-none space-y-4 text-foreground">
                  {recipe.instructions.map((step, index) => (
                     step.trim() && (
                        <li key={index} className="flex gap-4 items-start">
                            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-accent font-bold text-accent-foreground text-sm">{index + 1}</span>
                            <p className="mt-0.5">{step}</p>
                        </li>
                     )
                  ))}
                </ol>
            </TabsContent>
        </Tabs>
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
