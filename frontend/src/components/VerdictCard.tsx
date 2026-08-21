import { outcomeLabel } from "@/lib/genlayerClient";

function confidenceTone(confidence: number) {
  if (confidence >= 0.85) return { label: "High confidence", classes: "bg-status-overturned/10 text-status-overturned border-status-overturned/30" };
  if (confidence >= 0.7) return { label: "Moderate confidence", classes: "bg-status-appealed/10 text-status-appealed border-status-appealed/30" };
  return { label: "Low confidence", classes: "bg-red-50 text-red-700 border-red-200" };
}

export default function VerdictCard({
  outcome,
  confidence,
  round,
}: {
  outcome: string;
  confidence: number;
  round: number;
}) {
  const tone = confidenceTone(confidence);
  return (
    <div className="panel border-l-4 border-l-accent-500 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
        {round === 0 ? "First-Instance Ruling" : `Appeal Ruling — Round ${round}`}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-semibold text-ink">{outcomeLabel(outcome)}</h2>
        <span className={`rounded-sm border px-2.5 py-0.5 text-xs font-semibold ${tone.classes}`}>
          {tone.label} · {(confidence * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
