<div align="center">

# 💻 StepDSA Developer CLI & Execution Tracer

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Python-3.9%2B-3776ab?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/C%2B%2B-17%2F20-00599c?style=for-the-badge&logo=c%2B%2B&logoColor=white" alt="C++" />
  <img src="https://img.shields.io/badge/Workflow-Zero--Setup-10b981?style=for-the-badge" alt="Workflow" />
</p>

The StepDSA CLI allows learners and developers to write custom algorithms locally, trace memory mutations deterministically, and visualize execution step-by-step in the browser with **zero backend setup**.

</div>

---

## 🚀 Quick Start (Install → Init → Write → Run)

### 1. Link or Install CLI
```bash
# Clone and link globally
git clone https://github.com/ThanhNguyxnOrg/StepDSA.git
cd StepDSA
npm install
npm link
```

### 2. Scaffold a New Project
```bash
mkdir my-algorithms && cd my-algorithms
stepdsa init
```
This generates:
- `solution.stepdsa`: Editable algorithm source file with auto-detected input array.
- `README.md`: Quick reference guide.

### 3. Edit Code
Open `solution.stepdsa` and implement or paste your algorithm:
```javascript
const arr = [64, 34, 25, 12, 22, 11, 90];

for (let i = 0; i < arr.length; i++) {
  for (let j = 0; j < arr.length - i - 1; j++) {
    if (arr[j] > arr[j + 1]) {
      const temp = arr[j];
      arr[j] = arr[j + 1];
      arr[j + 1] = temp;
    }
  }
}
```

### 4. Trace & Visualize Instantly
```bash
stepdsa run solution.stepdsa
```
**What happens:**
1. The CLI executes your code locally using a native ES6 Proxy sandbox.
2. Captures all reads, writes, swaps, and pointer positions into an immutable timeline.
3. Compresses the snapshot via `lz-string` into a URL-safe hash fragment (`#trace=...`).
4. Automatically launches your browser to the deployed StepDSA visualizer, rendering your execution step-by-step with a `CLI Session Active` badge!

---

## 📖 Subcommands & Options

### `stepdsa init`
Scaffolds a new algorithm template in the current directory.
- Refuses to overwrite existing files to protect user work.

### `stepdsa run <file> [options]`
Traces code, compresses the snapshot, and opens the online visualizer in the default browser.
- `--dev`, `--local`: Targets `http://localhost:5173/` for local development.
- `--no-open`: Prints the URL without launching the browser.
- **Automatic Fallback (>60KB):** If execution is long (>200 steps), the CLI automatically saves `<file>.stepdsa.json` locally and prints instructions to drag-and-drop into Developer Studio.

### `stepdsa trace <file> [options]`
Generates an offline `.stepdsa.json` snapshot file without opening the browser.
- `--out <path>`: Custom destination path for the JSON trace file.
- `--verbose`: Logs each step transition to terminal output.

---

## 📋 JSON Trace Schema (`.stepdsa.json`)

A valid StepDSA trace file produced by the CLI includes:
```json
{
  "version": "1.0.0",
  "meta": {
    "title": "Bubble Sort",
    "sourceFile": "solution.stepdsa",
    "language": "typescript",
    "totalSteps": 42,
    "category": "sorting",
    "createdAt": "2026-10-01T10:00:00.000Z",
    "generator": "StepDSA Local Tracer CLI v1.1.0"
  },
  "frames": [
    {
      "stepIndex": 0,
      "codeLine": 4,
      "explanation": "Comparing arr[0] (64) with arr[1] (34). Swap required!",
      "state": {
        "array": [
          { "id": "0", "value": 64, "status": "comparing" },
          { "id": "1", "value": 34, "status": "comparing" }
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

---

## 🛡️ Privacy & Security Guarantee
- **100% Client-Side:** Code execution runs exclusively on your local machine using Node.js.
- **Zero Cloud Storage:** No source code or memory snapshots are ever transmitted to any remote server or database. The URL hash is parsed entirely within your browser client.
