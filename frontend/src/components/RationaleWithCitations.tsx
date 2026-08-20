"use client";

import { useState } from "react";
import PrecedentCard from "./PrecedentCard";
import type { Precedent } from "@/lib/types";

const CITATION_PATTERN = /Precedent #([A-Z]+-\d+)/g;

export default function RationaleWithCitations({
  rationale,
  precedents,
}: {
  rationale: string;
  precedents: Precedent[];
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
        className={`mx-0.5 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-sm font-medium transition-all ${
          isExpanded
            ? "border-gold bg-gold text-parchment-100"
            : "border-gold-light/70 bg-gold-light/15 text-navy-800 hover:border-gold hover:bg-gold-light/30"
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

  return (
    <div className="flex flex-col gap-4">
      <p className="text-base leading-relaxed text-navy-700">{segments}</p>
      {seenInOrder
        .filter((id) => expanded.has(id) && precedentById.has(id))
        .map((id) => (
          <PrecedentCard key={id} precedent={precedentById.get(id)!} />
        ))}
    </div>
  );
}
