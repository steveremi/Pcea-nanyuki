import * as React from "react";
import { cn } from "@/lib/utils";

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }
>(({ className, required, children, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium text-navy-900 leading-tight inline-flex items-center gap-1",
      className
    )}
    {...props}
  >
    {children}
    {required && <span className="text-terracotta-500" aria-hidden>*</span>}
  </label>
));
Label.displayName = "Label";
