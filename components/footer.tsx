import { AlvaniaMark } from "./logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-cream-300 bg-cream-50/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8 flex flex-col items-center gap-3 text-sm text-navy-600">
        <p className="text-center">
          © {new Date().getFullYear()} PCEA Nanyuki Town Church · Youth
          Fellowship
        </p>
        <AlvaniaMark />
        <a
          href="https://wa.me/254702841059"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] uppercase tracking-[0.18em] text-navy-400 hover:text-navy-700 transition"
        >
          Designed &amp; developed by Remi
        </a>
        <a
          href="/admin/login"
          className="text-[10px] uppercase tracking-[0.18em] text-navy-300 hover:text-navy-700 transition"
        >
          Officer login
        </a>
      </div>
    </footer>
  );
}
