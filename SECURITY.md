# 🛡️ AgentPatent — Security & Threat Model Specification

> **Autonomous Escrow Safety, Canary Integrity & Circuit Breaker Invariants**  
> *Target Runtime:* GenVM / GenLayer Studionet

---

## 1. Threat Modeling Overview

AgentPatent manages significant native GEN value escrowed by autonomous AI researchers and patent challengers. As an Intelligent Contract running non-deterministic AI inference on web data, it faces distinct attack surfaces:

| Threat Category | Potential Impact | Mitigating Defense Mechanism |
| :--- | :--- | :--- |
| **Prompt Injection / Jailbreak** | Manipulating LLM into falsifying verdict | `_sanitize_input()` filtering + Secret `CANARY_AGENT_PATENT_V2` |
| **Coordinated Validator Drift** | Inconsistent or malicious leader output | Semantic consensus: `validator_fn` enforces `mine['verdict'] == leader['verdict']` |
| **Rapid Adversarial Probing** | Repeated canary bypass attempts to drain escrow | **Autonomous Circuit Breaker**: Trips on 3 consecutive violations, auto-cools in 900s |
| **Flash Exploit / Instant Drain** | Atomic liquidation before evidence review | **5-Minute Cooling-Off Window**: Payout locked in `STATUS_AWAITING_PAYOUT` |
| **Griefing / Denial of Service** | Flooding patent pool with bogus challenges | Mandatory **≥ 10% Escrow Bond** on challenges and appeals |
| **Inventor Self-Litigation** | Attempting to claim challenger reward | Strict check: `_addr_str(sender) != _addr_str(inventor)` |
| **Re-entrancy Attacks** | Recursive payout calls draining contract | State updated before `gl.get_contract_at(recipient).emit_transfer()` |

---

## 2. In-Depth Defensive Layers

### 2.1 Cryptographic Canary Token Defense
To prevent prompt injections from stripping required structure or forging fake consensus outputs, the contract injects a constant canary token:
```python
CANARY_TOKEN = "CANARY_AGENT_PATENT_V2"
```
The leader and all validator LLMs must output this exact token. If an adversarial injection alters the system prompt or causes the LLM to emit invalid JSON or omit the canary, the case is immediately deflected to `STATUS_ESCALATED` and funds remain locked.

### 2.2 Autonomous Circuit Breaker (Zero-Admin Protocol Self-Healing)
Traditional Web3 protocols rely on centralized multisigs or paused admin keys to respond to zero-day exploits. AgentPatent follows the **Autonomous Protocols** standard:
- When 3 consecutive canary failures or escalation anomalies occur (`MAX_CANARY_FAILURES = 3`), the contract autonomously activates `circuit_breaker_active = True`.
- During active halt, `register_patent_claim` and `challenge_prior_art` are suspended.
- The contract automatically resets to normal operation after `BREAKER_COOLDOWN_SECONDS` (900 seconds / 15 minutes) has elapsed without requiring any human key or admin signature.

### 2.3 Economic Anti-Griefing Mechanism
- **Inventor Escrow:** Inventor stakes real GEN backing the validity of their novelty claim.
- **Challenger Bond:** Challenger must stake at least 10% of the patent escrow value in native GEN. If the challenge fails (patent upheld), the challenger's bond is forfeited and awarded to the inventor.
- **Appeal Bond:** Any appellant must stake an additional 10% payable bond to challenge an initial verdict. If the appeal is dismissed, this bond is awarded to the appellee.

### 2.4 Semantic Equivalence Principle
The contract avoids brittle JSON hash checks:
```python
def validator_fn(leader_res) -> bool:
    if not isinstance(leader_res, gl.vm.Return):
        return False
    leader = leader_res.calldata
    ...
    mine = leader_fn()
    return mine["verdict"] == leader["verdict"]
```
This guarantees validators reach consensus on the **meaningful outcome** (`PATENT_INVALIDATED` vs `PATENT_UPHELD_VALID`) while tolerating natural phrasing variations in technical justifications.

---

## 3. Security Telemetry Verification

Anyone on the network can query the real-time security state on-chain via:
```python
get_security_telemetry()
```
Returns:
```json
{
  "circuit_breaker_active": false,
  "canary_failures": 0,
  "last_halt_timestamp": "0",
  "total_patent_locked": "3500000000000000000",
  "total_disputes_resolved": 1,
  "protocol_health": "NOMINAL",
  "autonomous_mode": "ZERO_ADMIN_DECENTRALIZED",
  "canary_watchdog": "CANARY_AGENT_PATENT_V2"
}
```
