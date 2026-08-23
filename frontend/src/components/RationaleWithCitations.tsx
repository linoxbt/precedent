"use client";

import { useState } from "react";
import PrecedentCard from "./PrecedentCard";
import type { Precedent } from "@/lib/types";

// Matches whatever shape a case ID could take: this app's own IDs are
// crypto.randomUUID() (lowercase hex, several hyphens), but the pattern is
// kept permissive in case a future contract version uses a different
// scheme. In practice the LLM rarely writes an inline "Precedent #<id>"
// reference at all - the structured citedPrecedentIds list below is the
// reliable source, this is a bonus for when it does.
const CITATION_PATTERN = /Precedent #([0-9a-zA-Z-]{4,40})/g;

export default function RationaleWithCitations({
  rationale,
  precedents,
  citedPrecedentIds = [],
}: {
  rationale: string;
  precedents: Precedent[];
  citedPrecedentIds?: string[];
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const precedentById = new Map(precedents.map((p) => [p.caseId, p]));

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const segments: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const seenInOrder: string[] = [];

  CITATION_PATTERN.lastIndex = 0;
  while ((match = CITATION_PATTERN.exec(rationale)) !== null) {
    const [full, id] = match;
    if (match.index > lastIndex) {
      segments.push(rationale.slice(lastIndex, match.index));
    }
    const isExpanded = expanded.has(id);
    const known = precedentById.has(id);
    segments.push(
      <button
        key={`${id}-${match.index}`}
        type="button"
        onClick={() => known && toggle(id)}
        disabled={!known}
        className={`mx-0.5 inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-sm font-medium transition-all ${
          isExpanded
            ? "border-accent-600 bg-accent-500 text-white"
            : "border-accent-400/50 bg-accent-50 text-accent-700 hover:border-accent-500 hover:bg-accent-100"
        } ${known ? "cursor-pointer" : "cursor-default opacity-70"}`}
        title={known ? "Click to expand this precedent" : "Precedent not in local index"}
      >
        {full}
      </button>
    );
    if (!seenInOrder.includes(id)) seenInOrder.push(id);
    lastIndex = match.index + full.length;
  }
  if (lastIndex < rationale.length) {
    segments.push(rationale.slice(lastIndex));
  }

  // The rationale text rarely embeds an inline "Precedent #<id>" reference
  // in practice, so the structured cited_precedent_ids the contract returns
  // is the reliable source of what was actually cited. Surface it directly
  // rather than relying solely on inline text matches.
  const extraCitedIds = citedPrecedentIds.filter((id) => !seenInOrder.includes(id));
  const allCitedIds = [...seenInOrder, ...extraCitedIds];

  return (
    <div className="flex flex-col gap-4">
      <p className="text-base leading-relaxed text-ink">{segments}</p>

      {extraCitedIds.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Cited precedents
          </p>
          <div className="flex flex-wrap gap-1.5">
            {extraCitedIds.map((id) => {
              const isExpanded = expanded.has(id);
              const known = precedentById.has(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => known && toggle(id)}
                  disabled={!known}
                  className={`inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-sm font-medium transition-all ${
                    isExpanded
                      ? "border-accent-600 bg-accent-500 text-white"
                      : "border-accent-400/50 bg-accent-50 text-accent-700 hover:border-accent-500 hover:bg-accent-100"
                  } ${known ? "cursor-pointer" : "cursor-default opacity-70"}`}
                  title={known ? "Click to expand this precedent" : "Precedent not in local index"}
                >
                  Precedent #{id}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {allCitedIds
        .filter((id) => expanded.has(id) && precedentById.has(id))
        .map((id) => (
          <PrecedentCard key={id} precedent={precedentById.get(id)!} />
        ))}
    </div>
  );
}
