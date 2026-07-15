"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, Building2, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { Button, Card } from "@tankua/ui";
import { AuthHeroBackdrop } from "@/components/auth-hero-backdrop";
import { initializeRecoverySession, updateProviderPassword } from "@/lib/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      try {
        await initializeRecoverySession();
        setIsValidToken(true);
      } catch {
        setIsValidToken(false);
      }
    };

    checkToken();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      await updateProviderPassword(password);
      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidToken === null) {
    return (
      <div className="relative min-h-screen bg-brand-dark flex items-center justify-center overflow-hidden">
        <AuthHeroBackdrop />
        <div className="relative z-[1] text-white font-dm">Loading...</div>
      </div>
    );
  }

  if (isValidToken === false) {
    return (
      <div className="relative min-h-screen bg-brand-dark flex items-center justify-center p-6 overflow-hidden">
        <AuthHeroBackdrop />
        <Card className="relative z-[1] bg-white p-8 max-w-md w-full shadow-card border border-[rgba(245,168,0,0.15)]">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-2xl font-bold text-brand-ink font-syne">Invalid or Expired Link</h2>
            <p className="text-muted-foreground">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <div className="space-y-2 pt-4">
              <Link href="/forgot-password">
                <Button className="w-full">Request New Reset Link</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

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
            Set New Password
          </h1>
          <p className="text-xl text-white/70">
            Choose a strong password to secure your provider account.
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
            {success ? (
              <div className="text-center space-y-6">
                <div className="flex flex-col items-center gap-4 p-6 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                  <div>
                    <p className="text-green-800 font-semibold mb-2">Password Reset Successful!</p>
                    <p className="text-sm text-green-700">
                      Your password has been updated. Redirecting to login...
                    </p>
                  </div>
                </div>
                <Link href="/login">
                  <Button className="w-full">
                    Go to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-brand-ink font-syne">Reset Password</h2>
                  <p className="text-muted-foreground mt-2">Enter your new password below</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      <p className="text-sm">{error}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
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
                    <p className="text-xs text-muted-foreground mt-2">
                      Must be at least 8 characters long
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full h-12 pl-12 pr-12 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                    <Building2 className="h-5 w-5 mr-2" />
                    Reset Password
                  </Button>

                  <div className="text-center">
                    <Link href="/login" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                      <ArrowLeft className="h-4 w-4" />
                      Back to Login
                    </Link>
                  </div>
                </form>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
