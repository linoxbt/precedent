# Precedent Engine

A trustless, precedent-consistent adjudication protocol for the agentic economy: on-chain
case law for AI judgment, built on GenLayer's Intelligent Contracts and Optimistic Democracy
consensus. Built from `PrecedentEngineBuildSpec.pdf` (GenLayer Hackathon technical spec).

**This is a real, deployed, working system**, not a mock or a demo shell. The contract below
is live on multiple GenLayer networks, the frontend talks to it directly through `genlayer-js`,
and wallet connection is handled by Reown AppKit. There is no mock-data fallback anywhere in
the app: every page reads live contract state, and every write (`submit_case`, `appeal`,
`register_domain`) is a real signed transaction that runs an LLM-backed validator round.

The title bar's network switcher lets you pick which GenLayer network the app reads and
writes against:

| Network | Chain id | Contract |
|---|---|---|
| Asimov Testnet | `4221` | [`0xDDcE98136028e5343252b9320E894455AA260868`](https://explorer-asimov.genlayer.com/address/0xDDcE98136028e5343252b9320E894455AA260868) |
| Bradbury Testnet | `4221` | same address, same chain as Asimov (see note below) |
| Studio Network | `61999` | [`0x6E7F86B32ae3bC0c2114e04a1c5C6d9C275A59a7`](https://genlayer-explorer.vercel.app/address/0x6E7F86B32ae3bC0c2114e04a1c5C6d9C275A59a7) (stale: predates the messaging feature below, see note) |

**Live app**: https://precedent-engine.netlify.app. **Seeded domain** (registered on every
network above): `freelance-delivery-disputes`.

> **Asimov and Bradbury are the same chain.** Both report chain id `4221`, and querying the
> same address through either RPC returns identical bytecode, identical balances, and
> block heights seconds apart, confirmed directly against both RPC endpoints. They're two
> gateway hostnames for one network, not two separate deployments, so the switcher shows
> them as distinct options (matching GenLayer's own `genlayer network set` choices) but a
> wallet can't actually tell them apart as different chains, and a write against one is
> immediately visible through the other.

> **Studio Network deploys can lag reads for a long time.** A `genlayer deploy`/`register_domain`
> to Studio Network can finalize on-chain (a `genlayer receipt` shows `FINALIZED`) while every
> subsequent read or write against that exact address still 404s ("Contract not found") for
> minutes at a stretch, observed directly this session across two separate fresh deployments.
> Asimov/Bradbury did not exhibit this. Until it's understood, avoid redeploying to Studio
> Network right before a demo; the last confirmed-working Studio address is left in place above
> even though it predates the messaging feature, rather than risk another silent-lag deploy.

Every ruling is graded against similar past rulings in its domain (via GenLayer's
Non-Comparative Equivalence Principle) before being accepted, then written into the domain's
precedent set so future cases can cite it. Rulings can be appealed, triggering GenLayer's
native escalating validator round; an overturned appeal becomes the new controlling precedent.

## Structure

```
contracts/
  precedent_engine.py    GenLayer Intelligent Contract (Python/GenVM), deployed and live
frontend/
  src/app/                Next.js App Router pages: landing, dashboard, submit, case,
                           appeal, explorer, docs
  src/components/         UI components (verdict cards, citation chips, validator panel, ...)
  src/lib/genlayerClient.ts   All contract reads/writes via genlayer-js, no mock fallback
  src/lib/genlayerConfig.ts   Chain config, RPC endpoint, contract address
  src/lib/wagmiConfig.ts      Reown AppKit / wagmi wallet configuration
  src/lib/walletProvider.ts   Bridges the connected wallet into genlayer-js write calls
```

## Contract (`contracts/precedent_engine.py`)

Implements `register_domain`, `submit_case`, `get_ruling`, `get_case`,
`get_appeal`, `list_domains`, `get_domain_precedents`, `appeal`, `send_case_message`, and
`get_case_messages`:

- **`submit_case`** retrieves the domain's top-k nearest precedents, has the Leader draft a
  ruling via `gl.eq_principle.prompt_non_comparative`, and grades it against the domain's
  rubric before accepting and embedding it as precedent. There is no dedicated title field:
  the frontend's "Case Title" input is folded into the first line of `description` (see
  `encodeCaseText`/`decodeCaseText` in `genlayerClient.ts`), so submitting a title costs no
  additional contract storage or redeploy.
- **`appeal`** is `payable`; it requires a bond, re-adjudicates via the same non-comparative
  EP call, and if overturned, the new ruling replaces the original as controlling precedent.
  GenLayer's native appeal ladder supplies the larger validator panel automatically.
- **`send_case_message`** / **`get_case_messages`** implement a private, case-scoped thread
  between a case's submitter and respondent (only those two addresses may post). Each message
  is a JSON-encoded string appended to `CaseRecord.messages: DynArray[str]`, deliberately not
  a new `TreeMap` or a new `bigint`-bearing dataclass: see the storage-encoder bug note below
  for why that restraint matters on this contract specifically.
- State uses GenLayer's typed storage (`TreeMap`, `DynArray`, `@allow_storage @dataclass`)
  rather than raw Python `dict`; plain `dict`/`list` fields are **not** valid Intelligent
  Contract storage types, only valid as transient method arguments.
- Precedent retrieval uses a **deterministic in-contract embedding** (SHA-256 hashing trick,
  see `_embed`) rather than GenLayer's native vector-store primitive. That primitive's exact
  API was still evolving at build time; more importantly, every validator must derive
  bit-identical state from a write, which rules out anything nondeterministic, including
  Python's randomized string hashing or an LLM-derived embedding computed outside an
  `eq_principle` block.
- View methods return `confidence` as a `str`, not `float`: GenVM's calldata encoder does not
  support returning a raw Python `float` from a view call (it's valid in storage, just not in
  an RPC response).

### Non-obvious things learned deploying this for real

These aren't documented clearly anywhere at the time of writing, so they're recorded here for
whoever deploys next:

1. **The `# { "Depends": ... }` runner-directive comment must be the only leading comment
   line.** GenVM's parser folds *every* consecutive leading `#`-comment line into one blob and
   tries to parse it as the directive JSON: a second explanatory comment line directly below
   it (even `#` alone) breaks parsing with a cryptic `trailing characters` `invalid_contract`
   error. Put any file-level documentation in a `"""docstring"""` after the imports instead.
2. **`gl.eq_principle.prompt_non_comparative(fn, task=, criteria=)`'s `fn` must return raw
   input text, not call the LLM itself.** The actual LLM call happens *inside*
   `prompt_non_comparative` (via its own `ExecPromptTemplate` call, built from `fn()`'s
   return value plus `task`/`criteria`), confirmed from the SDK source at
   `sdk.genlayer.com/v0.1.0/_modules/genlayer/std/eq_principles.html`. Calling
   `gl.exec_prompt()` inside `fn` (as this project's own original build spec's skeleton, and a
   plausible reading of the football-bets/wizard-of-coin examples using `eq_principle_strict_eq`,
   both suggest) silently crashes the GenVM process (`sigterm received`, zero LLM calls) rather
   than raising a catchable error.
3. **`DynArray[T]` fields can't be constructed as `DynArray[T](some_list)`**: assign a plain
   Python list directly to a `DynArray`-typed dataclass field and let the storage layer coerce
   it; the explicit constructor call raises `TypeError: takes 1 positional argument but 2 were
   given`.
4. **Closures passed to `eq_principle.*` must not reference `self`.** They get pickled for
   re-execution (once as leader, again per validator); a contract instance holds live storage
   slot references that aren't picklable in that context (`UserWarning: Detected pickling
   storage class`). Extract any plain values you need from `self` *before* defining the
   closure.
5. **The `genlayer` CLI's `write` command has no way to send `msg.value`**: `--fee-value` sets
   the transaction fee deposit, not the payable call's value, so a CLI-only appeal test always
   fails with "appeal bond must be >= ...". `genlayer-js`'s `writeContract({ value })` (what
   the actual frontend uses) does support it correctly.
6. **The pinned GenVM runner has a storage-encoder bug that breaks contracts with more than
   five top-level `TreeMap` fields once a `bigint`-bearing `@allow_storage @dataclass` is added
   to the mix.** An escrow feature (lock/refund of a disputed amount on `submit_case`) was
   built, deployed, and hit `AttributeError: 'int' object has no attribute 'encode'` deep in
   the runner's `storage/_internal/desc_base_types.py` on the very first write, regardless of
   whether the new field used `u256`, `bigint`, or an explicit `bigint()` cast. Bisected across
   twelve isolated diagnostic contracts: not a field-count or dataclass-shape rule in general
   (a 5-`TreeMap` contract with a differently-shaped dataclass also failed), but tied to
   deviating at all from this contract's original, proven-working 5-`TreeMap` schema once a
   `bigint` is involved. No workaround found from contract code; the escrow feature was
   reverted rather than ship a `payable` method with no reliable way to persist the locked
   value, which risked stranding user funds permanently.
7. **The `genlayer` CLI's `--args` flag intermittently drops or mis-splits array elements**,
   independent of the storage bug above: the same `write`/`deploy` command against the same
   contract would sometimes execute with correct arguments and sometimes fail with e.g.
   `TypeError: submit_case() missing 3 required positional arguments`, `__init__() takes 1
   positional argument but 2 were given` (thrown from a *zero-arg* deploy with `--args '[]'`
   explicitly passed), or a case ID that arrives as the Python string `"['some-id']"` instead
   of `'some-id'`. Confirmed as a CLI-only issue: the identical call made directly through
   `genlayer-js`'s `writeContract`/`readContract` (a plain Node script signing with
   `viem/accounts`' `privateKeyToAccount`, the same path the frontend uses) succeeded every
   time with the same arguments. Prefer omitting `--args` entirely for zero-arg calls, and
   don't trust a CLI-reported argument-count/type error as proof the contract itself is wrong
   without reproducing it through the SDK directly.
8. **`genlayer-js`'s `waitForTransactionReceipt` defaults to a 30s timeout** (`waitInterval:
   3000, retries: 10`), which is comfortably shorter than `submit_case`/`appeal` routinely take
   in practice (an LLM `eq_principle` round across every validator). The frontend was throwing
   "ruling did not finalize" on writes that were still genuinely in flight. Fixed by passing
   `{ interval: 3000, retries: 60 }` explicitly for those two calls in `genlayerClient.ts`.

## Frontend (`frontend/`)

Next.js 16 (App Router) + TypeScript + Tailwind, styled as a desktop file-explorer interface:
a title bar, a toolbar with back/forward/up/refresh and a breadcrumb address bar, a left
navigation pane listing domains as folders, and a status bar, rather than a typical crypto
dashboard or a conventional web layout. Practice areas are folders, cases are documents you open,
appeals are Properties dialogs, and submitting a case opens a New Item dialog.

Pages (mapped onto the file-explorer metaphor):
- **`/`**: Landing / welcome screen: hero, pinned shortcuts, how-it-works, feature highlights.
- **`/dashboard`**: "Case Files" / "Practice Areas": registered domains rendered as folders with live on-chain item counts.
- **`/submit`**: "New Case" dialog: domain picker (populated from `list_domains`, with an
  inline "+ Create new folder..." option that calls `register_domain`), required title and
  description, evidence links, "Validators reviewing..." state while the real transaction
  confirms.
- **`/case/[id]`**: An opened case document: verdict + rationale where every "Precedent #ID"
  mention is a clickable chip that expands that precedent inline (hydrated from `get_case` +
  `get_ruling` for each cited ID), plus a messages panel (`send_case_message` /
  `get_case_messages`) for the case's submitter and respondent, and a link into the appeal
  flow as "Open Dispute".
- **`/profile`**: The connected wallet's address, active network, and native balance.
- **`/history`**: Every case the connected wallet submitted or was named respondent on,
  hydrated live from `list_domains` + `get_domain_precedents` + `get_case` across every domain.
- **`/appeal/[id]`**: A "Properties" dialog: bond input, posts a real `appeal` transaction,
  shows the actual validator count from the transaction receipt's `lastRound.roundValidators`.
- **`/explorer/[domain]`**: An opened folder: a details-view file list of a domain's case law
  (Name / Outcome / Confidence / Round columns), read live from `get_domain_precedents`.
- **`/docs`**: Help window: architecture, full contract API reference, and deploy-your-own
  instructions.
- **`/recent`**: "Recent Cases": a details-view list combining rulings across every practice
  area, read live from `list_domains` + `get_domain_precedents` (server-rendered per request,
  not statically cached).
- **`/about`**: An "About.txt" document window: what the protocol does, how consistency is
  enforced, and this deployment's live network/contract details.

**The navigation pane** (`src/components/NavigationPane.tsx`) is resizable by dragging its
right edge (persisted to `localStorage`), its "Case Files" section collapses via its chevron
(also persisted), and right-clicking it (or a long-press on touch) opens a "New folder..."
context menu that registers a domain without leaving the current page. On narrow viewports it
becomes a slide-out drawer instead of a static column, toggled by the hamburger button in the
title bar; `src/lib/NavPaneProvider.tsx` is the small context that lets that button (rendered
in `WindowChrome`) and the drawer itself (rendered in `NavigationPane`, its sibling) agree on
open/closed state.

**Wallet connection** is Reown AppKit (`@reown/appkit` + `wagmi`), configured with two custom
chain definitions (`src/lib/chains.ts`): one for the shared Asimov/Bradbury testnet chain
(`4221`) and one for Studio Network (`61999`). `src/lib/walletProvider.ts` pulls the connected
wallet's raw EIP-1193 provider so `genlayer-js` can sign transactions with whichever account is
connected.

**Network selection** lives in `src/lib/genlayerConfig.ts` (`GENLAYER_NETWORKS`, one entry per
network with its own chain, RPC URL, explorer, and contract address) and
`src/lib/NetworkProvider.tsx` (a client-side `network`/`setNetwork` context, persisted to a
`genlayer-network` cookie so both client components and server-rendered pages, via
`src/lib/activeNetworkServer.ts`, agree on which network is active). Picking a network whose
chain id differs from the wallet's current one (Studio vs. the testnet) also triggers a real
wallet chain switch through wagmi's `useSwitchChain`.

**Data flow** is entirely through `src/lib/genlayerClient.ts`: every exported function takes an
explicit `network` argument and calls that network's live contract via `genlayer-js`'s
`readContract`/`writeContract`. There is no mock branch: if a network's contract address isn't
configured, calls throw explicitly and the UI shows a "not configured" state for that network
rather than silently falling back to fake data.

### Running locally

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000`.

### Environment variables

```
NEXT_PUBLIC_PRECEDENT_ENGINE_ADDRESS_ASIMOV=0xDDcE98136028e5343252b9320E894455AA260868
NEXT_PUBLIC_PRECEDENT_ENGINE_ADDRESS_BRADBURY=0xDDcE98136028e5343252b9320E894455AA260868
NEXT_PUBLIC_PRECEDENT_ENGINE_ADDRESS_STUDIO=0x6E7F86B32ae3bC0c2114e04a1c5C6d9C275A59a7

NEXT_PUBLIC_GENLAYER_RPC_URL_ASIMOV=   # optional override per network; each
NEXT_PUBLIC_GENLAYER_RPC_URL_BRADBURY= # defaults to GenLayer's own public RPC
NEXT_PUBLIC_GENLAYER_RPC_URL_STUDIO=   # for that network

NEXT_PUBLIC_REOWN_PROJECT_ID=          # from https://cloud.reown.com, free signup
```

At least one `NEXT_PUBLIC_PRECEDENT_ENGINE_ADDRESS_*` is required; the switcher only offers a
network whose address is set. These are read via literal `process.env.NEXT_PUBLIC_*` member
expressions in `genlayerConfig.ts`, not a helper keyed by a string: Next.js only inlines
`NEXT_PUBLIC_*` vars into the client bundle when it can statically see the literal access, so a
dynamic `process.env[name]` lookup silently resolves to `undefined` client-side even though it
still works server-side, a real bug hit and fixed while building this.

### Deploying your own instance

1. `npm install genlayer` (the GenLayer CLI, not the SDK; a different package).
2. `genlayer network set testnet-asimov`
3. `genlayer account create --name deployer`: creates a local encrypted keystore.
4. Fund the printed address from the [testnet faucet](https://testnet-faucet.genlayer.foundation/)
   (100 GEN per claim, once every 7 days).
5. `genlayer deploy --contract contracts/precedent_engine.py`
6. `genlayer write <address> register_domain --args <tag> "<rubric text>"`
7. Set the three env vars above (with your new contract address) and `npm run build && npm run start`,
   or redeploy to Netlify.

### Demo script

1. Open `/dashboard`: see the live `freelance-delivery-disputes` domain and its real
   precedent count, read straight from the contract.
2. Go to `/submit`, connect a wallet (funded with testnet GEN), and submit a case. The
   transaction runs a full Leader-drafts / validators-grade consensus round; expect it to
   take 20–60 seconds.
3. Land on `/case/[id]` and see the real LLM-generated ruling, with rationale and any cited
   precedents clickable inline.
4. From that page, click "Appeal Ruling," post a bond, and watch the escalated round resolve
   with the real validator count from the chain.
5. Browse `/explorer/freelance-delivery-disputes` to see the accumulated case law.

## Known gaps vs. the spec

- **FR9 (EVM adapter, stretch)**: not built; out of scope for this pass.
- Sandbox note: this project was built and the contract deployed/tested entirely via the
  `genlayer` CLI from a network-restricted development sandbox, so the *browser-side* wallet
  flow (submit/appeal from the live UI) could not be end-to-end tested from within that
  sandbox; outbound HTTPS from a headless browser there is proxied and blocks arbitrary
  third-party RPC/analytics domains (confirmed by the *same* failure hitting completely
  unrelated domains like Coinbase's and Reown's own asset CDN, not just GenLayer's RPC). The
  identical `readContract` code path is confirmed working end-to-end via server-side rendering
  (see `/case/[id]`, which renders real on-chain rulings) and via the CLI directly. Worth a
  real end-to-end click-through on the live Netlify URL from a normal network to confirm the
  write flow (submit/appeal) end to end.
