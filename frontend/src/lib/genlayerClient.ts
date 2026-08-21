import { createClient } from "genlayer-js";
import type { Address } from "genlayer-js/types";
import { GENLAYER_NETWORKS, isContractConfigured, type GenLayerNetworkKey } from "./genlayerConfig";
import type { Appeal, Case, DomainConfig, Precedent, Ruling } from "./types";

/**
 * GenLayerJS wiring for the Precedent Engine Intelligent Contract.
 *
 * Every export takes an explicit `network` (asimov / bradbury / studio):
 * reads go through a shared read-only client per network, and writes
 * (submit_case, appeal, withdraw_escrow, register_domain) are signed by
 * the connected wallet against whichever network is active. There is no
 * mock-data fallback: if a network's contract address isn't configured,
 * calls throw explicitly rather than silently returning fake data.
 */

type EIP1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

function requireAddress(network: GenLayerNetworkKey): Address {
  const cfg = GENLAYER_NETWORKS[network];
  if (!isContractConfigured(network)) {
    throw new Error(
      `Precedent Engine contract is not configured on ${cfg.label}. Set its NEXT_PUBLIC_PRECEDENT_ENGINE_ADDRESS_* env var.`
    );
  }
  return cfg.contractAddress as Address;
}

const readClients = new Map<GenLayerNetworkKey, ReturnType<typeof createClient>>();

function readClientFor(network: GenLayerNetworkKey) {
  let client = readClients.get(network);
  if (!client) {
    const cfg = GENLAYER_NETWORKS[network];
    client = createClient({ chain: cfg.chain, endpoint: cfg.rpcUrl });
    readClients.set(network, client);
  }
  return client;
}

function writeClientFor(network: GenLayerNetworkKey, provider: EIP1193Provider, account: Address) {
  const cfg = GENLAYER_NETWORKS[network];
  return createClient({
    chain: cfg.chain,
    endpoint: cfg.rpcUrl,
    provider: provider as never,
    account,
  });
}

/** Validator count that actually reviewed a transaction's final round, read straight off the receipt. */
function extractValidatorCount(receipt: unknown): number | undefined {
  const lastRound = (receipt as { lastRound?: { roundValidators?: unknown[] } } | undefined)
    ?.lastRound;
  return Array.isArray(lastRound?.roundValidators) ? lastRound.roundValidators.length : undefined;
}

export async function listDomains(network: GenLayerNetworkKey): Promise<DomainConfig[]> {
  const address = requireAddress(network);
  const result = (await readClientFor(network).readContract({
    address,
    functionName: "list_domains",
    args: [],
  })) as { tag: string; rubric: string; integrator: string }[];

  return result.map((d) => ({
    tag: d.tag,
    rubric: d.rubric,
    integrator: d.integrator,
  }));
}

export async function getDomain(network: GenLayerNetworkKey, tag: string): Promise<DomainConfig | undefined> {
  const domains = await listDomains(network);
  return domains.find((d) => d.tag === tag);
}

export async function getDomainPrecedentSummaries(
  network: GenLayerNetworkKey,
  domain: string,
  limit = 50
): Promise<{ caseId: string; outcomeSummary: string }[]> {
  const address = requireAddress(network);
  const result = (await readClientFor(network).readContract({
    address,
    functionName: "get_domain_precedents",
    args: [domain, limit],
  })) as { case_id: string; outcome_summary: string }[];

  return result.map((r) => ({ caseId: r.case_id, outcomeSummary: r.outcome_summary }));
}

export async function getCase(network: GenLayerNetworkKey, caseId: string): Promise<Case | undefined> {
  const address = requireAddress(network);
  try {
    const c = (await readClientFor(network).readContract({
      address,
      functionName: "get_case",
      args: [caseId],
    })) as {
      domain: string;
      description: string;
      evidence_refs: string[];
      submitter: string;
      respondent: string;
      status: Case["status"];
      amount: number | string;
      escrow: number | string;
      escrow_withdrawn: boolean;
    };
    return {
      id: caseId,
      domain: c.domain,
      description: c.description,
      evidenceRefs: c.evidence_refs,
      submitter: c.submitter,
      respondent: c.respondent,
      status: c.status,
      createdAt: "",
      amount: `${c.amount}`,
      escrow: `${c.escrow}`,
      escrowWithdrawn: c.escrow_withdrawn,
    };
  } catch {
    return undefined;
  }
}

export async function getRuling(network: GenLayerNetworkKey, caseId: string): Promise<Ruling | undefined> {
  const address = requireAddress(network);
  try {
    const r = (await readClientFor(network).readContract({
      address,
      functionName: "get_ruling",
      args: [caseId],
    })) as {
      outcome: string;
      rationale: string;
      cited_precedent_ids: string[];
      confidence: number;
      round: number;
    };
    return {
      caseId,
      outcome: r.outcome,
      rationale: r.rationale,
      citedPrecedentIds: r.cited_precedent_ids ?? [],
      confidence: r.confidence,
      round: r.round,
    };
  } catch {
    return undefined;
  }
}

/** Full precedent records for a domain, hydrated from get_case + get_ruling for each summary entry. */
export async function getDomainPrecedents(network: GenLayerNetworkKey, domain: string): Promise<Precedent[]> {
  const summaries = await getDomainPrecedentSummaries(network, domain);
  const hydrated = await Promise.all(
    summaries.map(async ({ caseId }) => {
      const [c, r] = await Promise.all([getCase(network, caseId), getRuling(network, caseId)]);
      if (!c || !r) return undefined;
      const precedent: Precedent = {
        caseId,
        domain,
        description: c.description,
        outcome: r.outcome,
        outcomeSummary: `${r.outcome}: ${r.rationale.slice(0, 280)}`,
        rationale: r.rationale,
        confidence: r.confidence,
        round: r.round,
        createdAt: "",
      };
      return precedent;
    })
  );
  return hydrated.filter((p): p is Precedent => p !== undefined);
}

export async function getAppeal(network: GenLayerNetworkKey, caseId: string): Promise<Appeal | undefined> {
  const address = requireAddress(network);
  try {
    const a = (await readClientFor(network).readContract({
      address,
      functionName: "get_appeal",
      args: [caseId],
    })) as {
      appellant: string;
      bond: number | string;
      status: "affirmed" | "overturned";
      escalated_ruling: {
        outcome: string;
        rationale: string;
        cited_precedent_ids: string[];
        confidence: number;
        round: number;
      };
    };
    return {
      caseId,
      appellant: a.appellant,
      bond: `${a.bond}`,
      status: a.status,
      escalatedRuling: a.escalated_ruling
        ? {
            caseId,
            outcome: a.escalated_ruling.outcome,
            rationale: a.escalated_ruling.rationale,
            citedPrecedentIds: a.escalated_ruling.cited_precedent_ids ?? [],
            confidence: a.escalated_ruling.confidence,
            round: a.escalated_ruling.round,
          }
        : undefined,
    };
  } catch {
    return undefined;
  }
}

export interface SubmitCaseInput {
  domain: string;
  description: string;
  evidenceRefs: string[];
  respondent?: string;
  /** Disputed amount, in wei. Omit or 0 for cases with no monetary claim (no escrow required). */
  amountWei?: bigint;
  /** GEN actually locked as escrow (sent as the transaction value). Must be >= 50% of amountWei if amountWei > 0. */
  escrowWei?: bigint;
}

export async function submitCase(
  network: GenLayerNetworkKey,
  input: SubmitCaseInput,
  provider: EIP1193Provider,
  account: Address
): Promise<{ caseId: string; ruling: Ruling; validatorCount?: number }> {
  const address = requireAddress(network);
  const client = writeClientFor(network, provider, account);
  const caseId = crypto.randomUUID();
  const amountWei = input.amountWei ?? 0n;
  const escrowWei = input.escrowWei ?? 0n;

  const hash = await client.writeContract({
    address,
    functionName: "submit_case",
    args: [
      caseId,
      input.domain,
      input.description,
      input.evidenceRefs,
      input.respondent ?? "",
      amountWei,
    ],
    value: escrowWei,
  });

  const receipt = await client.waitForTransactionReceipt({ hash });
  const ruling = await getRuling(network, caseId);
  if (!ruling) {
    throw new Error("Ruling did not finalize, check the transaction on the explorer.");
  }

  return { caseId, ruling, validatorCount: extractValidatorCount(receipt) };
}

export interface AppealInput {
  caseId: string;
  bondWei: bigint;
}

export async function appealRuling(
  network: GenLayerNetworkKey,
  input: AppealInput,
  provider: EIP1193Provider,
  account: Address
): Promise<Appeal & { validatorCount?: number }> {
  const address = requireAddress(network);
  const client = writeClientFor(network, provider, account);

  const hash = await client.writeContract({
    address,
    functionName: "appeal",
    args: [input.caseId],
    value: input.bondWei,
  });

  const receipt = await client.waitForTransactionReceipt({ hash });
  const appeal = await getAppeal(network, input.caseId);
  if (!appeal) {
    throw new Error("Appeal did not finalize, check the transaction on the explorer.");
  }

  return { ...appeal, validatorCount: extractValidatorCount(receipt) };
}

export async function registerDomain(
  network: GenLayerNetworkKey,
  tag: string,
  rubric: string,
  provider: EIP1193Provider,
  account: Address
): Promise<void> {
  const address = requireAddress(network);
  const client = writeClientFor(network, provider, account);
  const hash = await client.writeContract({
    address,
    functionName: "register_domain",
    args: [tag, rubric],
    value: 0n,
  });
  await client.waitForTransactionReceipt({ hash });
}

export async function withdrawEscrow(
  network: GenLayerNetworkKey,
  caseId: string,
  provider: EIP1193Provider,
  account: Address
): Promise<void> {
  const address = requireAddress(network);
  const client = writeClientFor(network, provider, account);
  const hash = await client.writeContract({
    address,
    functionName: "withdraw_escrow",
    args: [caseId],
    value: 0n,
  });
  await client.waitForTransactionReceipt({ hash });
}

export function outcomeLabel(outcome: string): string {
  return outcome
    .replace(/_/g, " ")
    .replace(/pct/g, "%")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function domainDisplayName(tag: string): string {
  return tag
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
