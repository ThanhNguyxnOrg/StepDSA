import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface LPSState {
  str: string;
  table: number[][]; // N x N
  i: number;
  j: number;
  currentLen: number;
  match: boolean;
  lpsResult: string;
}

export const lpsModule: AlgorithmModule<{ str: string }, LPSState> = {
  id: 'lps',
  title: 'Longest Palindromic Subsequence (Interval Matrix DP O(N^2))',
  category: 'dynamic-programming',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N^2)',
    timeAverage: 'O(N^2)',
    timeWorst: 'O(N^2)',
    spaceAuxiliary: 'O(N^2) or O(N) rolling row',
    worstCaseCondition: 'All string topologies evaluate all interval combinations',
  },
  theory: {
    overview:
      'Given a string s, find the longest subsequence whose characters read identical forward and backward. Characters in a subsequence need not be contiguous.',
    whyItWorks:
      'The optimal substructure property dictates that for interval s[i..j]: if s[i] == s[j], both outer characters match and extend the inner palindrome by 2: dp[i][j] = dp[i+1][j-1] + 2. If s[i] != s[j], we take max(dp[i+1][j], dp[i][j-1]).',
    invariant:
      'Interval Subproblem Invariant: dp[i][j] is guaranteed to store the maximum palindromic subsequence length within the substring slice s[i..j].',
    pitfalls: [
      'Confusing subsequence (non-contiguous) with substring (strictly contiguous).',
      'Iterating outer loops by index instead of interval length, leading to uncomputed subproblems.',
    ],
  },
  presets: [
    {
      id: 'classic-bbbab',
      label: 'Classic: "bbbab" -> LPS length 4 ("bbbb")',
      description: 'Repeated b characters allow a subsequence of length 4',
      data: { str: 'bbbab' },
    },
    {
      id: 'cbbd',
      label: 'Short: "cbbd" -> LPS length 2 ("bb")',
      description: 'Only inner b characters match',
      data: { str: 'cbbd' },
    },
    {
      id: 'character',
      label: 'Complex: "character" -> LPS length 5 ("carac")',
      description: 'Nested matching characters',
      data: { str: 'character' },
    },
  ],
  defaultInput: { str: 'bbbab' },
  codeSnippets: {
    cpp: `int longestPalindromeSubseq(string s) {
    int n = s.size();
    vector<vector<int>> dp(n, vector<int>(n, 0));
    for (int i = 0; i < n; i++) dp[i][i] = 1;
    for (int len = 2; len <= n; len++) {
        for (int i = 0; i <= n - len; i++) {
            int j = i + len - 1;
            if (s[i] == s[j])
                dp[i][j] = (len == 2) ? 2 : dp[i + 1][j - 1] + 2;
            else
                dp[i][j] = max(dp[i + 1][j], dp[i][j - 1]);
        }
    }
    return dp[0][n - 1];
}`,
    python: `def longestPalindromeSubseq(s: str) -> int:
    n = len(s)
    dp = [[0] * n for _ in range(n)]
    for i in range(n):
        dp[i][i] = 1
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            if s[i] == s[j]:
                dp[i][j] = 2 if length == 2 else dp[i + 1][j - 1] + 2
            else:
                dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])
    return dp[0][n - 1]`,
    typescript: `function longestPalindromeSubseq(s: string): number {
    const n = s.length;
    const dp: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) dp[i][i] = 1;
    for (let len = 2; len <= n; len++) {
        for (let i = 0; i <= n - len; i++) {
            const j = i + len - 1;
            if (s[i] === s[j]) {
                dp[i][j] = len === 2 ? 2 : dp[i + 1][j - 1] + 2;
            } else {
                dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
            }
        }
    }
    return dp[0][n - 1];
}`,
    java: `public int longestPalindromeSubseq(String s) {
    int n = s.length();
    int[][] dp = new int[n][n];
    for (int i = 0; i < n; i++) dp[i][i] = 1;
    for (int len = 2; len <= n; len++) {
        for (int i = 0; i <= n - len; i++) {
            int j = i + len - 1;
            if (s.charAt(i) == s.charAt(j)) {
                dp[i][j] = (len == 2) ? 2 : dp[i + 1][j - 1] + 2;
            } else {
                dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
            }
        }
    }
    return dp[0][n - 1];
}`,
    pseudocode: `function longestPalindromeSubseq(s):
    n = length(s)
    dp[0..n-1][0..n-1] = 0
    for i from 0 to n-1: dp[i][i] = 1
    for len from 2 to n:
        for i from 0 to n - len:
            j = i + len - 1
            if s[i] == s[j]:
                dp[i][j] = dp[i+1][j-1] + 2
            else:
                dp[i][j] = max(dp[i+1][j], dp[i][j-1])
    return dp[0][n-1]`,
  },

  generateTimeline: (input: { str: string }): ExecutionFrame<LPSState>[] => {
    const raw = (input.str || 'bbbab').trim().toLowerCase();
    const str = raw.length > 0 ? raw.slice(0, 10) : 'bbbab';
    const n = str.length;

    const dp: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      dp[i][i] = 1;
    }

    const frames: ExecutionFrame<LPSState>[] = [];

    // Frame 0: Base initialization
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 4,
      explanation: `Initialize DP table for string "${str}" of length ${n}. Single characters have LPS = 1 (diagonal dp[i][i] = 1).`,
      variables: { string: str, length: n, 'dp[i][i]': 1 },
      callStack: [
        { name: `lps("${str}")`, params: { n }, line: 4, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      state: {
        str,
        table: dp.map((row) => [...row]),
        i: 0,
        j: 0,
        currentLen: 1,
        match: false,
        lpsResult: '',
      },
    });

    for (let len = 2; len <= n; len++) {
      for (let i = 0; i <= n - len; i++) {
        const j = i + len - 1;
        const charI = str[i];
        const charJ = str[j];
        const isMatch = charI === charJ;

        if (isMatch) {
          dp[i][j] = len === 2 ? 2 : dp[i + 1][j - 1] + 2;
        } else {
          dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
        }

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: isMatch ? 9 : 11,
          explanation: `Interval len=${len}, [${i}..${j}] ("${str.slice(i, j + 1)}"): s[${i}]='${charI}' and s[${j}]='${charJ}'. ${
            isMatch
              ? `Characters MATCH! dp[${i}][${j}] = dp[${i + 1}][${j - 1}] + 2 = ${dp[i][j]}`
              : `Characters DIFFER! dp[${i}][${j}] = max(dp[${i + 1}][${j}], dp[${i}][${j - 1}]) = ${dp[i][j]}`
          }`,
          variables: {
            len,
            i,
            j,
            's[i]': charI,
            's[j]': charJ,
            match: isMatch ? 'YES' : 'NO',
            'dp[i][j]': dp[i][j],
          },
          callStack: [
            { name: `evaluateInterval(i=${i}, j=${j})`, params: { len, i, j }, line: isMatch ? 9 : 11, isCurrent: true },
            { name: `lps("${str}")`, params: { n }, line: 6 },
          ],
          state: {
            str,
            table: dp.map((row) => [...row]),
            i,
            j,
            currentLen: len,
            match: isMatch,
            lpsResult: '',
          },
        });
      }
    }

    // Reconstruct one optimal palindrome
    let left = 0;
    let right = n - 1;
    const lChars: string[] = [];
    const rChars: string[] = [];
    while (left <= right) {
      if (left === right) {
        lChars.push(str[left]);
        break;
      }
      if (str[left] === str[right]) {
        lChars.push(str[left]);
        rChars.unshift(str[right]);
        left++;
        right--;
      } else if (dp[left + 1][right] >= dp[left][right - 1]) {
        left++;
      } else {
        right--;
      }
    }
    const finalLpsStr = lChars.concat(rChars).join('');

    // Final completion frame
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 14,
      explanation: `LPS computation complete! Longest Palindromic Subsequence has length ${dp[0][n - 1]}: "${finalLpsStr}".`,
      variables: {
        resultLength: dp[0][n - 1],
        subsequence: finalLpsStr,
      },
      callStack: [
        { name: 'complete()', params: { lpsLength: dp[0][n - 1], finalLpsStr }, line: 14, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      state: {
        str,
        table: dp.map((row) => [...row]),
        i: 0,
        j: n - 1,
        currentLen: n,
        match: true,
        lpsResult: finalLpsStr,
      },
    });

    const total = frames.length;
    frames.forEach((f) => {
      f.totalSteps = total;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<LPSState>) => {
    const { str, table, i, j, currentLen, match, lpsResult } = frame.state;
    const n = str.length;

    return (
      <div className="w-full flex-1 flex flex-col items-center justify-between p-6 select-none max-w-5xl mx-auto">
        {/* String Characters with Active Interval Highlighting */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 mr-2">Input String:</span>
            {str.split('').map((char, idx) => {
              const inInterval = idx >= i && idx <= j;
              const isEndpoint = idx === i || idx === j;
              return (
                <div
                  key={idx}
                  className={`flex flex-col items-center transition-all duration-200 ${
                    isEndpoint
                      ? 'scale-110'
                      : inInterval
                      ? 'opacity-100'
                      : 'opacity-40'
                  }`}
                >
                  <div
                    className={`w-9 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm border ${
                      isEndpoint
                        ? match
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-lg shadow-emerald-500/20'
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-lg shadow-cyan-500/20'
                        : inInterval
                        ? 'bg-slate-800 text-slate-200 border-slate-700'
                        : 'bg-slate-900 text-slate-500 border-slate-800'
                    }`}
                  >
                    {char}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 mt-1">
                    {idx === i ? 'i' : idx === j ? 'j' : idx}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Metric Badges */}
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-400">
              Interval Len: <strong className="text-white">{currentLen}</strong>
            </div>
            {lpsResult ? (
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-xs font-mono text-emerald-300 font-bold">
                LPS: &quot;{lpsResult}&quot; (len {lpsResult.length})
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
                LPS in [0..{n - 1}]: <strong className="text-white">{table[0]?.[n - 1] ?? 0}</strong>
              </div>
            )}
          </div>
        </div>

        {/* 2D Interval DP Matrix */}
        <div className="w-full overflow-x-auto p-4 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl my-auto">
          <table className="w-full text-center border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="p-2 text-slate-500">i \ j</th>
                {str.split('').map((c, colIdx) => (
                  <th
                    key={colIdx}
                    className={`p-2 ${colIdx === j ? 'text-cyan-400 font-bold bg-cyan-950/30' : 'text-slate-400'}`}
                  >
                    {colIdx} (&apos;{c}&apos;)
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.map((row, rowIdx) => (
                <tr key={rowIdx} className="border-b border-slate-900/60">
                  <td
                    className={`p-2 text-left font-bold ${
                      rowIdx === i ? 'text-cyan-400 bg-cyan-950/30' : 'text-slate-500'
                    }`}
                  >
                    {rowIdx} (&apos;{str[rowIdx]}&apos;)
                  </td>
                  {row.map((cell, colIdx) => {
                    const isCurrent = rowIdx === i && colIdx === j;
                    const isInvalid = rowIdx > colIdx;
                    return (
                      <td
                        key={colIdx}
                        className={`p-2.5 transition-all duration-200 ${
                          isInvalid
                            ? 'text-slate-800 bg-slate-950/40'
                            : isCurrent
                            ? 'bg-cyan-500 text-slate-950 font-extrabold scale-110 shadow-lg'
                            : cell > 0
                            ? 'bg-slate-900/80 text-emerald-400 font-bold'
                            : 'text-slate-600'
                        }`}
                      >
                        {isInvalid ? '—' : cell}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
};
