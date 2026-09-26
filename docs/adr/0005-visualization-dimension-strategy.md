# ADR 0005: 2D-First vs 3D Visualization Strategy

## Status
Accepted

## Context
A critical question in algorithmic visualization platforms is whether to render algorithms in 2D flat, 2.5D pseudo-isometric, or full 3D spatial perspectives. 

User feedback and pedagogical research on platforms like VisuAlgo, CS Academy, and CSVistool indicate that:
1. For 95% of foundational Data Structures and Algorithms (Sorting, Searching, Two Pointers, Linked Lists, Trees, Graphs, Dynamic Programming tables), data topologies are fundamentally 1D or 2D.
2. Applying arbitrary 3D rotational perspectives or CSS tilts to standard 1D/2D algorithms (such as bar charts or binary trees) introduces distortion:
   - Bar heights become difficult to compare due to perspective foreshortening.
   - Labels and numerical values become blurred or hard to read.
   - It introduces a "gimmicky / AI slop" appearance that distracts from algorithmic comprehension.

## Decision
1. **2D Flat as the First-Class Pedagogical Standard:**
   - All core algorithmic modules (Quicksort, Mergesort, Bubble Sort, Binary Search, Linked List, BST, Graph BFS) must render in clean, high-contrast, razor-sharp 2D flat mode by default.
2. **Elimination of Arbitrary CSS Tilt Perspective:**
   - Remove the blanket CSS 2.5D tilt toggle that distorts standard 2D stages.
3. **Restricted & Purposeful 3D Applications (Algorithms vs Toy Puzzles):**
   - 3D spatial rendering is strictly reserved for algorithms where the underlying data topology itself is inherently 3-dimensional.
   - **Approved Domain:**
     - **Spatial Partitioning Trees (Octrees / 3D K-D Trees):** Recursive division of 3D Euclidean bounding boxes into 8 octants. Fundamental to computer graphics, spatial collision detection, and voxel rendering.
   - **Rejected Applications:**
     - 1D/2D algorithms (Sorting, Trees, Graphs, DP tables) forced into pseudo-3D or tilted perspective.
     - Toy puzzle games (e.g. Tower of Hanoi) that masquerade as 3D algorithms without spatial indexing rigor.
   - When 3D is rendered, it must use clean isometric wireframe voxel boundaries with soft ambient shading, crisp node coordinates $(x, y, z)$, and interactive camera orbit.

## Consequences
- **Positive:** Maximum visual clarity, pixel-perfect text readability, zero visual clutter, and alignment with high-reputation academic tools (VisuAlgo).
- **Positive:** Cleaner codebase without brittle CSS transform matrices.
- **Guidance:** Future 3D modules will be introduced as standalone spatial modules (e.g., Octree module) rather than an artificial toggle on 2D arrays.
