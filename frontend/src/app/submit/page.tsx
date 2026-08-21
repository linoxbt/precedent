"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { listDomains, submitCase, domainDisplayName } from "@/lib/genlayerClient";
import { getConnectedProvider } from "@/lib/walletProvider";
import { isContractConfigured } from "@/lib/genlayerConfig";
import ValidatorProgress from "@/components/ValidatorProgress";
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
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="card p-6 text-sm text-navy-600">
          No contract is configured yet (NEXT_PUBLIC_PRECEDENT_ENGINE_ADDRESS is unset). See the{" "}
          <a href="/docs" className="font-medium text-navy-800 underline">
            docs
          </a>{" "}
          for deployment instructions.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gold">New case</p>
      <h1 className="font-serif text-3xl font-semibold text-navy-900">Submit a Case</h1>
      <p className="mt-2 text-sm text-navy-500">
        Your case is ruled against the domain&apos;s existing precedent — the ruling will cite
        and reason about similar past cases, not just answer this one in isolation. This calls
        the live contract on GenLayer Asimov Testnet and may take a minute while validators reach
        consensus.
      </p>

      <form onSubmit={handleSubmit} className="card mt-8 flex flex-col gap-6 p-6">
        <div>
          <label className="label" htmlFor="domain">Domain</label>
          {domainsLoading ? (
            <p className="text-sm text-navy-400">Loading domains...</p>
          ) : domains.length === 0 ? (
            <p className="text-sm text-navy-400">
              No domains registered yet. An integrator needs to call{" "}
              <code className="rounded bg-navy-50 px-1">register_domain</code> first.
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
            className="input min-h-32 resize-y"
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
                    className="rounded-lg border border-navy-200 px-3 text-navy-400 hover:bg-navy-50"
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
              className="self-start text-xs font-medium text-navy-500 hover:text-navy-700"
              disabled={submitting}
            >
              + Add another evidence link
            </button>
          </div>
        </div>

        <div>
          <label className="label">Submitting Party</label>
          <div className="input flex items-center gap-2 bg-navy-50 text-navy-500">
            <span
              className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-navy-300"}`}
            />
            {isConnected ? `${address} (connected wallet)` : "No wallet connected"}
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {submitting ? (
          <div className="rounded-lg border border-navy-100 bg-navy-50/60 p-4">
            <ValidatorProgress activeStep={step} />
          </div>
        ) : (
          <button type="submit" className="btn-primary w-full" disabled={!isConnected || domains.length === 0}>
            {isConnected ? "Submit for Ruling" : "Connect a wallet to submit"}
          </button>
        )}
      </form>
    </div>
  );
}
