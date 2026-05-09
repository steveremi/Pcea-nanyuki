import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        "flex h-11 w-full appearance-none rounded-lg border border-cream-300 bg-white px-4 pr-10 py-2 text-sm",
        "transition focus:border-navy-700 focus:ring-2 focus:ring-navy-700/15 focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-navy-500"
      aria-hidden
    />
  </div>
));
Select.displayName = "Select";
