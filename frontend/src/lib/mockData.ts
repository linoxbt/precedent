import type { Appeal, Case, DomainConfig, Precedent, Ruling } from "./types";

// Seeded demo data matching the build spec's demo script (Section 9):
// "Freelance Delivery Disputes" opens with 6 precedents; Case #1 is a
// near-duplicate of an existing precedent, Case #2 is a deliberate
// near-miss that the ruling explicitly distinguishes, and Case #2 is
// then appealed live with the panel visibly doubling.

export const DOMAINS: DomainConfig[] = [
  {
    tag: "freelance-delivery-disputes",
    displayName: "Freelance Delivery Disputes",
    rubric:
      "Rule on late, incomplete, or below-spec freelance deliverables. Weigh contract terms " +
      "(deadlines, grace periods, 'time is of the essence' clauses), documented cause of delay, " +
      "and quantifiable harm to the client. Cite the closest precedent and explain any departure.",
    integrator: "0x8f2a...c91b",
    precedentTrend: [1, 2, 2, 3, 4, 5, 6],
  },
  {
    tag: "content-moderation-appeals",
    displayName: "Content Moderation Appeals",
    rubric:
      "Rule on appeals of automated content-policy strikes. Weigh the platform's stated policy " +
      "text, the flagged content in context, and precedent for similar borderline content.",
    integrator: "0x4c11...7a20",
    precedentTrend: [1, 1, 2, 3, 3, 4],
  },
  {
    tag: "agent-task-completion",
    displayName: "Agent Task Completion",
    rubric:
      "Rule on whether an autonomous agent completed a delegated task as specified. Weigh the " +
      "original task specification, submitted output, and any partial-completion precedent.",
    integrator: "0x91de...3f56",
    precedentTrend: [0, 1, 1, 2],
  },
];

export const PRECEDENTS: Precedent[] = [
  {
    caseId: "FDD-0001",
    domain: "freelance-delivery-disputes",
    description:
      "Freelancer delivered a logo package 2 days after the contracted deadline. Contract " +
      "included a standard 3-day grace period clause. Client requests a discount.",
    outcome: "10pct_discount",
    outcomeSummary: "10% discount — within grace period, minor delay, no demonstrated harm.",
    rationale:
      "The 2-day delay falls within the contract's explicit 3-day grace period, so the delay " +
      "itself is not a breach. A modest 10% discount is nonetheless warranted as goodwill given " +
      "the client's inconvenience, consistent with similar minor-delay cases in this domain.",
    confidence: 0.86,
    round: 0,
    createdAt: "2026-06-02T14:20:00Z",
  },
  {
    caseId: "FDD-0002",
    domain: "freelance-delivery-disputes",
    description:
      "Freelancer never delivered the contracted website build after 3 missed check-ins over " +
      "6 weeks. No communication from freelancer for the final 2 weeks.",
    outcome: "full_refund",
    outcomeSummary: "Full refund — non-delivery with sustained non-responsiveness.",
    rationale:
      "Complete non-delivery combined with abandonment of communication constitutes a fundamental " +
      "breach. No partial work product was submitted for the client to salvage value from.",
    confidence: 0.95,
    round: 0,
    createdAt: "2026-06-05T09:10:00Z",
  },
  {
    caseId: "FDD-0003",
    domain: "freelance-delivery-disputes",
    description:
      "Freelancer delivered on time, but the deliverable covered only 3 of the 5 contracted " +
      "landing pages. Freelancer cites scope ambiguity in the brief.",
    outcome: "50pct_refund",
    outcomeSummary: "50% refund — material scope shortfall despite on-time delivery.",
    rationale:
      "Timeliness does not cure a 40% shortfall in contracted scope. The brief, while imperfectly " +
      "worded, enumerated 5 distinct pages by name; the ambiguity defense does not hold for named " +
      "deliverables. Refund is scaled to the proportion of undelivered scope.",
    confidence: 0.81,
    round: 0,
    createdAt: "2026-06-09T16:45:00Z",
  },
  {
    caseId: "FDD-0004",
    domain: "freelance-delivery-disputes",
    description:
      "Freelancer delivered a marketing report 5 days late. The contract stated a target date " +
      "but did not mark the deadline as binding, and no grace period clause existed either way.",
    outcome: "no_refund",
    outcomeSummary: "No refund — deadline was a non-binding target, not a firm commitment.",
    rationale:
      "Absent a binding-deadline clause or a 'time is of the essence' designation, a stated target " +
      "date functions as an expectation, not an enforceable term. The client accepted the delivered " +
      "report without further objection to its content.",
    confidence: 0.78,
    round: 0,
    createdAt: "2026-06-14T11:05:00Z",
  },
  {
    caseId: "FDD-0005",
    domain: "freelance-delivery-disputes",
    description:
      "Freelancer delivered an app icon set on time, but 6 of 12 icons did not match the " +
      "specified style guide (wrong stroke weight, inconsistent palette).",
    outcome: "25pct_refund",
    outcomeSummary: "25% refund — on-time but half the deliverable failed the style spec.",
    rationale:
      "On-time delivery is not in dispute. Half the icon set materially deviated from the " +
      "documented style guide, a quality defect rather than a timing one. Refund is scaled to " +
      "the fraction of non-conforming units.",
    confidence: 0.83,
    round: 0,
    createdAt: "2026-06-20T13:30:00Z",
  },
  {
    caseId: "FDD-0006",
    domain: "freelance-delivery-disputes",
    description:
      "Freelancer delivered 3 days late due to a documented multi-day cloud provider outage " +
      "affecting their build pipeline, evidenced by the provider's public status page.",
    outcome: "no_refund_with_extension",
    outcomeSummary: "No refund, revision window extended — verifiable force majeure.",
    rationale:
      "The delay is attributable to a documented, verifiable third-party outage outside the " +
      "freelancer's control, evidenced by the cited status page. No penalty applies, but the " +
      "client's revision window is extended by the delay period to make them whole on process, " +
      "not price.",
    confidence: 0.88,
    round: 0,
    createdAt: "2026-06-27T08:15:00Z",
  },
];

export const CASES: Record<string, Case> = {
  "FDD-0001": mkCase("FDD-0001", PRECEDENTS[0], "ruled"),
  "FDD-0002": mkCase("FDD-0002", PRECEDENTS[1], "ruled"),
  "FDD-0003": mkCase("FDD-0003", PRECEDENTS[2], "ruled"),
  "FDD-0004": mkCase("FDD-0004", PRECEDENTS[3], "ruled"),
  "FDD-0005": mkCase("FDD-0005", PRECEDENTS[4], "ruled"),
  "FDD-0006": mkCase("FDD-0006", PRECEDENTS[5], "ruled"),
  "FDD-1001": {
    id: "FDD-1001",
    domain: "freelance-delivery-disputes",
    description:
      "Freelancer delivered a brand style guide 2 days after the contracted deadline. The " +
      "contract includes a 3-day grace period clause identical to prior engagements with this " +
      "client. Client is requesting a discount for the delay.",
    evidenceRefs: ["ipfs://bafy...contract-fdd1001", "ipfs://bafy...delivery-log-fdd1001"],
    submitter: "0x2b6a...19fd (client)",
    respondent: "0x77c4...eb02 (freelancer)",
    status: "ruled",
    createdAt: "2026-08-14T10:00:00Z",
  },
  "FDD-1002": {
    id: "FDD-1002",
    domain: "freelance-delivery-disputes",
    description:
      "Freelancer delivered a brand style guide 2 days after the contracted deadline. The " +
      "contract explicitly designates the deadline as 'time is of the essence' with no grace " +
      "period, because the client needed assets for a fixed launch event date.",
    evidenceRefs: ["ipfs://bafy...contract-fdd1002", "ipfs://bafy...launch-invite-fdd1002"],
    submitter: "0x2b6a...19fd (client)",
    respondent: "0x901f...44ac (freelancer)",
    status: "final",
    createdAt: "2026-08-15T09:30:00Z",
  },
};

function mkCase(id: string, p: Precedent, status: Case["status"]): Case {
  return {
    id,
    domain: p.domain,
    description: p.description,
    evidenceRefs: [`ipfs://bafy...evidence-${id.toLowerCase()}`],
    submitter: "0x2b6a...19fd (client)",
    respondent: "0x77c4...eb02 (freelancer)",
    status,
    createdAt: p.createdAt,
  };
}

export const RULINGS: Record<string, Ruling> = {
  "FDD-0001": rulingFromPrecedent(PRECEDENTS[0], []),
  "FDD-0002": rulingFromPrecedent(PRECEDENTS[1], []),
  "FDD-0003": rulingFromPrecedent(PRECEDENTS[2], []),
  "FDD-0004": rulingFromPrecedent(PRECEDENTS[3], []),
  "FDD-0005": rulingFromPrecedent(PRECEDENTS[4], []),
  "FDD-0006": rulingFromPrecedent(PRECEDENTS[5], []),
  "FDD-1001": {
    caseId: "FDD-1001",
    outcome: "10pct_discount",
    rationale:
      "This case closely mirrors Precedent #FDD-0001: a 2-day delay squarely within a 3-day " +
      "contractual grace period, with no evidence of client harm beyond inconvenience. Consistent " +
      "with that precedent, the delay is not a breach, but a modest 10% discount is warranted as " +
      "goodwill for the inconvenience caused.",
    citedPrecedentIds: ["FDD-0001"],
    confidence: 0.89,
    round: 0,
  },
  "FDD-1002": {
    caseId: "FDD-1002",
    outcome: "25pct_refund",
    rationale:
      "This case is superficially similar to Precedent #FDD-0001 (same 2-day delay, same " +
      "deliverable type) but differs on the one fact that controls the outcome: the contract " +
      "designates the deadline 'time is of the essence' with no grace period, because the client " +
      "had a fixed launch event dependent on timely delivery. That removes the shelter Precedent " +
      "#FDD-0001 relied on. This instead follows the reasoning of Precedent #FDD-0005 (on-time " +
      "delivery does not by itself excuse a controlling defect) applied to timing rather than " +
      "quality: a firm, bargained-for deadline was missed, causing the client to scramble ahead " +
      "of a fixed external event. A 25% refund reflects a real but non-catastrophic breach — " +
      "the asset still arrived usable before the event, distinguishing this from the full-refund " +
      "outcome in Precedent #FDD-0002, where nothing was delivered at all.",
    citedPrecedentIds: ["FDD-0001", "FDD-0002", "FDD-0005"],
    confidence: 0.74,
    round: 0,
  },
};

export const APPEALS: Record<string, Appeal> = {
  "FDD-1002": {
    caseId: "FDD-1002",
    appellant: "0x77c4...eb02 (freelancer)",
    bond: "0.01 GEN",
    status: "overturned",
    panelSizeBefore: 3,
    panelSizeAfter: 6,
    escalatedRuling: {
      caseId: "FDD-1002",
      outcome: "50pct_refund",
      rationale:
        "The escalated panel affirms that Precedent #FDD-0001 does not control given the binding " +
        "'time is of the essence' clause, but finds the first-instance ruling understated the harm: " +
        "the client submitted evidence (launch invitation, FDD-1002 evidence set) that the asset's " +
        "late arrival forced a same-day redesign of printed launch materials, a quantifiable cost " +
        "beyond mere inconvenience. Weighing that documented harm against the freelancer's partial " +
        "and usable delivery, a 50% refund is the consistent outcome, and this ruling now supersedes " +
        "the first-instance ruling as the controlling precedent for firm-deadline delay cases with " +
        "demonstrated downstream cost.",
      citedPrecedentIds: ["FDD-0001", "FDD-0002", "FDD-0003"],
      confidence: 0.8,
      round: 1,
    },
  },
};

function rulingFromPrecedent(p: Precedent, cited: string[]): Ruling {
  return {
    caseId: p.caseId,
    outcome: p.outcome,
    rationale: p.rationale,
    citedPrecedentIds: cited,
    confidence: p.confidence,
    round: p.round,
  };
}

export function getPrecedentById(caseId: string): Precedent | undefined {
  return PRECEDENTS.find((p) => p.caseId === caseId);
}

export function getDomain(tag: string): DomainConfig | undefined {
  return DOMAINS.find((d) => d.tag === tag);
}

export function getPrecedentsForDomain(tag: string): Precedent[] {
  return PRECEDENTS.filter((p) => p.domain === tag);
}

export function outcomeLabel(outcome: string): string {
  return outcome
    .replace(/_/g, " ")
    .replace(/pct/g, "%")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
