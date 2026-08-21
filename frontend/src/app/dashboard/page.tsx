"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DomainCard from "@/components/DomainCard";
import StatusBar from "@/components/StatusBar";
import { getDomainPrecedentSummaries, listDomains } from "@/lib/genlayerClient";
import { isContractConfigured, GENLAYER_NETWORKS } from "@/lib/genlayerConfig";
import { useActiveNetwork } from "@/lib/NetworkProvider";
import type { DomainConfig } from "@/lib/types";

export default function DashboardPage() {
  const { network } = useActiveNetwork();
  const [domains, setDomains] = useState<DomainConfig[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isContractConfigured(network)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    listDomains(network)
      .then(async (d) => {
        setDomains(d);
        const entries = await Promise.all(
          d.map(async (domain) => [domain.tag, (await getDomainPrecedentSummaries(network, domain.tag)).length] as const)
        );
        setCounts(Object.fromEntries(entries));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load domains."))
      .finally(() => setLoading(false));
  }, [network]);

  const totalPrecedents = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 p-4">
        {!isContractConfigured(network) ? (
          <div className="panel p-6 text-sm text-ink-muted">
            No contract is configured on {GENLAYER_NETWORKS[network].label} yet. See{" "}
            <Link href="/docs" className="font-medium text-accent-600 underline">
              Help
            </Link>{" "}
            for deployment instructions, or switch networks above.
          </div>
        ) : loading ? (
          <p className="px-2 text-sm text-ink-faint">Reading folders from the contract...</p>
        ) : error ? (
          <p className="px-2 text-sm text-red-600">{error}</p>
        ) : domains.length === 0 ? (
          <div className="panel p-6 text-sm text-ink-muted">
            No practice areas registered yet: call{" "}
            <code className="rounded bg-chrome px-1">register_domain</code> on the contract to create the
            first folder.
          </div>
        ) : (
          <div className="flex flex-wrap gap-1">
            {domains.map((domain) => (
              <DomainCard key={domain.tag} domain={domain} precedentCount={counts[domain.tag] ?? 0} />
            ))}
          </div>
        )}
      </div>
      <StatusBar>
        <span>{domains.length} {domains.length === 1 ? "folder" : "folders"}</span>
        <span className="text-ink-faint">·</span>
        <span>{totalPrecedents} total items</span>
      </StatusBar>
    </div>
  );
}
