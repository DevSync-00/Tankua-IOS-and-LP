"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Route,
  Users,
  Car,
  Wallet,
  Star,
  Settings,
  LogOut,
  ChevronRight,
  HelpCircle,
  BarChart3,
  X,
  Menu,
} from "lucide-react";
import { cn } from "@tankua/ui";

const mainNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Bookings", href: "/dashboard/bookings", icon: CalendarCheck },
  { label: "My Trips", href: "/dashboard/trips", icon: Route },
  { label: "Drivers", href: "/dashboard/drivers", icon: Users },
  { label: "Vehicles", href: "/dashboard/vehicles", icon: Car },
];

const financeItems = [
  { label: "Earnings", href: "/dashboard/earnings", icon: Wallet },
  { label: "Reports", href: "/dashboard/reports", icon: BarChart3 },
];

const otherItems = [
  { label: "Reviews", href: "/dashboard/reviews", icon: Star },
  { label: "Support", href: "/dashboard/support", icon: HelpCircle },
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

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const handleSignOut = () => {
    localStorage.removeItem("provider_user");
    window.location.href = "/login";
  };

  const NavItem = ({ item }: { item: typeof mainNavItems[0] }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

    return (
      <Link
        href={item.href}
        onClick={() => setIsMobileMenuOpen(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-[#EF9F27] text-[#1C0A00] shadow-sm"
            : "text-white/65 hover:bg-white/8 hover:text-white"
        )}
      >
        <item.icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-[#1C0A00]" : "")} />
        <span>{item.label}</span>
        {isActive && <ChevronRight className="ml-auto h-3.5 w-3.5 text-[#1C0A00]/60" />}
      </Link>
    );
  };

  const NavSection = ({ label, items }: { label: string; items: typeof mainNavItems }) => (
    <div className="space-y-0.5">
      <p className="px-3 mb-2 text-[10px] font-semibold text-white/30 uppercase tracking-widest">
        {label}
      </p>
      {items.map((item) => (
        <NavItem key={item.href} item={item} />
      ))}
    </div>
  );

  const SidebarContent = () => (
    <aside className="flex flex-col h-full bg-[#1C0A00]">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/8 flex items-center justify-between">
        <Link
          href="/dashboard"
          onClick={() => setIsMobileMenuOpen(false)}
          className="flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#EF9F27] flex items-center justify-center shadow-md shrink-0 group-hover:brightness-110 transition-all">
            <span className="text-[#1C0A00] font-bold text-lg leading-none">T</span>
          </div>
          <div>
            <span className="text-[15px] font-semibold text-white tracking-tight">Tankua</span>
            <span className="block text-[10px] text-[#EF9F27]/70 font-medium tracking-wide">
              Providers Portal
            </span>
          </div>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll px-3 py-4 space-y-5">
        <NavSection label="Main" items={mainNavItems} />
        <div className="h-px bg-white/6 mx-1" />
        <NavSection label="Finance" items={financeItems} />
        <div className="h-px bg-white/6 mx-1" />
        <NavSection label="Other" items={otherItems} />
      </nav>

      {/* Provider info + sign out */}
      <div className="px-3 pb-4 pt-3 border-t border-white/8 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5">
          <div className="w-8 h-8 rounded-full bg-[#EF9F27] flex items-center justify-center text-[#1C0A00] font-bold text-sm shrink-0">
            {providerInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate leading-tight">{providerName}</p>
            <span className="inline-flex items-center gap-1 text-[10px] text-[#1D9E75] font-medium mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] inline-block" />
              Active
            </span>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:bg-white/8 hover:text-white/80 transition-all"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1C0A00] text-white rounded-xl shadow-lg border border-white/10 min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-60 z-50">
        <SidebarContent />
      </div>

      {/* Mobile sidebar drawer */}
      <div
        className={cn(
          "lg:hidden fixed left-0 top-0 bottom-0 w-60 z-50 transition-transform duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </div>
    </>
  );
}
