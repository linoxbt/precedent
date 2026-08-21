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
      const results: Case[] = [];
      for (const d of domains) {
        const summaries = await getDomainPrecedentSummaries(network, d.tag, 50);
        const hydrated = await Promise.all(summaries.map((s) => getCase(network, s.caseId)));
        for (const c of hydrated) {
          if (!c) continue;
          const isMine =
            c.submitter.toLowerCase() === myAddress ||
            (!!c.respondent && c.respondent.toLowerCase() === myAddress);
          if (isMine) results.push(c);
        }
      }
      if (!cancelled) setCases(results);
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
