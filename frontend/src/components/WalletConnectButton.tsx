"use client";

import { REOWN_PROJECT_ID } from "@/lib/wagmiConfig";

export default function WalletConnectButton() {
  if (!REOWN_PROJECT_ID) {
    return (
      <span className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
        Wallet connect not configured
      </span>
    );
  }

  return <appkit-button balance="hide" />;
}
