import { outcomeLabel } from "@/lib/genlayerClient";

function confidenceTone(confidence: number) {
  if (confidence >= 0.85) return { label: "High confidence", classes: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (confidence >= 0.7) return { label: "Moderate confidence", classes: "bg-amber-50 text-amber-700 border-amber-200" };
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
    <div className="card relative overflow-hidden p-8">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gold via-gold-light to-gold" />
      <p className="text-xs font-semibold uppercase tracking-widest text-navy-400">
        {round === 0 ? "First-Instance Ruling" : `Appeal Ruling — Round ${round}`}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <h2 className="font-serif text-3xl font-semibold text-navy-900">{outcomeLabel(outcome)}</h2>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tone.classes}`}>
          {tone.label} · {(confidence * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
