"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getStoredProvider, loadCurrentProvider, signOutProvider, storeProvider } from "@/lib/auth";

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
          await signOutProvider();
          router.replace("/login");
          return;
        }

        const stored = getStoredProvider();
        if (
          stored?.email === session.user.email &&
          stored.is_active &&
          stored.provider?.status === "active"
        ) {
          setIsReady(true);
          return;
        }

        const providerUser = await loadCurrentProvider(session.user.email);
        if (!providerUser || providerUser.provider?.status !== "active") {
          await signOutProvider();
          router.replace("/login");
          return;
        }

        storeProvider(providerUser);
        setIsReady(true);
      } catch {
        await signOutProvider();
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
