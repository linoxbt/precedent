import type { GenLayerNetworkKey } from "./genlayerConfig";

/**
 * The contract has no method that enumerates cases by submitter, and
 * get_domain_precedents only lists cases that have already been ruled (see
 * _write_precedent in precedent_engine.py) - so a case that's still pending,
 * or one that never reaches consensus, is otherwise invisible to the
 * History page. This keeps a local, per-browser record of case IDs this
 * wallet has submitted so they show up immediately regardless of ruling
 * status. It's a supplement to the on-chain-derived list, not a
 * replacement: it only knows about submissions made from this browser.
 */

const STORAGE_KEY = "precedent:submittedCases";
const MAX_ENTRIES_PER_NETWORK = 200;

interface StoredEntry {
  caseId: string;
  submittedAt: number;
}

type Store = Partial<Record<GenLayerNetworkKey, StoredEntry[]>>;

function readStore(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function writeStore(store: Store) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage full or unavailable (e.g. private browsing) - not fatal, the
    // case still exists on-chain, it just won't show up early in History.
  }
}

export function recordSubmittedCase(network: GenLayerNetworkKey, caseId: string): void {
  const store = readStore();
  const existing = store[network] ?? [];
  if (existing.some((e) => e.caseId === caseId)) return;
  const next = [...existing, { caseId, submittedAt: Date.now() }].slice(-MAX_ENTRIES_PER_NETWORK);
  store[network] = next;
  writeStore(store);
}

export function getRecordedCaseIds(network: GenLayerNetworkKey): string[] {
  const store = readStore();
  return (store[network] ?? []).map((e) => e.caseId);
}
