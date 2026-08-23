"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getRuling } from "@/lib/genlayerClient";
import type { GenLayerNetworkKey } from "@/lib/genlayerConfig";

const POLL_MS = 4000;
const MAX_ATTEMPTS = 45; // ~3 minutes, matching submitCase's own write-wait ceiling

/**
 * Shown on a case page when the case exists on-chain but its ruling hasn't
 * shown up in reads yet (submit_case's LLM validator round can take up to a
 * few minutes). Polls for the ruling and refreshes the page once it's ready,
 * so the server component re-renders with the real verdict instead of the
 * user having to reload manually.
 */
export default function PendingRuling({ network, caseId }: { network: GenLayerNetworkKey; caseId: string }) {
  const router = useRouter();
  const [attempts, setAttempts] = useState(0);
  const stopped = useRef(false);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      if (cancelled || stopped.current) return;
      const ruling = await getRuling(network, caseId).catch(() => undefined);
      if (cancelled) return;
      if (ruling) {
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
    <div className="panel mt-4 flex items-center gap-4 p-5">
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
      <div>
        <p className="text-sm font-semibold text-ink">
          {timedOut ? "Still waiting on a ruling" : "Validators reviewing this case"}
        </p>
        <p className="text-xs text-ink-muted">
          {timedOut
            ? "This is taking longer than usual. Refresh this page in a moment, or check the transaction on the explorer."
            : "The case was submitted and is on-chain; this page will update automatically once the ruling is in."}
        </p>
      </div>
    </div>
  );
}
