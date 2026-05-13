"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarCheck, Wallet, Users, Star, RefreshCw, Plus,
  Edit2, Eye, TrendingUp, ArrowUpRight, Bus, Route,
} from "lucide-react";
import { Header } from "@/components/header";
import { formatCurrency } from "@tankua/ui";
import {
  getProviderStats, getUpcomingTrips, getRecentBookings, getRecentReviews,
  type ProviderStats, type UpcomingTrip, type RecentBooking, type RecentReview,
} from "@/lib/queries";

// ─── Reusable micro-components ────────────────────────────

function FoldCorner() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none"
      className="absolute top-0 right-0 pointer-events-none" aria-hidden="true">
      <path d="M0 0 L22 0 L22 22 Z" fill="#C47F00" opacity="0.80" />
    </svg>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    live:          "bg-[#E1F5EE] text-[#0F6E56]",
    confirmed:     "bg-[#E1F5EE] text-[#0F6E56]",
    upcoming:      "bg-[#E1F5EE] text-[#0F6E56]",
    seasonal:      "bg-[#E6F1FB] text-[#185FA5]",
    pending:       "bg-[#FAEEDA] text-[#854F0B]",
    "under review":"bg-[#FAEEDA] text-[#854F0B]",
    draft:         "bg-[#F1EFE8] text-[#5F5E5A]",
    cancelled:     "bg-[#FAECE7] text-[#993C1D]",
  };
  const cls = map[status?.toLowerCase()] || "bg-[#F1EFE8] text-[#5F5E5A]";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${cls}`}>
      {status}
    </span>
  );
}

function CountUp({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return <>{val.toLocaleString()}</>;
}

// ─── KPI Card ─────────────────────────────────────────────
function KpiCard({
  title, value, numericValue, change, icon: Icon, iconBg, iconColor, fold = false,
}: {
  title: string; value: string; numericValue: number; change?: number;
  icon: React.ElementType; iconBg: string; iconColor: string; fold?: boolean;
}) {
  const positive = (change ?? 0) >= 0;
  return (
    <div className="relative bg-brand-cream border border-[rgba(245,168,0,0.15)] rounded-[14px] p-4 overflow-hidden">
      {fold && <FoldCorner />}
      <div className="flex items-start justify-between mb-3">
        <div className={`w-[30px] h-[30px] rounded-[8px] flex items-center justify-center ${iconBg}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        {change !== undefined && (
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${positive ? "bg-[#E1F5EE] text-[#0F6E56]" : "bg-[#FAECE7] text-[#993C1D]"}`}>
            <ArrowUpRight className={`h-3 w-3 ${!positive ? "rotate-180" : ""}`} />
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="font-syne font-bold text-[22px] text-brand-ink leading-none mb-1">
        {numericValue > 0 ? <CountUp target={numericValue} /> : value}
      </p>
      <p className="font-dm text-[12px] text-brand-muted">{title}</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [stats, setStats] = useState<ProviderStats | null>(null);
  const [upcomingTrips, setUpcomingTrips] = useState<UpcomingTrip[]>([]);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([]);

  useEffect(() => { loadProviderSession(); }, [router]);

  const loadProviderSession = () => {
    try {
      const stored = localStorage.getItem("provider_user");
      if (!stored) { router.replace("/login"); return; }
      const parsed = JSON.parse(stored);
      const id = parsed?.provider_id || parsed?.provider?.id;
      if (!id) { router.replace("/login"); return; }
      setProviderId(id);
      loadDashboardData(id);
    } catch { router.replace("/login"); }
  };

  const loadDashboardData = async (id: string) => {
    setLoading(true);
    try {
      const [s, trips, bookings, reviews] = await Promise.all([
        getProviderStats(id), getUpcomingTrips(id, 5),
        getRecentBookings(id, 5), getRecentReviews(id, 3),
      ]);
      setStats(s); setUpcomingTrips(trips);
      setRecentBookings(bookings); setRecentReviews(reviews);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-sand">
        <Header title="Dashboard" subtitle="Loading…" />
        <div className="flex items-center justify-center h-64 gap-3 text-brand-muted">
          <RefreshCw className="h-5 w-5 animate-spin text-brand-gold" />
          <span className="font-dm text-[14px]">Loading dashboard…</span>
        </div>
      </div>
    );
  }

  const kpis = [
    { title: "Revenue this month", value: formatCurrency(stats?.monthlyEarnings || 0), numericValue: stats?.monthlyEarnings || 0, change: stats?.earningsChange, icon: Wallet, iconBg: "bg-[#FAEEDA]", iconColor: "text-[#854F0B]", fold: true },
    { title: "Bookings this month", value: String(stats?.todayBookings || 0), numericValue: stats?.todayBookings || 0, change: stats?.bookingsChange, icon: CalendarCheck, iconBg: "bg-[#E6F1FB]", iconColor: "text-[#185FA5]" },
    { title: "Avg rating", value: (stats?.averageRating || 0).toFixed(1) + " / 5", numericValue: 0, icon: Star, iconBg: "bg-[#EAF3DE]", iconColor: "text-[#3B6D11]" },
  ];

  return (
    <div className="min-h-screen bg-brand-sand">
      <Header
        title="Dashboard"
        subtitle="Welcome back"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => providerId && loadDashboardData(providerId)}
              className="inline-flex items-center gap-1.5 h-[34px] px-3 rounded-[8px] border border-[rgba(245,168,0,0.25)] text-brand-muted font-dm text-[12px] hover:bg-brand-sand transition-colors">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
            <Link href="/dashboard/trips/new">
              <button className="inline-flex items-center gap-1.5 h-[34px] px-3 rounded-[8px] bg-brand-gold text-brand-ink font-dm font-medium text-[12px] hover:bg-brand-gold-light transition-colors shadow-btn">
                <Plus className="h-3.5 w-3.5" /> New trip
              </button>
            </Link>
          </div>
        }
      />

      <div className="p-5 pb-24 lg:pb-6 space-y-5">

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {kpis.map((k, i) => <KpiCard key={i} {...k} />)}
        </div>

        {/* ── Tour listings table ── */}
        <div className="bg-white border border-[rgba(245,168,0,0.15)] rounded-[14px] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[rgba(245,168,0,0.12)]">
            <div>
              <h2 className="font-syne font-bold text-[14px] text-brand-ink">Active tours</h2>
              <p className="font-dm text-[12px] text-brand-muted mt-0.5">{upcomingTrips.length} upcoming trips</p>
            </div>
            <Link href="/dashboard/trips/new">
              <button className="inline-flex items-center gap-1.5 h-[34px] px-3.5 rounded-[8px] border-[1.5px] border-brand-gold text-brand-gold font-dm font-medium text-[12px] hover:bg-[rgba(245,168,0,0.06)] transition-colors">
                <Plus className="h-3.5 w-3.5" /> Add new tour
              </button>
            </Link>
          </div>

          {upcomingTrips.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-14 h-14 rounded-full bg-[rgba(245,168,0,0.08)] flex items-center justify-center">
                <Route className="h-6 w-6 text-brand-gold" />
              </div>
              <p className="font-syne font-bold text-[14px] text-brand-ink">No trips yet</p>
              <p className="font-dm text-[13px] text-brand-muted">Create your first tour to get started</p>
              <Link href="/dashboard/trips/new">
                <button className="mt-1 h-[38px] px-5 rounded-[10px] bg-brand-gold text-brand-ink font-dm font-medium text-[13px]">
                  Create trip
                </button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(245,168,0,0.08)]">
                    {["Tour", "Price", "Bookings", "Status", ""].map((h) => (
                      <th key={h} className="text-left px-5 py-2.5 font-dm font-medium text-[10px] uppercase tracking-[0.08em] text-brand-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {upcomingTrips.map((trip) => (
                    <tr key={trip.id} className="border-b border-[rgba(245,168,0,0.06)] last:border-0 hover:bg-[rgba(245,168,0,0.02)] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-[34px] h-[34px] rounded-[8px] bg-brand-dark flex items-center justify-center shrink-0 overflow-hidden">
                            <Bus className="h-4 w-4 text-brand-gold" />
                          </div>
                          <div>
                            <p className="font-syne font-bold text-[13px] text-brand-ink">{trip.destination}</p>
                            <p className="font-dm text-[11px] text-brand-muted">{trip.date}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-[13px] text-brand-ink">{formatCurrency(0)}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-dm text-[13px] text-brand-ink">{trip.passengers}/{trip.capacity}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={trip.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 text-brand-muted hover:text-brand-gold transition-colors" aria-label="Edit">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button className="p-1.5 text-brand-muted hover:text-brand-gold transition-colors" aria-label="View">
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Bottom grid: Bookings + Reviews ── */}
        <div className="grid lg:grid-cols-2 gap-5">

          {/* Recent Bookings */}
          <div className="bg-white border border-[rgba(245,168,0,0.15)] rounded-[14px] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[rgba(245,168,0,0.12)]">
              <h2 className="font-syne font-bold text-[14px] text-brand-ink">Upcoming bookings</h2>
              <Link href="/dashboard/bookings">
                <button className="font-dm text-[12px] text-brand-muted hover:text-brand-ink transition-colors">View all →</button>
              </Link>
            </div>
            {recentBookings.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-brand-muted">
                <CalendarCheck className="h-6 w-6 mr-2 text-brand-gold opacity-50" />
                <span className="font-dm text-[13px]">No bookings yet</span>
              </div>
            ) : (
              <div className="divide-y divide-[rgba(245,168,0,0.06)]">
                {recentBookings.map((b) => (
                  <div key={b.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[rgba(245,168,0,0.02)] transition-colors">
                    <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center text-brand-ink font-bold text-[12px] shrink-0">
                      {(b.customer || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-dm font-medium text-[13px] text-brand-ink truncate">{b.customer}</p>
                      <p className="font-dm text-[11px] text-brand-muted truncate">{b.destination} · {b.seats} seats</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-[12px] text-brand-ink">{formatCurrency(b.amount)}</p>
                      <StatusBadge status={b.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Reviews */}
          <div className="bg-white border border-[rgba(245,168,0,0.15)] rounded-[14px] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[rgba(245,168,0,0.12)]">
              <h2 className="font-syne font-bold text-[14px] text-brand-ink">Recent reviews</h2>
              <Link href="/dashboard/reviews">
                <button className="font-dm text-[12px] text-brand-muted hover:text-brand-ink transition-colors">View all →</button>
              </Link>
            </div>
            {recentReviews.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-brand-muted">
                <Star className="h-6 w-6 mr-2 text-brand-gold opacity-50" />
                <span className="font-dm text-[13px]">No reviews yet</span>
              </div>
            ) : (
              <div className="divide-y divide-[rgba(245,168,0,0.06)]">
                {recentReviews.map((r, i) => (
                  <div key={i} className="px-5 py-3.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="font-dm font-medium text-[13px] text-brand-ink">{r.customer}</p>
                      <div className="flex">
                        {Array.from({ length: r.rating }).map((_, j) => (
                          <Star key={j} className="h-3.5 w-3.5 fill-brand-gold text-brand-gold" />
                        ))}
                      </div>
                    </div>
                    <p className="font-dm text-[12px] text-brand-muted italic">"{r.comment}"</p>
                    <p className="font-dm text-[11px] text-brand-muted/60 mt-1">{r.trip} · {r.date}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Quick actions ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Create Trip", sub: "Schedule a new tour", href: "/dashboard/trips/new", icon: Plus, bg: "bg-[rgba(245,168,0,0.08)]", ic: "text-brand-gold" },
            { label: "Add Driver", sub: "Expand your team", href: "/dashboard/drivers/new", icon: Users, bg: "bg-[rgba(29,158,117,0.08)]", ic: "text-success" },
            { label: "Add Vehicle", sub: "Register vehicle", href: "/dashboard/vehicles/new", icon: Bus, bg: "bg-[rgba(58,143,212,0.08)]", ic: "text-info" },
            { label: "View Earnings", sub: "Track revenue", href: "/dashboard/earnings", icon: TrendingUp, bg: "bg-[rgba(245,168,0,0.08)]", ic: "text-brand-gold" },
          ].map((a) => (
            <Link key={a.href} href={a.href}>
              <div className="p-5 rounded-[14px] border-2 border-dashed border-[rgba(245,168,0,0.2)] hover:border-brand-gold hover:bg-[rgba(245,168,0,0.03)] transition-all text-left group cursor-pointer">
                <div className={`w-10 h-10 rounded-[10px] ${a.bg} flex items-center justify-center mb-3`}>
                  <a.icon className={`h-5 w-5 ${a.ic}`} />
                </div>
                <p className="font-syne font-bold text-[13px] text-brand-ink">{a.label}</p>
                <p className="font-dm text-[11px] text-brand-muted mt-0.5">{a.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
