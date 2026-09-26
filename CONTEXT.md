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
  * `2D Flat (Default)`: Crisp, high-readability standard layout optimized for study.
  * `2.5D / Isometric Tilt`: Stylized perspective view using CSS transforms for immersive visual appeal.
  * `3D Spatial (Specialized)`: WebGL-driven 3D canvas reserved for multi-dimensional algorithms (e.g. 3D pathfinding, Call-stack elevation, Octrees).
* **AlgorithmModule:** A self-contained plugin bundle defining an algorithm's metadata, complexity profile, intuition narrative, deterministic generator, multi-language code snippets, and custom input presets.
