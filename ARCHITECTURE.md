<div align="center">

# 🏗️ StepDSA System Architecture

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Deterministic_Timeline-10b981?style=for-the-badge" alt="Timeline" />
  <img src="https://img.shields.io/badge/Rendering-FLIP_%2B_SVG-06b6d4?style=for-the-badge" alt="Rendering" />
  <img src="https://img.shields.io/badge/Audio-Web_Audio_Synth-8b5cf6?style=for-the-badge" alt="Web Audio" />
  <img src="https://img.shields.io/badge/State-Immutable_Frames-ec4899?style=for-the-badge" alt="State" />
</p>

StepDSA is an interactive algorithm workbench designed around zero-latency scrubbing, deterministic reproducibility, and pedagogical rigor.

</div>

---

## 📐 Core Engineering Principles

1. **Deterministic Snapshots over Stateful Mutators:**
   Traditional visualizers use async `sleep()` loops modifying shared mutable state. StepDSA computes an array of immutable `ExecutionFrame<TState>[]` upfront in pure memory. Scrubbing backwards or jumping to any arbitrary step is instantaneous $\mathcal{O}(1)$ array indexing.

2. **Decoupled Stage Renderers:**
   Visual stages receive `frame.state` as a pure React rendering target. Whether rendered as 2D vertical bars, tree node graphs, or SVG pointers, stage renderers hold zero internal playback state.

3. **Multi-Track Synchronization:**
   Every frame indexes:
   * **Visual Elements:** Values, statuses (`comparing`, `swapping`, `sorted`, `pivot`).
   * **Code Line Tracker:** Synchronized active line across 5 languages.
   * **Pedagogical Narration:** Plain-English and mathematical explanation of the invariant preserved during this step.
   * **Sound Engine:** Frequency tone synthesized from element values.

---

## 🔄 Execution Pipeline

```mermaid
graph TD
    A[User Input / Preset Data] --> B[Module Generator: pure function]
    B --> C[Immutable Execution Timeline Array]
    C --> D[useTimelinePlayback Controller Hook]
    D --> E[Stage: DOM / SVG Render]
    D --> F[CodeInspector: Synchronized Highlight]
    D --> G[Narration: Invariant Banner]
    D --> H[SoundEngine: Web Audio Frequency]
```

---

## 🧩 Directory Organization

* **`src/core/`**: Timeline controller, types, and playback logic.
* **`src/modules/`**: Pure algorithm implementations, theory, and stage renderers.
* **`src/components/`**: Modular UI components (stage, player, code inspector, playground, drawer).
* **`src/utils/`**: Web Audio synthesizer, array generators, and formatters.
* **`cli/`**: Offline C++ and Python tracers for custom code execution.
* **`docs/`**: Curriculum, architecture, and developer specifications.
