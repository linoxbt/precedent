import Link from "next/link";

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

export default function LandingPage() {
  return (
    <div>
      <section className="border-b border-navy-100 bg-gradient-to-b from-navy-50/60 to-parchment px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gold">
            On-chain case law for AI judgment
          </p>
          <h1 className="font-serif text-4xl font-semibold leading-tight text-navy-900 sm:text-5xl">
            Every other AI arbitration bot forgets its last ruling.
            <br />
            This one doesn&apos;t.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-navy-600">
            Precedent Engine is a trustless, precedent-consistent adjudication protocol for the
            agentic economy — a callable judgment API that any contract can invoke, built on
            GenLayer&apos;s Intelligent Contracts and Optimistic Democracy consensus.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/dashboard" className="btn-primary">
              Explore the Dashboard
            </Link>
            <Link href="/docs" className="btn-secondary">
              Read the Docs
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gold">
              How it works
            </p>
            <h2 className="font-serif text-3xl font-semibold text-navy-900">
              A rudimentary common-law court
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div key={step.n} className="card p-6">
                <span className="font-serif text-3xl font-semibold text-gold-light">{step.n}</span>
                <h3 className="mt-3 font-serif text-lg font-semibold text-navy-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-500">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-navy-100 bg-navy-50/40 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gold">
              Why it&apos;s different
            </p>
            <h2 className="font-serif text-3xl font-semibold text-navy-900">
              Rulings that compound, instead of isolated judgment calls
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-6">
                <h3 className="font-serif text-lg font-semibold text-navy-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-500">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-2xl rounded-xl border border-navy-100 bg-navy-800 p-10 text-center">
          <h2 className="font-serif text-2xl font-semibold text-parchment-100">
            Any protocol that needs a trustless judgment call can plug into this
          </h2>
          <p className="mt-3 text-sm text-navy-200">
            instead of building their own arbitration stack from scratch.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/submit" className="btn-primary">
              Submit a Case
            </Link>
            <Link
              href="/explorer/freelance-delivery-disputes"
              className="rounded-lg border border-navy-500 px-5 py-2.5 text-sm font-medium text-parchment-100 transition-colors hover:bg-navy-700"
            >
              Browse Precedent
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
