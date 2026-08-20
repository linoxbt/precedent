"use client";

import { useEffect, useMemo, useState } from "react";
import { outcomeLabel } from "@/lib/mockData";
import type { Precedent } from "@/lib/types";

export default function ExplorerTable({ precedents }: { precedents: Precedent[] }) {
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.replace("#", "") : "";
    if (hash) {
      setExpandedId(hash);
      const el = document.getElementById(hash);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return precedents;
    return precedents.filter(
      (p) =>
        p.caseId.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.outcome.toLowerCase().includes(q)
    );
  }, [precedents, query]);

  return (
    <div className="flex flex-col gap-4">
      <input
        className="input max-w-sm"
        placeholder="Search precedents by keyword or outcome..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="card overflow-hidden">
        <div className="grid grid-cols-[110px_1fr_140px_60px] gap-4 border-b border-navy-100 bg-navy-50/60 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-navy-500">
          <span>Case ID</span>
          <span>Summary</span>
          <span>Outcome</span>
          <span />
        </div>

        {filtered.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-navy-400">No precedents match &quot;{query}&quot;.</p>
        )}

        {filtered.map((p) => {
          const isOpen = expandedId === p.caseId;
          return (
            <div key={p.caseId} id={p.caseId} className="border-b border-navy-100 last:border-b-0">
              <button
                type="button"
                onClick={() => setExpandedId(isOpen ? null : p.caseId)}
                className="grid w-full grid-cols-[110px_1fr_140px_60px] items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-navy-50/40"
              >
                <span className="font-mono text-xs font-semibold text-navy-700">#{p.caseId}</span>
                <span className="truncate text-sm text-navy-600">{p.description}</span>
                <span className="text-sm font-medium text-navy-800">{outcomeLabel(p.outcome)}</span>
                <span className="text-right text-navy-400">{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen && (
                <div className="animate-fade-in bg-navy-50/40 px-5 pb-5">
                  <p className="text-sm leading-relaxed text-navy-600">{p.rationale}</p>
                  <p className="mt-3 text-xs text-navy-400">
                    Confidence {(p.confidence * 100).toFixed(0)}% · Round {p.round} · {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
