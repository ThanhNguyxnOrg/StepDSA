import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface TwoPointersState {
  heights: number[];
  left: number;
  right: number;
  currentArea: number;
  maxArea: number;
  bestLeft: number;
  bestRight: number;
}

export const twoPointersModule: AlgorithmModule<number[], TwoPointersState> = {
  id: 'two-pointers-water',
  title: 'Two Pointers (Container With Most Water)',
  category: 'arrays-pointers',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Pointers meet in the middle after N - 1 steps',
  },
  theory: {
    overview:
      'Given an array of heights, find two vertical lines that together with the x-axis form a container holding the maximum amount of water. Area = min(height[left], height[right]) * (right - left).',
    whyItWorks:
      'Starting at the widest endpoints (0 and N-1), we shrink the width. The container height is limited by the shorter line, so moving the taller line inward could only decrease area. Moving the shorter line is the only way to potentially find a taller line.',
    invariant:
      'Any container involving the discarded shorter line with any inner boundary cannot exceed the current container area.',
    pitfalls: [
      'Moving the taller pointer inward, which is strictly suboptimal.',
      'Using quadratic O(N²) nested loops to check all pairs.',
    ],
  },
  codeSnippets: {
    python: `def max_area(height):
    left, right = 0, len(height) - 1
    max_water = 0
    while left < right:
        width = right - left
        h = min(height[left], height[right])
        max_water = max(max_water, width * h)
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    return max_water`,
    typescript: `function maxArea(height: number[]): number {
  let left = 0, right = height.length - 1;
  let maxWater = 0;
  while (left < right) {
    const width = right - left;
    const h = Math.min(height[left], height[right]);
    maxWater = Math.max(maxWater, width * h);
    if (height[left] < height[right]) {
      left++;
    } else {
      right--;
    }
  }
  return maxWater;
}`,
    cpp: `int maxArea(vector<int>& height) {
    int left = 0, right = height.size() - 1;
    int maxWater = 0;
    while (left < right) {
        int width = right - left;
        int h = min(height[left], height[right]);
        maxWater = max(maxWater, width * h);
        if (height[left] < height[right]) left++;
        else right--;
    }
    return maxWater;
}`,
    java: `public int maxArea(int[] height) {
    int left = 0, right = height.length - 1;
    int maxWater = 0;
    while (left < right) {
        int width = right - left;
        int h = Math.min(height[left], height[right]);
        maxWater = Math.max(maxWater, width * h);
        if (height[left] < height[right]) left++;
        else right--;
    }
    return maxWater;
}`,
    pseudocode: `function maxArea(height):
    left <- 0, right <- N - 1
    maxWater <- 0
    while left < right:
        area <- (right - left) * min(height[left], height[right])
        maxWater <- max(maxWater, area)
        if height[left] < height[right]: left <- left + 1
        else: right <- right - 1
    return maxWater`,
  },
  defaultInput: [1, 8, 6, 2, 5, 4, 8, 3, 7],
  presets: [
    { id: 'classic', label: 'Classic LeetCode 11', description: '[1, 8, 6, 2, 5, 4, 8, 3, 7]', data: [1, 8, 6, 2, 5, 4, 8, 3, 7] },
    { id: 'pyramid', label: 'Pyramid', description: '[1, 3, 5, 7, 6, 4, 2]', data: [1, 3, 5, 7, 6, 4, 2] },
    { id: 'plateau', label: 'Twin Towers', description: '[9, 1, 1, 1, 1, 1, 9]', data: [9, 1, 1, 1, 1, 1, 9] },
  ],
  generateTimeline: (input: number[]): ExecutionFrame<TwoPointersState>[] => {
    const frames: ExecutionFrame<TwoPointersState>[] = [];
    const heights = input;
    let left = 0;
    let right = heights.length - 1;
    let maxArea = 0;
    let bestLeft = 0;
    let bestRight = right;

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialize two pointers: left = 0 (height ${heights[left]}), right = ${right} (height ${heights[right]}).`,
      isMilestone: true,
      milestoneTitle: 'Pointers Initialized',
      soundCue: { type: 'start' },
      variables: { left, right, 'height[left]': heights[left], 'height[right]': heights[right], maxArea: 0 },
      callStack: [{ name: 'maxArea', params: { n: heights.length }, line: 2, isCurrent: true }],
      conditionEval: { expr: `left < right (${left} < ${right})`, result: left < right },
      state: {
        heights: [...heights],
        left,
        right,
        currentArea: 0,
        maxArea: 0,
        bestLeft,
        bestRight,
      },
    });

    while (left < right) {
      const width = right - left;
      const minH = Math.min(heights[left], heights[right]);
      const area = width * minH;
      const isNewMax = area > maxArea;

      if (isNewMax) {
        maxArea = area;
        bestLeft = left;
        bestRight = right;
      }

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 6,
        explanation: `Width = ${right} - ${left} = ${width}, height = min(${heights[left]}, ${heights[right]}) = ${minH}. Water area = ${area}. Max area = ${maxArea}.`,
        soundCue: { type: isNewMax ? 'swap' : 'compare' },
        isMilestone: isNewMax,
        milestoneTitle: isNewMax ? `New Max Area: ${maxArea}` : undefined,
        variables: { left, right, width, minH, area, maxArea, isNewMax },
        callStack: [{ name: 'calculateArea', params: { left, right, area }, line: 6, isCurrent: true }],
        conditionEval: { expr: `area > maxArea (${area} > ${maxArea})`, result: isNewMax },
        state: {
          heights: [...heights],
          left,
          right,
          currentArea: area,
          maxArea,
          bestLeft,
          bestRight,
        },
      });

      if (heights[left] < heights[right]) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 8,
          explanation: `height[left] (${heights[left]}) < height[right] (${heights[right]}): move left pointer inward (left = ${left + 1}).`,
          soundCue: { type: 'step' },
          variables: { 'h[left]': heights[left], 'h[right]': heights[right], advancing: 'left' },
          callStack: [{ name: 'advanceLeft', params: { newLeft: left + 1 }, line: 8, isCurrent: true }],
          conditionEval: { expr: `heights[left] < heights[right] (${heights[left]} < ${heights[right]})`, result: true },
          state: {
            heights: [...heights],
            left,
            right,
            currentArea: area,
            maxArea,
            bestLeft,
            bestRight,
          },
        });
        left++;
      } else {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 10,
          explanation: `height[left] (${heights[left]}) >= height[right] (${heights[right]}): move right pointer inward (right = ${right - 1}).`,
          soundCue: { type: 'step' },
          variables: { 'h[left]': heights[left], 'h[right]': heights[right], advancing: 'right' },
          callStack: [{ name: 'advanceRight', params: { newRight: right - 1 }, line: 10, isCurrent: true }],
          conditionEval: { expr: `heights[left] >= heights[right] (${heights[left]} >= ${heights[right]})`, result: true },
          state: {
            heights: [...heights],
            left,
            right,
            currentArea: area,
            maxArea,
            bestLeft,
            bestRight,
          },
        });
        right--;
      }
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 12,
      explanation: `Pointers met at index ${left}. Maximum water area found is ${maxArea} between indices [${bestLeft}, ${bestRight}].`,
      isMilestone: true,
      milestoneTitle: `Max Water Area: ${maxArea}`,
      soundCue: { type: 'complete' },
      variables: { maxArea, bestBounds: `[${bestLeft}, ${bestRight}]`, completed: true },
      callStack: [{ name: 'maxArea.done', params: { maxArea }, line: 12, isCurrent: true }],
      conditionEval: { expr: `left >= right (${left} >= ${right})`, result: true },
      state: {
        heights: [...heights],
        left,
        right,
        currentArea: 0,
        maxArea,
        bestLeft,
        bestRight,
      },
    });

    const total = frames.length;
    frames.forEach((f, idx) => {
      f.stepIndex = idx;
      f.totalSteps = total;
    });

    return frames;
  },
  renderStage: (frame: ExecutionFrame<TwoPointersState>) => {
    const { heights, left, right, currentArea, maxArea, bestLeft, bestRight } = frame.state;
    const maxVal = Math.max(...heights, 10);

    return (
      <div className="flex flex-col items-center justify-center p-6 w-full min-h-[380px] gap-6">
        {/* Metric Badges */}
        <div className="flex items-center gap-6 bg-slate-900/80 border border-slate-700 px-6 py-3 rounded-2xl">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-400">CURRENT AREA</span>
            <span className="text-xl font-bold font-mono text-sky-400">{currentArea}</span>
          </div>
          <div className="w-px h-8 bg-slate-700"></div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-400">MAX WATER AREA</span>
            <span className="text-xl font-bold font-mono text-emerald-400">{maxArea}</span>
          </div>
          <div className="w-px h-8 bg-slate-700"></div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-400">BEST BOUNDS</span>
            <span className="text-sm font-bold font-mono text-indigo-300">[{bestLeft} .. {bestRight}]</span>
          </div>
        </div>

        {/* Vertical Bars and Water Visualization */}
        <div className="relative flex items-end justify-center gap-3 h-52 px-6 pb-2 border-b-2 border-slate-600 w-full max-w-2xl">
          {heights.map((h, idx) => {
            const isLeft = left === idx;
            const isRight = right === idx;
            const inWindow = idx >= left && idx <= right;
            const heightPercent = Math.round((h / maxVal) * 100);

            let barBg = 'bg-slate-700 hover:bg-slate-600';
            if (isLeft || isRight) barBg = 'bg-amber-400 ring-2 ring-amber-300';
            else if (inWindow) barBg = 'bg-sky-600/80';

            return (
              <div key={idx} className="flex flex-col items-center flex-1 max-w-[42px] h-full justify-end">
                {/* Pointer Badge */}
                <div className="h-5 flex items-center justify-center">
                  {isLeft && <span className="bg-amber-500 text-slate-950 text-[9px] px-1 rounded font-mono font-bold">L</span>}
                  {isRight && <span className="bg-amber-500 text-slate-950 text-[9px] px-1 rounded font-mono font-bold">R</span>}
                </div>

                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t transition-all duration-200 flex items-center justify-center ${barBg}`}
                >
                  <span className="text-[11px] font-mono font-bold text-white mb-1 drop-shadow">{h}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 mt-1">[{idx}]</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
};
