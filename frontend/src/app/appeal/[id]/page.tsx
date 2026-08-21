import { notFound } from "next/navigation";
import {
  domainDisplayName,
  getAppeal,
  getCase,
  getDomain,
  getRuling,
  outcomeLabel,
} from "@/lib/genlayerClient";
import AppealPanel from "@/components/AppealPanel";

export default async function AppealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [caseRecord, ruling] = await Promise.all([getCase(id), getRuling(id)]);

  if (!caseRecord || !ruling) {
    notFound();
  }

  const [domain, existingAppeal] = await Promise.all([
    getDomain(caseRecord.domain),
    getAppeal(id),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gold">
        {domain ? domainDisplayName(domain.tag) : caseRecord.domain}
      </p>
      <h1 className="font-serif text-3xl font-semibold text-navy-900">Appeal — Case #{caseRecord.id}</h1>

      <div className="card my-6 p-5">
        <p className="label mb-1">Original Ruling</p>
        <p className="font-serif text-lg font-semibold text-navy-900">{outcomeLabel(ruling.outcome)}</p>
        <p className="mt-1 text-sm text-navy-500">Round {ruling.round} · {(ruling.confidence * 100).toFixed(0)}% confidence</p>
      </div>

      <AppealPanel caseId={caseRecord.id} originalRuling={ruling} existingAppeal={existingAppeal} />
    </div>
  );
}
