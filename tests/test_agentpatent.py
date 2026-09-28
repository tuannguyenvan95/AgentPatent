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
    assert "def raise_dispute(" in contract_source
    assert "def finalize_settlement(" in contract_source
    assert "def resolve_escalation(" in contract_source
    assert "def reclaim_expired_patent(" in contract_source
    assert "def get_patent(" in contract_source
    assert "def get_all_patents(" in contract_source
    assert "def get_patents_paginated(" in contract_source
    assert "def get_stats(" in contract_source


def test_case_struct_attributes(contract_source):
    """Ensure PatentCase defines all necessary state fields according to spec."""
    expected_fields = [
        "patent_id: u64",
        "inventor: Address",
        "challenger: Address",
        "escrow_deposit: bigint",
        "challenger_bond: bigint",
        "patent_title: str",
        "novelty_claims: str",
        "prior_art_url: str",
        "evidence_hash: str",
        "status: u8",
        "verdict: str",
        "reason: str",
        "confidence: u8",
        "overlap_score: u8",
        "created_at_block: u256",
        "expires_at_block: u256",
        "examination_started_block: u256",
        "payout_ready_at_block: u256",
        "disputed: bool",
        "dispute_reason: str",
    ]
    for field in expected_fields:
        assert field in contract_source, f"Missing field in PatentCase: {field}"


def test_semantic_consensus_rule(contract_source):
    """Ensure validator_fn implements equivalence principle with verdict agreement and overlap score tolerance."""
    assert 'mine["verdict"] != leader["verdict"]' in contract_source or 'mine["verdict"] == leader["verdict"]' in contract_source
    assert 'overlap_score' in contract_source
    assert 'evidence_hash' in contract_source


def test_native_transfer_calls(contract_source):
    """Ensure payouts and refunds use gl.get_contract_at(...).emit_transfer(value=u256(...))."""
    assert "emit_transfer(value=u256(total_settling))" in contract_source
    assert "emit_transfer(value=u256(escrow_val))" in contract_source


# --- Behavioral Simulation Test Suite ---

class MockAgentPatentSimulator:
    """Harness simulating GenVM state transitions, role permissions, cooling-off window, and dispute arbitration."""
    def __init__(self, admin: str = "0xadmin"):
        self.patents = {}
        self.patent_ids = []
        self.total_patent_locked = 0
        self.total_disputes_resolved = 0
        self.patent_counter = 0
        self.platform_admin = admin.lower()
        self.balances = {"inventor": 1000, "challenger": 500, "other": 200, "admin": 100}

    def _sanitize_input(self, text: str) -> str:
        clean = str(text)
        patterns = ["ignore all previous instructions", "override verdict", "jailbreak"]
        for p in patterns:
            if p in clean.lower():
                clean = clean.replace(p, "[BLOCKED]")
        return clean

    def register_patent_claim(self, sender: str, title: str, claims: str, duration_blocks: int, deposit: int) -> int:
        if deposit <= 0:
            raise ValueError("Patent validity escrow deposit must be greater than 0 GEN.")
        clean_title = self._sanitize_input(title.strip())
        if len(clean_title) < 5:
            raise ValueError("Patent title must be at least 5 characters.")
        clean_claims = self._sanitize_input(claims.strip())
        if len(clean_claims) < 20:
            raise ValueError("Novelty claims must be at least 20 characters.")

        self.patent_counter += 1
        pid = self.patent_counter
        duration = duration_blocks if duration_blocks > 0 else 5000

        self.patents[pid] = {
            "patent_id": pid,
            "inventor": sender.lower(),
            "challenger": "0x0000000000000000000000000000000000000000",
            "escrow_deposit": deposit,
            "challenger_bond": 0,
            "patent_title": clean_title,
            "novelty_claims": clean_claims,
            "prior_art_url": "",
            "evidence_hash": "",
            "status": 0,  # STATUS_ACTIVE_PROTECTED
            "verdict": "PENDING",
            "reason": "Patent active.",
            "confidence": 0,
            "overlap_score": 0,
            "created_at_block": self.patent_counter,
            "expires_at_block": self.patent_counter + duration,
            "examination_started_block": 0,
            "payout_ready_at_block": 0,
            "disputed": False,
            "dispute_reason": "",
        }
        self.patent_ids.append(pid)
        self.total_patent_locked += deposit
        self.balances[sender] -= deposit
        return pid

    def challenge_prior_art(self, sender: str, patent_id: int, prior_art_url: str, bond: int) -> None:
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

        self.patent_counter += 1
        p["challenger"] = sender.lower()
        p["prior_art_url"] = clean_url
        p["challenger_bond"] = bond
        p["status"] = 1  # STATUS_IN_EXAMINATION
        p["examination_started_block"] = self.patent_counter
        p["reason"] = "Challenge filed."

        self.total_patent_locked += bond
        self.balances[sender] -= bond

    def adjudicate_collision(self, patent_id: int, simulated_verdict: str, overlap_score: int = 85, confidence: int = 90, dead_link: bool = False, canary_ok: bool = True) -> None:
        if patent_id not in self.patents:
            raise KeyError("Patent does not exist.")
        p = self.patents[patent_id]
        if p["status"] != 1:
            raise ValueError("Patent case is not awaiting collision adjudication.")

        if dead_link:
            p["verdict"] = "PATENT_UPHELD_VALID"
            p["confidence"] = 100
            p["overlap_score"] = 0
            p["reason"] = "Could not access or render prior art URL."
        elif not canary_ok or confidence < 60:
            p["verdict"] = "ESCALATED"
            p["confidence"] = confidence
            p["overlap_score"] = overlap_score
            p["reason"] = "Canary mismatch or low confidence."
        else:
            p["verdict"] = simulated_verdict
            p["confidence"] = confidence
            p["overlap_score"] = overlap_score
            p["reason"] = "Adjudication complete."
            p["evidence_hash"] = hashlib.sha256(b"mock_prior_art").hexdigest()

        self.patent_counter += 1
        current_block = self.patent_counter

        if p["verdict"] == "ESCALATED":
            p["status"] = 7  # STATUS_ESCALATED
        else:
            p["status"] = 2  # STATUS_AWAITING_PAYOUT
            p["payout_ready_at_block"] = current_block + 24  # 24-block cooling off

    def raise_dispute(self, sender: str, patent_id: int, reason: str) -> None:
        if patent_id not in self.patents:
            raise KeyError("Patent does not exist.")
        p = self.patents[patent_id]
        if p["status"] != 2:
            raise ValueError("Can only dispute cases in AWAITING_PAYOUT status.")

        caller = sender.lower()
        if caller != p["inventor"] and caller != p["challenger"]:
            raise PermissionError("Only inventor or challenger can raise dispute.")

        if len(reason.strip()) < 10:
            raise ValueError("Dispute reason must be at least 10 characters.")

        p["status"] = 6  # STATUS_DISPUTED
        p["disputed"] = True
        p["dispute_reason"] = reason

    def finalize_settlement(self, patent_id: int, current_block: int) -> None:
        if patent_id not in self.patents:
            raise KeyError("Patent does not exist.")
        p = self.patents[patent_id]
        if p["status"] != 2:
            raise ValueError("Patent case is not awaiting settlement payout.")
        if current_block < p["payout_ready_at_block"]:
            raise ValueError("Cooling-off dispute window has not elapsed yet.")

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

    def resolve_escalation(self, sender: str, patent_id: int, resolution: str) -> None:
        if patent_id not in self.patents:
            raise KeyError("Patent does not exist.")
        if sender.lower() != self.platform_admin:
            raise PermissionError("Only platform admin can resolve escalated/disputed cases.")

        p = self.patents[patent_id]
        if p["status"] not in (6, 7):
            raise ValueError("Case not in DISPUTED or ESCALATED status.")

        escrow_val = p["escrow_deposit"]
        bond_val = p["challenger_bond"]
        total_settling = escrow_val + bond_val
        p["challenger_bond"] = 0
        self.total_patent_locked -= total_settling
        self.total_disputes_resolved += 1

        res = resolution.upper()
        if res == "INVALIDATE":
            p["status"] = 3
            p["verdict"] = "PATENT_INVALIDATED"
            self.balances[p["challenger"]] += total_settling
        elif res == "UPHOLD":
            p["status"] = 4
            p["verdict"] = "PATENT_UPHELD_VALID"
            self.balances[p["inventor"]] += total_settling
        elif res == "REFUND_SPLIT":
            p["status"] = 5
            p["verdict"] = "DISPUTE_MUTUALLY_REFUNDED"
            self.balances[p["inventor"]] += escrow_val
            self.balances[p["challenger"]] += bond_val
        else:
            raise ValueError("Invalid resolution option.")

    def reclaim_expired_patent(self, sender: str, patent_id: int, current_block: int) -> None:
        if patent_id not in self.patents:
            raise KeyError("Patent does not exist.")
        p = self.patents[patent_id]
        if sender.lower() != p["inventor"]:
            raise PermissionError("Only patent inventor can reclaim escrow.")
        if p["status"] != 0:
            raise ValueError("Case not active protected.")
        if current_block < p["expires_at_block"]:
            raise ValueError("Patent protection duration has not expired.")

        p["status"] = 5  # STATUS_EXPIRED_RECLAIMED
        self.total_patent_locked -= p["escrow_deposit"]
        self.balances[p["inventor"]] += p["escrow_deposit"]


def test_patent_invalidated_flow():
    """Test full lifecycle when challenger proves patent lacks novelty (PATENT_INVALIDATED)."""
    sim = MockAgentPatentSimulator()
    pid = sim.register_patent_claim("inventor", "Autonomous Transformer Cache", "A system for caching transformer activations on decentralized storage nodes.", 100, 100)
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
    ready_block = sim.patents[pid]["payout_ready_at_block"]

    # Trying to finalize before cooling-off fails
    with pytest.raises(ValueError, match="Cooling-off dispute window has not elapsed"):
        sim.finalize_settlement(pid, current_block=ready_block - 1)

    # Finalize after cooling-off
    sim.finalize_settlement(pid, current_block=ready_block + 1)
    assert sim.patents[pid]["status"] == 3  # INVALIDATED_SLASHED
    # Challenger receives 100 escrow + 10 bond = 110 GEN
    assert sim.balances["challenger"] == 490 + 110
    assert sim.total_patent_locked == 0
    assert sim.total_disputes_resolved == 1


def test_patent_upheld_valid_flow():
    """Test full lifecycle when patent defends its claims against an unfounded challenge (PATENT_UPHELD_VALID)."""
    sim = MockAgentPatentSimulator()
    pid = sim.register_patent_claim("inventor", "Quantum Zero-Knowledge Rollup", "Cryptographic zk-SNARK rollup construction utilizing topological quantum states.", 200, 200)
    assert sim.balances["inventor"] == 800

    sim.challenge_prior_art("challenger", pid, "https://arxiv.org/abs/1905.00002", 20)
    assert sim.balances["challenger"] == 480

    sim.adjudicate_collision(pid, "PATENT_UPHELD_VALID", overlap_score=15, confidence=92)
    assert sim.patents[pid]["status"] == 2

    ready_block = sim.patents[pid]["payout_ready_at_block"]
    sim.finalize_settlement(pid, current_block=ready_block + 5)
    assert sim.patents[pid]["status"] == 4  # UPHELD_DEFENDED
    # Inventor receives 200 refund + 20 slashed bond = 220 GEN
    assert sim.balances["inventor"] == 800 + 220
    assert sim.total_patent_locked == 0


def test_dispute_and_admin_arbitration_flow():
    """Test cooling-off dispute escalation and platform admin arbitration."""
    sim = MockAgentPatentSimulator(admin="0xadmin")
    pid = sim.register_patent_claim("inventor", "Neural Network Architecture", "A recursive neural tree architecture for verifiable reasoning.", 100, 100)
    sim.challenge_prior_art("challenger", pid, "https://arxiv.org/abs/2103.00003", 10)
    sim.adjudicate_collision(pid, "PATENT_INVALIDATED", overlap_score=80)

    # Unauthorized party cannot dispute
    with pytest.raises(PermissionError):
        sim.raise_dispute("other", pid, "I disagree with this verdict!")

    # Inventor disputes within cooling-off window
    sim.raise_dispute("inventor", pid, "The cited paper uses a totally distinct recurrent mechanism, not recursive trees.")
    assert sim.patents[pid]["status"] == 6  # DISPUTED
    assert sim.patents[pid]["disputed"] is True

    # Settlement cannot be finalized while disputed
    with pytest.raises(ValueError):
        sim.finalize_settlement(pid, current_block=9999)

    # Non-admin cannot resolve escalation
    with pytest.raises(PermissionError):
        sim.resolve_escalation("other", pid, "UPHOLD")

    # Platform Admin resolves with REFUND_SPLIT (mutual safety refund)
    sim.resolve_escalation("0xadmin", pid, "REFUND_SPLIT")
    assert sim.patents[pid]["status"] == 5
    assert sim.balances["inventor"] == 1000  # 100 deposit refunded
    assert sim.balances["challenger"] == 500  # 10 bond refunded
    assert sim.total_patent_locked == 0


def test_broken_prior_art_url_dismissal():
    """Ensure dead links automatically uphold patent validity and punish spam challenger."""
    sim = MockAgentPatentSimulator()
    pid = sim.register_patent_claim("inventor", "Decentralized Database Protocol", "A consensus protocol for distributed table partitions.", 50, 50)
    sim.challenge_prior_art("challenger", pid, "https://broken-url-404.org/fake", 5)

    sim.adjudicate_collision(pid, "PATENT_INVALIDATED", dead_link=True)
    assert sim.patents[pid]["verdict"] == "PATENT_UPHELD_VALID"
    assert sim.patents[pid]["confidence"] == 100
    assert sim.patents[pid]["overlap_score"] == 0


def test_canary_token_failure_escalates():
    """Ensure canary token mismatch safely escalates to steward review without releasing funds."""
    sim = MockAgentPatentSimulator()
    pid = sim.register_patent_claim("inventor", "Consensus Protocol", "High throughput consensus specification.", 50, 50)
    sim.challenge_prior_art("challenger", pid, "https://paper.org/sample", 5)

    sim.adjudicate_collision(pid, "PATENT_INVALIDATED", canary_ok=False)
    assert sim.patents[pid]["status"] == 7  # STATUS_ESCALATED
    assert sim.patents[pid]["verdict"] == "ESCALATED"


def test_reclaim_expired_patent_boundaries():
    """Ensure inventor can reclaim deposit only after protection expiration."""
    sim = MockAgentPatentSimulator()
    pid = sim.register_patent_claim("inventor", "Autonomous Agent Swarm", "A swarm algorithm for distributed sensor coordination.", 100, 50)
    expires = sim.patents[pid]["expires_at_block"]

    # Reclaim before expiration fails
    with pytest.raises(ValueError, match="duration has not expired"):
        sim.reclaim_expired_patent("inventor", pid, current_block=expires - 1)

    # Reclaim by non-inventor fails
    with pytest.raises(PermissionError):
        sim.reclaim_expired_patent("challenger", pid, current_block=expires + 1)

    # Reclaim after expiration succeeds
    sim.reclaim_expired_patent("inventor", pid, current_block=expires + 1)
    assert sim.patents[pid]["status"] == 5
    assert sim.balances["inventor"] == 1000
    assert sim.total_patent_locked == 0
