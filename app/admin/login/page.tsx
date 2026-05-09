import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PceaLogo, AlvaniaMark } from "@/components/logo";
import { LoginForm } from "@/components/admin/login-form";
import { Suspense } from "react";

export const metadata = {
  title: "Officer Login · PCEA NTC Youth",
};

export default function LoginPage() {
  return (
    <div className="min-h-dvh grid lg:grid-cols-2 bg-cream-100">
      {/* Mobile brand bar (only visible on phone) */}
      <div className="lg:hidden bg-navy-900 text-cream-50 px-4 py-5 grain relative">
        <PceaLogo variant="light" size="sm" />
      </div>

      {/* Left brand panel (desktop only) */}
      <aside className="hidden lg:flex relative bg-navy-900 text-cream-50 p-12 flex-col justify-between overflow-hidden grain">
        <div
          aria-hidden
          className="absolute -top-24 -right-24 size-[400px] rounded-full bg-gold-500/15 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute bottom-0 -left-32 size-[400px] rounded-full bg-gold-400/10 blur-3xl"
        />
        <div className="relative">
          <PceaLogo variant="light" size="lg" />
        </div>
        <div className="relative">
          <p className="font-display text-4xl xl:text-5xl leading-tight">
            “Be diligent to present yourself approved to God, a worker who does
            not need to be ashamed.”
          </p>
          <p className="mt-4 text-cream-200 text-sm">— 2 Timothy 2:15</p>
        </div>
        <div className="relative text-cream-300 text-xs">
          <AlvaniaMark className="text-cream-300" />
        </div>
      </aside>

      {/* Right form */}
      <main className="flex flex-col justify-center px-4 sm:px-6 py-8 sm:py-12 lg:px-12">
        <div className="w-full max-w-md mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-navy-600 hover:text-navy-900 transition mb-6 sm:mb-8"
          >
            <ArrowLeft className="size-4" /> Back to public site
          </Link>

          <Card>
            <CardHeader>
              <div className="inline-grid place-items-center size-10 rounded-full bg-navy-900 text-cream-50 mb-3">
                <Lock className="size-4" />
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-navy-900">
                Officer login
              </h1>
              <p className="text-sm text-navy-600 mt-1">
                For chairman, vice chairman, treasurer, secretary, vice
                secretary.
              </p>
            </CardHeader>
            <CardBody>
              <Suspense fallback={null}>
                <LoginForm />
              </Suspense>
            </CardBody>
          </Card>

          <p className="text-xs text-navy-500 text-center mt-6">
            Lost access? Contact the chairman.
          </p>

          <a
            href="https://wa.me/254702841059"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-[10px] uppercase tracking-[0.18em] text-navy-400 hover:text-navy-700 transition mt-4"
          >
            Designed &amp; developed by Remi
          </a>
        </div>
      </main>
    </div>
  );
}
