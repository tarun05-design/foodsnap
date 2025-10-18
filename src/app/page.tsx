
"use client";

import { useActionState } from "react";
import { getRecipeForImage, type AppState } from "@/app/actions";
import FoodSnapLogo from "@/components/foodsnap/foodsnap-logo";
import InitialState from "@/components/foodsnap/initial-state";
import LoadingState from "@/components/foodsnap/loading-state";
import RecipeDisplay from "@/components/foodsnap/recipe-display";
import MultiRecipeDisplay from "@/components/foodsnap/multi-recipe-display";
import SuggestionsDisplay from "@/components/foodsnap/suggestions-display";
import ErrorState from "@/components/foodsnap/error-state";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

const initialState: AppState = {
  status: "initial",
};

export default function Home() {
  const [state, formAction, isPending] = useActionState(getRecipeForImage, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.status === "error" && state.message) {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: state.message,
      });
    }
  }, [state, toast]);

  const resetState = () => {
    // A bit of a hack to reset the form state by re-invoking useFormState with initial state.
    // In a real app, we might use a key on the form or a more complex state management library.
    window.location.reload();
  };

  const currentStatus = isPending ? "loading" : state.status;

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl">
        <header className="mb-8 flex items-center justify-center text-center">
            <a href="#" onClick={(e) => { e.preventDefault(); resetState(); }} className="flex items-center gap-4 group">
                <FoodSnapLogo className="h-10 w-10" />
                <h1 className="font-headline text-4xl font-bold tracking-tight text-primary md:text-5xl group-hover:text-primary/90 transition-colors">
                    FoodSnap
                </h1>
            </a>
        </header>

        <div className="transition-all duration-500">
          {currentStatus === "initial" && (
            <InitialState formAction={formAction} />
          )}

          {currentStatus === "loading" && <LoadingState />}

          {currentStatus === "recipe" && state.data && (
            <RecipeDisplay recipe={state.data} onReset={resetState} />
          )}

          {currentStatus === "multi-recipe" && state.data && (
            <MultiRecipeDisplay result={state.data} onReset={resetState} />
          )}

          {currentStatus === "suggestions" && state.data && (
             <SuggestionsDisplay result={state.data} onReset={resetState} />
          )}

          {(currentStatus === "error") && (
             <ErrorState message={state.message} onReset={resetState} />
          )}

        </div>
        <footer className="mt-8 text-center text-sm text-muted-foreground">
            <p className="mb-2">Hey there! I'm your AI chef @FoodSnap</p>
            <Link href="/privacy" className="text-muted-foreground hover:text-primary underline">Privacy Policy</Link>
        </footer>
      </div>
    </main>
  );
}
