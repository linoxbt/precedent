import { getAccount } from "@wagmi/core";
import { wagmiConfig } from "./wagmiConfig";

export type EIP1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

/** The connected wallet's raw EIP-1193 provider, for signing GenLayer write transactions. */
export async function getConnectedProvider(): Promise<EIP1193Provider> {
  const account = getAccount(wagmiConfig);
  if (!account.isConnected || !account.connector) {
    throw new Error("Connect a wallet first.");
  }
  const provider = await account.connector.getProvider();
  return provider as EIP1193Provider;
}

export function getConnectedAddress(): `0x${string}` | undefined {
  return getAccount(wagmiConfig).address;
}
