# Precedent Engine

A trustless, precedent-consistent adjudication protocol for the agentic economy — on-chain
case law for AI judgment, built on GenLayer's Intelligent Contracts and Optimistic Democracy
consensus. Built from `PrecedentEngineBuildSpec.pdf` (GenLayer Hackathon technical spec).

Every ruling is graded against similar past rulings in its domain (via GenLayer's
Non-Comparative Equivalence Principle) before being accepted, then written into the domain's
precedent set so future cases can cite it. Rulings can be appealed, triggering GenLayer's
native escalating validator round; an overturned appeal becomes the new controlling precedent.

## Structure

```
contracts/
  precedent_engine.py    GenLayer Intelligent Contract (Python/GenVM)
frontend/
  src/app/                Next.js App Router pages
  src/components/         UI components (verdict cards, citation chips, validator panel, ...)
  src/lib/mockData.ts     Seeded demo domains/cases/precedents/appeals
  src/lib/genlayerClient.ts  Single seam between UI and chain — mock-backed today, real
                             GenLayerJS calls are sketched inline and ready to wire in
```

## Contract (`contracts/precedent_engine.py`)

Implements the spec's `register_domain`, `submit_case`, `get_ruling`, `get_case`,
`get_domain_precedents`, and `appeal` methods:

- **`submit_case`** retrieves the domain's top-k nearest precedents, has the Leader draft a
  structured ruling (outcome, rationale, cited precedent IDs, confidence) via
  `gl.exec_prompt`, then grades it with `gl.eq_principle.prompt_non_comparative` against the
  domain's rubric before accepting and embedding it as precedent.
- **`appeal`** is `payable`; it requires a bond, re-adjudicates via the same non-comparative
  EP call with a larger panel (GenLayer's native appeal ladder supplies this automatically),
  and if overturned, the new ruling replaces the original as controlling precedent.
- Precedent retrieval prefers a native `gl.vector_store` primitive and falls back to an
  in-contract cosine-similarity scan over stored embeddings if that primitive isn't available
  in the SDK yet — confirm exact method names against `sdk.genlayer.com` before deploying.

This is implementation-ready per the GenLayer Intelligent Contract pattern, not a copy-paste
final artifact — deploy and test it in GenLayer Studio first.

## Frontend (`frontend/`)

Next.js 16 (App Router) + TypeScript + Tailwind, styled per the spec's UI brief: a
legal-tech / case-management look (deep navy `#1f3a5f` + off-white, serif display headings,
card layouts) rather than a typical crypto dashboard.

Pages:
- **`/dashboard`** — Domain Dashboard: domain cards with live precedent counts + sparkline
- **`/submit`** — Submit Case: domain picker, description, evidence links, "Validators
  reviewing..." loading state
- **`/case/[id]`** — Case & Ruling View, the centerpiece: verdict card + rationale where every
  "Precedent #ID" mention is a clickable chip that expands that precedent inline
- **`/appeal/[id]`** — Appeal Flow: bond input, validator panel visibly doubling (3 → 6),
  live outcome
- **`/explorer/[domain]`** — Precedent Explorer: searchable, expandable list of a domain's
  case law

Data flows through `src/lib/genlayerClient.ts`, the single seam between the UI and the chain.
Every exported function has the shape a real GenLayerJS call would have; today it resolves
against seeded mock data (`src/lib/mockData.ts`) with simulated consensus-round latency so
loading states behave realistically. The real GenLayerJS calls are written inline as comments
next to each mock fallback.

### Running locally

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` — redirects to `/dashboard`.

### Pointing at a real deployment

Copy `.env.example` to `.env.local` and set both variables to a deployed contract; when
`NEXT_PUBLIC_PRECEDENT_ENGINE_ADDRESS` is set, `genlayerClient.ts` takes the live-contract
branch instead of mock data (the commented GenLayerJS calls in that file are ready to
uncomment and wire up):

```bash
npm install genlayer-js
```

```
NEXT_PUBLIC_PRECEDENT_ENGINE_ADDRESS=0x...
NEXT_PUBLIC_GENLAYER_RPC_URL=https://...
```

### Demo script

The seeded data (`frontend/src/lib/mockData.ts`) is built to walk the spec's 3-minute demo
script end to end:

1. Open `/dashboard` — "Freelance Delivery Disputes" already has 6 precedents.
2. Submit a case that's a near-duplicate of Precedent #FDD-0001 (a 2-day delay within a
   grace-period clause) — the ruling cites it directly. Click the citation chip to expand it.
3. Submit a near-miss case (same 2-day delay, but "time is of the essence" with no grace
   period) — the ruling explicitly explains why it departs from #FDD-0001.
4. Appeal that ruling from its Case & Ruling View — watch the validator panel expand 3 → 6 and
   the appeal outcome overturn the original ruling, replacing it as controlling precedent.
5. Browse `/explorer/freelance-delivery-disputes` to see the full accumulated case law.

## Known gaps vs. the spec

- **FR9 (EVM adapter, stretch)** — not built; out of scope for this pass.
- **Vector store primitive** — the contract targets `gl.vector_store`; confirm the exact
  method names against the current GenLayer SDK before deploying (see the fallback note in
  `precedent_engine.py`).
- The frontend runs entirely on mock data until a contract is deployed and
  `NEXT_PUBLIC_PRECEDENT_ENGINE_ADDRESS` is set — GenLayer Studio/testnet and live LLM calls
  weren't reachable from the build environment this was assembled in.
