"use client";

import { useActiveNetwork } from "@/lib/NetworkProvider";
import { NETWORK_LIST, isValidNetworkKey, type GenLayerNetworkKey } from "@/lib/genlayerConfig";

export default function NetworkSwitcher() {
  const { network, setNetwork } = useActiveNetwork();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    if (isValidNetworkKey(value)) {
      setNetwork(value as GenLayerNetworkKey);
    }
  }

  return (
    <select
      value={network}
      onChange={handleChange}
      aria-label="GenLayer network"
      className="toolbar-btn border border-chrome-border bg-white text-xs font-medium"
    >
      {NETWORK_LIST.map((n) => (
        <option key={n.key} value={n.key}>
          {n.label}
        </option>
      ))}
    </select>
  );
}
