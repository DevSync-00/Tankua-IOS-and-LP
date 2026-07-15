"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Building2, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { Button, Card } from "@tankua/ui";
import { AuthHeroBackdrop } from "@/components/auth-hero-backdrop";
import { sendProviderPasswordReset } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();
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
      await sendProviderPasswordReset(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-brand-dark flex overflow-hidden">
      <AuthHeroBackdrop />

      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative z-[1] p-12 flex-col justify-between">
        <div className="relative">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/icon.jpg" alt="Tankua" width={48} height={48} className="rounded-xl object-contain shadow-lg shadow-black/20" />
            <div>
              <span className="text-2xl font-bold text-white font-syne">Tankua</span>
              <span className="block text-sm text-white/50">Providers Portal</span>
            </div>
          </Link>
        </div>

        <div className="relative space-y-8">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Reset Your Password
          </h1>
          <p className="text-xl text-white/70">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <div className="relative text-white/40 text-sm">
          © {new Date().getFullYear()} BIT Labs Technologies. All rights reserved.
        </div>
      </div>

      {/* Right side - Form */}
      <div className="relative z-[1] flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Image src="/icon.jpg" alt="Tankua" width={64} height={64} className="mx-auto rounded-2xl object-contain shadow-lg mb-4" />
            <h1 className="text-2xl font-bold text-white font-syne">Providers Portal</h1>
          </div>

          <Card className="bg-white p-8 shadow-card border border-[rgba(245,168,0,0.15)]">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-brand-ink font-syne">Forgot Password?</h2>
              <p className="text-muted-foreground mt-2">
                {success 
                  ? "Check your email for reset instructions"
                  : "Enter your email to receive a password reset link"
                }
              </p>
            </div>

            {success ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-4 p-6 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                  <div className="text-center">
                    <p className="text-green-800 font-semibold mb-2">Email Sent!</p>
                    <p className="text-sm text-green-700">
                      We've sent a password reset link to <strong>{email}</strong>
                    </p>
                    <p className="text-sm text-green-600 mt-2">
                      Please check your inbox and click the link to reset your password.
                    </p>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the email? Check your spam folder or try again.
                  </p>
                  <Button
                    onClick={() => {
                      setSuccess(false);
                      setEmail("");
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Send Another Email
                  </Button>
                  <Link href="/login" className="block">
                    <Button variant="ghost" className="w-full">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full h-12 pl-12 pr-4 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Enter the email address associated with your provider account
                  </p>
                </div>

                <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                  <Building2 className="h-5 w-5 mr-2" />
                  Send Reset Link
                </Button>

                <div className="text-center">
                  <Link href="/login" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                  </Link>
                </div>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
