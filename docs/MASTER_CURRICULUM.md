# 🗺️ StepDSA Master Curriculum & Specification (100+ Algorithms)

> **Architectural Mission:**  
> Distinct from rudimentary classroom visualizers (such as CSVizTool, which strictly confines itself to Georgia Tech's introductory CS 1332 syllabus), **StepDSA** is architected as a professional **Interactive IDE-Grade Algorithm Workbench**: serving university computer science students, software engineers mastering technical interview patterns (LeetCode patterns), and competitive programmers (ICPC / IOI).

---

## 💎 The StepDSA Pedagogical Standard (7-Pillar Contract)

Every algorithm implemented within StepDSA must adhere to the 7 core architectural pillars:

1. **Interactive Stage:** High-performance vector graphics (DOM/SVG/Canvas) supporting both 2D planar layouts and 2.5D Isometric projections.
2. **Hybrid Granularity Stepper:** Dual execution granularities:
   - `Line` (F10 / Step Into): Executes individual CPU instructions (variable assignments, loop increments, conditional evaluations).
   - `Action` (Shift + F10 / Milestone): Fast-forwards to macro-level visual milestones (Swap, Merge, Enqueue, Backtrack, Tree Rotation).
3. **IDE Debugger Pane:** Real-time execution telemetry featuring a concrete **Call Stack** (recursive frame depth `#3, #2, #1`), **Scope Variables** (real-time local/global state tracking), and branch evaluation inspectors (`85 <= 98 -> TRUE`).
4. **Synchronized Multi-Language Code:** Live line-synchronized syntax highlighting across 5 formal representations: **C++** (ICPC Standard), **Python**, **TypeScript**, **Java**, and **Pseudocode**.
5. **Mathematical Invariants & Theoretical Proofs:** In-line invariant status banners and a slide-out Invariant Drawer detailing correctness proofs, asymptotic Big-$\mathcal{O}$ complexities, and real-world edge cases.
6. **Web Audio Sonification:** Frequency-synthesized audio feedback (Web Audio API) mapped to element values, memory reads, writes, and partition barriers.
7. **Custom Sandbox & Presets:** User-defined custom inputs (Array, Graph, Tree) alongside preconfigured datasets (Random, Reversed Worst-Case, Nearly Sorted, Few Unique).

---

## 📊 Comparative Analysis: CSVizTool (Baseline) vs. StepDSA (Full Spectrum)

| Criteria | CSVizTool (CS 1332 Baseline) | StepDSA (Professional Visualizer) |
|---|---|---|
| **Academic Target** | CS 1332 syllabus (introductory undergraduate) | Full CS Degree + Technical Interviews + ICPC / Competitive Programming |
| **Algorithmic Scope** | Halts at basic graphs; lacks DP, Trie, Advanced Trees, Geometry | Full spectrum: DP (0/1, Unbounded, Bitmask), Strings (KMP, Z, Aho), Advanced Trees, Flow |
| **Execution Mechanics** | Passive animation playback; no line-by-line CPU execution | **IDE-Grade Debugger**: Real Call Stack, Scope Variables, discrete CPU line stepping |
| **Code Synchronization** | Static Java or Pseudocode display only | Real-time line highlight synchronization across C++, Python, TS, Java, Pseudocode |
| **Spatial Visual Modes** | Flat 2D rendering only | 2D planar + 2.5D Isometric + 3D Spatial Partitioning |

---

## 🏛️ Master Curriculum Roadmap (20 Taxonomic Categories A → T)

### A. Searching
- [x] **Linear Search (Sequential Scan)** `[ACTIVE]`
- [x] **Binary Search (Invariant Boundary Halving)** `[ACTIVE]`
- [x] **Search in Rotated Sorted Array (Pivot Invariant Halving)** `[ACTIVE]`
- [ ] Jump Search (Block Hopping $\mathcal{O}(\sqrt{N})$)
- [ ] Interpolation Search (Uniformly Distributed Probing)
- [ ] Exponential Search (Doubling Range Search)
- [ ] Ternary Search (Unimodal Function Extremum Optimization)
- [ ] Binary Search on Answer Space (Monotonic Predicate Optimization)

---

### B. Sorting & Selection
* **Elementary Sorts:**
  - [x] **Bubble Sort (Adjacent Swaps)** `[ACTIVE]`
  - [x] **Selection Sort (Minimum Scan)** `[ACTIVE]`
  - [x] **Insertion Sort (Incremental Build)** `[ACTIVE]`
  - [ ] Cocktail Shaker Sort (Bidirectional Bubble Sort)
* **Divide & Conquer:**
  - [x] **Quicksort (Lomuto & Hoare Partitioning)** `[ACTIVE]`
  - [x] **Mergesort (Divide & Conquer Two-Way Merge)** `[ACTIVE]`
  - [ ] Quickselect ($k^{\text{th}}$ Order Statistic / Median of Medians)
* **Heap-Based:**
  - [x] **Heapsort (Max-Heap In-Place)** `[ACTIVE]`
* **Non-Comparison Sorts:**
  - [x] **Counting Sort (Frequency Bucket Indexing)** `[ACTIVE]`
  - [x] **Radix Sort (LSD Digit Bucket Passes)** `[ACTIVE]`
  - [ ] Bucket Sort (Scatter-Gather Distribution)
* **Advanced & Adaptive Sorts:**
  - [ ] Shellsort (Diminishing Increment Gap Sequence)
  - [ ] Timsort (Adaptive Natural Run Merging)
  - [ ] Introsort (Hybrid Quick / Heap / Insertion Sort)
* **Educational & Esoteric Sorts:**
  - [ ] Bogosort (Permutation Random Shuffle)
  - [ ] Sleep Sort (Thread-Based Timer Scheduling)
  - [ ] Drop Sort (Non-Decreasing Lossy Extraction)
  - [ ] Miracle Sort (External State Transition Waiting)
  - [ ] Stooge Sort (Recursive 2/3 Overlapping Segment Sort)

---

### C. Linked Lists (Structures & Operations)
- [x] **Singly Linked List (Insert, Delete, Reverse)** `[ACTIVE]`
- [x] **Doubly Linked List (Bidirectional Pointers)** `[ACTIVE]`
- [x] **Reverse Linked List (In-Place Iterative & Recursive)** `[ACTIVE]`
- [ ] Circular Linked List (Ring Buffer Traversal)
- [x] **Floyd's Cycle Detection (Tortoise and Hare Fast & Slow Pointers)** `[ACTIVE]`
- [ ] Middle of the Linked List (Two-Pointer Midpoint Finding)
- [ ] Merge Two Sorted Linked Lists (Splice & Merge Pointers)
- [ ] Remove N-th Node From End of List (Window Pointer Offset)
- [ ] Intersection of Two Linked Lists (Pointer Alignment Traversal)

---

### D. Linear Data Structures (Stack / Queue / Deque)
* **Core Structures:**
  - [ ] Stack (Array-Based & Node-Based Dynamic Implementations)
  - [x] **Queue (FIFO Operations)** `[ACTIVE]`
  - [ ] Circular Queue (Modulo Indexing Ring Buffer)
  - [ ] Deque (Double-Ended Queue with Head/Tail $\mathcal{O}(1)$ Operations)
* **Algorithmic Applications:**
  - [x] **Balanced Parentheses (Stack LIFO Syntax Validator)** `[ACTIVE]`
  - [x] **Monotonic Stack (Next Greater Element / Histogram Rectangles)** `[ACTIVE]`
  - [ ] Infix to Postfix Conversion (Dijkstra's Shunting-Yard Algorithm)
  - [ ] Postfix Expression Evaluation (Operand Stack Evaluator)
  - [ ] Monotonic Queue (Sliding Window Maximum $\mathcal{O}(N)$)

---

### E. Trees & Priority Queues
* **Binary Tree & Traversals:**
  - [x] **Binary Tree Traversals (Inorder, Preorder, Postorder)** `[ACTIVE]`
  - [ ] Level-Order Traversal (Breadth-First Search Tree)
* **Binary Search Tree (BST):**
  - [x] **BST Search & Insertion (Ordered Key Invariant)** `[ACTIVE]`
  - [ ] BST Deletion (Inorder Predecessor / Successor Re-linking)
* **Self-Balancing Trees:**
  - [x] **AVL Tree (Self-Balancing Rotations)** `[ACTIVE]`
  - [ ] Red-Black Tree (Color Invariants & Recoloring Rotations)
  - [ ] Splay Tree (Self-Adjusting Zig-Zig & Zig-Zag Heuristics)
* **Multi-Way & Database Trees:**
  - [ ] 2-3 Tree (Balanced Multi-Way Search Tree)
  - [ ] 2-3-4 Tree (B-Tree Order 4 with Symmetric Splitting)
  - [ ] B-Tree & B+ Tree (High-Fanout Database Block Indexing)
* **Heaps & Priority Queues:**
  - [x] **Binary Heap (Min-Heap Insert, Sift-Down, Extract-Min)** `[ACTIVE]`
  - [ ] Max-Heap & Floyd's Linear-Time Build-Heap $\mathcal{O}(N)$
* **Specialized & Probabilistic Trees:**
  - [ ] SkipList (Probabilistic Multi-Level Express Lanes)
  - [ ] Treap (Cartesian Randomized BST Heap Hybrid)

---

### F. Trie & String Trees
- [x] **Trie (Prefix Search & Autocomplete)** `[ACTIVE]`
- [ ] Radix Tree (Compressed Patricia Trie Edge Compacting)
- [ ] Ternary Search Tree (TST Compact Three-Way Branching)
- [ ] Suffix Tree (Ukkonen's Linear-Time Online Construction)
- [ ] Suffix Array & LCP Array (Kasai's Linear-Time Inversion)

---

### G. Maps & Hashing
- [ ] Hash Map (Separate Chaining with Linked Collision Buckets)
- [ ] Hash Map (Open Addressing: Linear Probing)
- [ ] Hash Map (Quadratic Probing & Double Hashing)
- [ ] Dynamic Rehashing & Amortized Load Factor Resizing
- [ ] Tree Map (Self-Balancing Red-Black Key-Value Dictionary)

---

### H. Graph Traversals & Connectivity
- [x] **Breadth-First Search (BFS Wavefront & Shortest Path)** `[ACTIVE]`
- [x] **Depth-First Search (DFS & Cycle Detection)** `[ACTIVE]`
- [ ] Connected Components & Flood Fill (Grid & Adjacency Scan)
- [ ] Bipartite Graph Verification (2-Coloring via BFS / DFS)
- [x] **Topological Sort (Kahn's In-Degree Queue Algorithm)** `[ACTIVE]`
- [ ] Topological Sort (DFS Post-Order Finish Times & Cycle Guard)

---

### I. Shortest Path Algorithms
- [x] **Dijkstra's Algorithm (Min-Heap Priority Queue Relaxation)** `[ACTIVE]`
- [x] **Bellman-Ford Algorithm (Edge Relaxation & Negative-Cycle Detection)** `[ACTIVE]`
- [x] **Floyd-Warshall Algorithm (All-Pairs Shortest Path Dynamic Programming)** `[ACTIVE]`
- [x] **A* Search Algorithm (Admissible & Consistent Heuristic Pathfinding)** `[ACTIVE]`
- [ ] 0-1 BFS (Double-Ended Queue Edge-Weight Shortest Path)

---

### J. Minimum Spanning Tree (MST) & Disjoint Set
- [x] **Disjoint Set Union (DSU / Union-Find with Path Compression & Union-by-Rank)** `[ACTIVE]`
- [x] **Kruskal's Algorithm (Greedy Edge Sorting + DSU Cycle Elimination)** `[ACTIVE]`
- [x] **Prim's Algorithm (Minimum Spanning Tree)** `[ACTIVE]`
- [ ] Borůvka's Algorithm (Parallel Component Contraction)

---

### K. Advanced Graph Algorithms (ICPC & Systems Level)
* **Strongly Connected Components (SCC):**
  - [ ] Tarjan's SCC Algorithm (Low-Link DFS Timestamps & Explicit Stack)
  - [ ] Kosaraju's Algorithm (Two-Pass Transposed DFS Decomposition)
* **Bridges & Articulation Points:**
  - [ ] Bridge Finding in Undirected Graphs (DFS Discovery & Low-Point Bounds)
  - [ ] Articulation Points (Cut Vertices & Root-Degree Checks)
* **Eulerian & Hamiltonian Paths:**
  - [ ] Hierholzer's Algorithm (Eulerian Path & Circuit Backtracking)
  - [ ] Hamiltonian Path & Cycle (NP-Complete Backtracking & State Pruning)
* **Network Flow & Bipartite Matching:**
  - [ ] Ford-Fulkerson & Edmonds-Karp (Augmenting Paths via BFS $\mathcal{O}(V E^2)$)
  - [ ] Dinic's Algorithm (Level Graph & Blocking Flow $\mathcal{O}(V^2 E)$)
  - [ ] Hopcroft-Karp Algorithm (Maximum Bipartite Matching $\mathcal{O}(E \sqrt{V})$)
* **Graph Coloring & Transitive Closure:**
  - [ ] Transitive Closure (Warshall's Reachability Matrix)
  - [ ] Graph Coloring (Greedy Welsh-Powell & Backtracking Chromatic Solver)

---

### L. String Algorithms & Pattern Matching
* **Pattern Matching:**
  - [ ] Naive Brute Force Matching (Slide-and-Compare Baseline)
  - [x] **Knuth-Morris-Pratt (KMP with Longest Prefix Suffix Failure Function)** `[ACTIVE]`
  - [x] **Rabin-Karp (Rolling Hash Match)** `[ACTIVE]`
  - [x] **Z-Algorithm (Linear Z-Box Substring Pattern Matching)** `[ACTIVE]`
  - [ ] Boyer-Moore Algorithm (Bad Character & Good Suffix Shift Heuristics)
  - [ ] Aho-Corasick Algorithm (Dictionary Trie with Failure Links $\mathcal{O}(N + M + Z)$)
* **Advanced String Algorithms:**
  - [ ] Manacher's Algorithm (Linear-Time Longest Palindromic Substring)
  - [ ] Suffix Automaton (SAM Minimal Directed Acyclic Word Graph)

---

### M. Dynamic Programming (DP)
* **Fundamental & Linear DP:**
  - [ ] Fibonacci & Climbing Stairs (State Transition & Memoization Foundations)
  - [x] **House Robber (Non-Adjacent Maximum Sum Subsequence)** `[ACTIVE]`
  - [x] **Kadane's Algorithm (Maximum Contiguous Subarray Sum $\mathcal{O}(N)$)** `[ACTIVE]`
* **Knapsack Family:**
  - [x] **0/1 Knapsack Problem (2D DP Matrix & Backtrack Reconstitution)** `[ACTIVE]`
  - [ ] Unbounded Knapsack Problem (Repetitive Item Choice Optimization)
  - [x] **Coin Change (Fewest Coins DP)** `[ACTIVE]`
  - [ ] Subset Sum & Partition Equal Subset Sum
* **Sequence DP:**
  - [x] **Longest Common Subsequence (LCS 2D DP Table & Backtrack)** `[ACTIVE]`
  - [x] **Longest Increasing Subsequence (LIS)** `[ACTIVE]`
  - [x] **Edit Distance (Levenshtein Distance Matrix Alignment)** `[ACTIVE]`
  - [x] **Longest Palindromic Substring (Expand Around Center / DP)** `[ACTIVE]`
  - [ ] Longest Palindromic Subsequence (Interval Matrix DP)
* **Grid & Interval DP:**
  - [ ] Unique Paths & Minimum Path Sum in 2D Grid
  - [ ] Matrix Chain Multiplication (MCM Optimal Parenthesization)
  - [ ] Burst Balloons (Reverse Interval DP Decomposition)
* **Bitmask & Tree DP:**
  - [ ] Traveling Salesperson Problem (TSP Held-Karp $\mathcal{O}(2^N N^2)$ Bitmask DP)
  - [ ] Tree DP (Tree Diameter, Maximum Independent Set, Rerooting Technique)

---

### N. Greedy & Array Techniques
- [x] **Two Pointers Technique (Container With Most Water)** `[ACTIVE]`
- [x] **Sliding Window Technique (Fixed & Variable Length Window Invariants)** `[ACTIVE]`
- [x] **Activity Selection / Interval Scheduling (Earliest Deadline First)** `[ACTIVE]`
- [ ] Fractional Knapsack (Value-to-Weight Ratio Greedy Choice)
- [ ] Huffman Coding (Greedy Min-Heap Optimal Prefix Tree)
- [ ] Gas Station Circuit (Greedy Cumulative Deficit Check)
- [ ] Jump Game (Greedy Maximum Reachable Index)
- [ ] Merge Overlapping Intervals (Sort by Start Time Sweep)

---

### O. Divide & Conquer
- [x] **Mergesort (Two-Way Array Partition & Inversion Count)** `[ACTIVE]`
- [x] **Quicksort (Pivot Partition & Recursive Subarray Sort)** `[ACTIVE]`
- [ ] Closest Pair of Points ($\mathcal{O}(N \log N)$ Geometric Divide & Conquer)
- [ ] Count Inversions in Array (Modified Mergesort Cross-Inversion Counting)
- [ ] Strassen's Matrix Multiplication (Sub-Cubic $\mathcal{O}(N^{2.807})$ Matrix Block Algebra)

---

### P. Backtracking
- [x] **N-Queens Problem (Row-by-Row Constraint Propagation & Diagonal Masks)** `[ACTIVE]`
- [ ] Sudoku Solver (Exact Cover Constraint Backtracking)
- [ ] Permutations & Combinations Generator (State-Space Exploration)
- [ ] Subsets / Power Set (Recursive Include/Exclude Decision Tree)
- [ ] Rat in a Maze (Grid Pathfinding with Visited Cell Backtracking)
- [ ] Word Search in 2D Grid (Directional DFS with Board Character Restoration)

---

### Q. Recursion & Call Trees
- [x] **Tower of Hanoi (Recursive Call Stack)** `[ACTIVE]`
- [ ] Mergesort Recursion Call Tree (Visual Frame Depth & Split Tree)
- [ ] Quicksort Partition Tree (Pivot-Selection Tree Topology)
- [ ] Backtracking State-Space Decision Tree Visualizer

---

### R. Number Theory & Mathematics
- [x] **Euclidean Algorithm (Greatest Common Divisor via Modulo)** `[ACTIVE]`
- [x] **Sieve of Eratosthenes (Composite Grid Elimination)** `[ACTIVE]`
- [x] **Fast Binary Modular Exponentiation (Logarithmic Exponent Halving)** `[ACTIVE]`
- [ ] Modular Multiplicative Inverse (Extended Euclidean Algorithm)
- [ ] Integer Prime Factorization (Trial Division & Pollard's Rho)

---

### S. Bit Manipulation
- [x] **Bitwise Operations Interactive Visualizer (AND, OR, XOR, NOT, Bitwise Shifts)** `[ACTIVE]`
- [ ] Count Set Bits (Brian Kernighan's Algorithm & Popcount Lookup)
- [ ] Power of Two & Single Number Detection (XOR Cancellation Properties)
- [ ] Submask Enumeration (Submask Traversal via Bit Tricks)

---

### T. Spatial & Computational Geometry
- [x] **Octree 3D (Spatial Octant Bounding-Box Partitioning)** `[ACTIVE]`
- [ ] Convex Hull (Graham Scan & Andrew's Monotone Chain)
- [ ] Line Segment Intersection (Orientation & Cross-Product Verification)
- [ ] Point in Polygon Test (Ray Casting & Winding Number)
- [ ] Sweep-Line Algorithm (Bentley-Ottmann Geometric Intersections)

---

### U. Data Structures Taxonomy (Complete Structural Inventory)
* **Linear Structures:**
  - [ ] Static Array & Dynamic Array (Contiguous Memory Allocation & Amortized Doubling)
  - [x] **Singly Linked List (Forward-Linked Pointer Node Chains)** `[ACTIVE]`
  - [x] **Doubly Linked List (Bidirectional Prev/Next Pointer Nodes)** `[ACTIVE]`
  - [ ] Circular Linked List (Endless Ring Buffer Traversal)
  - [ ] Stack (LIFO Array-Backed & Node-Backed Structures)
  - [x] **Queue (FIFO Array-Backed Circular Buffer & Node-Backed Structures)** `[ACTIVE]`
  - [ ] Deque (Double-Ended Queue with Head/Tail Pointer Buffers)
* **Hash-Based Structures:**
  - [ ] Hash Table (Separate Chaining with Dynamic Overflow Buckets)
  - [ ] Hash Table (Open Addressing: Linear Probing, Quadratic Probing, Double Hashing)
  - [ ] TreeMap / Ordered Map (Red-Black Key-Value Search Structure)
* **Trees & Heaps:**
  - [ ] Binary Tree (Full, Complete, Perfect, Degenerate Topologies)
  - [x] **Binary Search Tree (BST Invariant Binary Hierarchy)** `[ACTIVE]`
  - [x] **AVL Tree (Strict Height-Balanced Search Tree)** `[ACTIVE]`
  - [ ] Red-Black Tree (Relaxed Color-Balanced Search Tree)
  - [x] **Binary Heap (Min-Heap / Max-Heap Array-Backed Complete Binary Tree)** `[ACTIVE]`
  - [x] **Trie (Prefix Character Retrieval Tree)** `[ACTIVE]`
  - [ ] 2-3 Tree & 2-3-4 Tree (B-Tree Multiway Node Groupings)
  - [ ] B-Tree & B+ Tree (High-Order Clustered & Non-Clustered Storage)
  - [ ] Splay Tree (Self-Adjusting Access-Frequency Restructuring)
  - [ ] Segment Tree & Segment Tree with Lazy Propagation (Range Queries & Updates)
  - [ ] Fenwick Tree / Binary Indexed Tree (Prefix Sum Updates in $\mathcal{O}(\log N)$)
  - [ ] Treap (Cartesian Priority Randomized Search Tree)
  - [x] **Octree 3D (3D Spatial Octant Decomposition Engine)** `[ACTIVE]`
  - [ ] KD-Tree (K-Dimensional Spatial Point Partitioning)
* **Graph & Set Structures:**
  - [ ] Adjacency Matrix (Dense $V \times V$ Constant-Time Edge Representation)
  - [ ] Adjacency List (Sparse $V + E$ Dynamic Bucket Representation)
  - [ ] Edge List (Flat Weighted Edge Array for Kruskal / Bellman-Ford)
  - [x] **Disjoint Set Union (DSU / Union-Find with Path Compression & Rank)** `[ACTIVE]`
* **Specialized & Advanced Structures:**
  - [ ] SkipList (Probabilistic Multi-Layered Index)
  - [ ] Sparse Table (Range Minimum Query RMQ in $\mathcal{O}(1)$ Time)
  - [ ] Interval Tree (Augmented 1D Range Overlap Detection)

---

## 🎯 Scope Allocation across 3 Development Tiers (Levels 1 → 3)

```mermaid
graph TD
    subgraph Level 1: Must Have Core
        L1[35 Algorithms - 100% COMPLETE<br/>Foundational CS Curriculum]
    end
    subgraph Level 2: Strong DSA
        L2[~75 Algorithms<br/>University + LeetCode Medium/Hard]
    end
    subgraph Level 3: Advanced & CP
        L3[~100+ Algorithms<br/>Competitive Programming, Geometry & Flow]
    end
    L1 --> L2 --> L3
```

### 🏆 Level 1 — Must-Have Core (35 Modules — 100% Implemented)
* **Target Objective:** Comprehensively satisfy all foundational curriculum requirements for 1st & 2nd year university Computer Science (CS1 / CS2).
* **Coverage Scope (All Active):**
  - **Sorting (7):** Bubble, Selection, Insertion, Merge, Quick, Heap, Counting, Radix LSD.
  - **Searching (3):** Linear Search, Binary Search, KMP, Rabin-Karp.
  - **Lists & Linear (4):** Singly Linked List, Doubly Linked List, Queue FIFO, Balanced Parentheses Stack.
  - **Trees & Heaps (5):** Binary Search Tree, AVL Tree, Binary Heap, Tree Traversals, Trie.
  - **Graphs (6):** BFS, DFS, Dijkstra, Prim's MST, Kruskal's MST, Kahn's Topological Sort.
  - **Dynamic Programming (4):** 0/1 Knapsack, Longest Common Subsequence, Coin Change, Longest Increasing Subsequence.
  - **Math & Recursion (4):** Sieve of Eratosthenes, Euclidean GCD, Tower of Hanoi, Octree 3D.

### 🚀 Level 2 — Strong DSA (~75 Modules)
* **Target Objective:** Technical interview readiness for Big Tech (Google, Meta, Amazon) and ICPC National Contests.
* **Additional Coverage:**
  - **Graphs:** Bellman-Ford, Floyd-Warshall, A*, 0-1 BFS, Tarjan SCC, Kosaraju, Bridges, Articulation Points.
  - **Data Structures:** Disjoint Set Union (DSU), Segment Tree, Fenwick Tree (BIT), Splay Tree, Monotonic Stack / Queue.
  - **Strings:** Z-Algorithm, Aho-Corasick, Manacher's Algorithm, Suffix Array.
  - **Dynamic Programming:** Edit Distance, Matrix Chain Multiplication, Bitmask DP (TSP), Tree DP.
  - **Backtracking:** N-Queens, Sudoku, Subsets.
  - **Number Theory & Math:** Fast Modular Exponentiation, Modular Inverse, Prime Factorization.

### 🌟 Level 3 — Advanced & Competitive Programming (~100+ Modules)
* **Target Objective:** ICPC Regional / World Finals competitive readiness and high-performance systems engineering.
* **Additional Coverage:**
  - **Network Flow:** Dinic's Algorithm, Edmonds-Karp, Min-Cost Max-Flow.
  - **Bipartite Matching:** Hopcroft-Karp Bipartite Matching.
  - **Advanced Trees:** Heavy-Light Decomposition (HLD), Centroid Decomposition, Treap, B-Tree, KD-Tree.
  - **Advanced Queries:** Mo's Algorithm, Sparse Table RMQ $\mathcal{O}(1)$.
  - **Geometry:** Convex Hull (Graham Scan), Sweep-Line, Closest Pair of Points.
  - **Advanced Mathematics:** Fast Fourier Transform (FFT / NTT).

---

## 📈 Current StepDSA Implementation Status (44 Active Modules)

1. [Quicksort (Lomuto Partition)](../src/modules/sorting/quicksort.tsx) — Sorting
2. [Mergesort (Divide & Conquer)](../src/modules/sorting/mergesort.tsx) — Sorting
3. [Insertion Sort (Incremental Build)](../src/modules/sorting/insertionSort.tsx) — Sorting
4. [Selection Sort (Minimum Scan)](../src/modules/sorting/selectionSort.tsx) — Sorting
5. [Bubble Sort (Adjacent Swaps)](../src/modules/sorting/bubbleSort.tsx) — Sorting
6. [Counting Sort (Frequency Bucket Indexing)](../src/modules/sorting/countingSort.tsx) — Sorting
7. [Radix Sort LSD (Digit Bucket Passes)](../src/modules/sorting/radixSort.tsx) — Sorting
8. [Heapsort (Max-Heap In-Place)](../src/modules/sorting/heapsort.tsx) — Sorting
9. [Linear Search (Sequential Scan)](../src/modules/searching/linearSearch.tsx) — Searching
10. [Binary Search (Boundary Halving)](../src/modules/searching/binarySearch.tsx) — Searching
11. [KMP Pattern Search (Knuth-Morris-Pratt)](../src/modules/strings/kmpSearch.tsx) — Strings
12. [Rabin-Karp (Rolling Hash Match)](../src/modules/strings/rabinKarp.tsx) — Strings & Searching
13. [Z-Algorithm (Linear Z-Box Match)](../src/modules/strings/zAlgorithm.tsx) — Strings & Searching
14. [Balanced Parentheses (Stack LIFO)](../src/modules/stack/balancedParentheses.tsx) — Linear DS & Stack
15. [Queue (FIFO Operations)](../src/modules/stack/queueVisualizer.tsx) — Stacks & Queues
16. [Sieve of Eratosthenes (Prime Grid)](../src/modules/math/sieveOfEratosthenes.tsx) — Number Theory & Math
17. [Euclidean Algorithm (GCD)](../src/modules/math/euclideanGcd.tsx) — Number Theory & Math
18. [Tower of Hanoi (Recursive Call Stack)](../src/modules/math/towerOfHanoi.tsx) — Recursion & Math
19. [N-Queens Problem (Backtracking State-Space)](../src/modules/math/nQueens.tsx) — Backtracking & Math
20. [Kadane's Algorithm (Max Subarray Sum)](../src/modules/dp/kadanesAlgorithm.tsx) — Dynamic Programming
21. [House Robber (Non-Adjacent Max Sum)](../src/modules/dp/houseRobber.tsx) — Dynamic Programming
22. [Longest Common Subsequence (LCS 2D DP)](../src/modules/dp/lcs.tsx) — Dynamic Programming
23. [Coin Change (Fewest Coins DP)](../src/modules/dp/coinChange.tsx) — Dynamic Programming
24. [Longest Increasing Subsequence (LIS)](../src/modules/dp/lis.tsx) — Dynamic Programming
25. [Edit Distance (Levenshtein Distance)](../src/modules/dp/editDistance.tsx) — Dynamic Programming
26. [0/1 Knapsack Problem (2D DP Matrix)](../src/modules/dp/knapsack.tsx) — Dynamic Programming
27. [Binary Search Tree (BST Construction)](../src/modules/trees/bst.tsx) — Trees
28. [AVL Tree (Self-Balancing Rotations)](../src/modules/trees/avlTree.tsx) — Trees & BST
29. [Binary Tree Traversals (Inorder, Preorder, Postorder)](../src/modules/trees/treeTraversals.tsx) — Trees & BST
30. [Trie (Prefix Search & Autocomplete)](../src/modules/trees/trie.tsx) — Trees & Strings
31. [Singly Linked List (Pointers & Mutations)](../src/modules/linkedList/singlyLinkedList.tsx) — Linked Lists
32. [Doubly Linked List (Bidirectional Pointers)](../src/modules/linkedList/doublyLinkedList.tsx) — Linked Lists
33. [Binary Heap (Min-Heap Priority Queue)](../src/modules/trees/binaryHeap.tsx) — Priority Queues
34. [BFS Wavefront (Queue Shortest Path)](../src/modules/graphs/bfsTraversal.tsx) — Graphs
35. [DFS Traversal (Call Stack & Cycle Detection)](../src/modules/graphs/dfsTraversal.tsx) — Graphs
36. [Topological Sort (Kahn's In-Degree DAG)](../src/modules/graphs/topologicalSort.tsx) — Graphs
37. [Dijkstra's Algorithm (Min-Heap Shortest Path)](../src/modules/graphs/dijkstra.tsx) — Graphs
38. [Bellman-Ford (Negative Weights & Cycles)](../src/modules/graphs/bellmanFord.tsx) — Graphs
39. [Floyd-Warshall (All-Pairs Shortest Path DP)](../src/modules/graphs/floydWarshall.tsx) — Graphs
40. [A* Search (Heuristic Pathfinding)](../src/modules/graphs/aStarSearch.tsx) — Graphs & Searching
41. [Kruskal's MST (DSU Edge Sorting)](../src/modules/graphs/kruskalMST.tsx) — Graphs
42. [Prim's Algorithm (Minimum Spanning Tree)](../src/modules/graphs/primMST.tsx) — Graphs
43. [Disjoint Set Union (DSU / Union-Find)](../src/modules/graphs/dsu.tsx) — Graphs & Sets
44. [Octree 3D (Spatial Octant Partitioning)](../src/modules/trees/octree3d.tsx) — Spatial 3D
