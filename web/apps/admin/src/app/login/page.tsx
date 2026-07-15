"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Shield, AlertCircle } from "lucide-react";
import { Button, Card } from "@tankua/ui";
import { AuthHeroBackdrop } from "@/components/auth-hero-backdrop";

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
      // Import supabase client
      const { supabase } = await import("@/lib/supabase");
      
      // Attempt to sign in
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message || "Invalid credentials. Please try again.");
        return;
      }

      if (data?.user) {
        // Check if user is admin
        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', email)
          .single();

        if (!adminUser) {
          setError("Access denied. Admin account required.");
          await supabase.auth.signOut();
          return;
        }

        // Store admin session
        localStorage.setItem('admin_user', JSON.stringify(adminUser));
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-brand-dark flex items-center justify-center p-4 overflow-hidden">
      <AuthHeroBackdrop />

      {/* Decorative blobs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-brand-gold/6 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="relative z-[1] w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image src="/icon.jpg" alt="Tankua" width={64} height={64} className="mx-auto rounded-2xl object-contain shadow-lg shadow-black/30 mb-4" />
          <h1 className="text-2xl font-bold text-white font-syne">Admin Dashboard</h1>
          <p className="text-white/60 mt-2 font-dm">Sign in to manage Tankua platform</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-xl border border-white/18 shadow-[0_8px_40px_rgba(0,0,0,0.25)] p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/25 transition-all"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-12 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/25 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/10 text-brand-gold focus:ring-brand-gold/25" />
                <span className="text-sm text-white/60">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-brand-gold-light hover:text-brand-gold hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              <Shield className="h-5 w-5 mr-2" />
              Sign In to Admin
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-center text-sm text-white/40">
              Protected admin area. Unauthorized access is prohibited.
            </p>
          </div>
        </Card>

        <p className="text-center text-white/40 text-sm mt-8">
          Need help? Contact{" "}
          <a href="mailto:support@tankua.et" className="text-brand-gold-light hover:text-brand-gold hover:underline">
            support@tankua.et
          </a>
        </p>
      </div>
    </div>
  );
}

