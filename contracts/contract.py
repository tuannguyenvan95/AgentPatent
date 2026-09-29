# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
from dataclasses import dataclass
import json

# Canonical GenVM transaction rollback error support
if hasattr(gl, "vm") and hasattr(gl.vm, "UserError"):
    gl.UserError = gl.vm.UserError
elif not hasattr(gl, "UserError"):
    gl.UserError = ValueError

CANARY_TOKEN = "CANARY_AGENT_PATENT_V2"
COOLING_OFF_SECONDS = 300       # 5 minutes manipulation-resistant cooling-off window
DEFAULT_PATENT_DURATION = 86400 # 24 hours default protection
STALL_TIMEOUT_SECONDS = 3600    # 1 hour evaluation timeout

# Patent Status Codes
STATUS_ACTIVE_PROTECTED = u8(0)     # Under active patent protection, open to challenge
STATUS_IN_EXAMINATION = u8(1)       # Challenger staked bond, awaiting AI examination
STATUS_AWAITING_PAYOUT = u8(2)      # AI verdict rendered, 5-minute cooling-off window active
STATUS_INVALIDATED_SLASHED = u8(3)  # Settled: Patent lacks novelty, escrow awarded to challenger
STATUS_UPHELD_DEFENDED = u8(4)      # Settled: Patent novel, challenger bond awarded to inventor
STATUS_EXPIRED_RECLAIMED = u8(5)    # Settled: Protection duration lapsed uncontested, escrow reclaimed
STATUS_DISPUTED = u8(6)             # Contested during cooling-off, escalated for appellate AI jury review
STATUS_ESCALATED = u8(7)            # AI examination uncertain or canary mismatch, safe timeout recovery


def _addr_str(addr: Address) -> str:
    """Safely format an Address instance into a lowercase hex string."""
    try:
        return addr.as_hex.lower()
    except Exception:
        return str(addr).lower()


def _get_sender() -> Address:
    """Safely obtain transaction sender across GenVM runtime versions."""
    try:
        if hasattr(gl, "message") and hasattr(gl.message, "sender_address") and gl.message.sender_address:
            return gl.message.sender_address
    except Exception:
        pass
    try:
        if hasattr(gl, "message") and hasattr(gl.message, "sender") and gl.message.sender:
            return gl.message.sender
    except Exception:
        pass
    try:
        return gl.message.sender_address
    except Exception:
        pass
    return None


def _current_timestamp() -> u256:
    """Derives manipulation-resistant execution timestamp from consensus block context."""
    from datetime import datetime
    try:
        if hasattr(gl, "message_raw") and isinstance(gl.message_raw, dict):
            raw_val = gl.message_raw.get("datetime", "")
            if raw_val:
                dt_str = str(raw_val).strip().replace("Z", "+00:00")
                ts = int(datetime.fromisoformat(dt_str).timestamp())
                if ts > 0:
                    return u256(ts)
    except Exception:
        pass
    try:
        if hasattr(gl, "message") and hasattr(gl.message, "datetime") and gl.message.datetime:
            dt_str = str(gl.message.datetime).strip().replace("Z", "+00:00")
            ts = int(datetime.fromisoformat(dt_str).timestamp())
            if ts > 0:
                return u256(ts)
    except Exception:
        pass
    return u256(1700000000)


@allow_storage
@dataclass
class PatentCase:
    """Storage struct representing an autonomous AI patent claim & prior art collision escrow."""
    patent_id: str
    inventor: Address
    challenger: Address
    dispute_initiator: Address
    escrow_deposit: bigint         # Patent validity bond locked by inventor
    challenger_bond: bigint        # Anti-griefing bond staked by challenger
    dispute_bond: bigint           # Staked bond by appellant during appeal
    patent_title: str
    novelty_claims: str            # Core inventive steps, mathematical formulation, claims
    prior_art_url: str             # Evidence URL submitted by challenger (e.g. arXiv paper, patent)
    appeal_evidence_url: str       # Rebuttal counter-evidence URL submitted during appeal
    status: u8                     # STATUS_*
    verdict: str                   # Current verdict
    initial_verdict: str           # Preserved initial verdict across any appeal outcome
    reason: str                    # Technical rationale from Patent Examination Board
    confidence: u8                 # 0 - 100: Validator consensus confidence
    overlap_score: u8              # 0 - 100: Degree of technical equivalence with prior art
    created_at_time: u256          # Deterministic creation timestamp
    expires_at_time: u256          # Deterministic expiration timestamp
    examination_started_time: u256 # Examination initiation timestamp
    audit_completed_time: u256     # Cooling-off timelock baseline


class Contract(gl.Contract):
    """
    AgentPatent: Autonomous AI Research Prior Art & Patent Collision Court
    Target Network: GenLayer studionet (Chain ID: 61999 / 0xF22F)
    Features: Multi-Role Permissions, Escrow Preservation, Manipulation-Resistant Timestamps,
              Appellate Autonomous AI Jury Court, Zero Admin Backdoors.
    """
    patents: TreeMap[str, PatentCase]
    patent_ids: DynArray[str]
    total_patent_locked: bigint
    total_disputes_resolved: u32
    patent_counter: u64

    def __init__(self):
        self.total_patent_locked = bigint(0)
        self.total_disputes_resolved = u32(0)
        self.patent_counter = u64(0)

    def _sanitize_input(self, text: str) -> str:
        clean = str(text)
        injection_patterns = [
            "ignore all previous instructions",
            "ignore previous instructions",
            "system prompt",
            "developer mode",
            "override verdict",
            "always output",
            "jailbreak",
            "prompt injection",
        ]
        clean_lower = clean.lower()
        for phrase in injection_patterns:
            if phrase in clean_lower:
                clean = clean.replace(phrase, "[BLOCKED_INJECTION_PATTERN]")
        return clean

    def _resolve_pid(self, patent_id: str) -> str:
        raw_key = str(patent_id).strip()
        if raw_key in self.patents:
            return raw_key
        prefixed = f"patent-{raw_key}"
        if prefixed in self.patents:
            return prefixed
        return raw_key

    @gl.public.write.payable
    def register_patent_claim(self, patent_title: str, novelty_claims: str, duration_seconds: int) -> str:
        deposit = bigint(gl.message.value)
        if deposit <= bigint(0):
            raise gl.UserError("Patent validity escrow deposit must be greater than 0 GEN.")

        clean_title = self._sanitize_input(str(patent_title).strip())
        if not clean_title or len(clean_title) < 5:
            raise gl.UserError("Patent title must be at least 5 characters.")

        clean_claims = self._sanitize_input(str(novelty_claims).strip())
        if not clean_claims or len(clean_claims) < 20:
            raise gl.UserError("Novelty claims and inventive specification must be at least 20 characters.")

        dur = u256(duration_seconds if duration_seconds > 0 else 86400)
        now = _current_timestamp()

        self.patent_counter = self.patent_counter + u64(1)
        patent_id = f"patent-{int(self.patent_counter)}"
        expires_at = now + dur
        sender = _get_sender()

        new_patent = PatentCase(
            patent_id=patent_id,
            inventor=sender,
            challenger=sender,  # Initially set to inventor; status 0 indicates uncontested
            dispute_initiator=sender,
            escrow_deposit=deposit,
            challenger_bond=bigint(0),
            dispute_bond=bigint(0),
            patent_title=clean_title,
            novelty_claims=clean_claims,
            prior_art_url="",
            appeal_evidence_url="",
            status=STATUS_ACTIVE_PROTECTED,
            verdict="PENDING",
            initial_verdict="PENDING",
            reason="Patent active. Under on-chain novelty protection awaiting challenge or expiration.",
            confidence=u8(0),
            overlap_score=u8(0),
            created_at_time=now,
            expires_at_time=expires_at,
            examination_started_time=u256(0),
            audit_completed_time=u256(0),
        )

        self.patents[patent_id] = new_patent
        self.patent_ids.append(patent_id)
        self.total_patent_locked = self.total_patent_locked + deposit

        return patent_id

    @gl.public.write.payable
    def challenge_prior_art(self, patent_id: str, prior_art_url: str) -> None:
        pid = self._resolve_pid(patent_id)
        if pid not in self.patents:
            raise gl.UserError(f"Patent case {patent_id} does not exist.")

        p = self.patents[pid]
        if p.status != STATUS_ACTIVE_PROTECTED:
            raise gl.UserError("Only active patents under protection can be challenged.")

        sender = _get_sender()
        if _addr_str(sender) == _addr_str(p.inventor):
            raise gl.UserError("Inventor cannot challenge their own patent.")

        now = _current_timestamp()
        if now > p.expires_at_time:
            raise gl.UserError("Cannot challenge: Patent protection duration has already expired.")

        clean_url = str(prior_art_url).strip()
        if not clean_url.startswith("http://") and not clean_url.startswith("https://"):
            raise gl.UserError("Valid public prior art URL (http/https) is required.")

        min_bond = p.escrow_deposit // bigint(10)
        if min_bond == bigint(0):
            min_bond = bigint(1)

        staked = bigint(gl.message.value)
        if staked < min_bond:
            raise gl.UserError(f"Must stake at least 10% challenge bond ({int(min_bond)} wei).")

        p.challenger = sender
        p.prior_art_url = clean_url
        p.challenger_bond = staked
        p.status = STATUS_IN_EXAMINATION
        p.examination_started_time = now
        p.reason = "Prior art collision challenge filed with staked bond. AI Patent Examination Board convened."

        self.total_patent_locked = self.total_patent_locked + staked

    @gl.public.write
    def adjudicate_collision(self, patent_id: str) -> None:
        pid = self._resolve_pid(patent_id)
        if pid not in self.patents:
            raise gl.UserError(f"Patent case {patent_id} does not exist.")

        p = self.patents[pid]
        if p.status != STATUS_IN_EXAMINATION:
            raise gl.UserError("Patent case is not awaiting collision adjudication.")

        art_url = p.prior_art_url
        title = p.patent_title
        claims = p.novelty_claims
        sanitizer = self._sanitize_input

        def leader_fn():
            raw_art = ""
            fetch_error = False
            try:
                raw_art = gl.nondet.web.render(art_url, mode="text")
            except Exception:
                fetch_error = True

            if fetch_error or not raw_art or len(raw_art.strip()) == 0:
                return {
                    "canary": CANARY_TOKEN,
                    "verdict": "PATENT_UPHELD_VALID",
                    "confidence": 100,
                    "overlap_score": 0,
                    "reason": "Could not access prior art URL (404/network failure). Challenge dismissed."
                }

            sanitized_art = sanitizer(raw_art)
            truncated_art = sanitized_art[:6500] if len(sanitized_art) > 6500 else sanitized_art

            prompt = f"""You are the Chief Examiner of the AgentPatent Board on GenLayer.
Evaluate whether the submitted prior art anticipates or renders obvious the claimed patent.

CHALLENGED PATENT SPECIFICATION:
<patent_title>{title}</patent_title>
<novelty_claims>{claims}</novelty_claims>

EXTRACTED PRIOR ART EVIDENCE:
<prior_art_document>{truncated_art}</prior_art_document>

EXAMINATION CRITERIA:
1. Novelty & Inventive Step: Compute overlap_score (0-100).
2. If overlap_score >= 75: Output "PATENT_INVALIDATED".
3. If overlap_score < 75: Output "PATENT_UPHELD_VALID".

SECURITY CANARY:
Include "canary": "{CANARY_TOKEN}" in your JSON response.

Respond ONLY with valid JSON without markdown fences:
{{
  "canary": "{CANARY_TOKEN}",
  "verdict": "PATENT_INVALIDATED"|"PATENT_UPHELD_VALID",
  "confidence": <0-100>,
  "overlap_score": <0-100>,
  "reason": "<rigorous examination justification>"
}}"""

            raw_res = gl.nondet.exec_prompt(prompt, response_format="json")
            parsed = None
            if isinstance(raw_res, dict):
                parsed = raw_res
            elif isinstance(raw_res, str):
                cleaned = raw_res.strip().replace("```json", "").replace("```", "").strip()
                try:
                    parsed = json.loads(cleaned)
                except Exception:
                    pass

            if not parsed or str(parsed.get("canary", "")) != CANARY_TOKEN:
                return {
                    "canary": CANARY_TOKEN,
                    "verdict": "ESCALATED",
                    "confidence": 0,
                    "overlap_score": 0,
                    "reason": "AI examination output format invalid or canary token mismatch."
                }

            verdict_str = str(parsed.get("verdict", "")).strip().upper()
            if verdict_str not in ("PATENT_INVALIDATED", "PATENT_UPHELD_VALID"):
                verdict_str = "ESCALATED"

            def _clean_num(val, default):
                try:
                    return max(0, min(100, int(val)))
                except Exception:
                    return default

            conf_val = _clean_num(parsed.get("confidence"), 85)
            if conf_val < 60:
                verdict_str = "ESCALATED"

            score_val = _clean_num(
                parsed.get("overlap_score"),
                85 if verdict_str == "PATENT_INVALIDATED" else 20
            )

            return {
                "canary": CANARY_TOKEN,
                "verdict": verdict_str,
                "confidence": conf_val,
                "overlap_score": score_val,
                "reason": str(parsed.get("reason", "Patent examination concluded."))
            }

        def validator_fn(leader_res) -> bool:
            if not isinstance(leader_res, gl.vm.Return):
                return False
            leader = leader_res.calldata
            if isinstance(leader, str):
                try:
                    leader = json.loads(leader)
                except Exception:
                    return False
            if not isinstance(leader, dict) or "verdict" not in leader:
                return False

            mine = leader_fn()
            # Compare verdict only for deterministic consensus
            return mine["verdict"] == leader["verdict"]

        adjudication_res = gl.vm.run_nondet(leader_fn, validator_fn)

        verdict = adjudication_res["verdict"]
        p.verdict = verdict
        p.initial_verdict = verdict
        p.reason = adjudication_res["reason"]
        p.confidence = u8(int(adjudication_res["confidence"]))
        p.overlap_score = u8(int(adjudication_res["overlap_score"]))

        now = _current_timestamp()

        if verdict == "ESCALATED":
            p.status = STATUS_ESCALATED
        else:
            p.status = STATUS_AWAITING_PAYOUT
            p.audit_completed_time = now

    @gl.public.write.payable
    def appeal_verdict(self, patent_id: str, new_evidence_url: str) -> None:
        """Contests the initial examination verdict within the 5-minute cooling-off window with a 10% bond."""
        pid = self._resolve_pid(patent_id)
        if pid not in self.patents:
            raise gl.UserError(f"Patent case {patent_id} does not exist.")

        p = self.patents[pid]
        if p.status != STATUS_AWAITING_PAYOUT:
            raise gl.UserError("Can only appeal cases in AWAITING_PAYOUT status.")

        sender = _get_sender()
        if _addr_str(sender) != _addr_str(p.inventor) and _addr_str(sender) != _addr_str(p.challenger):
            raise gl.UserError("Only inventor or challenger can raise an appeal.")

        now = _current_timestamp()
        if now > (p.audit_completed_time + u256(COOLING_OFF_SECONDS)):
            raise gl.UserError("Appeal challenge window (5 minutes) has expired.")

        required_bond = (p.escrow_deposit * bigint(10)) // bigint(100)
        if required_bond == bigint(0):
            required_bond = bigint(1)

        staked_bond = bigint(gl.message.value)
        if staked_bond < required_bond:
            raise gl.UserError(f"Must stake at least 10% appeal bond ({int(required_bond)} wei).")

        clean_url = str(new_evidence_url).strip()
        if not clean_url.startswith("http://") and not clean_url.startswith("https://"):
            raise gl.UserError("Valid rebuttal/appeal evidence URL (http/https) is required.")

        p.status = STATUS_DISPUTED
        p.dispute_initiator = sender
        p.dispute_bond = staked_bond
        p.appeal_evidence_url = clean_url
        p.verdict = "DISPUTED"
        p.reason = f"Initial verdict ({p.initial_verdict}) appealed by {'Inventor' if _addr_str(sender) == _addr_str(p.inventor) else 'Challenger'}."

        self.total_patent_locked = self.total_patent_locked + staked_bond

    @gl.public.write.payable
    def raise_dispute(self, patent_id: str, dispute_reason: str) -> None:
        """Compatibility wrapper for appeal_verdict."""
        return self.appeal_verdict(patent_id, dispute_reason)

    @gl.public.write
    def adjudicate_appeal(self, patent_id: str) -> None:
        """High Court AI Jury reviews appealed evidence and delivers definitive settlement."""
        pid = self._resolve_pid(patent_id)
        if pid not in self.patents:
            raise gl.UserError(f"Patent case {patent_id} does not exist.")

        p = self.patents[pid]
        if p.status not in (STATUS_DISPUTED, STATUS_ESCALATED):
            raise gl.UserError("Patent case is not in active dispute or escalation.")

        response_url = p.appeal_evidence_url if p.appeal_evidence_url else p.prior_art_url
        title = p.patent_title
        claims = p.novelty_claims
        appellant = p.dispute_initiator
        initial_verdict = p.initial_verdict

        def leader_fn():
            raw_art = ""
            fetch_error = False
            try:
                raw_art = gl.nondet.web.render(response_url, mode="text")
            except Exception:
                fetch_error = True

            if fetch_error or not raw_art or len(raw_art.strip()) == 0:
                return {
                    "canary": CANARY_TOKEN,
                    "verdict": "APPEAL_DISMISSED",
                    "confidence": 100,
                    "reason": "Could not access appeal evidence URL."
                }

            truncated_art = raw_art[:6500] if len(raw_art) > 6500 else raw_art

            prompt = f"""You are the Supreme Magistrate of the AgentPatent High Court on GenLayer.
Evaluate this contested patent appeal evidence under strict judicial scrutiny.

PATENT: {title}
CLAIMS: {claims}
INITIAL VERDICT: {initial_verdict}
APPELLANT: {"Inventor" if _addr_str(appellant) == _addr_str(p.inventor) else "Challenger"}
APPEAL EVIDENCE: {truncated_art}

Output JSON with "canary": "{CANARY_TOKEN}":
- "NEW_VERDICT_INVALIDATED": Evidence clearly proves prior art anticipates invention.
- "NEW_VERDICT_UPHELD": Evidence confirms patent is valid and novel.
- "APPEAL_DISMISSED": Appeal unsubstantiated; initial verdict is upheld.

{{"canary": "{CANARY_TOKEN}", "verdict": "NEW_VERDICT_INVALIDATED"|"NEW_VERDICT_UPHELD"|"APPEAL_DISMISSED", "reason": "<rationale>"}}"""

            raw_res = gl.nondet.exec_prompt(prompt, response_format="json")
            parsed = None
            if isinstance(raw_res, dict):
                parsed = raw_res
            elif isinstance(raw_res, str):
                try:
                    parsed = json.loads(raw_res.strip().replace("```json", "").replace("```", "").strip())
                except Exception:
                    pass

            if not parsed or str(parsed.get("canary", "")) != CANARY_TOKEN:
                return {"canary": CANARY_TOKEN, "verdict": "APPEAL_DISMISSED", "reason": "Failed to parse consensus"}

            v_str = str(parsed.get("verdict", "")).strip().upper()
            if v_str not in ("NEW_VERDICT_INVALIDATED", "NEW_VERDICT_UPHELD", "APPEAL_DISMISSED"):
                v_str = "APPEAL_DISMISSED"

            return {"canary": CANARY_TOKEN, "verdict": v_str, "reason": str(parsed.get("reason", "Appeal decided."))}

        def validator_fn(leader_res) -> bool:
            if not isinstance(leader_res, gl.vm.Return):
                return False
            leader = leader_res.calldata
            if isinstance(leader, str):
                try:
                    leader = json.loads(leader)
                except Exception:
                    return False
            if not isinstance(leader, dict) or "verdict" not in leader:
                return False
            mine = leader_fn()
            return mine["verdict"] == leader["verdict"]

        appeal_res = gl.vm.run_nondet(leader_fn, validator_fn)
        app_verdict = appeal_res["verdict"]

        escrow_val = p.escrow_deposit
        c_bond = p.challenger_bond
        d_bond = p.dispute_bond
        total_settling = escrow_val + c_bond + d_bond

        p.challenger_bond = bigint(0)
        p.dispute_bond = bigint(0)
        self.total_patent_locked = self.total_patent_locked - total_settling
        self.total_disputes_resolved = self.total_disputes_resolved + u32(1)

        appellee = p.inventor if _addr_str(appellant) == _addr_str(p.challenger) else p.challenger

        appellant_won = False
        final_verdict = p.initial_verdict

        if app_verdict == "NEW_VERDICT_INVALIDATED":
            final_verdict = "PATENT_INVALIDATED"
            appellant_won = (_addr_str(appellant) == _addr_str(p.challenger))
        elif app_verdict == "NEW_VERDICT_UPHELD":
            final_verdict = "PATENT_UPHELD_VALID"
            appellant_won = (_addr_str(appellant) == _addr_str(p.inventor))
        else:
            final_verdict = p.initial_verdict
            appellant_won = False

        # Dispute bond routed to the winner
        if appellant_won:
            gl.get_contract_at(appellant).emit_transfer(value=u256(d_bond))
        else:
            gl.get_contract_at(appellee).emit_transfer(value=u256(d_bond))

        p.verdict = final_verdict
        p.reason = f"{'Appeal upheld' if appellant_won else 'Appeal dismissed, initial ruling restored'}. {appeal_res['reason']}"

        # Settle main escrow and challenge bond
        main_pool = escrow_val + c_bond
        if final_verdict == "PATENT_INVALIDATED":
            p.status = STATUS_INVALIDATED_SLASHED
            gl.get_contract_at(p.challenger).emit_transfer(value=u256(main_pool))
        else:
            p.status = STATUS_UPHELD_DEFENDED
            gl.get_contract_at(p.inventor).emit_transfer(value=u256(main_pool))

    @gl.public.write
    def resolve_escalation(self, patent_id: str, resolution: str) -> None:
        """Decentralized Appellate AI Court adjudication (replaces deprecated centralized admin backdoor)."""
        return self.adjudicate_appeal(patent_id)

    @gl.public.write
    def finalize_settlement(self, patent_id: str) -> None:
        pid = self._resolve_pid(patent_id)
        if pid not in self.patents:
            raise gl.UserError(f"Patent case {patent_id} does not exist.")

        p = self.patents[pid]
        if p.status != STATUS_AWAITING_PAYOUT:
            raise gl.UserError("Patent case is not awaiting settlement payout.")

        now = _current_timestamp()
        if now <= (p.audit_completed_time + u256(COOLING_OFF_SECONDS)):
            raise gl.UserError("Cooling-off dispute window (5 minutes) has not elapsed yet.")

        escrow_val = p.escrow_deposit
        bond_val = p.challenger_bond
        total_settling = escrow_val + bond_val
        p.challenger_bond = bigint(0)

        self.total_patent_locked = self.total_patent_locked - total_settling
        self.total_disputes_resolved = self.total_disputes_resolved + u32(1)

        if p.verdict == "PATENT_INVALIDATED":
            p.status = STATUS_INVALIDATED_SLASHED
            gl.get_contract_at(p.challenger).emit_transfer(value=u256(total_settling))
        else:
            p.status = STATUS_UPHELD_DEFENDED
            gl.get_contract_at(p.inventor).emit_transfer(value=u256(total_settling))

    @gl.public.write
    def reclaim_expired_patent(self, patent_id: str) -> None:
        pid = self._resolve_pid(patent_id)
        if pid not in self.patents:
            raise gl.UserError(f"Patent case {patent_id} does not exist.")

        p = self.patents[pid]
        sender = _get_sender()
        if _addr_str(sender) != _addr_str(p.inventor):
            raise gl.UserError("Only the patent inventor can reclaim escrowed funds.")

        now = _current_timestamp()

        if p.status == STATUS_IN_EXAMINATION:
            if now < (p.examination_started_time + u256(STALL_TIMEOUT_SECONDS)):
                raise gl.UserError("Cannot reclaim: Patent is undergoing active prior art examination.")
            dep = p.challenger_bond
            p.challenger_bond = bigint(0)
            if dep > bigint(0):
                self.total_patent_locked = self.total_patent_locked - dep
                gl.get_contract_at(p.challenger).emit_transfer(value=u256(dep))

        elif p.status == STATUS_ESCALATED:
            # Safe recovery for stalled/unparseable AI consensus
            dep = p.challenger_bond
            p.challenger_bond = bigint(0)
            if dep > bigint(0):
                self.total_patent_locked = self.total_patent_locked - dep
                gl.get_contract_at(p.challenger).emit_transfer(value=u256(dep))

        elif p.status == STATUS_ACTIVE_PROTECTED:
            if now < p.expires_at_time:
                raise gl.UserError("Cannot reclaim: Patent protection duration has not yet expired.")
        else:
            raise gl.UserError("Patent case is already settled or under active review.")

        p.status = STATUS_EXPIRED_RECLAIMED
        p.verdict = "EXPIRED_UNCONTESTED"
        p.reason = "Patent protection concluded without confirmed prior art invalidations."

        escrow_val = p.escrow_deposit
        self.total_patent_locked = self.total_patent_locked - escrow_val
        gl.get_contract_at(p.inventor).emit_transfer(value=u256(escrow_val))

    # ── Read-only Views ───────────────────────────────────────────────

    @gl.public.view
    def get_patent(self, patent_id: str) -> str:
        pid = self._resolve_pid(patent_id)
        if pid not in self.patents:
            raise gl.UserError(f"Patent case {patent_id} does not exist.")

        p = self.patents[pid]
        data = {
            "patent_id": p.patent_id,
            "inventor": _addr_str(p.inventor),
            "challenger": _addr_str(p.challenger),
            "dispute_initiator": _addr_str(p.dispute_initiator),
            "escrow_deposit": str(p.escrow_deposit),
            "challenger_bond": str(p.challenger_bond),
            "dispute_bond": str(p.dispute_bond),
            "patent_title": p.patent_title,
            "novelty_claims": p.novelty_claims,
            "prior_art_url": p.prior_art_url,
            "appeal_evidence_url": p.appeal_evidence_url,
            "status": int(p.status),
            "verdict": p.verdict,
            "initial_verdict": p.initial_verdict,
            "reason": p.reason,
            "confidence": int(p.confidence),
            "overlap_score": int(p.overlap_score),
            "created_at_time": str(p.created_at_time),
            "expires_at_time": str(p.expires_at_time),
            "examination_started_time": str(p.examination_started_time),
            "audit_completed_time": str(p.audit_completed_time),
            "created_at_block": str(p.created_at_time),
            "expires_at_block": str(p.expires_at_time),
        }
        return json.dumps(data)

    @gl.public.view
    def get_patent_count(self) -> int:
        return len(self.patent_ids)

    @gl.public.view
    def get_patent_id_by_index(self, idx: int) -> str:
        if idx < 0 or idx >= len(self.patent_ids):
            raise gl.UserError("Index out of bounds.")
        return self.patent_ids[idx]

    @gl.public.view
    def get_patents_paginated(self, offset: int, limit: int) -> str:
        total = len(self.patent_ids)
        if offset < 0 or offset >= total or limit <= 0:
            return json.dumps([])

        end = min(offset + limit, total)
        patents_list = []
        for i in range(offset, end):
            pid = self.patent_ids[i]
            if pid in self.patents:
                p = self.patents[pid]
                patents_list.append({
                    "patent_id": p.patent_id,
                    "inventor": _addr_str(p.inventor),
                    "challenger": _addr_str(p.challenger),
                    "dispute_initiator": _addr_str(p.dispute_initiator),
                    "escrow_deposit": str(p.escrow_deposit),
                    "challenger_bond": str(p.challenger_bond),
                    "dispute_bond": str(p.dispute_bond),
                    "patent_title": p.patent_title,
                    "novelty_claims": p.novelty_claims,
                    "prior_art_url": p.prior_art_url,
                    "appeal_evidence_url": p.appeal_evidence_url,
                    "status": int(p.status),
                    "verdict": p.verdict,
                    "initial_verdict": p.initial_verdict,
                    "reason": p.reason,
                    "confidence": int(p.confidence),
                    "overlap_score": int(p.overlap_score),
                    "created_at_time": str(p.created_at_time),
                    "expires_at_time": str(p.expires_at_time),
                    "examination_started_time": str(p.examination_started_time),
                    "audit_completed_time": str(p.audit_completed_time),
                    "created_at_block": str(p.created_at_time),
                    "expires_at_block": str(p.expires_at_time),
                })
        return json.dumps(patents_list)

    @gl.public.view
    def get_all_patents(self) -> str:
        patents_list = []
        for pid in self.patent_ids:
            if pid in self.patents:
                p = self.patents[pid]
                patents_list.append({
                    "patent_id": p.patent_id,
                    "inventor": _addr_str(p.inventor),
                    "challenger": _addr_str(p.challenger),
                    "dispute_initiator": _addr_str(p.dispute_initiator),
                    "escrow_deposit": str(p.escrow_deposit),
                    "challenger_bond": str(p.challenger_bond),
                    "dispute_bond": str(p.dispute_bond),
                    "patent_title": p.patent_title,
                    "novelty_claims": p.novelty_claims,
                    "prior_art_url": p.prior_art_url,
                    "appeal_evidence_url": p.appeal_evidence_url,
                    "status": int(p.status),
                    "verdict": p.verdict,
                    "initial_verdict": p.initial_verdict,
                    "reason": p.reason,
                    "confidence": int(p.confidence),
                    "overlap_score": int(p.overlap_score),
                    "created_at_time": str(p.created_at_time),
                    "expires_at_time": str(p.expires_at_time),
                    "examination_started_time": str(p.examination_started_time),
                    "audit_completed_time": str(p.audit_completed_time),
                    "created_at_block": str(p.created_at_time),
                    "expires_at_block": str(p.expires_at_time),
                })
        return json.dumps(patents_list)

    @gl.public.view
    def get_stats(self) -> str:
        active_exams = 0
        for pid in self.patent_ids:
            if pid in self.patents:
                st = int(self.patents[pid].status)
                if st in (1, 2, 6, 7):
                    active_exams += 1

        data = {
            "total_patents": len(self.patent_ids),
            "total_patent_locked": str(self.total_patent_locked),
            "total_disputes_resolved": int(self.total_disputes_resolved),
            "active_examinations": active_exams,
        }
        return json.dumps(data)

    @gl.public.view
    def get_patent_count(self) -> int:
        return len(self.patent_ids)

    @gl.public.view
    def get_patent_id_by_index(self, idx: int) -> str:
        if idx < 0 or idx >= len(self.patent_ids):
            raise gl.UserError("Index out of bounds.")
        return self.patent_ids[idx]
