import Image from "next/image";
import { type MultiRecipe } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Utensils, ChefHat, Youtube, RotateCw, BarChart } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


type MultiRecipeDisplayProps = {
  result: MultiRecipe;
  onReset: () => void;
};

export default function MultiRecipeDisplay({ result, onReset }: MultiRecipeDisplayProps) {
  const { userImage, recipes } = result;

  return (
    <Card className="w-full animate-in fade-in-50 duration-500">
      <CardHeader className="p-0">
        <div className="relative mb-4 h-64 w-full md:h-80">
            <Image
              src={userImage}
              alt="Uploaded meal"
              fill
              objectFit="cover"
              className="rounded-t-lg"
              data-ai-hint="food meal"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <div className="px-6 pb-4 text-center">
            <CardTitle className="font-headline text-3xl md:text-4xl pt-2">A Feast of Recipes!</CardTitle>
            <CardDescription className="mx-auto max-w-lg pt-1">
                We've identified each dish in your photo and found a delicious recipe for every one.
            </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <Accordion type="single" collapsible className="w-full">
          {recipes.map((recipe, index) => (
            <AccordionItem value={`item-${index}`} key={recipe.id || index}>
              <AccordionTrigger className="font-headline text-xl hover:no-underline">
                {recipe.name}
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex justify-start gap-2 py-2">
                    <Badge variant="secondary">{recipe.area}</Badge>
                    <Badge variant="secondary">{recipe.category}</Badge>
                </div>
                 <Tabs defaultValue="ingredients" className="w-full pt-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="ingredients"><Utensils className="mr-2 h-4 w-4"/>Ingredients</TabsTrigger>
                        <TabsTrigger value="instructions"><ChefHat className="mr-2 h-4 w-4"/>Instructions</TabsTrigger>
                        <TabsTrigger value="nutrition"><BarChart className="mr-2 h-4 w-4"/>Nutrition</TabsTrigger>
                    </TabsList>
                    <TabsContent value="ingredients" className="py-6">
                        <ul className="space-y-3 text-base text-foreground">
                        {recipe.ingredients.map((item, index) => (
                            <li key={index} className="flex items-start gap-3">
                            <span className="mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-primary/80" />
                            <div>
                                <span className="font-normal text-foreground/90">{item.measure}</span> {item.ingredient}
                            </div>
                            </li>
                        ))}
                        </ul>
                    </TabsContent>
                    <TabsContent value="instructions" className="py-6">
                        <ol className="list-decimal space-y-4 pl-5 text-base leading-relaxed text-foreground/90">
                        {recipe.instructions.map((step, index) => (
                            step.trim() && (
                                <li key={index} className="pl-2">
                                {step}
                                </li>
                            )
                        ))}
                        </ol>
                    </TabsContent>
                    <TabsContent value="nutrition" className="py-6">
                        {recipe.nutrition ? (
                            <>
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                    <div className="rounded-lg bg-secondary/50 p-4 text-center">
                                        <p className="text-sm font-medium text-muted-foreground">Calories</p>
                                        <p className="font-headline text-2xl font-bold text-primary">{recipe.nutrition.calories}</p>
                                    </div>
                                    <div className="rounded-lg bg-secondary/50 p-4 text-center">
                                        <p className="text-sm font-medium text-muted-foreground">Protein</p>
                                        <p className="font-headline text-2xl font-bold text-primary">{recipe.nutrition.protein}</p>
                                    </div>
                                    <div className="rounded-lg bg-secondary/50 p-4 text-center">
                                        <p className="text-sm font-medium text-muted-foreground">Carbs</p>
                                        <p className="font-headline text-2xl font-bold text-primary">{recipe.nutrition.carbs}</p>
                                    </div>
                                    <div className="rounded-lg bg-secondary/50 p-4 text-center">
                                        <p className="text-sm font-medium text-muted-foreground">Fat</p>
                                        <p className="font-headline text-2xl font-bold text-primary">{recipe.nutrition.fat}</p>
                                    </div>
                                </div>
                                <Alert className="mt-6">
                                    <AlertTitle className="font-headline">Disclaimer</AlertTitle>
                                    <AlertDescription>
                                        Nutritional information is estimated by AI and may not be 100% accurate. Please consult a professional nutritionist for precise data.
                                    </AlertDescription>
                                </Alert>
                            </>
                        ) : (
                            <p className="text-center text-muted-foreground">Nutritional information is not available for this recipe.</p>
                        )}
                    </TabsContent>
                </Tabs>
                {recipe.youtubeUrl && (
                  <Button variant="outline" asChild size="sm" className="mt-4">
                    <a href={recipe.youtubeUrl} target="_blank" rel="noopener noreferrer">
                      <Youtube className="mr-2 h-4 w-4" />
                      Watch on YouTube
                    </a>
                  </Button>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
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
