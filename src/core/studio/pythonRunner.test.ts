import { describe, it, expect, vi } from 'vitest';
import { generatePythonHarness, tracePythonExecution, isPyodideAvailable } from './pythonRunner';

describe('Python Runner & Tracing Harness', () => {
  it('generates python harness code containing sys.settrace and user code', () => {
    const userCode = `
class Solution:
    def twoSum(self, nums, target):
        lookup = {}
        for i, num in enumerate(nums):
            if target - num in lookup:
                return [lookup[target - num], i]
            lookup[num] = i
        return []
    `;
    const harness = generatePythonHarness(userCode, '[2, 7, 11, 15], 9');

    expect(harness).toContain('sys.settrace');
    expect(harness).toContain('class Solution:');
    expect(harness).toContain('twoSum');
    expect(harness).toContain('[2,7,11,15]');
  });

  it('traces python execution with mock Pyodide instance', async () => {
    const mockOutput = {
      frames: [
        {
          codeLine: 3,
          explanation: 'Call twoSum(): line 3',
          callStack: ['twoSum(line=3)'],
          variables: { target: 9 },
          array: [2, 7, 11, 15],
          depth: 1,
        },
        {
          codeLine: 5,
          explanation: 'Line twoSum(): line 5',
          callStack: ['twoSum(line=5)'],
          variables: { target: 9, i: 0, num: 2 },
          array: [2, 7, 11, 15],
          depth: 1,
        },
      ],
      result: '[0, 1]',
    };

    const mockPyodide = {
      runPythonAsync: vi.fn().mockResolvedValue(undefined),
      globals: {
        get: vi.fn().mockReturnValue(JSON.stringify(mockOutput)),
      },
    };

    const frames = await tracePythonExecution('code', '[2, 7, 11, 15], 9', {
      pyodideInstance: mockPyodide,
    });

    expect(frames.length).toBe(3); // 2 steps + 1 completion
    expect(frames[0].codeLine).toBe(3);
    expect(frames[0].callStack).toEqual(['twoSum(line=3)']);
    expect(frames[0].state.array).toEqual([2, 7, 11, 15]);
    expect(frames[2].explanation).toContain('Return value: [0, 1]');
  });

  it('handles execution errors gracefully', async () => {
    const failingPyodide = {
      runPythonAsync: vi.fn().mockRejectedValue(new Error('SyntaxError: invalid syntax')),
      globals: {
        get: vi.fn(),
      },
    };

    await expect(
      tracePythonExecution('bad code', '', { pyodideInstance: failingPyodide })
    ).rejects.toThrow(/Python Execution Error: SyntaxError/);
  });

  it('detects browser vs headless environment correctly', () => {
    // In Vitest jsdom, window exists
    expect(typeof isPyodideAvailable()).toBe('boolean');
  });
});
