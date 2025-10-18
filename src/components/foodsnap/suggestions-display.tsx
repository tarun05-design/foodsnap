import { type Suggestions } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Lightbulb, RotateCw } from "lucide-react";

type SuggestionsDisplayProps = {
  result: Suggestions;
  onReset: () => void;
};

export default function SuggestionsDisplay({ result, onReset }: SuggestionsDisplayProps) {
  return (
    <Card className="w-full animate-in fade-in-50 duration-500">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-3xl">Recipe Not Found</CardTitle>
        <CardDescription>
          We couldn't find a direct recipe for <span className="font-semibold text-primary">{result.dishName}</span>, but here are some creative suggestions!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mx-auto max-w-md space-y-3">
          {result.suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-center gap-3 rounded-md border bg-card p-3 shadow-sm">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
                <Lightbulb className="h-5 w-5" />
              </div>
              <p className="font-semibold">{suggestion}</p>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center pt-6">
        <Button onClick={onReset}>
            <RotateCw className="mr-2 h-4 w-4" />
            Try Another Image
        </Button>
      </CardFooter>
    </Card>
  );
}
