"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getFeaturedTours } from "@/lib/queries";
import {
  MapPin,
  Calendar,
  Shield,
  Smartphone,
  Star,
  ChevronRight,
  Users,
  Clock,
  CreditCard,
  Menu,
  X,
  ArrowRight,
  CheckCircle2,
  Leaf,
  Mountain,
  Camera,
  Search,
  Globe,
} from "lucide-react";
import { Button, Card, Badge } from "@tankua/ui";

// ── Types ────────────────────────────────────────────────────────────────────

type TourItem = {
  id: string | number;
  name: string;
  location: string;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  price: number;
  duration?: string;
  groupSize?: string;
  tagColor?: string;
  description?: string;
};

// ── Static data ─────────────────────────────────────────────────────────────

const destinations = [
  {
    id: 1,
    name: "Lalibela",
    region: "Amhara",
    tours: 38,
    from: "1,200",
    tag: "Cultural",
    tagColor: "bg-[#FAEEDA] text-[#854F0B]",
    color: "#EF9F27",
  },
  {
    id: 2,
    name: "Simien Mountains",
    region: "Gondar",
    tours: 22,
    from: "2,500",
    tag: "Trekking",
    tagColor: "bg-[#EAF3DE] text-[#3B6D11]",
    color: "#1D9E75",
  },
  {
    id: 3,
    name: "Danakil Depression",
    region: "Afar",
    tours: 14,
    from: "3,200",
    tag: "Adventure",
    tagColor: "bg-[#FAECE7] text-[#993C1D]",
    color: "#E24B4A",
  },
  {
    id: 4,
    name: "Omo Valley",
    region: "SNNPR",
    tours: 19,
    from: "1,800",
    tag: "Cultural",
    tagColor: "bg-[#FAEEDA] text-[#854F0B]",
    color: "#EF9F27",
  },
  {
    id: 5,
    name: "Bale Mountains",
    region: "Oromia",
    tours: 17,
    from: "1,500",
    tag: "Safari",
    tagColor: "bg-[#E6F1FB] text-[#185FA5]",
    color: "#185FA5",
  },
  {
    id: 6,
    name: "Harar Jugol",
    region: "Harari",
    tours: 25,
    from: "900",
    tag: "Cultural",
    tagColor: "bg-[#FAEEDA] text-[#854F0B]",
    color: "#EF9F27",
  },
];

const whyUs = [
  {
    icon: <Users className="h-5 w-5" />,
    title: "Local-Born Guides",
    description: "Every guide is from the region they lead — fluent in culture, language, and terrain.",
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: "Verified Listings",
    description: "All providers are vetted and reviewed by our team before going live.",
  },
  {
    icon: <CreditCard className="h-5 w-5" />,
    title: "ETB & USD Pricing",
    description: "Pay in Ethiopian Birr or USD. Accept Chapa, Telebirr, and card.",
  },
  {
    icon: <Smartphone className="h-5 w-5" />,
    title: "24/7 Amharic Support",
    description: "Our support team speaks Amharic, Oromiffa, and English — available all day.",
  },
];

const featuredToursStatic: TourItem[] = [
  {
    id: 1,
    name: "Lalibela Rock-Hewn Churches Tour",
    location: "Lalibela, Amhara",
    category: "Cultural",
    image: "/images/eth-photo-3.jpg",
    rating: 4.9,
    reviews: 2847,
    price: 1500,
    duration: "2 days",
    groupSize: "Max 12",
    tagColor: "bg-[#FAEEDA] text-[#854F0B]",
  },
  {
    id: 2,
    name: "Simien Mountains Trekking Adventure",
    location: "Gondar, Amhara",
    category: "Trekking",
    image: "/images/eth-photo-5.jpg",
    rating: 4.8,
    reviews: 1893,
    price: 2500,
    duration: "5 days",
    groupSize: "Max 8",
    tagColor: "bg-[#EAF3DE] text-[#3B6D11]",
  },
  {
    id: 3,
    name: "Lake Tana & Blue Nile Falls",
    location: "Bahir Dar",
    category: "Adventure",
    image: "/images/eth-photo-2.jpg",
    rating: 4.7,
    reviews: 1856,
    price: 1200,
    duration: "1 day",
    groupSize: "Max 15",
    tagColor: "bg-[#FAECE7] text-[#993C1D]",
  },
  {
    id: 4,
    name: "Danakil Depression Expedition",
    location: "Afar Region",
    category: "Adventure",
    image: "/images/eth-photo-4.jpg",
    rating: 4.9,
    reviews: 1245,
    price: 3500,
    duration: "3 days",
    groupSize: "Max 10",
    tagColor: "bg-[#FAECE7] text-[#993C1D]",
  },
];

const testimonials = [
  {
    name: "Yohannes T.",
    role: "Traveler from Addis Ababa",
    content: "Tankua made my trip to Lalibela absolutely seamless. The booking was easy, and the local guide was extraordinary.",
    initial: "Y",
    rating: 5,
  },
  {
    name: "Sara M.",
    role: "Tourist from Germany",
    content: "As a foreigner, I was worried about booking tours in Ethiopia. Tankua gave me complete peace of mind with verified providers and clear ETB/USD prices.",
    initial: "S",
    rating: 5,
  },
  {
    name: "Abebe K.",
    role: "Regular Traveler",
    content: "I've used Tankua for 5 trips — from Simien Mountains to Omo Valley. The QR tickets and Telebirr payment are game changers.",
    initial: "A",
    rating: 5,
  },
];

const stats = [
  { value: "250+", label: "Destinations" },
  { value: "50+", label: "Providers" },
  { value: "15K+", label: "Travelers" },
  { value: "4.9★", label: "Avg Rating" },
];

const navLinks = [
  { label: "Explore Tours", href: "/tours" },
  { label: "Destinations", href: "/destinations" },
  { label: "For Providers", href: "/provider-portal" },
  { label: "About", href: "/about" },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tours, setTours] = useState<TourItem[]>(featuredToursStatic);
  const [loading, setLoading] = useState(true);
  const [langLabel, setLangLabel] = useState<"EN" | "አማ">("EN");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function loadTours() {
      try {
        const data = await getFeaturedTours(4);
        if (data.length > 0) setTours(data);
      } catch {
        // keep static fallback
      } finally {
        setLoading(false);
      }
    }
    loadTours();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAF8]" style={{ fontFamily: "var(--font-jakarta, system-ui)" }}>

      {/* ── NAVBAR ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-lg shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-b border-black/[0.06]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-[#EF9F27] flex items-center justify-center shadow-sm">
                <span className="text-[#1C0A00] font-bold text-lg leading-none">T</span>
              </div>
              <span
                className={`text-xl font-bold transition-colors duration-300 ${isScrolled ? "text-[#1A1208]" : "text-white"}`}
                style={{ fontFamily: "var(--font-playfair, Georgia)" }}
              >
                Tankua
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-7">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`text-sm font-medium transition-colors duration-300 ${
                    isScrolled
                      ? "text-[#6B5E4E] hover:text-[#1A1208]"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Right actions */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setLangLabel((p) => (p === "EN" ? "አማ" : "EN"))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                  isScrolled
                    ? "text-[#6B5E4E] hover:bg-[#FAFAF8] border border-black/[0.08]"
                    : "text-white/70 hover:text-white border border-white/20"
                }`}
                aria-label="Switch language"
              >
                <Globe className="h-3.5 w-3.5" />
                {langLabel}
              </button>
              <Link href="/login">
                <button
                  className={`text-sm font-medium transition-colors duration-300 px-3 py-1.5 ${
                    isScrolled ? "text-[#1A1208] hover:text-[#EF9F27]" : "text-white/85 hover:text-white"
                  }`}
                >
                  Sign In
                </button>
              </Link>
              <Link href="/download">
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EF9F27] text-[#412402] text-sm font-medium hover:brightness-105 active:scale-[0.98] transition-all shadow-sm">
                  Download App
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              className={`md:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors duration-300 ${
                isScrolled ? "text-[#1A1208]" : "text-white"
              }`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-black/[0.06] shadow-lg">
            <div className="px-4 py-5 space-y-1">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 px-3 rounded-xl text-sm font-medium text-[#1A1208] hover:bg-[#FAFAF8] transition-colors"
                >
                  {l.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-black/[0.06] flex gap-3">
                <Link href="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full py-2.5 rounded-xl border border-black/[0.12] text-sm font-medium text-[#1A1208] hover:bg-[#FAFAF8] transition-colors">
                    Sign In
                  </button>
                </Link>
                <Link href="/download" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full py-2.5 rounded-xl bg-[#EF9F27] text-[#412402] text-sm font-medium hover:brightness-105 transition-all">
                    Download App
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">

        {/* ─ Full-bleed landscape photo ─ */}
        <div className="absolute inset-0">
          <Image
            src="/images/splash.jpg"
            alt="Ethiopian highland landscape — Simien Mountains"
            fill
            className="object-cover object-[center_30%]"
            priority
            quality={92}
            sizes="100vw"
          />

          {/* Layered atmospheric gradient — sky to earth, keeps photo visible at midpoint */}
          <div
            className="absolute inset-0"
            style={{
              background: [
                /* top vignette — dark enough for nav readability */
                "linear-gradient(180deg, rgba(8,18,8,0.60) 0%, rgba(8,18,8,0.20) 18%, transparent 38%)",
                /* center — fully transparent so the landscape breathes */
                /* bottom ramp — warm earth darkness for text */
                "linear-gradient(0deg, rgba(12,6,0,0.88) 0%, rgba(12,6,0,0.55) 22%, rgba(12,6,0,0.10) 45%, transparent 65%)",
              ].join(", "),
            }}
          />

          {/* Very subtle warm amber bloom at horizon center */}
          <div
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
            style={{
              bottom: "30%",
              width: "60vw",
              height: "30vh",
              background: "radial-gradient(ellipse at center, rgba(239,159,39,0.10) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
        </div>

        {/* ─ Content ─ */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-28 text-center flex flex-col items-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF9F27]" />
            <span className="text-xs font-medium text-white/90 tracking-wide">
              #1 Tour & Travel Platform in Ethiopia
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-[clamp(30px,5.5vw,66px)] font-semibold leading-[1.1] text-white mb-5 max-w-4xl drop-shadow-sm"
            style={{ fontFamily: "var(--font-playfair, Georgia)" }}
          >
            Discover Ethiopia's{" "}
            <span style={{ color: "#EF9F27" }}>Ancient Wonders</span>
            {" "}& Hidden Landscapes
          </h1>

          <p className="text-base sm:text-lg text-white/70 max-w-xl mx-auto mb-10 leading-relaxed drop-shadow-sm">
            Book unforgettable tours with local-born guides — from the rock churches of Lalibela
            to the alien landscape of Danakil Depression.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Link href="/tours">
              <button className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#EF9F27] text-[#412402] font-semibold text-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(239,159,39,0.40)]">
                Explore Tours
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <Link href="/download">
              <button className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white/12 backdrop-blur-sm border border-white/25 text-white text-sm font-medium hover:bg-white/20 active:scale-[0.98] transition-all">
                Download the App
                <ChevronRight className="h-4 w-4 text-white/60" />
              </button>
            </Link>
          </div>

          {/* Search bar */}
          <div className="w-full max-w-2xl">
            <div className="flex flex-col sm:flex-row bg-white/12 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden p-1 shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
              <div className="flex-1 flex items-center gap-3 px-4 py-3">
                <MapPin className="h-4 w-4 text-[#EF9F27] shrink-0" />
                <input
                  type="text"
                  placeholder="Destination (e.g. Lalibela, Simien...)"
                  className="bg-transparent text-sm text-white placeholder:text-white/45 outline-none w-full"
                />
              </div>
              <div className="hidden sm:block w-px bg-white/15 my-2" />
              <div className="flex-1 flex items-center gap-3 px-4 py-3">
                <Calendar className="h-4 w-4 text-[#EF9F27] shrink-0" />
                <input
                  type="text"
                  placeholder="Travel dates"
                  className="bg-transparent text-sm text-white placeholder:text-white/45 outline-none w-full"
                />
              </div>
              <div className="hidden sm:block w-px bg-white/15 my-2" />
              <div className="flex-1 flex items-center gap-3 px-4 py-3">
                <Users className="h-4 w-4 text-[#EF9F27] shrink-0" />
                <input
                  type="text"
                  placeholder="Travelers"
                  className="bg-transparent text-sm text-white placeholder:text-white/45 outline-none w-full"
                />
              </div>
              <button className="m-0.5 px-6 py-3 rounded-xl bg-[#EF9F27] text-[#412402] font-semibold text-sm hover:brightness-105 transition-all flex items-center gap-2 justify-center shrink-0">
                <Search className="h-4 w-4" />
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 sm:gap-14 mt-14 pt-10 border-t border-white/10">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div
                  className="text-2xl sm:text-3xl font-bold text-[#EF9F27] drop-shadow-sm"
                  style={{ fontFamily: "var(--font-playfair, Georgia)" }}
                >
                  {stat.value}
                </div>
                <div className="text-xs text-white/50 mt-1 tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Soft wave into next section */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 90" className="w-full h-auto fill-[#FAFAF8]" preserveAspectRatio="none">
            <path d="M0,50 C240,90 480,10 720,50 C960,90 1200,20 1440,50 L1440,90 L0,90 Z" opacity="0.9"/>
            <path d="M0,65 C360,30 1080,90 1440,60 L1440,90 L0,90 Z" opacity="0.6"/>
          </svg>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="py-16 bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyUs.map((item, i) => (
              <div
                key={i}
                className="flex gap-4 p-5 bg-white rounded-xl border border-black/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EF9F27]/12 flex items-center justify-center text-[#EF9F27] shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1A1208] mb-1">{item.title}</h3>
                  <p className="text-xs text-[#6B5E4E] leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DESTINATIONS GRID ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#EF9F27]/12 text-[#BA7517] border border-[#EF9F27]/20 mb-4">
              Ethiopia's Regions
            </span>
            <h2
              className="text-3xl sm:text-4xl font-semibold text-[#1A1208] mb-3"
              style={{ fontFamily: "var(--font-playfair, Georgia)" }}
            >
              Where Will You Explore?
            </h2>
            <p className="text-[#6B5E4E] max-w-xl mx-auto">
              From ancient highlands to volcanic terrain — each region of Ethiopia holds a world.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {destinations.map((dest) => (
              <Link key={dest.id} href={`/destinations/${dest.id}`}>
                <div className="group relative overflow-hidden rounded-2xl border border-black/[0.08] bg-white hover:border-[#EF9F27]/40 hover:shadow-[0_4px_20px_rgba(239,159,39,0.1)] transition-all duration-200 cursor-pointer">
                  {/* SVG Illustration placeholder */}
                  <div
                    className="h-44 flex items-center justify-center relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${dest.color}18 0%, ${dest.color}08 100%)` }}
                  >
                    {/* Tibeb diamond pattern */}
                    <svg
                      className="absolute inset-0 w-full h-full opacity-30"
                      viewBox="0 0 200 176"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <pattern id={`p-${dest.id}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M20 0L40 20L20 40L0 20Z" fill={dest.color} fillOpacity="0.15" />
                          <circle cx="20" cy="20" r="2" fill={dest.color} fillOpacity="0.3" />
                        </pattern>
                      </defs>
                      <rect width="200" height="176" fill={`url(#p-${dest.id})`} />
                    </svg>
                    {/* Destination name big */}
                    <div className="relative text-center">
                      <div
                        className="text-5xl font-bold opacity-15"
                        style={{ color: dest.color, fontFamily: "var(--font-playfair, Georgia)" }}
                      >
                        {dest.name.charAt(0)}
                      </div>
                      <MapPin
                        className="h-8 w-8 mx-auto mt-1"
                        style={{ color: dest.color }}
                      />
                    </div>
                    <span
                      className={`absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full ${dest.tagColor}`}
                    >
                      {dest.tag}
                    </span>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-[#1A1208] text-sm">{dest.name}</h3>
                        <p className="text-xs text-[#A89880] mt-0.5">{dest.region} Region</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[#A89880] group-hover:text-[#EF9F27] transition-colors mt-0.5 shrink-0" />
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/[0.06]">
                      <span className="text-xs text-[#6B5E4E]">
                        <strong className="text-[#1A1208]">{dest.tours}</strong> tours
                      </span>
                      <span className="text-xs text-[#6B5E4E]">
                        From <strong className="text-[#EF9F27]">{dest.from} ETB</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED TOURS ── */}
      <section className="py-20 bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12">
            <div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#EF9F27]/12 text-[#BA7517] border border-[#EF9F27]/20 mb-4">
                Popular Tours
              </span>
              <h2
                className="text-3xl sm:text-4xl font-semibold text-[#1A1208]"
                style={{ fontFamily: "var(--font-playfair, Georgia)" }}
              >
                Featured Experiences
              </h2>
            </div>
            <Link href="/tours">
              <button className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-black/[0.12] text-sm font-medium text-[#1A1208] hover:bg-white hover:border-[#EF9F27]/30 transition-colors">
                View All Tours
                <ChevronRight className="h-4 w-4 text-[#A89880]" />
              </button>
            </Link>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-black/[0.04] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {tours.map((tour) => {
                const tagColor = (tour as any).tagColor || "bg-[#FAEEDA] text-[#854F0B]";
                return (
                  <div
                    key={tour.id}
                    className="group bg-white rounded-2xl border border-black/[0.08] overflow-hidden hover:border-[#EF9F27]/40 hover:shadow-[0_4px_20px_rgba(239,159,39,0.1)] transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                  >
                    {/* Image area */}
                    <div className="relative h-52 overflow-hidden">
                      <Image
                        src={tour.image}
                        alt={tour.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                      <span
                        className={`absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full ${tagColor}`}
                      >
                        {tour.category}
                      </span>
                      {/* Rating on image */}
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                        <Star className="h-3.5 w-3.5 fill-[#EF9F27] text-[#EF9F27]" />
                        <span className="text-white text-xs font-semibold">{tour.rating}</span>
                        <span className="text-white/60 text-xs">({(tour.reviews || 0).toLocaleString()})</span>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="p-4">
                      <h3 className="font-semibold text-[#1A1208] text-sm mb-1.5 line-clamp-1">
                        {tour.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-[#6B5E4E] mb-3">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-[#A89880]" />
                        {tour.location}
                      </div>

                      {/* Meta row */}
                      <div className="flex items-center gap-3 text-xs text-[#6B5E4E] mb-4">
                        {(tour as any).duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-[#A89880]" />
                            {(tour as any).duration}
                          </span>
                        )}
                        {(tour as any).groupSize && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-[#A89880]" />
                            {(tour as any).groupSize}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-black/[0.06]">
                        <div>
                          <span className="text-lg font-bold text-[#EF9F27]">
                            {tour.price?.toLocaleString()} ETB
                          </span>
                          <span className="text-xs text-[#A89880] ml-1">/person</span>
                        </div>
                        <Link href={`/tours/${tour.id}`}>
                          <button className="px-4 py-2 rounded-xl bg-[#EF9F27] text-[#412402] text-xs font-semibold hover:brightness-105 active:scale-[0.98] transition-all">
                            Book Now
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 bg-[#1C0A00] relative overflow-hidden">
        {/* Tibeb overlay */}
        <div
          className="absolute inset-0 opacity-100 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23EF9F27' fill-opacity='0.04'%3E%3Cpath d='M40 0L80 40L40 80L0 40Z'/%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "80px 80px",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#EF9F27]/15 text-[#EF9F27] border border-[#EF9F27]/25 mb-5">
              How It Works
            </span>
            <h2
              className="text-3xl sm:text-4xl font-semibold text-white"
              style={{ fontFamily: "var(--font-playfair, Georgia)" }}
            >
              Book Your Tour in 3 Simple Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                icon: <MapPin className="h-7 w-7" />,
                title: "Choose Your Destination",
                description:
                  "Browse 250+ tours across Ethiopia's regions and find the perfect experience.",
              },
              {
                step: "02",
                icon: <Users className="h-7 w-7" />,
                title: "Select a Verified Provider",
                description:
                  "Pick from vetted local tour operators with real ratings and traveler reviews.",
              },
              {
                step: "03",
                icon: <CreditCard className="h-7 w-7" />,
                title: "Book & Pay Securely",
                description:
                  "Pay with Chapa, Telebirr, or card — receive your QR ticket instantly.",
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div
                  className="text-8xl font-bold absolute -top-5 -left-2 select-none"
                  style={{ color: "#EF9F27", opacity: 0.06, fontFamily: "var(--font-playfair, Georgia)" }}
                >
                  {item.step}
                </div>
                <div className="relative bg-white/[0.04] border border-white/8 rounded-2xl p-7 hover:bg-white/[0.07] transition-colors">
                  <div className="w-14 h-14 rounded-2xl bg-[#EF9F27] flex items-center justify-center text-[#1C0A00] mb-5">
                    {item.icon}
                  </div>
                  <h3
                    className="text-lg font-semibold text-white mb-2"
                    style={{ fontFamily: "var(--font-playfair, Georgia)" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm text-white/55 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#EF9F27]/12 text-[#BA7517] border border-[#EF9F27]/20 mb-4">
              Traveler Stories
            </span>
            <h2
              className="text-3xl sm:text-4xl font-semibold text-[#1A1208]"
              style={{ fontFamily: "var(--font-playfair, Georgia)" }}
            >
              What Our Travelers Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border border-black/[0.08] bg-[#FAFAF8] hover:border-[#EF9F27]/30 hover:shadow-[0_4px_20px_rgba(239,159,39,0.08)] transition-all duration-200"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-[#EF9F27] text-[#EF9F27]" />
                  ))}
                </div>
                <p className="text-sm text-[#6B5E4E] italic leading-relaxed mb-5">
                  &ldquo;{t.content}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-black/[0.06]">
                  <div className="w-10 h-10 rounded-full bg-[#EF9F27] flex items-center justify-center text-[#1C0A00] font-bold text-sm shrink-0">
                    {t.initial}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#1A1208]">{t.name}</div>
                    <div className="text-xs text-[#A89880]">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROVIDER CTA ── */}
      <section className="py-20 bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-[#1C0A00] overflow-hidden relative">
            {/* Pattern */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23EF9F27' fill-opacity='0.05'%3E%3Cpath d='M40 0L80 40L40 80L0 40Z'/%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: "80px 80px",
              }}
            />
            <div className="relative grid lg:grid-cols-2 gap-10 p-8 sm:p-12 lg:p-16 items-center">
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#EF9F27]/15 text-[#EF9F27] border border-[#EF9F27]/25 mb-6">
                  For Travel Providers
                </span>
                <h2
                  className="text-3xl sm:text-4xl font-semibold text-white mb-4"
                  style={{ fontFamily: "var(--font-playfair, Georgia)" }}
                >
                  Grow Your Business with Tankua
                </h2>
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  Join Ethiopia's fastest-growing tourism platform. Reach thousands of travelers
                  searching for authentic local experiences.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Access to 10,000+ active users",
                    "Easy booking management dashboard",
                    "Fast ETB payouts via Telebirr",
                    "Marketing support and promotion",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-white/75">
                      <CheckCircle2 className="h-4 w-4 text-[#1D9E75] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/provider-portal">
                  <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#EF9F27] text-[#412402] font-semibold text-sm hover:brightness-105 active:scale-[0.98] transition-all shadow-[0_4px_16px_rgba(239,159,39,0.3)]">
                    Register Your Company
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>

              {/* Dashboard preview card */}
              <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6 pb-5 border-b border-white/8">
                  <div className="w-10 h-10 rounded-xl bg-[#EF9F27] flex items-center justify-center text-[#1C0A00] font-bold">
                    T
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Provider Dashboard</div>
                    <div className="text-xs text-white/40">Manage your trips easily</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3.5 bg-[#1D9E75]/12 rounded-xl border border-[#1D9E75]/15">
                    <div>
                      <div className="text-xs text-white/50">Today's Earnings</div>
                      <div className="text-xl font-bold text-[#1D9E75] mt-0.5">15,450 ETB</div>
                    </div>
                    <span className="text-xs text-[#1D9E75] font-medium bg-[#1D9E75]/15 px-2 py-1 rounded-lg">
                      +12%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3.5 bg-[#EF9F27]/10 rounded-xl border border-[#EF9F27]/15">
                    <div>
                      <div className="text-xs text-white/50">Active Bookings</div>
                      <div className="text-xl font-bold text-white mt-0.5">23</div>
                    </div>
                    <span className="text-xs text-[#EF9F27] font-medium bg-[#EF9F27]/15 px-2 py-1 rounded-lg">
                      5 new today
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3.5 bg-white/[0.04] rounded-xl border border-white/6">
                    <div>
                      <div className="text-xs text-white/50">Average Rating</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xl font-bold text-white">4.9</span>
                        <Star className="h-4 w-4 fill-[#EF9F27] text-[#EF9F27]" />
                      </div>
                    </div>
                    <span className="text-xs text-white/40 font-medium bg-white/5 px-2 py-1 rounded-lg">
                      248 reviews
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DOWNLOAD CTA ── */}
      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2
            className="text-3xl sm:text-4xl font-semibold text-[#1A1208] mb-4"
            style={{ fontFamily: "var(--font-playfair, Georgia)" }}
          >
            Ready to Begin Your Adventure?
          </h2>
          <p className="text-[#6B5E4E] mb-10">
            Download Tankua and start exploring Ethiopia's extraordinary destinations.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://apps.apple.com/app/tankua" target="_blank" rel="noopener noreferrer">
              <button className="inline-flex items-center gap-3 px-6 py-3.5 rounded-xl bg-[#1A1208] text-white font-medium text-sm hover:brightness-110 active:scale-[0.98] transition-all">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                App Store
              </button>
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.tankua.app" target="_blank" rel="noopener noreferrer">
              <button className="inline-flex items-center gap-3 px-6 py-3.5 rounded-xl border border-black/[0.12] text-[#1A1208] font-medium text-sm hover:bg-[#FAFAF8] active:scale-[0.98] transition-all">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                Google Play
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#1C0A00] pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl bg-[#EF9F27] flex items-center justify-center">
                  <span className="text-[#1C0A00] font-bold text-base leading-none">T</span>
                </div>
                <span
                  className="text-lg font-bold text-white"
                  style={{ fontFamily: "var(--font-playfair, Georgia)" }}
                >
                  Tankua
                </span>
              </Link>
              <p className="text-sm text-white/40 leading-relaxed max-w-xs">
                Connecting travelers with amazing tour experiences across Ethiopia through trusted local providers.
              </p>
              <div className="flex gap-3 mt-5">
                {["Twitter", "Instagram", "Facebook"].map((s) => (
                  <a
                    key={s}
                    href="#"
                    className="w-8 h-8 rounded-lg bg-white/6 hover:bg-[#EF9F27]/15 flex items-center justify-center text-white/40 hover:text-[#EF9F27] transition-colors text-xs font-bold"
                    aria-label={s}
                  >
                    {s.charAt(0)}
                  </a>
                ))}
              </div>
            </div>

            {/* Explore */}
            <div>
              <h4 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Explore</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "All Tours", href: "/tours" },
                  { label: "Destinations", href: "/destinations" },
                  { label: "Travel Providers", href: "/provider-portal" },
                  { label: "How It Works", href: "/how-it-works" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-white/45 hover:text-[#EF9F27] transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Company</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "About Us", href: "/about" },
                  { label: "Contact", href: "/contact" },
                  { label: "FAQ", href: "/faq" },
                  { label: "Download App", href: "/download" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-white/45 hover:text-[#EF9F27] transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal + Language */}
            <div>
              <h4 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Legal</h4>
              <ul className="space-y-2.5 mb-6">
                {[
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms of Service", href: "/terms" },
                  { label: "Help Center", href: "/faq" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-white/45 hover:text-[#EF9F27] transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              {/* Language switcher */}
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#EF9F27]/15 text-[#EF9F27] border border-[#EF9F27]/25">
                  EN
                </button>
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/40 border border-white/8 hover:border-[#EF9F27]/25 hover:text-[#EF9F27] transition-colors">
                  አማ
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-white/6 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-white/25">© 2025 Tankua. All rights reserved.</p>
            <p className="text-xs text-white/20">Made with care in Addis Ababa 🇪🇹</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
