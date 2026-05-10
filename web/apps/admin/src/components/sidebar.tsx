"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  MapPin,
  CreditCard,
  Ticket,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  Bell,
  HelpCircle,
  Gift,
  X,
  Shield,
  FileText,
  Menu,
} from "lucide-react";
import { cn } from "@tankua/ui";

const mainNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/dashboard/users", icon: Users },
  { label: "Providers", href: "/dashboard/providers", icon: Building2 },
  { label: "Applications", href: "/dashboard/provider-applications", icon: FileText },
  { label: "Bookings", href: "/dashboard/bookings", icon: CalendarCheck },
  { label: "Destinations", href: "/dashboard/destinations", icon: MapPin },
];

const financeItems = [
  { label: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { label: "Payouts", href: "/dashboard/payouts", icon: Ticket },
  { label: "Reports", href: "/dashboard/reports", icon: BarChart3 },
];

const systemItems = [
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Promotions", href: "/dashboard/promotions", icon: Gift },
  { label: "Support", href: "/dashboard/support", icon: HelpCircle },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

const adminItems = [
  { label: "Admins", href: "/dashboard/admins", icon: Shield },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);
  const isSuperAdmin = currentAdmin?.role === "super_admin";

  useEffect(() => {
    const adminData = localStorage.getItem("admin_user");
    if (adminData) {
      try {
        setCurrentAdmin(JSON.parse(adminData));
      } catch (e) {
        console.error("Failed to parse admin user", e);
      }
    }
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

  const NavSection = ({
    label,
    items,
  }: {
    label: string;
    items: typeof mainNavItems;
  }) => (
    <div className="space-y-0.5">
      <p className="px-3 mb-2 text-[10px] font-semibold text-white/30 uppercase tracking-widest">
        {label}
      </p>
      {items.map((item) => (
        <NavItem key={item.href} item={item} />
      ))}
    </div>
  );

  const adminName = currentAdmin?.name || "Admin";
  const adminEmail = currentAdmin?.email || "admin@tankua.et";
  const adminInitial = adminName.charAt(0).toUpperCase();

  const SidebarContent = () => (
    <aside className="flex flex-col h-full bg-[#1C0A00]">
      {/* Logo + Admin badge */}
      <div className="px-5 py-5 border-b border-white/8 flex items-center justify-between">
        <Link
          href="/dashboard"
          onClick={() => setIsMobileMenuOpen(false)}
          className="flex items-center gap-3 group"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-[#EF9F27] flex items-center justify-center shadow-md shrink-0 group-hover:brightness-110 transition-all">
              <span className="text-[#1C0A00] font-bold text-lg leading-none">T</span>
            </div>
            <span className="absolute -bottom-1 -right-1 bg-[#1D9E75] text-white text-[8px] font-bold px-1 py-0.5 rounded leading-none">
              ADM
            </span>
          </div>
          <div>
            <span className="text-[15px] font-semibold text-white tracking-tight">Tankua</span>
            <span className="block text-[10px] text-[#EF9F27]/70 font-medium tracking-wide">
              Admin Panel
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
        <NavSection label="Platform" items={mainNavItems} />
        <div className="h-px bg-white/6 mx-1" />
        <NavSection label="Finance" items={financeItems} />
        <div className="h-px bg-white/6 mx-1" />
        <NavSection label="System" items={systemItems} />
        {isSuperAdmin && (
          <>
            <div className="h-px bg-white/6 mx-1" />
            <NavSection label="Administration" items={adminItems} />
          </>
        )}
      </nav>

      {/* Admin profile + sign out */}
      <div className="px-3 pb-4 pt-3 border-t border-white/8 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5">
          <div className="w-8 h-8 rounded-full bg-[#EF9F27] flex items-center justify-center text-[#1C0A00] font-bold text-sm shrink-0">
            {adminInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate leading-tight">{adminName}</p>
            <p className="text-[10px] text-white/40 truncate mt-0.5">{adminEmail}</p>
          </div>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("admin_user");
            window.location.href = "/login";
          }}
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
