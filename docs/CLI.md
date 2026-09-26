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

### 1. Inspect Sample Tracing Code
Inspect the C++ sample tracer in `cli/sample_bubble_sort.cpp`:
```bash
cat cli/sample_bubble_sort.cpp
```

### 2. Generate Deterministic Snapshots
Run the StepDSA CLI to execute the code and output a timeline JSON snapshot:
```bash
node cli/stepdsa.js trace --lang cpp --src cli/sample_bubble_sort.cpp --out bubble_trace.stepdsa.json
```

### 3. Load into StepDSA Visualizer
1. Open the [StepDSA Web App](https://ThanhNguyxnOrg.github.io/StepDSA/).
2. Click **Developer Studio** in the top navigation bar.
3. Drag and drop `bubble_trace.stepdsa.json`.
4. Step through your native code's execution with full timeline scrubbability!

---

## 📋 JSON Trace Schema (`.stepdsa.json`)

A valid StepDSA trace file must include:
```json
{
  "version": "1.0",
  "meta": {
    "title": "Custom Algorithm Trace",
    "algorithm": "bubble-sort",
    "language": "cpp"
  },
  "frames": [
    {
      "step": 0,
      "codeLine": 12,
      "explanation": "Comparing elements at index 0 and 1",
      "isMilestone": false,
      "state": {
        "array": [
          { "value": 42, "status": "comparing", "index": 0 },
          { "value": 17, "status": "comparing", "index": 1 }
        ]
      }
    }
  ]
}
```
