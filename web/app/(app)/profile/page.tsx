"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/lib/hooks/useSession";
import { useSubscription } from "@/lib/hooks/useSubscription";

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile } = useSession();
  const sub = useSubscription(user?.id ?? null);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
  };

  const initial = (profile?.display_name ?? user?.email ?? "?").charAt(0).toUpperCase();

  return (
    <div className="px-4 pt-4 pb-6 md:grid md:grid-cols-3 md:gap-8 md:items-start">
      <div className="space-y-5 md:col-span-1">
        <h1 className="text-2xl font-bold text-brand-navy md:hidden">Profile</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center text-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-brand-navy flex items-center justify-center text-white text-3xl font-bold">
            {initial}
          </div>
          <div>
            <p className="font-bold text-brand-navy text-lg">{profile?.display_name ?? user?.email}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            {profile?.home_marina && <p className="text-xs text-gray-400 mt-1">&#9875; {profile.home_marina}</p>}
          </div>
          <Link href="/profile/edit" className="text-xs text-brand-navy underline">Edit Profile</Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Subscription</p>
          <p className="font-semibold text-brand-navy">
            {sub.plan === "app_and_agent" ? "App + AI Mechanic" : sub.plan === "app_only" ? "App Only" : "No plan"}
          </p>
          <p className={`text-sm font-medium capitalize ${
            sub.status === "trialing" ? "text-blue-600" :
            sub.status === "active" ? "text-green-600" :
            sub.status === "past_due" ? "text-orange-500" : "text-red-500"
          }`}>
            {sub.status ?? "\u2014"}
            {sub.status === "trialing" && sub.daysRemaining !== null && ` \u2014 ${sub.daysRemaining}d remaining`}
          </p>
          <Link href="/garage/upgrade" className="text-xs text-brand-navy underline block">Manage plan</Link>
        </div>
      </div>

      <div className="mt-5 md:mt-0 md:col-span-2 space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {[
            { label: "Following", href: "/profile/following" },
            { label: "Boater's Blog", href: "/blog" },
            { label: "Terms of Service", href: "/terms" },
            { label: "Privacy Policy", href: "/privacy" },
          ].map(({ label, href }) => (
            <Link key={href} href={href}
              className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors">
              <span className="text-sm text-gray-700">{label}</span>
              <span className="text-gray-300">&#8250;</span>
            </Link>
          ))}
        </div>
        <Button variant="ghost" onClick={handleSignOut} className="w-full md:w-auto">Sign Out</Button>
      </div>
    </div>
  );
}
