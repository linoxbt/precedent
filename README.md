# Precedent Engine

A trustless, precedent-consistent adjudication protocol for the agentic economy — on-chain
case law for AI judgment, built on GenLayer's Intelligent Contracts and Optimistic Democracy
consensus. Built from `PrecedentEngineBuildSpec.pdf` (GenLayer Hackathon technical spec).

**This is a real, deployed, working system** — not a mock or a demo shell. The contract below
is live on GenLayer Asimov Testnet, the frontend talks to it directly through `genlayer-js`,
and wallet connection is handled by Reown AppKit. There is no mock-data fallback anywhere in
the app: every page reads live contract state, and every write (`submit_case`, `appeal`,
`register_domain`) is a real signed transaction that runs an LLM-backed validator round.

| | |
|---|---|
| **Live app** | https://precedent-engine.netlify.app |
| **Contract** | [`0xa43d54ab8E1F5B4b84d277D6a3c92d3942De7b5B`](https://explorer-asimov.genlayer.com/address/0xa43d54ab8E1F5B4b84d277D6a3c92d3942De7b5B) |
| **Network** | GenLayer Asimov Testnet (chain id `4221`) |
| **Seeded domain** | `freelance-delivery-disputes` |

Every ruling is graded against similar past rulings in its domain (via GenLayer's
Non-Comparative Equivalence Principle) before being accepted, then written into the domain's
precedent set so future cases can cite it. Rulings can be appealed, triggering GenLayer's
native escalating validator round; an overturned appeal becomes the new controlling precedent.

## Structure

```
contracts/
  precedent_engine.py    GenLayer Intelligent Contract (Python/GenVM), deployed and live
frontend/
  src/app/                Next.js App Router pages — landing, dashboard, submit, case,
                           appeal, explorer, docs
  src/components/         UI components (verdict cards, citation chips, validator panel, ...)
  src/lib/genlayerClient.ts   All contract reads/writes via genlayer-js — no mock fallback
  src/lib/genlayerConfig.ts   Chain config, RPC endpoint, contract address
  src/lib/wagmiConfig.ts      Reown AppKit / wagmi wallet configuration
  src/lib/walletProvider.ts   Bridges the connected wallet into genlayer-js write calls
```

## Contract (`contracts/precedent_engine.py`)

Implements `register_domain`, `submit_case`, `get_ruling`, `get_case`, `get_appeal`,
`list_domains`, `get_domain_precedents`, and `appeal`:

- **`submit_case`** retrieves the domain's top-k nearest precedents, has the Leader draft a
  ruling via `gl.eq_principle.prompt_non_comparative`, and grades it against the domain's
  rubric before accepting and embedding it as precedent.
- **`appeal`** is `payable`; it requires a bond, re-adjudicates via the same non-comparative
  EP call, and if overturned, the new ruling replaces the original as controlling precedent.
  GenLayer's native appeal ladder supplies the larger validator panel automatically.
- State uses GenLayer's typed storage (`TreeMap`, `DynArray`, `@allow_storage @dataclass`)
  rather than raw Python `dict` — plain `dict`/`list` fields are **not** valid Intelligent
  Contract storage types, only valid as transient method arguments.
- Precedent retrieval uses a **deterministic in-contract embedding** (SHA-256 hashing trick,
  see `_embed`) rather than GenLayer's native vector-store primitive. That primitive's exact
  API was still evolving at build time; more importantly, every validator must derive
  bit-identical state from a write, which rules out anything nondeterministic — including
  Python's randomized string hashing or an LLM-derived embedding computed outside an
  `eq_principle` block.
- View methods return `confidence` as a `str`, not `float` — GenVM's calldata encoder does not
  support returning a raw Python `float` from a view call (it's valid in storage, just not in
  an RPC response).

### Non-obvious things learned deploying this for real

These aren't documented clearly anywhere at the time of writing, so they're recorded here for
whoever deploys next:

1. **The `# { "Depends": ... }` runner-directive comment must be the only leading comment
   line.** GenVM's parser folds *every* consecutive leading `#`-comment line into one blob and
   tries to parse it as the directive JSON — a second explanatory comment line directly below
   it (even `#` alone) breaks parsing with a cryptic `trailing characters` `invalid_contract`
   error. Put any file-level documentation in a `"""docstring"""` after the imports instead.
2. **`gl.eq_principle.prompt_non_comparative(fn, task=, criteria=)`'s `fn` must return raw
   input text, not call the LLM itself.** The actual LLM call happens *inside*
   `prompt_non_comparative` (via its own `ExecPromptTemplate` call, built from `fn()`'s
   return value plus `task`/`criteria`) — confirmed from the SDK source at
   `sdk.genlayer.com/v0.1.0/_modules/genlayer/std/eq_principles.html`. Calling
   `gl.exec_prompt()` inside `fn` (as this project's own original build spec's skeleton, and a
   plausible reading of the football-bets/wizard-of-coin examples using `eq_principle_strict_eq`,
   both suggest) silently crashes the GenVM process (`sigterm received`, zero LLM calls) rather
   than raising a catchable error.
3. **`DynArray[T]` fields can't be constructed as `DynArray[T](some_list)`** — assign a plain
   Python list directly to a `DynArray`-typed dataclass field and let the storage layer coerce
   it; the explicit constructor call raises `TypeError: takes 1 positional argument but 2 were
   given`.
4. **Closures passed to `eq_principle.*` must not reference `self`.** They get pickled for
   re-execution (once as leader, again per validator); a contract instance holds live storage
   slot references that aren't picklable in that context (`UserWarning: Detected pickling
   storage class`). Extract any plain values you need from `self` *before* defining the
   closure.
5. **The `genlayer` CLI's `write` command has no way to send `msg.value`** — `--fee-value` sets
   the transaction fee deposit, not the payable call's value, so a CLI-only appeal test always
   fails with "appeal bond must be >= ...". `genlayer-js`'s `writeContract({ value })` (what
   the actual frontend uses) does support it correctly.

## Frontend (`frontend/`)

Next.js 16 (App Router) + TypeScript + Tailwind, styled as a desktop file-explorer interface —
a title bar, a toolbar with back/forward/up/refresh and a breadcrumb address bar, a left
navigation pane listing domains as folders, and a status bar — rather than a typical crypto
dashboard or a conventional web layout. Domains are folders, cases are documents you open,
appeals are Properties dialogs, and submitting a case opens a New Item dialog.

Pages (mapped onto the file-explorer metaphor):
- **`/`** — Landing / welcome screen: hero, pinned shortcuts, how-it-works, feature highlights.
- **`/dashboard`** — "This PC": registered domains rendered as folders with live on-chain item counts.
- **`/submit`** — "New Case" dialog: domain picker (populated from `list_domains`), description,
  evidence links, "Validators reviewing..." state while the real transaction confirms.
- **`/case/[id]`** — An opened case document: verdict + rationale where every "Precedent #ID"
  mention is a clickable chip that expands that precedent inline (hydrated from `get_case` +
  `get_ruling` for each cited ID).
- **`/appeal/[id]`** — A "Properties" dialog: bond input, posts a real `appeal` transaction,
  shows the actual validator count from the transaction receipt's `lastRound.roundValidators`.
- **`/explorer/[domain]`** — An opened folder: a details-view file list of a domain's case law
  (Name / Outcome / Confidence / Round columns), read live from `get_domain_precedents`.
- **`/docs`** — Help window: architecture, full contract API reference, and deploy-your-own
  instructions.

**Wallet connection** is Reown AppKit (`@reown/appkit` + `wagmi`), configured for a custom
GenLayer Asimov Testnet chain definition (`src/lib/chains.ts`). `src/lib/walletProvider.ts`
pulls the connected wallet's raw EIP-1193 provider so `genlayer-js` can sign transactions with
whichever account is connected.

**Data flow** is entirely through `src/lib/genlayerClient.ts` — every exported function calls
the live contract via `genlayer-js`'s `readContract`/`writeContract`. There is no mock branch:
if `NEXT_PUBLIC_PRECEDENT_ENGINE_ADDRESS` isn't set, calls throw explicitly and the UI shows a
"not configured" state rather than silently falling back to fake data.

### Running locally

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000`.

### Environment variables

```
NEXT_PUBLIC_PRECEDENT_ENGINE_ADDRESS=0xa43d54ab8E1F5B4b84d277D6a3c92d3942De7b5B
NEXT_PUBLIC_GENLAYER_RPC_URL=          # optional, defaults to the Asimov testnet RPC
NEXT_PUBLIC_REOWN_PROJECT_ID=          # from https://cloud.reown.com — free signup
```

### Deploying your own instance

1. `npm install genlayer` (the GenLayer CLI, not the SDK — different package).
2. `genlayer network set testnet-asimov`
3. `genlayer account create --name deployer` — creates a local encrypted keystore.
4. Fund the printed address from the [testnet faucet](https://testnet-faucet.genlayer.foundation/)
   (100 GEN per claim, once every 7 days).
5. `genlayer deploy --contract contracts/precedent_engine.py`
6. `genlayer write <address> register_domain --args <tag> "<rubric text>"`
7. Set the three env vars above (with your new contract address) and `npm run build && npm run start`,
   or redeploy to Netlify.

### Demo script

1. Open `/dashboard` — see the live `freelance-delivery-disputes` domain and its real
   precedent count, read straight from the contract.
2. Go to `/submit`, connect a wallet (funded with testnet GEN), and submit a case. The
   transaction runs a full Leader-drafts / validators-grade consensus round — expect it to
   take 20–60 seconds.
3. Land on `/case/[id]` and see the real LLM-generated ruling, with rationale and any cited
   precedents clickable inline.
4. From that page, click "Appeal Ruling," post a bond, and watch the escalated round resolve
   with the real validator count from the chain.
5. Browse `/explorer/freelance-delivery-disputes` to see the accumulated case law.

## Known gaps vs. the spec

- **FR9 (EVM adapter, stretch)** — not built; out of scope for this pass.
- Sandbox note: this project was built and the contract deployed/tested entirely via the
  `genlayer` CLI from a network-restricted development sandbox, so the *browser-side* wallet
  flow (submit/appeal from the live UI) could not be end-to-end tested from within that
  sandbox — outbound HTTPS from a headless browser there is proxied and blocks arbitrary
  third-party RPC/analytics domains (confirmed by the *same* failure hitting completely
  unrelated domains like Coinbase's and Reown's own asset CDN, not just GenLayer's RPC). The
  identical `readContract` code path is confirmed working end-to-end via server-side rendering
  (see `/case/[id]`, which renders real on-chain rulings) and via the CLI directly. Worth a
  real end-to-end click-through on the live Netlify URL from a normal network to confirm the
  write flow (submit/appeal) end to end.
