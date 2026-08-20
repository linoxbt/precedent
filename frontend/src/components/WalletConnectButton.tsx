"use client";

import { useState } from "react";

const MOCK_ADDRESS = "0x2b6a...19fd";

export default function WalletConnectButton() {
  const [connected, setConnected] = useState(false);

  return (
    <button
      onClick={() => setConnected((c) => !c)}
      className={
        connected
          ? "inline-flex items-center gap-2 rounded-lg border border-navy-200 bg-navy-50 px-4 py-2 text-sm font-medium text-navy-700"
          : "btn-primary"
      }
    >
      <span
        className={
          connected
            ? "h-2 w-2 rounded-full bg-emerald-500"
            : "h-2 w-2 rounded-full bg-parchment-100/60"
        }
      />
      {connected ? MOCK_ADDRESS : "Connect Wallet"}
    </button>
  );
}
