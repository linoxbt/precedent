export type CaseStatus = "pending" | "ruled" | "appealed" | "final";

export interface DomainConfig {
  tag: string;
  displayName: string;
  rubric: string;
  integrator: string;
  precedentTrend: number[]; // sparkline data, recent precedent counts over time
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
  panelSizeBefore: number;
  panelSizeAfter: number;
  escalatedRuling?: Ruling;
}
