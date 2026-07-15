"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getStoredAdmin, loadCurrentAdmin, signOutAdmin, storeAdmin } from "@/lib/auth";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const verify = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session?.user?.email) {
          await signOutAdmin();
          router.replace("/login");
          return;
        }

        const stored = getStoredAdmin();
        if (stored?.email === session.user.email && stored.is_active) {
          setIsReady(true);
          return;
        }

        const admin = await loadCurrentAdmin(session.user.email);
        if (!admin) {
          await signOutAdmin();
          router.replace("/login");
          return;
        }

        storeAdmin(admin);
        setIsReady(true);
      } catch {
        await signOutAdmin();
        router.replace("/login");
      }
    };

    verify();
  }, [router]);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-brand-sand flex items-center justify-center text-brand-muted">
        Checking session...
      </div>
    );
  }

  return <>{children}</>;
}
