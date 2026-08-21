import { defineChain } from "@reown/appkit/networks";
import { GENLAYER_NETWORKS } from "./genlayerConfig";

/**
 * wagmi/viem chain definitions for the GenLayer networks this app talks to.
 *
 * Uses @reown/appkit/networks' own `defineChain` rather than viem's: it
 * fills in the CAIP fields (`caipNetworkId`, `chainNamespace`) that AppKit
 * needs internally to recognize a custom EVM chain as configured. Without
 * them, AppKit doesn't reliably match the connected wallet's chain to this
 * network and reports it as unconfigured.
 *
 * Only two distinct chains are registered here, not three: Asimov and
 * Bradbury testnets share the exact same chain id (4221) and the same
 * on-chain state (confirmed: identical contract bytecode, identical
 * balances, near-identical block height across both RPC endpoints), so a
 * wallet can't tell them apart as separate networks; they're one chain
 * reachable through two RPC gateways. `genlayerTestnet` uses Asimov's RPC
 * as its primary endpoint. Studio Network is a genuinely distinct chain
 * (id 61999) and gets its own entry.
 */
export const genlayerTestnet = defineChain({
  id: GENLAYER_NETWORKS.asimov.chain.id,
  caipNetworkId: `eip155:${GENLAYER_NETWORKS.asimov.chain.id}`,
  chainNamespace: "eip155",
  name: "GenLayer Testnet",
  nativeCurrency: GENLAYER_NETWORKS.asimov.chain.nativeCurrency,
  rpcUrls: {
    default: { http: [GENLAYER_NETWORKS.asimov.rpcUrl] },
  },
  blockExplorers: GENLAYER_NETWORKS.asimov.chain.blockExplorers,
  testnet: true,
});

export const genlayerStudioNetwork = defineChain({
  id: GENLAYER_NETWORKS.studio.chain.id,
  caipNetworkId: `eip155:${GENLAYER_NETWORKS.studio.chain.id}`,
  chainNamespace: "eip155",
  name: GENLAYER_NETWORKS.studio.chain.name,
  nativeCurrency: GENLAYER_NETWORKS.studio.chain.nativeCurrency,
  rpcUrls: {
    default: { http: [GENLAYER_NETWORKS.studio.rpcUrl] },
  },
  blockExplorers: GENLAYER_NETWORKS.studio.chain.blockExplorers,
  testnet: true,
});
