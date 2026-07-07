"use client";

import { useEffect, useState, useCallback } from "react";

type Subscription = {
  plan: string;
  status: string;
  trial_ends_at: string | null;
};

type User = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  banned: boolean;
  subscription: Subscription | null;
  is_admin: boolean;
  business_access: boolean;
};

type Business = {
  id: string;
  business_name: string;
  is_verified: boolean;
  owner_user_id: string | null;
};

/** Maps raw status+plan to the hub-facing label and display colour. */
function hubLabel(sub: Subscription | null): { label: string; colour: string } {
  if (!sub) return { label: "None", colour: "bg-gray-100 text-gray-500" };
  if (sub.status === "trialing") return { label: "Free Trial", colour: "bg-blue-100 text-blue-700" };
  if (sub.status === "active" && sub.plan === "app_and_agent") return { label: "Subscribed", colour: "bg-purple-100 text-purple-700" };
  if (sub.status === "active") return { label: "Connect", colour: "bg-green-100 text-green-700" };
  if (sub.status === "past_due") return { label: "Past Due", colour: "bg-yellow-100 text-yellow-700" };
  if (sub.status === "canceled") return { label: "Canceled", colour: "bg-red-100 text-red-700" };
  return { label: sub.status, colour: "bg-gray-100 text-gray-500" };
}

/** What to show inside the edit dropdown. */
const HUB_PLANS: { value: string; label: string; description: string }[] = [
  { value: "free_trial",  label: "Free Trial",  description: "App + Agent access (trial period)" },
  { value: "connect",     label: "Connect",     description: "App access only (paid)" },
  { value: "subscribed",  label: "Subscribed",  description: "App + Agent access (paid)" },
];

export default function AccountsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);
  const [editSub, setEditSub] = useState<string | null>(null); // hub plan key
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [assignPick, setAssignPick] = useState<string>(""); // selected business id in the assign dropdown

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/hub/accounts");
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setUsers(data.users);
      setBusinesses(data.businesses ?? []);
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

  /** Derive the current hub plan key from raw sub data. */
  function currentHubPlan(sub: Subscription | null): string {
    if (!sub) return "free_trial";
    if (sub.status === "trialing") return "free_trial";
    if (sub.status === "active" && sub.plan === "app_and_agent") return "subscribed";
    return "connect";
  }

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
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Subscription</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Flags</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const { label, colour } = hubLabel(u.subscription);
                return (
                  <>
                    <tr
                      key={u.id}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setExpanded(expanded === u.id ? null : u.id);
                        setEditSub(null);
                        setAssignPick("");
                      }}
                    >
                      <td className="px-4 py-3 text-[#0A2240] font-medium">{u.email}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${colour}`}>
                          {label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          {u.is_admin && (
                            <span className="text-xs bg-[#0A2240] text-white px-2 py-0.5 rounded font-medium">
                              Admin
                            </span>
                          )}
                          {u.business_access && (
                            <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded font-medium">
                              Business
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
                        <td colSpan={5} className="px-6 py-4">
                          <div className="space-y-4">

                            {/* Subscription editor */}
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                Subscription
                              </p>
                              {editSub !== null ? (
                                <div className="space-y-2">
                                  {HUB_PLANS.map((p) => (
                                    <label
                                      key={p.value}
                                      className={`flex items-start gap-3 p-3 rounded border cursor-pointer ${
                                        editSub === p.value
                                          ? "border-[#0A2240] bg-[#0A2240]/5"
                                          : "border-gray-200 hover:border-gray-300"
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name="hub-plan"
                                        value={p.value}
                                        checked={editSub === p.value}
                                        onChange={() => setEditSub(p.value)}
                                        className="mt-0.5"
                                      />
                                      <div>
                                        <p className="text-sm font-medium text-[#0A2240]">{p.label}</p>
                                        <p className="text-xs text-gray-500">{p.description}</p>
                                      </div>
                                    </label>
                                  ))}
                                  <div className="flex gap-2 pt-1">
                                    <button
                                      onClick={() => doAction(u.id, "update_subscription", { plan: editSub! })}
                                      disabled={!!acting}
                                      className="bg-[#0A2240] text-white text-sm px-4 py-1.5 rounded hover:bg-[#0A2240]/80 disabled:opacity-50"
                                    >
                                      {busy(u.id, "update_subscription") ? "Saving…" : "Save"}
                                    </button>
                                    <button
                                      onClick={() => setEditSub(null)}
                                      className="text-sm text-gray-500 hover:text-gray-700 px-2"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-3">
                                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${colour}`}>
                                    {label}
                                  </span>
                                  <button
                                    onClick={() => setEditSub(currentHubPlan(u.subscription))}
                                    className="text-sm text-[#0A2240] underline"
                                  >
                                    Change
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

                            {/* Business access */}
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                Business Access
                              </p>
                              <div className="flex items-center gap-3">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                    u.business_access
                                      ? "bg-teal-100 text-teal-700"
                                      : "bg-gray-100 text-gray-500"
                                  }`}
                                >
                                  {u.business_access ? "Granted" : "No access"}
                                </span>
                                {u.business_access ? (
                                  <button
                                    onClick={() => { if (confirm("Revoke /business access for " + u.email + "?")) doAction(u.id, "revoke_business"); }}
                                    disabled={!!acting}
                                    className="text-sm border border-gray-300 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-100 disabled:opacity-50"
                                  >
                                    {busy(u.id, "revoke_business") ? "Revoking…" : "Revoke Access"}
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => doAction(u.id, "grant_business")}
                                    disabled={!!acting}
                                    className="text-sm border border-teal-600/40 text-teal-700 px-3 py-1.5 rounded hover:bg-teal-50 disabled:opacity-50"
                                  >
                                    {busy(u.id, "grant_business") ? "Granting…" : "Grant Access"}
                                  </button>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mt-1.5">
                                Controls access to the /business section, including the marina slip portal.
                              </p>

                              {/* Marina assignment */}
                              {(() => {
                                const linked = businesses.find((b) => b.owner_user_id === u.id) ?? null;
                                const assignable = businesses.filter(
                                  (b) => b.owner_user_id === null || b.owner_user_id === u.id
                                );
                                return (
                                  <div className="mt-3">
                                    <p className="text-xs font-medium text-gray-500 mb-1">Linked marina</p>
                                    {linked ? (
                                      <div className="flex items-center gap-3">
                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#0A2240] bg-[#0A2240]/5 border border-[#0A2240]/10 px-2 py-1 rounded">
                                          {linked.business_name}
                                          {linked.is_verified && <span className="text-blue-500">✓</span>}
                                        </span>
                                        <button
                                          onClick={() => { if (confirm("Unlink " + linked.business_name + " from " + u.email + "?")) doAction(u.id, "unassign_business", { businessId: linked.id }); }}
                                          disabled={!!acting}
                                          className="text-sm border border-gray-300 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-100 disabled:opacity-50"
                                        >
                                          {busy(u.id, "unassign_business") ? "Unlinking…" : "Unlink"}
                                        </button>
                                      </div>
                                    ) : assignable.length === 0 ? (
                                      <p className="text-xs text-gray-400">
                                        No unassigned businesses available. Create one in Businesses first.
                                      </p>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <select
                                          value={assignPick}
                                          onChange={(e) => setAssignPick(e.target.value)}
                                          className="text-sm border border-gray-300 rounded px-2 py-1.5 text-[#0A2240] focus:outline-none focus:ring-2 focus:ring-[#0A2240]/30"
                                        >
                                          <option value="">Select a business…</option>
                                          {assignable.map((b) => (
                                            <option key={b.id} value={b.id}>
                                              {b.business_name}{b.is_verified ? " ✓" : ""}
                                            </option>
                                          ))}
                                        </select>
                                        <button
                                          onClick={() => doAction(u.id, "assign_business", { businessId: assignPick })}
                                          disabled={!!acting || !assignPick}
                                          className="text-sm border border-teal-600/40 text-teal-700 px-3 py-1.5 rounded hover:bg-teal-50 disabled:opacity-50"
                                        >
                                          {busy(u.id, "assign_business") ? "Linking…" : "Link & grant"}
                                        </button>
                                      </div>
                                    )}
                                    <p className="text-xs text-gray-400 mt-1.5">
                                      Linking a marina also grants business access automatically.
                                    </p>
                                  </div>
                                );
                              })()}
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
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
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
