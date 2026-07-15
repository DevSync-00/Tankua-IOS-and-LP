"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, CheckCircle, Mail, Shield } from "lucide-react";
import { Button, Card } from "@tankua/ui";
import { sendAdminPasswordReset } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      await sendAdminPasswordReset(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1A2F] flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30z' fill='%23D4A017' fill-opacity='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#D4A017] to-[#F4C430] flex items-center justify-center shadow-lg shadow-[#D4A017]/30 mb-4">
            <span className="text-white font-bold text-3xl">T</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Reset Admin Password</h1>
          <p className="text-white/60 mt-2">Receive a secure reset link by email</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-xl border border-white/20 p-8">
          {success ? (
            <div className="space-y-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto" />
              <div>
                <p className="font-semibold text-white">Reset email sent</p>
                <p className="text-sm text-white/60 mt-2">Check {email} for the password reset link.</p>
              </div>
              <Link href="/login">
                <Button className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  type="email"
                  placeholder="Admin email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-12 pl-12 pr-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/20 transition-all"
                />
              </div>

              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                <Shield className="h-5 w-5 mr-2" />
                Send Reset Link
              </Button>

              <Link href="/login" className="block text-center text-sm text-[#D4A017] hover:underline">
                Back to login
              </Link>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
