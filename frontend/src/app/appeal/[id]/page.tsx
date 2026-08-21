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
import { GavelIcon, WindowDots } from "@/components/icons";

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
    <div className="flex flex-1 items-start justify-center overflow-y-auto bg-chrome p-6">
      <div className="dialog w-full max-w-lg animate-window-open">
        <div className="flex items-center gap-2 border-b border-chrome-border bg-chrome-titlebar px-4 py-2.5">
          <GavelIcon className="h-4 w-4 text-accent-500" />
          <span className="text-xs font-semibold text-ink">
            Case #{caseRecord.id} Properties: Appeal
          </span>
          <WindowDots className="ml-auto" />
        </div>

        <div className="border-b border-chrome-border bg-chrome-pane px-5 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
            {domain ? domainDisplayName(domain.tag) : caseRecord.domain}
          </p>
          <p className="mt-1 text-sm font-semibold text-ink">Original Ruling: {outcomeLabel(ruling.outcome)}</p>
          <p className="text-xs text-ink-faint">
            Round {ruling.round} · {(ruling.confidence * 100).toFixed(0)}% confidence
          </p>
        </div>

        <AppealPanel caseId={caseRecord.id} originalRuling={ruling} existingAppeal={existingAppeal} />
      </div>
    </div>
  );
}
