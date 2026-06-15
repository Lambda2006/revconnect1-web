import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { UserRow } from '@/types'

export type FollowUser = Pick<UserRow, 'id' | 'display_name' | 'avatar_url' | 'home_marina'>

type FollowsState = {
  followers: FollowUser[]
  following: FollowUser[]
  followerCount: number
  followingCount: number
  loading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Loads the followers and following lists for a given user.
 * Uses the `follows` table (follower_id → following_id).
 */
export function useFollows(userId: string | null): FollowsState {
  const [followers, setFollowers] = useState<FollowUser[]>([])
  const [following, setFollowing] = useState<FollowUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!userId) {
      setFollowers([])
      setFollowing([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)

    const [followersRes, followingRes] = await Promise.all([
      // People who follow userId
      supabase
        .from('follows')
        .select('users!follower_id ( id, display_name, avatar_url, home_marina )')
        .eq('following_id', userId),
      // People userId follows
      supabase
        .from('follows')
        .select('users!following_id ( id, display_name, avatar_url, home_marina )')
        .eq('follower_id', userId),
    ])

    if (followersRes.error || followingRes.error) {
      setError((followersRes.error ?? followingRes.error)!.message)
    } else {
      setFollowers(
        ((followersRes.data ?? []) as any[])
          .map((r) => r.users)
          .filter(Boolean) as FollowUser[]
      )
      setFollowing(
        ((followingRes.data ?? []) as any[])
          .map((r) => r.users)
          .filter(Boolean) as FollowUser[]
      )
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetch()
  }, [fetch])

  return {
    followers,
    following,
    followerCount: followers.length,
    followingCount: following.length,
    loading,
    error,
    refetch: fetch,
  }
}

/**
 * Returns whether currentUserId is following targetUserId.
 * Lightweight — used on profile cards and meetup detail.
 */
export function useIsFollowing(
  currentUserId: string | null,
  targetUserId: string | null
): { isFollowing: boolean; loading: boolean } {
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
      setIsFollowing(false)
      setLoading(false)
      return
    }
    supabase
      .from('follows')
      .select('id')
      .eq('follower_id', currentUserId)
      .eq('following_id', targetUserId)
      .maybeSingle()
      .then(({ data }) => {
        setIsFollowing(!!data)
        setLoading(false)
      })
  }, [currentUserId, targetUserId])

  return { isFollowing, loading }
}

// =====================
// MUTATIONS
// =====================

export async function followUser(
  followerId: string,
  followingId: string
): Promise<void> {
  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: followerId, following_id: followingId })
  if (error) throw error
}

export async function unfollowUser(
  followerId: string,
  followingId: string
): Promise<void> {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
  if (error) throw error
}
