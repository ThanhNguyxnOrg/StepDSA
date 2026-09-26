import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface LCSInput {
  str1: string;
  str2: string;
}

export interface LCSState {
  str1: string;
  str2: string;
  table: number[][];
  currentI: number;
  currentJ: number;
  backtrackPath: [number, number][];
  lcsString: string;
  isComplete: boolean;
}

const defaultLCSInput: LCSInput = {
  str1: 'STONE',
  str2: 'LONGEST',
};

export const lcsModule: AlgorithmModule<LCSInput, LCSState> = {
  id: 'longest-common-subsequence',
  title: 'Longest Common Subsequence (LCS 2D DP)',
  category: 'dynamic-programming',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(M · N)',
    timeAverage: 'O(M · N)',
    timeWorst: 'O(M · N)',
    spaceAuxiliary: 'O(M · N)',
    worstCaseCondition: 'All M · N subproblems evaluated in 2D memoization table',
  },
  theory: {
    overview:
      'Longest Common Subsequence (LCS) finds the longest subsequence common to both strings, appearing in the same relative order without needing to be contiguous.',
    whyItWorks:
      'If str1[i-1] == str2[j-1], the optimal solution extends LCS(i-1, j-1) by 1. Otherwise, the best solution is the maximum of excluding either str1[i-1] or str2[j-1].',
    invariant:
      'Table cell dp[i][j] stores the exact length of the longest common subsequence of prefixes str1[0..i-1] and str2[0..j-1].',
    pitfalls: [
      'Confusing Subsequence (non-contiguous) with Substring (strictly contiguous).',
      'Table indexing off-by-one: row 0 and column 0 represent empty string base cases of length 0.',
    ],
  },
  presets: [
    { id: 'stone-longest', label: 'STONE vs LONGEST', description: 'Common subsequence "ONE" of length 3', data: { str1: 'STONE', str2: 'LONGEST' } },
    { id: 'dna-match', label: 'DNA Sequence (AGGTAB)', description: 'Classic bioinformatics alignment "GTAB"', data: { str1: 'AGGTAB', str2: 'GXTXAYB' } },
    { id: 'identical', label: 'Identical Strings (ABCDE)', description: 'Full match of length 5', data: { str1: 'ABCDE', str2: 'ABCDE' } },
    { id: 'disjoint', label: 'Disjoint Characters', description: 'Zero overlap, LCS length 0', data: { str1: 'XYZ', str2: 'ABC' } },
  ],
  defaultInput: defaultLCSInput,
  codeSnippets: {
    python: `def lcs(str1: str, str2: str) -> str:
    m, n = len(str1), len(str2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if str1[i - 1] == str2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
                
    # Backtrack to reconstruct LCS string
    res = []
    i, j = m, n
    while i > 0 and j > 0:
        if str1[i - 1] == str2[j - 1]:
            res.append(str1[i - 1])
            i -= 1; j -= 1
        elif dp[i - 1][j] >= dp[i][j - 1]:
            i -= 1
        else:
            j -= 1
    return "".join(reversed(res))`,
    typescript: `function lcs(str1: string, str2: string): string {
  const m = str1.length, n = str2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Reconstruct string
  const chars: string[] = [];
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (str1[i - 1] === str2[j - 1]) {
      chars.push(str1[i - 1]);
      i--; j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  return chars.reverse().join('');
}`,
    cpp: `string lcs(string s1, string s2) {
    int m = s1.size(), n = s2.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));

    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (s1[i - 1] == s2[j - 1])
                dp[i][j] = dp[i - 1][j - 1] + 1;
            else
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
        }
    }

    string res = "";
    int i = m, j = n;
    while (i > 0 && j > 0) {
        if (s1[i - 1] == s2[j - 1]) {
            res += s1[i - 1];
            i--; j--;
        } else if (dp[i - 1][j] >= dp[i][j - 1]) {
            i--;
        } else {
            j--;
        }
    }
    reverse(res.begin(), res.end());
    return res;
}`,
    java: `public String lcs(String s1, String s2) {
    int m = s1.length(), n = s2.length();
    int[][] dp = new int[m + 1][n + 1];

    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (s1.charAt(i - 1) == s2.charAt(j - 1))
                dp[i][j] = dp[i - 1][j - 1] + 1;
            else
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
    }
    StringBuilder sb = new StringBuilder();
    int i = m, j = n;
    while (i > 0 && j > 0) {
        if (s1.charAt(i - 1) == s2.charAt(j - 1)) {
            sb.append(s1.charAt(i - 1));
            i--; j--;
        } else if (dp[i - 1][j] >= dp[i][j - 1]) {
            i--;
        } else {
            j--;
        }
    }
    return sb.reverse().toString();
}`,
    pseudocode: `function LCS(str1, str2):
    dp[0..m][0..n] = 0
    for i = 1 to m:
        for j = 1 to n:
            if str1[i-1] == str2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    return backtrack(dp, str1, str2)`,
  },

  generateTimeline: (input: LCSInput): ExecutionFrame<LCSState>[] => {
    const frames: ExecutionFrame<LCSState>[] = [];
    const s1 = input.str1.toUpperCase();
    const s2 = input.str2.toUpperCase();
    const m = s1.length;
    const n = s2.length;

    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    // Initial frame
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialized (M+1)x(N+1) DP matrix for "${s1}" (${m} chars) and "${s2}" (${n} chars). Base cases row 0 and col 0 are 0.`,
      callStack: [
        { name: 'lcs(s1, s2)', params: { m, n }, line: 2, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { m, n, currentCell: 'dp[0][0] = 0' },
      state: {
        str1: s1,
        str2: s2,
        table: dp.map((row) => [...row]),
        currentI: 0,
        currentJ: 0,
        backtrackPath: [],
        lcsString: '',
        isComplete: false,
      },
      invariantStatus: {
        isValid: true,
        label: 'Base cases dp[0][*] and dp[*][0] initialized',
      },
    });

    for (let i = 1; i <= m; i++) {
      const c1 = s1[i - 1];

      for (let j = 1; j <= n; j++) {
        const c2 = s2[j - 1];
        const isMatch = c1 === c2;

        if (isMatch) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: isMatch ? 7 : 9,
          explanation: isMatch
            ? `Match found! s1[${i - 1}] ('${c1}') == s2[${j - 1}] ('${c2}'). dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${dp[i][j]}.`
            : `Mismatch: s1[${i - 1}] ('${c1}') != s2[${j - 1}] ('${c2}'). dp[${i}][${j}] = max(top=${dp[i - 1][j]}, left=${dp[i][j - 1]}) = ${dp[i][j]}.`,
          callStack: [
            { name: 'lcs(s1, s2)', params: { i, j, c1, c2, 'dp[i][j]': dp[i][j] }, line: isMatch ? 7 : 9, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          variables: { i, j, 's1[i-1]': c1, 's2[j-1]': c2, val: dp[i][j] },
          conditionEval: { expr: `'${c1}' == '${c2}'`, result: isMatch },
          soundCue: { type: isMatch ? 'sorted' : 'compare' },
          state: {
            str1: s1,
            str2: s2,
            table: dp.map((row) => [...row]),
            currentI: i,
            currentJ: j,
            backtrackPath: [],
            lcsString: '',
            isComplete: false,
          },
          invariantStatus: {
            isValid: true,
            label: `dp[${i}][${j}] = ${dp[i][j]}`,
          },
        });
      }
    }

    // Backtrack phase
    const backtrackPath: [number, number][] = [];
    const matchedChars: string[] = [];
    let bi = m;
    let bj = n;

    while (bi > 0 && bj > 0) {
      backtrackPath.push([bi, bj]);
      if (s1[bi - 1] === s2[bj - 1]) {
        matchedChars.push(s1[bi - 1]);
        bi--;
        bj--;
      } else if (dp[bi - 1][bj] >= dp[bi][bj - 1]) {
        bi--;
      } else {
        bj--;
      }
    }
    backtrackPath.push([bi, bj]);

    const finalLcs = matchedChars.reverse().join('');

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 18,
      explanation: `LCS computation and backtrack complete! Longest Common Subsequence is "${finalLcs}" with length ${dp[m][n]}.`,
      callStack: [
        { name: 'lcs(s1, s2)', params: { lcs: finalLcs, length: dp[m][n] }, line: 18, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { result: finalLcs, length: dp[m][n] },
      soundCue: { type: 'sorted' },
      isMilestone: true,
      milestoneTitle: `LCS: "${finalLcs}" (${dp[m][n]})`,
      state: {
        str1: s1,
        str2: s2,
        table: dp.map((row) => [...row]),
        currentI: m,
        currentJ: n,
        backtrackPath,
        lcsString: finalLcs,
        isComplete: true,
      },
      invariantStatus: {
        isValid: true,
        label: `LCS = "${finalLcs}" (len ${dp[m][n]})`,
      },
    });

    const totalSteps = frames.length;
    return frames.map((f) => ({ ...f, totalSteps }));
  },

  renderStage: (frame: ExecutionFrame<LCSState>) => {
    const { str1, str2, table, currentI, currentJ, backtrackPath, lcsString, isComplete } = frame.state;
    const m = str1.length;
    const n = str2.length;

    return (
      <div className="w-full h-full flex flex-col justify-between p-4 bg-[#0B0F19] rounded-2xl border border-[#1F293D] select-none">
        {/* Top Header Summary */}
        <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400">Str 1 (Rows):</span>{' '}
              <span className="font-bold text-cyan-300">"{str1}"</span>
            </div>
            <div>
              <span className="text-slate-400">Str 2 (Cols):</span>{' '}
              <span className="font-bold text-amber-300">"{str2}"</span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400 font-semibold">LCS Result:</span>
            <span className={`px-2.5 py-0.5 rounded font-bold ${
              isComplete
                ? 'bg-[#10B981]/20 border border-[#10B981] text-[#10B981]'
                : 'bg-[#1F2937] text-slate-300'
            }`}>
              {isComplete ? `"${lcsString}" (Length ${table[m][n]})` : 'Computing...'}
            </span>
          </div>
        </div>

        {/* Center: 2D DP Matrix Grid */}
        <div className="flex-1 flex items-center justify-center my-3 overflow-auto max-h-[340px] p-2">
          <table className="border-collapse font-mono text-xs">
            <thead>
              <tr>
                <th className="p-2 border border-[#1F293D] bg-[#111827] text-slate-500 text-[10px]">i \ j</th>
                <th className="p-2 border border-[#1F293D] bg-[#111827] text-slate-400 text-[10px]">ε</th>
                {str2.split('').map((char, j) => (
                  <th
                    key={`col-${j}`}
                    className={`p-2 border border-[#1F293D] text-xs font-bold ${
                      j + 1 === currentJ ? 'bg-[#F59E0B]/20 text-[#F59E0B]' : 'bg-[#111827] text-amber-300'
                    }`}
                  >
                    {char}
                    <div className="text-[8px] font-normal text-slate-500">[{j + 1}]</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Row 0 (Empty String) */}
              <tr>
                <th className="p-2 border border-[#1F293D] bg-[#111827] text-slate-400 text-[10px]">ε</th>
                {table[0]?.map((val, colIdx) => (
                  <td
                    key={`r0-c${colIdx}`}
                    className="p-2.5 border border-[#1F293D] text-center text-slate-500 bg-[#0B0F19]"
                  >
                    {val}
                  </td>
                ))}
              </tr>

              {/* Data Rows */}
              {str1.split('').map((char, i) => {
                const rowIdx = i + 1;
                const isRowActive = rowIdx === currentI;

                return (
                  <tr key={`row-${rowIdx}`}>
                    <th
                      className={`p-2 border border-[#1F293D] text-xs font-bold ${
                        isRowActive ? 'bg-[#06B6D4]/20 text-[#06B6D4]' : 'bg-[#111827] text-cyan-300'
                      }`}
                    >
                      {char}
                      <div className="text-[8px] font-normal text-slate-500">[{rowIdx}]</div>
                    </th>

                    {table[rowIdx]?.map((val, colIdx) => {
                      const isCellActive = rowIdx === currentI && colIdx === currentJ;
                      const isBacktrack = backtrackPath.some(([bi, bj]) => bi === rowIdx && bj === colIdx);

                      let bgClass = 'bg-[#0E1420] text-slate-300';
                      if (isBacktrack) {
                        bgClass = 'bg-[#10B981]/30 border-2 border-[#10B981] text-[#10B981] font-extrabold shadow-sm';
                      } else if (isCellActive) {
                        bgClass = 'bg-[#F59E0B]/30 border-2 border-[#F59E0B] text-amber-200 font-extrabold animate-pulse';
                      }

                      return (
                        <td
                          key={`cell-${rowIdx}-${colIdx}`}
                          className={`p-2.5 border border-[#1F293D] text-center transition-all ${bgClass}`}
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

        {/* Bottom Legend */}
        <div className="bg-[#111827] border border-[#1F293D] rounded-xl px-4 py-2 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border-2 border-[#F59E0B] bg-[#F59E0B]/30" /> Active Cell dp[i][j]
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border-2 border-[#10B981] bg-[#10B981]/30" /> Backtrack Solution Path
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Formula: if match → dp[i-1][j-1]+1, else → max(top, left)
          </span>
        </div>
      </div>
    );
  },
};
