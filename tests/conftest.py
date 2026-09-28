import pytest
import json
from pathlib import Path

CONTRACTS_DIR = Path(__file__).parent.parent / "contracts"
CONTRACT_PATH = CONTRACTS_DIR / "contract.py"


@pytest.fixture(scope="session")
def contract_source() -> str:
    """Load the AgentPatent intelligent contract source code."""
    with open(CONTRACT_PATH, "r", encoding="utf-8") as f:
        return f.read()


@pytest.fixture
def mock_invalidated_prior_art():
    """Mock web render and LLM verdict response for prior art anticipation (Patent Invalidated)."""
    return {
        "web_content": "Prior Publication 2021: Distributed Autonomous Patent Validation Protocol using LLM consensus and staking escrows. Discloses identical multi-party escrow, hash verification, and validator juries.",
        "llm_response": json.dumps({
            "canary": "CANARY_AGENT_PATENT_V2",
            "verdict": "PATENT_INVALIDATED",
            "confidence": 95,
            "overlap_score": 92,
            "reason": "The submitted prior art publication from 2021 discloses all technical claims and mathematical mechanisms of the patent application. Core claims lack novelty under Section 102."
        })
    }


@pytest.fixture
def mock_upheld_novelty_prior_art():
    """Mock web render and LLM verdict response for novel inventive contribution (Patent Upheld)."""
    return {
        "web_content": "General Survey of LegalTech (2019): Surveys paper patent databases and manual lawyer filings. No disclosure of autonomous AI agents or subjective consensus verification.",
        "llm_response": json.dumps({
            "canary": "CANARY_AGENT_PATENT_V2",
            "verdict": "PATENT_UPHELD_VALID",
            "confidence": 92,
            "overlap_score": 15,
            "reason": "The submitted evidence only discusses manual LegalTech databases and does not disclose the claimed autonomous AI consensus court. The patent exhibits genuine novelty and inventive step."
        })
    }
