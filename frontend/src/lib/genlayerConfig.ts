import { chains } from "genlayer-js";
import type { Address } from "genlayer-js/types";

export type GenLayerNetworkKey = "asimov" | "bradbury" | "studio";

export interface GenLayerNetworkConfig {
  key: GenLayerNetworkKey;
  label: string;
  /** Short note surfaced in the switcher; Asimov and Bradbury share the same underlying chain. */
  note?: string;
  chain: typeof chains.testnetAsimov;
  rpcUrl: string;
  explorerUrl: string;
  contractAddress?: Address;
}

// Next.js's bundler only inlines `process.env.NEXT_PUBLIC_*` into the client
// bundle when it sees a literal, statically-analyzable member access; a
// dynamic `process.env[name]` lookup is invisible to it and silently
// resolves to undefined client-side (while still working server-side,
// where real process.env is available at runtime). Each var is therefore
// referenced literally below, not through a helper keyed by string.
const ADDRESS_ASIMOV = process.env.NEXT_PUBLIC_PRECEDENT_ENGINE_ADDRESS_ASIMOV as Address | undefined;
const ADDRESS_BRADBURY = process.env.NEXT_PUBLIC_PRECEDENT_ENGINE_ADDRESS_BRADBURY as Address | undefined;
const ADDRESS_STUDIO = process.env.NEXT_PUBLIC_PRECEDENT_ENGINE_ADDRESS_STUDIO as Address | undefined;

export const GENLAYER_NETWORKS: Record<GenLayerNetworkKey, GenLayerNetworkConfig> = {
  asimov: {
    key: "asimov",
    label: "Asimov Testnet",
    note: "Same underlying chain as Bradbury, a different RPC gateway.",
    chain: chains.testnetAsimov,
    rpcUrl: process.env.NEXT_PUBLIC_GENLAYER_RPC_URL_ASIMOV || chains.testnetAsimov.rpcUrls.default.http[0],
    explorerUrl: chains.testnetAsimov.blockExplorers?.default.url ?? "",
    contractAddress: ADDRESS_ASIMOV || undefined,
  },
  bradbury: {
    key: "bradbury",
    label: "Bradbury Testnet",
    note: "Same underlying chain as Asimov, a different RPC gateway.",
    chain: chains.testnetBradbury,
    rpcUrl: process.env.NEXT_PUBLIC_GENLAYER_RPC_URL_BRADBURY || chains.testnetBradbury.rpcUrls.default.http[0],
    explorerUrl: chains.testnetBradbury.blockExplorers?.default.url ?? "",
    contractAddress: ADDRESS_BRADBURY || undefined,
  },
  studio: {
    key: "studio",
    label: "Studio Network",
    chain: chains.studionet,
    rpcUrl: process.env.NEXT_PUBLIC_GENLAYER_RPC_URL_STUDIO || chains.studionet.rpcUrls.default.http[0],
    explorerUrl: chains.studionet.blockExplorers?.default.url ?? "",
    contractAddress: ADDRESS_STUDIO || undefined,
  },
};

export const NETWORK_LIST: GenLayerNetworkConfig[] = [
  GENLAYER_NETWORKS.asimov,
  GENLAYER_NETWORKS.bradbury,
  GENLAYER_NETWORKS.studio,
];

export const DEFAULT_GENLAYER_NETWORK: GenLayerNetworkKey = "asimov";
export const NETWORK_COOKIE_NAME = "genlayer-network";

export function isValidNetworkKey(v: unknown): v is GenLayerNetworkKey {
  return v === "asimov" || v === "bradbury" || v === "studio";
}

export function isContractConfigured(network: GenLayerNetworkKey): boolean {
  return Boolean(GENLAYER_NETWORKS[network].contractAddress);
}
