import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface EditDistanceInput {
  word1: string;
  word2: string;
}

export interface EditDistanceState {
  word1: string;
  word2: string;
  dpTable: number[][];
  currentI: number;
  currentJ: number;
  operationType: 'MATCH' | 'INSERT' | 'DELETE' | 'REPLACE' | 'NONE';
  optimalEdits: number;
}

const defaultEditInput: EditDistanceInput = {
  word1: 'HORSE',
  word2: 'ROS',
};

export const editDistanceModule: AlgorithmModule<EditDistanceInput, EditDistanceState> = {
  id: 'edit-distance',
  title: 'Edit Distance (Levenshtein Distance)',
  category: 'dynamic-programming',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(M * N)',
    timeAverage: 'O(M * N)',
    timeWorst: 'O(M * N)',
    spaceAuxiliary: 'O(M * N) for 2D DP matrix (or O(min(M, N)) with space optimization)',
    worstCaseCondition: 'All subproblem prefixes must be evaluated to ensure globally minimal sequence of edits',
  },
  theory: {
    overview:
      'The Edit Distance (Levenshtein Distance) quantifies the dissimilarity between two strings by finding the minimum number of single-character operations (insertions, deletions, or substitutions) required to transform word1 into word2. It is widely applied in spell checkers, computational biology (DNA alignment), and NLP.',
    whyItWorks:
      'Optimal Substructure: If word1[i-1] == word2[j-1], no edit is needed (dp[i][j] = dp[i-1][j-1]). Otherwise, taking 1 + min(delete from word1: dp[i-1][j], insert into word1: dp[i][j-1], substitute: dp[i-1][j-1]) considers all three mutually exclusive choices and picks the optimum.',
    invariant:
      'At step (i, j), dp[i][j] stores the exact minimum edit distance between prefix word1[0 ... i-1] and prefix word2[0 ... j-1].',
    pitfalls: [
      'Forgetting the base cases: dp[i][0] = i (i deletions) and dp[0][j] = j (j insertions).',
      'Off-by-one errors mapping between 1-based DP table indices and 0-based string characters.',
    ],
  },
  presets: [
    {
      id: 'horse-ros',
      label: 'LeetCode 72 Classic',
      description: '"HORSE" → "ROS" (Distance: 3)',
      data: defaultEditInput,
    },
    {
      id: 'kitten-sitting',
      label: 'Kitten → Sitting',
      description: '"KITTEN" → "SITTING" (Distance: 3)',
      data: { word1: 'KITTEN', word2: 'SITTING' },
    },
    {
      id: 'single-char',
      label: 'Short Words',
      description: '"CAT" → "CAR" (Distance: 1)',
      data: { word1: 'CAT', word2: 'CAR' },
    },
  ],
  defaultInput: defaultEditInput,
  codeSnippets: {
    python: `def min_distance(word1, word2):
    m, n = len(word1), len(word2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(m + 1): dp[i][0] = i
    for j in range(n + 1): dp[0][j] = j

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i - 1] == word2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j],    # Delete
                                   dp[i][j - 1],    # Insert
                                   dp[i - 1][j - 1])# Replace
    return dp[m][n]`,
    typescript: `function minDistance(word1: string, word2: string): number {
  const m = word1.length, n = word2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}`,
    cpp: `int minDistance(string word1, string word2) {
    int m = word1.size(), n = word2.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;

    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (word1[i - 1] == word2[j - 1]) dp[i][j] = dp[i - 1][j - 1];
            else dp[i][j] = 1 + min({dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]});
        }
    }
    return dp[m][n];
}`,
    java: `public int minDistance(String word1, String word2) {
    int m = word1.length(), n = word2.length();
    int[][] dp = new int[m + 1][n + 1];
    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;

    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (word1.charAt(i - 1) == word2.charAt(j - 1)) dp[i][j] = dp[i - 1][j - 1];
            else dp[i][j] = 1 + Math.min(dp[i - 1][j], Math.min(dp[i][j - 1], dp[i - 1][j - 1]));
        }
    }
    return dp[m][n];
}`,
    pseudocode: `function EditDistance(A, B):
    for i = 0 to M: D[i, 0] = i
    for j = 0 to N: D[0, j] = j
    for i = 1 to M:
        for j = 1 to N:
            if A[i] == B[j]: D[i, j] = D[i-1, j-1]
            else: D[i, j] = 1 + min(D[i-1, j], D[i, j-1], D[i-1, j-1])
    return D[M, N]`,
  },

  generateTimeline: (input: EditDistanceInput): ExecutionFrame<EditDistanceState>[] => {
    const frames: ExecutionFrame<EditDistanceState>[] = [];
    const { word1, word2 } = input;
    const m = word1.length;
    const n = word2.length;

    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    // Base cases
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    const cloneDP = () => dp.map((row) => [...row]);

    // Initial frame
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: `Initialized (${m + 1} x ${n + 1}) DP matrix for word1="${word1}" and word2="${word2}". Base cases filled: dp[i][0] = i (deletions), dp[0][j] = j (insertions).`,
      isMilestone: true,
      milestoneTitle: 'Base Cases Filled',
      soundCue: { type: 'start' },
      variables: { word1, word2, length1: m, length2: n },
      callStack: [{ name: 'minDistance', params: { word1, word2 }, line: 1, isCurrent: true }],
      conditionEval: { expr: `m >= 0 && n >= 0`, result: true },
      scopeVariables: { word1, word2, length1: m, length2: n },
      state: {
        word1,
        word2,
        dpTable: cloneDP(),
        currentI: 0,
        currentJ: 0,
        operationType: 'NONE',
        optimalEdits: 0,
      },
    });

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const c1 = word1[i - 1];
        const c2 = word2[j - 1];
        const isMatch = c1 === c2;

        if (isMatch) {
          dp[i][j] = dp[i - 1][j - 1];
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 10,
            explanation: `Characters match: word1[${i - 1}] ('${c1}') == word2[${j - 1}] ('${c2}'). Cost = 0. Inherited diagonal: dp[${i}][${j}] = ${dp[i][j]}.`,
            soundCue: { type: 'step' },
            variables: { i, j, c1, c2, cost: 0, result: dp[i][j], isMatch: true },
            callStack: [{ name: 'matchChars', params: { i, j, char: c1 }, line: 10, isCurrent: true }],
            conditionEval: { expr: `word1[${i - 1}] == word2[${j - 1}] ('${c1}' == '${c2}')`, result: true },
            scopeVariables: { i, j, c1, c2, cost: 0, result: dp[i][j] },
            state: {
              word1,
              word2,
              dpTable: cloneDP(),
              currentI: i,
              currentJ: j,
              operationType: 'MATCH',
              optimalEdits: dp[i][j],
            },
          });
        } else {
          const deleteCost = dp[i - 1][j];
          const insertCost = dp[i][j - 1];
          const replaceCost = dp[i - 1][j - 1];
          const minCost = Math.min(deleteCost, insertCost, replaceCost);
          dp[i][j] = 1 + minCost;

          let op: 'INSERT' | 'DELETE' | 'REPLACE' = 'REPLACE';
          if (minCost === deleteCost) op = 'DELETE';
          else if (minCost === insertCost) op = 'INSERT';

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 12,
            explanation: `Mismatch: '${c1}' vs '${c2}'. Best choice: ${op} (cost 1 + ${minCost} = ${dp[i][j]}). Choices: Delete=${deleteCost + 1}, Insert=${insertCost + 1}, Replace=${replaceCost + 1}.`,
            soundCue: { type: 'swap' },
            isMilestone: true,
            milestoneTitle: `${op} at (${i},${j})`,
            variables: { i, j, c1, c2, chosenOp: op, result: dp[i][j], deleteCost, insertCost, replaceCost },
            callStack: [{ name: 'mismatchChoice', params: { i, j, op }, line: 12, isCurrent: true }],
            conditionEval: { expr: `word1[${i - 1}] !== word2[${j - 1}]`, result: true },
            scopeVariables: { i, j, c1, c2, chosenOp: op, result: dp[i][j] },
            state: {
              word1,
              word2,
              dpTable: cloneDP(),
              currentI: i,
              currentJ: j,
              operationType: op,
              optimalEdits: dp[i][j],
            },
          });
        }
      }
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 16,
      explanation: `🎉 Edit Distance complete! Minimum ${dp[m][n]} edits required to transform "${word1}" into "${word2}".`,
      isMilestone: true,
      milestoneTitle: `Min Edits = ${dp[m][n]}`,
      soundCue: { type: 'complete' },
      variables: { finalDistance: dp[m][n], fromWord: word1, toWord: word2, completed: true },
      callStack: [{ name: 'minDistance.done', params: { edits: dp[m][n] }, line: 16, isCurrent: true }],
      conditionEval: { expr: `i == m && j == n`, result: true },
      scopeVariables: { finalDistance: dp[m][n], fromWord: word1, toWord: word2 },
      state: {
        word1,
        word2,
        dpTable: cloneDP(),
        currentI: m,
        currentJ: n,
        operationType: 'NONE',
        optimalEdits: dp[m][n],
      },
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },

  renderStage: (frame: ExecutionFrame<EditDistanceState>) => {
    const { word1, word2, dpTable, currentI, currentJ, operationType, optimalEdits } =
      frame.state;

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-4 select-none">
        {/* Top HUD */}
        <div className="flex items-center gap-4 mb-4">
          <div className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Word 1: <span className="text-cyan-400 font-bold">"{word1}"</span> → Word 2:{' '}
            <span className="text-amber-400 font-bold">"{word2}"</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Current Edits: <span className="text-emerald-400 font-bold">{optimalEdits}</span>
          </div>
          {operationType !== 'NONE' && (
            <div
              className={`px-3 py-1 rounded-lg border text-xs font-mono font-bold uppercase tracking-wider ${
                operationType === 'MATCH'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                  : 'bg-indigo-950/80 border-indigo-500 text-indigo-300'
              }`}
            >
              Action: {operationType}
            </div>
          )}
        </div>

        {/* 2D DP Alignment Table */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-2xl overflow-x-auto max-w-full">
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-xs font-mono text-slate-600 border-b border-slate-800">
                  w1 \ w2
                </th>
                <th className="p-2 text-xs font-mono text-slate-500 border-b border-slate-800">
                  ε
                </th>
                {word2.split('').map((char, idx) => (
                  <th
                    key={idx}
                    className={`p-2 text-xs font-mono font-bold text-center border-b border-slate-800 ${
                      idx + 1 === currentJ ? 'text-amber-400 bg-amber-950/40' : 'text-slate-300'
                    }`}
                  >
                    {char}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dpTable.map((row, rIdx) => {
                const rowChar = rIdx === 0 ? 'ε' : word1[rIdx - 1];

                return (
                  <tr key={rIdx}>
                    <td
                      className={`p-2 text-xs font-mono font-bold text-center border-r border-slate-800 ${
                        rIdx === currentI ? 'text-cyan-400 bg-cyan-950/40' : 'text-slate-400'
                      }`}
                    >
                      {rowChar}
                    </td>
                    {row.map((val, cIdx) => {
                      const isTarget = rIdx === currentI && cIdx === currentJ;
                      const isDependency =
                        rIdx === currentI - 1 && cIdx === currentJ ||
                        rIdx === currentI && cIdx === currentJ - 1 ||
                        rIdx === currentI - 1 && cIdx === currentJ - 1;

                      return (
                        <td
                          key={cIdx}
                          className={`p-2.5 text-center font-mono text-xs border border-slate-800/60 transition-all duration-200 ${
                            isTarget
                              ? 'bg-emerald-950/90 text-emerald-300 ring-2 ring-emerald-400 font-bold scale-110 z-10'
                              : isDependency
                              ? 'bg-cyan-950/30 text-cyan-200'
                              : 'bg-slate-900/60 text-slate-300'
                          }`}
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
};
