import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "@tankua/ui/styles.css";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Tankua — Discover Tours & Travel in Ethiopia",
  description: "Book unforgettable tours across Ethiopia. Local-born guides, verified providers, ETB & USD pricing. Lalibela, Simien Mountains, Danakil Depression, Omo Valley and more.",
  keywords: ["Ethiopia", "tours", "travel", "adventure", "cultural tours", "Lalibela", "Simien Mountains", "Danakil", "booking", "tourism"],
  openGraph: {
    title: "Tankua — Discover Tours & Travel in Ethiopia",
    description: "Book unforgettable tours across Ethiopia with verified local providers.",
    type: "website",
    locale: "en_US",
    siteName: "Tankua",
    images: [{ url: "/images/splash.jpg", width: 1200, height: 630, alt: "Tankua Ethiopia Tours" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tankua — Discover Tours & Travel in Ethiopia",
    description: "Book unforgettable tours across Ethiopia with verified local providers.",
    images: ["/images/splash.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${jakarta.variable} ${playfair.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}

