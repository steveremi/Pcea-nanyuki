import { RegistrationForm } from "@/components/forms/registration-form";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/footer";
import { fetchLookups } from "@/lib/lookups";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata = {
  title: "Register · PCEA Nanyuki Town Church Youth Fellowship",
};

export const revalidate = 300; // Re-fetch lookups every 5 min

export default async function RegisterPage() {
  const [lookups, settings] = await Promise.all([
    fetchLookups(),
    getSiteSettings(),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="min-h-dvh bg-cream-100">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14">
          <div className="mb-6 sm:mb-8 text-center">
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-navy-900">
              Register
            </h1>
            <p className="mt-2 text-sm sm:text-base text-navy-600 max-w-xl mx-auto">
              A few questions to help us get to know you.
            </p>
          </div>
          <RegistrationForm lookups={lookups} settings={settings} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
