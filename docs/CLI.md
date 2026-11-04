<div align="center">

# 💻 StepDSA Developer CLI & Local Execution Tracer

<p align="center">
  <img src="https://img.shields.io/badge/CLI-stepdsa_v2.0-10b981?style=for-the-badge&logo=gnubash&logoColor=white" alt="stepdsa CLI" />
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Python-3.9%2B-3776ab?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/C%2B%2B-17%2F20_g%2B%2B%2Fclang%2B%2B-00599c?style=for-the-badge&logo=c%2B%2B&logoColor=white" alt="C++" />
  <img src="https://img.shields.io/badge/Payload-lz--string_URI-06b6d4?style=for-the-badge" alt="lz-string" />
</p>

The **StepDSA CLI (`cli/stepdsa.js`)** enables developers and competitive programmers to write custom algorithms locally in **C++**, **Python**, **JavaScript/TypeScript**, or **`.stepdsa`**, trace memory mutations deterministically, and launch the browser visualizer with **zero remote servers**.

</div>

---

## 🛠️ CLI Command Reference

| Command | Description | Example |
| :--- | :--- | :--- |
| **`stepdsa doctor`** | Inspects local Node.js runtime, `g++`/`clang++` compiler, `python3`, and `lz-string` compressor status. | `node cli/stepdsa.js doctor` |
| **`stepdsa init`** | Scaffolds a new `solution.stepdsa` template and `README.md` in the current working directory (never overwrites existing files). | `node cli/stepdsa.js init` |
| **`stepdsa run <file>`** | Traces `<file>`, compresses the timeline into `#trace=...`, and launches the StepDSA browser workbench. | `node cli/stepdsa.js run cli/sample_bubble_sort.cpp` |
| **`stepdsa trace <file>`** | Traces `<file>` and writes a portable `.stepdsa.json` snapshot file to disk without opening a browser. | `node cli/stepdsa.js trace cli/sample_quicksort.stepdsa --out trace.json` |

---

## 🚀 Quick Start (Doctor → Init → Trace → Visualize)

### 1. Verify Local Environment (`stepdsa doctor`)
```bash
node cli/stepdsa.js doctor
```
Output:
```text
✔ StepDSA Environment Doctor

  • Node.js Runtime : v22.x (ES6 Proxy Tracer Ready)
  • C++ Compiler    : g++ detected
  • Python Runtime  : Python 3.x
  • Payload Engine  : lz-string URI compressor active
```

### 2. Scaffold a Project (`stepdsa init`)
```bash
mkdir my-dsa-lab && cd my-dsa-lab
npx stepdsa init
```

### 3. Trace & Launch in Browser (`stepdsa run`)
```bash
# Trace a StepDSA / JS script and open in browser
node cli/stepdsa.js run cli/sample_quicksort.stepdsa

# Trace a native C++ solution with local g++ syntax validation
node cli/stepdsa.js run cli/sample_bubble_sort.cpp --dev

# Print the compressed #trace= URL without auto-opening a browser window
node cli/stepdsa.js run cli/sample_bubble_sort.cpp --no-open
```

### 4. Export an Offline JSON Snapshot (`stepdsa trace`)
```bash
node cli/stepdsa.js trace cli/sample_quicksort.stepdsa --out my_trace.stepdsa.json --verbose
```
Drag and drop `my_trace.stepdsa.json` directly into the **`>_ CLI Studio`** modal in the StepDSA web app!

---

## 📋 Portable `.stepdsa.json` Snapshot Schema

```json
{
  "version": "1.0.0",
  "meta": {
    "title": "Bubble Sort",
    "sourceFile": "solution.stepdsa",
    "language": "typescript",
    "totalSteps": 42,
    "category": "sorting",
    "createdAt": "2026-10-27T00:00:00.000Z",
    "generator": "StepDSA Local Tracer CLI v1.1.0"
  },
  "frames": [
    {
      "stepIndex": 0,
      "codeLine": 4,
      "explanation": "Comparing arr[0] (64) with arr[1] (34). Swap required!",
      "state": {
        "array": [
          { "id": "0", "value": 64, "status": "comparing", "index": 0 },
          { "id": "1", "value": 34, "status": "comparing", "index": 1 }
        ],
        "pointers": { "i": 0, "j": 0 }
      },
      "metrics": {
        "comparisons": 1,
        "swaps": 0,
        "accesses": 2
      }
    }
  ]
}
```
