# StepDSA — Comprehensive Design & Architecture Specification

**Project:** StepDSA  
**Date:** 2026-09-26  
**Status:** Validated & Ready for Planning  
**Target Path:** `D:/Code/StepDSA`

---

## 1. Executive Summary & Vision

**StepDSA** is a next-generation interactive learning platform and playground for Data Structures & Algorithms. It unifies three core learning modalities into an integrated workbench:
1. **Interactive Narrative Textbook:** Intuition-first theory, invariant explanations, visual diagrams, and formal $O(N)$ / $O(1)$ complexity profiles.
2. **Deterministic Step Visualizer:** A zero-latency, scrubbable time-travel engine that animates data transformations and pointer movements in sync with code line tracking.
3. **Interactive DSA Sandbox / Playground:** A live experimentation workbench supporting curated edge-case presets (Worst-case, Reverse, Nearly Sorted) and interactive canvas inputs (click-to-draw graphs, custom arrays).

---

## 2. Design System & Frontend Craft (Anti-Slop & Impeccable)

### 2.1 Design Read & Aesthetic Direction
- **Identity:** High-precision developer workbench + educational visualizer.
- **Aesthetic Family:** Sleek, high-contrast dark OLED workbench (`#0B0F19`) with sharp informational accents, avoiding generic purple/blue AI gradient clichés.
- **The Three Dials:**
  - `DESIGN_VARIANCE: 7` (Balanced, purpose-driven layout)
  - `MOTION_INTENSITY: 6` (Context-aware spring physics for element swaps and pointer transitions)
  - `VISUAL_DENSITY: 5` (Clean developer density: compact toolbars, spacious visual stage)

### 2.2 Token System & Palette
| Token | Hex Value | Semantic Usage |
| :--- | :--- | :--- |
| `--bg-base` | `#0B0F19` | Deep OLED root background |
| `--bg-surface` | `#111827` | Panes, sidebar, code editor background |
| `--bg-surface-elevated` | `#1F2937` | Hovered nodes, dropdowns, floating modals |
| `--border-subtle` | `#1F293D` | 1px clean separators |
| `--border-focus` | `#10B981` | Keyboard focus ring & active selection |
| `--text-primary` | `#F9FAFB` | Primary headlines, active node values |
| `--text-secondary` | `#9CA3AF` | Invariant explanations, labels, inactive tabs |
| `--accent-emerald` | `#10B981` | Success, sorted elements, active play button |
| `--accent-cyan` | `#06B6D4` | Active pointer indicators (`left`, `right`, `i`, `j`) |
| `--accent-amber` | `#F59E0B` | Pivot elements, active comparison targets |
| `--accent-rose` | `#F43F5E` | Discarded branches, partitions, swap collisions |

### 2.3 Typography & Readability
- **UI & Prose:** `Plus Jakarta Sans` or `IBM Plex Sans` (Humanist geometric sans, highly readable at 13–15px).
- **Code, Pointers & Complexity:** `JetBrains Mono` (Zero-ambiguity glyphs, ligatures, aligned tabular numbers).
- **Hard Constraints:**
  - No text smaller than 12px for data labels.
  - Contrast ratio strictly exceeds 4.5:1 (WCAG AA).
  - Descender clearance enforced on all display labels.

### 2.4 Layout Architecture (3-Pane Workbench)
```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Top Bar: Logo (StepDSA) | Topic Selector | Projection Toggle (2D / 2.5D) | GitHub | Theme       │
├─────────────────┬───────────────────────────────────────────────┬───────────────────────────────┤
│ Left Drawer:    │ Central Stage (The Visual Canvas):            │ Right Drawer:                 │
│                 │                                               │                               │
│ • Curriculum    │ • Visual Representation (Array / Tree / Graph)│ • Multi-Language Code Tabs:   │
│   Tree          │ • Interactive Pointers & State Badges         │   [Python | TS | C++ | Java]  │
│ • Topic Theory  │ • Step-by-Step Live Narration Banner          │ • Synchronized Line Glow      │
│ • Invariants &  ├───────────────────────────────────────────────┤ • Variable State Inspector    │
│   Complexity    │ Stepper Bar: [|<<] [<] [Play/Pause] [>] [>>]  │ • Invariant Assertions        │
│   Breakdown     │ Scrubber: ──●────────────── 14/32 (Pivot Set) │                               │
│                 │ Speed: [0.5x | 1x | 2x] | Presets: [Random v] │                               │
└─────────────────┴───────────────────────────────────────────────┴───────────────────────────────┘
```

---

## 3. Deep-Module Codebase Architecture

Following `codebase-design`, StepDSA minimizes surface complexity for callers while burying rich algorithmic state machinery inside deep modules.

### 3.1 The Core Seam: `AlgorithmModule` Interface
Every algorithm in StepDSA implements this single, deep interface:

```typescript
export type AlgorithmCategory = 
  | 'sorting' 
  | 'searching' 
  | 'arrays-pointers' 
  | 'linked-lists' 
  | 'trees-bst' 
  | 'graphs' 
  | 'dynamic-programming';

export interface ComplexityProfile {
  timeBest: string;
  timeAverage: string;
  timeWorst: string;
  spaceAuxiliary: string;
  worstCaseCondition: string;
}

export interface ExecutionFrame<TState> {
  stepIndex: number;
  totalSteps: number;
  codeLine: number;
  explanation: string;
  isMilestone?: boolean;
  milestoneTitle?: string;
  state: TState;
}

export interface AlgorithmModule<TInput, TState> {
  id: string;
  title: string;
  category: AlgorithmCategory;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  complexity: ComplexityProfile;
  theory: {
    overview: string;
    whyItWorks: string;
    invariant: string;
    pitfalls: string[];
  };
  codeImplementations: {
    python: string;
    typescript: string;
    cpp: string;
    java: string;
    pseudocode: string;
  };
  presets: Array<{ label: string; data: TInput; description: string }>;
  defaultInput: TInput;
  generateTimeline: (input: TInput) => ExecutionFrame<TState>[];
  renderStage: (frame: ExecutionFrame<TState>, projection: '2d' | 'isometric') => React.ReactNode;
}
```

### 3.2 Timeline Playback Controller Seam
A caller consumes the playback engine via a unified hook:

```typescript
export interface PlaybackController {
  currentStep: number;
  totalSteps: number;
  currentFrame: ExecutionFrame<any>;
  isPlaying: boolean;
  speed: number;
  play: () => void;
  pause: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  seekTo: (step: number) => void;
  setSpeed: (multiplier: number) => void;
  reset: () => void;
}
```
All timer loops, frame indexing, scrubbing calculations, and requestAnimationFrame batching are fully encapsulated.

---

## 4. Initial Launch Catalog & Curriculum Roadmap

To satisfy the user's requirement for broad algorithm coverage, the curriculum is organized into modular categories with launch implementations:

### Category 1: Sorting Algorithms
- **Bubble Sort & Selection Sort:** Foundation of element comparisons and in-place swapping.
- **Insertion Sort:** Demonstrating the sorted subarray invariant.
- **Quicksort (Lomuto & Hoare partition):** Pivot selection, recursive divide-and-conquer, worst-case visualization.
- **Mergesort:** Auxiliary buffer, split/merge recursion tree, stable sorting.
- **Heapsort:** Binary heap construction, sift-down heapify.

### Category 2: Arrays & Pointer Techniques
- **Two Pointers (Opposite Ends):** Two Sum II, Container With Most Water, Valid Palindrome.
- **Two Pointers (Fast & Slow):** Remove Duplicates, Floyd's Cycle Detection.
- **Sliding Window:** Maximum Sum Subarray of Size K, Longest Substring Without Repeating Characters.
- **Prefix Sum:** Range Sum Queries, Subarray Sum Equals K.

### Category 3: Searching & Space Partitioning
- **Linear Search vs. Binary Search:** Demonstrating logarithmic search space halving.
- **Binary Search Variants:** Search in Rotated Sorted Array, Find First and Last Position.

### Category 4: Trees & Graphs
- **Binary Search Tree (BST):** Insert, Search, Inorder/Preorder/Postorder traversals.
- **Breadth-First Search (BFS):** Queue state, level-order traversal, shortest path in unweighted graphs.
- **Depth-First Search (DFS):** Call stack visualization, cycle detection, topological sorting.
- **Dijkstra’s Algorithm:** Priority queue / min-heap state, relaxation of edge weights.

### Category 5: Dynamic Programming & Recursion
- **Fibonacci & Climbing Stairs:** Recursion tree vs Memoization table vs Iterative bottom-up array.
- **0/1 Knapsack & Grid Traveler:** 2D DP matrix filling with back-pointer reconstruction.

---

## 5. Technology Stack & Deployment Architecture

1. **Framework:** Vite 6 + React 19 + TypeScript 5.x (Strict mode).
2. **Styling & Design Tokens:** Tailwind CSS v4 + Custom CSS Design Tokens (`MASTER.md`).
3. **Motion & Transitions:** Motion (`motion/react`) with spring physics for element movement, avoiding layout thrashing.
4. **Icons:** Lucide React (`strokeWidth={1.75}`).
5. **Persistence:** Client `localStorage` via a typed state hook (theme, bookmarks, completed topics, custom user presets).
6. **Deployment:** GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`), generating zero-cost global distribution with instant offline caching.

---

## 6. Spec Self-Review Checklist

- [x] **No Placeholders:** All modules, data interfaces, and color tokens have exact definitions.
- [x] **Internal Consistency:** The 3-pane layout directly maps to the `ExecutionFrame` and `AlgorithmModule` interfaces.
- [x] **Scope Calibration:** Clean separation between the core playback engine and individual algorithm plugins ensures parallel development without merge conflicts.
- [x] **Anti-Slop Compliance:** Hard ban on unmotivated gradients, generic AI purple, and unreadable text contrasts.
