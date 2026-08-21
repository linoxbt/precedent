"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { listDomains, submitCase, domainDisplayName } from "@/lib/genlayerClient";
import { getConnectedProvider } from "@/lib/walletProvider";
import { isContractConfigured } from "@/lib/genlayerConfig";
import ValidatorProgress from "@/components/ValidatorProgress";
import { NewFileIcon, WindowDots } from "@/components/icons";
import type { DomainConfig } from "@/lib/types";

export default function SubmitCasePage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();

  const [domains, setDomains] = useState<DomainConfig[]>([]);
  const [domainsLoading, setDomainsLoading] = useState(true);
  const [domain, setDomain] = useState("");
  const [description, setDescription] = useState("");
  const [respondent, setRespondent] = useState("");
  const [evidenceRefs, setEvidenceRefs] = useState<string[]>([""]);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isContractConfigured()) {
      setDomainsLoading(false);
      return;
    }
    listDomains()
      .then((d) => {
        setDomains(d);
        if (d.length > 0) setDomain(d[0].tag);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load domains."))
      .finally(() => setDomainsLoading(false));
  }, []);

  function updateEvidence(i: number, value: string) {
    setEvidenceRefs((refs) => refs.map((r, idx) => (idx === i ? value : r)));
  }

  function addEvidenceField() {
    setEvidenceRefs((refs) => [...refs, ""]);
  }

  function removeEvidenceField(i: number) {
    setEvidenceRefs((refs) => refs.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) {
      setError("Case description is required.");
      return;
    }
    if (!isConnected) {
      setError("Connect a wallet before submitting a case.");
      return;
    }
    setError(null);
    setSubmitting(true);
    setStep(0);

    const stepTimers = [400, 900, 1600].map((ms, idx) =>
      setTimeout(() => setStep(idx + 1), ms)
    );

    try {
      const provider = await getConnectedProvider();
      const { caseId } = await submitCase(
        {
          domain,
          description,
          evidenceRefs: evidenceRefs.filter((r) => r.trim().length > 0),
          respondent,
        },
        provider
      );
      router.push(`/case/${caseId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ruling failed. Try again.");
      setSubmitting(false);
      stepTimers.forEach(clearTimeout);
    }
  }

  if (!isContractConfigured()) {
    return (
      <div className="flex flex-1 items-start justify-center p-8">
        <div className="panel max-w-md p-6 text-sm text-ink-muted">
          No contract is configured yet (NEXT_PUBLIC_PRECEDENT_ENGINE_ADDRESS is unset). See the{" "}
          <a href="/docs" className="font-medium text-accent-600 underline">
            Help
          </a>{" "}
          window for deployment instructions.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-start justify-center overflow-y-auto bg-chrome p-6">
      <div className="dialog w-full max-w-lg animate-window-open">
        <div className="flex items-center gap-2 border-b border-chrome-border bg-chrome-titlebar px-4 py-2.5">
          <NewFileIcon className="h-4 w-4 text-accent-500" />
          <span className="text-xs font-semibold text-ink">New Case</span>
          <WindowDots className="ml-auto" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 bg-white p-5">
          <p className="text-xs leading-relaxed text-ink-faint">
            This opens a real transaction on GenLayer Asimov Testnet — validators draft and grade
            a ruling against the domain&apos;s existing precedent. May take up to a minute.
          </p>

          <div>
            <label className="label" htmlFor="domain">Save to folder</label>
            {domainsLoading ? (
              <p className="text-sm text-ink-faint">Loading domains...</p>
            ) : domains.length === 0 ? (
              <p className="text-sm text-ink-faint">
                No domains registered yet. An integrator needs to call{" "}
                <code className="rounded bg-chrome px-1">register_domain</code> first.
              </p>
            ) : (
              <select
                id="domain"
                className="input"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                disabled={submitting}
              >
                {domains.map((d) => (
                  <option key={d.tag} value={d.tag}>
                    {domainDisplayName(d.tag)}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="label" htmlFor="description">Case Description</label>
            <textarea
              id="description"
              className="input min-h-28 resize-y"
              placeholder="Describe what happened, including relevant dates, contract terms, and the outcome you believe is warranted..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <label className="label" htmlFor="respondent">Respondent Address (optional)</label>
            <input
              id="respondent"
              className="input"
              placeholder="0x..."
              value={respondent}
              onChange={(e) => setRespondent(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <label className="label">Evidence Links</label>
            <div className="flex flex-col gap-2">
              {evidenceRefs.map((ref, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="input"
                    placeholder="https://... or ipfs://..."
                    value={ref}
                    onChange={(e) => updateEvidence(i, e.target.value)}
                    disabled={submitting}
                  />
                  {evidenceRefs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEvidenceField(i)}
                      className="rounded-sm border border-chrome-border px-3 text-ink-faint hover:bg-chrome-hover"
                      disabled={submitting}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addEvidenceField}
                className="self-start text-xs font-medium text-accent-600 hover:underline"
                disabled={submitting}
              >
                + Add another evidence link
              </button>
            </div>
          </div>

          <div>
            <label className="label">Submitting Party</label>
            <div className="input flex items-center gap-2 bg-chrome text-ink-muted">
              <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-status-overturned" : "bg-chrome-border"}`} />
              {isConnected ? `${address} (connected wallet)` : "No wallet connected"}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {submitting ? (
            <div className="rounded-sm border border-chrome-border bg-chrome-pane p-4">
              <ValidatorProgress activeStep={step} />
            </div>
          ) : (
            <div className="flex items-center justify-end gap-2 border-t border-chrome-border pt-4">
              <button
                type="submit"
                className="btn-primary"
                disabled={!isConnected || domains.length === 0}
              >
                {isConnected ? "Submit for Ruling" : "Connect a wallet to submit"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
