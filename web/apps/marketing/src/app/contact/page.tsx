"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Button, Card, Badge, Input } from "@tankua/ui";

const contactInfo = [
  {
    icon: <Mail className="h-6 w-6" />,
    title: "Email",
    value: "support@tankua.et",
    description: "We'll respond within 24 hours",
  },
  {
    icon: <Phone className="h-6 w-6" />,
    title: "Phone",
    value: "+251 911 123 456",
    description: "Mon-Fri, 8AM-6PM EAT",
  },
  {
    icon: <MapPin className="h-6 w-6" />,
    title: "Office",
    value: "Bole, Addis Ababa",
    description: "Ethiopia",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { submitContactForm } = await import("@/lib/queries");
      const result = await submitContactForm(formData);
      
      if (result.success) {
    setSubmitted(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setError("Failed to send message. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
      console.error("Contact form error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">

      {/* Hero */}
      <section className="pt-32 pb-12 bg-gradient-to-b from-[#F8F6F0] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4">Get In Touch</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-[#0A1A2F] mb-6">
              We'd Love to 
              <span className="text-[#D4A017]"> Hear From You</span>
            </h1>
            <p className="text-lg text-[#0A1A2F]/70">
              Have questions about Tankua? Want to become a provider? 
              We're here to help you plan your perfect tour.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {contactInfo.map((info, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#D4A017]/10 flex items-center justify-center text-[#D4A017]">
                  {info.icon}
                </div>
                <h3 className="text-lg font-bold text-[#0A1A2F] mb-1">{info.title}</h3>
                <p className="text-[#D4A017] font-medium mb-1">{info.value}</p>
                <p className="text-sm text-[#0A1A2F]/50">{info.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold text-[#0A1A2F] mb-2">Message Sent!</h2>
                <p className="text-[#0A1A2F]/70 mb-6">
                  Thank you for contacting us. We'll get back to you within 24 hours.
                </p>
                <Button onClick={() => setSubmitted(false)}>Send Another Message</Button>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#D4A017]/10 flex items-center justify-center text-[#D4A017]">
                    <MessageSquare className="h-7 w-7" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#0A1A2F]">Send us a Message</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#0A1A2F] mb-2">
                        Your Name
                      </label>
                      <Input
                        required
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#0A1A2F] mb-2">
                        Email Address
                      </label>
                      <Input
                        required
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0A1A2F] mb-2">
                      Subject
                    </label>
                    <Input
                      required
                      placeholder="How can we help?"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0A1A2F] mb-2">
                      Message
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Tell us more about your inquiry..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/20 outline-none transition-all resize-none"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>
                  {error && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                      {error}
                    </div>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full bg-[#D4A017] hover:bg-[#B8860B]"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                      </>
                    )}
                  </Button>
                </form>
              </>
            )}
          </Card>
        </div>
      </section>

      {/* FAQ Link */}
      <section className="py-12 bg-[#F8F6F0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Clock className="h-10 w-10 mx-auto mb-4 text-[#D4A017]" />
          <h2 className="text-2xl font-bold text-[#0A1A2F] mb-2">Looking for Quick Answers?</h2>
          <p className="text-[#0A1A2F]/70 mb-6">
            Check out our frequently asked questions for instant help.
          </p>
          <Link href="/how-it-works#faqs">
            <Button variant="outline">View FAQs</Button>
          </Link>
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


