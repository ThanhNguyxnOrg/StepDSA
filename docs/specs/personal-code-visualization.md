# Architectural Specification: Personal Code Visualization (Bring Your Own DSA)

**Status:** Proposed / Under Active Design  
**Author:** StepDSA Engineering Team  
**Category:** Advanced Developer Capability  
**Target Release:** StepDSA v1.2+

---

## 1. Executive Summary & Vision

While StepDSA provides curated, invariant-driven visualizations for core algorithms (Quicksort, Binary Search, BST, Two Pointers, etc.), real-world mastery happens when software engineers and students write their own custom algorithms and need to debug subtle pointer mistakes, off-by-one boundary bugs, or unintended quadratic space/time bloat.

**Personal Code Visualization** allows developers to write arbitrary DSA implementations in their language of choice (**Python, TypeScript/JavaScript, C++, Java, Go**), execute them **locally on their own machine** using a lightweight tracing CLI, and visualize the execution step-by-step inside the StepDSA web interface with complete time-travel scrubability.

---

## 2. Core Architectural Principles

### Principle 1: Zero Remote Code Execution (Security First)
- **Problem:** Hosting server-side sandboxes (e.g., executing untrusted C++ or Python in AWS Lambda / Docker) is high risk (DDoS, resource exhaustion, cryptocurrency miners, arbitrary code execution escapes).
- **Solution:** Code execution **never happens on StepDSA web servers**. All user code runs **100% locally** on the user's machine inside their existing compiler/runtime environment.

### Principle 2: Language-Agnostic JSON Snapshot Contract (`.stepdsa.json`)
The local CLI tracer instruments or intercepts the execution, serializing every step into a strictly validated `SnapshotSchema_v1` JSON structure. The web visualizer is a pure snapshot playback engine—it does not care whether the snapshot came from Python, Rust, or C++.

```
+--------------------------------------------------------------+
|                    DEVELOPER LOCAL MACHINE                   |
|                                                              |
|   [my_algorithm.py / .cpp / .ts]                             |
|                 │                                            |
|                 ▼                                            |
|   ┌───────────────────────────┐                              |
|   │  StepDSA Tracing Runner   │ (sys.settrace / LLDB / AST)  |
|   └─────────────┬─────────────┘                              |
|                 │ produces                                   |
|                 ▼                                            |
|   ┌───────────────────────────┐                              |
|   │   trace.stepdsa.json      │                              |
|   └─────────────┬─────────────┘                              |
|                 │                                            |
|                 ├──────────────────────────────┐             |
|                 ▼ (Live WebSocket Stream)      ▼ (File Drop) |
+─────────────────┼──────────────────────────────┼─────────────+
                  │                              │
                  ▼                              ▼
+──────────────────────────────────────────────────────────────+
|                   STEPDSA WEB FRONTEND                       |
|                                                              |
|   ┌──────────────────────────────────────────────────────┐   |
|   │    StepDSA Universal Time-Travel Playback Stage      │   |
|   │     - Array / Matrix / Tree / Graph Adapters         │   |
|   │     - Local Variable Inspector & Scrubber            │   |
|   └──────────────────────────────────────────────────────┘   |
+──────────────────────────────────────────────────────────────+
```

---

## 3. The Snapshot Specification (`SnapshotSchema_v1`)

```json
{
  "version": "1.0.0",
  "metadata": {
    "sourceFile": "solution.py",
    "language": "python",
    "entryFunction": "two_sum",
    "totalSteps": 12,
    "timestamp": 1727334800000
  },
  "sourceCode": "def two_sum(nums, target):\n    lookup = {}\n    for i, num in enumerate(nums):\n...",
  "steps": [
    {
      "stepIndex": 0,
      "line": 1,
      "event": "call",
      "explanation": "Entering two_sum with nums=[2, 7, 11, 15], target=9",
      "variables": {
        "target": 9,
        "lookup": {}
      },
      "dataStructures": [
        {
          "name": "nums",
          "kind": "array",
          "elements": [
            { "index": 0, "value": 2, "state": "normal" },
            { "index": 1, "value": 7, "state": "normal" },
            { "index": 2, "value": 11, "state": "normal" },
            { "index": 3, "value": 15, "state": "normal" }
          ],
          "pointers": [
            { "name": "i", "index": 0, "color": "cyan" }
          ]
        }
      ]
    }
  ]
}
```

---

## 4. Tracing Implementations per Language

1. **Python (`stepdsa-python`)**:
   - Uses `sys.settrace()` or bytecode AST rewriting to hook variable modifications, loop iterations, and recursive stack frames.
   - Low overhead, zero native dependencies.

2. **TypeScript / JavaScript (`@stepdsa/node-tracer`)**:
   - Uses V8 Inspector Protocol (`inspector` module) or Babel AST instrumentation to observe array mutations and object property updates.

3. **C / C++ (`stepdsa-lldb`)**:
   - Uses LLDB Python API or DWARF debugging symbols to sample variables at line boundaries.

4. **Java (`stepdsa-jvm`)**:
   - Uses Java Virtual Machine Tool Interface (JVMTI) / Java Debug Interface (JDI) for breakpoint stepping.

---

## 5. Web Platform Integration

### Delivery Channels:
1. **File Drag-and-Drop:**
   - Developers drag a generated `*.stepdsa.json` file into the StepDSA Web interface to immediately visualize it with full playback controls.
2. **Localhost Daemon Stream (`ws://localhost:9123`):**
   - The CLI opens a local WebSocket. The StepDSA website connects via `ws://localhost:9123` to provide zero-click live visual reloading as the developer saves and reruns their code in VS Code.

---

## 6. Security & Sandboxing Guarantee
- **No Uploads:** Data never leaves localhost unless the user explicitly clicks "Export Share Link" (which hashes and stores snapshot JSON client-side).
- **CORS / Localhost Only:** WebSocket server binds strictly to `127.0.0.1` and verifies origin `localhost` or `stepdsa.com`.
