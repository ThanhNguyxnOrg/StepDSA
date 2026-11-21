import { motion } from 'motion/react';
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
    const n = Math.max(heights.length, 1);
    const waterHeight = left < right ? Math.min(heights[left] ?? 0, heights[right] ?? 0) : 0;
    const waterPct = Math.round((waterHeight / maxVal) * 100);
    const waterLeftPct = ((left + 0.5) / n) * 100;
    const waterWidthPct = Math.max(0, ((right - left) / n) * 100);
    const widthSpan = Math.max(0, right - left);

    return (
      <div className="flex flex-col items-center justify-center p-4 sm:p-6 w-full min-h-[380px] gap-5 select-none">
        {/* Metric HUD + Exact Area Formula */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-5 bg-[#111827] border border-[#1F293D] px-5 py-2.5 rounded-2xl shadow-sm">
            <div className="flex flex-col items-center">
              <span className="text-[9.5px] font-mono text-slate-400 uppercase">Current Area</span>
              <span className="text-lg font-extrabold font-mono text-cyan-400 tabular-nums">{currentArea}</span>
            </div>
            <div className="w-px h-7 bg-[#1F293D]" />
            <div className="flex flex-col items-center">
              <span className="text-[9.5px] font-mono text-slate-400 uppercase">Max Water Area</span>
              <span className="text-lg font-extrabold font-mono text-emerald-400 tabular-nums">{maxArea}</span>
            </div>
            <div className="w-px h-7 bg-[#1F293D]" />
            <div className="flex flex-col items-center">
              <span className="text-[9.5px] font-mono text-slate-400 uppercase">Best Bounds</span>
              <span className="text-sm font-bold font-mono text-purple-400 tabular-nums">[{bestLeft} .. {bestRight}]</span>
            </div>
          </div>

          {left < right && (
            <div className="px-3 py-2 rounded-xl bg-[#111827] border border-[#1F293D] text-xs font-mono text-slate-300 tabular-nums">
              min({heights[left]}, {heights[right]}) × ({right} − {left}) ={' '}
              <strong className="text-cyan-400">
                {waterHeight} × {widthSpan} = {currentArea}
              </strong>
            </div>
          )}
        </div>

        {/* Vertical Container Walls + Live Trapped Water Fill Level */}
        <div className="w-full max-w-2xl px-4">
          <div className="relative h-56 flex items-end border-b-2 border-[#334155]">
            {/* Translucent Trapped Water Volume between L and R */}
            {left < right && waterPct > 0 && (
              <motion.div
                initial={false}
                animate={{
                  left: `${waterLeftPct}%`,
                  width: `${waterWidthPct}%`,
                  height: `${waterPct}%`,
                }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                style={{
                  backgroundColor: 'var(--sem-active-bg)',
                  borderColor: 'var(--sem-active-border)',
                }}
                className="absolute bottom-0 border-t-2 border-dashed pointer-events-none z-0 flex items-center justify-center"
              >
                <span
                  style={{ color: 'var(--sem-active-text)', backgroundColor: 'var(--theme-surface)' }}
                  className="px-2 py-0.5 rounded-md border border-[#1F293D] text-[10px] font-mono font-bold tabular-nums shadow-xs"
                >
                  Area = {currentArea}
                </span>
              </motion.div>
            )}

            {heights.map((h, idx) => {
              const isLeft = left === idx;
              const isRight = right === idx;
              const isWall = isLeft || isRight;
              const isShorterWall =
                isWall &&
                ((isLeft && heights[left] <= heights[right]) ||
                  (isRight && heights[right] < heights[left]));
              const heightPercent = Math.max(8, Math.round((h / maxVal) * 100));

              return (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-end flex-1 h-full px-1 relative z-10"
                >
                  {/* Value above wall */}
                  <span
                    className={`text-[10.5px] font-mono font-bold tabular-nums mb-1 ${
                      isWall ? 'text-amber-400' : 'text-slate-400'
                    }`}
                  >
                    {h}
                  </span>

                  {/* Container Wall Pillar */}
                  <motion.div
                    initial={false}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                    style={{
                      backgroundColor: isShorterWall
                        ? 'var(--sem-swapping-solid)'
                        : isWall
                        ? 'var(--sem-comparing-solid)'
                        : 'var(--sem-default-border)',
                    }}
                    className={`w-full max-w-[26px] rounded-t-md transition-colors ${
                      isWall ? 'shadow-md ring-2 ring-[#F59E0B]/40' : 'opacity-70'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Index & Pointer Track */}
          <div className="flex items-start pt-1.5">
            {heights.map((_, idx) => {
              const isLeft = left === idx;
              const isRight = right === idx;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-mono text-slate-500 tabular-nums">[{idx}]</span>
                  <div className="h-5 flex items-center justify-center gap-0.5">
                    {isLeft && (
                      <motion.span
                        layoutId="tp-left-ptr"
                        style={{
                          backgroundColor: 'var(--sem-active-solid)',
                          color: 'var(--sem-active-on-solid)',
                        }}
                        className="theme-solid-badge text-[9px] px-1.5 py-0.5 rounded font-mono font-bold"
                      >
                        L
                      </motion.span>
                    )}
                    {isRight && (
                      <motion.span
                        layoutId="tp-right-ptr"
                        style={{
                          backgroundColor: 'var(--sem-comparing-solid)',
                          color: 'var(--sem-comparing-on-solid)',
                        }}
                        className="theme-solid-badge text-[9px] px-1.5 py-0.5 rounded font-mono font-bold"
                      >
                        R
                      </motion.span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
};
