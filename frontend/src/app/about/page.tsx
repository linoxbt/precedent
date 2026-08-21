import Link from "next/link";
import { GENLAYER_NETWORKS } from "@/lib/genlayerConfig";
import { getActiveNetworkServer } from "@/lib/activeNetworkServer";
import { DocumentIcon, WindowDots } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const network = await getActiveNetworkServer();
  const cfg = GENLAYER_NETWORKS[network];
  return (
    <div className="flex flex-1 items-start justify-center overflow-y-auto bg-chrome p-6">
      <div className="dialog w-full max-w-2xl animate-window-open">
        <div className="flex items-center gap-2 border-b border-chrome-border bg-chrome-titlebar px-4 py-2.5">
          <DocumentIcon className="h-4 w-4 text-accent-500" />
          <span className="text-xs font-semibold text-ink">About.txt</span>
          <WindowDots className="ml-auto" />
        </div>

        <div className="flex flex-col gap-5 bg-white p-6">
          <div>
            <h1 className="text-lg font-semibold text-ink">Precedent Engine</h1>
            <p className="mt-1 text-sm text-ink-muted">
              A trustless, precedent-consistent adjudication protocol for the agentic economy.
            </p>
          </div>

          <div>
            <p className="label mb-1.5">What this is</p>
            <p className="text-sm leading-relaxed text-ink-muted">
              Most AI arbitration tools judge every case in isolation and forget the last one.
              Precedent Engine treats every ruling as case law: each new case is decided against
              the domain&apos;s existing precedent, and an accepted ruling is written back into
              that precedent set for the next case to cite. It behaves like a rudimentary
              common-law court running entirely on-chain.
            </p>
          </div>

          <div>
            <p className="label mb-1.5">How rulings stay consistent</p>
            <p className="text-sm leading-relaxed text-ink-muted">
              Each case is graded with GenLayer&apos;s Non-Comparative Equivalence Principle: a
              Leader validator drafts a ruling grounded in the domain&apos;s nearest precedents,
              and the rest of the validator panel independently checks that it is well-reasoned
              and precedent-consistent, without needing to reproduce it verbatim. Any party can
              appeal by posting a bond, which triggers GenLayer&apos;s native escalating
              validator round; an overturned ruling replaces the original as controlling
              precedent.
            </p>
          </div>

          <div>
            <p className="label mb-1.5">This deployment</p>
            <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-ink-faint">Network</dt>
                <dd className="font-mono text-ink">{cfg.chain.name}</dd>
              </div>
              <div>
                <dt className="text-ink-faint">Contract</dt>
                <dd className="break-all font-mono text-ink">
                  {cfg.contractAddress ? (
                    <a
                      href={`${cfg.explorerUrl}address/${cfg.contractAddress}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent-600 underline"
                    >
                      {cfg.contractAddress}
                    </a>
                  ) : (
                    "not configured"
                  )}
                </dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-chrome-border pt-4">
            <Link href="/submit" className="btn-primary">
              Submit a Case
            </Link>
            <Link href="/docs" className="btn-secondary">
              Read the Docs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
