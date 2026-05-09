"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export function RatingScale({
  value,
  onChange,
  name,
  min = 1,
  max = 10,
}: {
  value?: number;
  onChange: (n: number) => void;
  name: string;
  min?: number;
  max?: number;
}) {
  const items = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
        {items.map((n) => {
          const selected = value === n;
          return (
            <label
              key={n}
              className={cn(
                "h-11 rounded-lg border bg-white grid place-items-center cursor-pointer transition-all text-sm font-semibold",
                "hover:border-navy-700/50",
                selected
                  ? "border-navy-900 bg-navy-900 text-cream-50 shadow-[0_2px_0_rgba(15,42,71,0.15)]"
                  : "border-cream-300 text-navy-700"
              )}
            >
              <input
                type="radio"
                name={name}
                value={n}
                checked={selected}
                onChange={() => onChange(n)}
                className="sr-only"
              />
              {n}
            </label>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-navy-500 px-1">
        <span>Not vibrant</span>
        <span>Very vibrant</span>
      </div>
    </div>
  );
}
