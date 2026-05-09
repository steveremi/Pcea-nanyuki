import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all focus-ring disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-navy-900 text-cream-50 hover:bg-navy-800 shadow-[0_2px_0_var(--color-navy-950),0_8px_24px_-12px_rgba(15,42,71,0.4)]",
        gold:
          "bg-gold-500 text-navy-900 hover:bg-gold-600 hover:text-cream-50 shadow-[0_2px_0_var(--color-gold-700),0_8px_24px_-12px_rgba(168,134,57,0.4)]",
        outline:
          "border border-navy-900/20 bg-transparent text-navy-900 hover:bg-navy-900 hover:text-cream-50",
        ghost:
          "bg-transparent text-navy-900 hover:bg-navy-900/5",
        danger:
          "bg-terracotta-500 text-white hover:bg-terracotta-600",
      },
      size: {
        sm: "h-9 px-4",
        md: "h-11 px-6",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { buttonVariants };
