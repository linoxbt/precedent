"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { listDomains, submitCase, registerDomain, domainDisplayName } from "@/lib/genlayerClient";
import { getConnectedProviderAndAccount } from "@/lib/walletProvider";
import { isContractConfigured, GENLAYER_NETWORKS } from "@/lib/genlayerConfig";
import { useActiveNetwork } from "@/lib/NetworkProvider";
import ValidatorProgress from "@/components/ValidatorProgress";
import { NewFileIcon, WindowDots } from "@/components/icons";
import type { DomainConfig } from "@/lib/types";

const NEW_FOLDER_VALUE = "__new_folder__";

export default function SubmitCasePage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { network } = useActiveNetwork();

  const [domains, setDomains] = useState<DomainConfig[]>([]);
  const [domainsLoading, setDomainsLoading] = useState(true);
  const [domain, setDomain] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [respondent, setRespondent] = useState("");
  const [evidenceRefs, setEvidenceRefs] = useState<string[]>([""]);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderRubric, setNewFolderRubric] = useState("");
  const [folderCreating, setFolderCreating] = useState(false);
  const [folderError, setFolderError] = useState<string | null>(null);

  function loadDomains() {
    if (!isContractConfigured(network)) {
      setDomainsLoading(false);
      return;
    }
    setDomainsLoading(true);
    listDomains(network)
      .then((d) => {
        setDomains(d);
        if (d.length > 0) setDomain((current) => (current ? current : d[0].tag));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load domains."))
      .finally(() => setDomainsLoading(false));
  }

  useEffect(() => {
    loadDomains();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network]);

  function updateEvidence(i: number, value: string) {
    setEvidenceRefs((refs) => refs.map((r, idx) => (idx === i ? value : r)));
  }

  function addEvidenceField() {
    setEvidenceRefs((refs) => [...refs, ""]);
  }

  function removeEvidenceField(i: number) {
    setEvidenceRefs((refs) => refs.filter((_, idx) => idx !== i));
  }

  function handleDomainChange(value: string) {
    if (value === NEW_FOLDER_VALUE) {
      setCreatingFolder(true);
      return;
    }
    setDomain(value);
  }

  async function handleCreateFolder() {
    const tag = newFolderName.trim().toLowerCase().replace(/\s+/g, "-");
    if (!tag) {
      setFolderError("Folder name is required.");
      return;
    }
    if (!newFolderRubric.trim()) {
      setFolderError("A grading rubric is required for the new folder.");
      return;
    }
    if (!isConnected) {
      setFolderError("Connect a wallet before creating a folder.");
      return;
    }
    setFolderError(null);
    setFolderCreating(true);
    try {
      const { provider, account: acct } = await getConnectedProviderAndAccount();
      await registerDomain(network, tag, newFolderRubric.trim(), provider, acct);
      loadDomains();
      setDomain(tag);
      setCreatingFolder(false);
      setNewFolderName("");
      setNewFolderRubric("");
    } catch (err) {
      setFolderError(err instanceof Error ? err.message : "Failed to create folder.");
    } finally {
      setFolderCreating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Case title is required.");
      return;
    }
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
      const { provider, account: acct } = await getConnectedProviderAndAccount();
      const { caseId } = await submitCase(
        network,
        {
          domain,
          title,
          description,
          evidenceRefs: evidenceRefs.filter((r) => r.trim().length > 0),
          respondent,
        },
        provider,
        acct
      );
      router.push(`/case/${caseId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ruling failed. Try again.");
      setSubmitting(false);
      stepTimers.forEach(clearTimeout);
    }
  }

  if (!isContractConfigured(network)) {
    return (
      <div className="flex flex-1 items-start justify-center p-8">
        <div className="panel max-w-md p-6 text-sm text-ink-muted">
          No contract is configured on {GENLAYER_NETWORKS[network].label} yet (its
          NEXT_PUBLIC_PRECEDENT_ENGINE_ADDRESS_* env var is unset). See the{" "}
          <a href="/docs" className="font-medium text-accent-600 underline">
            Help
          </a>{" "}
          window for deployment instructions, or switch networks above.
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
            This opens a real transaction on {GENLAYER_NETWORKS[network].label}: validators draft
            and grade a ruling against the domain&apos;s existing precedent. May take up to a minute.
          </p>

          <div>
            <label className="label" htmlFor="domain">Save to folder</label>
            {domainsLoading ? (
              <p className="text-sm text-ink-faint">Loading domains...</p>
            ) : (
              <select
                id="domain"
                className="input"
                value={creatingFolder ? NEW_FOLDER_VALUE : domain}
                onChange={(e) => handleDomainChange(e.target.value)}
                disabled={submitting}
              >
                {domains.length === 0 && <option value="">No folders yet</option>}
                {domains.map((d) => (
                  <option key={d.tag} value={d.tag}>
                    {domainDisplayName(d.tag)}
                  </option>
                ))}
                <option value={NEW_FOLDER_VALUE}>+ Create new folder...</option>
              </select>
            )}

            {creatingFolder && (
              <div className="mt-2 flex flex-col gap-2 rounded-sm border border-chrome-border bg-chrome-pane p-3">
                <input
                  className="input"
                  placeholder="Folder name (e.g. saas-refund-disputes)"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  disabled={folderCreating}
                />
                <textarea
                  className="input min-h-16 resize-y"
                  placeholder="Grading rubric: the criteria validators use to judge cases in this folder..."
                  value={newFolderRubric}
                  onChange={(e) => setNewFolderRubric(e.target.value)}
                  disabled={folderCreating}
                />
                {folderError && <p className="text-xs text-red-600">{folderError}</p>}
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    className="text-xs font-medium text-ink-faint hover:text-ink"
                    onClick={() => {
                      setCreatingFolder(false);
                      setFolderError(null);
                    }}
                    disabled={folderCreating}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-secondary !py-1 !text-xs"
                    onClick={handleCreateFolder}
                    disabled={folderCreating}
                  >
                    {folderCreating ? "Creating..." : "Create folder"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="label" htmlFor="title">Case Title</label>
            <input
              id="title"
              className="input"
              placeholder="A short, one-line summary of the dispute"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
              required
            />
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
              required
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
                disabled={!isConnected || domains.length === 0 || creatingFolder}
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
