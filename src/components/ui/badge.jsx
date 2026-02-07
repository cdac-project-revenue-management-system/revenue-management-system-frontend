import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/15 text-secondary",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-[hsl(0_72%_51%/0.15)] text-[hsl(0_72%_51%)]",
        success: "border-transparent bg-[hsl(142_76%_36%/0.15)] text-[hsl(142_76%_36%)]",
        warning: "border-transparent bg-[hsl(38_92%_50%/0.15)] text-[hsl(38_92%_50%)]",
        info: "border-transparent bg-[hsl(199_89%_48%/0.15)] text-[hsl(199_89%_48%)]",
        outline: "border-border text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
