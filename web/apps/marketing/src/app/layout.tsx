import type { Metadata } from "next";
import { Syne, DM_Sans, Syne_Mono, Fraunces } from "next/font/google";
import { MarketingNavbar } from "@/components/MarketingNavbar";
import "@tankua/ui/styles.css";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500"],
});

const syneMono = Syne_Mono({
  subsets: ["latin"],
  variable: "--font-syne-mono",
  weight: ["400"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Tankua — Discover Tours & Travel in Ethiopia",
  description: "Book unforgettable tours across Ethiopia. Local-born guides, verified providers, ETB & USD pricing.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icon.jpg",
  },
  openGraph: {
    title: "Tankua — Discover Tours & Travel in Ethiopia",
    description: "Book unforgettable tours across Ethiopia with verified local providers.",
    type: "website",
    locale: "en_US",
    siteName: "Tankua",
    images: [{ url: "/images/splash.jpg", width: 1200, height: 630, alt: "Tankua Ethiopia Tours" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${syne.variable} ${dmSans.variable} ${syneMono.variable} ${fraunces.variable} font-sans antialiased`}>
        <MarketingNavbar />
        {children}
      </body>
    </html>
  );
}
