# StepDSA — Ubiquitous Language & Domain Model

## Core Concepts & Glossary

### 1. Pedagogical Entities

* **Topic / Category:** A high-level domain grouping of algorithmic study (e.g., Arrays & Pointers, Sorting, Searching, Linked Lists, Trees & BST, Graphs, Dynamic Programming).
* **Lesson / Concept Module:** A focused educational unit covering a specific structure or algorithm (e.g., *Two-Pointer Technique*, *Quicksort Partitioning*, *Dijkstra’s Shortest Path*). Combines theoretical intuition, step-by-step interactive walkthrough, and playground experimentation.
* **Intuition Narrative:** The "interactive textbook" component that explains *why* an algorithm works through diagrams, visual analogies, invariants, and edge cases before presenting formal code.
* **Complexity Profile:** Time and auxiliary space complexity metrics ($O(1)$, $O(\log n)$, $O(n)$, $O(n \log n)$, $O(n^2)$) categorized by Best, Average, and Worst cases, accompanied by the conditions that trigger them.

### 2. Execution & Visualization Engine

* **Snapshot / Execution Frame:** An immutable data record representing the complete state of the data structure, algorithm pointers, and current execution context at a discrete point in time ($t$).
* **Timeline:** An ordered array of immutable `ExecutionFrame`s generated deterministically by running an algorithm on a specific input dataset. Enables zero-cost time travel (stepping backwards and forwards).
* **Tracer / Instrumenter:** The headless algorithmic runner that executes an algorithm, captures state transitions, and emits `ExecutionFrame` events without UI coupling.
* **Stage / Visualizer Canvas:** The rendering surface (SVG/Canvas/DOM) that translates an `ExecutionFrame` into high-visual-fidelity animated elements (e.g., array bars, tree nodes, graph edges, matrix cells).
* **Pointer / Cursor:** A named visual indicator (e.g., `left`, `right`, `i`, `j`, `slow`, `fast`, `pivot`) bound to an index or node to show the algorithm's active focus.
* **Element State:** The visual classification of a data node during execution:
  * `idle / default`: Untouched element.
  * `comparing`: Elements actively being evaluated against each other.
  * `swapping / shifting`: Elements in physical transition.
  * `active / current`: The current node being visited or processed.
  * `sorted / settled`: Element in its finalized, verified position.
  * `discarded / pruned`: Branch or partition eliminated from search space.

### 3. Interactive Controls & Modes

* **Stepper Control Bar:** The playback controller supporting Play, Pause, Step Next, Step Previous, Scrub Timeline, and Speed Regulation.
* **Pseudocode Tracker:** A synchronized code viewer displaying standard pseudocode or multi-language implementations (Python, TypeScript, C++, Java), with active line highlighting tied to the current `ExecutionFrame`.
* **Playground / Sandbox Mode:** An unguided mode where learners provide custom inputs, select preset edge cases (e.g., Reverse Sorted, All Duplicates, Sparse Graph), and observe the algorithm's behavior.
* **Step Explanation / Narration:** A dynamically updated human-readable note explaining the exact rationale of the current step (e.g., *"Comparing arr[i] (3) with pivot (7): 3 <= 7, so swap arr[i] with arr[pIndex]"*).
* **View Projection Mode:** The visual rendering perspective on the Stage:
  * `2D Flat (Pedagogical Standard)`: Primary, high-contrast, crystal-clear standard mode for all 1D/2D data structures and algorithms (Sorting, Searching, Linked Lists, Trees, Graph BFS, Two Pointers). Zero distortion.
  * `3D Spatial (Spatial Data Structures)`: Reserved strictly for data structures whose domain is genuinely 3-dimensional, namely **Octree** (3D space partitioning for computer graphics, spatial indexing, collision detection) and **3D K-D Tree**, rendered using clean isometric voxel bounding boxes.
* **AlgorithmModule:** A self-contained plugin bundle defining an algorithm's metadata, complexity profile, intuition narrative, deterministic generator, multi-language code snippets, and custom input presets.

### 4. Personal Code Tracing & Local Runner (BYOC — Bring Your Own Code)

* **Local Tracing Engine (Tracer CLI):** A standalone developer tool executing strictly on the user's local machine that instruments algorithm code, records variable/pointer mutations, and outputs deterministic snapshots without cloud upload.
* **Execution Snapshot (`.stepdsa.json`):** An immutable, language-agnostic JSON format encapsulating the step-by-step memory states, line numbers, call stack, and explanations of arbitrary developer code.
* **Local Bridge / Dev Streamer:** A lightweight local daemon (`ws://localhost:9123`) or drag-and-drop loader that pipes locally captured snapshots directly into the StepDSA web visualizer for time-travel playback.
* **Universal Playback Adapter:** The web visualizer's modular rendering pipeline capable of dynamically detecting whether an execution snapshot represents arrays, linked lists, binary trees, or graphs, and binding it to the appropriate Stage.
