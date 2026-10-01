import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface HouseRobberInput {
  houses: number[];
}

export interface HouseRobberState {
  houses: number[];
  dp: number[];
  currentIndex: number;
  robbedIndices: number[];
  maxLoot: number;
  decisionText: string;
}

const defaultHouseInput: HouseRobberInput = {
  houses: [2, 7, 9, 3, 1],
};

export const houseRobberModule: AlgorithmModule<HouseRobberInput, HouseRobberState> = {
  id: 'house-robber',
  title: 'House Robber (Non-Adjacent Maximum Sum)',
  category: 'dynamic-programming',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(1) with two running variables (or O(N) for DP table)',
    worstCaseCondition: 'Single linear scan across all houses',
  },
  theory: {
    overview:
      'The House Robber problem (LeetCode 198) asks for the maximum sum of money you can rob tonight without robbing two adjacent houses (which automatically triggers the security alarm). It serves as the standard pedagogical introduction to non-adjacent 1D state transition dynamic programming.',
    whyItWorks:
      'Optimal Substructure: At house i, there are only two mutually exclusive decisions: (1) Do not rob house i: loot remains dp[i-1]. (2) Rob house i: you gain houses[i] plus optimal loot from non-adjacent houses up to dp[i-2]. Taking the maximum of both choices guarantees the global optimum.',
    invariant:
      'At step i, dp[i] holds the maximum possible loot obtained from examining the prefix houses[0 ... i].',
    pitfalls: [
      'Greedily picking the highest value house locks out both its neighbors, frequently leading to suboptimal total loot.',
      'Base cases must properly handle 1 house and 2 houses before the general transition loop.',
    ],
  },
  presets: [
    {
      id: 'leetcode-198',
      label: 'LeetCode 198 Standard',
      description: 'Houses [2, 7, 9, 3, 1] (Max loot = 12: houses 7 + 3 + ... or 2 + 9 + 1 = 12)',
      data: defaultHouseInput,
    },
    {
      id: 'alternating-high',
      label: 'Extremes at Ends',
      description: 'Houses [50, 1, 1, 50] (Max loot = 100: rob 0 and 3)',
      data: { houses: [50, 1, 1, 50] },
    },
    {
      id: 'staircase',
      label: 'Monotonic Values',
      description: 'Houses [1, 2, 3, 1] (Max loot = 4: rob 1 + 3)',
      data: { houses: [1, 2, 3, 1] },
    },
  ],
  defaultInput: defaultHouseInput,
  codeSnippets: {
    python: `def rob(nums):
    if not nums: return 0
    if len(nums) == 1: return nums[0]

    prev2, prev1 = nums[0], max(nums[0], nums[1])
    for x in nums[2:]:
        curr = max(prev1, prev2 + x)
        prev2, prev1 = prev1, curr
    return prev1`,
    typescript: `function rob(nums: number[]): number {
  if (nums.length === 0) return 0;
  if (nums.length === 1) return nums[0];

  const dp: number[] = new Array(nums.length);
  dp[0] = nums[0];
  dp[1] = Math.max(nums[0], nums[1]);

  for (let i = 2; i < nums.length; i++) {
    dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i]);
  }
  return dp[nums.length - 1];
}`,
    cpp: `int rob(vector<int>& nums) {
    if (nums.empty()) return 0;
    if (nums.size() == 1) return nums[0];
    int prev2 = nums[0], prev1 = max(nums[0], nums[1]);
    for (size_t i = 2; i < nums.size(); ++i) {
        int curr = max(prev1, prev2 + nums[i]);
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}`,
    java: `public int rob(int[] nums) {
    if (nums.length == 0) return 0;
    if (nums.length == 1) return nums[0];
    int[] dp = new int[nums.length];
    dp[0] = nums[0];
    dp[1] = Math.max(nums[0], nums[1]);
    for (int i = 2; i < nums.length; i++) {
        dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i]);
    }
    return dp[nums.length - 1];
}`,
    pseudocode: `function Rob(nums):
    dp[0] = nums[0]
    dp[1] = max(nums[0], nums[1])
    for i = 2 to length(nums) - 1:
        dp[i] = max(dp[i-1], dp[i-2] + nums[i])
    return dp[last]`,
  },

  generateTimeline: (input: HouseRobberInput): ExecutionFrame<HouseRobberState>[] => {
    const frames: ExecutionFrame<HouseRobberState>[] = [];
    const nums = input.houses;
    const n = nums.length;
    const dp = new Array(n).fill(0);

    dp[0] = nums[0];

    // Frame 0: Initial state & House 0 base case
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: `Initialized House Robber DP. Base Case 0: Only House 0 available ($${nums[0]}). The only choice is robbing House 0. dp[0] = $${dp[0]}.`,
      isMilestone: true,
      milestoneTitle: `Base Case dp[0] = $${nums[0]}`,
      soundCue: 'start',
      callStack: [
        { name: 'rob(nums)', params: { n, house: 0 }, line: 1, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { houseCount: n, i: 0, 'nums[0]': nums[0], 'dp[0]': dp[0] },
      conditionEval: { expr: 'i == 0', result: true },
      state: {
        houses: [...nums],
        dp: [...dp],
        currentIndex: 0,
        robbedIndices: [0],
        maxLoot: dp[0],
        decisionText: `Base Case: Rob House 0 ($${nums[0]})`,
      },
    });

    if (n > 1) {
      // Step: Inspect House 1 vs House 0
      const robFirst = nums[0] >= nums[1];
      dp[1] = Math.max(nums[0], nums[1]);

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 6,
        explanation: `Base Case 1: Evaluate House 1 ($${nums[1]}) vs House 0 ($${nums[0]}). Since adjacent houses cannot both be robbed, choose the richer one: max($${nums[0]}, $${nums[1]}) = $${dp[1]}.`,
        isMilestone: true,
        milestoneTitle: `Base Case dp[1] = $${dp[1]}`,
        soundCue: 'compare',
        callStack: [
          { name: 'rob(nums)', params: { i: 1 }, line: 6, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: { i: 1, 'nums[0]': nums[0], 'nums[1]': nums[1], 'dp[1]': dp[1] },
        conditionEval: { expr: `nums[0] (${nums[0]}) >= nums[1] (${nums[1]})`, result: robFirst },
        state: {
          houses: [...nums],
          dp: [...dp],
          currentIndex: 1,
          robbedIndices: robFirst ? [0] : [1],
          maxLoot: dp[1],
          decisionText: robFirst ? `Keep House 0 ($${nums[0]})` : `Switch to House 1 ($${nums[1]})`,
        },
      });
    }

    for (let i = 2; i < n; i++) {
      const skipLoot = dp[i - 1];
      const robLoot = dp[i - 2] + nums[i];
      const robThisHouse = robLoot > skipLoot;

      // Sub-frame 1: Evaluate Option A (Skip house i)
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 8,
        explanation: `House ${i} ($${nums[i]}) — Option A (Skip): If we skip house ${i}, total loot is carried over from dp[${i - 1}] = $${skipLoot}.`,
        soundCue: 'step',
        callStack: [
          { name: 'rob(nums)', params: { i, option: 'SKIP' }, line: 8, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: { i, 'nums[i]': nums[i], 'dp[i-1]': skipLoot, skipLoot },
        state: {
          houses: [...nums],
          dp: [...dp],
          currentIndex: i,
          robbedIndices: [],
          maxLoot: dp[i - 1],
          decisionText: `Evaluating Skip: $${skipLoot}`,
        },
      });

      // Sub-frame 2: Evaluate Option B (Rob house i)
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 8,
        explanation: `House ${i} ($${nums[i]}) — Option B (Rob): If we rob house ${i}, we must skip house ${i - 1} and add dp[${i - 2}] ($${dp[i - 2]} + $${nums[i]} = $${robLoot}).`,
        soundCue: 'compare',
        callStack: [
          { name: 'rob(nums)', params: { i, option: 'ROB' }, line: 8, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: { i, 'nums[i]': nums[i], 'dp[i-2]': dp[i - 2], robLoot },
        state: {
          houses: [...nums],
          dp: [...dp],
          currentIndex: i,
          robbedIndices: [],
          maxLoot: dp[i - 1],
          decisionText: `Evaluating Rob: $${dp[i - 2]} + $${nums[i]} = $${robLoot}`,
        },
      });

      // Sub-frame 3: Compare and finalize dp[i]
      dp[i] = Math.max(skipLoot, robLoot);
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 9,
        explanation: robThisHouse
          ? `House ${i} DECISION: Robbing ($${robLoot}) beats skipping ($${skipLoot})! dp[${i}] = $${dp[i]}.`
          : `House ${i} DECISION: Skipping ($${skipLoot}) exceeds robbing ($${robLoot}). dp[${i}] = $${dp[i]}.`,
        soundCue: robThisHouse ? 'swap' : 'step',
        isMilestone: true,
        milestoneTitle: `dp[${i}] = $${dp[i]}`,
        callStack: [
          { name: 'rob(nums)', params: { i, chosen: robThisHouse ? 'ROB' : 'SKIP' }, line: 9, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: {
          i,
          lootIfRobbed: robLoot,
          lootIfSkipped: skipLoot,
          'dp[i]': dp[i],
          decision: robThisHouse ? 'ROB' : 'SKIP',
        },
        conditionEval: {
          expr: `robLoot ($${robLoot}) > skipLoot ($${skipLoot})`,
          result: robThisHouse,
        },
        state: {
          houses: [...nums],
          dp: [...dp],
          currentIndex: i,
          robbedIndices: [],
          maxLoot: dp[i],
          decisionText: robThisHouse ? `ROB House ${i} (+$${nums[i]}) -> $${dp[i]}` : `SKIP House ${i} -> $${dp[i]}`,
        },
      });
    }

    // Step: Backtrack optimal path step-by-step
    const optimalRobbed: number[] = [];
    let idx = n - 1;
    while (idx >= 0) {
      if (idx === 0) {
        optimalRobbed.push(0);
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 11,
          explanation: `Backtracking: Reached House 0. Rob House 0 ($${nums[0]}).`,
          callStack: [{ name: 'backtrack()', params: { idx: 0 }, line: 11, isCurrent: true }],
          variables: { idx: 0, robHouse: 0, currentOptimal: [...optimalRobbed] },
          state: {
            houses: [...nums],
            dp: [...dp],
            currentIndex: 0,
            robbedIndices: [...optimalRobbed],
            maxLoot: dp[n - 1],
            decisionText: `Backtracked: Rob House 0`,
          },
        });
        break;
      } else if (idx === 1) {
        const pickOne = dp[1] === nums[1];
        const chosen = pickOne ? 1 : 0;
        optimalRobbed.push(chosen);
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 11,
          explanation: `Backtracking: At House 1. Rob House ${chosen} ($${nums[chosen]}).`,
          callStack: [{ name: 'backtrack()', params: { idx: 1, chosen }, line: 11, isCurrent: true }],
          variables: { idx: 1, chosen, currentOptimal: [...optimalRobbed] },
          state: {
            houses: [...nums],
            dp: [...dp],
            currentIndex: chosen,
            robbedIndices: [...optimalRobbed],
            maxLoot: dp[n - 1],
            decisionText: `Backtracked: Rob House ${chosen}`,
          },
        });
        break;
      } else {
        const wasRobbed = dp[idx] === dp[idx - 2] + nums[idx];
        if (wasRobbed) {
          optimalRobbed.push(idx);
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 11,
            explanation: `Backtracking: dp[${idx}] ($${dp[idx]}) == dp[${idx - 2}] ($${dp[idx - 2]}) + nums[${idx}] ($${nums[idx]}). House ${idx} was ROBBED! Jumping back to house ${idx - 2}.`,
            callStack: [{ name: 'backtrack()', params: { idx, wasRobbed: true }, line: 11, isCurrent: true }],
            variables: { idx, wasRobbed: true, jumpTo: idx - 2, currentOptimal: [...optimalRobbed] },
            conditionEval: { expr: `dp[${idx}] == dp[${idx - 2}] + nums[${idx}]`, result: true },
            state: {
              houses: [...nums],
              dp: [...dp],
              currentIndex: idx,
              robbedIndices: [...optimalRobbed],
              maxLoot: dp[n - 1],
              decisionText: `Backtracked: House ${idx} was ROBBED`,
            },
          });
          idx -= 2;
        } else {
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 11,
            explanation: `Backtracking: dp[${idx}] ($${dp[idx]}) == dp[${idx - 1}] ($${dp[idx - 1]}). House ${idx} was SKIPPED. Inspecting house ${idx - 1}.`,
            callStack: [{ name: 'backtrack()', params: { idx, wasRobbed: false }, line: 11, isCurrent: true }],
            variables: { idx, wasRobbed: false, jumpTo: idx - 1, currentOptimal: [...optimalRobbed] },
            conditionEval: { expr: `dp[${idx}] == dp[${idx - 2}] + nums[${idx}]`, result: false },
            state: {
              houses: [...nums],
              dp: [...dp],
              currentIndex: idx,
              robbedIndices: [...optimalRobbed],
              maxLoot: dp[n - 1],
              decisionText: `Backtracked: House ${idx} was SKIPPED`,
            },
          });
          idx -= 1;
        }
      }
    }
    optimalRobbed.reverse();

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 12,
      explanation: `🎉 House Robber complete! Maximum loot is $${dp[n - 1]} by robbing houses at indices: [${optimalRobbed.join(', ')}]. Non-adjacent security constraint satisfied!`,
      isMilestone: true,
      milestoneTitle: `Max Loot = $${dp[n - 1]}`,
      soundCue: 'complete',
      callStack: [
        { name: 'rob(nums)', params: { optimalLoot: dp[n - 1] }, line: 12, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { totalLoot: dp[n - 1], housesRobbed: optimalRobbed.join(', ') },
      state: {
        houses: [...nums],
        dp: [...dp],
        currentIndex: -1,
        robbedIndices: optimalRobbed,
        maxLoot: dp[n - 1],
        decisionText: `Rob houses [${optimalRobbed.join(', ')}] for total $${dp[n - 1]}`,
      },
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },

  renderStage: (frame: ExecutionFrame<HouseRobberState>) => {
    const { houses, dp, currentIndex, robbedIndices, maxLoot, decisionText } =
      frame.state;

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-6 select-none">
        {/* Top HUD */}
        <div className="flex items-center gap-4 mb-6">
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono shadow-md">
            Max Loot Secured: <span className="text-emerald-400 font-bold">${maxLoot}</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            {decisionText}
          </div>
        </div>

        {/* Houses along the Street */}
        <div className="flex items-end gap-3 overflow-x-auto p-4 max-w-4xl w-full justify-center">
          {houses.map((cash, idx) => {
            const isCurrent = idx === currentIndex;
            const isRobbed = robbedIndices.includes(idx);
            const dpVal = dp[idx];

            return (
              <div key={idx} className="flex flex-col items-center">
                {/* Roof & House Building */}
                <div className="flex flex-col items-center">
                  {/* Triangular Roof SVG */}
                  <div className="w-16 h-6 flex items-center justify-center">
                    <div
                      className={`w-0 h-0 border-l-[32px] border-l-transparent border-r-[32px] border-r-transparent border-b-[20px] transition-colors ${
                        isRobbed
                          ? 'border-b-emerald-500'
                          : isCurrent
                          ? 'border-b-amber-400'
                          : 'border-b-slate-700'
                      }`}
                    />
                  </div>

                  {/* House Base */}
                  <div
                    className={`w-16 h-20 rounded-b-xl flex flex-col items-center justify-center border-2 transition-all duration-300 shadow-xl ${
                      isRobbed
                        ? 'border-emerald-400 bg-emerald-950/80 ring-2 ring-emerald-400/40 scale-105'
                        : isCurrent
                        ? 'border-amber-400 bg-amber-950/60 ring-2 ring-amber-400/40 scale-105'
                        : 'border-slate-800 bg-slate-900/90 text-slate-300'
                    }`}
                  >
                    <span className="text-[10px] font-mono text-slate-500">#{idx}</span>
                    <span className="font-mono font-bold text-base text-amber-300">
                      ${cash}
                    </span>
                    {isRobbed && (
                      <span className="text-[9px] font-mono font-bold text-emerald-400 mt-1">
                        ROBBED
                      </span>
                    )}
                  </div>
                </div>

                {/* DP Value below house */}
                <div className="mt-2 text-[10px] font-mono text-slate-400">
                  dp[{idx}] = <span className="text-white font-bold">${dpVal}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
};
