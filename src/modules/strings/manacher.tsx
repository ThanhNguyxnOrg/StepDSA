import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface ManacherState {
  transformedString: string;
  originalString: string;
  pArray: number[];
  c: number; // Current center
  r: number; // Current right boundary
  i: number; // Current index
  mirror: number; // 2 * c - i
  maxPalindrome: string;
}

export const manacherModule: AlgorithmModule<
  { text: string },
  ManacherState
> = {
  id: 'manachers-algorithm',
  title: "Manacher's Algorithm (Linear-Time Longest Palindrome Substring O(N))",
  category: 'searching',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(N) for transformed string and palindrome radius array',
    worstCaseCondition: 'All strings processed in strictly linear time due to monotonic right-boundary R advances',
  },
  theory: {
    overview:
      "Manacher's algorithm finds the longest palindromic substring in any string in strictly linear O(N) time and space. It eliminates odd/even length asymmetry by interspersing boundary characters (e.g. '#').",
    whyItWorks:
      'It leverages previously computed palindrome radii around center C with right boundary R. For index i < R, its mirror i\' = 2C - i already knows the palindrome radius. By symmetry, P[i] >= min(R - i, P[i\']). Expansions only occur when extending past R, so the right boundary advances at most N times.',
    invariant:
      'Palindrome Mirror Invariant: If index i lies within the right boundary of center C (i < R), the substring centered at i is identical to that centered at mirror i\' within radius R - i.',
    pitfalls: [
      'Forgetting to insert delimiter characters, making even-length palindromes tricky to identify.',
      'Expanding past R without updating the center C.',
    ],
  },
  presets: [
    {
      id: 'classic-abacaba',
      label: 'Classic Palindromic Tree: "abacaba"',
      description: 'Symmetric recursive palindrome of length 7',
      data: { text: 'abacaba' },
    },
    {
      id: 'nested-even-odd',
      label: 'Mixed Substrings: "babad"',
      description: 'Contains both "bab" and "aba" palindromes',
      data: { text: 'babad' },
    },
    {
      id: 'monotone-repeated',
      label: 'Repeated Characters: "aaaa"',
      description: 'Even length palindrome spanning whole string',
      data: { text: 'aaaa' },
    },
  ],
  defaultInput: { text: 'abacaba' },
  codeSnippets: {
    cpp: `string longestPalindrome(string s) {
    string t = "^";
    for (char c : s) t += string("#") + c;
    t += "#$";
    int n = t.size();
    vector<int> p(n, 0);
    int c = 0, r = 0;
    for (int i = 1; i < n - 1; ++i) {
        int i_mirror = 2 * c - i;
        if (r > i) p[i] = min(r - i, p[i_mirror]);
        while (t[i + 1 + p[i]] == t[i - 1 - p[i]]) p[i]++;
        if (i + p[i] > r) {
            c = i;
            r = i + p[i];
        }
    }
    int maxLen = 0, centerIdx = 0;
    for (int i = 1; i < n - 1; ++i) {
        if (p[i] > maxLen) {
            maxLen = p[i];
            centerIdx = i;
        }
    }
    return s.substr((centerIdx - maxLen) / 2, maxLen);
}`,
    python: `def longest_palindrome(s: str) -> str:
    t = '^#' + '#'.join(s) + '#$'
    n = len(t)
    p = [0] * n
    c, r = 0, 0
    for i in range(1, n - 1):
        i_mirror = 2 * c - i
        if r > i:
            p[i] = min(r - i, p[i_mirror])
        while t[i + 1 + p[i]] == t[i - 1 - p[i]]:
            p[i] += 1
        if i + p[i] > r:
            c, r = i, i + p[i]
    max_len, center_idx = max((val, idx) for idx, val in enumerate(p))
    start = (center_idx - max_len) // 2
    return s[start:start + max_len]`,
    typescript: `function longestPalindrome(s: string): string {
  const t = '^#' + s.split('').join('#') + '#$';
  const n = t.length;
  const p = new Array(n).fill(0);
  let c = 0, r = 0;
  for (let i = 1; i < n - 1; i++) {
    const mirror = 2 * c - i;
    if (r > i) p[i] = Math.min(r - i, p[mirror]);
    while (t[i + 1 + p[i]] === t[i - 1 - p[i]]) p[i]++;
    if (i + p[i] > r) {
      c = i;
      r = i + p[i];
    }
  }
  let maxLen = 0, centerIdx = 0;
  p.forEach((len, idx) => {
    if (len > maxLen) { maxLen = len; centerIdx = idx; }
  });
  return s.substring((centerIdx - maxLen) / 2, (centerIdx + maxLen) / 2);
}`,
    java: `public String longestPalindrome(String s) {
    StringBuilder t = new StringBuilder("^");
    for (char ch : s.toCharArray()) t.append("#").append(ch);
    t.append("#$");
    int n = t.length();
    int[] p = new int[n];
    int c = 0, r = 0;
    for (int i = 1; i < n - 1; i++) {
        int mirror = 2 * c - i;
        if (r > i) p[i] = Math.min(r - i, p[mirror]);
        while (t.charAt(i + 1 + p[i]) == t.charAt(i - 1 - p[i])) p[i]++;
        if (i + p[i] > r) { c = i; r = i + p[i]; }
    }
    int maxLen = 0, center = 0;
    for (int i = 1; i < n - 1; i++) {
        if (p[i] > maxLen) { maxLen = p[i]; center = i; }
    }
    int start = (center - maxLen) / 2;
    return s.substring(start, start + maxLen);
}`,
    pseudocode: `function manacher(s):
    t = transformWithDelimiters(s)
    p = array of 0s
    c = 0, r = 0
    for i from 1 to length(t) - 2:
        mirror = 2*c - i
        if r > i: p[i] = min(r - i, p[mirror])
        while t[i + 1 + p[i]] == t[i - 1 - p[i]]:
            p[i]++
        if i + p[i] > r:
            c = i; r = i + p[i]
    return extractLongestPalindrome(s, p)`,
  },
  generateTimeline: (input: { text: string }): ExecutionFrame<ManacherState>[] => {
    const originalString = input?.text || 'abacaba';
    const transformedString = '^#' + originalString.split('').join('#') + '#$';
    const n = transformedString.length;
    const p = new Array(n).fill(0);
    const frames: ExecutionFrame<ManacherState>[] = [];

    let c = 0;
    let r = 0;
    let bestLen = 0;
    let bestCenter = 0;

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      action: 'TRANSFORM_STRING',
      state: {
        transformedString,
        originalString,
        pArray: [...p],
        c: 0,
        r: 0,
        i: 0,
        mirror: 0,
        maxPalindrome: '',
      },
      callStack: [{ name: 'manacher', params: { text: originalString, transformedLength: n } }],
      variables: { original: originalString, transformed: transformedString, length: n },
      explanation: `Transformed "${originalString}" into delimiter string "${transformedString}" to unify odd/even palindromes.`,
    });

    for (let i = 1; i < n - 1; i++) {
      const mirror = 2 * c - i;
      let initialVal = 0;

      if (r > i) {
        initialVal = Math.min(r - i, p[mirror]);
        p[i] = initialVal;

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 10,
          action: 'MIRROR_COPY',
          state: {
            transformedString,
            originalString,
            pArray: [...p],
            c,
            r,
            i,
            mirror,
            maxPalindrome: originalString.substring((bestCenter - bestLen) / 2, (bestCenter + bestLen) / 2),
          },
          callStack: [{ name: 'manacherStep', params: { i, char: transformedString[i], mirror, mirrorRadius: p[mirror] } }],
          variables: {
            i,
            center: c,
            rightBoundary: r,
            mirrorIndex: mirror,
            copiedRadius: p[i],
          },
          explanation: `Index ${i} ('${transformedString[i]}') is within boundary R=${r}. Copy radius min(R-i, P[mirror]) = ${p[i]} from mirror ${mirror}.`,
        });
      }

      // Expand around center i
      let expanded = false;
      while (transformedString[i + 1 + p[i]] === transformedString[i - 1 - p[i]]) {
        p[i]++;
        expanded = true;
      }

      if (expanded) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 12,
          action: 'EXPAND_PALINDROME',
          state: {
            transformedString,
            originalString,
            pArray: [...p],
            c,
            r,
            i,
            mirror,
            maxPalindrome: originalString.substring((bestCenter - bestLen) / 2, (bestCenter + bestLen) / 2),
          },
          callStack: [{ name: 'expandPalindrome', params: { center: i, radius: p[i] } }],
          variables: { center: i, finalRadius: p[i] },
          explanation: `Expanded palindrome around index ${i} to radius ${p[i]}.`,
        });
      }

      // Update right boundary if extended past r
      if (i + p[i] > r) {
        c = i;
        r = i + p[i];

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 15,
          action: 'UPDATE_BOUNDARY',
          state: {
            transformedString,
            originalString,
            pArray: [...p],
            c,
            r,
            i,
            mirror,
            maxPalindrome: originalString.substring((bestCenter - bestLen) / 2, (bestCenter + bestLen) / 2),
          },
          callStack: [{ name: 'updateBoundary', params: { newCenter: c, newRightBoundary: r } }],
          variables: { newCenter: c, newRightBoundary: r },
          explanation: `Advanced right boundary! Center updated to ${c}, boundary extended to ${r}.`,
        });
      }

      if (p[i] > bestLen) {
        bestLen = p[i];
        bestCenter = i;
      }
    }

    const start = Math.floor((bestCenter - bestLen) / 2);
    const longestPal = originalString.substring(start, start + bestLen);

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 20,
      action: 'COMPLETE',
      state: {
        transformedString,
        originalString,
        pArray: [...p],
        c,
        r,
        i: n - 1,
        mirror: 0,
        maxPalindrome: longestPal,
      },
      callStack: [{ name: 'manacher', params: { result: longestPal, length: bestLen } }],
      variables: { longestPalindromicSubstring: longestPal, length: bestLen },
      explanation: `Manacher completed in O(N) linear time. Longest palindrome found: "${longestPal}" (length ${bestLen}).`,
    });

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });

    return frames;
  },
  renderStage: (frame: ExecutionFrame<ManacherState>) => {
    const { transformedString, pArray, c, r, i, mirror, maxPalindrome } = frame.state;

    return (
      <div className="flex flex-col items-center justify-center p-6 gap-6 w-full max-w-4xl mx-auto">
        {/* Banner */}
        <div className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Longest Palindrome:</span>
            <span className="text-lg font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-0.5 rounded">
              "{maxPalindrome}"
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Boundary [C, R]:</span>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded">
              Center: {c} | Right: {r}
            </span>
          </div>
        </div>

        {/* Character Array & Radius Strip */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 w-full overflow-x-auto">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Transformed String T and Palindrome Radii P[i]:
          </div>

          <div className="flex gap-1.5 min-w-max">
            {transformedString.split('').map((char, idx) => {
              const isCurrent = idx === i;
              const isCenter = idx === c;
              const isMirror = idx === mirror && i > 0;
              const isBoundary = idx === r;
              const radius = pArray[idx] || 0;

              return (
                <div key={idx} className="flex flex-col items-center gap-1">
                  {/* Character Box */}
                  <div
                    className={`w-9 h-11 rounded-lg flex items-center justify-center font-mono font-bold text-sm border transition-all ${
                      isCurrent
                        ? 'bg-amber-500/25 border-amber-400 text-amber-300 ring-2 ring-amber-400/30 z-10'
                        : isCenter
                        ? 'bg-purple-600/30 border-purple-400 text-purple-200'
                        : isMirror
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : isBoundary
                        ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                        : char === '#'
                        ? 'bg-slate-900/60 border-slate-800 text-slate-600'
                        : 'bg-slate-900 border-slate-700 text-slate-200'
                    }`}
                  >
                    {char}
                  </div>

                  {/* Radius P[i] */}
                  <div
                    className={`w-9 h-7 rounded flex items-center justify-center font-mono text-xs font-bold border ${
                      radius > 0
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                        : 'bg-slate-950 border-slate-900 text-slate-600'
                    }`}
                  >
                    {radius}
                  </div>

                  {/* Index */}
                  <span className="text-[10px] font-mono text-slate-500">{idx}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-400 inline-block" />
            <span>Current i</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-cyan-500/30 border border-cyan-400 inline-block" />
            <span>Mirror i' (2C - i)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-purple-600/30 border border-purple-400 inline-block" />
            <span>Center C</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500/30 border border-rose-400 inline-block" />
            <span>Right Boundary R</span>
          </div>
        </div>
      </div>
    );
  },
};
