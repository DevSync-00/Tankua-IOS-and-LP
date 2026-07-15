"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, CalendarCheck, Route, Users, Car,
  Wallet, Star, Settings, LogOut, HelpCircle, BarChart3, X, Menu,
} from "lucide-react";
import { cn } from "@tankua/ui";

const navSections = [
  {
    label: "MAIN",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "My Trips", href: "/dashboard/trips", icon: Route },
      { label: "Bookings", href: "/dashboard/bookings", icon: CalendarCheck },
      { label: "Analytics", href: "/dashboard/reports", icon: BarChart3 },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      { label: "Reviews", href: "/dashboard/reviews", icon: Star },
      { label: "Payouts", href: "/dashboard/earnings", icon: Wallet },
      { label: "Drivers", href: "/dashboard/drivers", icon: Users },
      { label: "Vehicles", href: "/dashboard/vehicles", icon: Car },
      { label: "Support", href: "/dashboard/support", icon: HelpCircle },
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

const mobileTabs = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Trips", href: "/dashboard/trips", icon: Route },
  { label: "Bookings", href: "/dashboard/bookings", icon: CalendarCheck },
  { label: "Payouts", href: "/dashboard/earnings", icon: Wallet },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [providerName, setProviderName] = useState("Provider");
  const [providerInitial, setProviderInitial] = useState("P");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("provider_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        const name = parsed?.provider?.name || parsed?.name || "Provider";
        setProviderName(name);
        setProviderInitial(name.charAt(0).toUpperCase());
      }
    } catch {}
  }, []);

  useEffect(() => { setIsMobileMenuOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  const handleSignOut = () => {
    localStorage.removeItem("provider_user");
    window.location.href = "/login";
  };

  const NavItem = ({ item }: { item: { label: string; href: string; icon: React.ElementType } }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
    return (
      <Link href={item.href} onClick={() => setIsMobileMenuOpen(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-r-0 text-[13px] font-medium transition-all duration-150 relative border-l-[3px]",
          isActive
            ? "bg-[rgba(245,168,0,0.07)] text-brand-ink border-brand-gold"
            : "text-brand-muted border-transparent hover:text-brand-ink hover:bg-[rgba(245,168,0,0.04)]"
        )}>
        <item.icon className={cn("h-[18px] w-[18px] shrink-0 transition-colors", isActive ? "text-brand-gold" : "text-brand-muted group-hover:text-brand-gold")} />
        <span>{item.label}</span>
      </Link>
    );
  };

  const SidebarContent = () => (
    <aside className="flex flex-col h-full bg-brand-cream border-r border-[rgba(245,168,0,0.15)]">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-[rgba(245,168,0,0.12)] flex items-center justify-between">
        <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5 group">
          <Image src="/icon.jpg" alt="Tankua" width={28} height={28} className="rounded-lg object-contain" />
          <div>
            <p className="font-syne font-bold text-[14px] text-brand-ink leading-tight">Tankua</p>
            <p className="font-dm text-[11px] text-brand-muted">{providerName}</p>
          </div>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-1.5 text-brand-muted hover:text-brand-ink rounded-lg transition-colors" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
        {navSections.map((section) => (
          <div key={section.label} className="space-y-0.5">
            <p className="px-3 mb-1.5 text-[10px] font-medium text-[#C4B49A] uppercase tracking-[0.12em]">{section.label}</p>
            {section.items.map((item) => <NavItem key={item.href} item={item} />)}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-2 pb-4 pt-3 border-t border-[rgba(245,168,0,0.12)] space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[rgba(245,168,0,0.05)]">
          <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center text-brand-ink font-bold text-[13px] shrink-0">
            {providerInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-dm font-medium text-[13px] text-brand-ink truncate leading-tight">{providerName}</p>
            <span className="inline-flex items-center gap-1 text-[10px] text-success font-medium mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" /> Active
            </span>
          </div>
        </div>
        <button onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-brand-muted hover:bg-[rgba(245,168,0,0.06)] hover:text-brand-ink transition-all">
          <LogOut className="h-4 w-4" /><span>Sign Out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white border border-[rgba(245,168,0,0.2)] text-brand-ink rounded-xl shadow-sm min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-[220px] z-50">
        <SidebarContent />
      </div>

      {/* Mobile sidebar drawer */}
      <div className={cn("lg:hidden fixed left-0 top-0 bottom-0 w-[220px] z-50 transition-transform duration-300 ease-out",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full")}>
        <SidebarContent />
      </div>

      {/* Mobile bottom tab bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-brand-cream border-t border-[rgba(245,168,0,0.15)] flex">
        {mobileTabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link key={tab.href} href={tab.href}
              className={cn("flex-1 flex flex-col items-center gap-1 py-2.5 min-h-[44px] transition-colors",
                isActive ? "text-brand-gold" : "text-brand-muted hover:text-brand-ink")}>
              <tab.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
