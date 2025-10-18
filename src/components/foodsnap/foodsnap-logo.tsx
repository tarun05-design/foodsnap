import { UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export default function FoodSnapLogo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10", className)}>
      <UtensilsCrossed className="h-6 w-6 text-primary" {...props} />
    </div>
  );
}
