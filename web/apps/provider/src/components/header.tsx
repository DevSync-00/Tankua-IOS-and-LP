"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, ChevronDown, Settings, LogOut } from "lucide-react";
import { signOutProvider } from "@/lib/auth";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [providerName, setProviderName] = useState("Provider");
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("provider_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setProviderName(parsed?.name || parsed?.provider?.name || "Provider");
      }
    } catch {}
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const notifications = [
    { id: 1, title: "New Booking", message: "Yohannes T. booked Lalibela trip", time: "5m ago", unread: true },
    { id: 2, title: "Payment Received", message: "ETB 2,500 credited", time: "1h ago", unread: true },
    { id: 3, title: "Review Posted", message: "Sara M. left a 5-star review", time: "3h ago", unread: false },
  ];
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[rgba(245,168,0,0.15)] h-14">
      <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:pl-6">
        {/* Left */}
        <div className="flex-1 min-w-0 pl-12 lg:pl-0">
          <div className="flex items-center gap-2">
            <h1 className="font-syne font-bold text-[15px] text-brand-ink truncate">{title}</h1>
            {subtitle && <span className="hidden sm:inline font-dm text-[13px] text-brand-muted">· {subtitle}</span>}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5 shrink-0">
          {actions}

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl hover:bg-brand-sand transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label="Notifications">
              <Bell className="h-[18px] w-[18px] text-brand-muted" />
              {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-1.5rem)] bg-white rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.10)] border border-[rgba(245,168,0,0.15)] overflow-hidden z-50 animate-slide-down">
                <div className="px-4 py-3 border-b border-[rgba(245,168,0,0.1)] flex items-center justify-between">
                  <h3 className="font-syne font-bold text-[14px] text-brand-ink">Notifications</h3>
                  {unreadCount > 0 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(245,168,0,0.15)] text-brand-gold-dark">{unreadCount} new</span>}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-[rgba(245,168,0,0.06)]">
                  {notifications.map((n) => (
                    <div key={n.id} className={`px-4 py-3 hover:bg-brand-sand transition-colors cursor-pointer ${n.unread ? "bg-[rgba(245,168,0,0.03)]" : ""}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-1.5 h-1.5 mt-1.5 rounded-full shrink-0 ${n.unread ? "bg-brand-gold" : "bg-transparent"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-dm font-medium text-[13px] text-brand-ink">{n.title}</p>
                          <p className="font-dm text-[12px] text-brand-muted truncate mt-0.5">{n.message}</p>
                          <p className="font-dm text-[11px] text-brand-muted/60 mt-1">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-[rgba(245,168,0,0.1)]">
                  <button className="w-full text-[12px] text-brand-gold font-medium hover:text-brand-gold-dark transition-colors text-center">View all</button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div ref={profileRef} className="relative flex items-center gap-2 pl-2 sm:pl-3 border-l border-[rgba(245,168,0,0.15)]">
            <button onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-brand-sand transition-colors min-h-[36px]"
              aria-label="Profile menu">
              <div className="w-7 h-7 rounded-full bg-brand-gold flex items-center justify-center text-brand-ink font-bold text-[12px] shrink-0">
                {providerName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden lg:block font-dm font-medium text-[13px] text-brand-ink">{providerName}</span>
              <ChevronDown className="hidden lg:block h-3 w-3 text-brand-muted" />
            </button>
            {showProfile && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.10)] border border-[rgba(245,168,0,0.15)] overflow-hidden z-50 animate-slide-down">
                <div className="px-4 py-3 border-b border-[rgba(245,168,0,0.1)]">
                  <p className="font-syne font-bold text-[13px] text-brand-ink">{providerName}</p>
                  <p className="font-dm text-[12px] text-brand-muted mt-0.5">Provider</p>
                </div>
                <div className="py-1">
                  <a href="/dashboard/settings" className="flex items-center gap-3 px-4 py-2.5 font-dm text-[13px] text-brand-ink hover:bg-brand-sand transition-colors">
                    <Settings className="h-4 w-4 text-brand-muted" /> Settings
                  </a>
                  <button onClick={async () => { await signOutProvider(); window.location.href = "/login"; }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 font-dm text-[13px] text-danger hover:bg-[rgba(226,75,74,0.05)] transition-colors">
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
