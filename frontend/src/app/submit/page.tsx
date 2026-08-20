"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DOMAINS } from "@/lib/mockData";
import { submitCase } from "@/lib/genlayerClient";
import ValidatorProgress from "@/components/ValidatorProgress";

const MOCK_SUBMITTER = "0x2b6a...19fd";

export default function SubmitCasePage() {
  const router = useRouter();
  const [domain, setDomain] = useState(DOMAINS[0].tag);
  const [description, setDescription] = useState("");
  const [respondent, setRespondent] = useState("");
  const [evidenceRefs, setEvidenceRefs] = useState<string[]>([""]);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
    setSubmitting(true);
    setStep(0);

    const stepTimers = [400, 900, 1600].map((ms, idx) =>
      setTimeout(() => setStep(idx + 1), ms)
    );

    try {
      const { caseId } = await submitCase({
        domain,
        description,
        evidenceRefs: evidenceRefs.filter((r) => r.trim().length > 0),
        submitter: MOCK_SUBMITTER,
        respondent,
      });
      router.push(`/case/${caseId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ruling failed. Try again.");
      setSubmitting(false);
      stepTimers.forEach(clearTimeout);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gold">New case</p>
      <h1 className="font-serif text-3xl font-semibold text-navy-900">Submit a Case</h1>
      <p className="mt-2 text-sm text-navy-500">
        Your case is ruled against the domain&apos;s existing precedent — the ruling will cite
        and reason about similar past cases, not just answer this one in isolation.
      </p>

      <form onSubmit={handleSubmit} className="card mt-8 flex flex-col gap-6 p-6">
        <div>
          <label className="label" htmlFor="domain">Domain</label>
          <select
            id="domain"
            className="input"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            disabled={submitting}
          >
            {DOMAINS.map((d) => (
              <option key={d.tag} value={d.tag}>
                {d.displayName}
              </option>
            ))}
          </select>
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
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {MOCK_SUBMITTER} (connected wallet)
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {submitting ? (
          <div className="rounded-lg border border-navy-100 bg-navy-50/60 p-4">
            <ValidatorProgress activeStep={step} />
          </div>
        ) : (
          <button type="submit" className="btn-primary w-full">
            Submit for Ruling
          </button>
        )}
      </form>
    </div>
  );
}
