"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useGarage } from "@/lib/hooks/useGarage";
import { useSession } from "@/lib/hooks/useSession";
import { getKnowledgeBase } from "@/lib/knowledge/content";
import { parseStateFromMarina } from "@/lib/knowledge/stateParser";
import { FEDERAL_REQUIREMENTS } from "@/lib/knowledge/federalRequirements";
import { getStateRequirements } from "@/lib/knowledge/stateRequirements";
import type {
  ModelKnowledgeBase,
  FaultCode,
  BeepIndicator,
  ServiceInterval,
  ChecklistItem,
  CommonIssue,
  Severity,
  Difficulty,
} from "@/lib/knowledge/types";
import type { FederalRequirementCategory } from "@/lib/knowledge/federalRequirements";

// ── Shared helpers ────────────────────────────────────────────────────────────

function severityBadge(severity: Severity) {
  const map: Record<Severity, string> = {
    info: "bg-blue-100 text-blue-700",
    warning: "bg-amber-100 text-amber-700",
    critical: "bg-red-100 text-red-700",
  };
  const label: Record<Severity, string> = {
    info: "Info",
    warning: "Warning",
    critical: "Critical",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[severity]}`}>
      {label[severity]}
    </span>
  );
}

function difficultyBadge(difficulty: Difficulty) {
  const map: Record<Difficulty, string> = {
    DIY: "bg-green-100 text-green-700",
    Professional: "bg-purple-100 text-purple-700",
    Either: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[difficulty]}`}>
      {difficulty}
    </span>
  );
}

// ── Tab: Engine Reference ─────────────────────────────────────────────────────

function EngineReferenceTab({ kb }: { kb: ModelKnowledgeBase }) {
  const [search, setSearch] = useState("");
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const [expandedBeep, setExpandedBeep] = useState<number | null>(null);

  const filteredCodes = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return kb.engineReference.faultCodes;
    return kb.engineReference.faultCodes.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.possibleCauses?.some((cause) => cause.toLowerCase().includes(q))
    );
  }, [kb.engineReference.faultCodes, search]);

  return (
    <div className="space-y-6">
      {/* Engine info banner */}
      <div className="bg-brand-navy/5 border border-brand-navy/20 rounded-xl px-4 py-3">
        <p className="text-sm font-semibold text-brand-navy">{kb.engineDisplay}</p>
        {kb.engineReference.systemNote && (
          <p className="text-xs text-gray-500 mt-1">{kb.engineReference.systemNote}</p>
        )}
      </div>

      {/* Fault Codes */}
      <div>
        <h3 className="text-base font-bold text-brand-navy mb-3">Fault Codes</h3>
        <div className="relative mb-3">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search codes, descriptions, or symptoms…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
          />
        </div>

        {filteredCodes.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No codes match &ldquo;{search}&rdquo;</p>
        ) : (
          <div className="space-y-2">
            {filteredCodes.map((code) => (
              <FaultCodeRow
                key={code.code}
                code={code}
                expanded={expandedCode === code.code}
                onToggle={() => setExpandedCode(expandedCode === code.code ? null : code.code)}
              />
            ))}
          </div>
        )}
        {search && filteredCodes.length > 0 && (
          <p className="text-xs text-gray-400 mt-2">{filteredCodes.length} of {kb.engineReference.faultCodes.length} codes shown</p>
        )}
      </div>

      {/* Beep Indicators */}
      <div>
        <h3 className="text-base font-bold text-brand-navy mb-3">Alarm / Beep Indicators</h3>
        <div className="space-y-2">
          {kb.engineReference.beepIndicators.map((indicator, i) => (
            <BeepIndicatorRow
              key={i}
              indicator={indicator}
              expanded={expandedBeep === i}
              onToggle={() => setExpandedBeep(expandedBeep === i ? null : i)}
            />
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 pb-2">
        ⚠️ Fault codes are reference only. Always consult your service manual and a qualified marine mechanic for diagnosis and repair.
      </p>
    </div>
  );
}

function FaultCodeRow({
  code,
  expanded,
  onToggle,
}: {
  code: FaultCode;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-mono text-sm font-bold text-brand-navy shrink-0">{code.code}</span>
          <span className="text-sm text-gray-700 truncate">{code.description}</span>
        </div>
        <div className="flex items-center gap-2 ml-3 shrink-0">
          {severityBadge(code.severity)}
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50 space-y-2 pt-3">
          {code.possibleCauses && code.possibleCauses.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Possible Causes</p>
              <ul className="space-y-1">
                {code.possibleCauses.map((cause, i) => (
                  <li key={i} className="text-sm text-gray-700 flex gap-2">
                    <span className="text-gray-400 shrink-0">•</span>
                    <span>{cause}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {code.action && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Recommended Action</p>
              <p className="text-sm text-gray-700">{code.action}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BeepIndicatorRow({
  indicator,
  expanded,
  onToggle,
}: {
  indicator: BeepIndicator;
  expanded: boolean;
  onToggle: () => void;
}) {
  const severityIcon: Record<Severity, string> = {
    info: "ℹ️",
    warning: "⚠️",
    critical: "🚨",
  };

  return (
    <div className={`border rounded-xl overflow-hidden ${indicator.severity === "critical" ? "border-red-200" : "border-gray-200"}`}>
      <button
        onClick={onToggle}
        className={`w-full flex items-start justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors ${indicator.severity === "critical" ? "bg-red-50/50" : ""}`}
      >
        <div className="flex items-start gap-3 min-w-0">
          <span className="text-base shrink-0 mt-0.5">{severityIcon[indicator.severity]}</span>
          <div>
            <p className="text-sm font-semibold text-gray-800">{indicator.pattern}</p>
            <p className="text-sm text-gray-600 mt-0.5">{indicator.meaning}</p>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 ml-3 transition-transform shrink-0 mt-1 ${expanded ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && indicator.action && (
        <div className="px-4 pb-4 pt-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Action</p>
          <p className="text-sm text-gray-700">{indicator.action}</p>
        </div>
      )}
    </div>
  );
}

// ── Tab: Safety & Legal ───────────────────────────────────────────────────────

function SafetyLegalTab({ homeMarina }: { homeMarina: string | null | undefined }) {
  const parsedState = useMemo(() => parseStateFromMarina(homeMarina), [homeMarina]);
  const stateReqs = parsedState ? getStateRequirements(parsedState.abbreviation) : null;
  const [expandedFedCat, setExpandedFedCat] = useState<string | null>(FEDERAL_REQUIREMENTS[0]?.category ?? null);

  return (
    <div className="space-y-6">
      {/* Federal Requirements */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🇺🇸</span>
          <h3 className="text-base font-bold text-brand-navy">Federal Requirements (All US Vessels)</h3>
        </div>
        <div className="space-y-2">
          {FEDERAL_REQUIREMENTS.map((cat: FederalRequirementCategory) => (
            <FederalCategoryAccordion
              key={cat.category}
              cat={cat}
              expanded={expandedFedCat === cat.category}
              onToggle={() =>
                setExpandedFedCat(expandedFedCat === cat.category ? null : cat.category)
              }
            />
          ))}
        </div>
      </div>

      {/* State Requirements */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📍</span>
          <h3 className="text-base font-bold text-brand-navy">State Requirements</h3>
        </div>

        {!parsedState ? (
          <div className="border border-dashed border-gray-300 rounded-xl p-5 text-center">
            <p className="text-2xl mb-2">📍</p>
            <p className="text-sm font-semibold text-gray-700 mb-1">No home marina state detected</p>
            <p className="text-xs text-gray-500 mb-3">
              Add your home marina (e.g. &ldquo;Lake Travis, TX&rdquo;) in your profile to see state-specific requirements.
            </p>
            <Link
              href="/profile/edit"
              className="inline-block text-sm font-semibold text-brand-navy underline"
            >
              Update Profile →
            </Link>
          </div>
        ) : !stateReqs ? (
          <div className="border border-dashed border-gray-300 rounded-xl p-5 text-center">
            <p className="text-sm text-gray-600">
              State detected: <strong>{parsedState.name}</strong>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Detailed requirements for {parsedState.name} are being added. Check your state boating agency&apos;s website for current rules.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="bg-brand-navy/5 rounded-xl px-4 py-3 mb-4">
              <p className="text-sm font-semibold text-brand-navy">
                {stateReqs.state} Requirements
              </p>
              {stateReqs.registrationInfo && (
                <p className="text-xs text-gray-500 mt-0.5">{stateReqs.registrationInfo}</p>
              )}
              {stateReqs.resourceUrl && (
                <a
                  href={stateReqs.resourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand-navy underline mt-1 inline-block"
                >
                  {stateReqs.state} Boating Agency ↗
                </a>
              )}
            </div>
            {stateReqs.boaterEducationInfo && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-2">
                <p className="text-xs font-semibold text-amber-700 mb-1">Boater Education</p>
                <p className="text-xs text-amber-800">{stateReqs.boaterEducationInfo}</p>
              </div>
            )}
            <div className="space-y-2">
              {stateReqs.requirements.map((req) => (
                <div
                  key={req.id}
                  className="border border-gray-200 rounded-xl px-4 py-3 flex gap-3"
                >
                  <span className="mt-0.5 shrink-0">
                    {req.required ? (
                      <span className="text-red-500 font-bold text-base">✗</span>
                    ) : (
                      <span className="text-green-600 font-bold text-base">✓</span>
                    )}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{req.label}</p>
                    {req.details && (
                      <p className="text-xs text-gray-500 mt-0.5">{req.details}</p>
                    )}
                    {req.required && (
                      <span className="inline-block mt-1 text-xs font-semibold text-white bg-red-500 rounded-full px-2 py-0.5">
                        Required by Law
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 pb-2">
        Regulations change. Always verify current requirements with your state boating agency before going on the water.
      </p>
    </div>
  );
}

function FederalCategoryAccordion({
  cat,
  expanded,
  onToggle,
}: {
  cat: FederalRequirementCategory;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <span>{cat.icon}</span>
          <span className="text-sm font-semibold text-gray-800">{cat.category}</span>
          <span className="text-xs text-gray-400">({cat.items.length})</span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="border-t border-gray-100 divide-y divide-gray-100">
          {cat.items.map((item) => (
            <div key={item.id} className="px-4 py-3 flex gap-3">
              <span className="mt-0.5 shrink-0 text-sm">
                {item.required ? "⚠️" : "✅"}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-800">{item.label}</p>
                {item.details && (
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.details}</p>
                )}
                {item.required ? (
                  <span className="inline-block mt-1 text-xs font-semibold text-white bg-red-500 rounded-full px-2 py-0.5">Required</span>
                ) : (
                  <span className="inline-block mt-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full px-2 py-0.5">Recommended</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab: Maintenance ──────────────────────────────────────────────────────────

function MaintenanceTab({
  kb,
  engineHours,
}: {
  kb: ModelKnowledgeBase;
  engineHours: number | null;
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const dueItems = useMemo(() => {
    if (!engineHours) return [];
    return kb.maintenance.serviceIntervals.filter((item) => {
      if (!item.intervalHours) return false;
      const remainder = engineHours % item.intervalHours;
      return remainder >= item.intervalHours * 0.85; // within 15% of interval
    });
  }, [kb.maintenance.serviceIntervals, engineHours]);

  const categories = useMemo(() => {
    const cats = new Set(kb.maintenance.winterizationChecklist.map((i) => i.category));
    return Array.from(cats);
  }, [kb.maintenance.winterizationChecklist]);

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const totalCount = kb.maintenance.winterizationChecklist.length;

  return (
    <div className="space-y-6">
      {/* Hours-aware due items */}
      {engineHours !== null && engineHours > 0 && (
        <div>
          <h3 className="text-base font-bold text-brand-navy mb-3">
            Service Status at {engineHours.toLocaleString()} Hours
          </h3>
          {dueItems.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex gap-3">
              <span className="text-green-600 text-lg">✓</span>
              <div>
                <p className="text-sm font-semibold text-green-800">No items approaching due</p>
                <p className="text-xs text-gray-500 mt-0.5">Based on your recorded engine hours and standard service intervals.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">Items within 15% of their service interval:</p>
              {dueItems.map((item) => (
                <div key={item.item} className="border border-amber-200 bg-amber-50 rounded-xl px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-amber-900">{item.item}</p>
                    <span className="text-xs font-semibold text-amber-700 bg-amber-200 rounded-full px-2 py-0.5 shrink-0">Due Soon</span>
                  </div>
                  {item.intervalHours && (
                    <p className="text-xs text-amber-700 mt-0.5">
                      Every {item.intervalHours.toLocaleString()} hours — currently at {(engineHours % item.intervalHours).toLocaleString()} / {item.intervalHours.toLocaleString()}
                    </p>
                  )}
                  {item.notes && <p className="text-xs text-amber-800 mt-1">{item.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!engineHours && (
        <div className="border border-dashed border-gray-300 rounded-xl px-4 py-3 flex gap-3">
          <span className="text-gray-400">🕐</span>
          <div>
            <p className="text-sm text-gray-600">Add engine hours to your boat profile to see hours-aware service reminders.</p>
            <Link href={`/garage`} className="text-xs text-brand-navy underline mt-1 inline-block">
              Update Engine Hours →
            </Link>
          </div>
        </div>
      )}

      {/* Full service interval table */}
      <div>
        <h3 className="text-base font-bold text-brand-navy mb-3">Service Intervals</h3>
        <div className="space-y-2">
          {kb.maintenance.serviceIntervals.map((item) => (
            <ServiceIntervalRow key={item.item} item={item} engineHours={engineHours} />
          ))}
        </div>
      </div>

      {/* Winterization Checklist */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-brand-navy">Winterization Checklist</h3>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-500">{checkedCount}/{totalCount}</div>
            <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-navy rounded-full transition-all"
                style={{ width: `${totalCount > 0 ? (checkedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {categories.map((category) => {
          const items = kb.maintenance.winterizationChecklist.filter(
            (i) => i.category === category
          );
          return (
            <div key={category} className="mb-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                {category}
              </p>
              <div className="space-y-2">
                {items.map((item) => (
                  <ChecklistItemRow
                    key={item.id}
                    item={item}
                    checked={!!checked[item.id]}
                    onToggle={() => toggleItem(item.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {checkedCount > 0 && checkedCount === totalCount && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-center mt-2">
            <p className="text-sm font-semibold text-green-700">🎉 Winterization complete!</p>
            <p className="text-xs text-gray-500 mt-0.5">Your boat is ready for storage.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ServiceIntervalRow({
  item,
  engineHours,
}: {
  item: ServiceInterval;
  engineHours: number | null;
}) {
  const priorityDot: Record<string, string> = {
    high: "bg-red-400",
    medium: "bg-amber-400",
    low: "bg-green-400",
  };

  const intervalStr = [
    item.intervalHours ? `Every ${item.intervalHours.toLocaleString()} hrs` : null,
    item.intervalMonths ? `Every ${item.intervalMonths} months` : null,
  ]
    .filter(Boolean)
    .join(" / ");

  return (
    <div className="border border-gray-200 rounded-xl px-4 py-3">
      <div className="flex items-start gap-2">
        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${priorityDot[item.priority]}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-gray-800">{item.item}</p>
            <span className="text-xs text-gray-500 shrink-0 text-right">{intervalStr}</span>
          </div>
          {engineHours !== null && item.intervalHours && (
            <div className="mt-1.5">
              <div className="flex items-center gap-1.5">
                <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-navy rounded-full"
                    style={{
                      width: `${Math.min(100, ((engineHours % item.intervalHours) / item.intervalHours) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-400">
                  {engineHours % item.intervalHours}/{item.intervalHours}h
                </span>
              </div>
            </div>
          )}
          {item.notes && (
            <p className="text-xs text-gray-500 mt-1">{item.notes}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ChecklistItemRow({
  item,
  checked,
  onToggle,
}: {
  item: ChecklistItem;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      className={`flex items-start gap-3 border rounded-xl px-4 py-3 cursor-pointer transition-colors ${
        checked
          ? "border-green-200 bg-green-50"
          : "border-gray-200 hover:border-brand-navy/40"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="mt-0.5 w-4 h-4 accent-brand-navy shrink-0"
      />
      <div>
        <p className={`text-sm font-medium ${checked ? "line-through text-gray-400" : "text-gray-800"}`}>
          {item.label}
        </p>
        {item.details && (
          <p className="text-xs text-gray-500 mt-0.5">{item.details}</p>
        )}
      </div>
    </label>
  );
}

// ── Tab: Boat Guide ───────────────────────────────────────────────────────────

function BoatGuideTab({ kb }: { kb: ModelKnowledgeBase }) {
  const [expandedIssue, setExpandedIssue] = useState<number | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    kb.boatGuide.commonIssues.forEach((issue) =>
      issue.tags?.forEach((tag) => tags.add(tag))
    );
    return Array.from(tags).sort();
  }, [kb.boatGuide.commonIssues]);

  const filtered = useMemo(() => {
    if (!activeTag) return kb.boatGuide.commonIssues;
    return kb.boatGuide.commonIssues.filter((i) => i.tags?.includes(activeTag));
  }, [kb.boatGuide.commonIssues, activeTag]);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-brand-navy mb-1">Common Issues</h3>
        <p className="text-xs text-gray-500">
          Known issues and troubleshooting guides specific to the {kb.make} {kb.model}.
        </p>
      </div>

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTag(null)}
            className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors ${
              activeTag === null
                ? "bg-brand-navy text-white border-brand-navy"
                : "border-gray-300 text-gray-500 hover:border-brand-navy"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors ${
                activeTag === tag
                  ? "bg-brand-navy text-white border-brand-navy"
                  : "border-gray-300 text-gray-500 hover:border-brand-navy"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Issue cards */}
      <div className="space-y-2">
        {filtered.map((issue, i) => (
          <CommonIssueRow
            key={i}
            issue={issue}
            expanded={expandedIssue === i}
            onToggle={() => setExpandedIssue(expandedIssue === i ? null : i)}
          />
        ))}
      </div>

      <p className="text-xs text-gray-400 pb-2">
        This guide is for reference only. For accurate diagnosis and repairs, consult a certified marine technician.
      </p>
    </div>
  );
}

function CommonIssueRow({
  issue,
  expanded,
  onToggle,
}: {
  issue: CommonIssue;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800">{issue.title}</p>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{issue.symptom}</p>
        </div>
        <div className="flex items-center gap-2 ml-3 shrink-0">
          {difficultyBadge(issue.difficulty)}
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 pb-4 pt-3 space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Symptom</p>
            <p className="text-sm text-gray-700">{issue.symptom}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Common Causes</p>
            <ul className="space-y-1">
              {issue.causes.map((cause, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-gray-400 shrink-0">•</span>
                  <span>{cause}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">What to Do</p>
            <p className="text-sm text-gray-700">{issue.solution}</p>
          </div>
          {issue.tags && issue.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {issue.tags.map((tag) => (
                <span key={tag} className="text-xs text-gray-400 bg-gray-200 rounded-full px-2 py-0.5">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Tab Navigation ────────────────────────────────────────────────────────────

const TABS = [
  { id: "engine", label: "Engine Reference", icon: "⚡" },
  { id: "safety", label: "Safety & Legal", icon: "🦺" },
  { id: "maintenance", label: "Maintenance", icon: "🔧" },
  { id: "guide", label: "Boat Guide", icon: "📖" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function KnowledgeBasePage() {
  const { boatId } = useParams<{ boatId: string }>();
  const router = useRouter();
  const { user, profile } = useSession();
  const { boats, loading } = useGarage(user?.id ?? null);
  const [activeTab, setActiveTab] = useState<TabId>("engine");

  const boat = boats.find((b) => b.id === boatId);
  const kb = boat ? getKnowledgeBase(boat.make, boat.model) : null;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-gray-400">
        <div className="animate-spin w-6 h-6 border-2 border-brand-navy border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!boat) {
    return (
      <div className="px-4 pt-6 text-center">
        <p className="text-gray-500">Boat not found.</p>
        <button onClick={() => router.push("/garage")} className="text-brand-navy text-sm underline mt-2">
          Back to Garage
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-10 max-w-2xl mx-auto">
      {/* Header */}
      <button
        onClick={() => router.back()}
        className="text-brand-navy text-sm mb-4 flex items-center gap-1"
      >
        ← Back
      </button>

      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">📚</span>
          <h1 className="text-xl font-bold text-brand-navy">Knowledge Base</h1>
        </div>
        <p className="text-sm text-gray-500">
          {boat.year} {boat.make} {boat.model}
          {boat.engine_hours !== null && (
            <span className="ml-2 text-gray-400">· {boat.engine_hours.toLocaleString()} engine hours</span>
          )}
        </p>
      </div>

      {!kb && (
        <div className="border border-amber-200 bg-amber-50 rounded-xl px-4 py-4 mb-5">
          <p className="text-sm font-semibold text-amber-800 mb-1">
            Model-specific content coming soon
          </p>
          <p className="text-xs text-amber-700">
            We don&apos;t yet have a tailored knowledge base for the {boat.make} {boat.model}. The Safety &amp; Legal
            and Maintenance tabs below contain universal content that applies to all boats.
          </p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 overflow-x-auto">
        {TABS.map((tab) => {
          const isDisabled = (tab.id === "engine" || tab.id === "guide") && !kb;
          return (
            <button
              key={tab.id}
              onClick={() => !isDisabled && setActiveTab(tab.id)}
              disabled={isDisabled}
              className={`flex-1 flex flex-col items-center gap-0.5 rounded-lg px-2 py-2 text-xs font-semibold transition-colors whitespace-nowrap min-w-[72px] ${
                activeTab === tab.id
                  ? "bg-white shadow-sm text-brand-navy"
                  : isDisabled
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span className="hidden sm:block">{tab.label}</span>
              <span className="sm:hidden">
                {tab.label.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "engine" && kb && <EngineReferenceTab kb={kb} />}
        {activeTab === "safety" && <SafetyLegalTab homeMarina={profile?.home_marina} />}
        {activeTab === "maintenance" && kb && (
          <MaintenanceTab kb={kb} engineHours={boat.engine_hours ?? null} />
        )}
        {activeTab === "maintenance" && !kb && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-2">🔧</p>
            <p className="text-sm">Maintenance data for this model is being added.</p>
          </div>
        )}
        {activeTab === "guide" && kb && <BoatGuideTab kb={kb} />}
      </div>
    </div>
  );
}
