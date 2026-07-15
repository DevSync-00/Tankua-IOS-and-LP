"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { Button, Badge } from "@tankua/ui";

export default function TermsPage() {
  return (
    <main className="min-h-screen">

      {/* Content */}
      <section className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#D4A017]/10 flex items-center justify-center text-[#D4A017]">
              <FileText className="h-8 w-8" />
            </div>
            <Badge className="mb-4">Legal</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-[#0A1A2F] mb-4">
              Terms of Service
            </h1>
            <p className="text-[#0A1A2F]/70">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="prose prose-lg max-w-none space-y-8 text-[#0A1A2F]/80">
            <section>
              <h2 className="text-2xl font-bold text-[#0A1A2F] mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Tankua, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0A1A2F] mb-4">2. Use of Service</h2>
              <h3 className="text-xl font-semibold text-[#0A1A2F] mb-2">Eligibility</h3>
              <p>You must be at least 18 years old to book tours. Users under 18 must be accompanied by an adult.</p>
              
              <h3 className="text-xl font-semibold text-[#0A1A2F] mb-2 mt-4">Account Responsibility</h3>
              <p>You are responsible for maintaining the confidentiality of your account and password.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0A1A2F] mb-4">3. Bookings and Payments</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>All bookings are subject to availability</li>
                <li>Prices are displayed in ETB and may change without notice</li>
                <li>Payment must be completed to confirm booking</li>
                <li>Refunds are subject to our cancellation policy</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0A1A2F] mb-4">4. Cancellation Policy</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Cancellations 48+ hours before departure: Full refund</li>
                <li>Cancellations 24-48 hours before: 50% refund</li>
                <li>Cancellations less than 24 hours: No refund</li>
                <li>Provider cancellations: Full refund guaranteed</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0A1A2F] mb-4">5. Provider Services</h2>
              <p>
                Tankua is a platform connecting travelers with providers. We are not responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provider service quality or safety</li>
                <li>Delays or cancellations by providers</li>
                <li>Accidents or incidents during tours</li>
                <li>Disputes between users and providers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0A1A2F] mb-4">6. User Conduct</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the service for illegal purposes</li>
                <li>Impersonate others or provide false information</li>
                <li>Interfere with the service's operation</li>
                <li>Harass or harm other users or providers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0A1A2F] mb-4">7. Limitation of Liability</h2>
              <p>
                Tankua is not liable for any indirect, incidental, or consequential damages arising from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0A1A2F] mb-4">8. Contact</h2>
              <p>
                For questions about these terms, contact:
              </p>
              <p className="font-semibold">
                Email: legal@tankua.et<br />
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
