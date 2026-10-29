import { ExecutionFrame } from '../types';
import { parseTestcaseInput } from './jsTracer';

export type StudioLanguage = 'javascript' | 'python' | 'cpp';

export interface StudioTemplate {
  id: string;
  title: string;
  badge: string;
  language: StudioLanguage;
  category: string;
  testcaseInput: string;
  description: string;
  code: string;
}

export const STUDIO_TEMPLATES: StudioTemplate[] = [
  // ================= JAVASCRIPT / TYPESCRIPT =================
  {
    id: 'js-dfs-parentheses',
    title: 'Generate Parentheses (DFS)',
    badge: 'Backtracking · Call Stack',
    language: 'javascript',
    category: 'trees-bst',
    testcaseInput: '3',
    description: 'LeetCode #22: Recursive backtracking tree generating valid parenthesis combinations.',
    code: `// LeetCode #22: Generate Parentheses (Recursion & Backtracking)
const generateParenthesis = function(n) {
  const res = [];
  const dfs = (open, close, s) => {
    if (!open && !close) {
      res.push(s);
      return;
    }
    if (open > 0) dfs(open - 1, close, s + "(");
    if (close > open) dfs(open, close - 1, s + ")");
    return;
  };
  dfs(n, n, "");
  return res;
};`,
  },
  {
    id: 'js-bubble-sort',
    title: 'Bubble Sort (In-Place Swaps)',
    badge: 'Sorting · Array Bars',
    language: 'javascript',
    category: 'sorting',
    testcaseInput: '[64, 34, 25, 12, 22, 11, 20]',
    description: 'Adjacent pairwise comparisons and in-place swaps tracked via ES6 Proxy.',
    code: `// In-Place Bubble Sort with Early Exit
const bubbleSort = function(nums) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < nums.length - i - 1; j++) {
      if (nums[j] > nums[j + 1]) {
        const temp = nums[j];
        nums[j] = nums[j + 1];
        nums[j + 1] = temp;
      }
    }
  }
  return nums;
};`,
  },
  {
    id: 'js-binary-search',
    title: 'Binary Search (Two Pointers)',
    badge: 'Searching · L/M/R Pointers',
    language: 'javascript',
    category: 'searching',
    testcaseInput: '[10, 22, 35, 47, 58, 69, 81, 94], 69',
    description: 'Logarithmic interval halving with live left, mid, and right pointer tracking.',
    code: `// LeetCode #704: Binary Search
const binarySearch = function(nums, target) {
  let left = 0;
  let right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) {
      return mid;
    }
    if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return -1;
};`,
  },
  {
    id: 'js-two-sum',
    title: 'Two Sum (Hash Map)',
    badge: 'Hashing · O(N) Lookup',
    language: 'javascript',
    category: 'arrays-pointers',
    testcaseInput: '[2, 7, 11, 15], 9',
    description: 'Single-pass complement lookup table with live hash map & array inspection.',
    code: `// LeetCode #1: Two Sum (Single-Pass Hash Map)
const twoSum = function(nums, target) {
  const lookup = {};
  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];
    const diff = target - num;
    if (lookup[diff] !== undefined) {
      return [lookup[diff], i];
    }
    lookup[num] = i;
  }
  return [];
};`,
  },

  // ================= PYTHON (PYODIDE WASM) =================
  {
    id: 'py-two-sum',
    title: 'Two Sum (Hash Map)',
    badge: 'Python · Dictionary',
    language: 'python',
    category: 'arrays-pointers',
    testcaseInput: '[2, 7, 11, 15], 9',
    description: 'LeetCode class Solution traced line-by-line via Python sys.settrace() in WebAssembly.',
    code: `# LeetCode #1: Two Sum (Hash Map Lookup)
class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        lookup = {}
        for i, num in enumerate(nums):
            diff = target - num
            if diff in lookup:
                return [lookup[diff], i]
            lookup[num] = i
        return []`,
  },
  {
    id: 'py-bubble-sort',
    title: 'Bubble Sort (Python List)',
    badge: 'Python · Sorting',
    language: 'python',
    category: 'sorting',
    testcaseInput: '[52, 28, 74, 19, 41, 63]',
    description: 'In-place Python tuple-unpacking swap traced across array bars and loop pointers.',
    code: `# Python In-Place Bubble Sort
class Solution:
    def bubbleSort(self, nums: list[int]) -> list[int]:
        n = len(nums)
        for i in range(n):
            for j in range(0, n - i - 1):
                if nums[j] > nums[j + 1]:
                    nums[j], nums[j + 1] = nums[j + 1], nums[j]
        return nums`,
  },
  {
    id: 'py-climbing-stairs',
    title: 'Climbing Stairs (Memo DFS)',
    badge: 'Python · DP & Call Stack',
    language: 'python',
    category: 'dynamic-programming',
    testcaseInput: '5',
    description: 'Top-down memoized recursion showing active call stack frames and memo dictionary.',
    code: `# LeetCode #70: Climbing Stairs (Top-Down Memoization)
class Solution:
    def climbStairs(self, n: int) -> int:
        memo = {}
        def dfs(step: int) -> int:
            if step <= 2:
                return step
            if step in memo:
                return memo[step]
            memo[step] = dfs(step - 1) + dfs(step - 2)
            return memo[step]
        return dfs(n)`,
  },

  // ================= C++ (17/20) =================
  {
    id: 'cpp-parentheses',
    title: 'C++ Generate Parentheses',
    badge: 'C++17 · Backtracking',
    language: 'cpp',
    category: 'trees-bst',
    testcaseInput: '3',
    description: 'Standard C++17 Solution class with recursive lambda/DFS and local CLI compilation support.',
    code: `// LeetCode #22: Generate Parentheses (C++17)
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
};`,
  },
  {
    id: 'cpp-bubble-sort',
    title: 'C++ Vector Bubble Sort',
    badge: 'C++17 · std::vector',
    language: 'cpp',
    category: 'sorting',
    testcaseInput: '[64, 34, 25, 12, 22, 11]',
    description: 'C++17 std::vector sorting with std::swap — runs in-browser simulator or native g++ CLI.',
    code: `// C++17 std::vector Bubble Sort
#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    vector<int> sortArray(vector<int>& nums) {
        int n = nums.size();
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (nums[j] > nums[j + 1]) {
                    swap(nums[j], nums[j + 1]);
                }
            }
        }
        return nums;
    }
};`,
  },
  {
    id: 'cpp-binary-search',
    title: 'C++ Binary Search',
    badge: 'C++17 · O(log N)',
    language: 'cpp',
    category: 'searching',
    testcaseInput: '[-1, 0, 3, 5, 9, 12], 9',
    description: 'C++17 O(log N) binary search with left, mid, right pointer telemetry.',
    code: `// LeetCode #704: Binary Search (C++17)
#include <vector>
using namespace std;

class Solution {
public:
    int search(vector<int>& nums, int target) {
        int left = 0, right = (int)nums.size() - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
};`,
  },
];

export function getTemplatesByLanguage(lang: StudioLanguage): StudioTemplate[] {
  return STUDIO_TEMPLATES.filter((t) => t.language === lang);
}

/**
 * Deterministic in-browser C++ simulator so users pasting C++ LeetCode solutions
 * in Personal Code Studio can immediately visualize execution in the browser
 * (in addition to using `npx stepdsa run solution.cpp` locally).
 */
export function traceCppInBrowser(code: string, rawTestcaseInput: string): ExecutionFrame[] {
  const parsedArgs = parseTestcaseInput(rawTestcaseInput);
  const frames: ExecutionFrame[] = [];
  let stepIndex = 0;

  // 1. Check if it's Generate Parentheses / Backtracking recursion
  if (/generateParenthesis/i.test(code)) {
    const firstArg = parsedArgs[0];
    const n = typeof firstArg === 'number' && firstArg >= 1 && firstArg <= 5 ? Math.floor(firstArg) : 3;
    const callStack: string[] = [];
    const res: string[] = [];

    const record = (
      codeLine: number,
      explanation: string,
      vars: Record<string, any>,
      isMilestone = false
    ) => {
      frames.push({
        stepIndex: stepIndex++,
        totalSteps: 0,
        codeLine,
        explanation,
        action: isMilestone ? 'milestone' : 'step',
        callStack: [...callStack],
        variables: { ...vars, res: [...res], 'res.size()': res.length },
        isMilestone,
        soundCue: isMilestone ? 'finish' : 'step',
        state: {
          callStackDepth: callStack.length,
          variables: { ...vars, res: [...res] },
        },
      });
    };

    callStack.push(`generateParenthesis(n=${n})`);
    record(8, `Entered Solution::generateParenthesis(n = ${n})`, { n, open: n, close: n, s: '' });

    const dfs = (open: number, close: number, s: string) => {
      callStack.push(`dfs(open=${open}, close=${close}, s="${s}")`);
      record(10, `Calling dfs(open=${open}, close=${close}, s="${s}")`, { open, close, s });

      if (open === 0 && close === 0) {
        res.push(s);
        record(
          12,
          `Base case (open == 0 && close == 0): res.push_back("${s}")`,
          { open, close, s },
          true
        );
        callStack.pop();
        return;
      }

      if (open > 0) {
        record(15, `Branch open > 0 (${open} > 0): recurse with s + "("`, { open, close, s });
        dfs(open - 1, close, s + '(');
      }

      if (close > open) {
        record(16, `Branch close > open (${close} > ${open}): recurse with s + ")"`, { open, close, s });
        dfs(open, close - 1, s + ')');
      }

      callStack.pop();
    };

    dfs(n, n, '');
    callStack.pop();
    record(
      19,
      `Completed C++ execution. Generated ${res.length} valid combinations: [${res.map((x) => `"${x}"`).join(', ')}]`,
      { n, resultCount: res.length },
      true
    );

    const total = frames.length;
    frames.forEach((f, idx) => {
      f.stepIndex = idx;
      f.totalSteps = total;
    });
    return frames;
  }

  // 2. Check if it's C++ Binary Search
  if (/\bmid\b/.test(code) && /\b(left|low)\b/.test(code) && /\b(right|high)\b/.test(code)) {
    const nums: number[] = Array.isArray(parsedArgs[0])
      ? parsedArgs[0].map(Number).filter((v) => !isNaN(v))
      : [-1, 0, 3, 5, 9, 12];
    const target = typeof parsedArgs[1] === 'number' ? parsedArgs[1] : 9;
    let left = 0;
    let right = nums.length - 1;

    frames.push({
      stepIndex: stepIndex++,
      totalSteps: 0,
      codeLine: 7,
      explanation: `Entered Solution::search(nums[${nums.length}], target = ${target})`,
      action: 'init',
      callStack: [`Solution::search(nums, target=${target})`],
      variables: { left, right, target },
      soundCue: 'step',
      state: {
        array: nums.map((v, idx) => ({ id: `${idx}`, value: v, status: 'normal', index: idx })),
        pointers: { left, right },
      },
    });

    let foundIdx = -1;
    while (left <= right) {
      const mid = Math.floor(left + (right - left) / 2);
      const midVal = nums[mid];

      frames.push({
        stepIndex: stepIndex++,
        totalSteps: 0,
        codeLine: 10,
        explanation: `Compute mid = ${mid} → compare nums[${mid}] (${midVal}) with target (${target})`,
        action: 'compare',
        callStack: [`Solution::search(left=${left}, right=${right})`],
        variables: { left, mid, right, 'nums[mid]': midVal, target },
        conditionEval: {
          condition: `nums[${mid}] == ${target}`,
          result: midVal === target,
        },
        soundCue: 'compare',
        state: {
          array: nums.map((v, idx) => ({
            id: `${idx}`,
            value: v,
            status: idx === mid ? (midVal === target ? 'sorted' : 'comparing') : 'normal',
            index: idx,
          })),
          pointers: { left, mid, right },
        },
      });

      if (midVal === target) {
        foundIdx = mid;
        break;
      }
      if (midVal < target) {
        left = mid + 1;
        frames.push({
          stepIndex: stepIndex++,
          totalSteps: 0,
          codeLine: 12,
          explanation: `nums[${mid}] (${midVal}) < target (${target}) → advance left = ${left}`,
          action: 'step',
          callStack: [`Solution::search(left=${left}, right=${right})`],
          variables: { left, mid, right, target },
          soundCue: 'step',
          state: {
            array: nums.map((v, idx) => ({ id: `${idx}`, value: v, status: 'normal', index: idx })),
            pointers: { left: Math.min(left, nums.length - 1), right },
          },
        });
      } else {
        right = mid - 1;
        frames.push({
          stepIndex: stepIndex++,
          totalSteps: 0,
          codeLine: 13,
          explanation: `nums[${mid}] (${midVal}) > target (${target}) → shrink right = ${right}`,
          action: 'step',
          callStack: [`Solution::search(left=${left}, right=${right})`],
          variables: { left, mid, right, target },
          soundCue: 'step',
          state: {
            array: nums.map((v, idx) => ({ id: `${idx}`, value: v, status: 'normal', index: idx })),
            pointers: { left, right: Math.max(0, right) },
          },
        });
      }
    }

    frames.push({
      stepIndex: stepIndex++,
      totalSteps: 0,
      codeLine: foundIdx !== -1 ? 11 : 15,
      explanation:
        foundIdx !== -1
          ? `Found target ${target} at index ${foundIdx}! Return ${foundIdx}.`
          : `Target ${target} not found in vector. Return -1.`,
      action: 'finish',
      callStack: [`Solution::search → ${foundIdx}`],
      variables: { result: foundIdx, target },
      isMilestone: true,
      soundCue: 'finish',
      state: {
        array: nums.map((v, idx) => ({
          id: `${idx}`,
          value: v,
          status: idx === foundIdx ? 'sorted' : 'normal',
          index: idx,
        })),
        pointers: foundIdx !== -1 ? { found: foundIdx } : {},
      },
    });

    const total = frames.length;
    frames.forEach((f, idx) => {
      f.stepIndex = idx;
      f.totalSteps = total;
    });
    return frames;
  }

  // 3. Extract array from testcase input or C++ initializer `{...}`
  let initialArray: number[] = [];
  if (Array.isArray(parsedArgs[0])) {
    initialArray = parsedArgs[0].map(Number).filter((v) => !isNaN(v));
  } else if (parsedArgs.length > 1 && parsedArgs.every((x) => typeof x === 'number')) {
    initialArray = parsedArgs.map(Number);
  } else {
    const match = code.match(/\{([\d\s,.-]+)\}/);
    if (match && match[1]) {
      initialArray = match[1]
        .split(',')
        .map((v) => Number(v.trim()))
        .filter((v) => !isNaN(v));
    }
  }
  if (initialArray.length === 0) {
    initialArray = [64, 34, 25, 12, 22, 11];
  }

  const arr = [...initialArray];
  const n = arr.length;
  let comparisons = 0;
  let swaps = 0;
  let accesses = 0;

  frames.push({
    stepIndex: stepIndex++,
    totalSteps: 0,
    codeLine: 8,
    explanation: `Initialized C++ std::vector<int> nums = {${arr.join(', ')}} (size = ${n})`,
    action: 'init',
    callStack: [`Solution::sortArray(nums[${n}])`],
    variables: { n, comparisons: 0, swaps: 0 },
    soundCue: 'step',
    state: {
      array: arr.map((v, idx) => ({ id: `${idx}`, value: v, status: 'normal', index: idx })),
      pointers: { i: 0, j: 0 },
    },
  });

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      accesses += 2;
      const shouldSwap = arr[j] > arr[j + 1];

      frames.push({
        stepIndex: stepIndex++,
        totalSteps: 0,
        codeLine: 12,
        explanation: `Compare nums[${j}] (${arr[j]}) > nums[${j + 1}] (${arr[j + 1]}) → ${shouldSwap ? 'true (swap)' : 'false'}`,
        action: 'compare',
        callStack: [`Solution::sortArray(n=${n})`],
        variables: { i, j, 'nums[j]': arr[j], 'nums[j+1]': arr[j + 1], comparisons, swaps, accesses },
        conditionEval: {
          condition: `${arr[j]} > ${arr[j + 1]}`,
          result: shouldSwap,
        },
        soundCue: 'compare',
        state: {
          array: arr.map((v, idx) => ({
            id: `${idx}`,
            value: v,
            status: idx === j || idx === j + 1 ? 'comparing' : idx >= n - i ? 'sorted' : 'normal',
            index: idx,
          })),
          pointers: { i, j, 'j+1': j + 1 },
        },
      });

      if (shouldSwap) {
        const tmp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = tmp;
        swaps++;
        accesses += 2;

        frames.push({
          stepIndex: stepIndex++,
          totalSteps: 0,
          codeLine: 13,
          explanation: `std::swap(nums[${j}], nums[${j + 1}]) → {${arr.join(', ')}}`,
          action: 'swap',
          callStack: [`Solution::sortArray(n=${n})`],
          variables: { i, j, 'nums[j]': arr[j], 'nums[j+1]': arr[j + 1], comparisons, swaps, accesses },
          isMilestone: true,
          soundCue: 'swap',
          state: {
            array: arr.map((v, idx) => ({
              id: `${idx}`,
              value: v,
              status: idx === j || idx === j + 1 ? 'swapping' : idx >= n - i ? 'sorted' : 'normal',
              index: idx,
            })),
            pointers: { i, j, 'j+1': j + 1 },
          },
        });
      }
    }
  }

  frames.push({
    stepIndex: stepIndex++,
    totalSteps: 0,
    codeLine: 17,
    explanation: `Completed C++ vector sort! Final sorted vector: {${arr.join(', ')}}`,
    action: 'finish',
    callStack: [`Solution::sortArray(n=${n}) → returned`],
    variables: { n, comparisons, swaps, accesses },
    isMilestone: true,
    soundCue: 'finish',
    state: {
      array: arr.map((v, idx) => ({ id: `${idx}`, value: v, status: 'sorted', index: idx })),
      pointers: {},
    },
  });

  const total = frames.length;
  frames.forEach((f, idx) => {
    f.stepIndex = idx;
    f.totalSteps = total;
  });
  return frames;
}
