<div align="center">

# 🤝 Contributing to StepDSA

<p align="center">
  <a href="https://github.com/ThanhNguyxnOrg/StepDSA/pulls"><img src="https://img.shields.io/badge/PRs-Welcome-06b6d4?style=for-the-badge&logo=git&logoColor=white" alt="PRs Welcome" /></a>
  <a href="CODE_OF_CONDUCT.md"><img src="https://img.shields.io/badge/Contributor_Covenant-v2.1-10b981?style=for-the-badge" alt="Code of Conduct" /></a>
  <a href="https://www.conventionalcommits.org/"><img src="https://img.shields.io/badge/Commits-Conventional-ec4899?style=for-the-badge" alt="Conventional Commits" /></a>
  <a href="https://vitest.dev/"><img src="https://img.shields.io/badge/Tested_with-Vitest-f59e0b?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest" /></a>
</p>

Thank you for contributing to **StepDSA**! Our goal is to craft the most intuitive, beautiful, and pedagogically sound DSA visualizer on the web.

</div>

---

## 🧭 Ways to Contribute

| Type | Description | Relevant Files |
| :--- | :--- | :--- |
| 🚀 **New Algorithm Module** | Implement a new algorithm conforming to `AlgorithmModule` | `src/modules/<category>/` |
| 📖 **Pedagogy & Proofs** | Improve theory, invariants, edge cases, and explanations | `src/modules/*/index.ts` |
| 🎨 **UI / UX Polish** | Refine animations, stage layouts, accessibility, and themes | `src/components/`, `src/index.css` |
| 🛠️ **CLI & Tooling** | Enhance offline C++ / Python tracers and JSON generators | `cli/` |
| 🐛 **Bug Fixes** | Resolve edge cases or state synchronization bugs | See [Issue Tracker](https://github.com/ThanhNguyxnOrg/StepDSA/issues) |

---

## 🛠️ Development Setup

```bash
# 1. Fork repository on GitHub, then clone locally:
git clone https://github.com/<your-username>/StepDSA.git
cd StepDSA

# 2. Install dependencies:
npm install

# 3. Start local development server:
npm run dev

# 4. Run test suite:
npm test

# 5. Link and test local CLI:
npm link
stepdsa init
stepdsa run solution.stepdsa --dev
```

---

## 📦 Adding a New Algorithm Module

Every algorithm module in StepDSA is fully typed and adheres to the following contract:

### 1. File Structure
Create a dedicated folder in `src/modules/<algorithmId>/`:
```
src/modules/dijkstra/
├── index.ts        # Module metadata, theory, presets, and code snippets
├── generator.ts    # Pure deterministic timeline generator function
├── stage.tsx       # Stage rendering component (SVG / CSS Grid / DOM)
└── dijkstra.test.ts # Comprehensive tests across edge cases
```

### 2. Generator Requirements
* **Zero side-effects:** The generator must be a pure function mapping `TInput -> ExecutionFrame<TState>[]`.
* **Annotate Every Frame:** Every step must have a clear `explanation` and synchronized `codeLine`.
* **Mark Milestones:** Set `isMilestone: true` at critical algorithm turning points (e.g. partition complete, target found).

### 3. Register in `src/modules/registry.ts`
Import and append your module to `allModules` array so it automatically appears in the workbench, dashboard, and playground selector.

---

## 📝 Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):
* `feat(algo): add dijkstra shortest path visualizer`
* `fix(quicksort): correct Lomuto pointer boundary on single-element arrays`
* `docs: update algorithm complexity proof in MASTER_CURRICULUM.md`
* `style: enhance stage contrast and typography`
* `test(bst): add duplicate keys edge case tests`

---

## 📬 Submitting a Pull Request

1. Ensure tests pass locally: `npm test` and build succeeds: `npm run build`.
2. Push your feature branch to your fork.
3. Open a Pull Request referencing related issues.
4. Maintainers will review your PR promptly!
