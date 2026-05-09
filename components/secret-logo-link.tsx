"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PceaLogo } from "./logo";

const HOLD_MS = 1500;

/**
 * Wraps the logo so:
 *  - normal click → goes to "/" (homepage)
 *  - press-and-hold for 1.5s → goes to "/admin/login"
 *
 * This is the "magic backdoor" for officers. The public never knows.
 */
export function SecretLogoLink({
  size = "md",
  variant = "dark",
}: {
  size?: "sm" | "md" | "lg";
  variant?: "dark" | "light";
}) {
  const router = useRouter();
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const heldRef = React.useRef(false);
  const [progress, setProgress] = React.useState(0);
  const progressTimer = React.useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  function startHold() {
    heldRef.current = false;
    setProgress(0);
    const start = Date.now();

    progressTimer.current = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / HOLD_MS);
      setProgress(p);
    }, 40);

    timerRef.current = setTimeout(() => {
      heldRef.current = true;
      cleanup();
      // Vibration feedback if available
      if ("vibrate" in navigator) navigator.vibrate?.(60);
      router.push("/admin/login");
    }, HOLD_MS);
  }

  function cleanup() {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressTimer.current) clearInterval(progressTimer.current);
    timerRef.current = null;
    progressTimer.current = null;
    setProgress(0);
  }

  function endHold() {
    cleanup();
  }

  function onClickGuard(e: React.MouseEvent) {
    // If long-press fired, don't follow the link
    if (heldRef.current) {
      e.preventDefault();
      heldRef.current = false;
    }
  }

  React.useEffect(() => () => cleanup(), []);

  return (
    <Link
      href="/"
      onClick={onClickGuard}
      onMouseDown={startHold}
      onMouseUp={endHold}
      onMouseLeave={endHold}
      onTouchStart={startHold}
      onTouchEnd={endHold}
      onTouchCancel={endHold}
      onContextMenu={(e) => e.preventDefault()}
      className="focus-ring rounded-lg shrink-0 min-w-0 relative select-none"
      aria-label="PCEA Nanyuki Town Church Youth — long press for officer login"
    >
      <span className="hidden sm:block">
        <PceaLogo size={size} variant={variant} />
      </span>
      <span className="sm:hidden">
        <PceaLogo size="sm" variant={variant} />
      </span>

      {/* Subtle progress ring while holding — gives officers feedback */}
      {progress > 0 && (
        <span
          aria-hidden
          className="absolute -bottom-1 left-0 h-0.5 bg-gold-500 rounded-full transition-all"
          style={{ width: `${progress * 100}%` }}
        />
      )}
    </Link>
  );
}
