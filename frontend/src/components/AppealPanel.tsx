"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { appealRuling, outcomeLabel } from "@/lib/genlayerClient";
import { getConnectedProviderAndAccount } from "@/lib/walletProvider";
import type { GenLayerNetworkKey } from "@/lib/genlayerConfig";
import ValidatorPanelAvatars from "./ValidatorPanelAvatars";
import type { Appeal, Ruling } from "@/lib/types";

const DEFAULT_BOND_GEN = "0.01";

export default function AppealPanel({
  network,
  caseId,
  originalRuling,
  existingAppeal,
}: {
  network: GenLayerNetworkKey;
  caseId: string;
  originalRuling: Ruling;
  existingAppeal?: Appeal;
}) {
  const { isConnected } = useAccount();
  const [bond, setBond] = useState(DEFAULT_BOND_GEN);
  const [phase, setPhase] = useState<"idle" | "escalating" | "done">(
    existingAppeal ? "done" : "idle"
  );
  const [result, setResult] = useState<Appeal | undefined>(existingAppeal);
  const [error, setError] = useState<string | null>(null);

  async function handleAppeal() {
    setError(null);
    setPhase("escalating");
    try {
      const { provider, account } = await getConnectedProviderAndAccount();
      const appeal = await appealRuling(
        network,
        { caseId, bondWei: parseEther(bond) },
        provider,
        account
      );
      setResult(appeal);
      setPhase("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Appeal failed. Try again.");
      setPhase("idle");
    }
  }

  if (phase === "idle") {
    return (
      <div className="flex flex-col gap-5 bg-white p-5">
        <div>
          <p className="label mb-1">Post an Appeal Bond</p>
          <p className="text-sm text-ink-muted">
            This calls the live contract&apos;s <code className="rounded bg-chrome px-1">appeal</code>{" "}
            method with your bond as the transaction value, triggering GenLayer&apos;s native
            escalating validator round. If the escalated panel affirms the original ruling, your
            bond is forfeited. If it overturns the ruling, your bond is returned in full.
          </p>
        </div>

        <div>
          <label className="label" htmlFor="bond">Bond Amount (GEN)</label>
          <div className="flex gap-2">
            <input
              id="bond"
              type="number"
              min="0.001"
              step="0.001"
              className="input"
              value={bond}
              onChange={(e) => setBond(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-end gap-2 border-t border-chrome-border pt-4">
          <button onClick={handleAppeal} className="btn-primary" disabled={!isConnected}>
            {isConnected ? "Post Bond & Appeal" : "Connect wallet"}
          </button>
        </div>
      </div>
    );
  }

  if (phase === "escalating") {
    return (
      <div className="flex flex-col gap-4 bg-white p-5">
        <p className="label mb-0">Escalated Review In Progress</p>
        <div className="flex items-center gap-4">
          <ValidatorPanelAvatars count={3} pulsing />
          <span className="text-sm font-medium text-ink-muted">Awaiting validator consensus...</span>
        </div>
        <p className="text-sm text-ink-muted">
          GenLayer&apos;s native appeal ladder is running an independent, larger validator round
          for this case. Bond posted: {bond} GEN. This can take up to a minute.
        </p>
      </div>
    );
  }

  if (!result) return null;

  const overturned = result.status === "overturned";

  return (
    <div className="flex flex-col gap-4 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="label mb-0">Appeal Outcome</p>
        <span
          className={`rounded-sm border px-2.5 py-0.5 text-xs font-semibold ${
            overturned
              ? "border-status-overturned/30 bg-status-overturned/10 text-status-overturned"
              : "border-chrome-border bg-chrome-pane text-ink-muted"
          }`}
        >
          {overturned ? "Overturned" : "Affirmed"}
        </span>
      </div>

      {result.validatorCount !== undefined && (
        <div className="flex items-center gap-4">
          <ValidatorPanelAvatars count={result.validatorCount} />
          <span className="text-sm text-ink-muted">
            {result.validatorCount} validators reviewed this round · bond {result.bond}
          </span>
        </div>
      )}

      {overturned && result.escalatedRuling ? (
        <div className="rounded-sm border border-accent-400/40 bg-accent-50 p-4">
          <p className="text-base font-semibold text-ink">
            New Controlling Precedent: {outcomeLabel(result.escalatedRuling.outcome)}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{result.escalatedRuling.rationale}</p>
        </div>
      ) : (
        <p className="text-sm text-ink-muted">
          The escalated panel affirmed the original ruling ({outcomeLabel(originalRuling.outcome)}).
          The appellant&apos;s bond is forfeited and the original ruling remains controlling precedent.
        </p>
      )}
    </div>
  );
}
