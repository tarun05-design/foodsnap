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
              We couldn't find an exact match, but our AI chef cooked up this delicious idea for you!
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
                <ul className="list-disc space-y-2 pl-5 text-base text-foreground/90">
                  {recipe.ingredients.map((item, index) => (
                    <li key={index}>
                      <span className="font-semibold text-primary/90">{item.measure}</span> {item.ingredient}
                    </li>
                  ))}
                </ul>
            </TabsContent>
            <TabsContent value="instructions" className="py-6">
                <ol className="list-decimal space-y-4 pl-5 text-base text-foreground/90">
                  {recipe.instructions.map((step, index) => (
                     step.trim() && (
                        <li key={index} className="pl-2">
                           {step}
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
