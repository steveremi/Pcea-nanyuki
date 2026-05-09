import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        navy: "bg-navy-900/10 text-navy-900",
        gold: "bg-gold-100 text-gold-700",
        green: "bg-emerald-100 text-emerald-800",
        muted: "bg-cream-200 text-navy-700",
        terracotta: "bg-terracotta-500/10 text-terracotta-600",
      },
    },
    defaultVariants: { variant: "muted" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
