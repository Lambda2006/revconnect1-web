"use client";

import { useEffect, useState } from "react";
import type { Session, User, AuthChangeEvent } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export type UserProfile = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  home_marina: string | null;
  bio: string | null;
  created_at: string;
};

type SessionState = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  authEvent: AuthChangeEvent | null;
  loading: boolean;
};

export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({
    session: null,
    user: null,
    profile: null,
    authEvent: null,
    loading: true,
  });

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setState((s) => ({
        ...s,
        session,
        user: session?.user ?? null,
        loading: !session,
      }));
      if (session?.user) {
        fetchProfile(supabase, session.user.id);
      } else {
        setState((s) => ({ ...s, loading: false }));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setState((s) => ({
        ...s,
        session,
        user: session?.user ?? null,
        authEvent: event,
        loading: false,
      }));
      if (session?.user) {
        fetchProfile(supabase, session.user.id);
      }
    });

    async function fetchProfile(client: ReturnType<typeof createClient>, userId: string) {
      const { data: rows } = await client
        .from("users")
        .select("*")
        .eq("id", userId)
        .limit(1);
      const data = (rows as Record<string, unknown>[] | null)?.[0] ?? null;
      setState((s) => ({ ...s, profile: data as typeof s.profile, loading: false }));
    }

    return () => subscription.unsubscribe();
  }, []);

  return state;
}
