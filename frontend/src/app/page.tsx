import Link from "next/link";
import { AppIconMark, DocumentIcon, FolderIcon, HelpIcon } from "@/components/icons";

const STEPS = [
  {
    n: "01",
    title: "Submit a case",
    body: "A case description, evidence links, and a domain tag go to the contract. No off-chain arbitration service, no black-box API.",
  },
  {
    n: "02",
    title: "Precedent is retrieved",
    body: "The contract pulls the domain's most similar past rulings before it drafts anything — the ruling is grounded in case law, not asked to invent one from scratch.",
  },
  {
    n: "03",
    title: "Validators grade the ruling",
    body: "GenLayer's Non-Comparative Equivalence Principle checks whether the ruling is well-reasoned and precedent-consistent — not whether it matches a canonical answer.",
  },
  {
    n: "04",
    title: "It becomes precedent",
    body: "An accepted ruling is written back into the domain's case law, citable by every case that follows. Appeals that overturn a ruling replace it as the new controlling precedent.",
  },
];

const FEATURES = [
  {
    title: "Precedent-consistent by construction",
    body: "Every ruling cites the precedent it relied on, or explains exactly why it departed. Cross-domain leakage is treated as a bug, not a feature.",
  },
  {
    title: "A real appeal ladder",
    body: "Any party can post a bond and escalate. GenLayer's native appeal mechanism doubles the validator panel automatically — no custom escalation logic required.",
  },
  {
    title: "Fully auditable",
    body: "Rationale and cited precedent IDs are persisted on-chain. No ruling is ever a bare boolean with no explanation attached.",
  },
];

const SHORTCUTS = [
  { href: "/dashboard", label: "Domains", icon: <FolderIcon /> },
  { href: "/explorer/freelance-delivery-disputes", label: "Browse Precedent", icon: <FolderIcon /> },
  { href: "/submit", label: "New Case", icon: <DocumentIcon /> },
  { href: "/docs", label: "Help", icon: <HelpIcon /> },
];

export default function LandingPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-chrome">
      <section className="border-b border-chrome-border bg-white px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <span className="mx-auto mb-5 block h-14 w-14">
            <AppIconMark />
          </span>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent-600">
            On-chain case law for AI judgment
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            Every other AI arbitration bot forgets its last ruling.
            <br />
            This one doesn&apos;t.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-ink-muted">
            Precedent Engine is a trustless, precedent-consistent adjudication protocol for the
            agentic economy — a callable judgment API that any contract can invoke, built on
            GenLayer&apos;s Intelligent Contracts and Optimistic Democracy consensus.
          </p>

          <div className="mx-auto mt-10 flex max-w-xl flex-wrap items-start justify-center gap-2">
            {SHORTCUTS.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="flex w-24 flex-col items-center gap-1.5 rounded-sm px-2 py-3 text-center hover:bg-chrome-hover"
              >
                <span className="h-10 w-11">{s.icon}</span>
                <span className="text-[11px] font-medium text-ink">{s.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-accent-600">
              How it works
            </p>
            <h2 className="text-2xl font-semibold text-ink">A rudimentary common-law court</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div key={step.n} className="panel p-5">
                <span className="text-2xl font-semibold text-accent-400">{step.n}</span>
                <h3 className="mt-2 text-sm font-semibold text-ink">{step.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-chrome-border bg-chrome-pane px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-accent-600">
              Why it&apos;s different
            </p>
            <h2 className="text-2xl font-semibold text-ink">
              Rulings that compound, instead of isolated judgment calls
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="panel p-5">
                <h3 className="text-sm font-semibold text-ink">{f.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-2xl rounded-sm border border-chrome-border bg-white p-8 text-center shadow-panel">
          <h2 className="text-xl font-semibold text-ink">
            Any protocol that needs a trustless judgment call can plug into this
          </h2>
          <p className="mt-2 text-sm text-ink-faint">
            instead of building their own arbitration stack from scratch.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/submit" className="btn-primary">
              Submit a Case
            </Link>
            <Link href="/explorer/freelance-delivery-disputes" className="btn-secondary">
              Browse Precedent
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
