<div align="center">

# 📊 StepDSA — Interactive Algorithm & Data Structure Time-Travel Workbench

### *Deterministic $\mathcal{O}(1)$ Execution Scrubbing • 162 Interactive Modules • BYOC Multi-Language Code Studio*

<p align="center">
  <img src="https://img.shields.io/badge/Curriculum-162_Interactive_Modules-10b981?style=for-the-badge&logo=bookstack&logoColor=white" alt="162 Modules" />
  <img src="https://img.shields.io/badge/Engine-Deterministic_0ms_Time--Travel-06b6d4?style=for-the-badge&logo=speedtest&logoColor=white" alt="Deterministic Engine" />
  <img src="https://img.shields.io/badge/Themes-4_Studio_Palettes-6366f1?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="4 Studio Palettes" />
  <img src="https://img.shields.io/badge/Motion-Framer_Spring_Physics-8b5cf6?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.x-61dafb?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5.7" />
  <img src="https://img.shields.io/badge/Vite-6.x-646cff?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 6" />
  <img src="https://img.shields.io/badge/Python-Pyodide_WASM-3776ab?style=for-the-badge&logo=python&logoColor=white" alt="Pyodide WASM" />
  <img src="https://img.shields.io/badge/C%2B%2B-17%2F20_CLI_%26_Sim-00599c?style=for-the-badge&logo=c%2B%2B&logoColor=white" alt="C++17/20" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Shortcuts-OS_Auto--Detected-f59e0b?style=for-the-badge&logo=apple&logoColor=white" alt="OS Auto-Detection" />
  <img src="https://img.shields.io/badge/Projection-2D_%26_2.5D_Isometric-14b8a6?style=for-the-badge&logo=webgl&logoColor=white" alt="2D & 2.5D Isometric" />
  <img src="https://img.shields.io/badge/Audio-Web_Audio_Synthesizer-f43f5e?style=for-the-badge&logo=audacity&logoColor=white" alt="Web Audio Synth" />
  <img src="https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge" alt="MIT License" />
</p>

**StepDSA** is an IDE-grade, VisuAlgo- and Python-Tutor-inspired algorithm visualization workbench and multi-language execution tracer engineered for computer science students, technical interview candidates (LeetCode / NeetCode 150), and competitive programmers (ICPC / IOI).

[📚 Documentation Hub](docs/README.md) · [🎨 Personal Code Studio Guide](docs/STUDIO_GUIDE.md) · [💻 Developer CLI Manual](docs/CLI.md) · [🏗️ System Architecture](docs/ARCHITECTURE.md) · [🎓 162-Module Master Curriculum](docs/MASTER_CURRICULUM.md)

</div>

---

## 🌟 Platform Highlights

### 1. ⏱️ Deterministic $\mathcal{O}(1)$ Time-Travel Engine
Unlike legacy visualizers that mutate state inside asynchronous `sleep()` loops, StepDSA pre-computes an immutable timeline of `ExecutionFrame<TState>[]` snapshots in pure memory:
- **Zero-Latency Scrubbing:** Drag the timeline scrubber, jump between milestone chapter pins (`Alt + ←/→`), or step backward/forward (`←/→`) in $\mathcal{O}(1)$ time.
- **VisuAlgo-Grade Stage Overlays:** Curved SVG comparison/swap arcs, dynamic `ActiveExpressionCallout` formula pills, live pointer badges (`i`, `j`, `left`, `right`, `mid`, `pivot`), and dual-layer strategic subtitles (`StepNarrationBanner`).
- **Live Operational Metrics HUD:** Real-time cumulative counters for **Comparisons**, **Swaps / Writes**, **Array Accesses**, and **Hash Lookups** contrasted against theoretical Big-O complexity curves.
- **Synchronized 5-Language Right Dock:** Switch seamlessly between **Code & Vars** (**Pseudocode, Python, C++, TypeScript, and Java**), **Steps Trace**, and **e-Lecture** (mathematical invariants and proofs).

---

### 2. 🎨 4 Studio Color Themes & 9 Category Card Palettes
Switch instantaneously from the top navigation header between four real-world CS studio themes while preserving vibrant card thumbnails and high-contrast stage readability:

| Theme Preset | Badge | Visual Inspiration | Primary Surface & Accents |
| :--- | :--- | :--- | :--- |
| **Midnight Studio** | ![Midnight](https://img.shields.io/badge/Midnight_Studio-0B0F19?style=flat-square&logoColor=white) | StepDSA Signature Dark | Deep Slate (`#0B0F19`) + Emerald (`#10B981`) & Cyan (`#06B6D4`) |
| **Daylight Paper** | ![Daylight](https://img.shields.io/badge/Daylight_Paper-F8FAFC?style=flat-square&logoColor=black) | VisuAlgo / LeetCode Light | Crisp Alabaster (`#F8FAFC`) + Deep Slate Ink (`#0F172A`) |
| **VisuAlgo Ocean** | ![VisuAlgo](https://img.shields.io/badge/VisuAlgo_Ocean-061325?style=flat-square&logoColor=white) | NUS VisuAlgo Academic | Deep Navy (`#061325`) + Cyan (`#06B6D4`) & Amber (`#F59E0B`) |
| **Dracula Cyber** | ![Dracula](https://img.shields.io/badge/Dracula_Cyber-13111C?style=flat-square&logoColor=white) | Dracula IDE / NeetCode | Obsidian Plum (`#13111C`) + Violet (`#A855F7`) & Pink (`#EC4899`) |

Every algorithm card across the **9 Curriculum Domains** (`Sorting`, `Searching`, `Pointers & Arrays`, `Stacks & Queues`, `Linked Lists`, `Trees & Heaps`, `Graphs`, `Dynamic Programming`, `Math & Number Theory`) features a bespoke animated SVG/CSS thumbnail and domain-matched theme palette.

---

### 3. 💻 Personal Code Studio v2.0 (BYOC — Bring Your Own Code)
Click **`>_ CLI Studio`** in the top header to open the 3-Tab **Personal Code Studio**:
- **Tab 1 — Multi-Language Code Sandbox (`JS/TS` · `Python WASM` · `C++ 17/20`):**
  - **10 Built-in Algorithm Templates:** Load *Generate Parentheses (DFS)*, *Bubble Sort*, *Binary Search*, *Two Sum (Hash Map)*, *Climbing Stairs Memo DFS*, *C++17 Vector Sort*, or *C++ Binary Search* in 1 click.
  - **Line-Numbered IDE Editor:** Synchronized line gutter, `Tab` indentation, and `Ctrl+Enter` / `Cmd+Enter` instant execution.
  - **Python Tutor-Style Heap & Call Stack Stage (`CallStackStage`):** Displays live recursive stack frames (`#1..#N`) right alongside a **Heap & Memory Objects Inspector** for arrays/lists (`res[]`, `nums[]`), dictionaries/hash maps (`lookup{}`), and local scope bindings.
- **Tab 2 — Trace Inspector & Snapshot Exporter:**
  - Dry-run any custom algorithm to inspect every captured frame (`Step #`, `Line`, `Explanation`, `Call Stack`) before launching.
  - Export a portable **`.stepdsa.json`** file or copy a compressed **`#trace=`** shareable URL in 1 click.
- **Tab 3 — Interactive Local CLI & C++ Command Builder:**
  - Configure `npx stepdsa run | trace | init | doctor` commands with `--dev`, `--no-open`, and `--verbose` flags, or download `solution.cpp` / `solution.py` directly.

---

### 4. ⌨️ Multi-Signal OS Auto-Detection & Shortcut Studio (`?`)
StepDSA detects your operating system (`macOS`, `Windows`, `Linux`) via `navigator.userAgentData`, platform hints, and user-agent analysis, dynamically updating every shortcut badge across the app:

| Action | macOS (`macOS`) | Windows (`Windows`) | Linux (`Linux`) |
| :--- | :--- | :--- | :--- |
| **Command Palette (162 Modules)** | `Cmd` + `K` | `Ctrl` + `K` | `Ctrl` + `K` |
| **Play / Pause Simulation** | `Space` | `Space` | `Space` |
| **Step Backward / Forward** | `←` / `→` | `←` / `→` | `←` / `→` |
| **Fast Scrub 5 Steps** | `Shift` + `←` / `→` | `Shift` + `←` / `→` | `Shift` + `←` / `→` |
| **Jump to Milestone** | `Opt` + `←` / `→` | `Alt` + `←` / `→` | `Alt` + `←` / `→` |
| **Jump to Start / End** | `Cmd` + `←` / `→` | `Home` / `End` | `Home` / `End` |
| **Playback Speed (`0.5x` · `1x` · `1.5x` · `2x`)** | `1` · `2` · `3` · `4` | `1` · `2` · `3` · `4` | `1` · `2` · `3` · `4` |
| **Toggle Auto-Pace** | `A` | `A` | `A` |
| **Reset Timeline** | `R` | `R` | `R` |
| **Toggle Code Dock / Theory / Legend** | `D` / `T` / `L` | `D` / `T` / `L` | `D` / `T` / `L` |
| **Toggle 2D / 3D Isometric · Zoom** | `V` · `+` / `-` / `0` | `V` · `+` / `-` / `0` | `V` · `+` / `-` / `0` |
| **Open Code Studio / Switch Hub** | `C` / `H` | `C` / `H` | `C` / `H` |
| **Interactive Shortcut Studio** | `?` or `Cmd` + `/` | `?` or `Ctrl` + `/` | `?` or `Ctrl` + `/` |

---

---

## 🚀 Quick Start & Developer Workflow

```bash
# 1. Install dependencies
npm install

# 2. Start the interactive workbench (http://localhost:5173)
npm run dev

# 3. Run the Vitest suite (modules, theme engine, OS shortcuts, studio, runtime guards)
npm test

# 4. Run Local CLI Tracer & Environment Doctor
node cli/stepdsa.js doctor
node cli/stepdsa.js run cli/sample_bubble_sort.cpp --no-open

# 5. Type-check & build production bundle
npm run build
```

---

## 📄 License

Released under the **MIT License**. Architected and built by **Thanh Nguyen** ([@RealThanhNguyxn](https://github.com/RealThanhNguyxn)) under **ThanhNguyxnOrg**.
