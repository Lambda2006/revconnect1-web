"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/lib/hooks/useSession";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, profile } = useSession();
  const [form, setForm] = useState({ display_name: "", home_marina: "", bio: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name ?? "",
        home_marina: profile.home_marina ?? "",
        bio: profile.bio ?? "",
      });
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("users")
      .update({ ...form })
      .eq("id", user.id);
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.push("/profile");
  };

  return (
    <div className="px-4 pt-4 pb-6 space-y-5">
      <button onClick={() => router.back()} className="text-brand-navy text-sm">← Back</button>
      <h1 className="text-2xl font-bold text-brand-navy">Edit Profile</h1>

      <form onSubmit={handleSave} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Display Name</label>
          <input
            value={form.display_name}
            onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Home Marina</label>
          <input
            placeholder="e.g. Lake Travis Marina, TX"
            value={form.home_marina}
            onChange={(e) => setForm((f) => ({ ...f, home_marina: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Bio</label>
          <textarea
            rows={3}
            placeholder="Tell other boaters about yourself"
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy resize-none"
          />
        </div>
        {error && <p className="text-brand-red text-sm">{error}</p>}
        <Button type="submit" loading={loading} className="w-full">Save Profile</Button>
      </form>
    </div>
  );
}
