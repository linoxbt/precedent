"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useChainId, useSwitchChain } from "wagmi";
import {
  DEFAULT_GENLAYER_NETWORK,
  GENLAYER_NETWORKS,
  NETWORK_COOKIE_NAME,
  isValidNetworkKey,
  type GenLayerNetworkKey,
} from "./genlayerConfig";

function readNetworkCookie(): GenLayerNetworkKey {
  if (typeof document === "undefined") return DEFAULT_GENLAYER_NETWORK;
  const match = document.cookie.match(new RegExp(`(?:^|; )${NETWORK_COOKIE_NAME}=([^;]*)`));
  const value = match ? decodeURIComponent(match[1]) : undefined;
  return isValidNetworkKey(value) ? value : DEFAULT_GENLAYER_NETWORK;
}

function writeNetworkCookie(network: GenLayerNetworkKey) {
  document.cookie = `${NETWORK_COOKIE_NAME}=${network}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

interface NetworkContextValue {
  network: GenLayerNetworkKey;
  setNetwork: (network: GenLayerNetworkKey) => void;
}

const NetworkContext = createContext<NetworkContextValue | undefined>(undefined);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  // Lazy initializer: on the server this runs before `document` exists and
  // falls back to the default, but on the client it runs during hydration
  // (a genuine first render, not a post-mount effect), so it picks up the
  // real cookie value immediately instead of rendering the default network
  // for a moment and re-fetching once a useEffect catches up.
  const [network, setNetworkState] = useState<GenLayerNetworkKey>(() => readNetworkCookie());

  const setNetwork = useCallback(
    (next: GenLayerNetworkKey) => {
      setNetworkState(next);
      writeNetworkCookie(next);
      const targetChainId = GENLAYER_NETWORKS[next].chain.id;
      if (chainId !== targetChainId) {
        switchChain?.({ chainId: targetChainId });
      }
      router.refresh();
    },
    [chainId, switchChain, router]
  );

  const value = useMemo(() => ({ network, setNetwork }), [network, setNetwork]);

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

export function useActiveNetwork(): NetworkContextValue {
  const ctx = useContext(NetworkContext);
  if (!ctx) throw new Error("useActiveNetwork must be used within NetworkProvider");
  return ctx;
}
