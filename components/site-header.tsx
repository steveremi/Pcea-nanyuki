import Link from "next/link";
import { SecretLogoLink } from "./secret-logo-link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-cream-100/85 border-b border-cream-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        <SecretLogoLink />
        <nav className="flex items-center gap-1">
          <Link
            href="/register"
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-navy-800 hover:text-navy-900 transition rounded-full hover:bg-navy-900/5"
          >
            Register
          </Link>
          <Link
            href="/survey"
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-navy-800 hover:text-navy-900 transition rounded-full hover:bg-navy-900/5"
          >
            Survey
          </Link>
        </nav>
      </div>
    </header>
  );
}
