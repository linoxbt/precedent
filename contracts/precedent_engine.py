# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

"""
Precedent Engine: GenLayer Intelligent Contract

Trustless, precedent-consistent adjudication for the agentic economy.
Every ruling is graded against prior rulings in its domain (via the
Non-Comparative Equivalence Principle) and, once accepted, is written
back into the domain's precedent set so future cases can cite it.

Reference: PrecedentEngineBuildSpec.pdf, sections 3, 4, 5.
Precedent retrieval uses a deterministic in-contract embedding rather than
GenLayer's native vector-store primitive, whose exact API was still
evolving as of this build (see Section 10 of the spec, "Risks", and the
`_embed` docstring below for why).
"""

from genlayer import *
from dataclasses import dataclass
import hashlib
import json
import math

APPEAL_BOND_WEI = 10 ** 16  # 0.01 native token; tune per deployment
TOP_K_PRECEDENTS = 5
MAX_EVIDENCE_CHARS = 2000
MAX_MESSAGE_CHARS = 2000
EMBED_DIM = 64


@allow_storage
@dataclass
class DomainConfig:
    rubric: str
    integrator: Address


@allow_storage
@dataclass
class CaseRecord:
    domain: str
    description: str
    evidence_refs: DynArray[str]
    submitter: Address
    respondent: str
    status: str
    # JSON-encoded {"sender": "0x...", "text": "..."} strings, oldest first.
    # Kept as plain str (not a new dataclass/TreeMap) deliberately: see the
    # "Non-obvious things learned" note in README.md on the GenVM storage bug
    # that broke the escrow feature when new bigint-bearing storage shapes
    # were added.
    messages: DynArray[str]


@allow_storage
@dataclass
class RulingRecord:
    outcome: str
    rationale: str
    cited_precedent_ids: DynArray[str]
    confidence: float
    round: bigint


@allow_storage
@dataclass
class AppealRecord:
    appellant: Address
    bond: u256
    status: str
    escalated_ruling: RulingRecord


@allow_storage
@dataclass
class PrecedentEntry:
    case_id: str
    embedding: DynArray[float]
    outcome_summary: str


class PrecedentEngine(gl.Contract):
    domains: TreeMap[str, DomainConfig]
    cases: TreeMap[str, CaseRecord]
    rulings: TreeMap[str, RulingRecord]
    appeals: TreeMap[str, AppealRecord]
    precedent_index: TreeMap[str, DynArray[PrecedentEntry]]

    def __init__(self):
        pass

    # ---------------------------------------------------------------
    # Domain registration (FR7)
    # ---------------------------------------------------------------

    @gl.public.write
    def register_domain(self, tag: str, rubric: str) -> None:
        if tag in self.domains:
            raise Exception(f"domain '{tag}' already registered")
        self.domains[tag] = DomainConfig(rubric=rubric, integrator=gl.message.sender_address)

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

        self.cases[case_id] = CaseRecord(
            domain=domain,
            description=description,
            evidence_refs=evidence_refs,
            submitter=gl.message.sender_address,
            respondent=respondent,
            status="pending",
            messages=[],
        )

        rubric = self.domains[domain].rubric
        precedents = self._retrieve_precedents(domain, description, TOP_K_PRECEDENTS)

        def case_input() -> str:
            # `fn` passed to prompt_non_comparative must return the raw INPUT
            # text for the LLM to act on; the LLM call itself happens inside
            # prompt_non_comparative (via task= and criteria=), not here. See
            # sdk.genlayer.com's eq_principles source: the leader/validator
            # closures it builds internally call fn() for input only, then
            # run their own ExecPromptTemplate call around it.
            evidence_text = ""
            for ref in evidence_refs:
                if ref.startswith("http"):
                    evidence_text += gl.get_webpage(ref, mode="text")[:MAX_EVIDENCE_CHARS]
                else:
                    evidence_text += f"[content-hash reference: {ref}] "
            return f"""
CASE (domain '{domain}'): {description}

EVIDENCE: {evidence_text}

RETRIEVED PRECEDENTS (most similar first): {json.dumps(precedents)}
"""

        ruling_json = gl.eq_principle.prompt_non_comparative(
            case_input,
            task="Adjudicate this case consistently with the RETRIEVED PRECEDENTS in the input "
            "unless the facts materially differ. If you depart from a precedent, say exactly "
            "why in the rationale. Return ONLY JSON with this exact shape, no markdown fences "
            'or extra text: {"outcome": "...", "rationale": "...", '
            '"cited_precedent_ids": [...], "confidence": 0.0}',
            criteria=rubric,
        )
        ruling_data = json.loads(ruling_json.replace("```json", "").replace("```", "").strip())
        ruling = RulingRecord(
            outcome=ruling_data["outcome"],
            rationale=ruling_data["rationale"],
            cited_precedent_ids=ruling_data.get("cited_precedent_ids", []),
            confidence=float(ruling_data.get("confidence", 0.0)),
            round=0,
        )

        self.rulings[case_id] = ruling
        self.cases[case_id].status = "ruled"
        self._write_precedent(domain, case_id, description, ruling)

    # ---------------------------------------------------------------
    # Read-only queries (FR8)
    # ---------------------------------------------------------------

    @gl.public.view
    def get_ruling(self, case_id: str) -> dict:
        if case_id not in self.rulings:
            raise Exception(f"no ruling for case '{case_id}'")
        return self._ruling_to_dict(self.rulings[case_id])

    @gl.public.view
    def get_case(self, case_id: str) -> dict:
        if case_id not in self.cases:
            raise Exception(f"unknown case '{case_id}'")
        c = self.cases[case_id]
        return {
            "domain": c.domain,
            "description": c.description,
            "evidence_refs": list(c.evidence_refs),
            "submitter": c.submitter.as_hex,
            "respondent": c.respondent,
            "status": c.status,
            "message_count": len(c.messages),
        }

    @gl.public.view
    def list_domains(self) -> list:
        return [
            {"tag": tag, "rubric": cfg.rubric, "integrator": cfg.integrator.as_hex}
            for tag, cfg in self.domains.items()
        ]

    @gl.public.view
    def get_domain_precedents(self, domain: str, limit: int = 20) -> list:
        if domain not in self.domains:
            raise Exception(f"unknown domain '{domain}'")
        entries = list(self.precedent_index[domain]) if domain in self.precedent_index else []
        recent = entries[-limit:]
        return [{"case_id": e.case_id, "outcome_summary": e.outcome_summary} for e in recent]

    # ---------------------------------------------------------------
    # Appeal flow (FR5, FR6)
    # ---------------------------------------------------------------

    @gl.public.view
    def get_appeal(self, case_id: str) -> dict:
        if case_id not in self.appeals:
            raise Exception(f"no appeal for case '{case_id}'")
        a = self.appeals[case_id]
        return {
            "appellant": a.appellant.as_hex,
            "bond": a.bond,
            "status": a.status,
            "escalated_ruling": self._ruling_to_dict(a.escalated_ruling),
        }

    @gl.public.write.payable
    def appeal(self, case_id: str) -> None:
        if case_id not in self.rulings:
            raise Exception(f"no ruling to appeal for case '{case_id}'")
        if gl.message.value < APPEAL_BOND_WEI:
            raise Exception(f"appeal bond must be >= {APPEAL_BOND_WEI}")
        if case_id in self.appeals and self.appeals[case_id].status == "pending":
            raise Exception("appeal already in progress for this case")

        case = self.cases[case_id]
        domain = case.domain
        rubric = self.domains[domain].rubric
        prior_round = self.rulings[case_id].round
        precedents = self._retrieve_precedents(domain, case.description, TOP_K_PRECEDENTS)
        original_ruling_json = json.dumps(self._ruling_to_dict(self.rulings[case_id]))
        evidence_refs = list(case.evidence_refs)
        description = case.description

        def appeal_input() -> str:
            evidence_text = ""
            for ref in evidence_refs:
                if ref.startswith("http"):
                    evidence_text += gl.get_webpage(ref, mode="text")[:MAX_EVIDENCE_CHARS]
                else:
                    evidence_text += f"[content-hash reference: {ref}] "
            return f"""
CASE (domain '{domain}'): {description}

EVIDENCE: {evidence_text}

ORIGINAL RULING: {original_ruling_json}

RETRIEVED PRECEDENTS: {json.dumps(precedents)}
"""

        appeal_ruling_json = gl.eq_principle.prompt_non_comparative(
            appeal_input,
            task="You are the APPEAL panel reviewing the ORIGINAL RULING in the input. "
            "Independently re-adjudicate, affirming it unless the precedent record or evidence "
            "clearly supports a different outcome. Return ONLY JSON with this exact shape, no "
            'markdown fences or extra text: {"outcome": "...", "rationale": "...", '
            '"cited_precedent_ids": [...], "confidence": 0.0, "affirmed": true}',
            criteria=rubric,
        )
        appeal_data = json.loads(appeal_ruling_json.replace("```json", "").replace("```", "").strip())
        appeal_ruling = RulingRecord(
            outcome=appeal_data["outcome"],
            rationale=appeal_data["rationale"],
            cited_precedent_ids=appeal_data.get("cited_precedent_ids", []),
            confidence=float(appeal_data.get("confidence", 0.0)),
            round=prior_round + 1,
        )

        overturned = not appeal_data.get("affirmed", True)

        self.appeals[case_id] = AppealRecord(
            appellant=gl.message.sender_address,
            bond=gl.message.value,
            status="overturned" if overturned else "affirmed",
            escalated_ruling=appeal_ruling,
        )

        if overturned:
            self.rulings[case_id] = appeal_ruling
            self._write_precedent(domain, case_id, description, appeal_ruling)

        self.cases[case_id].status = "final"

    # ---------------------------------------------------------------
    # Case messaging (submitter <-> respondent)
    # ---------------------------------------------------------------

    @gl.public.write
    def send_case_message(self, case_id: str, text: str) -> None:
        if case_id not in self.cases:
            raise Exception(f"unknown case '{case_id}'")
        text = text.strip()
        if not text:
            raise Exception("message text is required")
        if len(text) > MAX_MESSAGE_CHARS:
            raise Exception(f"message too long, max {MAX_MESSAGE_CHARS} characters")

        case = self.cases[case_id]
        sender_hex = gl.message.sender_address.as_hex.lower()
        is_submitter = sender_hex == case.submitter.as_hex.lower()
        is_respondent = bool(case.respondent) and sender_hex == case.respondent.lower()
        if not (is_submitter or is_respondent):
            raise Exception("only the case's submitter or respondent can send messages")

        case.messages.append(json.dumps({"sender": sender_hex, "text": text}))

    @gl.public.view
    def get_case_messages(self, case_id: str) -> list:
        if case_id not in self.cases:
            raise Exception(f"unknown case '{case_id}'")
        return [json.loads(m) for m in self.cases[case_id].messages]

    # ---------------------------------------------------------------
    # Internal helpers
    # ---------------------------------------------------------------

    @staticmethod
    def _ruling_to_dict(r: RulingRecord) -> dict:
        return {
            "outcome": r.outcome,
            "rationale": r.rationale,
            "cited_precedent_ids": list(r.cited_precedent_ids),
            # float isn't calldata-encodable in a view-method return value
            # (only in storage), so it's serialized as a string here.
            "confidence": str(r.confidence),
            "round": r.round,
        }

    def _write_precedent(self, domain: str, case_id: str, description: str, ruling: RulingRecord) -> None:
        summary = f"{ruling.outcome}: {ruling.rationale[:280]}"
        entry = PrecedentEntry(
            case_id=case_id,
            embedding=self._embed(f"{description}\n{summary}"),
            outcome_summary=summary,
        )
        self.precedent_index.get_or_insert_default(domain).append(entry)

    def _retrieve_precedents(self, domain: str, description: str, k: int) -> list:
        """Nearest-neighbor precedent lookup, scoped strictly to `domain`.

        Uses a deterministic in-contract embedding (see `_embed`) rather than
        GenLayer's native vector-store primitive: that primitive's exact API
        was still evolving as of this build (see Section 10 of the spec), and
        every validator must derive bit-identical state from this write path,
        which rules out anything nondeterministic (e.g. Python's randomized
        string hashing, or an LLM-derived embedding outside an eq_principle
        block).
        """
        if domain not in self.precedent_index:
            return []
        entries = list(self.precedent_index[domain])
        if not entries:
            return []
        query_vec = self._embed(description)
        scored = [
            (self._cosine_similarity(query_vec, list(e.embedding)), e)
            for e in entries
        ]
        scored.sort(key=lambda pair: pair[0], reverse=True)
        return [
            {"case_id": e.case_id, "outcome_summary": e.outcome_summary}
            for _, e in scored[:k]
        ]

    @staticmethod
    def _embed(text: str, dim: int = EMBED_DIM) -> list:
        """Deterministic bag-of-words hashing embedding (the 'hashing trick').

        Uses sha256 rather than Python's built-in hash() because str hashing
        is randomized per-process by default (PYTHONHASHSEED) and would make
        every validator compute a different vector for the same text.
        """
        vec = [0.0] * dim
        for word in text.lower().split():
            digest = hashlib.sha256(word.encode("utf-8")).digest()
            idx = int.from_bytes(digest[:4], "big") % dim
            vec[idx] += 1.0
        return vec

    @staticmethod
    def _cosine_similarity(a: list, b: list) -> float:
        dot = sum(x * y for x, y in zip(a, b))
        norm_a = math.sqrt(sum(x * x for x in a))
        norm_b = math.sqrt(sum(y * y for y in b))
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return dot / (norm_a * norm_b)
