"use client";

import { createAppKit } from "@reown/appkit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { REOWN_PROJECT_ID, networks, wagmiAdapter } from "@/lib/wagmiConfig";
import { NetworkProvider } from "@/lib/NetworkProvider";

if (REOWN_PROJECT_ID) {
  createAppKit({
    adapters: [wagmiAdapter],
    networks,
    defaultNetwork: networks[0],
    projectId: REOWN_PROJECT_ID,
    metadata: {
      name: "Precedent Engine",
      description: "On-chain case law for AI judgment, built on GenLayer.",
      url: "https://precedent-engine.netlify.app",
      icons: ["https://precedent-engine.netlify.app/icon.png"],
    },
    features: { analytics: false, email: false, socials: [] },
  });
}

export default function AppKitProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <NetworkProvider>{children}</NetworkProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
