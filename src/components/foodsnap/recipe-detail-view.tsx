
"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { type Recipe } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Utensils, ChefHat, BarChart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { getScaledIngredients } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

type RecipeDetailViewProps = {
  recipe: Recipe;
};

export default function RecipeDetailView({ recipe: initialRecipe }: RecipeDetailViewProps) {
  const [recipe, setRecipe] = useState(initialRecipe);
  const [servings, setServings] = useState(initialRecipe.servings || 2);
  const [isScaling, startScaling] = useTransition();
  const { toast } = useToast();

  // Store original recipe to scale from, to avoid drift from multiple scaling operations
  const [originalRecipe] = useState(initialRecipe);

  const scaleRecipe = useCallback(async (newServings: number) => {
    if (newServings === (originalRecipe.servings || 2)) {
      setRecipe(originalRecipe);
      return;
    }

    startScaling(async () => {
      try {
        const scaledIngredients = await getScaledIngredients(
          originalRecipe.ingredients,
          originalRecipe.servings || 2,
          newServings
        );
        setRecipe(prev => ({ ...prev, ingredients: scaledIngredients }));
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Scaling Error",
          description: error instanceof Error ? error.message : "Could not adjust ingredients.",
        });
        setServings(originalRecipe.servings || 2); // Reset slider on error
      }
    });
  }, [originalRecipe, toast, startScaling]);

  // Debounce the scaling effect
  useEffect(() => {
    const handler = setTimeout(() => {
      scaleRecipe(servings);
    }, 800);

    return () => {
      clearTimeout(handler);
    };
  }, [servings, scaleRecipe]);


  const totalNutrition = recipe.nutrition ? {
      calories: (parseFloat(recipe.nutrition.calories || '0') * servings).toFixed(0),
      protein: (parseFloat(recipe.nutrition.protein || '0') * servings).toFixed(0),
      carbs: (parseFloat(recipe.nutrition.carbs || '0') * servings).toFixed(0),
      fat: (parseFloat(recipe.nutrition.fat || '0') * servings).toFixed(0),
  } : null;

  return (
     <Tabs defaultValue="ingredients" className="w-full pt-4">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ingredients"><Utensils className="mr-2 h-4 w-4"/>Ingredients</TabsTrigger>
            <TabsTrigger value="instructions"><ChefHat className="mr-2 h-4 w-4"/>Instructions</TabsTrigger>
        </TabsList>
        <TabsContent value="ingredients" className="py-6">
            <div className="mb-6 rounded-lg border bg-background p-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-headline text-xl">Servings</h3>
                    <span className="font-headline text-2xl font-bold text-primary">{servings}</span>
                </div>
                <Slider
                    value={[servings]}
                    min={1}
                    max={12}
                    step={1}
                    onValueChange={(value) => setServings(value[0])}
                    disabled={isScaling}
                />
            </div>
            
            {isScaling ? (
              <div className="space-y-3">
                {[...Array(recipe.ingredients.length || 5)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="mt-1.5 h-2 w-2 rounded-full" />
                    <Skeleton className="h-5 w-4/5 rounded-md" />
                  </div>
                ))}
              </div>
            ) : (
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
            )}
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
            {recipe.nutrition && totalNutrition && (
                <div className="mt-8 border-t pt-6">
                     <h3 className="mb-4 flex items-center font-headline text-xl">
                       <BarChart className="mr-3 h-5 w-5 text-primary" />
                       Nutrition (Total for {servings} {servings > 1 ? 'servings' : 'serving'})
                     </h3>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div className="rounded-lg bg-secondary/50 p-4 text-center">
                            <p className="text-sm font-medium text-muted-foreground">Calories</p>
                            <p className="font-headline text-2xl font-bold text-primary">{totalNutrition.calories} <span className="text-lg font-normal text-muted-foreground">kcal</span></p>
                        </div>
                        <div className="rounded-lg bg-secondary/50 p-4 text-center">
                            <p className="text-sm font-medium text-muted-foreground">Protein</p>
                            <p className="font-headline text-2xl font-bold text-primary">{totalNutrition.protein}<span className="text-lg font-normal text-muted-foreground">g</span></p>
                        </div>
                         <div className="rounded-lg bg-secondary/50 p-4 text-center">
                            <p className="text-sm font-medium text-muted-foreground">Carbs</p>
                            <p className="font-headline text-2xl font-bold text-primary">{totalNutrition.carbs}<span className="text-lg font-normal text-muted-foreground">g</span></p>
                        </div>
                         <div className="rounded-lg bg-secondary/50 p-4 text-center">
                            <p className="text-sm font-medium text-muted-foreground">Fat</p>
                            <p className="font-headline text-2xl font-bold text-primary">{totalNutrition.fat}<span className="text-lg font-normal text-muted-foreground">g</span></p>
                        </div>
                    </div>
                    <Alert className="mt-6">
                        <AlertTitle className="font-headline">Disclaimer</AlertTitle>
                        <AlertDescription>
                            Nutritional information is estimated by AI and may not be 100% accurate. Please consult a professional nutritionist for precise data.
                        </AlertDescription>
                    </Alert>
                </div>
            )}
        </TabsContent>
    </Tabs>
  );
}
