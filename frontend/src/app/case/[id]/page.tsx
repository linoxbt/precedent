import Link from "next/link";
import { notFound } from "next/navigation";
import {
  domainDisplayName,
  getCase,
  getDomain,
  getDomainPrecedents,
  getRuling,
} from "@/lib/genlayerClient";
import VerdictCard from "@/components/VerdictCard";
import RationaleWithCitations from "@/components/RationaleWithCitations";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  ruled: "Ruled — Open to Appeal",
  appealed: "Under Appeal",
  final: "Final",
};

export default async function CaseRulingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [caseRecord, ruling] = await Promise.all([getCase(id), getRuling(id)]);

  if (!caseRecord || !ruling) {
    notFound();
  }

  const [domain, precedents] = await Promise.all([
    getDomain(caseRecord.domain),
    getDomainPrecedents(caseRecord.domain),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">
            {domain ? domainDisplayName(domain.tag) : caseRecord.domain}
          </p>
          <h1 className="font-serif text-2xl font-semibold text-navy-900">Case #{caseRecord.id}</h1>
        </div>
        <span className="rounded-full border border-navy-200 bg-navy-50 px-3 py-1 text-xs font-semibold text-navy-600">
          {STATUS_LABEL[caseRecord.status] ?? caseRecord.status}
        </span>
      </div>

      <div className="card mb-6 p-6">
        <p className="label mb-2">Case Description</p>
        <p className="text-sm leading-relaxed text-navy-600">{caseRecord.description}</p>

        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-navy-100 pt-4 text-xs text-navy-500 sm:grid-cols-2">
          <div>
            <span className="font-semibold text-navy-600">Submitter</span>
            <p>{caseRecord.submitter}</p>
          </div>
          <div>
            <span className="font-semibold text-navy-600">Respondent</span>
            <p>{caseRecord.respondent || "—"}</p>
          </div>
          <div className="sm:col-span-2">
            <span className="font-semibold text-navy-600">Evidence</span>
            <ul className="mt-1 flex flex-col gap-0.5">
              {caseRecord.evidenceRefs.map((ref) => (
                <li key={ref} className="truncate font-mono text-[11px] text-navy-400">
                  {ref}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <VerdictCard outcome={ruling.outcome} confidence={ruling.confidence} round={ruling.round} />

      <div className="card mt-6 p-8">
        <p className="label mb-4">Rationale</p>
        <RationaleWithCitations rationale={ruling.rationale} precedents={precedents} />
      </div>

      {caseRecord.status === "ruled" && (
        <div className="mt-8 flex items-center justify-between rounded-lg border border-navy-100 bg-navy-50/60 p-5">
          <div>
            <p className="text-sm font-semibold text-navy-800">Disagree with this ruling?</p>
            <p className="text-xs text-navy-500">
              Any party may appeal by posting a bond, triggering GenLayer&apos;s escalating validator round.
            </p>
          </div>
          <Link href={`/appeal/${caseRecord.id}`} className="btn-secondary whitespace-nowrap">
            Appeal Ruling
          </Link>
        </div>
      )}

      {caseRecord.status === "final" && (
        <div className="mt-8 rounded-lg border border-navy-100 bg-navy-50/60 p-5">
          <p className="text-sm font-semibold text-navy-800">This ruling is final.</p>
          <Link
            href={`/appeal/${caseRecord.id}`}
            className="mt-1 inline-block text-xs font-medium text-navy-500 hover:text-navy-800"
          >
            View appeal outcome →
          </Link>
        </div>
      )}
    </div>
  );
}
