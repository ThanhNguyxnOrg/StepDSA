# Personal Code Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver Personal Code Studio (BYOC) for StepDSA — a 100% client-side (zero-backend) engine allowing users to author/paste custom algorithms in `.stepdsa` files, automatically classify pattern/titles with an editable pill, trace memory transitions via native ES6 Proxies without dependencies, and render interactive time-travel visualizations on the Workbench.

**Architecture:** 
A client-side pipeline: `Frontmatter Parser` parses `.stepdsa` files -> `Smart Pattern Classifier` infers algorithm category, title, and auto-testcases -> `Native Proxy Tracer` runs in-browser code with loop guard to emit standard `ExecutionFrame`s -> `Universal Multi-Stage Adapter` binds the frames to `ArrayStage`/`StackStage` with Code Inspector synchronization. Native C++/Python algorithms are traced via local CLI and dropped as `.stepdsa.json`.

**Tech Stack:** React 19, TypeScript, Vitest, Native ES6 Proxies, Lucide React, Tailwind CSS. Zero backend. Zero heavy dependencies (no Monaco, no Babel standalone, no WebSockets).

**Spec:** [docs/specs/2026-10-01-personal-code-studio-design.md](file:///D:/Code/StepDSA/docs/specs/2026-10-01-personal-code-studio-design.md)

---

## Global Constraints

- 100% Client-Side & Zero-Backend: StepDSA is a static SPA. No remote compilation or WebSocket server.
- Zero Heavy Dependencies: No Monaco Editor (>20MB), no Babel Standalone (>3MB), no YAML parser npm packages. Use native ES6 `Proxy` and lightweight regex parsing.
- Sandboxed Loop Safety: In-browser execution has a hard limit of 500 steps to protect the browser UI thread from freezing.
- Standard StepDSA Telemetry: Every generated frame must satisfy `ExecutionFrame` (`callStack`, `variables`, `conditionEval`, `soundCue`).

## Review Focus

1. **Competitive Programming Code without algorithm names (`class Solution { bool isValid() }`):** Must automatically classify into "Valid Parentheses (Stack)" with editable title pill and auto-testcase `"()[]{}"`.
2. **Infinite Loops in User Code (`while(true)` or non-terminating `for`):** Must safely break at step 500 without crashing the browser tab and show an explanation banner.
3. **Array Swaps & Comparisons:** Standard idioms like `if (arr[j] > arr[j+1])` and `arr[i] = arr[j]` must automatically capture `comparing` and `swapping` element states with audio cues.
4. **Malformed Frontmatter in `.stepdsa`:** Missing triple dashes (`---`) or invalid JSON input must fall back gracefully without unhandled exceptions.
5. **Drag-and-Drop Trace Snapshot (`.stepdsa.json`):** Dropping a CLI-generated JSON trace file into the modal must immediately mount on the Workbench with full debugger telemetry.

---

## Task Decomposition

### Task 1: Smart Pattern Classifier & Title Formatter (`classifier.ts`)

**Files:**
- Create: `src/core/studio/classifier.ts`
- Test: `src/core/studio/classifier.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export interface ClassifiedPattern {
    title: string;
    category: AlgorithmCategory;
    stageHint: 'array' | 'stack' | 'tree' | 'graph';
    defaultInput: any;
    confidence: 'high' | 'medium' | 'fallback';
  }
  export function classifyAlgorithmPattern(code: string, explicitTitle?: string): ClassifiedPattern;
  export function formatToTitleCase(str: string): string;
  ```

- [ ] **Step 1: Write failing unit tests for pattern classification**
  Test Stack Bracket matching (detects `st[++top]`, `bracket_open` -> `"Valid Parentheses (Stack)"`, input `"()[]{}"`), Binary Search (detects `mid = (low + high) / 2` -> `"Binary Search"`), Bubble Sort, and Fallback.
- [ ] **Step 2: Run test to verify it fails**
  Run: `npx vitest run src/core/studio/classifier.test.ts`
- [ ] **Step 3: Implement `classifier.ts`**
  Implement regex scanner, keyword weight rules, and title case formatter.
- [ ] **Step 4: Run test to verify it passes**
  Run: `npx vitest run src/core/studio/classifier.test.ts`
- [ ] **Step 5: Commit**
  `git add src/core/studio/classifier.ts src/core/studio/classifier.test.ts && git commit -m "feat(studio): add smart pattern classifier and auto-testcase generator"`

---

### Task 2: Frontmatter & `.stepdsa` File Parser (`parser.ts`)

**Files:**
- Create: `src/core/studio/parser.ts`
- Test: `src/core/studio/parser.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export interface StepDSAParsedFile {
    metadata: {
      title?: string;
      language?: string;
      category?: string;
      input?: any;
      stage?: string;
      pointers?: string[];
    };
    code: string;
    rawContent: string;
  }
  export function parseStepDSAFile(fileContent: string): StepDSAParsedFile;
  ```

- [ ] **Step 1: Write failing unit tests for parser**
  Test frontmatter extraction, JSON input parsing, unescaped code preservation, and handling files without frontmatter.
- [ ] **Step 2: Run test to verify it fails**
  Run: `npx vitest run src/core/studio/parser.test.ts`
- [ ] **Step 3: Implement `parser.ts`**
  Implement regex-based frontmatter divider detection (`^---([\s\S]*?)---`) and key-value/JSON parsing.
- [ ] **Step 4: Run test to verify it passes**
  Run: `npx vitest run src/core/studio/parser.test.ts`
- [ ] **Step 5: Commit**
  `git add src/core/studio/parser.ts src/core/studio/parser.test.ts && git commit -m "feat(studio): add .stepdsa frontmatter parser"`

---

### Task 3: Native Proxy Tracing Engine (`tracer.ts`)

**Files:**
- Create: `src/core/studio/tracer.ts`
- Test: `src/core/studio/tracer.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export interface TraceOptions {
    maxSteps?: number;
    pointers?: string[];
  }
  export function traceArrayExecution(code: string, rawInput: number[], options?: TraceOptions): ExecutionFrame[];
  ```

- [ ] **Step 1: Write failing unit tests for `traceArrayExecution`**
  Test that running a bubble sort loop on `[4, 2, 5]` generates frames with `comparing` and `swapping` element states, populated `variables`, and safe termination before 500 steps.
- [ ] **Step 2: Run test to verify it fails**
  Run: `npx vitest run src/core/studio/tracer.test.ts`
- [ ] **Step 3: Implement `tracer.ts`**
  Implement ES6 `Proxy` wrapper on input array with `get` and `set` traps, step counter guard, and `ExecutionFrame` builder.
- [ ] **Step 4: Run test to verify it passes**
  Run: `npx vitest run src/core/studio/tracer.test.ts`
- [ ] **Step 5: Commit**
  `git add src/core/studio/tracer.ts src/core/studio/tracer.test.ts && git commit -m "feat(studio): implement native proxy execution tracer"`

---

### Task 4: Universal Multi-Stage Adapter (`universalAdapter.ts`)

**Files:**
- Create: `src/core/studio/universalAdapter.ts`
- Test: `src/core/studio/universalAdapter.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export function createCustomAlgorithmModule(
    parsed: StepDSAParsedFile,
    classified: ClassifiedPattern,
    frames: ExecutionFrame[]
  ): AlgorithmModule;
  export function adaptTraceSnapshotToModule(snapshotJson: string): AlgorithmModule;
  ```

- [ ] **Step 1: Write failing unit tests for universal adapter**
  Test conversion of custom frames into an `AlgorithmModule` with `renderStage` calling `ArrayStage` and matching metadata.
- [ ] **Step 2: Run test to verify it fails**
  Run: `npx vitest run src/core/studio/universalAdapter.test.ts`
- [ ] **Step 3: Implement `universalAdapter.ts`**
  Bundle metadata, presets, and `renderStage` dynamic dispatching.
- [ ] **Step 4: Run test to verify it passes**
  Run: `npx vitest run src/core/studio/universalAdapter.test.ts`
- [ ] **Step 5: Commit**
  `git add src/core/studio/universalAdapter.ts src/core/studio/universalAdapter.test.ts && git commit -m "feat(studio): add universal multi-stage adapter"`

---

### Task 5: Personal Code Studio UI (`PersonalCodeStudioModal.tsx`)

**Files:**
- Modify: `src/components/developer/PersonalCodeStudioModal.tsx`
- Modify: `src/App.tsx`
- Test: `src/App.test.tsx`

**Features:**
- Interactive dark-mode code editor with live syntax highlighting and line numbers.
- Editable 1-click Title Pill (`[ 🏷️ Valid Parentheses (Stack) ✏️ ]`) driven by the classifier.
- "Run & Visualize" action invoking the in-browser Proxy tracer.
- HTML5 Drag-and-Drop + File Input supporting both `.stepdsa` files and `.stepdsa.json` traces.
- Error banner surfacing syntax/runtime errors cleanly without alert popups.

- [ ] **Step 1: Update `PersonalCodeStudioModal.tsx` with Editor, Title Pill, and Runner**
- [ ] **Step 2: Connect `onLoadCustomSnapshot` in `App.tsx` to mount the generated `AlgorithmModule`**
- [ ] **Step 3: Run regression tests**
  Run: `npm test`
- [ ] **Step 4: Run typecheck and production build**
  Run: `npx tsc --noEmit && npm run build`
- [ ] **Step 5: Commit**
  `git add src/components/developer/PersonalCodeStudioModal.tsx src/App.tsx src/App.test.tsx && git commit -m "feat(studio): integrate in-browser editor and drag-drop runner in PersonalCodeStudioModal"`

---

## Verification Plan

### Automated Tests
1. `npx vitest run src/core/studio/` — All unit tests for classifier, parser, tracer, and adapter pass.
2. `npm test` — All 331+ repository integration tests pass.
3. `npm run build` — Production Vite bundle compiles with zero TypeScript errors.

### Manual Verification
1. Click **Developer Studio** in top header to open Personal Code Studio.
2. Paste LeetCode snippet:
   ```cpp
   class Solution {
       bool isValid(string s) { ... }
   };
   ```
   Verify Title Pill automatically displays: **"Valid Parentheses (Stack)"** and click to edit title.
3. Click **"Visualize Algorithm"** on standard sorting JS code: verify it immediately loads on Workbench with interactive playback and stepper controls.
4. Drag & drop a `.stepdsa` or `.stepdsa.json` file onto the dropzone: verify immediate loading.
