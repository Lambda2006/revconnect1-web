import React, { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSession } from '@/lib/hooks/useSession'
import { useFollows, followUser, unfollowUser } from '@/lib/hooks/useFollows'
import type { FollowUser } from '@/lib/hooks/useFollows'
import { colors, spacing, radius, typography } from '@/lib/theme'

type Tab = 'followers' | 'following'

export default function FollowingScreen() {
  const router = useRouter()
  const { session } = useSession()
  const userId = session?.user.id ?? null

  const [tab, setTab] = useState<Tab>('following')
  const { followers, following, followerCount, followingCount, loading, refetch } = useFollows(userId)

  const list = tab === 'followers' ? followers : following

  async function handleUnfollow(targetId: string, name: string) {
    if (!userId) return
    Alert.alert(
      `Unfollow ${name}?`,
      '',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unfollow',
          style: 'destructive',
          onPress: async () => {
            try {
              await unfollowUser(userId, targetId)
              refetch()
            } catch (err: any) {
              Alert.alert('Error', err?.message ?? 'Could not unfollow.')
            }
          },
        },
      ]
    )
  }

  async function handleFollowBack(targetId: string) {
    if (!userId) return
    try {
      await followUser(userId, targetId)
      refetch()
    } catch (err: any) {
      // Unique constraint means already following — ignore
      if (!err?.message?.includes('unique')) {
        Alert.alert('Error', err?.message ?? 'Could not follow.')
      }
    }
  }

  const isFollowing = (targetId: string) =>
    following.some((u) => u.id === targetId)

  function renderUser({ item }: { item: FollowUser }) {
    const name = item.display_name ?? 'Boater'
    const alreadyFollowing = isFollowing(item.id)

    return (
      <View style={styles.userRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>{name[0]?.toUpperCase() ?? '?'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{name}</Text>
          {item.home_marina && (
            <Text style={styles.marina}>📍 {item.home_marina}</Text>
          )}
        </View>
        {tab === 'following' ? (
          <TouchableOpacity
            style={styles.unfollowBtn}
            onPress={() => handleUnfollow(item.id, name)}
          >
            <Text style={styles.unfollowText}>Unfollow</Text>
          </TouchableOpacity>
        ) : alreadyFollowing ? (
          <View style={styles.followingBadge}>
            <Text style={styles.followingBadgeText}>Following</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.followBackBtn}
            onPress={() => handleFollowBack(item.id)}
          >
            <Text style={styles.followBackText}>Follow Back</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backBtn}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Social</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, tab === 'following' && styles.tabActive]}
          onPress={() => setTab('following')}
        >
          <Text style={[styles.tabText, tab === 'following' && styles.tabTextActive]}>
            Following {followingCount > 0 ? `(${followingCount})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'followers' && styles.tabActive]}
          onPress={() => setTab('followers')}
        >
          <Text style={[styles.tabText, tab === 'followers' && styles.tabTextActive]}>
            Followers {followerCount > 0 ? `(${followerCount})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color={colors.navy} />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {tab === 'following'
                ? 'You aren\'t following anyone yet.\nFind boaters at meetups!'
                : 'No followers yet.'}
            </Text>
          }
          renderItem={renderUser}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { fontSize: typography.md, color: colors.navy, fontWeight: '600' },
  headerTitle: { fontSize: typography.md, fontWeight: '700', color: colors.textNavy },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.navy },
  tabText: { fontSize: typography.base, color: colors.textTertiary, fontWeight: '600' },
  tabTextActive: { color: colors.navy },
  list: { paddingVertical: spacing.sm },
  empty: {
    textAlign: 'center',
    color: colors.textTertiary,
    fontSize: typography.sm,
    marginTop: 60,
    lineHeight: 22,
    paddingHorizontal: 32,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { color: colors.white, fontSize: typography.md, fontWeight: '700' },
  userName: { fontSize: typography.base, fontWeight: '600', color: colors.textPrimary },
  marina: { fontSize: typography.xs, color: colors.textTertiary, marginTop: 2 },
  unfollowBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  unfollowText: { fontSize: typography.sm, color: colors.textSecondary, fontWeight: '600' },
  followBackBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.navy,
  },
  followBackText: { fontSize: typography.sm, color: colors.white, fontWeight: '700' },
  followingBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  followingBadgeText: { fontSize: typography.sm, color: colors.textSecondary, fontWeight: '600' },
})
