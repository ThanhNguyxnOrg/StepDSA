# StepDSA Core Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-grade, interactive learning and visualization platform for Data Structures and Algorithms with a deterministic timeline engine, 3-pane responsive workbench, synchronized multi-language code inspector, and interactive playground.

**Architecture:** Client-side SPA using Vite + React 19 + TypeScript. Core execution is strictly decoupled into a pure TypeScript deterministic snapshot generator that outputs immutable `ExecutionFrame[]` timelines, consumed by a reactive playback controller that drives SVG/DOM visual stages, synchronized code line glowing, and sound sonification.

**Tech Stack:** React 19, TypeScript 5.x, Vite 6, Tailwind CSS v4, Motion (`motion/react`), Lucide React, Vitest, React Testing Library.

**Spec:** [`docs/superpowers/specs/2026-09-26-stepdsa-design.md`](file:///D:/Code/StepDSA/docs/superpowers/specs/2026-09-26-stepdsa-design.md)

## Global Constraints
- Target directory: `D:/Code/StepDSA`
- 100% client-side execution; zero external runtime backend requirements.
- Color system: Deep OLED base `#0B0F19`, surface `#111827`, accent `#10B981` (Emerald), `#06B6D4` (Cyan), `#F59E0B` (Amber), `#F43F5E` (Rose).
- Typography: `Plus Jakarta Sans` for UI prose; `JetBrains Mono` for code & math metrics.
- WCAG AA contrast compliance (minimum 4.5:1 on text).
- Deterministic frame generation: timeline seeking/reversing must occur with 0ms calculation lag.

## Review Focus
1. **Empty / Single-element Input:** Arrays of length 0 or 1 should gracefully yield a 1-step timeline ("Already sorted / nothing to search") without NaN index errors.
2. **Rapid Playback Scrubbing:** Scrubbing the slider while auto-play is running must not create race conditions or out-of-order frame states.
3. **Array Value Extremes & Duplicates:** Inputs with identical values (e.g. `[5, 5, 5, 5]`) must not trigger infinite loops in partitioning or sorting algorithms.
4. **Keyboard Navigation Conflict:** Pressing `Space` or `ArrowRight` while typing in the custom input text box must not trigger playback step actions.
5. **Mobile Viewport Stability:** On viewports `< 768px`, the 3-pane workbench must collapse cleanly into swipeable/tabbed views without horizontal page scrolling.

---

### Task 1: Scaffolding, Tooling & Design System Tokens

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `src/index.css`, `src/main.tsx`, `src/App.tsx`, `index.html`
- Create: `vitest.config.ts`, `src/test/setup.ts`

**Interfaces:**
- Produces: Runnable Vite dev server and Vitest test runner with Tailwind v4 setup.

- [ ] **Step 1: Initialize package.json and dependencies**
  Install React 19, TypeScript, Tailwind CSS v4, Motion (`motion/react`), Lucide React, Vitest.
- [ ] **Step 2: Configure Vite & Vitest**
  Set up `vite.config.ts` and `vitest.config.ts` with React plugin.
- [ ] **Step 3: Define design system CSS tokens**
  Incorporate tokens from `design-system/stepdsa/MASTER.md` into `src/index.css` (custom CSS variables for OLED background, emerald accents, and typography imports).
- [ ] **Step 4: Run smoke test to verify Vite build & Vitest runner**
  Run: `npm test` or `npx vitest run`
  Expected: PASS
- [ ] **Step 5: Commit**
  `git add . && git commit -m "feat: scaffold Vite, TypeScript, Tailwind v4, and design tokens"`

---

### Task 2: Core Domain Types & Deterministic Timeline Engine

**Files:**
- Create: `src/core/types.ts`
- Create: `src/core/timeline.ts`
- Test: `src/core/timeline.test.ts`

**Interfaces:**
- Produces: `ExecutionFrame`, `Timeline`, `AlgorithmModule`, `PlaybackController` state engine.

- [ ] **Step 1: Write the failing unit test for timeline creation & playback**
  Verify that stepping forward, backward, seeking to frame $k$, and pause/play logic functions accurately on an immutable sequence of frames.
- [ ] **Step 2: Run test to verify it fails**
  Run: `npx vitest run src/core/timeline.test.ts`
  Expected: FAIL (modules not implemented)
- [ ] **Step 3: Implement `src/core/types.ts` & `src/core/timeline.ts`**
  Implement the deterministic `Timeline` data structure with clamp indices, milestone metadata, and zero-drift time travel.
- [ ] **Step 4: Run test to verify it passes**
  Run: `npx vitest run src/core/timeline.test.ts`
  Expected: PASS
- [ ] **Step 5: Commit**
  `git commit -m "feat: implement deterministic timeline engine and core interfaces"`

---

### Task 3: Responsive 3-Pane Layout Shell & Header

**Files:**
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/SidebarDrawer.tsx`
- Create: `src/components/layout/WorkbenchLayout.tsx`
- Test: `src/components/layout/WorkbenchLayout.test.tsx`

**Interfaces:**
- Consumes: `AlgorithmCategory`, theme toggle, projection mode toggle (`2d` | `isometric`).
- Produces: Main responsive 3-pane workbench container.

- [ ] **Step 1: Write test for layout rendering and drawer toggles**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement Header with logo, topic selector, and 2.5D Isometric view toggle**
- [ ] **Step 4: Implement SidebarDrawer for curriculum navigation**
- [ ] **Step 5: Assemble WorkbenchLayout**
- [ ] **Step 6: Run test to verify it passes**
- [ ] **Step 7: Commit**
  `git commit -m "feat: build responsive 3-pane workbench shell and navigation"`

---

### Task 4: Interactive Stepper Control Bar & Timeline Scrubber

**Files:**
- Create: `src/components/player/StepperControls.tsx`
- Create: `src/components/player/TimelineScrubber.tsx`
- Create: `src/hooks/useKeyboardShortcuts.ts`
- Test: `src/components/player/StepperControls.test.tsx`

**Interfaces:**
- Consumes: `PlaybackController` hook.
- Produces: Tactile control bar (`|<<`, `<`, `Play/Pause`, `>`, `>>`), speed selector (`0.25x`, `0.5x`, `1x`, `2x`), scrubber slider with milestone dots, and keyboard shortcuts (`Space`, `ArrowLeft`, `ArrowRight`).

- [ ] **Step 1: Write failing test for stepper button clicks and keyboard event isolation**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement StepperControls with active spring feedback (`-translate-y-[1px]`)**
- [ ] **Step 4: Implement TimelineScrubber with milestone popovers**
- [ ] **Step 5: Implement `useKeyboardShortcuts` with input field exclusion**
- [ ] **Step 6: Run tests to verify PASS**
- [ ] **Step 7: Commit**
  `git commit -m "feat: implement interactive stepper bar, milestone scrubber, and keyboard navigation"`

---

### Task 5: Synchronized Multi-Language Code Viewer

**Files:**
- Create: `src/components/code/CodeViewer.tsx`
- Create: `src/components/code/LanguageTabs.tsx`
- Test: `src/components/code/CodeViewer.test.tsx`

**Interfaces:**
- Consumes: `codeImplementations` record, active `codeLine` from `ExecutionFrame`.
- Produces: Multi-language tabbed code viewer (Python, TypeScript, C++, Java, Pseudocode) with animated active line highlighting.

- [ ] **Step 1: Write test verifying that switching languages preserves active line highlighting**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement LanguageTabs and CodeViewer with line numbers and glowing indicator**
- [ ] **Step 4: Run test to verify PASS**
- [ ] **Step 5: Commit**
  `git commit -m "feat: implement synchronized multi-language code inspector with line tracking"`

---

### Task 6: Interactive Playground Bar & Edge Case Presets

**Files:**
- Create: `src/components/playground/PlaygroundBar.tsx`
- Create: `src/utils/arrayGenerators.ts`
- Test: `src/components/playground/PlaygroundBar.test.tsx`

**Interfaces:**
- Produces: Data generator bar with input field, presets (Random, Sorted, Reversed, All Equal, Worst Case), and validation error notifications.

- [ ] **Step 1: Write test for array parsing, sanitization, and preset selection**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement `arrayGenerators.ts` (Random, Nearly Sorted, Reversed, Few Unique, Worst-case)**
- [ ] **Step 4: Implement `PlaygroundBar.tsx` with instant input feedback**
- [ ] **Step 5: Run test to verify PASS**
- [ ] **Step 6: Commit**
  `git commit -m "feat: implement playground input generator and edge-case presets"`

---

### Task 7: Tier 1 Algorithm Modules Implementation

**Files:**
- Create: `src/modules/sorting/quicksort.ts`
- Create: `src/modules/sorting/mergesort.ts`
- Create: `src/modules/searching/binarySearch.ts`
- Create: `src/modules/arrays/twoPointers.ts`
- Create: `src/modules/trees/bst.ts`
- Create: `src/modules/registry.ts`
- Test: `src/modules/modules.test.ts`

**Interfaces:**
- All modules conform to `AlgorithmModule<TInput, TState>` interface.

- [ ] **Step 1: Write unit tests verifying that all 5 algorithms generate valid, non-empty timelines**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement Quicksort (Lomuto partition with pivot, i, j pointers)**
- [ ] **Step 4: Implement Mergesort (Divide, temporary buffer, merge steps)**
- [ ] **Step 5: Implement Binary Search (Search space [L...R], mid calculation, discarded range)**
- [ ] **Step 6: Implement Two Pointers (Container With Most Water)**
- [ ] **Step 7: Implement BST (Node insertion and in-order traversal steps)**
- [ ] **Step 8: Register all modules in `registry.ts`**
- [ ] **Step 9: Run tests to verify PASS**
- [ ] **Step 10: Commit**
  `git commit -m "feat: implement Tier 1 algorithm modules (Quicksort, Mergesort, Binary Search, Two Pointers, BST)"`

---

### Task 8: FLIP Animation Visual Stages & 2.5D Isometric Mode

**Files:**
- Create: `src/components/stage/ArrayStage.tsx`
- Create: `src/components/stage/TreeStage.tsx`
- Create: `src/components/stage/StepNarrationBanner.tsx`
- Test: `src/components/stage/ArrayStage.test.tsx`

**Interfaces:**
- Consumes: Current `ExecutionFrame`, projection mode (`2d` | `isometric`).
- Produces: Animated SVG/DOM stage with FLIP bar transitions, pointer arrows, and narration banner.

- [ ] **Step 1: Write test for ArrayStage element status styling (comparing, sorted, pivot)**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement ArrayStage with Motion spring animations and pointers**
- [ ] **Step 4: Implement CSS isometric transform classes for 2.5D projection mode**
- [ ] **Step 5: Implement TreeStage with Reingold-Tilford centered node layout**
- [ ] **Step 6: Implement StepNarrationBanner for plain-English step explanations**
- [ ] **Step 7: Run tests to verify PASS**
- [ ] **Step 8: Commit**
  `git commit -m "feat: implement FLIP animation visual stage, tree renderer, and 2.5D isometric mode"`

---

### Task 9: Web Audio Sonification & End-to-End Delivery Polish

**Files:**
- Create: `src/utils/soundEngine.ts`
- Create: `src/components/common/SoundToggle.tsx`
- Test: `src/utils/soundEngine.test.ts`
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Produces: Web Audio API pentatonic pitch synthesizer triggered on element comparisons and swaps; GitHub Actions Pages deploy workflow.

- [ ] **Step 1: Implement `soundEngine.ts` with frequency mapping and mute toggle**
- [ ] **Step 2: Add SoundToggle button to Header**
- [ ] **Step 3: Run comprehensive build verification (`npm run build`)**
- [ ] **Step 4: Configure `.github/workflows/deploy.yml` for automated GitHub Pages hosting**
- [ ] **Step 5: Commit**
  `git commit -m "feat: add audio sonification, GitHub Pages deployment workflow, and final polish"`
