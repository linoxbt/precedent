import { createClient } from "genlayer-js";
import type { Address } from "genlayer-js/types";
import {
  GENLAYER_CHAIN,
  GENLAYER_RPC_URL,
  PRECEDENT_ENGINE_ADDRESS,
  isContractConfigured,
} from "./genlayerConfig";
import type { Appeal, Case, DomainConfig, Precedent, Ruling } from "./types";

/**
 * GenLayerJS wiring for the Precedent Engine Intelligent Contract.
 *
 * Reads go through a shared read-only client. Writes (submit_case, appeal)
 * are signed by the connected wallet: callers pass the EIP-1193 provider
 * obtained from Reown AppKit / wagmi, and a fresh write client is created
 * per call so the transaction is signed by whichever account is connected.
 *
 * There is no mock-data fallback: every export here calls the live
 * contract at NEXT_PUBLIC_PRECEDENT_ENGINE_ADDRESS on GenLayer Asimov
 * Testnet. If that address isn't configured, calls throw explicitly
 * rather than silently returning fake data.
 */

type EIP1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

function requireAddress(): Address {
  if (!isContractConfigured()) {
    throw new Error(
      "Precedent Engine contract address is not configured (NEXT_PUBLIC_PRECEDENT_ENGINE_ADDRESS)."
    );
  }
  return PRECEDENT_ENGINE_ADDRESS as Address;
}

const readClient = createClient({
  chain: GENLAYER_CHAIN,
  endpoint: GENLAYER_RPC_URL,
});

function writeClientFor(provider: EIP1193Provider, account: Address) {
  return createClient({
    chain: GENLAYER_CHAIN,
    endpoint: GENLAYER_RPC_URL,
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

export async function listDomains(): Promise<DomainConfig[]> {
  const address = requireAddress();
  const result = (await readClient.readContract({
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

export async function getDomain(tag: string): Promise<DomainConfig | undefined> {
  const domains = await listDomains();
  return domains.find((d) => d.tag === tag);
}

export async function getDomainPrecedentSummaries(
  domain: string,
  limit = 50
): Promise<{ caseId: string; outcomeSummary: string }[]> {
  const address = requireAddress();
  const result = (await readClient.readContract({
    address,
    functionName: "get_domain_precedents",
    args: [domain, limit],
  })) as { case_id: string; outcome_summary: string }[];

  return result.map((r) => ({ caseId: r.case_id, outcomeSummary: r.outcome_summary }));
}

export async function getCase(caseId: string): Promise<Case | undefined> {
  const address = requireAddress();
  try {
    const c = (await readClient.readContract({
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

export async function getRuling(caseId: string): Promise<Ruling | undefined> {
  const address = requireAddress();
  try {
    const r = (await readClient.readContract({
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
export async function getDomainPrecedents(domain: string): Promise<Precedent[]> {
  const summaries = await getDomainPrecedentSummaries(domain);
  const hydrated = await Promise.all(
    summaries.map(async ({ caseId }) => {
      const [c, r] = await Promise.all([getCase(caseId), getRuling(caseId)]);
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

export async function getAppeal(caseId: string): Promise<Appeal | undefined> {
  const address = requireAddress();
  try {
    const a = (await readClient.readContract({
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
  input: SubmitCaseInput,
  provider: EIP1193Provider,
  account: Address
): Promise<{ caseId: string; ruling: Ruling; validatorCount?: number }> {
  const address = requireAddress();
  const client = writeClientFor(provider, account);
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
  const ruling = await getRuling(caseId);
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
  input: AppealInput,
  provider: EIP1193Provider,
  account: Address
): Promise<Appeal & { validatorCount?: number }> {
  const address = requireAddress();
  const client = writeClientFor(provider, account);

  const hash = await client.writeContract({
    address,
    functionName: "appeal",
    args: [input.caseId],
    value: input.bondWei,
  });

  const receipt = await client.waitForTransactionReceipt({ hash });
  const appeal = await getAppeal(input.caseId);
  if (!appeal) {
    throw new Error("Appeal did not finalize, check the transaction on the explorer.");
  }

  return { ...appeal, validatorCount: extractValidatorCount(receipt) };
}

export async function registerDomain(
  tag: string,
  rubric: string,
  provider: EIP1193Provider,
  account: Address
): Promise<void> {
  const address = requireAddress();
  const client = writeClientFor(provider, account);
  const hash = await client.writeContract({
    address,
    functionName: "register_domain",
    args: [tag, rubric],
    value: 0n,
  });
  await client.waitForTransactionReceipt({ hash });
}

export async function withdrawEscrow(
  caseId: string,
  provider: EIP1193Provider,
  account: Address
): Promise<void> {
  const address = requireAddress();
  const client = writeClientFor(provider, account);
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
