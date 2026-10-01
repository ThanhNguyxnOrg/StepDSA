import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface RabinKarpInput {
  text: string;
  pattern: string;
}

export interface RabinKarpState {
  text: string;
  pattern: string;
  windowStart: number;
  patternHash: number;
  windowHash: number;
  status: 'hashing' | 'match' | 'spurious-hit' | 'mismatch' | 'done';
  matchedIndices: number[];
}

export const rabinKarpModule: AlgorithmModule<RabinKarpInput, RabinKarpState> = {
  id: 'rabin-karp',
  title: 'Rabin-Karp (Rolling Hash Match)',
  category: 'searching',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N + M)',
    timeAverage: 'O(N + M)',
    timeWorst: 'O(N * M)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Poor hash function causing pathological spurious collisions on all positions',
  },
  theory: {
    overview:
      'The Rabin-Karp algorithm searches for an M-length pattern within an N-length text by comparing polynomial rolling hashes. If the window hash matches the pattern hash, it validates character-by-character to avoid false positives (spurious hits). Rolling hash updates take O(1) time per shift.',
    whyItWorks:
      'Using Horner’s rule modulo a prime Q, removing the leftmost character and incorporating the incoming rightmost character is performed via constant arithmetic operations without rescanning the entire window.',
    invariant:
      'At step i, windowHash accurately reflects the polynomial hash of text[i ... i+M-1]. A character-level match check is executed if and only if windowHash == patternHash.',
    pitfalls: [
      'Integer overflow if modular arithmetic is omitted when calculating high powers of the base.',
      'Negative modulo results in languages like C++/Java when subtracting the outgoing character hash.',
    ],
  },
  presets: [
    {
      id: 'standard',
      label: 'Standard Match',
      description: 'Pattern "DSA" in textbook string',
      data: { text: 'LEARN_DSA_WITH_STEPDSA_VISUALIZER', pattern: 'DSA' },
    },
    {
      id: 'collision-test',
      label: 'Repeated Chars',
      description: 'Search "AABA" in repetitive text',
      data: { text: 'AABRAACADABRAAABA', pattern: 'AABA' },
    },
  ],
  defaultInput: { text: 'LEARN_DSA_WITH_STEPDSA_VISUALIZER', pattern: 'DSA' },
  codeSnippets: {
    python: `def rabin_karp(text, pattern):
    N, M = len(text), len(pattern)
    d, q = 256, 101
    h = pow(d, M - 1, q)
    p_hash, t_hash = 0, 0
    matches = []

    for i in range(M):
        p_hash = (d * p_hash + ord(pattern[i])) % q
        t_hash = (d * t_hash + ord(text[i])) % q

    for i in range(N - M + 1):
        if p_hash == t_hash:
            if text[i:i+M] == pattern:
                matches.append(i)
        if i < N - M:
            t_hash = (d * (t_hash - ord(text[i]) * h) + ord(text[i + M])) % q
            t_hash = (t_hash + q) % q
    return matches`,
    typescript: `function rabinKarp(text: string, pattern: string): number[] {
  const N = text.length, M = pattern.length;
  const d = 256, q = 101;
  let h = 1;
  for (let i = 0; i < M - 1; i++) h = (h * d) % q;

  let pHash = 0, tHash = 0;
  for (let i = 0; i < M; i++) {
    pHash = (d * pHash + pattern.charCodeAt(i)) % q;
    tHash = (d * tHash + text.charCodeAt(i)) % q;
  }

  const matches: number[] = [];
  for (let i = 0; i <= N - M; i++) {
    if (pHash === tHash && text.substring(i, i + M) === pattern) {
      matches.push(i);
    }
    if (i < N - M) {
      tHash = (d * (tHash - text.charCodeAt(i) * h) + text.charCodeAt(i + M)) % q;
      if (tHash < 0) tHash += q;
    }
  }
  return matches;
}`,
    cpp: `vector<int> rabinKarp(const string& text, const string& pattern) {
    int N = text.size(), M = pattern.size();
    int d = 256, q = 101, h = 1;
    for (int i = 0; i < M - 1; i++) h = (h * d) % q;
    int p = 0, t = 0;
    for (int i = 0; i < M; i++) {
        p = (d * p + pattern[i]) % q;
        t = (d * t + text[i]) % q;
    }
    vector<int> matches;
    for (int i = 0; i <= N - M; i++) {
        if (p == t && text.substr(i, M) == pattern) matches.push_back(i);
        if (i < N - M) {
            t = (d * (t - text[i] * h) + text[i + M]) % q;
            if (t < 0) t += q;
        }
    }
    return matches;
}`,
    java: `public List<Integer> rabinKarp(String text, String pattern) {
    int N = text.length(), M = pattern.length();
    int d = 256, q = 101, h = 1;
    for (int i = 0; i < M - 1; i++) h = (h * d) % q;
    int p = 0, t = 0;
    for (int i = 0; i < M; i++) {
        p = (d * p + pattern.charAt(i)) % q;
        t = (d * t + text.charAt(i)) % q;
    }
    List<Integer> matches = new ArrayList<>();
    for (int i = 0; i <= N - M; i++) {
        if (p == t && text.substring(i, i + M).equals(pattern)) matches.add(i);
        if (i < N - M) {
            t = (d * (t - text.charAt(i) * h) + text.charAt(i + M)) % q;
            if (t < 0) t += q;
        }
    }
    return matches;
}`,
    pseudocode: `function rabinKarp(T, P):
    pHash = hash(P)
    wHash = hash(T[0..M-1])
    for i = 0 to N - M:
        if pHash == wHash:
            if T[i..i+M-1] == P: report match at i
        wHash = rollHash(wHash, T[i], T[i+M])`,
  },

  generateTimeline: (input: RabinKarpInput): ExecutionFrame<RabinKarpState>[] => {
    const frames: ExecutionFrame<RabinKarpState>[] = [];
    const text = input.text;
    const pattern = input.pattern;
    const N = text.length;
    const M = pattern.length;
    const d = 256;
    const q = 101;

    let h = 1;
    for (let i = 0; i < M - 1; i++) h = (h * d) % q;

    let pHash = 0;
    let tHash = 0;
    for (let i = 0; i < M; i++) {
      pHash = (d * pHash + pattern.charCodeAt(i)) % q;
      tHash = (d * tHash + text.charCodeAt(i)) % q;
    }

    const matches: number[] = [];

    // Frame 0: Initial hashes calculated
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: `Precalculated hash for pattern "${pattern}" = ${pHash} (mod ${q}). Initial window [0 ... ${M - 1}] hash = ${tHash}.`,
      isMilestone: true,
      milestoneTitle: 'Pattern Hash Ready',
      soundCue: { type: 'start' },
      variables: { patternHash: pHash, initialWindowHash: tHash, base: d, prime: q, M, N },
      callStack: [{ name: 'rabinKarp', params: { pattern, M, N }, line: 1, isCurrent: true }],
      conditionEval: { expr: `M <= N (${M} <= ${N})`, result: M <= N },
      scopeVariables: { patternHash: pHash, initialWindowHash: tHash, base: d, prime: q },
      state: {
        text,
        pattern,
        windowStart: 0,
        patternHash: pHash,
        windowHash: tHash,
        status: 'hashing',
        matchedIndices: [],
      },
    });

    for (let i = 0; i <= N - M; i++) {
      const windowStr = text.substring(i, i + M);
      const isHashMatch = pHash === tHash;
      const isExactMatch = isHashMatch && windowStr === pattern;

      if (isHashMatch) {
        if (isExactMatch) {
          matches.push(i);
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 12,
            explanation: `🎯 MATCH FOUND at index ${i}! Window hash (${tHash}) == Pattern hash (${pHash}) and string equality verified: "${windowStr}".`,
            isMilestone: true,
            milestoneTitle: `Match at [${i}]`,
            soundCue: { type: 'complete' },
            variables: { matchIndex: i, window: windowStr, hash: tHash, pHash, isExactMatch: true },
            callStack: [{ name: 'verifyMatch', params: { index: i, windowStr }, line: 12, isCurrent: true }],
            conditionEval: { expr: `windowHash == patternHash && windowStr == pattern`, result: true },
            scopeVariables: { matchIndex: i, window: windowStr, hash: tHash },
            state: {
              text,
              pattern,
              windowStart: i,
              patternHash: pHash,
              windowHash: tHash,
              status: 'match',
              matchedIndices: [...matches],
            },
          });
        } else {
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 13,
            explanation: `⚠️ Spurious Hit at index ${i}: Hash matches (${tHash} == ${pHash}), but character comparison failed ("${windowStr}" != "${pattern}").`,
            soundCue: { type: 'compare' },
            variables: { collisionIndex: i, window: windowStr, hash: tHash, pHash, spuriousHit: true },
            callStack: [{ name: 'verifyMatch', params: { index: i, windowStr }, line: 13, isCurrent: true }],
            conditionEval: { expr: `windowStr == pattern ("${windowStr}" == "${pattern}")`, result: false },
            scopeVariables: { collisionIndex: i, window: windowStr, hash: tHash },
            state: {
              text,
              pattern,
              windowStart: i,
              patternHash: pHash,
              windowHash: tHash,
              status: 'spurious-hit',
              matchedIndices: [...matches],
            },
          });
        }
      } else {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 11,
          explanation: `Window [${i} ... ${i + M - 1}] "${windowStr}": Window hash (${tHash}) != Pattern hash (${pHash}). Skipping character comparison.`,
          soundCue: { type: 'step' },
          variables: { index: i, window: windowStr, windowHash: tHash, patternHash: pHash, hashMatch: false },
          callStack: [{ name: 'checkWindowHash', params: { i, tHash }, line: 11, isCurrent: true }],
          conditionEval: { expr: `pHash == tHash (${pHash} == ${tHash})`, result: false },
          scopeVariables: { index: i, window: windowStr, windowHash: tHash, patternHash: pHash },
          state: {
            text,
            pattern,
            windowStart: i,
            patternHash: pHash,
            windowHash: tHash,
            status: 'mismatch',
            matchedIndices: [...matches],
          },
        });
      }

      if (i < N - M) {
        tHash = (d * (tHash - text.charCodeAt(i) * h) + text.charCodeAt(i + M)) % q;
        if (tHash < 0) tHash += q;
      }
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 16,
      explanation: `🎉 Rabin-Karp search complete! Found ${matches.length} total occurrences at indices: [${matches.join(', ')}].`,
      isMilestone: true,
      milestoneTitle: 'Search Complete',
      soundCue: { type: 'complete' },
      variables: { totalMatches: matches.length, matchPositions: matches.join(', '), completed: true },
      callStack: [{ name: 'rabinKarp.done', params: { matches: matches.length }, line: 16, isCurrent: true }],
      conditionEval: { expr: `i > N - M`, result: true },
      scopeVariables: { totalMatches: matches.length, matchPositions: matches.join(', ') },
      state: {
        text,
        pattern,
        windowStart: N - M,
        patternHash: pHash,
        windowHash: tHash,
        status: 'done',
        matchedIndices: [...matches],
      },
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },

  renderStage: (frame: ExecutionFrame<RabinKarpState>) => {
    const { text, pattern, windowStart, patternHash, windowHash, status, matchedIndices } =
      frame.state;
    const M = pattern.length;

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-6">
        {/* Hashes HUD */}
        <div className="flex items-center gap-6 mb-8">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
            <span className="text-xs font-mono text-slate-400">Pattern Hash:</span>
            <span className="font-mono text-sm font-bold text-amber-400">{patternHash}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
            <span className="text-xs font-mono text-slate-400">Window Hash:</span>
            <span
              className={`font-mono text-sm font-bold ${
                patternHash === windowHash ? 'text-emerald-400 animate-pulse' : 'text-slate-200'
              }`}
            >
              {windowHash}
            </span>
          </div>
          <div
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold uppercase tracking-wider ${
              status === 'match'
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-emerald-500/20 shadow-lg'
                : status === 'spurious-hit'
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-rose-500/20 shadow-lg'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            {status}
          </div>
        </div>

        {/* Text Sequence Stream */}
        <div className="flex flex-col items-center max-w-4xl w-full">
          <div className="flex items-center gap-1.5 overflow-x-auto py-4 px-2">
            {text.split('').map((char, idx) => {
              const inWindow = idx >= windowStart && idx < windowStart + M;
              const isMatch = matchedIndices.includes(idx);

              return (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-base border-2 transition-all duration-200 ${
                      inWindow
                        ? status === 'match'
                          ? 'border-emerald-400 bg-emerald-950/70 text-emerald-200 ring-2 ring-emerald-400/30 scale-105'
                          : status === 'spurious-hit'
                          ? 'border-rose-400 bg-rose-950/70 text-rose-200 ring-2 ring-rose-400/30 scale-105'
                          : 'border-cyan-400 bg-cyan-950/70 text-cyan-200 ring-2 ring-cyan-400/30 scale-105'
                        : isMatch
                        ? 'border-emerald-600/60 bg-emerald-950/30 text-emerald-300'
                        : 'border-slate-800 bg-slate-900/90 text-slate-300'
                    }`}
                  >
                    {char}
                  </div>
                  <span className="mt-1 text-[10px] font-mono text-slate-500">{idx}</span>
                </div>
              );
            })}
          </div>

          {/* Sliding Pattern Guide */}
          <div className="mt-4 flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Pattern:</span>
            <span className="font-bold text-amber-400 tracking-widest px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
              {pattern}
            </span>
          </div>
        </div>
      </div>
    );
  },
};
