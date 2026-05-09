import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[88px] w-full rounded-lg border border-cream-300 bg-white px-4 py-3 text-sm",
      "placeholder:text-navy-400",
      "transition focus:border-navy-700 focus:ring-2 focus:ring-navy-700/15 focus:outline-none",
      "disabled:cursor-not-allowed disabled:opacity-50 resize-y",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
