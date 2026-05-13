"use client";

import { useState, useEffect, useRef } from "react";
import {
  Users, CalendarCheck, CreditCard, Building2,
  TrendingUp, AlertCircle, RefreshCw, ArrowUpRight,
  CheckCircle2, XCircle, Filter, MapPin,
} from "lucide-react";
import { Header } from "@/components/header";
import { formatCurrency } from "@tankua/ui";
import {
  getDashboardStats, getRecentBookings, getTopProviders,
  getTopChurches, getBookingTrends, getRevenueAnalytics,
  type DashboardStats, type RecentBooking, type TopProvider, type TopChurch,
} from "@/lib/queries";

// ─── CountUp ─────────────────────────────────────────────
function CountUp({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current || target === 0) return;
    started.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return <>{val.toLocaleString()}</>;
}

// ─── FoldCorner ───────────────────────────────────────────
function FoldCorner() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none"
      className="absolute top-0 right-0 pointer-events-none" aria-hidden="true">
      <path d="M0 0 L22 0 L22 22 Z" fill="#C47F00" opacity="0.80" />
    </svg>
  );
}

// ─── StatusBadge ─────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: "bg-[#E1F5EE] text-[#0F6E56]",
    pending:   "bg-[#FAEEDA] text-[#854F0B]",
    cancelled: "bg-[#FAECE7] text-[#993C1D]",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${map[status] || "bg-[#F1EFE8] text-[#5F5E5A]"}`}>
      {status}
    </span>
  );
}

// ─── KPI Card ─────────────────────────────────────────────
function KpiCard({
  title, value, numericValue, change, icon: Icon, iconBg, iconColor,
  alert = false, fold = false,
}: {
  title: string; value: string; numericValue: number; change?: number;
  icon: React.ElementType; iconBg: string; iconColor: string;
  alert?: boolean; fold?: boolean;
}) {
  const positive = (change ?? 0) >= 0;
  return (
    <div className="relative bg-brand-cream border border-[rgba(245,168,0,0.15)] rounded-[14px] p-4 overflow-hidden">
      {fold && <FoldCorner />}
      <div className="flex items-start justify-between mb-3">
        <div className={`relative w-[30px] h-[30px] rounded-[8px] flex items-center justify-center ${iconBg}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
          {alert && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-danger rounded-full animate-pulse" />}
        </div>
        {change !== undefined && (
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${positive ? "bg-[#E1F5EE] text-[#0F6E56]" : "bg-[#FAECE7] text-[#993C1D]"}`}>
            <ArrowUpRight className={`h-3 w-3 ${!positive ? "rotate-180" : ""}`} />
            {Math.abs(change ?? 0)}%
          </span>
        )}
      </div>
      <p className="font-syne font-bold text-[22px] text-brand-ink leading-none mb-1">
        {numericValue > 0 ? <CountUp target={numericValue} /> : value}
      </p>
      <p className="font-dm text-[12px] text-brand-muted">{title}</p>
      {alert && (
        <p className="font-dm text-[11px] text-danger mt-1 font-medium">Needs attention</p>
      )}
    </div>
  );
}

// ─── Region bar ───────────────────────────────────────────
const regionColors: Record<string, string> = {
  Amhara: "#F5A800", Oromia: "#639922",
  Afar: "#D85A30", SNNPR: "#3A8FD4", Tigray: "#7F77DD",
};

function RegionBar({ label, value, max, color, delay = 0 }: {
  label: string; value: number; max: number; color: string; delay?: number;
}) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => setWidth((value / max) * 100), delay * 1000);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value, max, delay]);

  return (
    <div ref={ref} className="flex items-center gap-3">
      <span className="font-dm text-[12px] text-brand-muted w-20 shrink-0">{label}</span>
      <div className="flex-1 h-[5px] rounded-full" style={{ background: "rgba(245,168,0,0.10)" }}>
        <div className="h-full rounded-full transition-all duration-[800ms] ease-out" style={{ width: `${width}%`, background: color }} />
      </div>
      <span className="font-dm font-medium text-[12px] text-brand-ink w-8 text-right shrink-0">{value}</span>
    </div>
  );
}

// ─── Activity dot ─────────────────────────────────────────
const activityColors: Record<string, string> = {
  submitted: "#F5A800", booking: "#1D9E75", approved: "#1D9E75",
  payout: "#3A8FD4", flagged: "#E24B4A",
};

// ─── Main ─────────────────────────────────────────────────
export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [topProviders, setTopProviders] = useState<TopProvider[]>([]);
  const [topChurches, setTopChurches] = useState<TopChurch[]>([]);
  const [bookingTrends, setBookingTrends] = useState<Array<{ date: string; bookings: number; revenue: number }>>([]);
  const [revenueAnalytics, setRevenueAnalytics] = useState<{
    totalRevenue: number; monthlyRevenue: number;
    averageBookingValue: number; revenueByStatus: Array<{ status: string; revenue: number }>;
  } | null>(null);

  useEffect(() => { loadDashboardData(); }, [timeRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [s, bookings, providers, churches, trends, revenue] = await Promise.all([
        getDashboardStats(), getRecentBookings(5), getTopProviders(5),
        getTopChurches(5), getBookingTrends(30), getRevenueAnalytics(),
      ]);
      setStats(s); setRecentBookings(bookings); setTopProviders(providers);
      setTopChurches(churches); setBookingTrends(trends); setRevenueAnalytics(revenue);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  // Static activity feed
  const activityFeed = [
    { type: "submitted", text: <><b className="text-brand-ink font-medium">Lalibela Guides Co.</b> submitted a new tour</>, time: "3m ago" },
    { type: "booking",   text: <><b className="text-brand-ink font-medium">Booking #5021</b> confirmed — Simien Trek</>, time: "11m ago" },
    { type: "approved",  text: <><b className="text-brand-ink font-medium">Rift Valley Tours</b> provider approved</>, time: "28m ago" },
    { type: "payout",    text: <>Payout of <b className="text-brand-ink font-medium">ETB 34,000</b> processed to Awash Guides</>, time: "1h ago" },
    { type: "flagged",   text: <><b className="text-brand-ink font-medium">Report #88</b> flagged — inappropriate content</>, time: "2h ago" },
  ];

  // Region data (demo)
  const regionData = [
    { label: "Amhara", value: 142 }, { label: "Oromia", value: 98 },
    { label: "Afar", value: 61 }, { label: "SNNPR", value: 54 }, { label: "Tigray", value: 37 },
  ];
  const maxRegion = Math.max(...regionData.map((r) => r.value));

  // Pending approvals (from churches as proxy)
  const pendingApprovals = topChurches.slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-sand">
        <Header title="Admin Dashboard" />
        <div className="flex items-center justify-center h-64 gap-3 text-brand-muted">
          <RefreshCw className="h-5 w-5 animate-spin text-brand-gold" />
          <span className="font-dm text-[14px]">Loading dashboard…</span>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: "Platform GMV",
      value: formatCurrency(stats?.totalRevenue || 0),
      numericValue: stats?.totalRevenue || 0,
      change: 0, icon: TrendingUp, iconBg: "bg-[#FAEEDA]", iconColor: "text-[#854F0B]", fold: true,
    },
    {
      title: "Active providers",
      value: String(stats?.totalProviders || 0),
      numericValue: stats?.totalProviders || 0,
      change: stats?.providersChange, icon: Building2, iconBg: "bg-[#E6F1FB]", iconColor: "text-[#185FA5]",
    },
    {
      title: "Total bookings",
      value: String(stats?.totalBookings || 0),
      numericValue: stats?.totalBookings || 0,
      change: stats?.bookingsChange, icon: CalendarCheck, iconBg: "bg-[#EAF3DE]", iconColor: "text-[#3B6D11]",
    },
    {
      title: "Pending approvals",
      value: String(pendingApprovals.length),
      numericValue: 0,
      icon: AlertCircle, iconBg: "bg-[#FAECE7]", iconColor: "text-[#993C1D]",
      alert: pendingApprovals.length > 0,
    },
  ];

  const avatarColors = ["#F5A800", "#1D9E75", "#3A8FD4", "#7F77DD", "#D85A30"];

  return (
    <div className="min-h-screen bg-brand-sand">
      <Header
        title="Admin Dashboard"
        subtitle={`Last updated ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`}
        actions={
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex gap-1">
              {["7d", "30d", "90d"].map((r) => (
                <button key={r} onClick={() => setTimeRange(r)}
                  className={`h-[30px] px-3 rounded-[6px] font-dm text-[12px] font-medium transition-all ${
                    timeRange === r ? "bg-brand-gold text-brand-ink" : "text-brand-muted hover:text-brand-ink"
                  }`}>{r}</button>
              ))}
            </div>
            <button onClick={loadDashboardData}
              className="inline-flex items-center gap-1.5 h-[34px] px-3 rounded-[8px] border border-[rgba(245,168,0,0.25)] text-brand-muted font-dm text-[12px] hover:bg-brand-sand transition-colors">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
          </div>
        }
      />

      <div className="p-5 space-y-5">

        {/* ── KPI Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k, i) => <KpiCard key={i} {...k} />)}
        </div>

        {/* ── Two-column row ── */}
        <div className="grid lg:grid-cols-2 gap-5">

          {/* Top providers */}
          <div className="bg-white border border-[rgba(245,168,0,0.15)] rounded-[14px] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[rgba(245,168,0,0.12)]">
              <h2 className="font-syne font-bold text-[14px] text-brand-ink">Top providers</h2>
              <button className="font-dm text-[12px] text-brand-muted hover:text-brand-ink transition-colors">View all →</button>
            </div>
            {topProviders.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Building2 className="h-6 w-6 text-brand-gold opacity-40 mr-2" />
                <span className="font-dm text-[13px] text-brand-muted">No providers yet</span>
              </div>
            ) : (
              <div className="divide-y divide-[rgba(245,168,0,0.06)]">
                {topProviders.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-[rgba(245,168,0,0.02)] transition-colors">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-dm font-medium text-[12px] text-white shrink-0"
                      style={{ background: avatarColors[i % avatarColors.length] }}>
                      {(p.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-dm font-medium text-[13px] text-brand-ink truncate">{p.name}</p>
                      <p className="font-dm text-[11px] text-brand-muted">{p.bookings} trips · ★ {p.rating?.toFixed(1)}</p>
                    </div>
                    <span className="font-mono text-[13px] text-brand-ink shrink-0">{formatCurrency(p.revenue)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bookings by region */}
          <div className="bg-white border border-[rgba(245,168,0,0.15)] rounded-[14px] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[rgba(245,168,0,0.12)]">
              <h2 className="font-syne font-bold text-[14px] text-brand-ink">Bookings by region</h2>
            </div>
            <div className="px-5 py-4 space-y-4">
              {regionData.map((r, i) => (
                <RegionBar key={r.label} label={r.label} value={r.value} max={maxRegion}
                  color={regionColors[r.label] || "#F5A800"} delay={i * 0.1} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Full-width row: Activity + Recent bookings ── */}
        <div className="grid lg:grid-cols-2 gap-5">

          {/* Activity feed */}
          <div className="bg-white border border-[rgba(245,168,0,0.15)] rounded-[14px] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[rgba(245,168,0,0.12)]">
              <h2 className="font-syne font-bold text-[14px] text-brand-ink">Recent activity</h2>
              <span className="font-dm text-[11px] text-brand-muted">Live</span>
            </div>
            <div className="divide-y divide-[rgba(245,168,0,0.06)]">
              {activityFeed.map((a, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-[rgba(245,168,0,0.02)] transition-colors">
                  <div className="w-2 h-2 rounded-full mt-[5px] shrink-0"
                    style={{ background: activityColors[a.type] || "#F5A800" }} />
                  <p className="flex-1 font-dm text-[12px] text-brand-muted leading-relaxed">{a.text}</p>
                  <span className="font-dm text-[11px] text-brand-muted/60 shrink-0 whitespace-nowrap">{a.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent bookings */}
          <div className="bg-white border border-[rgba(245,168,0,0.15)] rounded-[14px] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[rgba(245,168,0,0.12)]">
              <h2 className="font-syne font-bold text-[14px] text-brand-ink">Recent bookings</h2>
              <button className="font-dm text-[12px] text-brand-muted hover:text-brand-ink transition-colors">View all →</button>
            </div>
            {recentBookings.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <CalendarCheck className="h-6 w-6 text-brand-gold opacity-40 mr-2" />
                <span className="font-dm text-[13px] text-brand-muted">No bookings yet</span>
              </div>
            ) : (
              <div className="divide-y divide-[rgba(245,168,0,0.06)] overflow-x-auto">
                <table className="w-full min-w-[440px]">
                  <thead>
                    <tr>
                      {["Traveler", "Destination", "Amount", "Status"].map((h) => (
                        <th key={h} className="text-left px-5 py-2.5 font-dm font-medium text-[10px] uppercase tracking-[0.08em] text-brand-muted">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((b) => (
                      <tr key={b.id} className="border-t border-[rgba(245,168,0,0.06)] hover:bg-[rgba(245,168,0,0.02)] transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-brand-gold flex items-center justify-center text-brand-ink font-bold text-[10px] shrink-0">
                              {(b.user?.name || "?").charAt(0)}
                            </div>
                            <span className="font-dm text-[13px] text-brand-ink truncate max-w-[90px]">{b.user?.name || "—"}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="font-dm text-[12px] text-brand-muted truncate max-w-[100px] block">{b.church}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="font-mono text-[12px] text-brand-ink">{formatCurrency(b.amount)}</span>
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge status={b.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── Pending approvals ── */}
        <div className="bg-white border border-[rgba(245,168,0,0.15)] rounded-[14px] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[rgba(245,168,0,0.12)]">
            <div className="flex items-center gap-2">
              <h2 className="font-syne font-bold text-[14px] text-brand-ink">Pending approvals</h2>
              {pendingApprovals.length > 0 && (
                <span className="font-mono text-[11px] bg-[rgba(226,75,74,0.1)] text-danger px-2 py-0.5 rounded-full font-medium">
                  {pendingApprovals.length}
                </span>
              )}
            </div>
            <button className="font-dm text-[12px] text-brand-muted hover:text-brand-ink transition-colors">View all →</button>
          </div>

          {pendingApprovals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <div className="w-14 h-14 rounded-full bg-[rgba(245,168,0,0.08)] flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-brand-gold" />
              </div>
              <p className="font-syne font-bold text-[15px] text-brand-ink">All clear</p>
              <p className="font-dm text-[13px] text-brand-muted">No pending approvals</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px]">
                <thead>
                  <tr>
                    {["Tour name", "Provider", "Submitted", "Category", ""].map((h) => (
                      <th key={h} className="text-left px-5 py-2.5 font-dm font-medium text-[10px] uppercase tracking-[0.08em] text-brand-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pendingApprovals.map((item, i) => (
                    <tr key={i} className="border-t border-[rgba(245,168,0,0.06)] hover:bg-[rgba(245,168,0,0.02)] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-brand-gold shrink-0" />
                          <span className="font-syne font-bold text-[13px] text-brand-ink">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-dm text-[12px] text-brand-muted">{item.region}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-dm text-[12px] text-brand-muted">Today</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FAEEDA] text-[#854F0B]">Cultural</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button className="h-[30px] px-3 rounded-[6px] bg-brand-gold text-brand-ink font-dm font-medium text-[12px] hover:bg-brand-gold-light transition-colors">
                            Approve
                          </button>
                          <button className="h-[30px] px-3 rounded-[6px] bg-[rgba(226,75,74,0.08)] text-danger font-dm font-medium text-[12px] hover:bg-[rgba(226,75,74,0.15)] transition-colors">
                            Reject
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

        {/* ── Revenue analytics ── */}
        {revenueAnalytics && (
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: "Total revenue", value: formatCurrency(revenueAnalytics.totalRevenue), sub: "All time" },
              { label: "This month", value: formatCurrency(revenueAnalytics.monthlyRevenue), sub: "vs last month", gold: true },
              { label: "Avg booking value", value: formatCurrency(revenueAnalytics.averageBookingValue), sub: "Per transaction" },
            ].map((card, i) => (
              <div key={i} className={`rounded-[14px] p-4 border ${card.gold ? "border-brand-gold bg-[rgba(245,168,0,0.06)]" : "border-[rgba(245,168,0,0.15)] bg-brand-cream"}`}>
                <p className="font-dm text-[12px] text-brand-muted mb-1">{card.label}</p>
                <p className={`font-mono font-medium text-[20px] ${card.gold ? "text-brand-gold-dark" : "text-brand-ink"}`}>{card.value}</p>
                <p className="font-dm text-[11px] text-brand-muted/70 mt-1">{card.sub}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
