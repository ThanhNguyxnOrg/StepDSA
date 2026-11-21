import React from 'react';
import { motion } from 'motion/react';
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
      isMilestone: true,
      milestoneTitle: 'LPS Initialized',
      soundCue: { type: 'start' },
      variables: { str: s, length: n, bestLength },
      callStack: [{ name: 'longestPalindrome', params: { s, n }, line: 2, isCurrent: true }],
      conditionEval: { expr: `n > 0`, result: n > 0 },
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
          soundCue: { type: 'compare' },
          variables: { centerType: type, left, right, leftChar: s[left], rightChar: s[right] },
          callStack: [{ name: 'expandAroundCenter', params: { left, right, type }, line: 10, isCurrent: true }],
          conditionEval: { expr: `s[left] == s[right] ('${s[left]}' == '${s[right]}')`, result: s[left] === s[right] },
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
          const isNewBest = curLen > bestLength;
          if (isNewBest) {
            bestLength = curLen;
            bestStart = left;
          }

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 5,
            explanation: `'${s[left]}' === '${s[right]}'! Palindrome candidate length ${curLen}: "${s.substring(left, right + 1)}". Expanding outward.`,
            soundCue: { type: isNewBest ? 'swap' : 'step' },
            isMilestone: isNewBest,
            milestoneTitle: isNewBest ? `New Best: "${s.substring(left, right + 1)}" (${curLen})` : undefined,
            variables: { curLen, palindrome: s.substring(left, right + 1), bestLength, left, right },
            callStack: [{ name: 'expandPalindrome', params: { left, right, len: curLen }, line: 5, isCurrent: true }],
            conditionEval: { expr: `curLen > bestLength (${curLen} > ${bestLength})`, result: isNewBest },
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
      isMilestone: true,
      milestoneTitle: `LPS: "${s.substring(bestStart, bestStart + bestLength)}"`,
      soundCue: { type: 'complete' },
      variables: { longestPalindrome: s.substring(bestStart, bestStart + bestLength), length: bestLength, completed: true },
      callStack: [{ name: 'longestPalindrome.done', params: { result: s.substring(bestStart, bestStart + bestLength) }, line: 18, isCurrent: true }],
      conditionEval: { expr: `bestLength >= 1`, result: true },
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
    const { str, centerL, centerR, bestStart, bestLength, comparingL, comparingR, match } = frame.state;
    const isExpanding = comparingL !== null && comparingR !== null;

    return (
      <div className="flex flex-col items-center justify-center p-4 sm:p-6 w-full min-h-[360px] gap-5 select-none">
        {/* Best Palindrome + Active Mirror Comparison HUD */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-2.5 bg-[#111827] border border-[#1F293D] px-4 py-2 rounded-xl shadow-sm">
            <span className="text-[10.5px] font-mono text-slate-400 uppercase">Best Palindrome:</span>
            <span className="text-lg font-extrabold font-mono text-emerald-400">
              &quot;{str.substring(bestStart, bestStart + bestLength)}&quot;
            </span>
            <span className="text-xs font-mono text-slate-400 tabular-nums">(len {bestLength})</span>
          </div>

          {isExpanding && (
            <div
              style={{
                backgroundColor: match ? 'var(--sem-sorted-bg)' : 'var(--sem-swapping-bg)',
                borderColor: match ? 'var(--sem-sorted-border)' : 'var(--sem-swapping-border)',
                color: match ? 'var(--sem-sorted-text)' : 'var(--sem-swapping-text)',
              }}
              className="px-3 py-2 rounded-xl border text-xs font-mono font-bold tabular-nums"
            >
              s[{comparingL}]=&apos;{str[comparingL]}&apos; {match ? '==' : '!='} s[{comparingR}]=&apos;{str[comparingR]}&apos;{' '}
              {match ? '→ Expand ◄ ►' : '→ Stop'}
            </div>
          )}
        </div>

        {/* Character Tape with Center Anchor & Mirror Expansion Bracket */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl pt-4 pb-2">
          {str.split('').map((char, idx) => {
            const inBest = idx >= bestStart && idx < bestStart + bestLength;
            const isComparingL = comparingL === idx;
            const isComparingR = comparingR === idx;
            const inCurrentSpan = isExpanding && idx >= comparingL && idx <= comparingR;
            const isCenter = idx === centerL || idx === centerR;

            const cellStyle: React.CSSProperties =
              isComparingL || isComparingR
                ? match
                  ? {
                      backgroundColor: 'var(--sem-sorted-bg)',
                      borderColor: 'var(--sem-sorted-border)',
                      color: 'var(--sem-sorted-text)',
                    }
                  : {
                      backgroundColor: 'var(--sem-swapping-bg)',
                      borderColor: 'var(--sem-swapping-border)',
                      color: 'var(--sem-swapping-text)',
                    }
                : inCurrentSpan
                ? {
                    backgroundColor: 'var(--sem-active-bg)',
                    borderColor: 'var(--sem-active-border)',
                    color: 'var(--sem-active-text)',
                  }
                : inBest
                ? {
                    backgroundColor: 'var(--sem-sorted-bg)',
                    borderColor: 'var(--sem-sorted-border)',
                    color: 'var(--sem-sorted-text)',
                  }
                : {
                    backgroundColor: 'var(--sem-default-cell-bg)',
                    borderColor: 'var(--sem-default-border)',
                    color: 'var(--sem-default-text)',
                  };

            return (
              <div key={idx} className="flex flex-col items-center gap-1">
                {/* Pointer Tag Row */}
                <div className="h-5 flex items-center justify-center gap-0.5">
                  {isComparingL && (
                    <motion.span
                      layoutId="lps-ptr-l"
                      style={{
                        backgroundColor: 'var(--sem-comparing-solid)',
                        color: 'var(--sem-comparing-on-solid)',
                      }}
                      className="theme-solid-badge text-[8.5px] px-1.5 py-0.5 rounded font-mono font-bold"
                    >
                      ←L
                    </motion.span>
                  )}
                  {isComparingR && (
                    <motion.span
                      layoutId="lps-ptr-r"
                      style={{
                        backgroundColor: 'var(--sem-comparing-solid)',
                        color: 'var(--sem-comparing-on-solid)',
                      }}
                      className="theme-solid-badge text-[8.5px] px-1.5 py-0.5 rounded font-mono font-bold"
                    >
                      R→
                    </motion.span>
                  )}
                  {!isComparingL && !isComparingR && isCenter && (
                    <span
                      style={{
                        backgroundColor: 'var(--sem-pivot-solid)',
                        color: 'var(--sem-pivot-on-solid)',
                      }}
                      className="theme-solid-badge text-[8px] px-1 py-0.5 rounded font-mono font-bold"
                    >
                      CTR
                    </span>
                  )}
                </div>

                {/* Character Cell */}
                <motion.div
                  layout
                  animate={{ scale: isComparingL || isComparingR ? 1.08 : 1 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                  style={cellStyle}
                  className={`relative flex flex-col items-center justify-center w-12 h-16 rounded-xl border-2 font-mono font-bold shadow-sm ${
                    isComparingL || isComparingR ? 'ring-2 ring-[#F59E0B]/45' : ''
                  }`}
                >
                  <span className="text-xl font-extrabold leading-none">{char}</span>
                  <span className="text-[9.5px] opacity-65 mt-1 tabular-nums">[{idx}]</span>
                </motion.div>

                {/* Active Span / Best Span Bar */}
                <div className="h-4 flex items-center justify-center w-full">
                  {inCurrentSpan ? (
                    <div
                      style={{
                        backgroundColor: match ? 'var(--sem-active-solid)' : 'var(--sem-swapping-solid)',
                      }}
                      className="w-full h-1.5 rounded-full"
                    />
                  ) : inBest ? (
                    <div
                      style={{ backgroundColor: 'var(--sem-sorted-solid)' }}
                      className="w-full h-1 rounded-full opacity-75"
                    />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
};
