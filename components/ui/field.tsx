import * as React from "react";
import { cn } from "@/lib/utils";

export function Field({
  children,
  error,
  hint,
  className,
}: {
  children: React.ReactNode;
  error?: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {children}
      {error ? (
        <p className="text-xs text-terracotta-600 mt-0.5">{error}</p>
      ) : hint ? (
        <p className="text-xs text-navy-500 mt-0.5">{hint}</p>
      ) : null}
    </div>
  );
}
