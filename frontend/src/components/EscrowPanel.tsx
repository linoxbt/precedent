"use client";

import { useState } from "react";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { withdrawEscrow } from "@/lib/genlayerClient";
import { getConnectedProviderAndAccount } from "@/lib/walletProvider";

export default function EscrowPanel({
  caseId,
  escrowWei,
  escrowWithdrawn,
  submitter,
}: {
  caseId: string;
  escrowWei: string;
  escrowWithdrawn: boolean;
  submitter: string;
}) {
  const { address, isConnected } = useAccount();
  const [status, setStatus] = useState<"idle" | "pending" | "done">(
    escrowWithdrawn ? "done" : "idle"
  );
  const [error, setError] = useState<string | null>(null);

  const escrow = BigInt(escrowWei || "0");
  if (escrow === 0n) return null;

  const isSubmitter = isConnected && address?.toLowerCase() === submitter.toLowerCase();

  async function handleWithdraw() {
    setError(null);
    setStatus("pending");
    try {
      const { provider, account } = await getConnectedProviderAndAccount();
      await withdrawEscrow(caseId, provider, account);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Withdrawal failed.");
      setStatus("idle");
    }
  }

  return (
    <div>
      <dt className="text-ink-faint">Escrow locked</dt>
      <dd className="font-mono text-ink-muted">{formatEther(escrow)} GEN</dd>
      {status === "done" ? (
        <p className="mt-1 text-[11px] text-ink-faint">Withdrawn to the submitter.</p>
      ) : isSubmitter ? (
        <button
          type="button"
          onClick={handleWithdraw}
          disabled={status === "pending"}
          className="mt-1.5 rounded-sm border border-chrome-border px-2.5 py-1 text-[11px] font-medium text-accent-600 hover:bg-chrome-hover disabled:opacity-50"
        >
          {status === "pending" ? "Withdrawing..." : "Withdraw Escrow"}
        </button>
      ) : (
        <p className="mt-1 text-[11px] text-ink-faint">Refundable to the submitter.</p>
      )}
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
    </div>
  );
}
