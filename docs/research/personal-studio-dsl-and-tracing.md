# Research & Technical Survey: `.stepdsa` File Design & Tracing Engines

- **Topic:** Developer-authored `.stepdsa` files, runtime execution, and state instrumentation for Personal Code Studio
- **Date:** 2026-09-30
- **Authors:** StepDSA Core Architecture Team

---

## 1. How Other Tools Approach "User Code Visualization"

### A. Python Tutor (`pythontutor.com`)
- **Primary Source / Architecture:** Uses Python's native `sys.settrace()` in an isolated backend container to record execution steps. Emits a list of stack frames, heap objects, and line numbers (`instruction_step`, `stack`, `heap`).
- **Strengths:** Captures exact Python object graph and pointer references.
- **Weaknesses:** Requires a remote server execution backend; network latency; security vulnerabilities if untrusted code executes without virtualization.

### B. Algorithm Visualizer (`algorithm-visualizer.org`)
- **Primary Source / Architecture:** Provides language SDKs (`algorithm-visualizer` npm / pip package) with visualization commands (e.g. `tracer.set(array)`, `tracer.select(i)`).
- **Strengths:** Precise visual cues defined by the author.
- **Weaknesses:** High authoring friction; users must rewrite their clean algorithmic code to call visualizer APIs instead of normal loops and conditionals.

### C. VS Code Debug Adapter Protocol (DAP) & Omniscient Time-Travel Debuggers
- **Primary Source / Architecture:** Debuggers intercept breakpoints and variable state transitions using native debug hooks (GDB/LLDB via MI2, Node inspector protocol via Chrome DevTools Protocol `CDP`).
- **Strengths:** Works on 100% untouched native code.
- **Weaknesses:** Heavyweight binaries and complex local setup.

---

## 2. `.stepdsa` File Format Options: Trade-off Analysis

To allow users to *"write their code in this file"*, we evaluate 3 primary design archetypes for `.stepdsa`:

### Archetype 1: Markdown/YAML Frontmatter + Pure Code Block (Recommended)
```stepdsa
---
title: My Custom Quicksort
language: python
category: sorting
input: [45, 12, 89, 34, 21, 70]
targetStructure: array
---

def quicksort(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        quicksort(arr, low, pi - 1)
        quicksort(arr, pi + 1, high)

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1
```
- **Pros:**
  - Extremely human-friendly and intuitive.
  - Zero proprietary syntax inside the algorithm itself — pure standard Python, JS, or C++.
  - Frontmatter configures presets, algorithm name, and visual hints cleanly.
  - Can be edited in any code editor with normal syntax highlighting.
- **Cons:**
  - Requires a simple YAML/frontmatter split parser (trivial: split on `---`).

### Archetype 2: JSON-Centric Configuration (`algorithm.stepdsa.json` or `.stepdsa`)
```json
{
  "title": "Custom Two-Sum",
  "language": "javascript",
  "input": [2, 7, 11, 15],
  "code": "function twoSum(nums, target) { ... }"
}
```
- **Pros:** Native JSON, trivial to validate against JSON Schema.
- **Cons:** Poor developer ergonomics: multiline code requires string escaping (`\n`, `\"`), making human authoring frustrating.

### Archetype 3: Pure Source Script with Header Directives
```python
# @stepdsa title: Bubble Sort
# @stepdsa input: [64, 34, 25, 12]
# @stepdsa stage: array

def bubble_sort(arr):
    ...
```
- **Pros:** Runnable directly by standard `python` or `node` interpreters without alteration.
- **Cons:** Language-specific comment syntax (`#` vs `//` vs `/* */`).

---

## 3. Tracing & Execution Strategy: In-Browser vs Local CLI

1. **In-Browser Execution (JavaScript / TypeScript):**
   - The browser parses the code from `.stepdsa`.
   - Using AST instrumentation (or a lightweight generator transformation), every assignment, loop, and comparison yields an `ExecutionFrame`.
   - Result: Instant, zero-installation visualization for JS/TS right in the browser!

2. **Local CLI Execution (Python, C++, Node):**
   - `npx @stepdsa/cli run custom.stepdsa`
   - Uses native `sys.settrace` (for Python) or Node execution to record frames and emit a ready-to-replay `.stepdsa.json` or stream via WebSocket directly into the open browser tab.

3. **In-Browser Drag-and-Drop:**
   - User drops `my_algo.stepdsa` into the Personal Studio modal.
   - If JS/TS: executed directly in-browser.
   - If Python: executes via in-browser Pyodide or imports CLI-generated `.stepdsa.json`.

---

## 4. Universal Multi-Stage Adapter Design

When a trace is loaded into the Workbench, the adapter determines the stage:

```
Snapshot Memory Inspection:
├── Has array / list property (e.g. `arr`, `nums`, `data`)?
│   └── 1D number array → ArrayStage (2D bar chart, pointers, swaps)
│   └── 2D matrix / grid → GridStage / MatrixStage (Pathfinding, DP)
├── Has nodes with parent/children pointers (`val`, `left`, `right`)?
│   └── TreeStage (Tree layout, node highlighting)
├── Has graph representation (`nodes`, `edges`, `adjList`)?
│   └── GraphStage (Force-directed / circular graph layout)
└── Fallback:
    └── General Inspector Stage (Key-value variables, call stack, step explanation)
```
