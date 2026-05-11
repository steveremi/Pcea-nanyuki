import Link from "next/link";
import { ArrowLeft, Home, ClipboardCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/footer";

export const metadata = { title: "Thank you · PCEA NTC Youth" };

export default function RegisterThanksPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-dvh bg-cream-100">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-14 sm:py-20 text-center">
          <div className="mx-auto mb-5 size-14 rounded-full bg-navy-900 text-cream-50 grid place-items-center">
            <ClipboardCheck className="size-7" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-navy-900">
            You are registered.
          </h1>
          <p className="mt-3 text-sm sm:text-base text-navy-600 max-w-md mx-auto">
            Thanks for joining. If you sent a contribution, the treasurer will
            verify your M-Pesa code and confirm your payment.
          </p>

          <div className="mt-6 inline-block bg-white border border-cream-300 rounded-xl px-6 py-4 text-sm text-navy-700">
            <p className="font-display italic text-navy-800">
              &ldquo;The Lord bless thee, and keep thee.&rdquo;
            </p>
            <p className="text-xs text-navy-500 mt-1">— Numbers 6:24</p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-navy-900 text-cream-50 text-sm font-semibold hover:bg-navy-800 transition"
            >
              <Home className="size-4" /> Home
            </Link>
            <Link
              href="/survey"
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full border border-navy-300 text-navy-700 text-sm font-medium hover:bg-navy-50 transition"
            >
              <ArrowLeft className="size-4 rotate-180" /> Share feedback
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
