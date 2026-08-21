import Link from "next/link";
import { outcomeLabel } from "@/lib/genlayerClient";
import { DocumentIcon } from "./icons";
import type { Precedent } from "@/lib/types";

export default function PrecedentCard({ precedent }: { precedent: Precedent }) {
  return (
    <div className="animate-grow-in origin-top rounded-sm border border-accent-400/40 bg-accent-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 h-6 w-5 shrink-0">
            <DocumentIcon tone="#0f6cbd" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-600">
              Precedent #{precedent.caseId}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-ink">{outcomeLabel(precedent.outcome)}</p>
          </div>
        </div>
        <Link
          href={`/explorer/${precedent.domain}#${precedent.caseId}`}
          className="whitespace-nowrap text-xs font-medium text-accent-600 hover:underline"
        >
          Open in folder →
        </Link>
      </div>
      <p className="mt-3 text-sm text-ink-muted">{precedent.description}</p>
      <p className="mt-3 border-t border-accent-400/20 pt-3 text-sm text-ink-muted">{precedent.rationale}</p>
    </div>
  );
}
