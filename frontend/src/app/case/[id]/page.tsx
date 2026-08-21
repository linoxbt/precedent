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
import StatusBar from "@/components/StatusBar";
import CaseMessages from "@/components/CaseMessages";
import { DocumentIcon } from "@/components/icons";
import { getActiveNetworkServer } from "@/lib/activeNetworkServer";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  ruled: "Ruled, Open to Appeal",
  appealed: "Under Appeal",
  final: "Final",
};

export default async function CaseRulingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const network = await getActiveNetworkServer();
  const [caseRecord, ruling] = await Promise.all([getCase(network, id), getRuling(network, id)]);

  if (!caseRecord || !ruling) {
    notFound();
  }

  const [domain, precedents] = await Promise.all([
    getDomain(network, caseRecord.domain),
    getDomainPrecedents(network, caseRecord.domain),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-chrome-border px-4 py-3">
        <span className="h-9 w-7 shrink-0">
          <DocumentIcon />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold text-ink">
            {caseRecord.title || `Case #${caseRecord.id}`}
          </h1>
          <p className="truncate text-xs text-ink-faint">
            {domain ? domainDisplayName(domain.tag) : caseRecord.domain}
          </p>
        </div>
        <span className="ml-auto shrink-0 whitespace-nowrap rounded-sm border border-chrome-border bg-chrome-pane px-2.5 py-1 text-xs font-medium text-ink-muted">
          {STATUS_LABEL[caseRecord.status] ?? caseRecord.status}
        </span>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="flex-1 overflow-y-auto p-4">
          <p className="label mb-2">Case Description</p>
          <p className="mb-6 text-sm leading-relaxed text-ink-muted">{caseRecord.description}</p>

          <VerdictCard outcome={ruling.outcome} confidence={ruling.confidence} round={ruling.round} />

          <div className="panel mt-4 p-5">
            <p className="label mb-3">Rationale</p>
            <RationaleWithCitations rationale={ruling.rationale} precedents={precedents} />
          </div>

          <CaseMessages
            network={network}
            caseId={caseRecord.id}
            submitter={caseRecord.submitter}
            respondent={caseRecord.respondent}
          />

          {caseRecord.status === "ruled" && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-chrome-border bg-chrome-pane p-4">
              <div>
                <p className="text-sm font-semibold text-ink">Disagree with this ruling?</p>
                <p className="text-xs text-ink-faint">
                  Any party may appeal by posting a bond, triggering GenLayer&apos;s escalating validator round.
                </p>
              </div>
              <Link href={`/appeal/${caseRecord.id}`} className="btn-secondary whitespace-nowrap">
                Appeal Ruling
              </Link>
            </div>
          )}

          {caseRecord.status === "final" && (
            <div className="mt-4 rounded-sm border border-chrome-border bg-chrome-pane p-4">
              <p className="text-sm font-semibold text-ink">This ruling is final.</p>
              <Link
                href={`/appeal/${caseRecord.id}`}
                className="mt-1 inline-block text-xs font-medium text-accent-600 hover:underline"
              >
                View appeal outcome →
              </Link>
            </div>
          )}
        </div>

        <aside className="w-full shrink-0 border-t border-chrome-border bg-chrome-pane p-4 lg:w-72 lg:border-l lg:border-t-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Properties</p>
          <dl className="mt-3 flex flex-col gap-3 text-xs">
            <div>
              <dt className="text-ink-faint">Submitter</dt>
              <dd className="break-all font-mono text-ink-muted">{caseRecord.submitter}</dd>
            </div>
            <div>
              <dt className="text-ink-faint">Respondent</dt>
              <dd className="break-all font-mono text-ink-muted">{caseRecord.respondent || "None"}</dd>
            </div>
            <div>
              <dt className="text-ink-faint">Evidence ({caseRecord.evidenceRefs.length})</dt>
              <dd className="mt-1 flex flex-col gap-1">
                {caseRecord.evidenceRefs.length === 0 && <span className="text-ink-faint">None attached</span>}
                {caseRecord.evidenceRefs.map((ref) => (
                  <span key={ref} className="truncate font-mono text-[11px] text-ink-muted" title={ref}>
                    {ref}
                  </span>
                ))}
              </dd>
            </div>
            <div>
              <dt className="text-ink-faint">Cited precedents</dt>
              <dd className="text-ink-muted">{ruling.citedPrecedentIds.length}</dd>
            </div>
          </dl>
        </aside>
      </div>

      <StatusBar>
        <span>{caseRecord.evidenceRefs.length} evidence item{caseRecord.evidenceRefs.length === 1 ? "" : "s"}</span>
        <span className="text-ink-faint">·</span>
        <span>{ruling.citedPrecedentIds.length} citation{ruling.citedPrecedentIds.length === 1 ? "" : "s"}</span>
      </StatusBar>
    </div>
  );
}
