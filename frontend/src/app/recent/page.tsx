import Link from "next/link";
import { getDomainPrecedents, listDomains } from "@/lib/genlayerClient";
import { isContractConfigured, GENLAYER_NETWORKS } from "@/lib/genlayerConfig";
import { getActiveNetworkServer } from "@/lib/activeNetworkServer";
import ExplorerTable from "@/components/ExplorerTable";
import StatusBar from "@/components/StatusBar";
import { RecentIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function RecentCasesPage() {
  const network = await getActiveNetworkServer();
  if (!isContractConfigured(network)) {
    return (
      <div className="flex flex-1 items-start justify-center p-8">
        <div className="panel max-w-md p-6 text-sm text-ink-muted">
          No contract is configured on {GENLAYER_NETWORKS[network].label} yet. See the{" "}
          <Link href="/docs" className="font-medium text-accent-600 underline">
            Help
          </Link>{" "}
          window for deployment instructions, or switch networks above.
        </div>
      </div>
    );
  }

  const domains = await listDomains(network);
  const perDomain = await Promise.all(domains.map((d) => getDomainPrecedents(network, d.tag)));
  const precedents = perDomain.flat();

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-chrome-border px-4 py-3">
        <span className="h-7 w-7 shrink-0 text-accent-500">
          <RecentIcon className="h-full w-full" />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold text-ink">Recent Cases</h1>
          <p className="truncate text-xs text-ink-faint">
            Combined case law across every practice area
          </p>
        </div>
      </div>

      {precedents.length === 0 ? (
        <div className="p-4">
          <div className="panel p-6 text-sm text-ink-muted">
            No rulings yet. Once a case is submitted and ruled on, it will appear here.
          </div>
        </div>
      ) : (
        <ExplorerTable precedents={precedents} />
      )}

      <StatusBar>
        <span>{precedents.length} item{precedents.length === 1 ? "" : "s"}</span>
        <span className="text-ink-faint">·</span>
        <span>{domains.length} practice area{domains.length === 1 ? "" : "s"}</span>
      </StatusBar>
    </div>
  );
}
