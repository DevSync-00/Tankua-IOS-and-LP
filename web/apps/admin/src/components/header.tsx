"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, ChevronDown, LogOut, Search } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const d = localStorage.getItem("admin_user");
      if (d) setAdminName(JSON.parse(d)?.name || "Admin");
    } catch {}
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const notifications = [
    { title: "New provider application", time: "2m ago", unread: true },
    { title: "Booking #4821 confirmed", time: "14m ago", unread: true },
    { title: "Payout of ETB 18,200 processed", time: "1h ago", unread: false },
  ];
  const unread = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[rgba(245,168,0,0.15)] h-14">
      <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:pl-6">
        {/* Left */}
        <div className="flex-1 min-w-0 pl-12 lg:pl-0">
          <h1 className="font-syne font-bold text-[15px] text-brand-ink">{title}</h1>
          {subtitle && <p className="font-dm text-[12px] text-brand-muted">{subtitle}</p>}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 shrink-0">
          {actions}

          {/* Search */}
          <div className="hidden sm:flex items-center gap-2 h-[34px] px-3 bg-brand-sand border border-[rgba(245,168,0,0.15)] rounded-[8px] w-[200px]">
            <Search className="h-3.5 w-3.5 text-brand-muted shrink-0" />
            <input type="text" placeholder="Search…"
              className="flex-1 text-[13px] font-dm text-brand-ink placeholder:text-brand-muted bg-transparent outline-none" />
          </div>

          {/* Bell */}
          <div className="relative" ref={notifRef}>
            <button onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl hover:bg-brand-sand transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label="Notifications">
              <Bell className="h-[18px] w-[18px] text-brand-muted" />
              {unread > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.10)] border border-[rgba(245,168,0,0.15)] overflow-hidden z-50 animate-slide-down">
                <div className="px-4 py-3 border-b border-[rgba(245,168,0,0.1)] flex items-center justify-between">
                  <h3 className="font-syne font-bold text-[14px] text-brand-ink">Notifications</h3>
                  {unread > 0 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(245,168,0,0.15)] text-brand-gold-dark">{unread} new</span>}
                </div>
                <div className="divide-y divide-[rgba(245,168,0,0.06)]">
                  {notifications.map((n, i) => (
                    <div key={i} className={`px-4 py-3 hover:bg-brand-sand transition-colors cursor-pointer ${n.unread ? "bg-[rgba(245,168,0,0.03)]" : ""}`}>
                      <div className="flex items-start gap-2.5">
                        <div className={`w-1.5 h-1.5 mt-1.5 rounded-full shrink-0 ${n.unread ? "bg-brand-gold" : "bg-transparent"}`} />
                        <div>
                          <p className="font-dm text-[13px] text-brand-ink">{n.title}</p>
                          <p className="font-dm text-[11px] text-brand-muted/60 mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div ref={profileRef} className="relative border-l border-[rgba(245,168,0,0.15)] pl-3">
            <button onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-brand-sand transition-colors min-h-[36px]"
              aria-label="Profile menu">
              <div className="w-7 h-7 rounded-full bg-brand-gold flex items-center justify-center text-brand-ink font-bold text-[12px]">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden lg:block font-dm font-medium text-[13px] text-brand-ink">{adminName}</span>
              <ChevronDown className="hidden lg:block h-3 w-3 text-brand-muted" />
            </button>
            {showProfile && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.10)] border border-[rgba(245,168,0,0.15)] overflow-hidden z-50 animate-slide-down">
                <div className="px-4 py-3 border-b border-[rgba(245,168,0,0.1)]">
                  <p className="font-syne font-bold text-[13px] text-brand-ink">{adminName}</p>
                  <p className="font-dm text-[11px] text-brand-muted mt-0.5">Administrator</p>
                </div>
                <div className="py-1">
                  <button onClick={() => { localStorage.removeItem("admin_user"); window.location.href = "/login"; }}
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
