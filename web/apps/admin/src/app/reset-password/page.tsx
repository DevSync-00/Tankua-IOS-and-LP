"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, CheckCircle, Eye, EyeOff, Lock, Shield } from "lucide-react";
import { Button, Card } from "@tankua/ui";
import { initializeRecoverySession, updateAdminPassword } from "@/lib/auth";

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

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      await updateAdminPassword(password);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidToken === null) {
    return (
      <div className="min-h-screen bg-[#0A1A2F] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-[#0A1A2F] flex items-center justify-center p-4">
        <Card className="bg-white p-8 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#0A1A2F]">Invalid or Expired Link</h1>
          <p className="text-muted-foreground mt-2">Request a new admin password reset link.</p>
          <div className="space-y-3 mt-6">
            <Link href="/forgot-password">
              <Button className="w-full">Request New Link</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="w-full">Back to Login</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1A2F] flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#D4A017] to-[#F4C430] flex items-center justify-center shadow-lg shadow-[#D4A017]/30 mb-4">
            <span className="text-white font-bold text-3xl">T</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Set New Admin Password</h1>
        </div>

        <Card className="bg-white/10 backdrop-blur-xl border border-white/20 p-8">
          {success ? (
            <div className="space-y-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto" />
              <p className="font-semibold text-white">Password updated. Redirecting to login...</p>
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
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-12 pl-12 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full h-12 pl-12 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                <Shield className="h-5 w-5 mr-2" />
                Reset Password
              </Button>

              <Link href="/login" className="block text-center text-sm text-[#D4A017] hover:underline">
                <ArrowLeft className="h-4 w-4 inline mr-1" />
                Back to login
              </Link>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
