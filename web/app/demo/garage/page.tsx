import React from "react";
import Link from "next/link";
import { DEMO_GARAGE, DEMO_USER } from "@/demo/lib/data";

export default function DemoGaragePage() {
  const boat = DEMO_GARAGE[0];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500">Welcome back, {DEMO_USER.name.split(" ")[0]}</p>
        <h1 className="text-2xl font-bold text-brand-navy">Your Garage</h1>
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-b from-[#dcefff] to-[#a9d6f5]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={boat.photo} alt={`${boat.make} ${boat.model}`} className="w-full h-56 object-cover" />
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-xl font-bold text-brand-navy">
                {boat.year} {boat.make} {boat.model}
              </h2>
              <p className="text-gray-500">
                &ldquo;{boat.nickname}&rdquo; · {boat.homePort}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-brand-navy">{boat.engineHours}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">engine hours</div>
            </div>
          </div>

          <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="rounded-lg bg-gray-50 p-3">
              <dt className="text-gray-500 text-xs">Engines</dt>
              <dd className="font-semibold text-brand-navy">{boat.engineType}</dd>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <dt className="text-gray-500 text-xs">Length</dt>
              <dd className="font-semibold text-brand-navy">{boat.lengthFt} ft</dd>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <dt className="text-gray-500 text-xs">Home port</dt>
              <dd className="font-semibold text-brand-navy">{boat.homePort}</dd>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <dt className="text-gray-500 text-xs">HIN</dt>
              <dd className="font-semibold text-brand-navy">{boat.hullId}</dd>
            </div>
          </dl>

          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <span className="font-semibold">Next service due:</span> {boat.nextServiceDue}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link
              href={`/demo/garage/${boat.id}/knowledge`}
              className="rounded-xl border border-gray-200 bg-white p-4 hover:border-brand-navy transition-colors"
            >
              <div className="text-lg">📚</div>
              <div className="font-semibold text-brand-navy mt-1">Knowledge Base</div>
              <p className="text-sm text-gray-500">Model-specific service intervals with the right parts.</p>
            </Link>
            <Link
              href={`/demo/garage/${boat.id}/diagnose`}
              className="rounded-xl border border-gray-200 bg-white p-4 hover:border-brand-navy transition-colors"
            >
              <div className="text-lg">🧭</div>
              <div className="font-semibold text-brand-navy mt-1">Run a Diagnosis</div>
              <p className="text-sm text-gray-500">Guided questionnaire for a symptom you&apos;re seeing.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
