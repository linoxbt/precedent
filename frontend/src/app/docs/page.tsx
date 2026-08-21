import Link from "next/link";
import { GENLAYER_NETWORKS } from "@/lib/genlayerConfig";
import { getActiveNetworkServer } from "@/lib/activeNetworkServer";
import { HelpIcon } from "@/components/icons";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "architecture", label: "Architecture" },
  { id: "contract", label: "Contract API" },
  { id: "genlayer", label: "GenLayer Concepts" },
  { id: "deploy", label: "Deploy Your Own" },
  { id: "env", label: "Environment Variables" },
];

const METHODS = [
  {
    sig: "register_domain(tag: str, rubric: str) -> None",
    kind: "write",
    body: "Registers a new case domain and its grading rubric. The rubric is the criteria text used when validators grade a ruling under the Non-Comparative Equivalence Principle.",
  },
  {
    sig: "submit_case(case_id: str, domain: str, description: str, evidence_refs: list[str], respondent: str = \"\") -> None",
    kind: "write",
    body: "Opens a case. Retrieves the domain's nearest precedents, has the Leader draft a ruling grounded in them, and grades the ruling under the Non-Comparative Equivalence Principle before accepting and embedding it as precedent.",
  },
  {
    sig: "appeal(case_id: str) -> None",
    kind: "write, payable",
    body: "Posts a bond and triggers GenLayer's native escalating validator round. An overturned ruling replaces the original as the domain's controlling precedent; an affirmed ruling forfeits the bond.",
  },
  {
    sig: "get_ruling(case_id: str) -> dict",
    kind: "view",
    body: "Returns the ruling's outcome, rationale, cited precedent IDs, confidence, and round.",
  },
  {
    sig: "get_case(case_id: str) -> dict",
    kind: "view",
    body: "Returns the case's domain, description, evidence references, submitter, respondent, status, and message count.",
  },
  {
    sig: "send_case_message(case_id: str, text: str) -> None",
    kind: "write",
    body: "Posts a message to a case's private thread. Only the case's submitter or respondent may call this; anyone else reverts.",
  },
  {
    sig: "get_case_messages(case_id: str) -> list",
    kind: "view",
    body: "Returns every message on a case's thread, oldest first, as {sender, text} objects.",
  },
  {
    sig: "get_appeal(case_id: str) -> dict",
    kind: "view",
    body: "Returns the appellant, bond, status (affirmed/overturned), and the escalated ruling for a case's appeal, if one exists.",
  },
  {
    sig: "list_domains() -> list",
    kind: "view",
    body: "Returns every registered domain's tag, rubric, and integrator address.",
  },
  {
    sig: "get_domain_precedents(domain: str, limit: int = 20) -> list",
    kind: "view",
    body: "Returns the most recent precedent case IDs and outcome summaries for a domain.",
  },
];

export const dynamic = "force-dynamic";

export default async function DocsPage() {
  const network = await getActiveNetworkServer();
  const cfg = GENLAYER_NETWORKS[network];
  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="flex items-center gap-2.5 border-b border-chrome-border px-4 py-3">
        <HelpIcon className="h-4 w-4 text-accent-500" />
        <h1 className="text-sm font-semibold text-ink">Precedent Engine: Help</h1>
      </div>

      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-[1fr_180px]">
        <div className="min-w-0">
          <p className="max-w-2xl text-sm text-ink-muted">
            A trustless, precedent-consistent adjudication protocol built on GenLayer&apos;s
            Intelligent Contracts and Optimistic Democracy consensus.
          </p>

          <section id="overview" className="mt-10 scroll-mt-6">
            <h2 className="text-lg font-semibold text-ink">Overview</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Precedent Engine is infrastructure, not an app: a callable judgment API that any
              contract, on GenLayer or elsewhere, can invoke when it needs a human-judgment-shaped
              decision made trustlessly. Every ruling is embedded into an on-chain vector store as
              precedent, and every new ruling is checked for consistency against similar past
              rulings before being accepted. It behaves like a rudimentary common-law court:
              rulings compound into a growing, queryable, self-consistent body of case law instead
              of each decision being an isolated judgment call.
            </p>
          </section>

          <section id="architecture" className="mt-10 scroll-mt-6">
            <h2 className="text-lg font-semibold text-ink">Architecture</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              The frontend talks to a single Intelligent Contract deployed on GenLayer Asimov
              Testnet through <code className="rounded bg-chrome px-1">genlayer-js</code>. Reads
              (view calls) go through a shared read-only client; writes are signed by whichever
              wallet is connected via Reown AppKit.
            </p>
            <div className="mt-3 overflow-x-auto rounded-sm border border-chrome-border bg-ink p-4 font-mono text-xs leading-relaxed text-white">
              <pre>{`Browser (React) ──▶ genlayer-js client ──▶ GenLayer Asimov Testnet
                                              │
                          PrecedentEngine Intelligent Contract
                                              │
                     ┌────────────────────────┼────────────────────────┐
                     ▼                        ▼                        ▼
             Leader drafts ruling    Non-Comparative EP grading   Precedent write-back
             (gl.exec_prompt via     (validators check reasoning   (deterministic
              prompt_non_comparative) vs. domain rubric)            hashing embedding)`}</pre>
            </div>
          </section>

          <section id="contract" className="mt-10 scroll-mt-6">
            <h2 className="text-lg font-semibold text-ink">Contract API</h2>
            <div className="mt-3 flex flex-col gap-3">
              {METHODS.map((m) => (
                <div key={m.sig} className="panel p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <code className="text-xs font-semibold text-ink">{m.sig}</code>
                    <span className="whitespace-nowrap rounded-sm border border-chrome-border bg-chrome-pane px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
                      {m.kind}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{m.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="genlayer" className="mt-10 scroll-mt-6">
            <h2 className="text-lg font-semibold text-ink">GenLayer Concepts</h2>
            <div className="mt-3 flex flex-col gap-3">
              <div className="panel p-4">
                <h3 className="text-sm font-semibold text-ink">Non-Comparative Equivalence Principle</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                  Used to grade &quot;does this ruling respect precedent,&quot; not just &quot;is
                  this a reasonable answer.&quot; The Leader drafts a ruling from the case,
                  evidence, and retrieved precedents; other validators independently check whether
                  that ruling is well-reasoned and consistent with the domain&apos;s rubric; they
                  don&apos;t have to reproduce it verbatim.
                </p>
              </div>
              <div className="panel p-4">
                <h3 className="text-sm font-semibold text-ink">Escalating appeal ladder</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                  GenLayer&apos;s native appeal mechanism doubles the validator panel on each
                  appeal round automatically. Precedent Engine uses this directly as its appellate
                  hierarchy, with no custom escalation logic required.
                </p>
              </div>
            </div>
          </section>

          <section id="deploy" className="mt-10 scroll-mt-6">
            <h2 className="text-lg font-semibold text-ink">Deploy Your Own</h2>
            <ol className="mt-2 flex flex-col gap-2 text-sm leading-relaxed text-ink-muted">
              <li>
                1. Install the CLI: <code className="rounded bg-chrome px-1">npm install genlayer</code>
              </li>
              <li>
                2. Create and fund a testnet account:{" "}
                <code className="rounded bg-chrome px-1">genlayer account create</code>, then claim GEN
                from the{" "}
                <a
                  href="https://testnet-faucet.genlayer.foundation/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-accent-600 underline"
                >
                  testnet faucet
                </a>
                .
              </li>
              <li>
                3. Deploy: <code className="rounded bg-chrome px-1">genlayer deploy --contract contracts/precedent_engine.py</code>
              </li>
              <li>
                4. Register a domain:{" "}
                <code className="rounded bg-chrome px-1">genlayer write &lt;address&gt; register_domain --args &lt;tag&gt; &lt;rubric&gt;</code>
              </li>
              <li>5. Set the environment variables below and redeploy the frontend.</li>
            </ol>
          </section>

          <section id="env" className="mt-10 scroll-mt-6 pb-12">
            <h2 className="text-lg font-semibold text-ink">Environment Variables</h2>
            <div className="mt-3 overflow-x-auto rounded-sm border border-chrome-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-chrome-pane text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  <tr>
                    <th className="px-4 py-2.5">Variable</th>
                    <th className="px-4 py-2.5">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-chrome-border">
                  <tr>
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-ink">
                      NEXT_PUBLIC_PRECEDENT_ENGINE_ADDRESS_ASIMOV
                      <br />
                      NEXT_PUBLIC_PRECEDENT_ENGINE_ADDRESS_BRADBURY
                      <br />
                      NEXT_PUBLIC_PRECEDENT_ENGINE_ADDRESS_STUDIO
                    </td>
                    <td className="px-4 py-2.5 text-ink-muted">
                      Deployed contract address per network. At least one is required; the
                      network switcher only offers a network whose address is set.
                    </td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-ink">
                      NEXT_PUBLIC_GENLAYER_RPC_URL_ASIMOV
                      <br />
                      NEXT_PUBLIC_GENLAYER_RPC_URL_BRADBURY
                      <br />
                      NEXT_PUBLIC_GENLAYER_RPC_URL_STUDIO
                    </td>
                    <td className="px-4 py-2.5 text-ink-muted">
                      Optional per-network RPC override; each defaults to GenLayer&apos;s own
                      public RPC for that network.
                    </td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-ink">
                      NEXT_PUBLIC_REOWN_PROJECT_ID
                    </td>
                    <td className="px-4 py-2.5 text-ink-muted">
                      Wallet-connect project ID from{" "}
                      <a
                        href="https://cloud.reown.com"
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-accent-600 underline"
                      >
                        cloud.reown.com
                      </a>
                      .
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 panel p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">This deployment</p>
              <dl className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
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

            <p className="mt-5 text-sm text-ink-muted">
              Ready to try it? <Link href="/submit" className="font-medium text-accent-600 underline">Submit a case</Link> or{" "}
              <Link href="/dashboard" className="font-medium text-accent-600 underline">browse the dashboard</Link>.
            </p>
          </section>
        </div>

        <aside className="hidden lg:block">
          <nav className="sticky top-4 flex flex-col gap-0.5 text-xs">
            <p className="mb-1 px-2 font-semibold uppercase tracking-wide text-ink-faint">On this page</p>
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="rounded-sm px-2 py-1 text-ink-muted transition-colors hover:bg-chrome-hover hover:text-ink"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </aside>
      </div>
    </div>
  );
}
