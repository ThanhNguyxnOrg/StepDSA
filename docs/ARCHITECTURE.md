<div align="center">

# 🏗️ StepDSA System Architecture & Engineering Design

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Deterministic_Timeline-10b981?style=for-the-badge&logo=databricks&logoColor=white" alt="Deterministic Timeline" />
  <img src="https://img.shields.io/badge/Rendering-FLIP_%2B_SVG_%2B_Isometric-06b6d4?style=for-the-badge&logo=svg&logoColor=white" alt="FLIP + SVG + Isometric" />
  <img src="https://img.shields.io/badge/Themes-4_Studio_Engines-6366f1?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="4 Studio Themes" />
  <img src="https://img.shields.io/badge/Audio-Web_Audio_Synth-8b5cf6?style=for-the-badge&logo=audacity&logoColor=white" alt="Web Audio" />
  <img src="https://img.shields.io/badge/State-Immutable_Frames-ec4899?style=for-the-badge" alt="Immutable Frames" />
</p>

StepDSA is architected around **deterministic $\mathcal{O}(1)$ time-travel scrubbing**, **decoupled pure stage renderers**, **multi-theme studio ergonomics**, and **client-side multi-language code tracing**.

</div>

---

## 📐 Core Architectural Pillars

1. **Deterministic Snapshots over Stateful Mutators:**
   Every algorithm module (`AlgorithmModule<TInput, TState>`) is a pure function `generateTimeline(input) => ExecutionFrame<TState>[]`. Because the entire execution history is pre-computed into immutable frames, scrubbing backward, jumping to milestones, or changing playback speed is an $\mathcal{O}(1)$ array lookup with zero timing drift.

2. **Decoupled Pure Stage Renderers (`2D` & `2.5D Isometric`):**
   Visual stages (`ArrayStage`, `CallStackStage`, custom Graph/Tree/DP SVG stages) receive `frame.state` and `projection` (`'2d' | 'isometric'`) as pure props and hold zero internal playback state.

3. **Studio Multi-Theme Engine (`themeEngine.ts` + `index.css`):**
   Supports four studio color palettes (**Midnight Studio**, **Daylight Paper**, **VisuAlgo Ocean**, **Dracula Cyber**) persisted via `localStorage` (`stepdsa_studio_theme_v1`) and applied via `document.documentElement.dataset.theme`, while protecting vibrant card thumbnails inside `.algo-card-thumbnail`.

4. **Multi-Signal OS Auto-Detection (`platformShortcuts.ts`):**
   Detects `mac`, `windows`, or `linux` using `navigator.userAgentData`, high-entropy platform hints, `navigator.platform`, and `navigator.userAgent`, adapting all keyboard listeners and `<kbd>` badges in real time.

---

## 🔄 End-to-End Execution Pipeline

```mermaid
graph TD
    A[User Input / Preset / PlaygroundBar] --> B[Pure Algorithm Generator / BYOC Studio Tracer]
    B --> C[Immutable ExecutionFrame Timeline Array]
    C --> D[useTimelinePlayback Hook: O(1) Scrub & Auto-Pace]
    D --> E[Central Stage: 2D / 2.5D Isometric SVG & DOM]
    D --> F[CodeInspector: 5-Language Line Sync]
    D --> G[StepNarrationBanner: Macro Strategy + Micro Intuition]
    D --> H[OperationalMetricsBar: Compares / Swaps / Accesses]
    D --> I[SoundEngine: Web Audio Pitch Sonification]
```

---

## 🧩 Repository Structure

```text
StepDSA/
├── cli/                        # Zero-backend Node.js CLI (init, run, trace, doctor)
├── docs/                       # Documentation Hub (CLI, Studio, Architecture, 162 Curriculum)
├── src/
│   ├── components/
│   │   ├── about/              # About Platform Modal
│   │   ├── brand/              # Custom StepDSA Vector Logo & Brand Assets
│   │   ├── code/               # 5-Language Synchronized Code Inspector
│   │   ├── dashboard/          # Explore Hub (162 Modules, 9 Category Palettes, SVG Thumbnails)
│   │   ├── debugger/           # Live Call Stack & Scope Variable Watchers
│   │   ├── developer/          # Personal Code Studio v2.0 & Python-Tutor CallStackStage
│   │   ├── layout/             # Header (Theme Switcher, OS Detector, Quick Search) & Shortcuts Modal
│   │   ├── navigation/         # Command Palette (Cmd+K / Ctrl+K)
│   │   ├── player/             # Timeline Scrubber, Milestone Pins, & Playback Controls
│   │   ├── playground/         # Universal Custom Dataset Editor & Random Generators
│   │   ├── stage/              # ArrayStage, StepNarrationBanner, OperationalMetricsBar
│   │   └── workbench/          # StepTraceLog & VisualLegendModal
│   ├── core/
│   │   ├── hooks/              # useTimelinePlayback & useOperationalMetrics
│   │   ├── registry/           # Central 162-Module Registry & Lookup Helpers
│   │   └── studio/             # JS Proxy Tracer, Pyodide WASM Runner, C++ Simulator, Templates
│   ├── modules/                # 162 Algorithm & Data Structure Modules across 9 Categories
│   └── utils/                  # Theme Engine, OS Shortcuts, Stage Geometry, Runtime Error Guard
└── index.html                  # Entry HTML with Fetch Descriptor Guard & SEO Meta
```
