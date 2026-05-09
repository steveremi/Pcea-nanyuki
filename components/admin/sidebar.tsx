"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Shield,
  Settings as SettingsIcon,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { ROLE_LABELS, type AdminProfile } from "@/lib/types";
import { PceaLogo } from "@/components/logo";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const NAV_BASE: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/registrations", label: "Registrations", icon: Users },
  { href: "/admin/surveys", label: "Surveys", icon: ClipboardList },
  { href: "/admin/team", label: "Officers", icon: Shield },
];

const NAV_MANAGE: NavItem[] = [
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

function navFor(role: string): NavItem[] {
  return role === "superadmin" || role === "chairman"
    ? [...NAV_BASE, ...NAV_MANAGE]
    : NAV_BASE;
}

/** White sidebar with soft navy accents */
export function AdminSidebar({ profile }: { profile: AdminProfile }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const navItems = navFor(profile.role);

  return (
    <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-white border-r border-slate-200 sticky top-0 h-dvh">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-slate-100">
        <Link href="/admin" className="block">
          <PceaLogo size="sm" />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-4 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] uppercase tracking-[0.14em] text-slate-400 font-semibold">
          Workspace
        </p>
        <div className="space-y-0.5">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact
              ? pathname === href
              : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group flex items-center gap-2.5 px-3 h-9 rounded-md text-sm font-medium transition-colors",
                  active
                    ? "bg-navy-50 text-navy-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-navy-900"
                )}
              >
                <Icon
                  className={cn(
                    "size-[17px] transition-colors",
                    active ? "text-navy-700" : "text-slate-400 group-hover:text-navy-600"
                  )}
                />
                {label}
                {active && (
                  <span className="ml-auto size-1.5 rounded-full bg-gold-500" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Profile footer */}
      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="size-8 rounded-full bg-navy-900 text-cream-50 grid place-items-center font-semibold text-[11px] shrink-0">
            {profile.full_name
              .split(" ")
              .map((s) => s[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-navy-900 truncate leading-tight">
              {profile.full_name}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {ROLE_LABELS[profile.role]}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-1 w-full flex items-center justify-center gap-2 h-8 rounded-md text-[11px] font-medium text-slate-500 hover:text-navy-900 hover:bg-slate-50 transition"
        >
          <LogOut className="size-3.5" /> Sign out
        </button>
      </div>
    </aside>
  );
}

/** Top bar — page title + user pill */
export function AdminTopBar({ profile }: { profile: AdminProfile }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const title = pageTitle(pathname);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 h-14 lg:h-15 bg-white/95 backdrop-blur border-b border-slate-200 flex items-center justify-between px-4 sm:px-7">
      <div className="flex items-center gap-3 min-w-0">
        <div className="lg:hidden">
          <Link href="/admin">
            <PceaLogo size="sm" showText={false} />
          </Link>
        </div>
        <div>
          <p className="hidden lg:block text-[10px] uppercase tracking-[0.14em] text-slate-400 font-semibold">
            PCEA Nanyuki Town Church
          </p>
          <h2 className="font-display text-base lg:text-[15px] font-semibold text-navy-900 leading-tight truncate">
            {title}
          </h2>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 pl-1 pr-2.5 h-8 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 transition"
        >
          <div className="size-6 rounded-full bg-navy-900 text-cream-50 grid place-items-center font-semibold text-[10px]">
            {profile.full_name
              .split(" ")
              .map((s) => s[0])
              .slice(0, 2)
              .join("")}
          </div>
          <span className="text-xs font-medium text-navy-800 hidden sm:inline">
            {profile.full_name.split(" ")[0]}
          </span>
          <ChevronDown className="size-3 text-slate-400" />
        </button>

        {open && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white border border-slate-200 shadow-[0_8px_24px_-12px_rgba(15,42,71,0.18)] z-20 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="text-sm font-semibold text-navy-900 truncate">
                  {profile.full_name}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {ROLE_LABELS[profile.role]}
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
              >
                <LogOut className="size-4" /> Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

/** Mobile bottom nav */
export function AdminBottomNav({ profile }: { profile: AdminProfile }) {
  const pathname = usePathname();
  const navItems = navFor(profile.role).slice(0, 4);
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-slate-200 bg-white grid grid-cols-4 h-16">
      {navItems.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition",
              active ? "text-navy-900" : "text-slate-500"
            )}
          >
            <Icon className={cn("size-5", active && "stroke-[2.5]")} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function pageTitle(pathname: string): string {
  if (pathname === "/admin") return "Dashboard";
  if (pathname.startsWith("/admin/registrations")) return "Registrations";
  if (pathname.startsWith("/admin/surveys")) return "Surveys";
  if (pathname.startsWith("/admin/team")) return "Officers";
  if (pathname.startsWith("/admin/settings")) return "Settings";
  return "Admin";
}
