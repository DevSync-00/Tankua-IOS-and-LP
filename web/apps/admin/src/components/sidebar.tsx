"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Building2, CalendarCheck, MapPin,
  CreditCard, Ticket, BarChart3, Settings, LogOut, Bell,
  HelpCircle, Gift, X, Shield, FileText, Menu,
} from "lucide-react";
import { cn } from "@tankua/ui";

const navSections = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Dashboard",    href: "/dashboard",                      icon: LayoutDashboard },
      { label: "Providers",    href: "/dashboard/providers",            icon: Building2 },
      { label: "Travelers",    href: "/dashboard/users",                icon: Users },
      { label: "Tours",        href: "/dashboard/destinations",         icon: MapPin },
      { label: "Applications", href: "/dashboard/provider-applications",icon: FileText },
      { label: "Bookings",     href: "/dashboard/bookings",             icon: CalendarCheck },
    ],
  },
  {
    label: "FINANCE",
    items: [
      { label: "Revenue",  href: "/dashboard/payments", icon: CreditCard },
      { label: "Payouts",  href: "/dashboard/payouts",  icon: Ticket },
    ],
  },
  {
    label: "MODERATION",
    items: [
      { label: "Approvals",   href: "/dashboard/provider-applications", icon: Shield },
      { label: "Reports",     href: "/dashboard/reports",               icon: BarChart3 },
      { label: "Promotions",  href: "/dashboard/promotions",            icon: Gift },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
      { label: "Support",       href: "/dashboard/support",       icon: HelpCircle },
      { label: "Settings",      href: "/dashboard/settings",      icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<{ name?: string; email?: string; role?: string } | null>(null);
  const isSuperAdmin = currentAdmin?.role === "super_admin";

  useEffect(() => {
    try {
      const data = localStorage.getItem("admin_user");
      if (data) setCurrentAdmin(JSON.parse(data));
    } catch {}
  }, []);

  useEffect(() => { setIsMobileMenuOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  const adminName = currentAdmin?.name || "Admin";
  const adminEmail = currentAdmin?.email || "";
  const adminInitial = adminName.charAt(0).toUpperCase();

  const NavItem = ({ item }: { item: { label: string; href: string; icon: React.ElementType } }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
    return (
      <Link href={item.href} onClick={() => setIsMobileMenuOpen(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium transition-all duration-150 border-l-[3px]",
          isActive
            ? "bg-[rgba(245,168,0,0.10)] text-white border-brand-gold"
            : "text-white/45 border-transparent hover:text-white/75"
        )}>
        <item.icon className={cn("h-[18px] w-[18px] shrink-0 transition-colors", isActive ? "text-brand-gold" : "")} />
        <span>{item.label}</span>
      </Link>
    );
  };

  const SidebarContent = () => (
    <aside className="flex flex-col h-full bg-brand-dark border-r border-white/[0.06]">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5 group">
          <div className="relative">
            <Image src="/icon.jpg" alt="Tankua" width={28} height={28} className="rounded-lg object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-syne font-bold text-[14px] text-white leading-tight">Tankua</span>
              <span className="font-mono text-[9px] bg-brand-gold text-brand-ink px-1.5 py-0.5 rounded-[4px] font-medium tracking-wide">ADMIN</span>
            </div>
          </div>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden p-1.5 text-white/40 hover:text-white rounded-lg transition-colors" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
        {navSections.map((section) => (
          <div key={section.label} className="space-y-0.5">
            <p className="px-3 mb-1.5 text-[10px] font-medium text-white/22 uppercase tracking-[0.12em]">{section.label}</p>
            {section.items.map((item) => <NavItem key={item.href} item={item} />)}
          </div>
        ))}
        {isSuperAdmin && (
          <div className="space-y-0.5">
            <p className="px-3 mb-1.5 text-[10px] font-medium text-white/22 uppercase tracking-[0.12em]">ADMINISTRATION</p>
            <NavItem item={{ label: "Admins", href: "/dashboard/admins", icon: Shield }} />
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="px-2 pb-4 pt-3 border-t border-white/[0.06] space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.04]">
          <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center text-brand-ink font-bold text-[13px] shrink-0">
            {adminInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-dm font-medium text-[13px] text-white truncate leading-tight">{adminName}</p>
            {adminEmail && <p className="font-dm text-[10px] text-white/40 truncate mt-0.5">{adminEmail}</p>}
          </div>
        </div>
        <button
          onClick={() => { localStorage.removeItem("admin_user"); window.location.href = "/login"; }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-white/40 hover:bg-white/[0.06] hover:text-white/80 transition-all">
          <LogOut className="h-4 w-4" /><span>Sign Out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-brand-dark text-white rounded-xl shadow-lg border border-white/10 min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-[220px] z-50">
        <SidebarContent />
      </div>

      {/* Mobile drawer */}
      <div className={cn("lg:hidden fixed left-0 top-0 bottom-0 w-[220px] z-50 transition-transform duration-300 ease-out",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full")}>
        <SidebarContent />
      </div>
    </>
  );
}
