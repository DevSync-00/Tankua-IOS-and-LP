"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  MapPin, Calendar, Users, Search, ArrowRight, ChevronRight,
  Instagram, Youtube, Star,
} from "lucide-react";
import { getFeaturedTours } from "@/lib/queries";
import { MARKETING_DESTINATIONS } from "@/lib/marketing-destinations";
import { marketingTourCardImage } from "@/lib/marketing-tour-images";

// ─── Types ───────────────────────────────────────────────
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

// ─── Static data ─────────────────────────────────────────
const featuredToursStatic: TourItem[] = [
  { id: 1, name: "Simien Mountains Trek", location: "Amhara Region", category: "Trekking", image: "/siemen.jpg", rating: 4.9, reviews: 128, price: 12500, duration: "5 days", groupSize: "Max 8" },
  { id: 2, name: "Lalibela Rock Churches", location: "Northern Ethiopia", category: "Cultural", image: "/lalibela.jpg", rating: 4.8, reviews: 214, price: 8900, duration: "2 days", groupSize: "Max 12" },
  { id: 3, name: "Danakil Depression", location: "Afar Region", category: "Adventure", image: "/danakil%20depression.jpg", rating: 4.7, reviews: 96, price: 18500, duration: "3 days", groupSize: "Max 6" },
  { id: 4, name: "Omo Valley Safari", location: "SNNPR", category: "Safari", image: "/omo.jpg", rating: 4.9, reviews: 73, price: 22000, duration: "4 days", groupSize: "Max 8" },
];

const features = [
  { icon: "🧭", title: "Local-born guides", body: "Every guide lives in their region — no outsiders, no scripts." },
  { icon: "✅", title: "Verified listings", body: "Every tour reviewed and approved by our local team." },
  { icon: "💱", title: "ETB & USD pricing", body: "Pay in birr or international card with live rates." },
  { icon: "📞", title: "24/7 Amharic support", body: "Help in Amharic, Oromifa and English whenever you need it." },
];

const testimonials = [
  { quote: "The Simien Mountains guide knew every trail, every bird call. Nothing could have prepared me for how perfect it was.", name: "Sarah K.", region: "Simien Mountains", rating: 5 },
  { quote: "Booking in ETB made me feel like a local. The Lalibela experience was beyond spiritual.", name: "Yohannes T.", region: "Lalibela", rating: 5 },
  { quote: "The Danakil guide kept us safe in 50°C heat and still made every moment magical. Worth every birr.", name: "Marco B.", region: "Danakil Depression", rating: 5 },
];

const stats = [
  { value: "12K+", label: "Travelers" },
  { value: "186", label: "Local guides" },
  { value: "12", label: "Regions" },
  { value: "4.9★", label: "Avg rating" },
];

const categoryBadge: Record<string, string> = {
  Trekking:  "bg-[#EAF3DE] text-[#3B6D11]",
  Cultural:  "bg-[#FAEEDA] text-[#854F0B]",
  Adventure: "bg-[#FAECE7] text-[#993C1D]",
  Safari:    "bg-[#E6F1FB] text-[#185FA5]",
};

// ─── Shared micro-components ──────────────────────────────
function BoatLogo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <Image src="/icon.jpg" alt="Tankua" width={size} height={size} className={`rounded-lg object-contain ${className}`} priority />
  );
}

function FoldCorner() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="absolute top-0 right-0 pointer-events-none" aria-hidden="true">
      <path d="M0 0 L22 0 L22 22 Z" fill="#C47F00" opacity="0.85" />
    </svg>
  );
}

// ─── Animation variants ───────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut", delay: i * 0.07 } }),
};

function FadeUpSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, ease: "easeOut", delay }} className={className}>
      {children}
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function LandingPage() {
  const [tours, setTours] = useState<TourItem[]>(featuredToursStatic);
  const [langLabel, setLangLabel] = useState("EN");

  useEffect(() => {
    getFeaturedTours()
      .then((data) => {
        if (!data?.length) return;
        setTours(
          (data as TourItem[]).map((t, i) => ({
            ...t,
            image: marketingTourCardImage(t.name, i),
          })),
        );
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-brand-sand font-sans overflow-x-hidden">

      {/* ══════════════ HERO ══════════════ */}
      <section className="relative bg-brand-dark min-h-[92vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 min-h-[92vh] pointer-events-none" aria-hidden>
          <div
            className="absolute inset-0 bg-brand-dark"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 85% 55% at 80% 15%, rgba(245,168,0,0.07) 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 10% 90%, rgba(245,168,0,0.04) 0%, transparent 50%)",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 pb-32 lg:py-0 z-[1]">
          <div className="max-w-2xl">

            {/* Text content */}
            <div>
              {/* Eyebrow */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border mb-7 backdrop-blur-sm"
                style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.18)" }}>
                <span className="font-dm font-medium text-[11px] text-white/90 tracking-[0.14em] uppercase">Ethiopia&apos;s local guides</span>
              </motion.div>

              {/* Headline — word-by-word reveal */}
              <h1 className="font-fraunces font-semibold leading-[1.12] tracking-[-0.02em] mb-5 overflow-hidden">
                {["Your adventure,"].map((line, li) => (
                  <div key={li} className="overflow-hidden">
                    <motion.div initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, ease: "easeOut", delay: li * 0.12 + 0.1 }}
                      className="text-white" style={{ fontSize: "clamp(34px, 5.2vw, 56px)", fontWeight: 600 }}>
                      {line}
                    </motion.div>
                  </div>
                ))}
                {["folded to perfection."].map((line, li) => (
                  <div key={li} className="overflow-hidden">
                    <motion.div initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, ease: "easeOut", delay: li * 0.12 + 0.22 }}
                      className="text-brand-gold-light" style={{ fontSize: "clamp(34px, 5.2vw, 56px)", fontWeight: 600 }}>
                      {line}
                    </motion.div>
                  </div>
                ))}
              </h1>

              {/* Subtext */}
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                className="text-[16px] text-white/[0.78] leading-relaxed max-w-md mb-7 font-normal">
                Handpicked local guides across 12 Ethiopian regions — from the highlands of Simien to the heat of Danakil.
              </motion.p>

              {/* Trust pills */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                className="flex flex-wrap gap-2 mb-8">
                {stats.map((s) => (
                  <span key={s.label} className="px-3 py-1.5 rounded-full text-[12px] text-white/70 border border-white/12"
                    style={{ background: "rgba(255,255,255,0.06)" }}>
                    <b className="text-white">{s.value}</b> {s.label}
                  </span>
                ))}
              </motion.div>

              {/* CTAs */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
                className="flex flex-wrap gap-3">
                <Link href="/tours">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 h-[42px] px-5 rounded-[10px] bg-brand-gold text-brand-ink font-medium text-[14px] shadow-btn">
                    Explore tours <ArrowRight className="h-4 w-4" />
                  </motion.button>
                </Link>
                <Link href="/providers">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 h-[42px] px-5 rounded-[10px] border-[1.5px] border-white/28 text-white font-medium text-[14px] hover:bg-white/7 transition-colors">
                    Become a guide
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 60" className="w-full fill-brand-sand" preserveAspectRatio="none">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z"/>
          </svg>
        </div>
      </section>

      {/* ══════════════ SEARCH BAR ══════════════ */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 -mt-3">
        <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-[rgba(245,168,0,0.15)] overflow-hidden">
          <div className="flex flex-col sm:flex-row">
            {[
              { icon: MapPin, label: "DESTINATION", placeholder: "e.g. Lalibela, Simien..." },
              { icon: Calendar, label: "TRAVEL DATES", placeholder: "Pick your dates" },
              { icon: Users, label: "TRAVELERS", placeholder: "How many?" },
            ].map(({ icon: Icon, label, placeholder }, i) => (
              <div key={i} className={`flex-1 flex items-center gap-3 px-5 py-4 ${i < 2 ? "border-b sm:border-b-0 sm:border-r border-[rgba(245,168,0,0.12)]" : ""}`}>
                <Icon className="h-4 w-4 text-brand-gold shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-dm text-[10px] text-brand-muted uppercase tracking-[0.1em] mb-0.5">{label}</p>
                  <input type="text" placeholder={placeholder}
                    className="w-full text-[14px] font-medium text-brand-ink placeholder:text-brand-muted outline-none bg-transparent" />
                </div>
              </div>
            ))}
            <div className="p-2">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto h-full px-6 py-3 rounded-[10px] bg-brand-gold text-brand-ink font-medium text-[14px] flex items-center gap-2 justify-center whitespace-nowrap shadow-btn">
                <Search className="h-4 w-4" /> Search
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ DESTINATIONS ══════════════ */}
      <section className="pt-24 pb-20 bg-brand-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUpSection className="text-center mb-12">
            <p className="font-mono text-[11px] text-brand-gold uppercase tracking-[0.2em] mb-3">Explore Ethiopia</p>
            <h2 className="font-syne font-bold text-[32px] text-brand-ink mb-3">12 regions, one platform</h2>
            <p className="text-[15px] text-brand-muted max-w-md mx-auto">
              Every corner of Ethiopia, connected to a guide who calls it home.
            </p>
          </FadeUpSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {MARKETING_DESTINATIONS.map((dest, i) => (
              <FadeUpSection key={dest.name} delay={i * 0.07}>
                <Link href="/tours" className="block">
                  <motion.div whileHover={{ y: -4, borderColor: "rgba(245,168,0,0.5)" }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="relative bg-brand-cream border border-[rgba(245,168,0,0.15)] rounded-[16px] overflow-hidden cursor-pointer group">
                    <FoldCorner />
                    <div className="relative h-[180px] overflow-hidden">
                      <Image
                        src={dest.image}
                        alt={`${dest.name}, Ethiopia`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent pointer-events-none" aria-hidden />
                    </div>
                    <div className="px-4 py-3.5 flex items-center justify-between">
                      <div>
                        <p className="font-fraunces font-semibold text-[16px] leading-snug text-brand-ink tracking-[-0.02em]">{dest.name}</p>
                        <p className="font-dm text-[12px] text-brand-muted mt-1">{dest.tours} tours · from {dest.from.toLocaleString()} ETB</p>
                      </div>
                      <motion.div whileHover={{ backgroundColor: "#F5A800" }} className="w-8 h-8 shrink-0 rounded-full bg-[rgba(245,168,0,0.1)] flex items-center justify-center transition-colors group-hover:bg-brand-gold">
                        <ArrowRight className="h-4 w-4 text-brand-gold group-hover:text-brand-ink transition-colors" />
                      </motion.div>
                    </div>
                  </motion.div>
                </Link>
              </FadeUpSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ FEATURES STRIP ══════════════ */}
      <section className="py-16 bg-brand-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-white/[0.08]">
            {features.map((f, i) => (
              <FadeUpSection key={f.title} delay={i * 0.07} className="px-8 py-6 first:pl-0 last:pr-0">
                <div className="text-[28px] mb-3">{f.icon}</div>
                <h3 className="font-syne font-bold text-[15px] text-white mb-2">{f.title}</h3>
                <p className="font-dm text-[13px] text-white/55 leading-relaxed">{f.body}</p>
              </FadeUpSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ FEATURED TOURS ══════════════ */}
      <section className="py-20 bg-brand-sand">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUpSection className="text-center mb-12">
            <p className="font-mono text-[11px] text-brand-gold uppercase tracking-[0.2em] mb-3">Featured Tours</p>
            <h2 className="font-syne font-bold text-[32px] text-brand-ink mb-3">Curated by our local experts</h2>
            <p className="text-[15px] text-brand-muted">Handpicked tours for every kind of traveler.</p>
          </FadeUpSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {tours.slice(0, 4).map((tour, i) => (
              <FadeUpSection key={tour.id} delay={i * 0.07}>
                <motion.div whileHover={{ y: -3, borderColor: "rgba(245,168,0,0.5)" }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="relative bg-white border border-[rgba(245,168,0,0.15)] rounded-[14px] overflow-hidden">
                  {i === 0 && <FoldCorner />}
                  {/* Illustration */}
                  <div className="h-[140px] bg-brand-dark flex items-center justify-center overflow-hidden">
                    <Image src={tour.image} alt={tour.name} width={400} height={140} className="w-full h-full object-cover opacity-80" />
                  </div>
                  {/* Body */}
                  <div className="px-4 py-3.5">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium mb-2 ${categoryBadge[tour.category] || "bg-gray-100 text-gray-600"}`}>
                      {tour.category}
                    </span>
                    <h3 className="font-syne font-bold text-[15px] text-brand-ink mb-1">{tour.name}</h3>
                    <div className="flex items-center gap-3 text-[12px] text-brand-muted">
                      {tour.duration && <span>⏱ {tour.duration}</span>}
                      {tour.groupSize && <span>👥 {tour.groupSize}</span>}
                      <span className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-brand-gold text-brand-gold" />{tour.rating}
                      </span>
                    </div>
                  </div>
                  {/* Footer */}
                  <div className="px-4 py-2.5 border-t border-[rgba(245,168,0,0.12)] flex items-center justify-between">
                    <div>
                      <span className="font-mono font-medium text-[16px] text-brand-ink">{tour.price.toLocaleString()} ETB</span>
                      <span className="font-dm text-[12px] text-brand-muted ml-1">/ person</span>
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      className="h-[34px] px-4 rounded-[8px] bg-brand-gold text-brand-ink text-[13px] font-medium">
                      Book now
                    </motion.button>
                  </div>
                </motion.div>
              </FadeUpSection>
            ))}
          </div>

          <FadeUpSection className="text-center mt-10">
            <Link href="/tours">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 h-[42px] px-6 rounded-[10px] border-[1.5px] border-brand-gold text-brand-gold font-medium text-[14px] hover:bg-[rgba(245,168,0,0.08)] transition-colors">
                View all tours <ArrowRight className="h-4 w-4" />
              </motion.button>
            </Link>
          </FadeUpSection>
        </div>
      </section>

      {/* ══════════════ TESTIMONIALS ══════════════ */}
      <section className="py-16 bg-brand-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUpSection className="text-center mb-10">
            <p className="font-mono text-[11px] text-brand-gold uppercase tracking-[0.2em] mb-3">Travelers say</p>
            <h2 className="font-syne font-bold text-[28px] text-brand-ink">Real stories from real adventurers</h2>
          </FadeUpSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <FadeUpSection key={i} delay={i * 0.07}>
                <div className="bg-white rounded-[14px] p-5 border-l-4 border-brand-gold shadow-card">
                  <div className="flex mb-3">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-brand-gold text-brand-gold" />
                    ))}
                  </div>
                  <p className="font-dm text-[14px] text-brand-earth italic leading-relaxed mb-4">"{t.quote}"</p>
                  <div>
                    <p className="font-syne font-bold text-[13px] text-brand-ink">{t.name}</p>
                    <p className="font-dm text-[12px] text-brand-muted mt-0.5">{t.region}</p>
                  </div>
                </div>
              </FadeUpSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="bg-brand-dark pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <BoatLogo size={34} />
                <span className="font-syne font-extrabold text-lg text-white">Tankua</span>
              </div>
              <p className="font-dm text-[13px] text-white/50 mb-5 max-w-xs">
                Ethiopia's local tour platform — connecting travelers with the people who know the land.
              </p>
              <div className="flex items-center gap-3">
                {[Instagram, Youtube].map((Icon, i) => (
                  <button key={i} className="p-2 text-white/50 hover:text-white transition-colors" aria-label="Social">
                    <Icon className="h-[20px] w-[20px]" />
                  </button>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="grid grid-cols-3 gap-6">
              {[
                {
                  head: "Explore",
                  items: [
                    { label: "Tours", href: "/tours" },
                    { label: "Destinations", href: "/destinations" },
                    { label: "Guides", href: "/guides" },
                  ],
                },
                {
                  head: "Company",
                  items: [
                    { label: "About", href: "/about" },
                    { label: "How it works", href: "/how-it-works" },
                    { label: "For providers", href: "/providers" },
                  ],
                },
                {
                  head: "Support",
                  items: [
                    { label: "FAQ", href: "/faq" },
                    { label: "Contact", href: "/contact" },
                    { label: "Privacy", href: "/privacy" },
                  ],
                },
              ].map((col) => (
                <div key={col.head}>
                  <p className="font-syne font-bold text-[12px] text-white mb-3 uppercase tracking-widest">{col.head}</p>
                  <ul className="space-y-2">
                    {col.items.map(({ label, href }) => (
                      <li key={label}>
                        <Link href={href} className="font-dm text-[13px] text-white/60 hover:text-white transition-colors">
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* CTA + lang */}
            <div className="space-y-4">
              <Link href="/providers">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="w-full h-[42px] rounded-[10px] bg-brand-gold text-brand-ink font-medium text-[14px]">
                  List your tours
                </motion.button>
              </Link>
              <div className="flex gap-2">
                {["EN", "አማ"].map((lang) => (
                  <button key={lang} onClick={() => setLangLabel(lang)}
                    className={`flex-1 py-2 rounded-[8px] text-[13px] font-medium border transition-colors ${
                      langLabel === lang ? "bg-brand-gold text-brand-ink border-brand-gold" : "border-white/20 text-white/60 hover:text-white"
                    }`}>{lang}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.08] pt-7 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-dm text-[12px] text-white/35">© {new Date().getFullYear()} BIT Labs Technologies. All rights reserved.</p>
            <div className="flex items-center gap-3">
              {["Telebirr", "Visa", "Mastercard"].map((p) => (
                <span key={p} className="font-dm text-[11px] text-white/30 border border-white/10 px-2 py-1 rounded">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
