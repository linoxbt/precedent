"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DomainCard from "@/components/DomainCard";
import { getDomainPrecedentSummaries, listDomains } from "@/lib/genlayerClient";
import { isContractConfigured } from "@/lib/genlayerConfig";
import type { DomainConfig } from "@/lib/types";

export default function DashboardPage() {
  const [domains, setDomains] = useState<DomainConfig[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isContractConfigured()) {
      setLoading(false);
      return;
    }
    listDomains()
      .then(async (d) => {
        setDomains(d);
        const entries = await Promise.all(
          d.map(async (domain) => [domain.tag, (await getDomainPrecedentSummaries(domain.tag)).length] as const)
        );
        setCounts(Object.fromEntries(entries));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load domains."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10 flex flex-col gap-3 border-b border-navy-100 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gold">
            On-chain case law
          </p>
          <h1 className="font-serif text-3xl font-semibold text-navy-900">Domain Dashboard</h1>
          <p className="mt-2 max-w-xl text-sm text-navy-500">
            Every ruling here is checked against the domain&apos;s existing precedent before it&apos;s
            accepted — a growing, self-consistent body of case law instead of isolated judgment calls.
          </p>
        </div>
        <Link href="/submit" className="btn-primary whitespace-nowrap">
          Submit a Case
        </Link>
      </div>

      {!isContractConfigured() ? (
        <div className="card p-6 text-sm text-navy-600">
          No contract is configured yet (NEXT_PUBLIC_PRECEDENT_ENGINE_ADDRESS is unset). See the{" "}
          <Link href="/docs" className="font-medium text-navy-800 underline">
            docs
          </Link>{" "}
          for deployment instructions.
        </div>
      ) : loading ? (
        <p className="text-sm text-navy-400">Loading domains from the contract...</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : domains.length === 0 ? (
        <div className="card p-6 text-sm text-navy-600">
          No domains registered yet. Call <code className="rounded bg-navy-50 px-1">register_domain</code>{" "}
          on the contract to onboard the first one.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {domains.map((domain) => (
            <DomainCard key={domain.tag} domain={domain} precedentCount={counts[domain.tag] ?? 0} />
          ))}
        </div>
      )}
    </div>
  );
}
