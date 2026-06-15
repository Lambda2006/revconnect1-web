"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";

interface AgentDisclaimerProps {
  onAccept: () => void;
}

export function AgentDisclaimer({ onAccept }: AgentDisclaimerProps) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 space-y-4">
        <div className="text-2xl text-center">⚓</div>
        <h2 className="text-lg font-bold text-brand-navy text-center">
          AI Mechanic Disclaimer
        </h2>
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            The VictoryRevConnect AI Mechanic provides general guidance based on
            manufacturer documentation for your specific boat model.
          </p>
          <p>
            <strong>VictoryRevConnect is not liable for any outcomes</strong> resulting
            from following this guidance. Marine systems can be dangerous.
          </p>
          <p>
            For fuel, electrical, and steering procedures, always consult a
            certified marine technician.
          </p>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="w-5 h-5 accent-brand-navy"
          />
          <span className="text-sm text-gray-700">
            I understand and accept this disclaimer
          </span>
        </label>
        <Button
          variant="primary"
          disabled={!checked}
          onClick={onAccept}
          className="w-full"
        >
          Start Session
        </Button>
      </div>
    </div>
  );
}
