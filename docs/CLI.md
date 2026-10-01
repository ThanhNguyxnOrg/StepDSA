<div align="center">

# 💻 StepDSA Developer CLI & Offline Execution Tracer

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/C%2B%2B-17%2F20-00599c?style=for-the-badge&logo=c%2B%2B&logoColor=white" alt="C++" />
  <img src="https://img.shields.io/badge/Python-3.9%2B-3776ab?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Format-StepDSA_JSON_v1-ec4899?style=for-the-badge" alt="Format" />
</p>

The StepDSA CLI allows competitive programmers, professors, and students to trace native C++ or Python algorithm executions locally and replay them inside the StepDSA web visualizer.

</div>

---

## 🚀 Quick Usage

### 1. Author or Inspect a `.stepdsa` File
Create a clean, natural algorithm file using pure JavaScript/TypeScript (or Python/C++):
```javascript
// Quick Sort (Lomuto Partition)
function partition(arr, low, high) {
  const pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      i++;
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
  }
  const temp = arr[i + 1];
  arr[i + 1] = arr[high];
  arr[high] = temp;
  return i + 1;
}

function quickSort(arr, low, high) {
  if (low < high) {
    const pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
  return arr;
}

const arr = [45, 12, 89, 34, 21, 70, 5, 60];
quickSort(arr, 0, arr.length - 1);
```

### 2. Generate Deterministic Snapshots via CLI
Run the StepDSA CLI locally on your machine (zero-install via `npx` or local Node):
```bash
# Via npx (zero-install):
npx @stepdsa/cli trace my_algorithm.stepdsa --out trace.stepdsa.json

# Or directly via repository node runner:
node cli/stepdsa.js trace my_algorithm.stepdsa
```

### 3. Load into StepDSA Visualizer (Zero-Backend Web App)
1. Open the **StepDSA Web App** (100% static, client-side).
2. Click **Developer Studio** in the top navigation bar.
3. Drag and drop `my_algorithm.stepdsa` (runs instantly in browser) or `trace.stepdsa.json`.
4. Step through execution with full time-travel debugger telemetry!

---

## 📋 JSON Trace Schema (`.stepdsa.json`)

A valid StepDSA trace file produced by the CLI includes:
```json
{
  "version": "1.0",
  "meta": {
    "title": "Custom Algorithm Trace",
    "algorithm": "bubble-sort",
    "language": "typescript"
  },
  "frames": [
    {
      "stepIndex": 0,
      "codeLine": 12,
      "explanation": "Comparing elements at index 0 and 1",
      "callStack": ["bubbleSort(arr)"],
      "variables": { "i": 0, "j": 1 },
      "soundCue": "compare",
      "isMilestone": false,
      "state": {
        "array": [
          { "id": "0", "value": 42, "status": "comparing" },
          { "id": "1", "value": 17, "status": "comparing" }
        ]
      }
    }
  ]
}
```
