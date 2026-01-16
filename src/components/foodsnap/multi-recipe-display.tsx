import Image from "next/image";
import { type MultiRecipe } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import RecipeDetailView from "./recipe-detail-view";


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
                 <RecipeDetailView recipe={recipe} />
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
