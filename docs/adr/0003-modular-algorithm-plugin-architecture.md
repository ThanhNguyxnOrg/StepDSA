# Modular Algorithm Plugin Architecture

We chose a modular plugin architecture for the StepDSA curriculum and execution catalog. Rather than hardcoding algorithm views inside specific components, every algorithm is implemented as a self-contained `AlgorithmModule` conforming to a standardized interface:

- Metadata (title, category, difficulty, time/space complexity)
- Theory & Intuition content (markdown or rich blocks)
- Deterministic Generator function (`(input: TConfig) => Timeline`)
- Default inputs and edge-case presets (Worst Case, Best Case, Random, Custom)
- Stage Renderer binding (mapping `ExecutionFrame` to visual components)
- Synchronized code snippets across multiple languages (Python, TypeScript, C++, Java)

This architecture guarantees that scaling from 5 to 50+ algorithms requires adding isolated module files without modifying the core player, timeline scrubber, or layout engine.
