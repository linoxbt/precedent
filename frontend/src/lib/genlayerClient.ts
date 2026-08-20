import {
  APPEALS,
  CASES,
  DOMAINS,
  PRECEDENTS,
  RULINGS,
  getPrecedentsForDomain,
} from "./mockData";
import type { Appeal, Case, DomainConfig, Precedent, Ruling } from "./types";

/**
 * GenLayerJS wiring for the Precedent Engine Intelligent Contract.
 *
 * This module is the single seam between the UI and the chain. Every
 * export here has the shape a real GenLayerJS-backed call would have.
 * Today it resolves against the seeded mock data (with simulated
 * network latency so loading states behave realistically); once a
 * contract is deployed, set NEXT_PUBLIC_PRECEDENT_ENGINE_ADDRESS and
 * NEXT_PUBLIC_GENLAYER_RPC_URL and flip USE_LIVE_CONTRACT below (or
 * fill in the commented client calls) to point these functions at the
 * real chain instead of MOCK_*.
 *
 *   npm install genlayer-js
 *
 *   import { createClient } from "genlayer-js";
 *   import { studionet } from "genlayer-js/chains";
 *
 *   const client = createClient({
 *     chain: studionet,
 *     endpoint: process.env.NEXT_PUBLIC_GENLAYER_RPC_URL,
 *   });
 *
 *   await client.readContract({
 *     address: process.env.NEXT_PUBLIC_PRECEDENT_ENGINE_ADDRESS,
 *     functionName: "get_ruling",
 *     args: [caseId],
 *   });
 */

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PRECEDENT_ENGINE_ADDRESS ?? "";
export const USE_LIVE_CONTRACT = CONTRACT_ADDRESS.length > 0;

const SIMULATED_LATENCY_MS = 650;

function delay<T>(value: T, ms = SIMULATED_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function listDomains(): Promise<DomainConfig[]> {
  if (USE_LIVE_CONTRACT) {
    // return client.readContract({ address: CONTRACT_ADDRESS, functionName: "list_domains" });
  }
  return delay(DOMAINS, 200);
}

export async function getDomainPrecedents(domain: string): Promise<Precedent[]> {
  if (USE_LIVE_CONTRACT) {
    // return client.readContract({
    //   address: CONTRACT_ADDRESS,
    //   functionName: "get_domain_precedents",
    //   args: [domain, 50],
    // });
  }
  return delay(getPrecedentsForDomain(domain), 200);
}

export async function getCase(caseId: string): Promise<Case | undefined> {
  if (USE_LIVE_CONTRACT) {
    // return client.readContract({ address: CONTRACT_ADDRESS, functionName: "get_case", args: [caseId] });
  }
  return delay(CASES[caseId], 200);
}

export async function getRuling(caseId: string): Promise<Ruling | undefined> {
  if (USE_LIVE_CONTRACT) {
    // return client.readContract({ address: CONTRACT_ADDRESS, functionName: "get_ruling", args: [caseId] });
  }
  return delay(RULINGS[caseId], 200);
}

export interface SubmitCaseInput {
  domain: string;
  description: string;
  evidenceRefs: string[];
  submitter: string;
  respondent?: string;
}

/**
 * Submits a case and awaits the first-instance ruling. On a live
 * deployment this is a `write` call that triggers the Leader's
 * non-comparative EP round inside `submit_case`; the demo simulates
 * that round's latency so the "Validators reviewing..." UI state has
 * something real to show.
 */
export async function submitCase(input: SubmitCaseInput): Promise<{ caseId: string; ruling: Ruling }> {
  if (USE_LIVE_CONTRACT) {
    // const caseId = crypto.randomUUID();
    // await client.writeContract({
    //   address: CONTRACT_ADDRESS,
    //   functionName: "submit_case",
    //   args: [caseId, input.domain, input.description, input.evidenceRefs, input.respondent ?? ""],
    // });
    // const ruling = await getRuling(caseId);
    // return { caseId, ruling: ruling! };
  }

  // Demo fallback: return the pre-seeded near-duplicate / near-miss
  // rulings so the citation UI has something meaningful to show,
  // matching the build spec's demo script (Section 9).
  const knownId = pickDemoCaseId(input.description);
  await delay(null, 2200); // simulate a Leader + validator consensus round
  return { caseId: knownId, ruling: RULINGS[knownId] };
}

export interface AppealInput {
  caseId: string;
  bondAmount: string;
  appellant: string;
}

export async function appealRuling(input: AppealInput): Promise<Appeal> {
  if (USE_LIVE_CONTRACT) {
    // await client.writeContract({
    //   address: CONTRACT_ADDRESS,
    //   functionName: "appeal",
    //   args: [input.caseId],
    //   value: parseBond(input.bondAmount),
    // });
    // return getAppeal(input.caseId);
  }
  await delay(null, 2800); // simulate the doubled escalated panel's consensus round
  return (
    APPEALS[input.caseId] ?? {
      caseId: input.caseId,
      appellant: input.appellant,
      bond: input.bondAmount,
      status: "affirmed",
      panelSizeBefore: 3,
      panelSizeAfter: 6,
    }
  );
}

function pickDemoCaseId(description: string): string {
  const normalized = description.toLowerCase();
  if (normalized.includes("time is of the essence") || normalized.includes("launch event")) {
    return "FDD-1002";
  }
  if (normalized.includes("grace period")) {
    return "FDD-1001";
  }
  // Fall back to a deterministic-looking pick among seeded precedents
  // so an arbitrary submission still resolves to a real ruling.
  return PRECEDENTS[Math.floor(Math.random() * PRECEDENTS.length)].caseId;
}
