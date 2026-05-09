"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export interface RadioOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
  description?: React.ReactNode;
}

export function RadioGroup<T extends string = string>({
  name,
  value,
  onChange,
  options,
  columns = 1,
  className,
}: {
  name: string;
  value?: T;
  onChange: (v: T) => void;
  options: RadioOption<T>[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4",
  }[columns];

  return (
    <div className={cn("grid gap-2", gridCols, className)} role="radiogroup">
      {options.map((opt) => {
        const checked = opt.value === value;
        return (
          <label
            key={opt.value}
            className={cn(
              "relative flex items-start gap-3 rounded-xl border bg-white px-4 py-3 cursor-pointer transition-all",
              "hover:border-navy-700/50",
              checked
                ? "border-navy-900 ring-2 ring-navy-900/10 shadow-[0_2px_0_rgba(15,42,71,0.06)]"
                : "border-cream-300"
            )}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={checked}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            <span
              aria-hidden
              className={cn(
                "mt-0.5 size-4 rounded-full border-2 grid place-items-center transition",
                checked ? "border-navy-900" : "border-navy-300"
              )}
            >
              <span
                className={cn(
                  "size-2 rounded-full bg-navy-900 transition-all",
                  checked ? "scale-100" : "scale-0"
                )}
              />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-medium text-navy-900">
                {opt.label}
              </span>
              {opt.description && (
                <span className="block text-xs text-navy-500 mt-0.5">
                  {opt.description}
                </span>
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}
