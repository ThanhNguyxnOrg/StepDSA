# ADR 0001: Personal Code Studio, `.stepdsa` File Standard, and Universal Multi-Stage Adapter

- **Status:** Accepted
- **Date:** 2026-09-30
- **Deciders:** Antigravity & User

---

## 1. Context

StepDSA v1.0 provides 162 production-grade algorithm visualizer modules with complete debugger telemetry (`callStack`, `variables`, `conditionEval`, milestones, audio cues). However, students and competitive programmers frequently write custom variations of algorithms (e.g., custom sorting criteria, modified tree traversals, custom graph weights) and want to visualize their own code directly.

Running arbitrary user-written code in a shared multi-tenant cloud backend introduces severe security, sandboxing, and latency risks. Furthermore, forcing users to manually construct thousands of JSON lines is hostile to usability.

---

## 2. Decision

We establish the **Personal Code Studio (BYOC — Bring Your Own Code)** architecture with three foundational pillars:

1. **`.stepdsa` Developer File Standard:**
   - Developers author algorithms in a clean, human-readable `.stepdsa` file.
   - The file encapsulates algorithm metadata, source code (Python, TypeScript/JS, C++, etc.), and initial test fixtures.

2. **Universal Multi-Stage Adapter:**
   - Rather than requiring custom visual stage components for every user algorithm, the web workbench features an intelligent adapter.
   - It inspects the structure of variables and collections in each execution snapshot (detecting 1D/2D arrays, linked node chains, tree parent-child pointers, or graph adjacency structures) and routes them into StepDSA's existing high-fidelity visual stages (`ArrayStage`, `TreeStage`, `GraphStage`, etc.).

3. **Embedded Source Code Synchronization:**
   - Every execution snapshot embeds the verbatim source code lines alongside line-number mappings, variable scopes, and call-stack frames.
   - StepDSA's Code Inspector dynamically highlights executing lines in real time with zero desynchronization.

---

## 3. Consequences

### Positive
- **100% Privacy & Zero Server Cost:** User code stays on the developer's local machine or browser sandbox; no server execution cluster required.
- **Immediate Visual Reuse:** Existing battle-tested stages and animations immediately support custom user algorithms.
- **Zero-Latency Scrubbing:** Deterministic pre-computed or local timeline allows instant forward/backward time-travel debugging.

### Negative / Trade-offs
- The Universal Adapter must robustly handle irregular or unexpected memory structures with sensible fallbacks.
- Multi-language tracing requires either an in-browser runtime engine (for JS/Python) or the local CLI tracer for native languages (C++).
