import { supabase } from "./supabase";

export type ProviderUser = {
  id: string;
  provider_id: string;
  email: string;
  name: string;
  role: "owner" | "manager" | "driver" | "staff";
  phone?: string | null;
  is_active: boolean;
  provider?: {
    id: string;
    name: string;
    status: "active" | "inactive" | "suspended";
    email?: string | null;
    phone?: string | null;
  } | null;
};

const PROVIDER_STORAGE_KEY = "provider_user";

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export function authErrorMessage(error: any) {
  const message = String(error?.message || "");
  const status = error?.status;

  if (message.includes("Invalid API key") || status === 401) {
    return "Authentication is not configured correctly for this deployment. Check the Supabase URL and anon key used by the deployed provider app.";
  }

  if (message.includes("Email not confirmed") || message.includes("email_not_confirmed")) {
    return "Please confirm your email before logging in.";
  }

  if (message.includes("Invalid login credentials") || message.includes("invalid_credentials") || status === 400) {
    return "Invalid email or password. If your provider was recently approved, use Forgot Password to set your credentials.";
  }

  return message || "Authentication failed. Please try again.";
}

export function getStoredProvider(): ProviderUser | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(PROVIDER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function storeProvider(providerUser: ProviderUser) {
  window.localStorage.setItem(PROVIDER_STORAGE_KEY, JSON.stringify(providerUser));
}

export async function signOutProvider() {
  window.localStorage.removeItem(PROVIDER_STORAGE_KEY);
  await supabase.auth.signOut();
}

export async function loadCurrentProvider(email: string) {
  const { data, error } = await supabase
    .from("provider_users")
    .select("*, provider:providers(*)")
    .eq("email", normalizeEmail(email))
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as ProviderUser | null;
}

export async function signInProvider(email: string, password: string) {
  const emailLower = normalizeEmail(email);

  if (!emailLower || !password) {
    throw new Error("Please enter both email and password.");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailLower,
    password,
  });

  if (error) throw new Error(authErrorMessage(error));

  const providerUser = await loadCurrentProvider(data.user.email || emailLower);
  if (!providerUser) {
    await supabase.auth.signOut();
    throw new Error("Access denied. Active provider account required.");
  }

  if (providerUser.provider?.status !== "active") {
    await supabase.auth.signOut();
    throw new Error("Your provider account is not active yet. Please wait for admin approval.");
  }

  storeProvider(providerUser);
  return providerUser;
}

export async function sendProviderPasswordReset(email: string) {
  const emailLower = normalizeEmail(email);

  if (!emailLower) {
    throw new Error("Please enter your provider email address.");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(emailLower, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw new Error(authErrorMessage(error));
}

export async function initializeRecoverySession() {
  const hashParams = new URLSearchParams(window.location.hash.slice(1));
  const accessToken = hashParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token");
  const type = hashParams.get("type");
  const searchParams = new URLSearchParams(window.location.search);

  if (accessToken && refreshToken && type === "recovery") {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw new Error(authErrorMessage(error));
    return;
  }

  const tokenHash = searchParams.get("token_hash");
  const tokenType = searchParams.get("type");

  if (tokenHash && tokenType === "recovery") {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "recovery",
    });
    if (error) throw new Error(authErrorMessage(error));
    return;
  }

  const code = searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw new Error(authErrorMessage(error));
    return;
  }

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw new Error(authErrorMessage(error));
  if (!session) throw new Error("This password reset link is invalid or expired.");
}

export async function updateProviderPassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(authErrorMessage(error));
  window.localStorage.removeItem(PROVIDER_STORAGE_KEY);
}
