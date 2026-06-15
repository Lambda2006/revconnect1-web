"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export type FollowRow = {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  users?: { display_name: string | null; avatar_url: string | null };
};

type FollowsState = {
  following: FollowRow[];   // people this user follows
  followers: FollowRow[];   // people who follow this user
  loading: boolean;
  refresh: () => void;
  followUser: (targetId: string) => Promise<void>;
  unfollowUser: (followId: string) => Promise<void>;
};

/**
 * useFollows(userId) — loads the full followers/following lists for a user.
 * Mutations are optimistic on the local state and confirmed by the next refresh.
 */
export function useFollows(userId: string | null): FollowsState {
  const [following, setFollowing] = useState<FollowRow[]>([]);
  const [followers, setFollowers] = useState<FollowRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    const supabase = createClient();
    const [{ data: fwing }, { data: fwers }] = await Promise.all([
      supabase
        .from("follows")
        .select("*, users!follows_following_id_fkey(display_name, avatar_url)")
        .eq("follower_id", userId),
      supabase
        .from("follows")
        .select("*, users!follows_follower_id_fkey(display_name, avatar_url)")
        .eq("following_id", userId),
    ]);
    setFollowing(fwing ?? []);
    setFollowers(fwers ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const followUser = useCallback(async (targetId: string) => {
    if (!userId) return;
    const supabase = createClient();
    await supabase.from("follows").insert({
      follower_id: userId,
      following_id: targetId,
    });
    await load();
  }, [userId, load]);

  const unfollowUser = useCallback(async (followId: string) => {
    const supabase = createClient();
    await supabase.from("follows").delete().eq("id", followId);
    setFollowing((prev) => prev.filter((f) => f.id !== followId));
  }, []);

  return { following, followers, loading, refresh: load, followUser, unfollowUser };
}

/**
 * useIsFollowing(currentUserId, targetUserId) — lightweight boolean check.
 * Returns the follow row if it exists (so the caller has the id for unfollow).
 */
export function useIsFollowing(
  currentUserId: string | null,
  targetUserId: string | null
): { isFollowing: boolean; followRow: FollowRow | null; loading: boolean } {
  const [followRow, setFollowRow] = useState<FollowRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId || !targetUserId) { setLoading(false); return; }
    const supabase = createClient();
    supabase
      .from("follows")
      .select("*")
      .eq("follower_id", currentUserId)
      .eq("following_id", targetUserId)
      .maybeSingle()
      .then(({ data }) => {
        setFollowRow(data ?? null);
        setLoading(false);
      });
  }, [currentUserId, targetUserId]);

  return { isFollowing: !!followRow, followRow, loading };
}
