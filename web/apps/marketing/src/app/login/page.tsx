"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Mail, Lock, ArrowRight, Eye, EyeOff, Send, User } from "lucide-react";
import { Button, Card, Badge, Input } from "@tankua/ui";
import { supabase } from "@/lib/supabase";

const telegramBotId = process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID;

function decodeTelegramResult(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSignUp = mode === "signup";

  useEffect(() => {
    const handleTelegramReturn = async () => {
      if (!window.location.hash.includes("tgAuthResult=")) return;

      setTelegramLoading(true);
      setError(null);

      try {
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const encodedResult = hashParams.get("tgAuthResult");
        if (!encodedResult) throw new Error("Telegram did not return auth data.");

        const authData = decodeTelegramResult(encodedResult);
        await completeTelegramLogin(authData);
        window.history.replaceState(null, "", window.location.pathname);
        router.push("/");
      } catch (err: any) {
        setError(err.message || "Telegram sign in failed.");
      } finally {
        setTelegramLoading(false);
      }
    };

    handleTelegramReturn();
  }, [router]);

  const ensureUserProfile = async (authUser: any, displayName?: string) => {
    const { data: existingUser, error: existingError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();

    if (existingError) throw existingError;
    if (existingUser) return existingUser;

    const { error: insertError } = await supabase.from("users").upsert(
      {
        id: authUser.id,
        name: displayName || authUser.user_metadata?.name || "",
        email: authUser.email || "",
        phone_number: `auth_${authUser.id}`,
        emergency_contact: "",
        location: "",
        saved_destinations: [],
        saved_stations: [],
        is_admin: false,
      },
      { onConflict: "id" },
    );

    if (insertError) throw insertError;
  };

  const completeTelegramLogin = async (authData: any) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const response = await fetch(`${supabaseUrl}/functions/v1/telegram-auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseAnonKey || "",
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify(authData),
    });

    const result = await response.json();
    if (!response.ok || result.error) {
      throw new Error(result.error || "Telegram sign in failed.");
    }

    const { session } = result;
    if (!session?.access_token || !session?.refresh_token) {
      throw new Error("Telegram did not return a valid session.");
    }

    const { error: sessionError } = await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });

    if (sessionError) throw sessionError;
  };

  const startTelegramLogin = () => {
    if (!telegramBotId) {
      setError("Telegram login is not configured. Set NEXT_PUBLIC_TELEGRAM_BOT_ID.");
      return;
    }

    const origin = window.location.origin;
    const returnTo = `${origin}/login`;
    const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const url =
      "https://oauth.telegram.org/auth" +
      `?bot_id=${telegramBotId}` +
      `&origin=${encodeURIComponent(origin)}` +
      `&return_to=${encodeURIComponent(returnTo)}` +
      "&request_access=write" +
      "&embed=0" +
      `&nonce=${encodeURIComponent(nonce)}`;

    window.location.href = url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail || !password) {
        throw new Error("Please enter your email and password.");
      }

      if (isSignUp) {
        if (!name.trim()) throw new Error("Please enter your name.");
        if (password.length < 8) throw new Error("Password must be at least 8 characters.");

        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: { name: name.trim() },
            emailRedirectTo: `${window.location.origin}/login`,
          },
        });

        if (error) throw error;

        if (data.user && data.session) {
          await ensureUserProfile(data.user, name.trim());
          router.push("/");
        } else {
          setMode("signin");
          setError("Check your email for a confirmation link, then sign in.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (error) throw error;
        if (data.user) await ensureUserProfile(data.user);
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F8F6F0] to-white">

      {/* Content */}
      <section className="pt-32 pb-20">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#D4A017]/10 flex items-center justify-center text-[#D4A017]">
              <LogIn className="h-8 w-8" />
            </div>
            <Badge className="mb-4">Sign In</Badge>
            <h1 className="text-4xl font-bold text-[#0A1A2F] mb-2">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-[#0A1A2F]/70">
              Use email or Telegram to access Tankua
            </p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#F8F6F0] p-1">
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    !isSignUp ? "bg-[#D4A017] text-[#0A1A2F]" : "text-[#0A1A2F]/60"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    isSignUp ? "bg-[#D4A017] text-[#0A1A2F]" : "text-[#0A1A2F]/60"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-[#0A1A2F] mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#0A1A2F]/40" />
                    <Input
                      type="text"
                      required
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-12"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#0A1A2F] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#0A1A2F]/40" />
                  <Input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0A1A2F] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#0A1A2F]/40" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0A1A2F]/40 hover:text-[#0A1A2F]"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-[#0A1A2F]/70">
                  <input type="checkbox" className="rounded" />
                  <span>Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-[#D4A017] hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#D4A017] hover:bg-[#B8860B]"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    {isSignUp ? "Create Account" : "Sign In"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs font-medium text-[#0A1A2F]/50">OR</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full border-[#229ED9] text-[#229ED9] hover:bg-[#229ED9]/5"
                size="lg"
                onClick={startTelegramLogin}
                disabled={telegramLoading}
              >
                {telegramLoading ? (
                  <>
                    <div className="h-5 w-5 mr-2 border-2 border-[#229ED9] border-t-transparent rounded-full animate-spin" />
                    Connecting Telegram...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Continue with Telegram
                  </>
                )}
              </Button>
            </div>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm text-[#0A1A2F]/60">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="text-[#D4A017] hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[#D4A017] hover:underline">
                Privacy Policy
              </Link>
            </p>
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
