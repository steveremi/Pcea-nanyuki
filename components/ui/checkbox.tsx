"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const fallbackId = React.useId();
    const finalId = id ?? fallbackId;
    return (
      <label
        htmlFor={finalId}
        className={cn(
          "group inline-flex items-start gap-3 cursor-pointer select-none",
          props.disabled && "cursor-not-allowed opacity-60",
          className
        )}
      >
        <span className="relative inline-flex">
          <input
            ref={ref}
            id={finalId}
            type="checkbox"
            className="peer absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
            {...props}
          />
          <span
            aria-hidden
            className={cn(
              "size-5 rounded-md border border-cream-300 bg-white grid place-items-center transition-all",
              "peer-checked:bg-navy-900 peer-checked:border-navy-900",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-navy-700/20 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-cream-100"
            )}
          >
            <Check className="size-3.5 text-cream-50 opacity-0 peer-checked:opacity-100 transition" />
          </span>
        </span>
        {label && (
          <span className="text-sm text-navy-900 leading-tight pt-0.5">
            {label}
          </span>
        )}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";
