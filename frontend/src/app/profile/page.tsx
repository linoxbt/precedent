"use client";

import { useAccount, useBalance } from "wagmi";
import { formatEther } from "viem";
import { GENLAYER_NETWORKS } from "@/lib/genlayerConfig";
import { useActiveNetwork } from "@/lib/NetworkProvider";
import WalletConnectButton from "@/components/WalletConnectButton";
import { UserIcon, WindowDots } from "@/components/icons";

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const { network } = useActiveNetwork();
  const cfg = GENLAYER_NETWORKS[network];
  const { data: balance } = useBalance({ address, chainId: cfg.chain.id });

  return (
    <div className="flex flex-1 items-start justify-center overflow-y-auto bg-chrome p-6">
      <div className="dialog w-full max-w-lg animate-window-open">
        <div className="flex items-center gap-2 border-b border-chrome-border bg-chrome-titlebar px-4 py-2.5">
          <UserIcon className="h-4 w-4 text-accent-500" />
          <span className="text-xs font-semibold text-ink">User Profile</span>
          <WindowDots className="ml-auto" />
        </div>

        <div className="flex flex-col gap-5 bg-white p-6">
          {!isConnected ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-sm text-ink-muted">No wallet connected.</p>
              <WalletConnectButton />
            </div>
          ) : (
            <>
              <dl className="grid grid-cols-1 gap-3 text-sm">
                <div>
                  <dt className="label mb-1">Address</dt>
                  <dd className="break-all rounded-sm border border-chrome-border bg-chrome-pane px-3 py-2 font-mono text-xs text-ink">
                    {address}
                  </dd>
                </div>
                <div>
                  <dt className="label mb-1">Network</dt>
                  <dd className="text-ink-muted">{cfg.label}</dd>
                </div>
                <div>
                  <dt className="label mb-1">Balance</dt>
                  <dd className="font-mono text-ink-muted">
                    {balance ? `${formatEther(balance.value)} ${balance.symbol}` : "..."}
                  </dd>
                </div>
              </dl>
              <div className="border-t border-chrome-border pt-4">
                <WalletConnectButton />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
