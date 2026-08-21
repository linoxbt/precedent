import { notFound } from "next/navigation";
import { domainDisplayName, getDomain, getDomainPrecedents } from "@/lib/genlayerClient";
import ExplorerTable from "@/components/ExplorerTable";
import StatusBar from "@/components/StatusBar";
import { FolderIcon } from "@/components/icons";

export default async function PrecedentExplorerPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain: domainTag } = await params;
  const domain = await getDomain(domainTag).catch(() => undefined);
  if (!domain) {
    notFound();
  }

  const precedents = await getDomainPrecedents(domainTag);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-chrome-border px-4 py-3">
        <span className="h-8 w-9 shrink-0">
          <FolderIcon />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold text-ink">{domainDisplayName(domain.tag)}</h1>
          <p className="truncate text-xs text-ink-faint">{domain.rubric}</p>
        </div>
      </div>

      <ExplorerTable precedents={precedents} />

      <StatusBar>
        <span>{precedents.length} {precedents.length === 1 ? "item" : "items"}</span>
      </StatusBar>
    </div>
  );
}
