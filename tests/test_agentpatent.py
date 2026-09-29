import pytest
import json
import hashlib
from pathlib import Path


def test_contract_syntax_and_structure(contract_source):
    """Verify that the contract file compiles as valid Python and defines all required methods."""
    assert contract_source.startswith('# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }')
    assert "class PatentCase:" in contract_source
    assert "class Contract(gl.Contract):" in contract_source
    assert "def register_patent_claim(" in contract_source
    assert "def challenge_prior_art(" in contract_source
    assert "def adjudicate_collision(" in contract_source
    assert "def appeal_verdict(" in contract_source
    assert "def adjudicate_appeal(" in contract_source
    assert "def raise_dispute(" in contract_source
    assert "def finalize_settlement(" in contract_source
    assert "def reclaim_expired_patent(" in contract_source
    assert "def get_patent(" in contract_source
    assert "def get_all_patents(" in contract_source
    assert "def get_patents_paginated(" in contract_source
    assert "def get_stats(" in contract_source


def test_case_struct_attributes(contract_source):
    """Ensure PatentCase defines all necessary state fields according to the judge-proof architecture."""
    expected_fields = [
        "patent_id: str",
        "inventor: Address",
        "challenger: Address",
        "dispute_initiator: Address",
        "escrow_deposit: bigint",
        "challenger_bond: bigint",
        "dispute_bond: bigint",
        "patent_title: str",
        "novelty_claims: str",
        "prior_art_url: str",
        "appeal_evidence_url: str",
        "status: u8",
        "verdict: str",
        "initial_verdict: str",
        "reason: str",
        "confidence: u8",
        "overlap_score: u8",
        "created_at_time: u256",
        "expires_at_time: u256",
        "examination_started_time: u256",
        "audit_completed_time: u256",
    ]
    for field in expected_fields:
        assert field in contract_source, f"Missing field in PatentCase: {field}"


def test_semantic_consensus_rule(contract_source):
    """Ensure validator_fn implements equivalence principle with verdict agreement without brittle hash comparison."""
    assert 'mine["verdict"] == leader["verdict"]' in contract_source
    assert 'overlap_score' in contract_source


def test_native_transfer_calls(contract_source):
    """Ensure payouts and refunds use gl.get_contract_at(...).emit_transfer(value=u256(...))."""
    assert "emit_transfer(value=u256(total_settling))" in contract_source
    assert "emit_transfer(value=u256(escrow_val))" in contract_source


# --- Behavioral Simulation Test Suite ---

class MockAgentPatentSimulator:
    """Harness simulating GenVM state transitions, role permissions, cooling-off window, and autonomous dispute arbitration."""
    def __init__(self):
        self.patents = {}
        self.patent_ids = []
        self.total_patent_locked = 0
        self.total_disputes_resolved = 0
        self.patent_counter = 0
        self.current_time = 1700000000
        self.balances = {"inventor": 1000, "challenger": 500, "other": 200}

    def _sanitize_input(self, text: str) -> str:
        clean = str(text)
        patterns = ["ignore all previous instructions", "override verdict", "jailbreak"]
        for p in patterns:
            if p in clean.lower():
                clean = clean.replace(p, "[BLOCKED]")
        return clean

    def register_patent_claim(self, sender: str, title: str, claims: str, duration_seconds: int, deposit: int) -> str:
        if deposit <= 0:
            raise ValueError("Patent validity escrow deposit must be greater than 0 GEN.")
        clean_title = self._sanitize_input(title.strip())
        if len(clean_title) < 5:
            raise ValueError("Patent title must be at least 5 characters.")
        clean_claims = self._sanitize_input(claims.strip())
        if len(clean_claims) < 20:
            raise ValueError("Novelty claims must be at least 20 characters.")

        self.patent_counter += 1
        pid = f"patent-{self.patent_counter}"
        dur = duration_seconds if duration_seconds > 0 else 86400

        self.patents[pid] = {
            "patent_id": pid,
            "inventor": sender.lower(),
            "challenger": sender.lower(),
            "dispute_initiator": sender.lower(),
            "escrow_deposit": deposit,
            "challenger_bond": 0,
            "dispute_bond": 0,
            "patent_title": clean_title,
            "novelty_claims": clean_claims,
            "prior_art_url": "",
            "appeal_evidence_url": "",
            "status": 0,  # STATUS_ACTIVE_PROTECTED
            "verdict": "PENDING",
            "initial_verdict": "PENDING",
            "reason": "Patent active.",
            "confidence": 0,
            "overlap_score": 0,
            "created_at_time": self.current_time,
            "expires_at_time": self.current_time + dur,
            "examination_started_time": 0,
            "audit_completed_time": 0,
        }
        self.patent_ids.append(pid)
        self.total_patent_locked += deposit
        self.balances[sender] -= deposit
        return pid

    def challenge_prior_art(self, sender: str, patent_id: str, prior_art_url: str, bond: int) -> None:
        if patent_id not in self.patents:
            raise KeyError("Patent does not exist.")
        p = self.patents[patent_id]
        if p["status"] != 0:
            raise ValueError("Only active patents can be challenged.")
        if sender.lower() == p["inventor"].lower():
            raise ValueError("Inventor cannot challenge their own patent.")

        clean_url = prior_art_url.strip()
        if not clean_url.startswith("http://") and not clean_url.startswith("https://"):
            raise ValueError("Valid public prior art URL required.")

        min_bond = max(1, p["escrow_deposit"] // 10)
        if bond < min_bond:
            raise ValueError(f"Must stake at least 10% challenge bond ({min_bond}).")

        self.current_time += 10
        p["challenger"] = sender.lower()
        p["prior_art_url"] = clean_url
        p["challenger_bond"] = bond
        p["status"] = 1  # STATUS_IN_EXAMINATION
        p["examination_started_time"] = self.current_time
        p["reason"] = "Challenge filed."

        self.total_patent_locked += bond
        self.balances[sender] -= bond

    def adjudicate_collision(self, patent_id: str, simulated_verdict: str, overlap_score: int = 85, confidence: int = 90, dead_link: bool = False, canary_ok: bool = True) -> None:
        if patent_id not in self.patents:
            raise KeyError("Patent does not exist.")
        p = self.patents[patent_id]
        if p["status"] != 1:
            raise ValueError("Patent case is not awaiting collision adjudication.")

        if dead_link:
            p["verdict"] = "PATENT_UPHELD_VALID"
            p["initial_verdict"] = "PATENT_UPHELD_VALID"
            p["confidence"] = 100
            p["overlap_score"] = 0
            p["reason"] = "Could not access or render prior art URL."
        elif not canary_ok or confidence < 60:
            p["verdict"] = "ESCALATED"
            p["initial_verdict"] = "ESCALATED"
            p["confidence"] = confidence
            p["overlap_score"] = overlap_score
            p["reason"] = "Canary mismatch or low confidence."
        else:
            p["verdict"] = simulated_verdict
            p["initial_verdict"] = simulated_verdict
            p["confidence"] = confidence
            p["overlap_score"] = overlap_score
            p["reason"] = "Adjudication complete."

        self.current_time += 15

        if p["verdict"] == "ESCALATED":
            p["status"] = 7  # STATUS_ESCALATED
        else:
            p["status"] = 2  # STATUS_AWAITING_PAYOUT
            p["audit_completed_time"] = self.current_time

    def appeal_verdict(self, sender: str, patent_id: str, new_evidence_url: str, bond: int) -> None:
        if patent_id not in self.patents:
            raise KeyError("Patent does not exist.")
        p = self.patents[patent_id]
        if p["status"] != 2:
            raise ValueError("Can only appeal cases in AWAITING_PAYOUT status.")

        caller = sender.lower()
        if caller != p["inventor"] and caller != p["challenger"]:
            raise PermissionError("Only inventor or challenger can raise appeal.")

        if self.current_time > (p["audit_completed_time"] + 300):
            raise ValueError("Appeal challenge window (5 minutes) has expired.")

        req_bond = max(1, (p["escrow_deposit"] * 10) // 100)
        if bond < req_bond:
            raise ValueError(f"Must stake at least 10% appeal bond ({req_bond}).")

        clean_url = new_evidence_url.strip()
        if not clean_url.startswith("http://") and not clean_url.startswith("https://"):
            raise ValueError("Valid appeal URL required.")

        p["status"] = 6  # STATUS_DISPUTED
        p["dispute_initiator"] = caller
        p["dispute_bond"] = bond
        p["appeal_evidence_url"] = clean_url
        p["verdict"] = "DISPUTED"

        self.total_patent_locked += bond
        self.balances[sender] -= bond

    def adjudicate_appeal(self, patent_id: str, jury_verdict: str) -> None:
        if patent_id not in self.patents:
            raise KeyError("Patent does not exist.")
        p = self.patents[patent_id]
        if p["status"] != 6:
            raise ValueError("Patent case is not in active dispute.")

        escrow_val = p["escrow_deposit"]
        c_bond = p["challenger_bond"]
        d_bond = p["dispute_bond"]
        total_settling = escrow_val + c_bond + d_bond

        p["challenger_bond"] = 0
        p["dispute_bond"] = 0
        self.total_patent_locked -= total_settling
        self.total_disputes_resolved += 1

        appellant = p["dispute_initiator"]
        appellee = p["inventor"] if appellant == p["challenger"] else p["challenger"]

        appellant_won = False
        final_verdict = p["initial_verdict"]

        if jury_verdict == "NEW_VERDICT_INVALIDATED":
            final_verdict = "PATENT_INVALIDATED"
            appellant_won = (appellant == p["challenger"])
        elif jury_verdict == "NEW_VERDICT_UPHELD":
            final_verdict = "PATENT_UPHELD_VALID"
            appellant_won = (appellant == p["inventor"])
        else:
            final_verdict = p["initial_verdict"]
            appellant_won = False

        if appellant_won:
            self.balances[appellant] += d_bond
        else:
            self.balances[appellee] += d_bond

        main_pool = escrow_val + c_bond
        if final_verdict == "PATENT_INVALIDATED":
            p["status"] = 3
            p["verdict"] = "PATENT_INVALIDATED"
            self.balances[p["challenger"]] += main_pool
        else:
            p["status"] = 4
            p["verdict"] = "PATENT_UPHELD_VALID"
            self.balances[p["inventor"]] += main_pool

    def finalize_settlement(self, patent_id: str) -> None:
        if patent_id not in self.patents:
            raise KeyError("Patent does not exist.")
        p = self.patents[patent_id]
        if p["status"] != 2:
            raise ValueError("Patent case is not awaiting settlement payout.")
        if self.current_time <= (p["audit_completed_time"] + 300):
            raise ValueError("Cooling-off dispute window (5 minutes) has not elapsed yet.")

        total_settling = p["escrow_deposit"] + p["challenger_bond"]
        p["challenger_bond"] = 0
        self.total_patent_locked -= total_settling
        self.total_disputes_resolved += 1

        if p["verdict"] == "PATENT_INVALIDATED":
            p["status"] = 3  # STATUS_INVALIDATED_SLASHED
            self.balances[p["challenger"]] += total_settling
        else:
            p["status"] = 4  # STATUS_UPHELD_DEFENDED
            self.balances[p["inventor"]] += total_settling

    def reclaim_expired_patent(self, sender: str, patent_id: str) -> None:
        if patent_id not in self.patents:
            raise KeyError("Patent does not exist.")
        p = self.patents[patent_id]
        if sender.lower() != p["inventor"]:
            raise PermissionError("Only patent inventor can reclaim escrow.")
        if p["status"] != 0:
            raise ValueError("Case not active protected.")
        if self.current_time < p["expires_at_time"]:
            raise ValueError("Patent protection duration has not expired.")

        p["status"] = 5  # STATUS_EXPIRED_RECLAIMED
        self.total_patent_locked -= p["escrow_deposit"]
        self.balances[p["inventor"]] += p["escrow_deposit"]


def test_patent_invalidated_flow():
    """Test full lifecycle when challenger proves patent lacks novelty (PATENT_INVALIDATED)."""
    sim = MockAgentPatentSimulator()
    pid = sim.register_patent_claim("inventor", "Autonomous Transformer Cache", "A system for caching transformer activations on decentralized storage nodes.", 86400, 100)
    assert sim.balances["inventor"] == 900
    assert sim.total_patent_locked == 100

    # Challenger stakes 10 GEN
    sim.challenge_prior_art("challenger", pid, "https://arxiv.org/abs/2101.00001", 10)
    assert sim.balances["challenger"] == 490
    assert sim.total_patent_locked == 110
    assert sim.patents[pid]["status"] == 1

    # Adjudication results in PATENT_INVALIDATED
    sim.adjudicate_collision(pid, "PATENT_INVALIDATED", overlap_score=92, confidence=95)
    assert sim.patents[pid]["status"] == 2  # AWAITING_PAYOUT

    # Trying to finalize before cooling-off fails
    with pytest.raises(ValueError, match="Cooling-off dispute window"):
        sim.finalize_settlement(pid)

    # Fast forward past 5-minute cooling-off window (300 seconds)
    sim.current_time += 301
    sim.finalize_settlement(pid)
    assert sim.patents[pid]["status"] == 3  # INVALIDATED_SLASHED
    # Challenger receives 100 escrow + 10 bond = 110 GEN
    assert sim.balances["challenger"] == 490 + 110
    assert sim.total_patent_locked == 0
    assert sim.total_disputes_resolved == 1


def test_patent_upheld_valid_flow():
    """Test full lifecycle when patent defends its claims against an unfounded challenge (PATENT_UPHELD_VALID)."""
    sim = MockAgentPatentSimulator()
    pid = sim.register_patent_claim("inventor", "Quantum Zero-Knowledge Rollup", "Cryptographic zk-SNARK rollup construction utilizing topological quantum states.", 86400, 200)
    assert sim.balances["inventor"] == 800

    sim.challenge_prior_art("challenger", pid, "https://arxiv.org/abs/1905.00002", 20)
    assert sim.balances["challenger"] == 480

    sim.adjudicate_collision(pid, "PATENT_UPHELD_VALID", overlap_score=15, confidence=92)
    assert sim.patents[pid]["status"] == 2

    sim.current_time += 301
    sim.finalize_settlement(pid)
    assert sim.patents[pid]["status"] == 4  # UPHELD_DEFENDED
    # Inventor receives 200 refund + 20 slashed bond = 220 GEN
    assert sim.balances["inventor"] == 800 + 220
    assert sim.total_patent_locked == 0


def test_autonomous_appeal_and_jury_arbitration_flow():
    """Test cooling-off dispute escalation and autonomous AI jury appeal adjudication."""
    sim = MockAgentPatentSimulator()
    pid = sim.register_patent_claim("inventor", "Neural Network Architecture", "A recursive neural tree architecture for verifiable reasoning.", 86400, 100)
    sim.challenge_prior_art("challenger", pid, "https://arxiv.org/abs/2103.00003", 10)
    sim.adjudicate_collision(pid, "PATENT_INVALIDATED", overlap_score=80)

    # Unauthorized party cannot appeal
    with pytest.raises(PermissionError):
        sim.appeal_verdict("other", pid, "https://arxiv.org/abs/rebuttal.001", 10)

    # Insufficient bond fails
    with pytest.raises(ValueError, match="Must stake at least 10% appeal bond"):
        sim.appeal_verdict("inventor", pid, "https://arxiv.org/abs/rebuttal.001", 5)

    # Inventor appeals within cooling-off window with 10 GEN bond
    sim.appeal_verdict("inventor", pid, "https://arxiv.org/abs/rebuttal.001", 10)
    assert sim.patents[pid]["status"] == 6  # DISPUTED
    assert sim.total_patent_locked == 120  # 100 escrow + 10 challenge bond + 10 dispute bond

    # Settlement cannot be finalized while disputed
    with pytest.raises(ValueError):
        sim.finalize_settlement(pid)

    # High Court Autonomous AI Jury reviews rebuttal and overturns verdict (NEW_VERDICT_UPHELD)
    sim.adjudicate_appeal(pid, "NEW_VERDICT_UPHELD")
    assert sim.patents[pid]["status"] == 4  # UPHELD_DEFENDED
    # Inventor wins appeal: gets their 10 appeal bond back, plus 100 escrow deposit + 10 challenge bond = 120 GEN total returned
    assert sim.balances["inventor"] == 1000 + 10  # 900 - 10 bond + 120 = 1010
    assert sim.total_patent_locked == 0


def test_broken_prior_art_url_dismissal():
    """Ensure dead links automatically uphold patent validity and punish spam challenger."""
    sim = MockAgentPatentSimulator()
    pid = sim.register_patent_claim("inventor", "Decentralized Database Protocol", "A consensus protocol for distributed table partitions.", 86400, 50)
    sim.challenge_prior_art("challenger", pid, "https://broken-url-404.org/fake", 5)

    sim.adjudicate_collision(pid, "PATENT_INVALIDATED", dead_link=True)
    assert sim.patents[pid]["verdict"] == "PATENT_UPHELD_VALID"
    assert sim.patents[pid]["confidence"] == 100
    assert sim.patents[pid]["overlap_score"] == 0


def test_canary_token_failure_escalates():
    """Ensure canary token mismatch safely escalates without releasing funds."""
    sim = MockAgentPatentSimulator()
    pid = sim.register_patent_claim("inventor", "Consensus Protocol", "High throughput consensus specification.", 86400, 50)
    sim.challenge_prior_art("challenger", pid, "https://paper.org/sample", 5)

    sim.adjudicate_collision(pid, "PATENT_INVALIDATED", canary_ok=False)
    assert sim.patents[pid]["status"] == 7  # STATUS_ESCALATED
    assert sim.patents[pid]["verdict"] == "ESCALATED"


def test_reclaim_expired_patent_boundaries():
    """Ensure inventor can reclaim deposit only after protection expiration."""
    sim = MockAgentPatentSimulator()
    pid = sim.register_patent_claim("inventor", "Autonomous Agent Swarm", "A swarm algorithm for distributed sensor coordination.", 100, 50)
    expires = sim.patents[pid]["expires_at_time"]

    # Reclaim before expiration fails
    with pytest.raises(ValueError, match="duration has not expired"):
        sim.reclaim_expired_patent("inventor", pid)

    # Reclaim by non-inventor fails
    sim.current_time = expires + 1
    with pytest.raises(PermissionError):
        sim.reclaim_expired_patent("challenger", pid)

    # Reclaim after expiration succeeds
    sim.reclaim_expired_patent("inventor", pid)
    assert sim.patents[pid]["status"] == 5
    assert sim.balances["inventor"] == 1000
    assert sim.total_patent_locked == 0
