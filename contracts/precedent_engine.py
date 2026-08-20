# { "Depends": "py-genlayer:<current-sdk-hash>" }
#
# Precedent Engine — GenLayer Intelligent Contract
#
# Trustless, precedent-consistent adjudication for the agentic economy.
# Every ruling is graded against prior rulings in its domain (via the
# Non-Comparative Equivalence Principle) and, once accepted, is written
# back into the domain's precedent set so future cases can cite it.
#
# Reference: PrecedentEngineBuildSpec.pdf, sections 3, 4, 5.
# Confirm exact vector-store method names against sdk.genlayer.com before
# deploying — this contract falls back to an in-contract cosine-similarity
# scan over stored embeddings if the native vector-store primitive isn't
# available yet at build time (see Section 10 of the spec, "Risks").

from genlayer import *
import json
import math

APPEAL_BOND_WEI = 10 ** 16  # 0.01 native token; tune per deployment
TOP_K_PRECEDENTS = 5
MAX_EVIDENCE_CHARS = 2000


class PrecedentEngine(gl.Contract):
    # tag -> {"rubric": str, "integrator": address}
    domains: dict
    # case_id -> {"domain", "description", "evidence_refs", "submitter",
    #             "respondent", "status"}
    cases: dict
    # case_id -> {"outcome", "rationale", "cited_precedent_ids",
    #             "confidence", "round"}
    rulings: dict
    # case_id -> {"appellant", "bond", "status", "escalated_ruling"}
    appeals: dict
    # domain -> list[{"case_id", "embedding", "outcome_summary"}]
    # Fallback precedent index used only if the native vector-store
    # primitive is unavailable (see module docstring).
    precedent_index: dict

    def __init__(self):
        self.domains = {}
        self.cases = {}
        self.rulings = {}
        self.appeals = {}
        self.precedent_index = {}

    # ---------------------------------------------------------------
    # Domain registration (FR7)
    # ---------------------------------------------------------------

    @gl.public.write
    def register_domain(self, tag: str, rubric: str) -> None:
        if tag in self.domains:
            raise Exception(f"domain '{tag}' already registered")
        self.domains[tag] = {
            "rubric": rubric,
            "integrator": gl.message.sender_address,
        }
        self.precedent_index[tag] = []

    # ---------------------------------------------------------------
    # Case submission + first-instance ruling (FR1, FR2, FR3, FR4)
    # ---------------------------------------------------------------

    @gl.public.write
    def submit_case(
        self,
        case_id: str,
        domain: str,
        description: str,
        evidence_refs: list[str],
        respondent: str = "",
    ) -> None:
        if domain not in self.domains:
            raise Exception(f"unknown domain '{domain}'")
        if case_id in self.cases:
            raise Exception(f"case '{case_id}' already exists")

        self.cases[case_id] = {
            "domain": domain,
            "description": description,
            "evidence_refs": evidence_refs,
            "submitter": gl.message.sender_address,
            "respondent": respondent,
            "status": "pending",
        }

        rubric = self.domains[domain]["rubric"]
        precedents = self._retrieve_precedents(domain, description, TOP_K_PRECEDENTS)

        def draft_ruling() -> str:
            evidence_text = self._collect_evidence_text(evidence_refs)
            prompt = f"""
You are ruling on a case in domain '{domain}'. Adjudicate consistently
with the RETRIEVED PRECEDENTS below unless the facts materially differ —
if you depart from a precedent, say exactly why in the rationale.

CASE: {description}

EVIDENCE: {evidence_text}

RETRIEVED PRECEDENTS (most similar first): {json.dumps(precedents)}

Return ONLY JSON with this exact shape:
{{"outcome": "...", "rationale": "...", "cited_precedent_ids": [...], "confidence": 0.0}}
"""
            result = gl.exec_prompt(prompt)
            return json.dumps(json.loads(result), sort_keys=True)

        ruling_json = gl.eq_principle.prompt_non_comparative(
            draft_ruling,
            task="Produce a ruling that is well-reasoned and consistent with cited precedent, "
            "or explicitly justifies departing from it.",
            criteria=rubric,
        )
        ruling = json.loads(ruling_json)
        ruling["round"] = 0

        self.rulings[case_id] = ruling
        self.cases[case_id]["status"] = "ruled"
        self._write_precedent(domain, case_id, description, ruling)

    # ---------------------------------------------------------------
    # Read-only queries (FR8)
    # ---------------------------------------------------------------

    @gl.public.view
    def get_ruling(self, case_id: str) -> dict:
        if case_id not in self.rulings:
            raise Exception(f"no ruling for case '{case_id}'")
        return self.rulings[case_id]

    @gl.public.view
    def get_case(self, case_id: str) -> dict:
        if case_id not in self.cases:
            raise Exception(f"unknown case '{case_id}'")
        return self.cases[case_id]

    @gl.public.view
    def get_domain_precedents(self, domain: str, limit: int = 20) -> list:
        if domain not in self.precedent_index:
            raise Exception(f"unknown domain '{domain}'")
        entries = self.precedent_index[domain][-limit:]
        return [
            {"case_id": e["case_id"], "outcome_summary": e["outcome_summary"]}
            for e in entries
        ]

    # ---------------------------------------------------------------
    # Appeal flow (FR5, FR6)
    # ---------------------------------------------------------------

    @gl.public.write.payable
    def appeal(self, case_id: str) -> None:
        if case_id not in self.rulings:
            raise Exception(f"no ruling to appeal for case '{case_id}'")
        if gl.message.value < APPEAL_BOND_WEI:
            raise Exception(f"appeal bond must be >= {APPEAL_BOND_WEI}")
        if case_id in self.appeals and self.appeals[case_id]["status"] == "pending":
            raise Exception("appeal already in progress for this case")

        case = self.cases[case_id]
        domain = case["domain"]
        rubric = self.domains[domain]["rubric"]
        prior_round = self.rulings[case_id]["round"]
        precedents = self._retrieve_precedents(domain, case["description"], TOP_K_PRECEDENTS)

        def re_rule() -> str:
            evidence_text = self._collect_evidence_text(case["evidence_refs"])
            prompt = f"""
You are the APPEAL panel reviewing a prior ruling in domain '{domain}'.
Independently re-adjudicate. Affirm the original ruling unless the
precedent record or evidence clearly supports a different outcome.

CASE: {case["description"]}

EVIDENCE: {evidence_text}

ORIGINAL RULING: {json.dumps(self.rulings[case_id])}

RETRIEVED PRECEDENTS: {json.dumps(precedents)}

Return ONLY JSON with this exact shape:
{{"outcome": "...", "rationale": "...", "cited_precedent_ids": [...], "confidence": 0.0, "affirmed": true}}
"""
            result = gl.exec_prompt(prompt)
            return json.dumps(json.loads(result), sort_keys=True)

        appeal_ruling_json = gl.eq_principle.prompt_non_comparative(
            re_rule,
            task="Independently re-adjudicate the case on appeal, affirming or overturning "
            "the original ruling with clear reasoning grounded in precedent.",
            criteria=rubric,
        )
        appeal_ruling = json.loads(appeal_ruling_json)
        appeal_ruling["round"] = prior_round + 1

        overturned = not appeal_ruling.get("affirmed", True)

        self.appeals[case_id] = {
            "appellant": gl.message.sender_address,
            "bond": gl.message.value,
            "status": "overturned" if overturned else "affirmed",
            "escalated_ruling": appeal_ruling,
        }

        if overturned:
            self.rulings[case_id] = appeal_ruling
            self._write_precedent(domain, case_id, case["description"], appeal_ruling)

        self.cases[case_id]["status"] = "final"

    # ---------------------------------------------------------------
    # Internal helpers
    # ---------------------------------------------------------------

    def _collect_evidence_text(self, evidence_refs: list[str]) -> str:
        text = ""
        for ref in evidence_refs:
            if ref.startswith("http"):
                text += gl.get_webpage(ref, mode="text")[:MAX_EVIDENCE_CHARS]
            else:
                text += f"[content-hash reference: {ref}] "
        return text

    def _write_precedent(self, domain: str, case_id: str, description: str, ruling: dict) -> None:
        summary = f"{ruling.get('outcome', '')}: {ruling.get('rationale', '')[:280]}"
        self.precedent_index[domain].append({
            "case_id": case_id,
            "embedding": gl.vector_store.embed(f"{description}\n{summary}"),
            "outcome_summary": summary,
        })

    def _retrieve_precedents(self, domain: str, description: str, k: int) -> list:
        """Nearest-neighbor precedent lookup, scoped strictly to `domain`.

        Prefers the native GenLayer vector-store primitive; falls back to
        an in-contract cosine-similarity scan over stored embeddings if
        that primitive isn't available (see Section 10 of the spec).
        """
        entries = self.precedent_index.get(domain, [])
        if not entries:
            return []
        try:
            return gl.vector_store.query(domain, description, top_k=k)
        except AttributeError:
            query_vec = gl.vector_store.embed(description)
            scored = [
                (self._cosine_similarity(query_vec, e["embedding"]), e)
                for e in entries
            ]
            scored.sort(key=lambda pair: pair[0], reverse=True)
            return [
                {"case_id": e["case_id"], "outcome_summary": e["outcome_summary"]}
                for _, e in scored[:k]
            ]

    @staticmethod
    def _cosine_similarity(a: list, b: list) -> float:
        dot = sum(x * y for x, y in zip(a, b))
        norm_a = math.sqrt(sum(x * x for x in a))
        norm_b = math.sqrt(sum(y * y for y in b))
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return dot / (norm_a * norm_b)
