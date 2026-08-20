import Link from "next/link";
import Sparkline from "./Sparkline";
import type { DomainConfig } from "@/lib/types";

export default function DomainCard({ domain, precedentCount }: { domain: DomainConfig; precedentCount: number }) {
  return (
    <Link
      href={`/explorer/${domain.tag}`}
      className="card card-hover flex flex-col gap-4 p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-lg font-semibold text-navy-900">{domain.displayName}</h3>
          <p className="mt-1 text-xs text-navy-400">{domain.tag}</p>
        </div>
        <Sparkline data={domain.precedentTrend} />
      </div>

      <p className="line-clamp-2 text-sm text-navy-500">{domain.rubric}</p>

      <div className="mt-auto flex items-center justify-between border-t border-navy-100 pt-4">
        <div>
          <span className="font-serif text-2xl font-semibold text-navy-800">{precedentCount}</span>
          <span className="ml-1.5 text-xs text-navy-400">precedents on record</span>
        </div>
        <span className="text-xs font-medium text-navy-500">
          Integrator {domain.integrator}
        </span>
      </div>
    </Link>
  );
}
