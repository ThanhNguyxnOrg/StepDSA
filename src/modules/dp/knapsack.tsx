import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface KnapsackItem {
  id: number;
  name: string;
  weight: number;
  value: number;
}

export interface KnapsackInput {
  capacity: number;
  items: KnapsackItem[];
}

export interface KnapsackState {
  items: KnapsackItem[];
  capacity: number;
  dpTable: number[][]; // [items + 1][capacity + 1]
  currentItemIndex: number; // 1-based (0 is row 0)
  currentWeight: number;
  activeDependencies?: {
    excludeCell?: [number, number]; // [row, col]
    includeCell?: [number, number];
  };
  decision?: 'include' | 'exclude' | 'skip-too-heavy';
  chosenItems?: number[]; // item ids included in final solution
}

const defaultKnapsackInput: KnapsackInput = {
  capacity: 7,
  items: [
    { id: 1, name: 'Gem', weight: 1, value: 1 },
    { id: 2, name: 'Vase', weight: 3, value: 4 },
    { id: 3, name: 'Book', weight: 4, value: 5 },
    { id: 4, name: 'Gold', weight: 5, value: 7 },
  ],
};

export const knapsackModule: AlgorithmModule<KnapsackInput, KnapsackState> = {
  id: 'knapsack-01',
  title: '0/1 Knapsack Problem (Dynamic Programming Table)',
  category: 'dynamic-programming',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N × W)',
    timeAverage: 'O(N × W)',
    timeWorst: 'O(N × W)',
    spaceAuxiliary: 'O(N × W)',
    worstCaseCondition: 'Pseudo-polynomial time dependent on capacity W',
  },
  theory: {
    overview:
      'Given weights and values of N items, put these items in a knapsack of capacity W to get the maximum total value. Each item can either be taken (1) or left behind (0).',
    whyItWorks:
      'Optimal Substructure: The optimal solution for capacity w either includes item i (gaining its value and solving for w - weight[i]) or excludes item i (inheriting the optimal solution of the first i-1 items at capacity w).',
    invariant:
      'DP Invariant: dp[i][w] holds the exact global maximum value attainable using any subset of the first i items fitting within capacity w.',
    pitfalls: [
      'Forgetting that 0/1 knapsack items cannot be split (fractional knapsack requires Greedy, not DP).',
      'Confusing 0-based item indexing with 1-based DP table rows.',
      'Space optimization: 2D table can be compressed to a 1D array by iterating weights backwards.',
    ],
  },
  presets: [
    {
      id: 'classic-4-items',
      label: 'Classic 4 Items (W=7)',
      description: 'Standard textbook problem demonstrating include vs exclude decisions',
      data: defaultKnapsackInput,
    },
    {
      id: 'heavy-items',
      label: 'Heavy vs High Value (W=8)',
      description: 'Trade-off between one heavy high-value item vs multiple small items',
      data: {
        capacity: 8,
        items: [
          { id: 1, name: 'Coin', weight: 2, value: 3 },
          { id: 2, name: 'Relic', weight: 3, value: 4 },
          { id: 3, name: 'Sword', weight: 4, value: 5 },
          { id: 4, name: 'Armor', weight: 5, value: 6 },
        ],
      },
    },
  ],
  defaultInput: defaultKnapsackInput,
  codeSnippets: {
    cpp: `int knapsack(int W, vector<int>& wt, vector<int>& val, int n) {
    vector<vector<int>> dp(n + 1, vector<int>(W + 1, 0));

    for (int i = 1; i <= n; i++) {
        for (int w = 1; w <= W; w++) {
            if (wt[i - 1] <= w) {
                dp[i][w] = max(dp[i - 1][w], val[i - 1] + dp[i - 1][w - wt[i - 1]]);
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }
    return dp[n][W];
}`,
    python: `def knapsack(W, wt, val, n):
    dp = [[0] * (W + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        for w in range(1, W + 1):
            if wt[i - 1] <= w:
                dp[i][w] = max(dp[i - 1][w], val[i - 1] + dp[i - 1][w - wt[i - 1]])
            else:
                dp[i][w] = dp[i - 1][w]

    return dp[n][W]`,
    typescript: `function knapsack(W: number, wt: number[], val: number[], n: number): number {
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let w = 1; w <= W; w++) {
      if (wt[i - 1] <= w) {
        dp[i][w] = Math.max(dp[i - 1][w], val[i - 1] + dp[i - 1][w - wt[i - 1]]);
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }
  return dp[n][W];
}`,
    java: `public int knapsack(int W, int[] wt, int[] val, int n) {
    int[][] dp = new int[n + 1][W + 1];

    for (int i = 1; i <= n; i++) {
        for (int w = 1; w <= W; w++) {
            if (wt[i - 1] <= w) {
                dp[i][w] = Math.max(dp[i - 1][w], val[i - 1] + dp[i - 1][w - wt[i - 1]]);
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }
    return dp[n][W];
}`,
    pseudocode: `function knapsack(W, wt, val, n):
    initialize dp[0..n][0..W] = 0

    for i = 1 to n:
        for w = 1 to W:
            if wt[i-1] <= w:
                dp[i][w] = max(dp[i-1][w], val[i-1] + dp[i-1][w - wt[i-1]])
            else:
                dp[i][w] = dp[i-1][w]

    return dp[n][W]`,
  },

  generateTimeline: (input: KnapsackInput): ExecutionFrame<KnapsackState>[] => {
    const { capacity: W, items } = input;
    const n = items.length;
    const frames: ExecutionFrame<KnapsackState>[] = [];

    // Initialize (n+1) x (W+1) table
    const dp: number[][] = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));

    // Frame 0: Base cases
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialized DP table of size (${n + 1} × ${W + 1}). Row 0 (0 items) and Col 0 (0 capacity) are 0.`,
      variables: { itemsCount: n, capacity: W, dpSize: `${n + 1}×${W + 1}` },
      invariantStatus: {
        label: 'Base Case: dp[0][w] = 0, dp[i][0] = 0',
        isValid: true,
      },
      state: {
        items,
        capacity: W,
        dpTable: dp.map((row) => [...row]),
        currentItemIndex: 0,
        currentWeight: 0,
      },
    });

    for (let i = 1; i <= n; i++) {
      const item = items[i - 1];

      for (let w = 1; w <= W; w++) {
        const canTake = item.weight <= w;

        if (canTake) {
          const excludeVal = dp[i - 1][w];
          const includeVal = item.value + dp[i - 1][w - item.weight];
          const willInclude = includeVal > excludeVal;
          dp[i][w] = Math.max(excludeVal, includeVal);

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 7,
            explanation: willInclude
              ? `Evaluating '${item.name}' (wt:${item.weight}, val:${item.value}) at capacity ${w}: Include (${item.value} + dp[${i - 1}][${w - item.weight}] = ${includeVal}) > Exclude (${excludeVal}). Chose INCLUDE! dp[${i}][${w}] = ${includeVal}.`
              : `Evaluating '${item.name}' (wt:${item.weight}, val:${item.value}) at capacity ${w}: Exclude (${excludeVal}) >= Include (${includeVal}). Chose EXCLUDE. dp[${i}][${w}] = ${excludeVal}.`,
            variables: {
              item: item.name,
              itemWeight: item.weight,
              itemValue: item.value,
              w,
              exclude: excludeVal,
              include: includeVal,
              maxVal: dp[i][w],
            },
            isMilestone: willInclude,
            milestoneTitle: willInclude ? `Include ${item.name} at W=${w}` : undefined,
            invariantStatus: {
              label: `dp[${i}][${w}] = max(${excludeVal}, ${includeVal}) = ${dp[i][w]}`,
              isValid: true,
            },
            state: {
              items,
              capacity: W,
              dpTable: dp.map((row) => [...row]),
              currentItemIndex: i,
              currentWeight: w,
              activeDependencies: {
                excludeCell: [i - 1, w],
                includeCell: [i - 1, w - item.weight],
              },
              decision: willInclude ? 'include' : 'exclude',
            },
          });
        } else {
          dp[i][w] = dp[i - 1][w];

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 9,
            explanation: `'${item.name}' weight (${item.weight}) > current capacity ${w}. Cannot fit! Inherit value from row above: dp[${i}][${w}] = dp[${i - 1}][${w}] = ${dp[i][w]}.`,
            variables: {
              item: item.name,
              itemWeight: item.weight,
              w,
              decision: 'SKIP (Too heavy)',
              dpVal: dp[i][w],
            },
            invariantStatus: {
              label: `Item weight ${item.weight} > capacity ${w}`,
              isValid: true,
            },
            state: {
              items,
              capacity: W,
              dpTable: dp.map((row) => [...row]),
              currentItemIndex: i,
              currentWeight: w,
              activeDependencies: {
                excludeCell: [i - 1, w],
              },
              decision: 'skip-too-heavy',
            },
          });
        }
      }
    }

    // Backtrack to find chosen items
    let curW = W;
    const chosen: number[] = [];
    for (let i = n; i > 0; i--) {
      if (dp[i][curW] !== dp[i - 1][curW]) {
        chosen.push(items[i - 1].id);
        curW -= items[i - 1].weight;
      }
    }

    // Final result frame
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 12,
      isMilestone: true,
      milestoneTitle: `Max Value = ${dp[n][W]}`,
      explanation: `Knapsack DP completed! Maximum obtainable value = ${dp[n][W]}. Items selected: ${chosen
        .map((id) => items.find((it) => it.id === id)?.name)
        .join(', ')}.`,
      variables: { maxPossibleValue: dp[n][W], chosenCount: chosen.length, status: 'OPTIMAL' },
      invariantStatus: {
        label: `Global Optimal Solution Found: Value = ${dp[n][W]}`,
        isValid: true,
      },
      state: {
        items,
        capacity: W,
        dpTable: dp.map((row) => [...row]),
        currentItemIndex: n,
        currentWeight: W,
        chosenItems: chosen,
      },
    });

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<KnapsackState>) => {
    const { items, capacity, dpTable, currentItemIndex, currentWeight, activeDependencies, decision, chosenItems } =
      frame.state;

    const activeItem = currentItemIndex > 0 ? items[currentItemIndex - 1] : null;
    const excludeDepVal =
      activeDependencies?.excludeCell &&
      dpTable[activeDependencies.excludeCell[0]]?.[activeDependencies.excludeCell[1]];
    const includeDepVal =
      activeDependencies?.includeCell &&
      dpTable[activeDependencies.includeCell[0]]?.[activeDependencies.includeCell[1]];
    const currentCellVal = dpTable[currentItemIndex]?.[currentWeight];

    return (
      <div className="w-full flex-1 flex flex-col lg:flex-row items-center lg:items-start justify-center p-3 gap-3.5 max-w-5xl mx-auto overflow-x-auto min-h-[340px]">
        {/* DP Table + Live Evaluated Recurrence Bar */}
        <div className="bg-[#111827]/90 border border-[#1F293D] rounded-2xl p-3.5 shadow-lg flex-1 min-w-[320px] max-w-full overflow-x-auto">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2.5">
            <span className="font-semibold text-white">
              2D DP Table (Items × Capacity)
            </span>
            <span className="font-mono text-[11px] text-cyan-300 bg-[#0B0F19] px-2 py-0.5 rounded border border-[#1F293D] tabular-nums">
              Focus: dp[{currentItemIndex}][{currentWeight}] = {currentCellVal ?? 0}
            </span>
          </div>

          {/* Live Evaluated Recurrence Equation Strip */}
          {activeItem && currentItemIndex > 0 && currentWeight > 0 && (
            <div className="mb-3 px-3 py-2 rounded-xl bg-[#0B0F19] border border-[#1F293D] font-mono text-[11px] flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-amber-300 font-bold">
                  dp[{currentItemIndex}][{currentWeight}]
                </span>
                <span className="text-slate-500">=</span>
                {activeDependencies?.includeCell ? (
                  <>
                    <span className="text-slate-400">max(</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#06B6D4]/15 border border-[#06B6D4]/40 text-cyan-300">
                      Excl dp[{activeDependencies.excludeCell?.[0]}][{activeDependencies.excludeCell?.[1]}]={excludeDepVal}
                    </span>
                    <span className="text-slate-500">,</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#10B981]/15 border border-[#10B981]/40 text-emerald-300">
                      Incl {activeItem.value}+dp[{activeDependencies.includeCell[0]}][{activeDependencies.includeCell[1]}]={activeItem.value + (includeDepVal ?? 0)}
                    </span>
                    <span className="text-slate-400">)</span>
                  </>
                ) : (
                  <span className="px-1.5 py-0.5 rounded bg-[#06B6D4]/15 border border-[#06B6D4]/40 text-cyan-300">
                    Inherit dp[{currentItemIndex - 1}][{currentWeight}] = {excludeDepVal} (wt {activeItem.weight} &gt; W {currentWeight})
                  </span>
                )}
              </div>
              <span
                className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                  decision === 'include'
                    ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                {decision === 'include' ? 'Take Item' : decision === 'exclude' ? 'Skip (Exclude >=)' : 'Too Heavy'}
              </span>
            </div>
          )}

          <table className="w-full border-collapse font-mono text-xs tabular-nums">
            <thead>
              <tr>
                <th className="p-1.5 text-slate-400 border-b border-r border-[#1F293D] bg-[#1F2937]/30 text-left min-w-[70px]">
                  Item / W
                </th>
                {Array.from({ length: capacity + 1 }).map((_, w) => (
                  <th
                    key={w}
                    className={`p-1.5 text-center border-b border-[#1F293D] transition-colors ${
                      w === currentWeight
                        ? 'bg-[#06B6D4]/20 text-[#06B6D4] font-bold'
                        : 'text-slate-400 font-medium'
                    }`}
                  >
                    {w}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dpTable.map((row, i) => {
                const item = i > 0 ? items[i - 1] : null;
                const isCurrentRow = i === currentItemIndex;

                return (
                  <tr key={i} className={isCurrentRow ? 'bg-[#1F2937]/40' : ''}>
                    {/* Row header */}
                    <td className="p-1.5 border-r border-b border-[#1F293D] text-slate-300 font-medium text-[11px] whitespace-nowrap">
                      {i === 0 ? (
                        <span className="text-slate-500">0 (Base)</span>
                      ) : (
                        <span>
                          {item?.name} <span className="text-slate-500 text-[10px]">({item?.weight}w, {item?.value}v)</span>
                        </span>
                      )}
                    </td>

                    {/* Matrix Cells */}
                    {row.map((val, w) => {
                      const isCurrentCell = i === currentItemIndex && w === currentWeight;
                      const isExcludeDep =
                        activeDependencies?.excludeCell &&
                        activeDependencies.excludeCell[0] === i &&
                        activeDependencies.excludeCell[1] === w;
                      const isIncludeDep =
                        activeDependencies?.includeCell &&
                        activeDependencies.includeCell[0] === i &&
                        activeDependencies.includeCell[1] === w;

                      let cellStyle = 'bg-[#111827]/40 text-slate-300 border-[#1F293D]/60';

                      if (isCurrentCell) {
                        cellStyle =
                          decision === 'include'
                            ? 'bg-[#10B981]/25 text-[#10B981] font-bold border-[#10B981] ring-2 ring-[#10B981]/60'
                            : decision === 'exclude'
                            ? 'bg-[#06B6D4]/25 text-[#06B6D4] font-bold border-[#06B6D4] ring-2 ring-[#06B6D4]/60'
                            : 'bg-[#F59E0B]/25 text-[#F59E0B] font-bold border-[#F59E0B] ring-2 ring-[#F59E0B]/60';
                      } else if (isIncludeDep) {
                        cellStyle = 'bg-[#10B981]/20 text-emerald-200 font-bold border-[#10B981] ring-1 ring-[#10B981]/50';
                      } else if (isExcludeDep) {
                        cellStyle = 'bg-[#06B6D4]/20 text-cyan-200 font-bold border-[#06B6D4] ring-1 ring-[#06B6D4]/50';
                      }

                      return (
                        <td
                          key={w}
                          className={`p-1.5 text-center border-b border-[#1F293D] transition-all duration-200 relative ${cellStyle}`}
                        >
                          <span>{val}</span>
                          {isIncludeDep && (
                            <span className="block text-[8px] text-[#10B981] leading-none mt-0.5">
                              +incl
                            </span>
                          )}
                          {isExcludeDep && !isIncludeDep && (
                            <span className="block text-[8px] text-[#06B6D4] leading-none mt-0.5">
                              ↑excl
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Right Info Shelf: Items, Weights & Legend */}
        <div className="w-full lg:w-64 flex flex-col gap-3 shrink-0">
          {/* Items Inventory Card */}
          <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-3 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
              <span className="text-[#06B6D4]">Items Available</span>
              <span className="font-mono text-[10px] text-slate-400">Cap: {capacity}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              {items.map((item, idx) => {
                const isInspecting = currentItemIndex === idx + 1;
                const isSelected = chosenItems?.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                      isSelected
                        ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981] font-bold'
                        : isInspecting
                        ? 'bg-[#06B6D4]/15 border-[#06B6D4] text-cyan-200 font-semibold'
                        : 'bg-[#1F2937]/40 border-[#374151]/50 text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>{isSelected ? '✓' : isInspecting ? '►' : '•'}</span>
                      <span>{item.name}</span>
                    </span>
                    <span className="text-slate-400 text-[11px] tabular-nums">
                      wt:<strong className="text-white ml-0.5">{item.weight}</strong> · val:
                      <strong className="text-[#10B981] ml-0.5">{item.value}</strong>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dependencies Legend */}
          <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-3 shadow-sm text-xs font-mono">
            <div className="text-[11px] font-semibold text-slate-300 mb-1.5">
              Cell Dependency Legend
            </div>
            <div className="flex flex-col gap-1 text-[11px] text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-xs bg-[#06B6D4]" />
                <span>↑excl: dp[i-1][w]</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-xs bg-[#10B981]" />
                <span>+incl: val + dp[i-1][w - wt]</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
