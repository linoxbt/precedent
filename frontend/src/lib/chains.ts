import { defineChain } from "viem";
import { GENLAYER_CHAIN, GENLAYER_RPC_URL } from "./genlayerConfig";

/** wagmi/viem chain definition for GenLayer Asimov Testnet, mirrored from genlayer-js's chain config. */
export const genlayerAsimovTestnet = defineChain({
  id: GENLAYER_CHAIN.id,
  name: GENLAYER_CHAIN.name,
  nativeCurrency: GENLAYER_CHAIN.nativeCurrency,
  rpcUrls: {
    default: { http: [GENLAYER_RPC_URL] },
  },
  blockExplorers: GENLAYER_CHAIN.blockExplorers,
  testnet: true,
});
