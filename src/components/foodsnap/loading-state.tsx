import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Utensils, Zap } from "lucide-react";

export default function LoadingState() {
  return (
    <div className="w-full animate-in fade-in-50 duration-500">
      <Card>
        <CardHeader className="items-center text-center">
          <Skeleton className="h-8 w-3/4 rounded-md" />
          <Skeleton className="h-4 w-1/2 rounded-md" />
        </CardHeader>
        <CardContent className="grid gap-8 md:grid-cols-5">
          <div className="md:col-span-2">
            <Skeleton className="aspect-square w-full rounded-lg" />
          </div>
          <div className="flex flex-col gap-6 md:col-span-3">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <Utensils className="h-6 w-6 text-primary" />
                <Skeleton className="h-6 w-40 rounded-md" />
              </div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full rounded-md" />
                ))}
              </div>
            </div>
            <div>
              <div className="mb-4 flex items-center gap-3">
                <Zap className="h-6 w-6 text-primary" />
                <Skeleton className="h-6 w-40 rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-20 w-full rounded-md" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="mt-4 flex animate-pulse items-center justify-center gap-2 text-sm text-muted-foreground">
        <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]"></div>
        <p>Analyzing your photo and cooking up a delicious plan...</p>
        <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]"></div>
        <div className="h-2 w-2 animate-bounce rounded-full bg-primary"></div>
      </div>
    </div>
  );
}
