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

function envAddress(name: string): Address | undefined {
  const v = process.env[name];
  return v ? (v as Address) : undefined;
}

export const GENLAYER_NETWORKS: Record<GenLayerNetworkKey, GenLayerNetworkConfig> = {
  asimov: {
    key: "asimov",
    label: "Asimov Testnet",
    note: "Same underlying chain as Bradbury, a different RPC gateway.",
    chain: chains.testnetAsimov,
    rpcUrl: process.env.NEXT_PUBLIC_GENLAYER_RPC_URL_ASIMOV || chains.testnetAsimov.rpcUrls.default.http[0],
    explorerUrl: chains.testnetAsimov.blockExplorers?.default.url ?? "",
    contractAddress: envAddress("NEXT_PUBLIC_PRECEDENT_ENGINE_ADDRESS_ASIMOV"),
  },
  bradbury: {
    key: "bradbury",
    label: "Bradbury Testnet",
    note: "Same underlying chain as Asimov, a different RPC gateway.",
    chain: chains.testnetBradbury,
    rpcUrl: process.env.NEXT_PUBLIC_GENLAYER_RPC_URL_BRADBURY || chains.testnetBradbury.rpcUrls.default.http[0],
    explorerUrl: chains.testnetBradbury.blockExplorers?.default.url ?? "",
    contractAddress: envAddress("NEXT_PUBLIC_PRECEDENT_ENGINE_ADDRESS_BRADBURY"),
  },
  studio: {
    key: "studio",
    label: "Studio Network",
    chain: chains.studionet,
    rpcUrl: process.env.NEXT_PUBLIC_GENLAYER_RPC_URL_STUDIO || chains.studionet.rpcUrls.default.http[0],
    explorerUrl: chains.studionet.blockExplorers?.default.url ?? "",
    contractAddress: envAddress("NEXT_PUBLIC_PRECEDENT_ENGINE_ADDRESS_STUDIO"),
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
