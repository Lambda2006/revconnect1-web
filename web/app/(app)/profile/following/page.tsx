"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/lib/hooks/useSession";
import { useFollows } from "@/lib/hooks/useFollows";

export default function FollowingPage() {
  const router = useRouter();
  const { user } = useSession();
  const { following, followers, loading, followUser, unfollowUser } = useFollows(user?.id ?? null);
  const [tab, setTab] = useState<"following" | "followers">("following");

  const list = tab === "following" ? following : followers;

  return (
    <div className="px-4 pt-4 pb-6 space-y-4">
      <button onClick={() => router.back()} className="text-brand-navy text-sm">← Back</button>
      <h1 className="text-2xl font-bold text-brand-navy">Connections</h1>

      <div className="flex border-b border-gray-200">
        {(["following", "followers"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 pb-2 text-sm font-semibold border-b-2 transition-colors ${
              tab === t ? "border-brand-red text-brand-red" : "border-transparent text-gray-400"
            }`}
          >
            {t === "following" ? `Following (${following.length})` : `Followers (${followers.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading...</div>
      ) : list.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>{tab === "following" ? "Not following anyone yet." : "No followers yet."}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((row) => {
            const profile = row.users as { display_name: string | null; avatar_url: string | null } | undefined;
            const targetId = tab === "following" ? row.following_id : row.follower_id;
            const isAlreadyFollowing = tab === "followers"
              ? following.some((f) => f.following_id === targetId)
              : false;

            return (
              <div key={row.id} className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-navy flex items-center justify-center text-white text-sm font-bold">
                    {profile?.display_name?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>
                  <p className="font-medium text-sm text-brand-navy">
                    {profile?.display_name ?? "Boater"}
                  </p>
                </div>

                {tab === "following" ? (
                  <Button size="sm" variant="ghost" onClick={() => unfollowUser(row.id)}>
                    Unfollow
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant={isAlreadyFollowing ? "secondary" : "ghost"}
                    onClick={() => !isAlreadyFollowing && followUser(targetId)}
                    disabled={isAlreadyFollowing}
                  >
                    {isAlreadyFollowing ? "Following" : "Follow Back"}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
