import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/footer";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { SurveyForm } from "@/components/forms/survey-form";
import { fetchLookups } from "@/lib/lookups";

export const metadata = {
  title: "Survey · PCEA NTC Youth Fellowship",
};

export const dynamic = "force-dynamic";

export default async function SurveyPage() {
  const lookups = await fetchLookups();

  return (
    <div className="min-h-dvh flex flex-col bg-cream-100">
      <SiteHeader />

      <main className="flex-1 mx-auto max-w-3xl w-full px-4 sm:px-6 py-6 sm:py-14">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-navy-600 hover:text-navy-900 transition mb-4 sm:mb-6"
        >
          <ArrowLeft className="size-4" /> Back home
        </Link>

        <div className="rise">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-gold-700 font-semibold">
            Open to all members · Anonymous
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-semibold text-navy-900 mt-2 leading-tight">
            Youth Fellowship <span className="hand-underline">Survey</span>
          </h1>
          <p className="text-sm sm:text-base text-navy-600 mt-3 max-w-prose leading-relaxed">
            Your feedback informs the planning of programs, fundraising, and
            ministries. Approximate completion time: 5 minutes.
          </p>
        </div>

        <Card className="mt-6 sm:mt-8">
          <CardHeader>
            <h2 className="font-display text-2xl font-semibold text-navy-900">
              Share your feedback
            </h2>
            <p className="text-sm text-navy-600 mt-1">
              Names are not collected. Please be candid.
            </p>
          </CardHeader>
          <CardBody>
            <SurveyForm ageGroups={lookups.surveyAgeGroups} />
          </CardBody>
        </Card>
      </main>

      <SiteFooter />
    </div>
  );
}
