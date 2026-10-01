import { describe, it, expect } from 'vitest';
import {
  classifyAlgorithmPattern,
  formatToTitleCase,
} from './classifier';

describe('classifier: formatToTitleCase', () => {
  it('converts camelCase to Title Case', () => {
    expect(formatToTitleCase('bubbleSort')).toBe('Bubble Sort');
    expect(formatToTitleCase('findKthLargestElement')).toBe('Find Kth Largest Element');
  });

  it('converts snake_case to Title Case', () => {
    expect(formatToTitleCase('quick_sort')).toBe('Quick Sort');
    expect(formatToTitleCase('valid_parentheses_check')).toBe('Valid Parentheses Check');
  });

  it('converts kebab-case to Title Case', () => {
    expect(formatToTitleCase('merge-sort')).toBe('Merge Sort');
  });
});

describe('classifier: classifyAlgorithmPattern', () => {
  it('detects Stack Bracket Matching pattern in LeetCode-style code', () => {
    const code = `
      char st[10000];
      int top = -1;
      class Solution {
      public:
          inline static char bracket_open(char c){
              switch (c){
                  case ')': return '(';
                  case '}': return '{';
                  case ']': return '[';
              }
              return 0;
          }
          static bool isValid(string& s) {
              top = -1;
              for (char c: s){
                  if (c == '(' || c == '{' || c == '[') st[++top] = c;
                  else if (top == -1 || st[top] != bracket_open(c)) return false;
                  else top--;
              }
              return top == -1;
          }
      };
    `;

    const result = classifyAlgorithmPattern(code);
    expect(result.title).toBe('Valid Parentheses (Stack)');
    expect(result.category).toBe('stack-queue');
    expect(result.stageHint).toBe('stack');
    expect(result.defaultInput).toBe('()[]{}');
    expect(result.confidence).toBe('high');
  });

  it('detects Binary Search pattern', () => {
    const code = `
      function binarySearch(arr, target) {
        let low = 0, high = arr.length - 1;
        while (low <= high) {
          const mid = Math.floor((low + high) / 2);
          if (arr[mid] === target) return mid;
          else if (arr[mid] < target) low = mid + 1;
          else high = mid - 1;
        }
        return -1;
      }
    `;

    const result = classifyAlgorithmPattern(code);
    expect(result.title).toBe('Binary Search');
    expect(result.category).toBe('searching');
    expect(result.stageHint).toBe('array');
    expect(Array.isArray(result.defaultInput)).toBe(true);
  });

  it('detects Bubble Sort / Adjacent Swaps pattern', () => {
    const code = `
      function customSort(nums) {
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
      }
    `;

    const result = classifyAlgorithmPattern(code);
    expect(result.title).toBe('Bubble Sort');
    expect(result.category).toBe('sorting');
    expect(result.stageHint).toBe('array');
    expect(result.defaultInput).toEqual([64, 34, 25, 12, 22, 11, 90]);
  });

  it('detects Two Pointers pattern', () => {
    const code = `
      function twoSum(numbers, target) {
        let left = 0, right = numbers.length - 1;
        while (left < right) {
          const sum = numbers[left] + numbers[right];
          if (sum === target) return [left, right];
          else if (sum < target) left++;
          else right--;
        }
        return [];
      }
    `;

    const result = classifyAlgorithmPattern(code);
    expect(result.title).toBe('Two Pointers');
    expect(result.category).toBe('arrays-pointers');
    expect(result.stageHint).toBe('array');
  });

  it('respects explicit title from frontmatter when provided', () => {
    const code = `function foo() {}`;
    const result = classifyAlgorithmPattern(code, 'Custom Monotonic Stack');
    expect(result.title).toBe('Custom Monotonic Stack');
  });

  it('detects Quick Sort Lomuto partition pattern and extracts array literal', () => {
    const code = `
      function partition(arr, low, high) {
        const pivot = arr[high];
        let i = low - 1;
        for (let j = low; j < high; j++) {
          if (arr[j] <= pivot) {
            i++;
            let temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
          }
        }
        return i + 1;
      }
      const arr = [45, 12, 89, 34, 21, 70, 5, 60];
    `;
    const result = classifyAlgorithmPattern(code);
    expect(result.title).toBe('Quick Sort (Lomuto Partition)');
    expect(result.category).toBe('sorting');
    expect(result.stageHint).toBe('array');
    expect(result.defaultInput).toEqual([45, 12, 89, 34, 21, 70, 5, 60]);
  });

  it('falls back to function name if no pattern matched', () => {
    const code = `function calculateGCD(a, b) { return b === 0 ? a : calculateGCD(b, a % b); }`;
    const result = classifyAlgorithmPattern(code);
    expect(result.title).toBe('Calculate GCD');
  });

  it('falls back to Custom Algorithm if no function name or pattern found', () => {
    const code = `let x = 10; x += 5;`;
    const result = classifyAlgorithmPattern(code);
    expect(result.title).toBe('Custom Algorithm');
    expect(result.confidence).toBe('fallback');
  });
});
