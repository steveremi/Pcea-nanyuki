import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/footer";

export const metadata = {
  title: "Welcome · PCEA NTC Youth Fellowship",
};

export default function ThanksPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-cream-100">
      <SiteHeader />
      <main className="flex-1 grid place-items-center px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-xl text-center rise">
          <div className="inline-grid place-items-center size-14 sm:size-16 rounded-full bg-emerald-100 text-emerald-700 mb-5 sm:mb-6">
            <CheckCircle2 className="size-7 sm:size-8" />
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-semibold text-navy-900 leading-tight">
            Registration received.
          </h1>
          <p className="mt-4 text-sm sm:text-base text-navy-700 leading-relaxed">
            Welcome to the PCEA Nanyuki Town Church Youth Fellowship. The
            secretary will be in touch shortly regarding your district
            fellowship and selected ministries.
          </p>
          <p className="mt-2 text-sm sm:text-base text-navy-600 italic">
            “The Lord bless you and keep you.” — Numbers 6:24
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-navy-900 text-cream-50 px-6 h-11 text-sm font-semibold hover:bg-navy-800 transition"
            >
              Back home
            </Link>
            <Link
              href="/survey"
              className="inline-flex items-center justify-center rounded-full border border-navy-900/20 text-navy-900 px-6 h-11 text-sm font-semibold hover:bg-navy-900 hover:text-cream-50 transition"
            >
              Take the survey
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
