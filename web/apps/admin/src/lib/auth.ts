import { supabase } from "./supabase";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "admin" | "support" | "finance";
  phone?: string | null;
  is_active: boolean;
};

const ADMIN_STORAGE_KEY = "admin_user";

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export function authErrorMessage(error: any) {
  const message = String(error?.message || "");
  const status = error?.status;

  if (message.includes("Invalid API key") || status === 401) {
    return "Authentication is not configured correctly for this deployment. Check the Supabase URL and anon key used by the deployed admin app.";
  }

  if (message.includes("Email not confirmed") || message.includes("email_not_confirmed")) {
    return "Please confirm your email before logging in.";
  }

  if (message.includes("Invalid login credentials") || message.includes("invalid_credentials") || status === 400) {
    return "Invalid email or password.";
  }

  return message || "Authentication failed. Please try again.";
}

export function getStoredAdmin(): AdminUser | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(ADMIN_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function storeAdmin(admin: AdminUser) {
  window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admin));
}

export async function signOutAdmin() {
  window.localStorage.removeItem(ADMIN_STORAGE_KEY);
  await supabase.auth.signOut();
}

export async function loadCurrentAdmin(email: string) {
  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("email", normalizeEmail(email))
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as AdminUser | null;
}

export async function signInAdmin(email: string, password: string) {
  const emailLower = normalizeEmail(email);

  if (!emailLower || !password) {
    throw new Error("Please enter both email and password.");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailLower,
    password,
  });

  if (error) throw new Error(authErrorMessage(error));

  const admin = await loadCurrentAdmin(data.user.email || emailLower);
  if (!admin) {
    await supabase.auth.signOut();
    throw new Error("Access denied. Active admin account required.");
  }

  storeAdmin(admin);
  return admin;
}

export async function sendAdminPasswordReset(email: string) {
  const emailLower = normalizeEmail(email);

  if (!emailLower) {
    throw new Error("Please enter your admin email address.");
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

  if (accessToken && refreshToken && type === "recovery") {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw new Error(authErrorMessage(error));
    return;
  }

  const code = new URLSearchParams(window.location.search).get("code");
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

export async function updateAdminPassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(authErrorMessage(error));
  window.localStorage.removeItem(ADMIN_STORAGE_KEY);
}
