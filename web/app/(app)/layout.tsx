"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/ui/BottomNav";
import { SideNav } from "@/components/ui/SideNav";
import { TopBar } from "@/components/ui/TopBar";
import { TrialBanner } from "@/components/ui/TrialBanner";
import { useSession } from "@/lib/hooks/useSession";
import { useSubscription } from "@/lib/hooks/useSubscription";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();
  const sub = useSubscription(user?.id ?? null);

  useEffect(() => {
    if (!sessionLoading && !sub.loading) {
      if (!user) {
        router.replace("/login");
      } else if (sub.isCanceled) {
        router.replace("/");
      }
    }
  }, [user, sessionLoading, sub.loading, sub.isCanceled, router]);

  if (sessionLoading || sub.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-brand-navy text-2xl animate-pulse">&#9875;</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SideNav />
      <div className="flex-1 flex flex-col md:ml-64 min-w-0">
        {sub.status === "trialing" && sub.daysRemaining !== null && (
          <TrialBanner daysRemaining={sub.daysRemaining} plan={sub.plan} />
        )}
        <TopBar />
        <main className="flex-1 pb-20 md:pb-0 w-full max-w-lg mx-auto md:max-w-none md:px-8 md:py-6">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
