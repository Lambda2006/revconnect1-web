"use client";

import React, { useState } from "react";
import type { Promotion } from "@/lib/hooks/usePromos";

interface PromoCardProps {
  promo: Promotion;
  onRedeem: (promoId: string) => Promise<void>;
}

export function PromoCard({ promo, onRedeem }: PromoCardProps) {
  const [redeeming, setRedeeming] = useState(false);
  const [redeemed, setRedeemed] = useState(false);

  const handleRedeem = async () => {
    setRedeeming(true);
    await onRedeem(promo.id);
    setRedeeming(false);
    setRedeemed(true);
  };

  const discountLabel =
    promo.discount_type === "percentage"
      ? `${promo.discount_value}% off`
      : promo.discount_type === "flat"
      ? `$${promo.discount_value} off`
      : "Free item";

  return (
    <div className="bg-gradient-to-r from-brand-navy to-[#1a3a6b] text-white rounded-xl p-4">
      <div className="flex justify-between items-start gap-2">
        <div>
          <p className="text-xs font-semibold text-blue-300 uppercase tracking-wide">Nearby Deal</p>
          <h4 className="font-bold mt-0.5">{promo.title}</h4>
          <p className="text-sm text-blue-100 mt-0.5">{discountLabel}</p>
        </div>
        {promo.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={promo.image_url} alt={promo.title} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
        )}
      </div>
      {promo.description && (
        <p className="text-sm text-blue-100 mt-2 line-clamp-2">{promo.description}</p>
      )}
      <button
        type="button"
        disabled={redeeming || redeemed}
        onClick={handleRedeem}
        className="mt-3 w-full bg-brand-red text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-60 hover:bg-[#a80e26] transition-colors"
      >
        {redeemed ? "✓ Redeemed" : redeeming ? "..." : "Redeem Offer"}
      </button>
    </div>
  );
}
