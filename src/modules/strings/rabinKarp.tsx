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
    pseudocode: `function rabinKarp(T, P):
    N = length(T)
    M = length(P)
    d = 256, q = 101
    h = pow(d, M - 1) mod q
    pHash = 0
    wHash = 0
    matches = []
    for i = 0 to M - 1:
        pHash = (d * pHash + P[i]) mod q
        wHash = (d * wHash + T[i]) mod q
    for i = 0 to N - M:
        if pHash == wHash:
            if T[i..i+M-1] == P: record match at i
        if i < N - M:
            wHash = (d * (wHash - T[i] * h) + T[i+M]) mod q
            wHash = (wHash + q) mod q
    return matches`,
    python: `def rabin_karp(text, pattern):
    N, M = len(text), len(pattern)
    d, q = 256, 101
    h = pow(d, M - 1, q)
    p_hash = 0
    t_hash = 0
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
    tHash = (d * tHash + text.charCodeAt(i)) % q; }
  const matches: number[] = [];
  for (let i = 0; i <= N - M; i++) {
    if (pHash === tHash) {
      if (text.substring(i, i + M) === pattern) {
        matches.push(i); } }
    if (i < N - M) {
      tHash = (d * (tHash - text.charCodeAt(i) * h) + text.charCodeAt(i + M)) % q;
      if (tHash < 0) tHash += q; } }
  return matches; }`,
    cpp: `vector<int> rabinKarp(const string& text, const string& pattern) {
  int N = text.size(), M = pattern.size();
  int d = 256, q = 101;
  int h = 1;
  for (int i = 0; i < M - 1; i++) h = (h * d) % q;
  int p = 0, t = 0;
  for (int i = 0; i < M; i++) {
    p = (d * p + pattern[i]) % q;
    t = (d * t + text[i]) % q; }
  vector<int> matches;
  for (int i = 0; i <= N - M; i++) {
    if (p == t) {
      if (text.substr(i, M) == pattern) {
        matches.push_back(i); } }
    if (i < N - M) {
      t = (d * (t - text[i] * h) + text[i + M]) % q;
      if (t < 0) t += q; } }
  return matches; }`,
    java: `static List<Integer> rabinKarp(String text, String pattern) {
  int N = text.length(), M = pattern.length;
  int d = 256, q = 101;
  int h = 1;
  for (int i = 0; i < M - 1; i++) h = (h * d) % q;
  int p = 0, t = 0;
  for (int i = 0; i < M; i++) {
    p = (d * p + pattern.charAt(i)) % q;
    t = (d * t + text.charAt(i)) % q; }
  List<Integer> matches = new ArrayList<>();
  for (int i = 0; i <= N - M; i++) {
    if (p == t) {
      if (text.substring(i, i + M).equals(pattern)) {
        matches.add(i); } }
    if (i < N - M) {
      t = (d * (t - text.charAt(i) * h) + text.charAt(i + M)) % q;
      if (t < 0) t += q; } }
  return matches; }`,
  },

  generateTimeline: (input: RabinKarpInput): ExecutionFrame<RabinKarpState>[] => {
    const text = input?.text || 'LEARN_DSA_WITH_STEPDSA_VISUALIZER';
    const pattern = input?.pattern || 'DSA';
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
    const frames: ExecutionFrame<RabinKarpState>[] = [];

    let rollCheckpointAdded = false;
    let firstMatchMilestoneUsed = false;

    let actionType: 'INIT' | 'HASH_COMPARE' | 'VERIFY_MATCH' | 'SPURIOUS_HIT' | 'ROLL_HASH' | 'DONE' = 'INIT';

    const pushFrame = (opts: {
      codeLine: number;
      explanation: string;
      pedagogy: { what: string; why: string; whatNext: string };
      variables?: Record<string, any>;
      conditionEval?: ExecutionFrame<RabinKarpState>['conditionEval'];
      milestone?: string;
      soundCue?: ExecutionFrame<RabinKarpState>['soundCue'];
      checkpoint?: ExecutionFrame<RabinKarpState>['checkpoint'];
      windowStart: number;
      patternHash: number;
      windowHash: number;
      status: RabinKarpState['status'];
    }) => {
      frames.push({
        stepIndex: frames.length,
        totalSteps: frames.length + 1,
        codeLine: opts.codeLine,
        action: actionType,
        explanation: opts.explanation,
        variables: opts.variables,
        conditionEval: opts.conditionEval,
        invariantStatus: {
          label:
            opts.status === 'done'
              ? `scan finished — ${matches.length} occurrence(s) of "${pattern}" found`
              : `windowHash reflects text[${opts.windowStart}..${opts.windowStart + M - 1}] exactly`,
          isValid: true,
        },
        isMilestone: !!opts.milestone,
        milestoneTitle: opts.milestone,
        soundCue: opts.soundCue ?? 'step',
        pedagogy: opts.pedagogy,
        ...(opts.checkpoint ? { checkpoint: opts.checkpoint } : {}),
        callStack: [{ name: 'rabinKarp', params: { pattern, M, N }, line: opts.codeLine, isCurrent: true }],
        scopeVariables: opts.variables ?? {},
        state: {
          text,
          pattern,
          windowStart: opts.windowStart,
          patternHash: opts.patternHash,
          windowHash: opts.windowHash,
          status: opts.status,
          matchedIndices: [...matches],
        },
      });
    };

    // ── Frame 0: initialisation ─────────────────────────────────────────────
    if (M > 0 && M <= N) {
      actionType = 'INIT';
      pushFrame({
        codeLine: 4,
        explanation:
          `Precalculated hash for pattern "${pattern}" = ${pHash} (mod ${q}). Initial window [0..${M - 1}] hash = ${tHash}.` +
          ` Rolling multiplier h = d^(M-1) mod q = ${h}.`,
        variables: { patternHash: pHash, initialWindowHash: tHash, base: d, prime: q, M, N },
        conditionEval: { expr: 'M <= N', condition: `${M} <= ${N}`, result: M <= N },
        soundCue: 'start',
        milestone: 'Pattern Hash Ready',
        windowStart: 0,
        patternHash: pHash,
        windowHash: tHash,
        status: 'hashing',
        pedagogy: {
          what: `The pattern hash is ${pHash} and the initial window hash is ${tHash} — both computed in O(M) once.`,
          why: 'Rolling hashes let us compare M characters in O(1): equal hashes strongly suggest equal strings.',
          whatNext: `Slide the window from index 0 to ${N - M}, comparing hashes at each position.`,
        },
        checkpoint: {
          id: 'rabin-karp-verify',
          question: `Even when patternHash == windowHash, the strings might differ. Why is character verification still needed?`,
          options: [
            'Two different strings can produce the same hash (collision / spurious hit)',
            'The hash is only an approximation and is usually wrong',
            'Verification is needed to update the rolling hash',
          ],
          correctIndex: 0,
          explanation: `Modular hashing maps many strings to the same value. When hashes match we must verify characters to distinguish a true match from a spurious hit.`,
          hint: 'Can two different inputs produce the same output modulo q?',
        },
      });
      // verify checkpoint armed at INIT (single-emit via !verifyCheckpoint flag)

      for (let i = 0; i <= N - M; i++) {
        const windowStr = text.substring(i, i + M);
        const isHashMatch = pHash === tHash;
        const isExactMatch = isHashMatch && windowStr === pattern;

        if (isHashMatch) {
          if (isExactMatch) {
            matches.push(i);
            actionType = 'VERIFY_MATCH';

            const matchMilestone = !firstMatchMilestoneUsed ? 'First Match Found' : undefined;
            if (matchMilestone) firstMatchMilestoneUsed = true;

            pushFrame({
              codeLine: 13,
              explanation: `🎯 MATCH FOUND at index ${i}! Window hash (${tHash}) == Pattern hash (${pHash}) and string equality verified: "${windowStr}".`,
              milestone: matchMilestone,
              soundCue: 'complete',
              variables: { matchIndex: i, window: windowStr, hash: tHash, pHash, isExactMatch: true },
              conditionEval: { expr: 'pHash == tHash && windowStr == pattern', condition: `${tHash} == ${pHash} && "${windowStr}"`, result: true },
              windowStart: i,
              patternHash: pHash,
              windowHash: tHash,
              status: 'match',
              pedagogy: {
                what: `Hashes match AND the substring "${windowStr}" equals the pattern character-for-character.`,
                why: 'Both conditions together confirm a genuine occurrence — the hash narrowed the candidates, the check confirms it.',
                whatNext: 'Record the index and continue scanning for more occurrences.',
              },
            });
          } else {
            actionType = 'SPURIOUS_HIT';
            pushFrame({
              codeLine: 12,
              explanation: `⚠️ Spurious Hit at index ${i}: Hash matches (${tHash} == ${pHash}), but character comparison failed ("${windowStr}" != "${pattern}").`,
              soundCue: 'compare',
              variables: { collisionIndex: i, window: windowStr, hash: tHash, pHash, spuriousHit: true },
              conditionEval: { expr: 'windowStr == pattern', condition: `"${windowStr}" == "${pattern}"`, result: false },
              windowStart: i,
              patternHash: pHash,
              windowHash: tHash,
              status: 'spurious-hit',
              pedagogy: {
                what: `The hashes collided but the actual strings differ: "${windowStr}" ≠ "${pattern}".`,
                why: 'This is a false positive from modular hashing — the character check catches it, keeping the algorithm correct.',
                whatNext: 'Roll the hash and move to the next window position.',
              },
            });
          }
        } else {
          actionType = 'HASH_COMPARE';
          pushFrame({
            codeLine: 11,
            explanation: `Window [${i}..${i + M - 1}] "${windowStr}": hash ${tHash} ≠ pattern hash ${pHash}. Skipping character comparison.`,
            soundCue: 'step',
            variables: { index: i, window: windowStr, windowHash: tHash, patternHash: pHash, hashMatch: false },
            conditionEval: { expr: 'pHash == tHash', condition: `${pHash} == ${tHash}`, result: false },
            windowStart: i,
            patternHash: pHash,
            windowHash: tHash,
            status: 'mismatch',
            pedagogy: {
              what: `Hashes differ, so the window content cannot equal the pattern.`,
              why: 'Different hashes guarantee different strings — this is the speedup: O(1) rejection instead of O(M) character comparison.',
              whatNext: 'Roll the hash to include the next character and drop the outgoing one.',
            },
          });
        }

        if (i < N - M) {
          const oldHash = tHash;
          tHash = (d * (tHash - text.charCodeAt(i) * h) + text.charCodeAt(i + M)) % q;
          if (tHash < 0) tHash += q;
          actionType = 'ROLL_HASH';

          const rollCheckpoint: ExecutionFrame<RabinKarpState>['checkpoint'] | undefined =
            !rollCheckpointAdded
              ? {
                  id: 'rabin-karp-roll',
                  question: `The window slides by one character. Why is the hash update O(1) instead of O(M)?`,
                  options: [
                    'The outgoing character\'s contribution is subtracted and the incoming one added — no rescan needed',
                    'The hash is cached and only recomputed every M positions',
                    'It is actually O(M) but the visualizer hides it',
                  ],
                  correctIndex: 0,
                  explanation: `Using Horner\'s rule, rolling = subtract old char × h, multiply by d, add new char, all mod q — a constant number of arithmetic operations.`,
                  hint: 'What arithmetic operations replace the M-character rescan?',
                }
              : undefined;

          pushFrame({
            codeLine: 14,
            explanation: `Rolled window hash: ${oldHash} → ${tHash} (dropped '${text[i]}', added '${text[i + M]}').`,
            soundCue: 'step',
            checkpoint: rollCheckpoint,
            variables: { from: i, to: i + 1, oldHash, newHash: tHash, dropped: text[i], added: text[i + M] },
            conditionEval: { expr: 'tHash = roll(tHash)', condition: `${oldHash} → ${tHash}`, result: tHash },
            windowStart: i + 1,
            patternHash: pHash,
            windowHash: tHash,
            status: 'hashing',
            pedagogy: {
              what: `The window slid right by one: '${text[i]}' left, '${text[i + M]}' entered.`,
              why: 'The rolling hash updates in O(1) — this constant-time slide is what makes Rabin-Karp O(N + M) on average.',
              whatNext: 'Compare the new window hash against the pattern hash.',
            },
          });
          if (rollCheckpoint) rollCheckpointAdded = true;
        }
      }
    }

    actionType = 'DONE';
    pushFrame({
      codeLine: 16,
      explanation: `🎉 Rabin-Karp search complete! Found ${matches.length} total occurrences at indices: [${matches.join(', ')}].`,
      milestone: 'Search Complete',
      soundCue: 'complete',
      variables: { totalMatches: matches.length, matchPositions: matches.join(', '), completed: true },
      conditionEval: { expr: 'i > N - M', condition: `scan finished`, result: true },
      windowStart: Math.max(0, N - M),
      patternHash: pHash,
      windowHash: tHash,
      status: 'done',
      pedagogy: {
        what: `The scan finished; ${matches.length} occurrence(s) recorded.`,
        why: 'Each position costs O(1) for the hash comparison plus O(M) only on hash matches, giving O(N + M) average and O(N·M) worst case.',
        whatNext: 'Try the collision-test preset to see a spurious hit in action.',
      },
    });

    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: frames.length }));
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
