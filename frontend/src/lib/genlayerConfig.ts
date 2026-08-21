import { chains } from "genlayer-js";

export const PRECEDENT_ENGINE_ADDRESS = process.env
  .NEXT_PUBLIC_PRECEDENT_ENGINE_ADDRESS as `0x${string}` | undefined;

export const GENLAYER_CHAIN = chains.testnetAsimov;

export const GENLAYER_RPC_URL =
  process.env.NEXT_PUBLIC_GENLAYER_RPC_URL ?? GENLAYER_CHAIN.rpcUrls.default.http[0];

export const GENLAYER_EXPLORER_URL = GENLAYER_CHAIN.blockExplorers?.default.url ?? "";

if (!PRECEDENT_ENGINE_ADDRESS) {
  // Surfaced in the UI via isContractConfigured() checks rather than thrown here,
  // since this module is imported by both server and client components.
  // eslint-disable-next-line no-console
  console.warn(
    "NEXT_PUBLIC_PRECEDENT_ENGINE_ADDRESS is not set — the app cannot reach a live contract."
  );
}

export function isContractConfigured(): boolean {
  return Boolean(PRECEDENT_ENGINE_ADDRESS);
}
