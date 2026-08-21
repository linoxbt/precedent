import { defineChain } from "@reown/appkit/networks";
import { GENLAYER_CHAIN, GENLAYER_RPC_URL } from "./genlayerConfig";

/**
 * wagmi/viem chain definition for GenLayer Asimov Testnet, mirrored from
 * genlayer-js's chain config.
 *
 * Uses @reown/appkit/networks' own `defineChain` rather than viem's: it
 * fills in the CAIP fields (`caipNetworkId`, `chainNamespace`) that AppKit
 * needs internally to recognize a custom EVM chain as configured. Without
 * them, AppKit doesn't reliably match the connected wallet's chain to this
 * network and reports it as unconfigured.
 */
export const genlayerAsimovTestnet = defineChain({
  id: GENLAYER_CHAIN.id,
  caipNetworkId: `eip155:${GENLAYER_CHAIN.id}`,
  chainNamespace: "eip155",
  name: GENLAYER_CHAIN.name,
  nativeCurrency: GENLAYER_CHAIN.nativeCurrency,
  rpcUrls: {
    default: { http: [GENLAYER_RPC_URL] },
  },
  blockExplorers: GENLAYER_CHAIN.blockExplorers,
  testnet: true,
});
