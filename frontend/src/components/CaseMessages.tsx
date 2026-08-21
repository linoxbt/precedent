"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { getCaseMessages, sendCaseMessage } from "@/lib/genlayerClient";
import { getConnectedProviderAndAccount } from "@/lib/walletProvider";
import type { GenLayerNetworkKey } from "@/lib/genlayerConfig";
import type { CaseMessage } from "@/lib/types";

function short(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function CaseMessages({
  network,
  caseId,
  submitter,
  respondent,
}: {
  network: GenLayerNetworkKey;
  caseId: string;
  submitter: string;
  respondent: string;
}) {
  const { address, isConnected } = useAccount();
  const [messages, setMessages] = useState<CaseMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    getCaseMessages(network, caseId)
      .then(setMessages)
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network, caseId]);

  const isParty =
    !!address &&
    (address.toLowerCase() === submitter.toLowerCase() ||
      (!!respondent && address.toLowerCase() === respondent.toLowerCase()));

  async function handleSend() {
    if (!text.trim()) return;
    setError(null);
    setSending(true);
    try {
      const { provider, account } = await getConnectedProviderAndAccount();
      await sendCaseMessage(network, caseId, text.trim(), provider, account);
      setText("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="panel mt-4 p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="label">Messages ({messages.length})</p>
        <Link href={`/appeal/${caseId}`} className="text-xs font-medium text-accent-600 hover:underline">
          Open Dispute
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-ink-faint">Loading messages...</p>
      ) : messages.length === 0 ? (
        <p className="text-sm text-ink-faint">No messages yet between the submitter and respondent.</p>
      ) : (
        <div className="mb-3 flex max-h-64 flex-col gap-2 overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className="rounded-sm border border-chrome-border bg-chrome-pane p-2 text-sm">
              <p className="mb-0.5 font-mono text-[11px] text-ink-faint">
                {m.sender.toLowerCase() === submitter.toLowerCase() ? "Submitter" : "Respondent"} · {short(m.sender)}
              </p>
              <p className="text-ink-muted">{m.text}</p>
            </div>
          ))}
        </div>
      )}

      {isConnected && isParty ? (
        <div className="flex gap-2">
          <input
            className="input"
            placeholder="Message the other party..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={sending}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button type="button" className="btn-secondary whitespace-nowrap" onClick={handleSend} disabled={sending || !text.trim()}>
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      ) : (
        <p className="text-xs text-ink-faint">
          {isConnected
            ? "Only the case's submitter or respondent can send messages here."
            : "Connect the submitter's or respondent's wallet to message here."}
        </p>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
