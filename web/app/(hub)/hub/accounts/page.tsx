"use client";

import { useEffect, useState, useCallback } from "react";

type Subscription = {
  plan: string;
  status: string;
  trial_end: string | null;
};

type User = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  banned: boolean;
  subscription: Subscription | null;
  is_admin: boolean;
};

const PLANS = ["free", "starter", "pro", "enterprise"];
const SUB_STATUSES = ["active", "trialing", "past_due", "canceled", "paused"];

export default function AccountsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null); // userId:action
  const [editSub, setEditSub] = useState<{ plan: string; status: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/hub/accounts");
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setUsers(data.users);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function doAction(userId: string, action: string, extra?: Record<string, string>) {
    setActing(`${userId}:${action}`);
    try {
      const res = await fetch(`/api/hub/accounts/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Action failed");
      await load();
      if (action === "delete") setExpanded(null);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActing(null);
      setEditSub(null);
    }
  }

  const busy = (userId: string, action: string) => acting === `${userId}:${action}`;

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#0A2240]">Accounts</h1>
        <button
          onClick={load}
          className="text-sm text-[#0A2240] border border-[#0A2240]/30 rounded px-3 py-1.5 hover:bg-[#0A2240]/5"
        >
          Refresh
        </button>
      </div>

      {loading && <p className="text-gray-500">Loading users…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Joined</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Plan</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Flags</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <>
                  <tr
                    key={u.id}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setExpanded(expanded === u.id ? null : u.id);
                      setEditSub(null);
                    }}
                  >
                    <td className="px-4 py-3 text-[#0A2240] font-medium">{u.email}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-700 capitalize">
                      {u.subscription?.plan ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {u.subscription ? (
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                            u.subscription.status === "active"
                              ? "bg-green-100 text-green-700"
                              : u.subscription.status === "trialing"
                              ? "bg-blue-100 text-blue-700"
                              : u.subscription.status === "past_due"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {u.subscription.status}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">none</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {u.is_admin && (
                          <span className="text-xs bg-[#0A2240] text-white px-2 py-0.5 rounded font-medium">
                            Admin
                          </span>
                        )}
                        {u.banned && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">
                            Suspended
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400">
                      {expanded === u.id ? "▲" : "▼"}
                    </td>
                  </tr>

                  {expanded === u.id && (
                    <tr key={`${u.id}-detail`} className="bg-gray-50 border-b border-gray-200">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="space-y-4">

                          {/* Subscription editor */}
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                              Subscription
                            </p>
                            {editSub ? (
                              <div className="flex items-center gap-3 flex-wrap">
                                <select
                                  value={editSub.plan}
                                  onChange={(e) => setEditSub({ ...editSub, plan: e.target.value })}
                                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                                >
                                  {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
                                </select>
                                <select
                                  value={editSub.status}
                                  onChange={(e) => setEditSub({ ...editSub, status: e.target.value })}
                                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                                >
                                  {SUB_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <button
                                  onClick={() => doAction(u.id, "update_subscription", { plan: editSub.plan, status: editSub.status })}
                                  disabled={!!acting}
                                  className="bg-[#0A2240] text-white text-sm px-3 py-1 rounded hover:bg-[#0A2240]/80 disabled:opacity-50"
                                >
                                  {busy(u.id, "update_subscription") ? "Saving…" : "Save"}
                                </button>
                                <button
                                  onClick={() => setEditSub(null)}
                                  className="text-sm text-gray-500 hover:text-gray-700"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-700">
                                  {u.subscription
                                    ? `${u.subscription.plan} / ${u.subscription.status}`
                                    : "No subscription"}
                                </span>
                                <button
                                  onClick={() =>
                                    setEditSub({
                                      plan: u.subscription?.plan ?? "free",
                                      status: u.subscription?.status ?? "active",
                                    })
                                  }
                                  className="text-sm text-[#0A2240] underline"
                                >
                                  Edit
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Admin controls */}
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                              Admin Access
                            </p>
                            <div className="flex gap-2">
                              {u.is_admin ? (
                                <button
                                  onClick={() => { if (confirm("Remove admin access for " + u.email + "?")) doAction(u.id, "demote_admin"); }}
                                  disabled={!!acting}
                                  className="text-sm border border-gray-300 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-100 disabled:opacity-50"
                                >
                                  {busy(u.id, "demote_admin") ? "Removing…" : "Remove Admin"}
                                </button>
                              ) : (
                                <button
                                  onClick={() => doAction(u.id, "promote_admin")}
                                  disabled={!!acting}
                                  className="text-sm border border-[#0A2240]/40 text-[#0A2240] px-3 py-1.5 rounded hover:bg-[#0A2240]/5 disabled:opacity-50"
                                >
                                  {busy(u.id, "promote_admin") ? "Promoting…" : "Make Admin"}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Account actions */}
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                              Account
                            </p>
                            <div className="flex gap-2 flex-wrap">
                              {u.banned ? (
                                <button
                                  onClick={() => doAction(u.id, "unsuspend")}
                                  disabled={!!acting}
                                  className="text-sm border border-green-600 text-green-700 px-3 py-1.5 rounded hover:bg-green-50 disabled:opacity-50"
                                >
                                  {busy(u.id, "unsuspend") ? "Unsuspending…" : "Unsuspend"}
                                </button>
                              ) : (
                                <button
                                  onClick={() => { if (confirm("Suspend " + u.email + "?")) doAction(u.id, "suspend"); }}
                                  disabled={!!acting}
                                  className="text-sm border border-yellow-600 text-yellow-700 px-3 py-1.5 rounded hover:bg-yellow-50 disabled:opacity-50"
                                >
                                  {busy(u.id, "suspend") ? "Suspending…" : "Suspend"}
                                </button>
                              )}
                              <button
                                onClick={() => { if (confirm("Permanently delete " + u.email + "? This cannot be undone.")) doAction(u.id, "delete"); }}
                                disabled={!!acting}
                                className="text-sm border border-red-600 text-red-700 px-3 py-1.5 rounded hover:bg-red-50 disabled:opacity-50"
                              >
                                {busy(u.id, "delete") ? "Deleting…" : "Delete Account"}
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-gray-400">
                            User ID: {u.id} · Last sign-in:{" "}
                            {u.last_sign_in_at
                              ? new Date(u.last_sign_in_at).toLocaleString()
                              : "never"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
