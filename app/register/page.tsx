import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/footer";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { RegistrationForm } from "@/components/forms/registration-form";
import { fetchLookups } from "@/lib/lookups";

export const metadata = {
  title: "Register · PCEA NTC Youth Fellowship",
};

// Always re-fetch from DB to pick up new districts/ministries instantly
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
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
            For ages 13–35
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-semibold text-navy-900 mt-2 leading-tight">
            Youth Fellowship <span className="hand-underline">Registration</span>
          </h1>
          <p className="text-sm sm:text-base text-navy-600 mt-3 max-w-prose leading-relaxed">
            Please complete the form below. Fields marked{" "}
            <span className="text-terracotta-500 font-semibold">*</span> are
            required.
          </p>
        </div>

        <Card className="mt-6 sm:mt-8">
          <CardHeader>
            <h2 className="font-display text-2xl font-semibold text-navy-900">
              Your details
            </h2>
            <p className="text-sm text-navy-600 mt-1">
              Used to enrol you in the fellowship and assign you to your
              district.
            </p>
          </CardHeader>
          <CardBody>
            <RegistrationForm
              ageGroups={lookups.ageGroups}
              districts={lookups.districts}
              ministries={lookups.ministries}
              membershipStatuses={lookups.membershipStatuses}
            />
          </CardBody>
        </Card>
      </main>

      <SiteFooter />
    </div>
  );
}
