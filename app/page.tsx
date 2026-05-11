import Link from "next/link";
import { ArrowRight, ClipboardList, UserPlus } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/footer";

export default function HomePage() {
  return (
    <div className="min-h-dvh flex flex-col bg-cream-100 grain">
      <SiteHeader />

      {/* HERO */}
      <main className="flex-1">
        <section className="relative overflow-hidden">
          {/* Decorative gold orb */}
          <div
            aria-hidden
            className="absolute -top-40 -right-40 size-[520px] rounded-full bg-gold-200/40 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -bottom-32 -left-32 size-[420px] rounded-full bg-navy-200/40 blur-3xl"
          />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-10 sm:pt-24 pb-14 sm:pb-28">
            <div className="max-w-3xl rise">
              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight text-navy-900">
                Welcome to the <span className="hand-underline">Youth Fellowship.</span>
              </h1>
              <p className="mt-5 sm:mt-6 text-base sm:text-lg text-navy-700 max-w-2xl leading-relaxed">
                Register to join the fellowship, or take the survey to share
                feedback that shapes our calendar, programs, and ministries.
              </p>

              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  href="/register"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-navy-900 text-cream-50 px-6 sm:px-7 h-13 sm:h-14 text-sm sm:text-base font-semibold shadow-[0_2px_0_var(--color-navy-950),0_12px_32px_-12px_rgba(15,42,71,0.4)] hover:bg-navy-800 transition"
                >
                  <UserPlus className="size-5" />
                  Register
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition" />
                </Link>
                <Link
                  href="/survey"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-gold-500 text-navy-900 px-6 sm:px-7 h-13 sm:h-14 text-sm sm:text-base font-semibold shadow-[0_2px_0_var(--color-gold-700),0_12px_32px_-12px_rgba(168,134,57,0.45)] hover:bg-gold-600 hover:text-cream-50 transition"
                >
                  <ClipboardList className="size-5" />
                  Take the survey
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition" />
                </Link>
              </div>
            </div>

            {/* Two link cards */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mt-12 sm:mt-20">
              <LinkCard
                href="/register"
                eyebrow="For ages 13–35"
                title="Registration"
                body="Join the fellowship. Provide your details, pick the ministries you would like to serve in, and indicate your district."
                cta="Open registration"
              />
              <LinkCard
                href="/survey"
                eyebrow="Open to all members"
                title="Survey"
                body="Share feedback on the youth fellowship. Your responses are anonymous and inform our calendar, programs, and ministries."
                cta="Open survey"
                accent
              />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function LinkCard({
  href,
  eyebrow,
  title,
  body,
  cta,
  accent,
}: {
  href: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative card-soft p-6 sm:p-8 transition-all hover:-translate-y-1 hover:shadow-[0_2px_0_rgba(15,42,71,0.05),0_24px_48px_-24px_rgba(15,42,71,0.25)] ${
        accent ? "bg-gradient-to-br from-white to-gold-50" : ""
      }`}
    >
      <div className="text-[10px] sm:text-xs uppercase tracking-[0.16em] text-gold-700 font-semibold">
        {eyebrow}
      </div>
      <h3 className="font-display text-2xl sm:text-3xl font-semibold text-navy-900 mt-2 sm:mt-3 leading-tight">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-navy-700 mt-2 sm:mt-3 leading-relaxed">{body}</p>
      <div className="mt-5 sm:mt-6 inline-flex items-center gap-2 text-navy-900 font-semibold text-sm">
        {cta}
        <ArrowRight className="size-4 group-hover:translate-x-1 transition" />
      </div>
    </Link>
  );
}
