"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?type=recovery`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 text-center">
        <div className="text-5xl mb-4">📧</div>
        <h2 className="text-xl font-bold text-brand-navy">Check your email</h2>
        <p className="text-gray-500 text-sm mt-2 max-w-xs">
          We sent a password reset link to <strong>{email}</strong>.
        </p>
        <Link href="/login" className="mt-6 text-sm text-brand-navy underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="text-4xl mb-2">🔑</div>
          <h1 className="text-2xl font-bold text-brand-navy">Reset password</h1>
          <p className="text-gray-500 text-sm mt-1">
            Enter your email and we&apos;ll send a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
          />
          {error && <p className="text-brand-red text-sm">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">
            Send Reset Link
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500">
          <Link href="/login" className="text-brand-navy underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
