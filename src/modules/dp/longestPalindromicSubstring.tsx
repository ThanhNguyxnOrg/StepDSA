import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface LPSState {
  str: string;
  centerL: number;
  centerR: number;
  bestStart: number;
  bestLength: number;
  comparingL: number | null;
  comparingR: number | null;
  match: boolean;
}

export const longestPalindromicSubstringModule: AlgorithmModule<string, LPSState> = {
  id: 'longest-palindromic-substring',
  title: 'Longest Palindromic Substring',
  category: 'dynamic-programming',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N^2)',
    timeWorst: 'O(N^2)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'All identical characters (e.g. "aaaaa")',
  },
  theory: {
    overview:
      'Finds the longest contiguous palindromic substring by expanding around every possible 2N - 1 center (each single character for odd palindromes and adjacent pairs for even palindromes).',
    whyItWorks:
      'A palindrome mirrors around its center. By checking outward from each center, we only expand as long as characters match, using O(1) extra space.',
    invariant:
      'Characters between comparingL + 1 and comparingR - 1 form a verified palindrome.',
    pitfalls: [
      'Only checking odd-length palindromes and forgetting even-length centers (e.g., "abba").',
      'Off-by-one errors when computing length = right - left - 1 after loop termination.',
    ],
  },
  codeSnippets: {
    python: `def longest_palindrome(s):
    start, max_len = 0, 0
    def expand(left, right):
        while left >= 0 and right < len(s) and s[left] == s[right]:
            left -= 1
            right += 1
        return right - left - 1

    for i in range(len(s)):
        len1 = expand(i, i)       # Odd center
        len2 = expand(i, i + 1)   # Even center
        curr_len = max(len1, len2)
        if curr_len > max_len:
            max_len = curr_len
            start = i - (curr_len - 1) // 2
    return s[start:start + max_len]`,
    typescript: `function longestPalindrome(s: string): string {
  let start = 0, maxLen = 0;
  function expand(left: number, right: number): number {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      left--;
      right++;
    }
    return right - left - 1;
  }
  for (let i = 0; i < s.length; i++) {
    const len1 = expand(i, i);
    const len2 = expand(i, i + 1);
    const len = Math.max(len1, len2);
    if (len > maxLen) {
      maxLen = len;
      start = i - Math.floor((len - 1) / 2);
    }
  }
  return s.substring(start, start + maxLen);
}`,
    cpp: `string longestPalindrome(string s) {
    int start = 0, maxLen = 0;
    auto expand = [&](int l, int r) {
        while (l >= 0 && r < s.size() && s[l] == s[r]) { l--; r++; }
        return r - l - 1;
    };
    for (int i = 0; i < s.size(); i++) {
        int len1 = expand(i, i);
        int len2 = expand(i, i + 1);
        int len = max(len1, len2);
        if (len > maxLen) {
            maxLen = len;
            start = i - (len - 1) / 2;
        }
    }
    return s.substr(start, maxLen);
}`,
    java: `public String longestPalindrome(String s) {
    int start = 0, maxLen = 0;
    for (int i = 0; i < s.length(); i++) {
        int len1 = expand(s, i, i);
        int len2 = expand(s, i, i + 1);
        int len = Math.max(len1, len2);
        if (len > maxLen) {
            maxLen = len;
            start = i - (len - 1) / 2;
        }
    }
    return s.substring(start, start + maxLen);
}`,
    pseudocode: `function longestPalindrome(s):
    start <- 0, maxLen <- 0
    for i from 0 to N - 1:
        len1 <- expand(i, i)       // odd
        len2 <- expand(i, i + 1)   // even
        len <- max(len1, len2)
        if len > maxLen:
            maxLen <- len
            start <- i - (len - 1) / 2
    return substring(s, start, start + maxLen)`,
  },
  defaultInput: 'babad',
  presets: [
    { id: 'babad', label: 'babad', description: 'Classic interview example ("bab" or "aba")', data: 'babad' },
    { id: 'cbbd', label: 'cbbd', description: 'Even palindrome "bb"', data: 'cbbd' },
    { id: 'racecar', label: 'racecar', description: 'Full odd palindrome', data: 'racecar' },
  ],
  generateTimeline: (input: string): ExecutionFrame<LPSState>[] => {
    const frames: ExecutionFrame<LPSState>[] = [];
    const s = input;
    const n = s.length;
    let bestStart = 0;
    let bestLength = n > 0 ? 1 : 0;

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Find longest palindromic substring for "${s}". Ready to expand around centers.`,
      state: {
        str: s,
        centerL: 0,
        centerR: 0,
        bestStart: 0,
        bestLength: 1,
        comparingL: null,
        comparingR: null,
        match: true,
      },
    });

    for (let i = 0; i < n; i++) {
      // Check both odd and even centers
      const centers = [
        { l: i, r: i, type: 'odd' },
        { l: i, r: i + 1, type: 'even' },
      ];

      for (const { l, r, type } of centers) {
        if (r >= n) continue;

        let left = l;
        let right = r;

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 10,
          explanation: `Testing ${type} center at indices (${left}, ${right}) -> characters '${s[left]}' and '${s[right]}'.`,
          state: {
            str: s,
            centerL: l,
            centerR: r,
            bestStart,
            bestLength,
            comparingL: left,
            comparingR: right,
            match: s[left] === s[right],
          },
        });

        while (left >= 0 && right < n && s[left] === s[right]) {
          const curLen = right - left + 1;
          if (curLen > bestLength) {
            bestLength = curLen;
            bestStart = left;
          }

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 5,
            explanation: `'${s[left]}' === '${s[right]}'! Palindrome candidate length ${curLen}: "${s.substring(left, right + 1)}". Expanding outward.`,
            state: {
              str: s,
              centerL: l,
              centerR: r,
              bestStart,
              bestLength,
              comparingL: left,
              comparingR: right,
              match: true,
            },
          });

          left--;
          right++;
        }
      }
    }

    // Final frame
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 18,
      explanation: `Search complete! Longest palindromic substring is "${s.substring(bestStart, bestStart + bestLength)}" (length ${bestLength}).`,
      state: {
        str: s,
        centerL: bestStart,
        centerR: bestStart + bestLength - 1,
        bestStart,
        bestLength,
        comparingL: null,
        comparingR: null,
        match: true,
      },
    });

    const total = frames.length;
    frames.forEach((f, idx) => {
      f.stepIndex = idx;
      f.totalSteps = total;
    });

    return frames;
  },
  renderStage: (frame: ExecutionFrame<LPSState>) => {
    const { str, bestStart, bestLength, comparingL, comparingR } = frame.state;

    return (
      <div className="flex flex-col items-center justify-center p-6 w-full min-h-[380px] gap-6">
        {/* Longest Substring Found */}
        <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-700 px-6 py-2.5 rounded-xl">
          <span className="text-xs font-mono text-slate-400">BEST PALINDROME:</span>
          <span className="text-xl font-bold font-mono text-emerald-400">
            "{str.substring(bestStart, bestStart + bestLength)}"
          </span>
          <span className="text-xs font-mono text-slate-500">(len: {bestLength})</span>
        </div>

        {/* Character String Visualizer */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl">
          {str.split('').map((char, idx) => {
            const inBest = idx >= bestStart && idx < bestStart + bestLength;
            const isComparingL = comparingL === idx;
            const isComparingR = comparingR === idx;

            let boxClass = 'border-slate-800 bg-slate-900/60';
            if (isComparingL || isComparingR) boxClass = 'border-amber-400 bg-amber-950/60 ring-2 ring-amber-400';
            else if (inBest) boxClass = 'border-emerald-500 bg-emerald-950/40';

            return (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div className={`relative flex flex-col items-center justify-center w-12 h-16 rounded-xl border-2 transition-all ${boxClass}`}>
                  <span className="text-xl font-bold font-mono text-white">{char}</span>
                  <span className="text-[10px] text-slate-400 font-mono">[{idx}]</span>

                  {/* Indicator labels */}
                  <div className="absolute -top-3 flex gap-0.5">
                    {isComparingL && <span className="bg-amber-500 text-slate-950 text-[8px] px-1 py-0.2 rounded font-mono font-bold">L</span>}
                    {isComparingR && <span className="bg-amber-500 text-slate-950 text-[8px] px-1 py-0.2 rounded font-mono font-bold">R</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
};
