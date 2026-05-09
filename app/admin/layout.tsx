import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  AdminSidebar,
  AdminTopBar,
  AdminBottomNav,
} from "@/components/admin/sidebar";
import type { AdminProfile } from "@/lib/types";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <>{children}</>;
  }

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    await supabase.auth.signOut();
    redirect("/admin/login");
  }
  if (!(profile as AdminProfile).is_active) {
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  return (
    <div className="min-h-dvh bg-slate-50">
      <div className="flex">
        <AdminSidebar profile={profile as AdminProfile} />
        <div className="flex-1 min-w-0 flex flex-col min-h-dvh">
          <AdminTopBar profile={profile as AdminProfile} />
          <main className="flex-1 px-4 sm:px-6 py-3 sm:py-4 pb-24 lg:pb-4">
            {children}
          </main>
          <AdminFooter />
        </div>
      </div>
      <AdminBottomNav profile={profile as AdminProfile} />
    </div>
  );
}

function AdminFooter() {
  return (
    <footer className="hidden lg:flex items-center justify-between border-t border-slate-200 bg-white px-7 h-9 text-[10px] text-slate-500">
      <span>
        © {new Date().getFullYear()} PCEA Nanyuki Town Church · Youth Fellowship
      </span>
      <a
        href="https://wa.me/254702841059"
        target="_blank"
        rel="noopener noreferrer"
        className="uppercase tracking-[0.16em] hover:text-navy-700 transition font-medium"
      >
        Built by Remi
      </a>
    </footer>
  );
}
