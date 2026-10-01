import { describe, it, expect } from 'vitest';
import { traceArrayExecution } from './tracer';

describe('tracer: traceArrayExecution', () => {
  it('traces a basic bubble sort loop and generates comparison and swap frames', () => {
    const code = `
      for (let i = 0; i < input.length; i++) {
        for (let j = 0; j < input.length - i - 1; j++) {
          if (input[j] > input[j + 1]) {
            const temp = input[j];
            input[j] = input[j + 1];
            input[j + 1] = temp;
          }
        }
      }
    `;

    const rawInput = [4, 2, 5, 1];
    const frames = traceArrayExecution(code, rawInput);

    expect(frames.length).toBeGreaterThan(5);
    expect(frames[0].stepIndex).toBe(0);
    expect(frames[0].state.array).toBeDefined();

    // Check that we have swap frames
    const hasSwaps = frames.some(
      (f) => f.action === 'swap' || f.soundCue === 'swap' || f.explanation.includes('Swapped')
    );
    expect(hasSwaps).toBe(true);

    // Final state of array must be sorted
    const lastFrame = frames[frames.length - 1];
    const finalValues = lastFrame.state.array.map((el: any) => el.value);
    expect(finalValues).toEqual([1, 2, 4, 5]);
  });

  it('safely breaks infinite loops at maxSteps ceiling (default 500)', () => {
    const infiniteLoopCode = `
      let i = 0;
      while (true) {
        input[0] = input[0] + 1;
        i++;
      }
    `;

    const frames = traceArrayExecution(infiniteLoopCode, [10], { maxSteps: 100 });
    expect(frames.length).toBeLessThanOrEqual(105);
    const lastFrame = frames[frames.length - 1];
    expect(lastFrame.explanation).toContain('Safety limit reached');
  });

  it('populates debugger telemetry: variables, callStack, soundCue, and conditionEval', () => {
    const code = `
      function reverse(arr) {
        let left = 0, right = arr.length - 1;
        while (left < right) {
          let t = arr[left];
          arr[left] = arr[right];
          arr[right] = t;
          left++;
          right--;
        }
      }
      reverse(input);
    `;

    const frames = traceArrayExecution(code, [1, 2, 3]);
    expect(frames.length).toBeGreaterThan(0);

    const firstFrame = frames[0];
    expect(firstFrame.callStack).toBeDefined();
    expect(firstFrame.variables).toBeDefined();
    expect(firstFrame.soundCue).toBeDefined();
  });

  it('traces pure code with local const arr declaration without frontmatter', () => {
    const code = `
      function partition(arr, low, high) {
        const pivot = arr[high];
        let i = low - 1;
        for (let j = low; j < high; j++) {
          if (arr[j] <= pivot) {
            i++;
            const temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
          }
        }
        const temp = arr[i + 1]; arr[i + 1] = arr[high]; arr[high] = temp;
        return i + 1;
      }
      function quickSort(arr, low, high) {
        if (low < high) {
          const pi = partition(arr, low, high);
          quickSort(arr, low, pi - 1);
          quickSort(arr, pi + 1, high);
        }
      }
      const arr = [45, 12, 89, 34, 21, 70, 5, 60];
      quickSort(arr, 0, arr.length - 1);
    `;

    // Passing empty input so it extracts from code literal
    const frames = traceArrayExecution(code, []);
    expect(frames.length).toBeGreaterThan(20);
    const lastFrame = frames[frames.length - 1];
    const finalValues = lastFrame.state.array.map((el: any) => el.value);
    expect(finalValues).toEqual([5, 12, 21, 34, 45, 60, 70, 89]);
  });
});
