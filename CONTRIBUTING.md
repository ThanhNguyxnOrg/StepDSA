# Contributing to StepDSA

Thank you for your interest in contributing to **StepDSA**! Our mission is to make Data Structures and Algorithms intuitive, beautiful, and deeply understandable.

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## How Can I Contribute?

- **Add an Algorithm Module:** Implement a new algorithm conforming to the `AlgorithmModule` interface.
- **Improve Pedagogy:** Enhance conceptual explanations, invariant descriptions, or edge-case examples.
- **Refine Visuals & Animation:** Optimize FLIP spring parameters, improve tree or graph layouts.
- **Fix Bugs:** Address issues labeled `bug` or report new ones.

---

## Development Workflow

1. **Fork and Clone the Repository:**
   ```bash
   git clone https://github.com/<your-username>/StepDSA.git
   cd StepDSA
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Create a Feature Branch:**
   ```bash
   git checkout -b feat/add-dijkstra-algorithm
   ```

4. **Run Tests Locally:**
   ```bash
   npm test
   ```

---

## Implementing a New Algorithm Module

All algorithm modules live under `src/modules/<category>/<algorithmName>.ts` and must satisfy:
1. **Deterministic Snapshot Generator:** Emits immutable `ExecutionFrame[]` timelines without random or asynchronous side-effects.
2. **Multi-Language Snippets:** Synchronized code strings for Python, TypeScript, C++, Java, and Pseudocode.
3. **Curated Presets:** At least 3 curated presets (e.g. Random, Sorted/Best-Case, Reverse/Worst-Case).
4. **Unit Tests:** High coverage verifying timeline length $> 0$ and correctness on edge cases (empty input, single element, duplicates).

---

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
- `feat: add dijkstra shortest path module`
- `fix: resolve pointer collision in quicksort Lomuto partition`
- `docs: update time complexity proof for mergesort`
- `style: refine 2.5D isometric stage transform`
- `test: add boundary tests for binary search`

---

## Submitting a Pull Request

1. Push your branch to GitHub.
2. Open a Pull Request against `main`.
3. Complete all sections of the [Pull Request Template](.github/pull_request_template.md).
4. Ensure all CI checks (linting, tests, build) pass.
