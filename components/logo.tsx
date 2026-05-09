"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

/**
 * PCEA logomark.
 *
 * To use the official logo: drop a square PNG/JPG at public/pcea-logo.png
 * (e.g. 256×256 or larger). It will be picked up automatically.
 *
 * If no file is present, a placeholder cross-and-shield SVG is shown.
 */
export function PceaLogo({
  className,
  variant = "dark",
  size = "md",
  showText = true,
}: {
  className?: string;
  variant?: "dark" | "light";
  size?: Size;
  showText?: boolean;
}) {
  const [imgOk, setImgOk] = React.useState(true);

  const stroke =
    variant === "dark" ? "var(--color-navy-900)" : "var(--color-cream-50)";
  const accent = "var(--color-gold-500)";

  const px = size === "sm" ? 32 : size === "lg" ? 56 : 44;
  const titleSize =
    size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-lg";
  const subSize =
    size === "sm" ? "text-[9px]" : size === "lg" ? "text-[11px]" : "text-[10px]";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {imgOk ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/pcea-logo.png"
          alt="PCEA"
          width={px}
          height={px}
          className="shrink-0 object-contain"
          onError={() => setImgOk(false)}
        />
      ) : (
        <svg
          viewBox="0 0 64 64"
          width={px}
          height={px}
          className="shrink-0"
          aria-hidden
        >
          <path
            d="M32 4 L56 14 V32 C56 46 44 56 32 60 C20 56 8 46 8 32 V14 Z"
            fill="none"
            stroke={stroke}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <circle cx="32" cy="31" r="9" fill={accent} fillOpacity="0.18" />
          <path
            d="M32 18 V44 M22 28 H42"
            stroke={stroke}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M22 46 Q32 42 42 46"
            stroke={accent}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      )}

      {showText && (
        <div className="leading-tight">
          <div
            className={cn(
              "font-display font-semibold tracking-tight",
              titleSize
            )}
            style={{ color: stroke }}
          >
            PCEA Nanyuki
          </div>
          <div
            className={cn(
              "uppercase tracking-[0.16em] font-semibold",
              subSize
            )}
            style={{ color: accent }}
          >
            Town Church Youth
          </div>
        </div>
      )}
    </div>
  );
}

export function AlvaniaMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs", className)}>
      <span className="text-navy-400">Powered by</span>
      <span className="font-semibold text-navy-700 tracking-tight">
        Alvania Data Group
      </span>
    </span>
  );
}
