# 🎨 StepDSA Personal Code Studio & Multi-Language Tracing Guide

<p align="center">
  <img src="https://img.shields.io/badge/JavaScript-ES6%2B-f7df1e?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Python-Pyodide%20WASM-3776ab?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/C%2B%2B-Native%20g%2B%2B-00599c?style=for-the-badge&logo=c%2B%2B&logoColor=white" alt="C++" />
  <img src="https://img.shields.io/badge/Execution-100%25%20Local-10b981?style=for-the-badge" alt="Local" />
</p>

StepDSA Personal Code Studio lets you paste custom algorithms (including LeetCode function signatures and `class Solution` patterns) and visualize their execution step-by-step with time-travel debugging.

---

## ⚡ Multi-Language Architecture Matrix

| Language | Environment | Execution Engine | Primary Visualization |
| :--- | :--- | :--- | :--- |
| **JavaScript / TypeScript** | In-Browser Web Studio | Native V8 Proxy Sandbox | `ArrayStage`, `CallStackStage` |
| **Python** | In-Browser Web Studio | Pyodide WebAssembly Sandbox | `CallStackStage`, `ArrayStage` |
| **C++ (17/20)** | Terminal CLI | Local `g++` / `clang++` Engine | `CallStackStage`, `ArrayStage` via `#trace=` |

---

## 🌐 1. In-Browser Web Studio (JavaScript & Python)

### How to Access:
1. Open StepDSA in your browser: [https://thanhnguyxnorg.github.io/StepDSA/](https://thanhnguyxnorg.github.io/StepDSA/)
2. Click the **`>_ CLI Studio`** button in the top navigation bar.
3. Use the streamlined **`Code Editor`** tab for direct in-browser execution or **`CLI Quickstart`** for terminal instructions.

### Importing & Dropping Files:
- Click **`[ 📂 Import File ]`** on the editor toolbar to load any `.js`, `.ts`, `.py`, `.stepdsa`, or `.json` trace file.
- Or simply **drag and drop** a file directly onto the editor workspace to load it instantly.

### Language Toggle:
- Click **`JS / TS`** to run JavaScript/TypeScript code using our zero-latency proxy sandbox.
- Click **`Python (WASM)`** to run Python code directly in your browser using Pyodide WebAssembly.

### LeetCode Function Support & Testcase Input:
Both JS and Python support LeetCode function signatures and `class Solution` classes directly without boilerplate:

```javascript
// LeetCode: Generate Parentheses (Recursion / Backtracking)
const generateParenthesis = function(n) {
  const res = [];
  const dfs = (open, close, s) => {
    if (!open && !close) {
      res.push(s);
      return;
    }
    if (open > 0) dfs(open - 1, close, s + "(");
    if (close > open) dfs(open, close - 1, s + ")");
  };
  dfs(n, n, "");
  return res;
};
```

Enter your testcase argument in the **Testcase Input** bar:
```text
n = 3
```
Click **`Visualize Algorithm`** to trace the entire recursion tree live in `CallStackStage`!

---

## 🐍 2. Python WebAssembly Sandbox (Pyodide)

The Python runner is powered by Pyodide compiled to WebAssembly. When you click **Visualize Algorithm** under Python mode:
1. Pyodide loads on-demand from CDN (`~15MB WebAssembly`).
2. Your code is compiled in an isolated WASM sandbox on your local CPU.
3. `sys.settrace()` captures every line change, local variable mutation, and recursive stack frame.
4. StepDSA adapts the captured state into timeline frames with zero server lag.

### Python LeetCode Example:
```python
# LeetCode: Two Sum
class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        lookup = {}
        for i, num in enumerate(nums):
            diff = target - num
            if diff in lookup:
                return [lookup[diff], i]
            lookup[num] = i
        return []
```
**Testcase Input**:
```text
nums = [2, 7, 11, 15], target = 9
```

---

## 💻 3. Native C++ Local CLI Engine

Because C++ compilation requires native compilation, StepDSA provides the lightweight CLI to compile and trace C++ with your machine's local `g++` compiler:

### Running C++ Solutions:
```bash
npx stepdsa run solution.cpp
```

### Supported C++ Example:
```cpp
// solution.cpp
#include <vector>
#include <string>
using namespace std;

class Solution {
public:
    vector<string> generateParenthesis(int n) {
        vector<string> res;
        auto dfs = [&](auto& self, int open, int close, string s) -> void {
            if (open == 0 && close == 0) {
                res.push_back(s);
                return;
            }
            if (open > 0) self(self, open - 1, close, s + "(");
            if (close > open) self(self, open, close - 1, s + ")");
        };
        dfs(dfs, n, n, "");
        return res;
    }
};
```

The CLI:
- Validates syntax using `g++ -std=c++17 -fsyntax-only`
- Captures Call Stack frames for recursive algorithms
- Compresses the timeline and auto-launches StepDSA with the **CallStackStage** view.

---

## 🛡️ Security & Privacy Guarantee

- **100% Client-Side:** Code execution runs exclusively on your local machine (browser sandbox or local terminal).
- **Zero Cloud Servers:** No source code or execution memory is ever sent to or stored on any remote server.
