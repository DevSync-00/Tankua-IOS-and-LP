import type { Metadata } from "next";
import { Syne, DM_Sans, Syne_Mono } from "next/font/google";
import "@tankua/ui/styles.css";
import "./globals.css";

const syne = Syne({ subsets: ["latin"], variable: "--font-syne", weight: ["700", "800"] });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", weight: ["400", "500"] });
const syneMono = Syne_Mono({ subsets: ["latin"], variable: "--font-syne-mono", weight: ["400"] });

export const metadata: Metadata = {
  title: "Tankua — Admin Dashboard",
  description: "Manage the Tankua platform — users, bookings, providers, and analytics.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${dmSans.variable} ${syneMono.variable} font-sans antialiased bg-brand-sand`}>
        {children}
      </body>
    </html>
  );
}
