"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PromoCard } from "@/components/meetups/PromoCard";
import { useSession } from "@/lib/hooks/useSession";
import { usePromos } from "@/lib/hooks/usePromos";

type Business = {
  id: string;
  business_name: string;
  category: string;
  description: string | null;
  website_url: string | null;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
  is_verified: boolean;
};

export default function BusinessProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useSession();
  const { promos, redeemPromo } = usePromos(user?.id ?? null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", id)
        .limit(1);
      setBusiness((data as Business[] | null)?.[0] ?? null);
      setLoading(false);
    }
    load();
  }, [id]);

  const businessPromos = promos.filter((p) => p.business_id === id);

  if (loading) return <div className="flex justify-center py-16 text-gray-400">Loading...</div>;
  if (!business) return <div className="flex justify-center py-16 text-gray-400">Business not found.</div>;

  return (
    <div className="px-4 pt-4 pb-6 space-y-5">
      <button onClick={() => router.back()} className="text-brand-navy text-sm">Back</button>

      <div className="flex items-center gap-4">
        {business.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={business.logo_url} alt={business.business_name} className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-brand-navy flex items-center justify-center text-white text-2xl">&#9875;</div>
        )}
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-bold text-brand-navy">{business.business_name}</h1>
            {business.is_verified && <span className="text-blue-500 text-sm">&#10003;</span>}
          </div>
          <p className="text-sm text-gray-500 capitalize">{business.category.replace(/_/g, " ")}</p>
        </div>
      </div>

      {business.description && (
        <p className="text-sm text-gray-700 leading-relaxed">{business.description}</p>
      )}

      <div className="space-y-2">
        {business.address && <p className="text-sm text-gray-600">{business.address}</p>}
        {business.phone && (
          <a href={`tel:${business.phone}`} className="block text-sm text-brand-navy underline">
            {business.phone}
          </a>
        )}
        {business.website_url && (
          <a href={business.website_url} target="_blank" rel="noopener noreferrer" className="block text-sm text-brand-navy underline">
            {business.website_url.replace(/^https?:\/\//, "")}
          </a>
        )}
      </div>

      {businessPromos.length > 0 && (
        <div>
          <h2 className="font-bold text-brand-navy mb-3">Active Promotions</h2>
          <div className="space-y-3">
            {businessPromos.map((p) => (
              <PromoCard key={p.id} promo={p} onRedeem={redeemPromo} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
