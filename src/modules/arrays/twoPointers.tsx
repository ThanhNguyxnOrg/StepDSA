import { AlgorithmModule, ExecutionFrame } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

export const twoPointersModule: AlgorithmModule<number[], ArrayStageState> = {
  id: 'two-pointers',
  title: 'Two Pointers (Container With Most Water)',
  category: 'arrays-pointers',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Strictly linear O(N) single pass',
  },
  theory: {
    overview:
      'Given an array representing vertical line heights, find two lines that together with the x-axis form a container holding the maximum water. The two-pointer technique starts at opposite boundaries and moves inward.',
    whyItWorks:
      'The width between pointers decreases monotonically with every step. The only way to find a container with greater area is to search for a taller line than the current limiting shorter boundary.',
    invariant:
      'Pruning Invariant: Moving the taller boundary could only reduce the width without any chance of increasing the limiting height. Therefore, discarding the shorter boundary eliminates no potential global optimum.',
    pitfalls: [
      'Naive brute-force checks all pairs in O(N²). Two pointers reduces this to O(N).',
      'Both pointers must start at the outermost bounds (0 and N-1) to preserve search completeness.',
    ],
  },
  presets: [
    { id: 'standard', label: 'Classic Heights', description: 'Standard interview example', data: [1, 8, 6, 2, 5, 4, 8, 3, 7] },
    { id: 'descending', label: 'Descending Heights', description: 'Shifting left pointer', data: [9, 8, 7, 6, 5, 4, 3, 2, 1] },
    { id: 'peaks', label: 'Twin Peaks', description: 'Two tall walls at center', data: [2, 3, 10, 5, 7, 10, 4, 2] },
  ],
  defaultInput: [1, 8, 6, 2, 5, 4, 8, 3, 7],
  codeSnippets: {
    python: `def max_area(heights):
    left = 0
    right = len(heights) - 1
    max_water = 0
    
    while left < right:
        width = right - left
        h = min(heights[left], heights[right])
        current_water = width * h
        max_water = max(max_water, current_water)
        
        if heights[left] < heights[right]:
            left += 1
        else:
            right -= 1
            
    return max_water`,
    typescript: `function maxArea(heights: number[]): number {
  let left = 0;
  let right = heights.length - 1;
  let maxWater = 0;

  while (left < right) {
    const width = right - left;
    const h = Math.min(heights[left], heights[right]);
    const currentWater = width * h;
    maxWater = Math.max(maxWater, currentWater);

    if (heights[left] < heights[right]) {
      left++;
    } else {
      right--;
    }
  }

  return maxWater;
}`,
    cpp: `int maxArea(vector<int>& heights) {
    int left = 0;
    int right = heights.size() - 1;
    int maxWater = 0;
    while (left < right) {
        int width = right - left;
        int h = min(heights[left], heights[right]);
        maxWater = max(maxWater, width * h);
        if (heights[left] < heights[right]) left++;
        else right--;
    }
    return maxWater;
}`,
    java: `public int maxArea(int[] heights) {
    int left = 0;
    int right = heights.length - 1;
    int maxWater = 0;
    while (left < right) {
        int width = right - left;
        int h = Math.min(heights[left], heights[right]);
        maxWater = Math.max(maxWater, width * h);
        if (heights[left] < heights[right]) left++;
        else right--;
    }
    return maxWater;
}`,
    pseudocode: `function maxArea(heights):
    left = 0
    right = length(heights) - 1
    maxWater = 0
    while left < right:
        width = right - left
        h = min(heights[left], heights[right])
        maxWater = max(maxWater, width * h)
        if heights[left] < heights[right]:
            left = left + 1
        else:
            right = right - 1
    return maxWater`,
  },

  generateTimeline: (input: number[]): ExecutionFrame<ArrayStageState>[] => {
    const frames: ExecutionFrame<ArrayStageState>[] = [];
    const heights = [...input];
    let left = 0;
    let right = heights.length - 1;
    let maxWater = 0;
    let bestLeft = 0;
    let bestRight = right;

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: `Initialized two pointers: left at index 0 (h=${heights[left]}), right at index ${right} (h=${heights[right]}).`,
      state: {
        array: heights.map((v, idx) => ({ id: idx, value: v, status: 'default' })),
        pointers: { left, right },
      },
    });

    while (left < right) {
      const width = right - left;
      const h = Math.min(heights[left], heights[right]);
      const currentWater = width * h;
      const isNewMax = currentWater > maxWater;

      if (isNewMax) {
        maxWater = currentWater;
        bestLeft = left;
        bestRight = right;
      }

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 7,
        explanation: `Width = ${width}, Limiting Height = min(${heights[left]}, ${heights[right]}) = ${h}. Current Area = ${width} × ${h} = ${currentWater}. ${
          isNewMax ? `🎉 New Maximum Area: ${maxWater}!` : `Current max remains ${maxWater}.`
        }`,
        invariantStatus: {
          label: `Max Water so far: ${maxWater} (between [${bestLeft}] and [${bestRight}])`,
          isValid: true,
        },
        isMilestone: isNewMax,
        milestoneTitle: isNewMax ? `New Max Area (${maxWater})` : undefined,
        state: {
          array: heights.map((v, idx) => ({
            id: idx,
            value: v,
            status: idx === left || idx === right ? 'comparing' : idx === bestLeft || idx === bestRight ? 'sorted' : 'default',
          })),
          pointers: { left, right },
        },
      });

      if (heights[left] < heights[right]) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 12,
          explanation: `height[left] (${heights[left]}) < height[right] (${heights[right]}). The left wall limits the container. Advancing left pointer inward to index ${left + 1}.`,
          state: {
            array: heights.map((v, idx) => ({
              id: idx,
              value: v,
              status: idx === left ? 'discarded' : 'default',
            })),
            pointers: { left, right },
          },
        });
        left++;
      } else {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 14,
          explanation: `height[right] (${heights[right]}) <= height[left] (${heights[left]}). The right wall limits the container. Advancing right pointer inward to index ${right - 1}.`,
          state: {
            array: heights.map((v, idx) => ({
              id: idx,
              value: v,
              status: idx === right ? 'discarded' : 'default',
            })),
            pointers: { left, right },
          },
        });
        right--;
      }
    }

    // Final result frame
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 17,
      explanation: `Pointers met at index ${left}. Maximum water container found with area ${maxWater} between index [${bestLeft}] (h=${heights[bestLeft]}) and [${bestRight}] (h=${heights[bestRight]}).`,
      isMilestone: true,
      milestoneTitle: `Global Optimum Found (${maxWater})`,
      state: {
        array: heights.map((v, idx) => ({
          id: idx,
          value: v,
          status: idx === bestLeft || idx === bestRight ? 'sorted' : 'discarded',
        })),
        pointers: { bestL: bestLeft, bestR: bestRight },
      },
    });

    const total = frames.length;
    return frames.map((f, i) => ({ ...f, stepIndex: i, totalSteps: total }));
  },

  renderStage: (frame, projection) => {
    return <ArrayStage state={frame.state} projection={projection} />;
  },
};
