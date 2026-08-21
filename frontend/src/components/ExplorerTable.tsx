"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { outcomeLabel } from "@/lib/genlayerClient";
import { DocumentIcon, SearchIcon } from "./icons";
import type { Precedent } from "@/lib/types";

const STATUS_TONE: Record<string, string> = {
  full_refund: "#c9822a",
  no_refund: "#1e8e5a",
};

export default function ExplorerTable({ precedents }: { precedents: Precedent[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

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
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-2 border-b border-chrome-border bg-chrome-pane px-3 py-2">
        <div className="flex w-64 items-center gap-2 rounded-sm border border-chrome-border bg-white px-2.5 py-1.5">
          <SearchIcon className="h-3.5 w-3.5 text-ink-faint" />
          <input
            className="w-full bg-transparent text-xs text-ink placeholder:text-ink-faint focus:outline-none"
            placeholder="Search this folder"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <span className="text-xs text-ink-faint">{filtered.length} of {precedents.length} items</span>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="grid min-w-[640px] grid-cols-[1fr_140px_110px_90px] gap-3 border-b border-chrome-border bg-chrome-pane px-4 py-1.5 text-xs font-semibold text-ink-muted">
          <span>Name</span>
          <span>Outcome</span>
          <span>Confidence</span>
          <span>Round</span>
        </div>

        {filtered.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-ink-faint">No items match &quot;{query}&quot;.</p>
        )}

        {filtered.map((p) => {
          const isSelected = selected === p.caseId;
          return (
            <div
              key={p.caseId}
              id={p.caseId}
              onClick={() => setSelected(p.caseId)}
              onDoubleClick={() => router.push(`/case/${p.caseId}`)}
              className={`grid min-w-[640px] cursor-default grid-cols-[1fr_140px_110px_90px] items-center gap-3 border-b border-chrome-border/60 px-4 py-2 text-sm ${
                isSelected ? "bg-chrome-selected" : "hover:bg-chrome-hover"
              }`}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/case/${p.caseId}`);
                }}
                className="flex min-w-0 items-center gap-2.5 text-left"
              >
                <span className="h-6 w-5 shrink-0">
                  <DocumentIcon tone={STATUS_TONE[p.outcome] ?? "#0f6cbd"} />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-medium text-ink hover:underline">#{p.caseId}.ruling</span>
                  <span className="truncate text-xs text-ink-faint">{p.description}</span>
                </span>
              </button>
              <span className="text-ink-muted">{outcomeLabel(p.outcome)}</span>
              <span className="text-ink-muted">{(p.confidence * 100).toFixed(0)}%</span>
              <span className="text-ink-muted">Round {p.round}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
