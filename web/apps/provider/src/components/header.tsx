"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bell,
  Calendar,
  ChevronDown,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { Button, Badge, Avatar } from "@tankua/ui";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [providerName, setProviderName] = useState("Provider");
  const [providerRole, setProviderRole] = useState("Owner");
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("provider_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        const name = parsed?.name || parsed?.provider?.name || "Provider";
        const role = parsed?.role || "Owner";
        setProviderName(name);
        setProviderRole(role.charAt(0).toUpperCase() + role.slice(1));
      }
    } catch {}
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, title: "New Booking", message: "Yohannes T. booked Lalibela trip", time: "5m ago", unread: true },
    { id: 2, title: "Payment Received", message: "ETB 2,500 credited to your account", time: "1h ago", unread: true },
    { id: 3, title: "Review Posted", message: "Sara M. left a 5-star review", time: "3h ago", unread: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between h-14 px-4 sm:px-6 lg:pl-6">
        {/* Left side */}
        <div className="flex-1 min-w-0 pl-12 lg:pl-0">
          <h1 className="text-base sm:text-lg font-semibold text-[#1A1208] truncate tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-[#6B5E4E] truncate mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {actions}

          {/* Date pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-[#FAFAF8] border border-black/[0.06] rounded-lg text-xs text-[#6B5E4E]">
            <Calendar className="h-3.5 w-3.5 text-[#A89880]" />
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl hover:bg-[#FAFAF8] transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label="Notifications"
            >
              <Bell className="h-4.5 w-4.5 text-[#6B5E4E]" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E24B4A] rounded-full" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-black/[0.06] overflow-hidden animate-slide-down z-50">
                <div className="px-4 py-3 border-b border-black/[0.06] flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#1A1208]">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EF9F27]/15 text-[#BA7517]">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 border-b border-black/[0.04] last:border-0 hover:bg-[#FAFAF8] transition-colors cursor-pointer ${
                        n.unread ? "bg-[#EF9F27]/[0.04]" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-1.5 h-1.5 mt-1.5 rounded-full shrink-0 ${
                            n.unread ? "bg-[#EF9F27]" : "bg-transparent"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1A1208]">{n.title}</p>
                          <p className="text-xs text-[#6B5E4E] truncate mt-0.5">{n.message}</p>
                          <p className="text-[10px] text-[#A89880] mt-1">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-black/[0.06]">
                  <button className="w-full text-xs text-[#EF9F27] font-medium hover:text-[#BA7517] transition-colors text-center">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div
            ref={profileRef}
            className="relative flex items-center gap-2 pl-2 sm:pl-3 border-l border-black/[0.06]"
          >
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-[#FAFAF8] transition-colors min-h-[36px]"
              aria-label="Profile menu"
            >
              <div className="w-7 h-7 rounded-full bg-[#EF9F27] flex items-center justify-center text-[#1C0A00] font-bold text-xs shrink-0">
                {providerName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-[#1A1208] leading-tight">{providerName}</p>
                <p className="text-[10px] text-[#A89880]">{providerRole}</p>
              </div>
              <ChevronDown className="hidden lg:block h-3 w-3 text-[#A89880] ml-0.5" />
            </button>

            {showProfile && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-black/[0.06] overflow-hidden animate-slide-down z-50">
                <div className="px-4 py-3 border-b border-black/[0.06]">
                  <p className="text-sm font-semibold text-[#1A1208]">{providerName}</p>
                  <p className="text-xs text-[#6B5E4E] mt-0.5">{providerRole}</p>
                </div>
                <div className="py-1">
                  <a
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1A1208] hover:bg-[#FAFAF8] transition-colors"
                  >
                    <Settings className="h-4 w-4 text-[#A89880]" />
                    Settings
                  </a>
                  <button
                    onClick={() => {
                      localStorage.removeItem("provider_user");
                      window.location.href = "/login";
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#E24B4A] hover:bg-[#E24B4A]/5 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
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
