"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type SubscriptionState = {
  status: "trialing" | "active" | "past_due" | "canceled" | null;
  plan: "app_only" | "app_and_agent" | null;
  trialEndsAt: Date | null;
  daysRemaining: number | null;
  agentAccess: boolean;
  appAccess: boolean;
  isCanceled: boolean;
  loading: boolean;
};

function computeState(row: Record<string, unknown> | null): SubscriptionState {
  if (!row) {
    return {
      status: null,
      plan: null,
      trialEndsAt: null,
      daysRemaining: null,
      agentAccess: false,
      appAccess: false,
      isCanceled: false,
      loading: false,
    };
  }

  const status = row.status as SubscriptionState["status"];
  const plan = row.plan as SubscriptionState["plan"];
  const trialEndsAt = row.trial_ends_at
    ? new Date(row.trial_ends_at as string)
    : null;

  const now = new Date();
  const daysRemaining = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / 86400000))
    : null;

  const appAccess = status === "trialing" || status === "active";
  const agentAccess =
    status === "trialing" ||
    (status === "active" && plan === "app_and_agent");

  return {
    status,
    plan,
    trialEndsAt,
    daysRemaining,
    agentAccess,
    appAccess,
    isCanceled: status === "canceled",
    loading: false,
  };
}

export function useSubscription(userId: string | null): SubscriptionState {
  const [state, setState] = useState<SubscriptionState>({
    status: null,
    plan: null,
    trialEndsAt: null,
    daysRemaining: null,
    agentAccess: false,
    appAccess: false,
    isCanceled: false,
    loading: true,
  });

  useEffect(() => {
    if (!userId) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }

    const supabase = createClient();
    let cancelled = false;

    async function fetchSub() {
      try {
        const { data } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", userId!)
          .limit(1);
        if (!cancelled) {
          setState(computeState((data as Record<string, unknown>[] | null)?.[0] ?? null));
        }
      } catch {
        if (!cancelled) setState((s) => ({ ...s, loading: false }));
      }
    }

    fetchSub();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return state;
}
