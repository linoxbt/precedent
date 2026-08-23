"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import {
  domainDisplayName,
  getCase,
  getDomainPrecedentSummaries,
  listDomains,
} from "@/lib/genlayerClient";
import { getRecordedCaseIds } from "@/lib/caseHistoryStore";
import { isContractConfigured } from "@/lib/genlayerConfig";
import { useActiveNetwork } from "@/lib/NetworkProvider";
import WalletConnectButton from "@/components/WalletConnectButton";
import { HistoryIcon, WindowDots } from "@/components/icons";
import type { Case } from "@/lib/types";

export default function HistoryPage() {
  const { address, isConnected } = useAccount();
  const { network } = useActiveNetwork();
  const [cases, setCases] = useState<Case[] | null>(null);

  useEffect(() => {
    if (!isConnected || !address || !isContractConfigured(network)) {
      setCases(null);
      return;
    }
    let cancelled = false;
    setCases(null);
    const myAddress = address.toLowerCase();

    async function load() {
      const domains = await listDomains(network);
      const isMine = (c: Case) =>
        c.submitter.toLowerCase() === myAddress ||
        (!!c.respondent && c.respondent.toLowerCase() === myAddress);

      // get_domain_precedents only lists cases that have already been ruled
      // (see _write_precedent in the contract), so it misses anything still
      // pending or that never reached consensus. Run per domain in parallel.
      const perDomain = await Promise.all(
        domains.map(async (d) => {
          const summaries = await getDomainPrecedentSummaries(network, d.tag, 50);
          const hydrated = await Promise.all(summaries.map((s) => getCase(network, s.caseId)));
          return hydrated.filter((c): c is Case => !!c && isMine(c));
        })
      );

      // Supplement with cases this browser itself submitted, read directly
      // by ID regardless of ruling status, so a just-submitted or still-
      // pending case shows up immediately instead of waiting for a ruling.
      const recordedIds = getRecordedCaseIds(network);
      const recorded = await Promise.all(recordedIds.map((id) => getCase(network, id)));

      const byId = new Map<string, Case>();
      for (const c of perDomain.flat()) byId.set(c.id, c);
      for (const c of recorded) {
        if (c && isMine(c)) byId.set(c.id, c);
      }

      if (!cancelled) setCases(Array.from(byId.values()));
    }

    load().catch(() => {
      if (!cancelled) setCases([]);
    });
    return () => {
      cancelled = true;
    };
  }, [network, address, isConnected]);

  return (
    <div className="flex flex-1 items-start justify-center overflow-y-auto bg-chrome p-6">
      <div className="dialog w-full max-w-2xl animate-window-open">
        <div className="flex items-center gap-2 border-b border-chrome-border bg-chrome-titlebar px-4 py-2.5">
          <HistoryIcon className="h-4 w-4 text-accent-500" />
          <span className="text-xs font-semibold text-ink">History</span>
          <WindowDots className="ml-auto" />
        </div>

        <div className="flex flex-col gap-4 bg-white p-6">
          {!isConnected ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-sm text-ink-muted">Connect a wallet to see your case history.</p>
              <WalletConnectButton />
            </div>
          ) : cases === null ? (
            <p className="text-sm text-ink-faint">Reading transaction history from chain...</p>
          ) : cases.length === 0 ? (
            <p className="text-sm text-ink-faint">No cases found for the connected wallet on this network.</p>
          ) : (
            <div className="flex flex-col divide-y divide-chrome-border">
              {cases.map((c) => (
                <Link
                  key={c.id}
                  href={`/case/${c.id}`}
                  className="flex items-center justify-between gap-3 py-3 hover:bg-chrome-hover"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{c.title || `Case #${c.id}`}</p>
                    <p className="truncate text-xs text-ink-faint">{domainDisplayName(c.domain)}</p>
                  </div>
                  <span className="shrink-0 rounded-sm border border-chrome-border bg-chrome-pane px-2 py-0.5 text-[11px] text-ink-muted">
                    {c.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
