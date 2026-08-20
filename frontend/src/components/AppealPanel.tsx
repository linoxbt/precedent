"use client";

import { useState } from "react";
import { appealRuling } from "@/lib/genlayerClient";
import { outcomeLabel } from "@/lib/mockData";
import ValidatorPanelAvatars from "./ValidatorPanelAvatars";
import type { Appeal, Ruling } from "@/lib/types";

const MOCK_APPELLANT = "0x77c4...eb02";

export default function AppealPanel({
  caseId,
  originalRuling,
  existingAppeal,
}: {
  caseId: string;
  originalRuling: Ruling;
  existingAppeal?: Appeal;
}) {
  const [bond, setBond] = useState("0.01");
  const [phase, setPhase] = useState<"idle" | "escalating" | "done">(
    existingAppeal ? "done" : "idle"
  );
  const [result, setResult] = useState<Appeal | undefined>(existingAppeal);
  const [panelSize, setPanelSize] = useState(existingAppeal?.panelSizeBefore ?? 3);

  async function handleAppeal() {
    setPhase("escalating");
    setPanelSize(3);
    const growTimer = setTimeout(() => setPanelSize(6), 900);

    try {
      const appeal = await appealRuling({ caseId, bondAmount: `${bond} GEN`, appellant: MOCK_APPELLANT });
      setResult(appeal);
      setPanelSize(appeal.panelSizeAfter);
      setPhase("done");
    } finally {
      clearTimeout(growTimer);
    }
  }

  if (phase === "idle") {
    return (
      <div className="card p-8">
        <p className="label mb-1">Post an Appeal Bond</p>
        <p className="mb-6 text-sm text-navy-500">
          If the escalated panel affirms the original ruling, your bond is forfeited. If it
          overturns the ruling, your bond is returned in full.
        </p>

        <div className="mb-6 flex items-center gap-3 rounded-lg border border-navy-100 bg-navy-50/60 p-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-navy-400">Current panel</span>
          <ValidatorPanelAvatars count={3} />
        </div>

        <label className="label" htmlFor="bond">Bond Amount (GEN)</label>
        <div className="flex gap-3">
          <input
            id="bond"
            type="number"
            min="0.01"
            step="0.01"
            className="input"
            value={bond}
            onChange={(e) => setBond(e.target.value)}
          />
          <button onClick={handleAppeal} className="btn-primary whitespace-nowrap">
            Post Bond &amp; Appeal
          </button>
        </div>
      </div>
    );
  }

  if (phase === "escalating") {
    return (
      <div className="card p-8">
        <p className="label mb-4">Escalated Review In Progress</p>
        <div className="mb-4 flex items-center gap-4">
          <ValidatorPanelAvatars count={panelSize} pulsing />
          <span className="text-sm font-medium text-navy-500">
            Panel size: {panelSize === 3 ? "3 → expanding" : "6 validators"}
          </span>
        </div>
        <p className="text-sm text-navy-500">
          GenLayer&apos;s native appeal ladder is doubling the validator panel for independent
          re-review. Bond posted: {bond} GEN.
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

      <div className="mb-4 flex items-center gap-4">
        <ValidatorPanelAvatars count={result.panelSizeAfter} />
        <span className="text-sm text-navy-500">
          {result.panelSizeBefore} → {result.panelSizeAfter} validators · bond {result.bond}
        </span>
      </div>

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
