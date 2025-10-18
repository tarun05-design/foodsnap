import Image from "next/image";
import { type Recipe } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Utensils, ChefHat, Youtube, RotateCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

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
                <div className="space-y-4">
                  {recipe.ingredients.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 rounded-md border border-border/70 bg-secondary/30 p-3">
                      <Checkbox id={`ingredient-${index}`} className="h-5 w-5" />
                      <label
                        htmlFor={`ingredient-${index}`}
                        className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                         <span className="font-semibold text-primary/90">{item.measure}</span> {item.ingredient}
                      </label>
                    </div>
                  ))}
                </div>
            </TabsContent>
            <TabsContent value="instructions" className="py-6">
                <ol className="list-none space-y-6">
                  {recipe.instructions.map((step, index) => (
                     step.trim() && (
                        <li key={index} className="flex gap-4 items-start">
                            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">{index + 1}</span>
                            <p className="mt-1 flex-1 text-base text-foreground/90">{step}</p>
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
