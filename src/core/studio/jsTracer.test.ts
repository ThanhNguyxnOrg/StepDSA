import { describe, it, expect } from 'vitest';
import { traceJavaScriptExecution, parseTestcaseInput } from './jsTracer';

describe('parseTestcaseInput', () => {
  it('parses single integer input', () => {
    expect(parseTestcaseInput('3')).toEqual([3]);
    expect(parseTestcaseInput(4)).toEqual([4]);
  });

  it('parses array and target inputs', () => {
    expect(parseTestcaseInput('[2, 7, 11, 15], 9')).toEqual([[2, 7, 11, 15], 9]);
  });

  it('parses string input', () => {
    expect(parseTestcaseInput('"hello"')).toEqual(['hello']);
  });

  it('handles variable assignment format (e.g. n = 3)', () => {
    expect(parseTestcaseInput('n = 3')).toEqual([3]);
    expect(parseTestcaseInput('nums = [1, 2, 3], k = 2')).toEqual([[1, 2, 3], 2]);
  });
});

describe('traceJavaScriptExecution: Recursive LeetCode Functions', () => {
  it('traces generateParenthesis with Call Stack frames and variable mutations', () => {
    const code = `
      const generateParenthesis = n => {
        const res = [];
        const dfs = (O, C, s) => {
          if (!O && !C) {
            res.push(s);
            return;
          }
          if (O > 0) dfs(O - 1, C, s + "(");
          if (C > O) dfs(O, C - 1, s + ")");
        };
        dfs(n, n, "");
        return res;
      };
    `;

    const frames = traceJavaScriptExecution(code, '2');
    expect(frames.length).toBeGreaterThan(5);

    // Verify Call Stack is tracked
    const hasDfsCall = frames.some(f =>
      Array.isArray(f.callStack) && f.callStack.some(call => String(call).includes('dfs'))
    );
    expect(hasDfsCall).toBe(true);

    // Verify local variables are tracked
    const hasVars = frames.some(f => f.variables && ('O' in f.variables || 'open_count' in f.variables || 's' in f.variables));
    expect(hasVars).toBe(true);

    // Verify final frame mentions completion or return value
    const lastFrame = frames[frames.length - 1];
    expect(lastFrame.explanation.toLowerCase()).toContain('finish');
  });

  it('traces twoSum with Hash Map and array accesses', () => {
    const code = `
      var twoSum = function(nums, target) {
        const map = {};
        for (let i = 0; i < nums.length; i++) {
          const complement = target - nums[i];
          if (map[complement] !== undefined) {
            return [map[complement], i];
          }
          map[nums[i]] = i;
        }
        return [];
      };
    `;

    const frames = traceJavaScriptExecution(code, '[2, 7, 11, 15], 9');
    expect(frames.length).toBeGreaterThan(2);

    // Verify iteration variables like i or complement exist
    const hasIteration = frames.some(f => f.variables && ('i' in f.variables || 'complement' in f.variables));
    expect(hasIteration).toBe(true);
  });
});

describe('traceJavaScriptExecution: Procedural Array Sort', () => {
  it('traces in-place bubble sort', () => {
    const code = `
      const arr = [5, 2, 8];
      for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
          if (arr[j] > arr[j + 1]) {
            const temp = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = temp;
          }
        }
      }
    `;

    const frames = traceJavaScriptExecution(code, '');
    expect(frames.length).toBeGreaterThan(3);
    const hasSwap = frames.some(f => f.action === 'swap');
    expect(hasSwap).toBe(true);
  });
});
