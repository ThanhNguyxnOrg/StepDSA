import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface SuffixEntry {
  rank: number;
  saIndex: number;
  suffix: string;
  lcp: number;
}

export interface SuffixArrayKasaiState {
  text: string;
  suffixArray: number[];
  lcpArray: number[];
  entries: SuffixEntry[];
  currentI: number | null;
  currentH: number;
  comparedSuffixA: string | null;
  comparedSuffixB: string | null;
  message: string;
}

export const suffixArrayKasaiModule: AlgorithmModule<
  { text: string },
  SuffixArrayKasaiState
> = {
  id: 'suffix-array-kasai',
  title: "Suffix Array & LCP Array (Kasai's Linear-Time Inversion O(N))",
  category: 'searching',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(N log N) build / O(N) Kasai LCP',
    timeAverage: 'O(N log N) build / O(N) Kasai LCP',
    timeWorst: 'O(N log N) build / O(N) Kasai LCP',
    spaceAuxiliary: 'O(N) suffix rank & LCP arrays',
    worstCaseCondition: 'Kasai LCP height h decreases at most once per position, guaranteeing at most 2N comparisons',
  },
  theory: {
    overview:
      "A Suffix Array (SA) is a lexicographically sorted array of all suffixes of a string. Kasai's algorithm computes the Longest Common Prefix (LCP) array between consecutive suffixes in strictly linear O(N) time.",
    whyItWorks:
      'Kasai discovered that if suffix i has an LCP of h with its predecessor in the suffix array, then suffix i + 1 must share an LCP of at least h - 1 with its predecessor. Thus, h decreases by at most 1 in each step, bounding total comparisons by 2N.',
    invariant:
      'Kasai Height Bound: LCP[rank[i + 1]] >= LCP[rank[i]] - 1. Scanning in original text order i = 0..N-1 eliminates redundant character checks.',
    pitfalls: [
      'Iterating through the suffix array in lexicographical order rather than original text order i, which forfeits the O(N) amortized bound.',
      'Missing bounds check when rank[i] == 0 (the first lexicographical suffix has no predecessor).',
    ],
  },
  presets: [
    {
      id: 'kasai-banana',
      label: 'Classic "banana"',
      description: 'Suffixes: "a", "ana", "anana", "banana", "na", "nana" with LCP [0, 1, 3, 0, 0, 2]',
      data: {
        text: 'banana',
      },
    },
    {
      id: 'kasai-abracadabra',
      label: 'Word "abracadabra"',
      description: 'Larger repetitive alphabet demonstrating linear LCP jumps',
      data: {
        text: 'abracadabra',
      },
    },
  ],
  defaultInput: {
    text: 'banana',
  },
  codeSnippets: {
    cpp: `vector<int> buildLCP(const string& s, const vector<int>& sa) {
    int n = s.size();
    vector<int> rank(n, 0), lcp(n, 0);
    for (int i = 0; i < n; i++) rank[sa[i]] = i;

    int h = 0;
    for (int i = 0; i < n; i++) {
        if (rank[i] > 0) {
            int prev = sa[rank[i] - 1];
            while (i + h < n && prev + h < n && s[i + h] == s[prev + h]) h++;
            lcp[rank[i]] = h;
            if (h > 0) h--;
        }
    }
    return lcp;
}`,
    python: `def build_lcp(s, sa):
    n = len(s)
    rank = [0] * n
    for i, p in enumerate(sa): rank[p] = i

    lcp = [0] * n
    h = 0
    for i in range(n):
        if rank[i] > 0:
            prev = sa[rank[i] - 1]
            while i + h < n and prev + h < n and s[i + h] == s[prev + h]:
                h += 1
            lcp[rank[i]] = h
            if h > 0: h -= 1
    return lcp`,
    typescript: `function buildLCP(s: string, sa: number[]): number[] {
  const n = s.length;
  const rank: number[] = new Array(n);
  for (let i = 0; i < n; i++) rank[sa[i]] = i;

  const lcp: number[] = new Array(n).fill(0);
  let h = 0;
  for (let i = 0; i < n; i++) {
    if (rank[i] > 0) {
      const prev = sa[rank[i] - 1];
      while (i + h < n && prev + h < n && s[i + h] === s[prev + h]) h++;
      lcp[rank[i]] = h;
      if (h > 0) h--;
    }
  }
  return lcp;
}`,
    java: `public static int[] buildLCP(String s, int[] sa) {
    int n = s.length();
    int[] rank = new int[n], lcp = new int[n];
    for (int i = 0; i < n; i++) rank[sa[i]] = i;
    int h = 0;
    for (int i = 0; i < n; i++) {
        if (rank[i] > 0) {
            int prev = sa[rank[i] - 1];
            while (i + h < n && prev + h < n && s.charAt(i + h) == s.charAt(prev + h)) h++;
            lcp[rank[i]] = h;
            if (h > 0) h--;
        }
    }
    return lcp;
}`,
    pseudocode: `function kasai(S, SA):
    for i = 0 to N-1: rank[SA[i]] = i
    h = 0
    for i = 0 to N-1:
        if rank[i] > 0:
            prev = SA[rank[i] - 1]
            while S[i+h] == S[prev+h]: h++
            LCP[rank[i]] = h
            if h > 0: h--`,
  },
  generateTimeline: (input: { text: string }): ExecutionFrame<SuffixArrayKasaiState>[] => {
    const s = input?.text?.length ? input.text : 'banana';
    const n = s.length;

    // Suffix array construction (lexicographical sort of suffix indices)
    const sa: number[] = Array.from({ length: n }, (_, i) => i);
    sa.sort((a, b) => s.slice(a).localeCompare(s.slice(b)));

    const rank: number[] = new Array(n);
    for (let i = 0; i < n; i++) rank[sa[i]] = i;

    const lcp: number[] = new Array(n).fill(0);
    const frames: ExecutionFrame<SuffixArrayKasaiState>[] = [];

    function makeEntries(): SuffixEntry[] {
      return sa.map((p, r) => ({
        rank: r,
        saIndex: p,
        suffix: s.slice(p),
        lcp: lcp[r],
      }));
    }

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      isMilestone: true,
      milestoneTitle: `Init Suffix Array & Rank (${n} Suffixes)`,
      action: 'INIT',
      state: {
        text: s,
        suffixArray: [...sa],
        lcpArray: [...lcp],
        entries: makeEntries(),
        currentI: null,
        currentH: 0,
        comparedSuffixA: null,
        comparedSuffixB: null,
        message: `Constructed Suffix Array for "${s}" with ${n} suffixes. Starting Kasai LCP algorithm.`,
      },
      callStack: [{ name: 'initKasai', params: { textLength: n }, line: 1, isCurrent: true }],
      variables: { text: s, totalSuffixes: n, currentH: 0, suffixOrder: sa.map((i) => `"${s.slice(i)}"`).join(', ') },
      conditionEval: { expr: 'text.length > 0', result: true },
      soundCue: { type: 'step' },
      explanation: `Suffix array built and lexicographically sorted. Initiating Kasai's linear-time LCP construction across text positions i=0..${n - 1}.`,
    });

    let h = 0;
    for (let i = 0; i < n; i++) {
      const r = rank[i];

      if (r === 0) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 9,
          action: 'SKIP_FIRST_RANK',
          state: {
            text: s,
            suffixArray: [...sa],
            lcpArray: [...lcp],
            entries: makeEntries(),
            currentI: i,
            currentH: h,
            comparedSuffixA: s.slice(i),
            comparedSuffixB: null,
            message: `Suffix "${s.slice(i)}" (i=${i}) has rank 0 (first in SA). LCP[0] = 0.`,
          },
          callStack: [{ name: 'processSuffix', params: { i, rank: 0 }, line: 9, isCurrent: true }],
          variables: { i, rank: 0, suffix: s.slice(i), lcp: 0 },
          conditionEval: { expr: `rank[${i}] === 0`, result: true },
          soundCue: { type: 'step' },
          explanation: `Suffix at i=${i} is rank 0. It has no predecessor in the sorted Suffix Array, so LCP is trivially 0.`,
        });
        continue;
      }

      const prev = sa[r - 1];
      const startH = h;

      // Frame: Kasai guarantee explanation
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 11,
        action: 'KASAI_GUARANTEE',
        state: {
          text: s,
          suffixArray: [...sa],
          lcpArray: [...lcp],
          entries: makeEntries(),
          currentI: i,
          currentH: h,
          comparedSuffixA: s.slice(i),
          comparedSuffixB: s.slice(prev),
          message: `Kasai guarantee: Suffix i=${i} ("${s.slice(i)}") shares at least h=${startH} characters with predecessor "${s.slice(prev)}".`,
        },
        callStack: [{ name: 'kasaiBound', params: { i, prev, guaranteedH: startH }, line: 11, isCurrent: true }],
        variables: { currentI: i, predecessorIdx: prev, guaranteedCommonPrefix: startH },
        conditionEval: { expr: `h >= startH (${startH})`, result: true },
        soundCue: { type: 'compare' },
        explanation: `By Kasai's theorem, we skip comparing the first ${startH} characters because LCP[rank[i]] >= LCP[rank[i-1]] - 1. Scanning starts at offset ${startH}.`,
      });

      while (i + h < n && prev + h < n && s[i + h] === s[prev + h]) {
        h++;
      }
      lcp[r] = h;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 14,
        isMilestone: h > 1,
        milestoneTitle: h > 1 ? `LCP = ${h} ("${s.slice(i, i + h)}")` : undefined,
        action: 'COMPUTE_LCP',
        state: {
          text: s,
          suffixArray: [...sa],
          lcpArray: [...lcp],
          entries: makeEntries(),
          currentI: i,
          currentH: h,
          comparedSuffixA: s.slice(i),
          comparedSuffixB: s.slice(prev),
          message: `i=${i} ("${s.slice(i)}") vs predecessor prev=${prev} ("${s.slice(prev)}"): LCP = ${h} (reused h>=${startH})`,
        },
        callStack: [{ name: 'computeLCP', params: { i, prev, lcp: h }, line: 14, isCurrent: true }],
        variables: { i, prev, rank: r, lcp: h, reusedPrefix: startH, commonPrefix: s.slice(i, i + h) },
        conditionEval: { expr: `s[${i}+${h}] !== s[${prev}+${h}] || atEnd`, result: true },
        soundCue: { type: 'swap' },
        explanation: `Comparing suffix i=${i} ("${s.slice(i)}") against predecessor "${s.slice(
          prev
        )}": matching length = ${h} ("${s.slice(i, i + h)}"). Stored LCP[${r}] = ${h}.`,
      });

      if (h > 0) h--;
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 20,
      isMilestone: true,
      milestoneTitle: `LCP Array Complete: [${lcp.join(', ')}]`,
      action: 'COMPLETE',
      state: {
        text: s,
        suffixArray: [...sa],
        lcpArray: [...lcp],
        entries: makeEntries(),
        currentI: null,
        currentH: 0,
        comparedSuffixA: null,
        comparedSuffixB: null,
        message: `Kasai algorithm completed in linear O(N) time. Max LCP = ${Math.max(...lcp)}.`,
      },
      callStack: [{ name: 'complete', params: { maxLCP: Math.max(...lcp) }, line: 20, isCurrent: true }],
      variables: { completed: true, lcpArray: `[${lcp.join(', ')}]`, maxLCP: Math.max(...lcp) },
      conditionEval: { expr: 'allSuffixesProcessed', result: true },
      soundCue: { type: 'complete' },
      explanation: `LCP array successfully computed in O(N) linear time! The amortized number of character comparisons is bounded by 2N.`,
    });

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });
    return frames;
  },
  renderStage: (frame: ExecutionFrame<SuffixArrayKasaiState>) => {
    const { text, entries, currentI, currentH, comparedSuffixA, comparedSuffixB, message } =
      frame.state;

    return (
      <div className="flex flex-col items-center justify-center p-6 gap-6 w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Status:</span>
            <span className="font-mono text-xs text-slate-200">{message}</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span>Current h: <strong className="text-amber-400 text-sm">{currentH}</strong></span>
            <span>Text Length: <strong className="text-cyan-400">{text.length}</strong></span>
          </div>
        </div>

        {/* Comparison Banner */}
        {comparedSuffixA && (
          <div className="flex items-center justify-center gap-4 w-full bg-slate-900/50 border border-slate-800 rounded-xl p-3 font-mono text-xs">
            <span className="text-cyan-400 font-bold">Suffix A: "{comparedSuffixA}"</span>
            <span className="text-slate-500">vs</span>
            <span className="text-amber-400 font-bold">
              Suffix B: {comparedSuffixB ? `"${comparedSuffixB}"` : '(None - Rank 0)'}
            </span>
          </div>
        )}

        {/* Suffix Array and LCP Table */}
        <div className="relative overflow-x-auto bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 shadow-inner max-w-full w-full">
          <table className="w-full border-collapse font-mono text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="p-2 w-16 text-center">Rank</th>
                <th className="p-2 w-20 text-center">SA[i]</th>
                <th className="p-2 w-20 text-center">LCP</th>
                <th className="p-2">Suffix String</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const isActive = currentI !== null && entry.saIndex === currentI;

                return (
                  <tr
                    key={`sa-${entry.rank}`}
                    className={`border-b border-slate-800/40 transition-colors duration-200 ${
                      isActive ? 'bg-amber-500/10' : 'hover:bg-slate-900/50'
                    }`}
                  >
                    <td className="p-2 text-center text-slate-400">{entry.rank}</td>
                    <td className="p-2 text-center text-cyan-400 font-bold">{entry.saIndex}</td>
                    <td className="p-2 text-center">
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">
                        {entry.lcp}
                      </span>
                    </td>
                    <td className="p-2 text-slate-200">
                      <span className="text-emerald-400 font-bold">
                        {entry.suffix.slice(0, entry.lcp)}
                      </span>
                      <span>{entry.suffix.slice(entry.lcp)}</span>
                      <span className="text-slate-600 ml-1">$</span>
                    </td>
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
