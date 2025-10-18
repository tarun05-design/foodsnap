import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RotateCw, AlertTriangle } from "lucide-react";

type ErrorStateProps = {
  message?: string;
  onReset: () => void;
};

export default function ErrorState({ message = "Something went wrong.", onReset }: ErrorStateProps) {
  return (
    <Card className="w-full animate-in fade-in-50 duration-500">
      <CardHeader className="items-center text-center">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <CardTitle className="font-headline text-3xl">Something Went Wrong</CardTitle>
        <CardDescription className="text-destructive-foreground">
          {message}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p>I seem to have run into a problem. Please check your image or try again.</p>
      </CardContent>
      <CardFooter className="flex justify-center pt-6">
        <Button onClick={onReset} variant="destructive">
            <RotateCw className="mr-2 h-4 w-4" />
            Try Again
        </Button>
      </CardFooter>
    </Card>
  );
}
