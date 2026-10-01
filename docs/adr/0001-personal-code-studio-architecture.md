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

We establish the **Personal Code Studio (BYOC — Bring Your Own Code)** architecture with five foundational pillars:

1. **100% Client-Side & Zero-Backend Architecture:**
   - StepDSA is a static SPA with zero cloud execution servers.
   - All in-browser execution runs in the client browser sandbox via native JavaScript `Proxy` wrappers on input structures.
   - Zero cloud infrastructure costs, zero server maintenance, zero network latency.

2. **`.stepdsa` Developer File Standard:**
   - Developers author algorithms in a clean, human-readable `.stepdsa` file combining YAML frontmatter (metadata, input fixture, stage hint) with 100% standard unescaped code.

3. **Smart Pattern Classifier & Editable Title Pill:**
   - Solves competitive programming code that lacks explicit algorithm names (e.g. `class Solution { bool isValid() }`).
   - Analyzes AST/keyword structures to infer canonical names (e.g. `Valid Parentheses (Stack)`) and auto-generates test fixtures (`"()[]{}"`), while providing an editable 1-click title pill in the Studio UI.

4. **TypeScript / Node.js Local CLI (`npx @stepdsa/cli`):**
   - For native developer tracing, provides a zero-install TypeScript CLI that shares 100% of interfaces and schemas with the web visualizer.
   - Emits `.stepdsa.json` traces that users drag and drop directly into the static web visualizer.

5. **Universal Multi-Stage Adapter & Embedded Source Synchronization:**
   - Inspects memory structures (1D/2D arrays, stack LIFO, tree parent-child pointers, graphs) and routes them into StepDSA's existing high-fidelity visual stages (`ArrayStage`, `TreeStage`, etc.).
   - Embeds original source lines inside snapshots for synchronized Code Inspector line highlighting.

---

## 3. Consequences

### Positive
- **100% Privacy & Zero Server Cost:** User code stays on the developer's local machine or browser sandbox; zero server execution cluster required.
- **Instant V8 Execution Speed:** Native ES6 Proxy intercepts reads and writes without heavy Babel AST rewriting in browser.
- **Seamless LeetCode Experience:** Competitive solutions are automatically recognized and given sensible testcases and titles without manual boilerplate.
- **Single-Codebase CLI:** TypeScript CLI shares all types and logic with the web visualizer via npm/npx.

### Negative / Trade-offs
- Native languages (C++, Python) require running the local CLI on the user's machine instead of running directly in a static browser tab.
- Browser sandbox limits step execution count (ceiling: 500 steps) to prevent infinite loops from locking the UI thread.
