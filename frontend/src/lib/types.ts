export type CaseStatus = "pending" | "ruled" | "appealed" | "final";

export interface DomainConfig {
  tag: string;
  rubric: string;
  integrator: string;
}

export interface Precedent {
  caseId: string;
  domain: string;
  description: string;
  outcome: string;
  outcomeSummary: string;
  rationale: string;
  confidence: number;
  round: number;
  createdAt: string;
}

export interface Case {
  id: string;
  domain: string;
  description: string;
  evidenceRefs: string[];
  submitter: string;
  respondent: string;
  status: CaseStatus;
  createdAt: string;
  /** Disputed amount declared by the submitter, in wei (as a decimal string). "0" if not specified. */
  amount: string;
  /** Escrow actually locked at submission, in wei (as a decimal string). "0" if none. */
  escrow: string;
  escrowWithdrawn: boolean;
}

export interface Ruling {
  caseId: string;
  outcome: string;
  rationale: string;
  citedPrecedentIds: string[];
  confidence: number;
  round: number;
}

export interface Appeal {
  caseId: string;
  appellant: string;
  bond: string; // formatted native token amount
  status: "pending" | "affirmed" | "overturned";
  /** Validators that actually reviewed the escalated round, read from the transaction receipt. */
  validatorCount?: number;
  escalatedRuling?: Ruling;
}
