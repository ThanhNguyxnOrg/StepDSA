import { motion } from 'motion/react';
import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface RainWaterState {
  heights: number[];
  water: number[];
  left: number;
  right: number;
  leftMax: number;
  rightMax: number;
  activeIdx: number | null;
  totalWater: number;
  addedHere: number;
}

const DEFAULT_HEIGHTS = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1];

export const trappingRainWaterModule: AlgorithmModule<number[], RainWaterState> = {
  id: 'trapping-rain-water',
  title: 'Trapping Rain Water (Two Pointers)',
  category: 'arrays-pointers',
  difficulty: 'Intermediate',
  defaultInput: DEFAULT_HEIGHTS,
  presets: [
    { id: 'rain-lc42', label: 'Classic LeetCode #42', description: 'Standard 12-bar elevation terrain trapping 6 units of water.', data: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] },
    { id: 'rain-basin', label: 'Deep Basin', description: 'Tall walls on both ends trapping 9 units of water in a deep basin.', data: [4, 2, 0, 3, 2, 5] },
    { id: 'rain-twin', label: 'Twin Valleys', description: 'Two separate basins separated by a central peak.', data: [3, 0, 2, 0, 4, 1, 0, 3] },
    { id: 'rain-slope', label: 'Monotonic Slope (0 Water)', description: 'Single mountain peak with no valley — traps 0 water.', data: [1, 2, 3, 4, 5, 4, 3, 2] },
  ],
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Each elevation index is visited once by either the left or right pointer.',
  },
  theory: {
    overview:
      'Water trapped above bar i equals max(0, min(maxLeft, maxRight) - height[i]). Instead of precomputing O(N) prefix/suffix max arrays, Two Pointers advance strictly from the side with the smaller wall because that side is guaranteed to be the bottleneck.',
    whyItWorks:
      'If height[left] <= height[right], the water at index left depends ONLY on leftMax (even without knowing unseen taller bars in the middle), because the right side already has a wall at least as tall!',
    invariant:
      'leftMax = max(height[0..left]) and rightMax = max(height[right..n-1]); every column processed from the shorter side has its final trapped water locked in.',
    pitfalls: [
      'Advancing the taller side instead of the shorter side breaks the bottleneck guarantee.',
      'Forgetting to check height[i] >= runningMax before subtracting can add negative water.',
    ],
  },
  relatedModules: [
    { id: 'two-pointers-water', label: 'Container With Most Water' },
    { id: 'monotonic-stack', label: 'Monotonic Stack' },
  ],
  codeSnippets: {
    pseudocode: `function trap(height):
  left = 0, right = n - 1
  leftMax = 0, rightMax = 0, total = 0
  while left < right:
    if height[left] <= height[right]:
      if height[left] >= leftMax:
        leftMax = height[left]
      else:
        total += leftMax - height[left]
      left = left + 1
    else:
      if height[right] >= rightMax:
        rightMax = height[right]
      else:
        total += rightMax - height[right]
      right = right - 1
  return total`,
    python: `def trap(height: list[int]) -> int:
    left, right = 0, len(height) - 1
    left_max = right_max = total = 0
    while left < right:
        if height[left] <= height[right]:
            if height[left] >= left_max:
                left_max = height[left]
            else:
                total += left_max - height[left]
            left += 1
        else:
            if height[right] >= right_max:
                right_max = height[right]
            else:
                total += right_max - height[right]
            right -= 1
    return total`,
    typescript: `function trap(height: number[]): number {
  let left = 0, right = height.length - 1;
  let leftMax = 0, rightMax = 0, total = 0;
  while (left < right) {
    if (height[left] <= height[right]) {
      if (height[left] >= leftMax) leftMax = height[left];
      else total += leftMax - height[left];
      left++;
    } else {
      if (height[right] >= rightMax) rightMax = height[right];
      else total += rightMax - height[right];
      right--;
    }
  }
  return total;
}`,
    cpp: `int trap(vector<int>& height) {
    int left = 0, right = (int)height.size() - 1;
    int leftMax = 0, rightMax = 0, total = 0;
    while (left < right) {
        if (height[left] <= height[right]) {
            if (height[left] >= leftMax) leftMax = height[left];
            else total += leftMax - height[left];
            left++;
        } else {
            if (height[right] >= rightMax) rightMax = height[right];
            else total += rightMax - height[right];
            right--;
        }
    }
    return total;
}`,
    java: `int trap(int[] height) {
    int left = 0, right = height.length - 1;
    int leftMax = 0, rightMax = 0, total = 0;
    while (left < right) {
        if (height[left] <= height[right]) {
            if (height[left] >= leftMax) leftMax = height[left];
            else total += leftMax - height[left];
            left++;
        } else {
            if (height[right] >= rightMax) rightMax = height[right];
            else total += rightMax - height[right];
            right--;
        }
    }
    return total;
}`,
  },
  generateTimeline: (input: number[]): ExecutionFrame<RainWaterState>[] => {
    const heights = Array.isArray(input) && input.length > 0
      ? input.map((v) => Math.max(0, Number(v) || 0)).slice(0, 16)
      : DEFAULT_HEIGHTS;
    const n = heights.length;
    const water = new Array<number>(n).fill(0);
    const frames: ExecutionFrame<RainWaterState>[] = [];

    let left = 0;
    let right = Math.max(0, n - 1);
    let leftMax = 0;
    let rightMax = 0;
    let totalWater = 0;
    let checkpointAdded = false;

    const push = (
      codeLine: number,
      explanation: string,
      opts: {
        action?: string;
        activeIdx?: number | null;
        addedHere?: number;
        soundCue?: ExecutionFrame['soundCue'];
        isMilestone?: boolean;
        milestoneTitle?: string;
        conditionEval?: ExecutionFrame['conditionEval'];
        pedagogy?: ExecutionFrame['pedagogy'];
        checkpoint?: ExecutionFrame['checkpoint'];
      } = {}
    ) => {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine,
        action: opts.action,
        explanation,
        soundCue: opts.soundCue,
        isMilestone: opts.isMilestone,
        milestoneTitle: opts.milestoneTitle,
        conditionEval: opts.conditionEval,
        pedagogy: opts.pedagogy,
        checkpoint: opts.checkpoint,
        invariantStatus: {
          label: `leftMax=${leftMax}, rightMax=${rightMax} · total=${totalWater}`,
          isValid: true,
        },
        callStack: [
          { name: 'trap(height)', params: { left, right, leftMax, rightMax, total: totalWater }, line: codeLine, isCurrent: true },
        ],
        variables: { left, right, leftMax, rightMax, total: totalWater, added: opts.addedHere ?? 0 },
        state: {
          heights: [...heights],
          water: [...water],
          left,
          right,
          leftMax,
          rightMax,
          activeIdx: opts.activeIdx ?? null,
          totalWater,
          addedHere: opts.addedHere ?? 0,
        },
      });
    };

    push(2, `Initialize left = 0, right = ${right}, leftMax = 0, rightMax = 0, total = 0.`, {
      action: 'init',
      soundCue: 'start',
      isMilestone: true,
      milestoneTitle: 'Start Two-Pointer Sweep',
      pedagogy: {
        what: `Place converging pointers at both ends of the ${n}-bar elevation terrain.`,
        why: 'Advancing the shorter side guarantees its running maximum is the true water ceiling.',
        whatNext: `Compare height[${left}]=${heights[left]} vs height[${right}]=${heights[right]}.`,
      },
    });

    while (left < right) {
      const goLeft = heights[left] <= heights[right];
      if (goLeft) {
        if (heights[left] >= leftMax) {
          leftMax = heights[left];
          push(7, `height[${left}] (${heights[left]}) >= leftMax → raise leftMax wall to ${leftMax}. No water trapped here.`, {
            action: 'pivot',
            activeIdx: left,
            soundCue: 'step',
            conditionEval: { expr: `height[${left}] (${heights[left]}) >= leftMax`, result: true },
            pedagogy: {
              what: `Updated leftMax boundary to ${leftMax} at index ${left}.`,
              why: 'A bar as tall or taller than all previous left bars forms a new retaining wall rather than a pocket.',
              whatNext: `Advance left pointer to ${left + 1}.`,
            },
          });
        } else {
          const trapped = leftMax - heights[left];
          const cp = !checkpointAdded
            ? {
                id: 'trapping-first-water',
                question: `At index ${left} (height=${heights[left]}), leftMax=${leftMax} and height[right]=${heights[right]} >= height[left]. How many units of water are trapped here?`,
                options: [
                  `${trapped} unit(s) (leftMax - height[${left}])`,
                  `${heights[left]} unit(s)`,
                  `0 units`,
                ],
                correctIndex: 0,
                explanation: `Since right has a wall at least as tall as left, the water ceiling is leftMax (${leftMax}), trapping ${leftMax} - ${heights[left]} = ${trapped} unit(s).`,
              }
            : undefined;
          if (cp) checkpointAdded = true;

          water[left] = trapped;
          totalWater += trapped;
          push(
            9,
            `Trapped +${trapped} water at index ${left}: leftMax (${leftMax}) - height[${left}] (${heights[left]}) = ${trapped}. Total = ${totalWater}.`,
            {
              action: 'found',
              activeIdx: left,
              addedHere: trapped,
              soundCue: 'success',
              isMilestone: trapped >= 2 || cp !== undefined,
              milestoneTitle: `Trap +${trapped} @ [${left}]`,
              conditionEval: { expr: `height[${left}] (${heights[left]}) < leftMax (${leftMax})`, result: true },
              checkpoint: cp,
              pedagogy: {
                what: `Filled column [${left}] with ${trapped} unit(s) of water up to leftMax = ${leftMax}.`,
                why: `Because height[right] >= height[left], the right side cannot leak below leftMax.`,
                whatNext: `Advance left pointer to ${left + 1}.`,
              },
            }
          );
        }
        left++;
      } else {
        if (heights[right] >= rightMax) {
          rightMax = heights[right];
          push(13, `height[${right}] (${heights[right]}) >= rightMax → raise rightMax wall to ${rightMax}. No water trapped here.`, {
            action: 'pivot',
            activeIdx: right,
            soundCue: 'step',
            conditionEval: { expr: `height[${right}] (${heights[right]}) >= rightMax`, result: true },
            pedagogy: {
              what: `Updated rightMax boundary to ${rightMax} at index ${right}.`,
              why: 'This bar becomes the new tallest retaining wall seen from the right.',
              whatNext: `Move right pointer inward to ${right - 1}.`,
            },
          });
        } else {
          const trapped = rightMax - heights[right];
          water[right] = trapped;
          totalWater += trapped;
          push(
            15,
            `Trapped +${trapped} water at index ${right}: rightMax (${rightMax}) - height[${right}] (${heights[right]}) = ${trapped}. Total = ${totalWater}.`,
            {
              action: 'found',
              activeIdx: right,
              addedHere: trapped,
              soundCue: 'success',
              isMilestone: trapped >= 2,
              milestoneTitle: `Trap +${trapped} @ [${right}]`,
              conditionEval: { expr: `height[${right}] (${heights[right]}) < rightMax (${rightMax})`, result: true },
              pedagogy: {
                what: `Filled column [${right}] with ${trapped} unit(s) of water up to rightMax = ${rightMax}.`,
                why: `Because height[left] > height[right], the left side holds back water at least up to rightMax.`,
                whatNext: `Move right pointer inward to ${right - 1}.`,
              },
            }
          );
        }
        right--;
      }
    }

    push(17, `Pointers met at index ${left}. Total trapped rain water = ${totalWater} unit(s)!`, {
      action: 'complete',
      activeIdx: left,
      soundCue: 'complete',
      isMilestone: true,
      milestoneTitle: `Total Water = ${totalWater}`,
      pedagogy: {
        what: `Completed the single O(N) pass with O(1) extra space; total trapped rain water is ${totalWater}.`,
        why: 'Every column was finalized once from the bottleneck side.',
        whatNext: 'Try the "Deep Basin" or "Monotonic Slope" presets to compare.',
      },
    });

    const total = frames.length;
    frames.forEach((f, i) => {
      f.stepIndex = i;
      f.totalSteps = total;
    });
    return frames;
  },
  renderStage: (frame: ExecutionFrame<RainWaterState>) => {
    const { heights, water, left, right, leftMax, rightMax, activeIdx, totalWater, addedHere } = frame.state;
    const maxH = Math.max(...heights.map((h, i) => h + (water[i] || 0)), 1);

    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 p-4 select-none">
        {/* Top Metrics Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#111827] border border-[#1F293D] px-4 py-2.5 shadow-sm font-mono text-xs">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-bold">
              L={left} (leftMax={leftMax})
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold">
              R={right} (rightMax={rightMax})
            </span>
          </div>
          <div className="flex items-center gap-2">
            {addedHere > 0 && (
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold">
                +{addedHere} trapped
              </span>
            )}
            <span
              style={{
                backgroundColor: 'var(--sem-active-solid)',
                color: 'var(--sem-active-on-solid)',
              }}
              className="theme-solid-badge px-2.5 py-0.5 rounded font-bold tabular-nums"
            >
              Total Water: {totalWater}
            </span>
          </div>
        </div>

        {/* Elevation Terrain + Live Trapped Water Columns */}
        <div className="rounded-xl bg-[#111827] border border-[#1F293D] p-5 shadow-sm">
          <div className="flex items-end justify-center gap-1.5 sm:gap-2 h-[220px] pt-8 pb-2 border-b-2 border-[#334155]">
            {heights.map((h, idx) => {
              const w = water[idx] || 0;
              const isActive = idx === activeIdx;
              const barPx = Math.round((h / maxH) * 165);
              const waterPx = Math.round((w / maxH) * 165);

              return (
                <div key={idx} className="flex-1 max-w-[54px] h-full flex flex-col justify-end items-center relative">
                  {/* Trapped Water Block stacked cleanly atop terrain bar */}
                  {w > 0 && (
                    <motion.div
                      initial={false}
                      animate={{ height: Math.max(18, waterPx), opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                      style={{
                        height: Math.max(18, waterPx),
                        backgroundColor: 'var(--sem-active-bg)',
                        borderColor: 'var(--sem-active-border)',
                        color: 'var(--sem-active-text)',
                      }}
                      className="w-full border-x-2 border-t-2 rounded-t flex items-center justify-center font-mono text-[10px] font-bold"
                    >
                      +{w}
                    </motion.div>
                  )}

                  {/* Solid Elevation Terrain Bar */}
                  <div
                    style={{
                      height: Math.max(h > 0 ? 18 : 4, barPx),
                      backgroundColor: isActive
                        ? 'var(--sem-comparing-bg)'
                        : 'var(--sem-default-bg)',
                      borderColor: isActive
                        ? 'var(--sem-comparing-border)'
                        : 'var(--sem-default-border)',
                      color: isActive
                        ? 'var(--sem-comparing-text)'
                        : 'var(--sem-default-text)',
                    }}
                    className={`w-full border-2 ${w > 0 ? 'rounded-none' : 'rounded-t'} flex items-end justify-center pb-1 font-mono text-[11px] font-bold transition-colors`}
                  >
                    {h > 0 ? h : ''}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Index & Pointer Row */}
          <div className="flex items-start justify-center gap-1.5 sm:gap-2 mt-1.5">
            {heights.map((_, idx) => {
              const isL = idx === left;
              const isR = idx === right;
              return (
                <div key={idx} className="flex-1 max-w-[54px] flex flex-col items-center gap-1 font-mono">
                  <span className="text-[10px] text-slate-400 tabular-nums">[{idx}]</span>
                  <div className="flex items-center justify-center gap-0.5 min-h-[18px]">
                    {isL && (
                      <span
                        style={{
                          backgroundColor: 'var(--sem-active-solid)',
                          color: 'var(--sem-active-on-solid)',
                        }}
                        className="theme-solid-badge px-1.5 py-0.2 rounded text-[9px] font-bold"
                      >
                        L
                      </span>
                    )}
                    {isR && (
                      <span
                        style={{
                          backgroundColor: 'var(--sem-comparing-solid)',
                          color: 'var(--sem-comparing-on-solid)',
                        }}
                        className="theme-solid-badge px-1.5 py-0.2 rounded text-[9px] font-bold"
                      >
                        R
                      </span>
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
