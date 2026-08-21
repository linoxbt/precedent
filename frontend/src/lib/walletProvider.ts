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

/**
 * Both the provider and the address of the connected wallet, for signing
 * GenLayer write transactions. genlayer-js's write calls need an explicit
 * `account`: passing only a `provider` leaves it with no sender to sign
 * with and it throws "No account set."
 */
export async function getConnectedProviderAndAccount(): Promise<{
  provider: EIP1193Provider;
  account: `0x${string}`;
}> {
  const account = getAccount(wagmiConfig);
  if (!account.isConnected || !account.connector || !account.address) {
    throw new Error("Connect a wallet first.");
  }
  const provider = (await account.connector.getProvider()) as EIP1193Provider;
  return { provider, account: account.address };
}
