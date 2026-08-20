import Link from "next/link";
import { outcomeLabel } from "@/lib/mockData";
import type { Precedent } from "@/lib/types";

export default function PrecedentCard({ precedent }: { precedent: Precedent }) {
  return (
    <div className="animate-grow-in origin-top rounded-lg border border-gold-light/60 bg-gold-light/10 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gold">
            Precedent #{precedent.caseId}
          </p>
          <p className="mt-1 font-serif text-base font-semibold text-navy-900">
            {outcomeLabel(precedent.outcome)}
          </p>
        </div>
        <Link
          href={`/explorer/${precedent.domain}#${precedent.caseId}`}
          className="whitespace-nowrap text-xs font-medium text-navy-500 hover:text-navy-800"
        >
          View in Explorer →
        </Link>
      </div>
      <p className="mt-3 text-sm text-navy-600">{precedent.description}</p>
      <p className="mt-3 border-t border-gold-light/40 pt-3 text-sm text-navy-500">
        {precedent.rationale}
      </p>
    </div>
  );
}
