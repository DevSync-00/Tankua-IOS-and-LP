"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Building2, AlertCircle } from "lucide-react";
import { Button, Card } from "@tankua/ui";
import { AuthHeroBackdrop } from "@/components/auth-hero-backdrop";
import { signInProvider } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await signInProvider(email, password);
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-brand-dark flex overflow-hidden">
      <AuthHeroBackdrop />

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
          <h1 className="text-4xl font-bold text-white leading-tight font-syne">
            Grow Your Travel Business with{" "}
            <span className="text-brand-gold-light">Tankua</span>
          </h1>
          <p className="text-xl text-white/70">
            Join Ethiopia's fastest-growing pilgrimage platform and reach thousands of travelers.
          </p>

          <div className="space-y-4">
            {[
              "Access to 10,000+ active users",
              "Easy booking management",
              "Fast and secure payouts",
              "Marketing support",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-white/80">
                <div className="w-5 h-5 rounded-full bg-brand-gold flex items-center justify-center">
                  <span className="text-brand-ink text-xs font-bold">✓</span>
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-white/40 text-sm">
          © {new Date().getFullYear()} BIT Labs Technologies. All rights reserved.
        </div>
      </div>

      <div className="relative z-[1] flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <Image src="/icon.jpg" alt="Tankua" width={64} height={64} className="mx-auto rounded-2xl object-contain shadow-lg mb-4" />
            <h1 className="text-2xl font-bold text-white font-syne">Providers Portal</h1>
          </div>

          <Card className="bg-white p-8 shadow-card border border-[rgba(245,168,0,0.15)]">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-brand-ink font-syne">Welcome Back</h2>
              <p className="text-muted-foreground mt-2">Sign in to manage your business</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-4">
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
                      className="w-full h-12 pl-12 pr-4 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 pl-12 pr-12 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20" />
                  <span className="text-sm text-muted-foreground">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                <Building2 className="h-5 w-5 mr-2" />
                Sign In
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary font-semibold hover:underline">
                  Register your company
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
