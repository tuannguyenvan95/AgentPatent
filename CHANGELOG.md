# 📝 Changelog

All notable changes to the **AgentPatent** protocol are documented in this file.
The project adheres strictly to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2026-10-19 — Milestone 1: Autonomous Circuit Breaker & Tripartite Multi-Perspective AI Consensus

### Added
- **Tripartite Multi-Perspective AI Consensus Engine:**
  - Decomposed AI patent collision evaluation into three distinct analytical dimensions: Perspective A (Technical Novelty, 0-100), Perspective B (Adversarial Skeptic Scrutiny, 0-100), and Perspective C (Legal Patentability Synthesis).
  - Stored persistent `technical_score` and `skeptic_score` metrics on-chain within `PatentCase`.
- **Autonomous Protocol Circuit Breaker:**
  - Automated threat detection triggering protocol pause on 3 consecutive canary violations or escalation anomalies (`MAX_CANARY_FAILURES = 3`).
  - Implemented 15-minute (`BREAKER_COOLDOWN_SECONDS = 900`) autonomous self-healing time-decay recovery without requiring centralized admin keys.
- **On-Chain Security Telemetry View:**
  - Added `@gl.public.view def get_security_telemetry()` returning protocol health status, canary failures, circuit breaker telemetry, and locked value.
- **Documentation Suite:**
  - Added comprehensive `ARCHITECTURE.md` with Mermaid sequence diagrams, state machines, and consensus architecture.
  - Added `SECURITY.md` detailing the threat model, prompt injection defenses, canary token protocol, and economic game theory.
- **Test Suite Expansion:**
  - Added unit test cases for tripartite multi-perspective consensus, circuit breaker tripping & autonomous recovery, and security telemetry endpoints (14 passed in total).

### Changed
- Updated `register_patent_claim` and `challenge_prior_art` to enforce autonomous circuit breaker invariants.
- Upgraded `get_patent`, `get_all_patents`, and `get_patents_paginated` to expose granular tripartite novelty and skeptic scores.

---

## [1.1.0] - 2026-09-29 — Public Appeal Flow & Complete Decentralization

### Added
- Integrated public evidence URL validation (`http://` and `https://`) in the appeal submission modal (`DisputeModal.tsx`).
- Automatic on-chain 10% appeal escrow bond calculation and payable transfer.
- Exposed public `adjudicate_appeal` execution button across ActionChamber and ForensicBench.

### Removed
- Deleted `AdminArbitrationModal.tsx` and purged all unbacked admin escalation controls. The protocol is verified 100% decentralized.

---

## [1.0.0] - 2026-09-28 — Initial Genesis Release

### Added
- Core `AgentPatent` Intelligent Contract on GenLayer Studionet (`0xD91f5095151ab72DfF3d76905ffA49238cCa340f`).
- Web scraping (`gl.nondet.web.render`) and semantic equivalence consensus (`gl.vm.run_nondet`).
- 5-minute cooling-off dispute window (`STATUS_AWAITING_PAYOUT`).
- Native GEN escrow management with automated settlement.
- Full React/Vite/Tailwind frontend dApp deployed on Vercel.
