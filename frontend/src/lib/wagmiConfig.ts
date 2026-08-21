import { cookieStorage, createStorage } from "wagmi";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { genlayerAsimovTestnet } from "./chains";

export const REOWN_PROJECT_ID = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ?? "";

if (!REOWN_PROJECT_ID) {
  // eslint-disable-next-line no-console
  console.warn("NEXT_PUBLIC_REOWN_PROJECT_ID is not set: wallet connect will not initialize.");
}

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [genlayerAsimovTestnet];

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  projectId: REOWN_PROJECT_ID,
  networks,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
