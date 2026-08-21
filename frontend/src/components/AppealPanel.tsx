"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { appealRuling, outcomeLabel } from "@/lib/genlayerClient";
import { getConnectedProvider } from "@/lib/walletProvider";
import ValidatorPanelAvatars from "./ValidatorPanelAvatars";
import type { Appeal, Ruling } from "@/lib/types";

const DEFAULT_BOND_GEN = "0.01";

export default function AppealPanel({
  caseId,
  originalRuling,
  existingAppeal,
}: {
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
      const provider = await getConnectedProvider();
      const appeal = await appealRuling(
        { caseId, bondWei: parseEther(bond) },
        provider
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
      <div className="card p-8">
        <p className="label mb-1">Post an Appeal Bond</p>
        <p className="mb-6 text-sm text-navy-500">
          This calls the live contract's <code className="rounded bg-navy-50 px-1">appeal</code>{" "}
          method with your bond as the transaction value, triggering GenLayer's native escalating
          validator round. If the escalated panel affirms the original ruling, your bond is
          forfeited. If it overturns the ruling, your bond is returned in full.
        </p>

        <label className="label" htmlFor="bond">Bond Amount (GEN)</label>
        <div className="flex gap-3">
          <input
            id="bond"
            type="number"
            min="0.001"
            step="0.001"
            className="input"
            value={bond}
            onChange={(e) => setBond(e.target.value)}
          />
          <button onClick={handleAppeal} className="btn-primary whitespace-nowrap" disabled={!isConnected}>
            {isConnected ? "Post Bond & Appeal" : "Connect wallet"}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  if (phase === "escalating") {
    return (
      <div className="card p-8">
        <p className="label mb-4">Escalated Review In Progress</p>
        <div className="mb-4 flex items-center gap-4">
          <ValidatorPanelAvatars count={3} pulsing />
          <span className="text-sm font-medium text-navy-500">Awaiting validator consensus...</span>
        </div>
        <p className="text-sm text-navy-500">
          GenLayer's native appeal ladder is running an independent, larger validator round for
          this case. Bond posted: {bond} GEN. This can take up to a minute.
        </p>
      </div>
    );
  }

  if (!result) return null;

  const overturned = result.status === "overturned";

  return (
    <div className="card p-8">
      <div className="mb-4 flex items-center justify-between">
        <p className="label mb-0">Appeal Outcome</p>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
            overturned
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-navy-200 bg-navy-50 text-navy-600"
          }`}
        >
          {overturned ? "Overturned" : "Affirmed"}
        </span>
      </div>

      {result.validatorCount !== undefined && (
        <div className="mb-4 flex items-center gap-4">
          <ValidatorPanelAvatars count={result.validatorCount} />
          <span className="text-sm text-navy-500">
            {result.validatorCount} validators reviewed this round · bond {result.bond}
          </span>
        </div>
      )}

      {overturned && result.escalatedRuling ? (
        <div className="rounded-lg border border-gold-light/60 bg-gold-light/10 p-5">
          <p className="font-serif text-lg font-semibold text-navy-900">
            New Controlling Precedent: {outcomeLabel(result.escalatedRuling.outcome)}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-navy-600">{result.escalatedRuling.rationale}</p>
        </div>
      ) : (
        <p className="text-sm text-navy-600">
          The escalated panel affirmed the original ruling ({outcomeLabel(originalRuling.outcome)}).
          The appellant&apos;s bond is forfeited and the original ruling remains controlling precedent.
        </p>
      )}
    </div>
  );
}
