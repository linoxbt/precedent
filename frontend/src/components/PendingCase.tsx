"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCase } from "@/lib/genlayerClient";
import type { GenLayerNetworkKey } from "@/lib/genlayerConfig";

const POLL_MS = 4000;
const MAX_ATTEMPTS = 45; // ~3 minutes, matching submitCase's own write-wait ceiling

/**
 * Rendered when a case ID isn't readable yet. A freshly submitted case can
 * take a few seconds to a few minutes to become readable (write finalization
 * and read-replica lag are two separate things on GenLayer testnets, both
 * documented in README) - the page a submission navigates to shouldn't hard
 * 404 in that window. Polls for the case and refreshes once it exists; if it
 * genuinely never shows up, says so instead of pretending nothing happened.
 */
export default function PendingCase({ network, caseId }: { network: GenLayerNetworkKey; caseId: string }) {
  const router = useRouter();
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      if (cancelled) return;
      const found = await getCase(network, caseId).catch(() => undefined);
      if (cancelled) return;
      if (found) {
        router.refresh();
        return;
      }
      setAttempts((a) => a + 1);
    }
    const id = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [network, caseId, router]);

  const timedOut = attempts >= MAX_ATTEMPTS;

  return (
    <div className="flex flex-1 items-start justify-center p-8">
      <div className="panel flex max-w-md flex-col items-center gap-3 p-8 text-center">
        {!timedOut && (
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2.5 w-2.5 animate-pulse-soft rounded-full bg-accent-400"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}
        <p className="text-sm font-semibold text-ink">
          {timedOut ? "Still can't find this case" : "Loading case..."}
        </p>
        <p className="text-xs text-ink-muted">
          {timedOut
            ? "This case still isn't showing up in reads. If you just submitted it, check the transaction on the explorer; otherwise this link may be invalid or on the wrong network."
            : "A freshly submitted case can take a moment to show up. This page will update automatically."}
        </p>
      </div>
    </div>
  );
}
