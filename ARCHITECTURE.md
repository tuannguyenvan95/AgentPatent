# 🏛️ AgentPatent — Architecture Specification

> **Autonomous AI Research Prior Art & Patent Collision Court**  
> *Target Network:* GenLayer Studionet (Chain ID: `61999` / `0xF22F`)  
> *Consensus Protocol:* Decentralized Subjective Consensus via Optimistic Democracy

---

## 1. System Overview

AgentPatent is an on-chain autonomous judicial protocol designed for the **Agentic Economy** and decentralized science (**DeSci**). As autonomous AI researchers, self-driving laboratories, and algorithm engineers rapidly synthesize novel formulations, existing patent offices (USPTO, EPO) create multi-year bottlenecks.

AgentPatent establishes an autonomous, decentralized prior art collision court powered by GenLayer's multi-validator subjective consensus. It executes programmatic escrow bonds, crawls public prior art evidence on the live web without off-chain oracles, applies multi-perspective AI scrutiny, and provides a timelocked appellate court with autonomous circuit breaker protections.

---

## 2. Tripartite Multi-Perspective AI Deliberation

Unlike traditional contracts that execute naive string comparison or single-prompt LLM evaluation, AgentPatent v2.0 implements a **Tripartite Multi-Perspective Forensic Examination**:

```mermaid
flowchart TD
    subgraph Evidence Intake
        A[Prior Art URL Submitted] -->|gl.nondet.web.render| B[Sanitized Technical Document]
        C[Patent Novelty Claims] --> D[Forensic Examination Board]
        B --> D
    end

    subgraph Tripartite AI Analysis
        D --> E[Perspective A: Technical Novelty]
        D --> F[Perspective B: Adversarial Skeptic]
        D --> G[Perspective C: Legal Patentability Synthesis]
        
        E -->|0 - 100| H[Technical Novelty Score]
        F -->|0 - 100| I[Skeptic Overlap Score]
        G -->|Synthesis| J{Threshold Met?}
    end

    subgraph Consensus & Verification
        J -->|Overlap >= 70 OR Tech < 30| K[PATENT_INVALIDATED]
        J -->|Overlap < 70 AND Tech >= 30| L[PATENT_UPHELD_VALID]
        K --> M[Semantic Consensus validator_fn]
        L --> M
        M -->|Consensus Formed| N[STATUS_AWAITING_PAYOUT]
        M -->|Canary Mismatch / Low Conf| O[STATUS_ESCALATED]
    end
```

---

## 3. Protocol State Machine

The contract transitions autonomously through 8 discrete states without central administrator intervention:

```mermaid
stateDiagram-v2
    [*] --> STATUS_ACTIVE_PROTECTED: register_patent_claim()
    
    STATUS_ACTIVE_PROTECTED --> STATUS_IN_EXAMINATION: challenge_prior_art() [Stake >= 10%]
    STATUS_ACTIVE_PROTECTED --> STATUS_EXPIRED_RECLAIMED: reclaim_expired_patent() [Uncontested]
    
    STATUS_IN_EXAMINATION --> STATUS_AWAITING_PAYOUT: adjudicate_collision() [Consensus Reached]
    STATUS_IN_EXAMINATION --> STATUS_ESCALATED: adjudicate_collision() [Anomaly / Canary Failure]
    
    STATUS_AWAITING_PAYOUT --> STATUS_DISPUTED: appeal_verdict() [Within 5m Cooling-off + 10% Bond]
    STATUS_AWAITING_PAYOUT --> STATUS_INVALIDATED_SLASHED: finalize_settlement() [After 5m Cooling-off]
    STATUS_AWAITING_PAYOUT --> STATUS_UPHELD_DEFENDED: finalize_settlement() [After 5m Cooling-off]
    
    STATUS_DISPUTED --> STATUS_INVALIDATED_SLASHED: adjudicate_appeal() [Supreme AI Appellate Jury]
    STATUS_DISPUTED --> STATUS_UPHELD_DEFENDED: adjudicate_appeal() [Supreme AI Appellate Jury]
    
    STATUS_ESCALATED --> STATUS_EXPIRED_RECLAIMED: reclaim_expired_patent() [After 1h Timeout]
    STATUS_ESCALATED --> STATUS_DISPUTED: adjudicate_appeal() [Supreme AI Deliberation]
```

---

## 4. Autonomous Circuit Breaker Architecture

In accordance with GenLayer's **Autonomous Protocols** guidelines (systems that run and defend themselves without multisig governance):

```mermaid
sequenceDiagram
    autonumber
    actor Adversary as Adversarial Attacker
    participant Contract as AgentPatent Contract
    participant AI as GenLayer AI Validators
    participant Vault as Escrow Vault

    Adversary->>Contract: Submit Jailbreak / Adversarial Payload
    Contract->>Contract: _sanitize_input()
    Contract->>AI: adjudicate_collision()
    AI-->>Contract: Output missing CANARY_AGENT_PATENT_V2
    Contract->>Contract: Increment canary_failure_count (+1)
    
    Note over Contract: 3 Consecutive Violations Detected
    Contract->>Contract: Autonomous Trip: circuit_breaker_active = True
    Contract->>Contract: Record last_halt_timestamp
    
    Adversary->>Contract: Attempt Escrow Attack / Claim Registration
    Contract-->>Adversary: REVERT: Protocol Circuit Breaker active
    
    Note over Contract,Vault: 15-Minute Cooldown Window (900s)
    Note over Contract: Cooldown expires
    Contract->>Contract: Autonomous Reset: circuit_breaker_active = False
    Contract->>Vault: Normal Escrow Operations Resumed
```

---

## 5. Technical Specifications

| Parameter | Value | Rationale |
| :--- | :--- | :--- |
| **Cooling-Off Window** | 300 seconds (5 min) | Dispute grace period preventing atomic flash-loan extraction |
| **Circuit Breaker Window** | 900 seconds (15 min) | Autonomous self-healing cooldown without centralized key |
| **Canary Failure Threshold** | 3 consecutive failures | Protects escrow against coordinated LLM jailbreak probes |
| **Challenge Bond** | ≥ 10% of validity escrow | Anti-spam and griefing deterrent for challengers |
| **Appeal Bond** | ≥ 10% of validity escrow | Deterrent against frivolous post-verdict appeals |
| **Storage Generic** | `TreeMap[str, PatentCase]` | Sized integer and string key storage compliant with GenVM |
