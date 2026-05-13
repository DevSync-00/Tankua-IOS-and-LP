"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { Button, Badge } from "@tankua/ui";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">

      {/* Content */}
      <section className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#D4A017]/10 flex items-center justify-center text-[#D4A017]">
              <Shield className="h-8 w-8" />
            </div>
            <Badge className="mb-4">Legal</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-[#0A1A2F] mb-4">
              Privacy Policy
            </h1>
            <p className="text-[#0A1A2F]/70">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="prose prose-lg max-w-none space-y-8 text-[#0A1A2F]/80">
            <section>
              <h2 className="text-2xl font-bold text-[#0A1A2F] mb-4">1. Introduction</h2>
              <p>
                Tankua ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0A1A2F] mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-semibold text-[#0A1A2F] mb-2">Personal Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name and contact information (phone number, email)</li>
                <li>Payment information (processed securely through third-party providers)</li>
                <li>Location data (for pickup points and navigation)</li>
                <li>Booking history and preferences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0A1A2F] mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Process and manage your bookings</li>
                <li>Send booking confirmations and updates</li>
                <li>Improve our services and user experience</li>
                <li>Send promotional communications (with your consent)</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0A1A2F] mb-4">4. Data Sharing</h2>
              <p>
                We share your information only with:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Travel providers to fulfill your bookings</li>
                <li>Payment processors for transaction processing</li>
                <li>Service providers who assist in our operations</li>
                <li>Legal authorities when required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0A1A2F] mb-4">5. Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0A1A2F] mb-4">6. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0A1A2F] mb-4">7. Contact Us</h2>
              <p>
                For privacy-related questions, contact us at:
              </p>
              <p className="font-semibold">
                Email: privacy@tankua.et<br />
                Phone: +251 911 123 456
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A1A2F] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#D4A017] flex items-center justify-center">
                <span className="text-white font-bold">T</span>
              </div>
              <span className="text-white font-bold">Tankua</span>
            </div>
            <p className="text-white/50 text-sm">
              © {new Date().getFullYear()} BIT Labs Technologies. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
