import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface AhoNode {
  id: number;
  char: string;
  isWord: boolean;
  word?: string;
  failId: number;
  children: Record<string, number>;
}

export interface AhoCorasickState {
  trie: AhoNode[];
  currentNodeId: number;
  textIndex: number;
  currentChar: string | null;
  matches: { pattern: string; index: number }[];
  phase: 'BUILD' | 'FAIL_LINKS' | 'SEARCH' | 'DONE';
}

export const ahoCorasickModule: AlgorithmModule<
  { patterns: string[]; text: string },
  AhoCorasickState
> = {
  id: 'aho-corasick',
  title: 'Aho-Corasick Algorithm (Dictionary Trie with Failure Links O(N + M + Z))',
  category: 'searching',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(N + M + Z)',
    timeAverage: 'O(N + M + Z)',
    timeWorst: 'O(N + M + Z)',
    spaceAuxiliary: 'O(M * Sigma) for dictionary trie state automaton',
    worstCaseCondition: 'Strictly linear in text length N plus total pattern length M plus match occurrences Z',
  },
  theory: {
    overview:
      'The Aho-Corasick algorithm is a multi-pattern string matching algorithm that constructs a deterministic finite-state machine (DFA) combining a Trie with suffix failure links (similar to KMP). It locates all occurrences of all dictionary patterns in linear time O(N + M + Z).',
    whyItWorks:
      'By computing failure links via BFS, whenever a mismatch occurs at node u for character c, the automaton jumps directly to node fail[u] representing the longest proper suffix of the current prefix that exists as a prefix in the trie, avoiding redundant character re-scans.',
    invariant:
      'Longest Proper Suffix Invariant: For every node u, the failure link fail[u] points to the node representing the longest proper suffix of the string ending at u.',
    pitfalls: [
      'Forgetting output dictionary links (if node fail[u] is an end-of-word, u must inherit that match).',
      'Circular failure links if root is not handled correctly as a base case.',
    ],
  },
  presets: [
    {
      id: 'classic-dictionary',
      label: 'Patterns: ["he", "she", "his", "hers"], Text: "ushers"',
      description: 'Classic textbook example with overlapping matches "she", "he", "hers"',
      data: {
        patterns: ['he', 'she', 'his', 'hers'],
        text: 'ushers',
      },
    },
    {
      id: 'dna-motifs',
      label: 'DNA Sequence Motifs',
      description: 'Find motifs ["ACG", "CGT", "GTA"] in "ACGTACGT"',
      data: {
        patterns: ['ACG', 'CGT', 'GTA'],
        text: 'ACGTACGT',
      },
    },
  ],
  defaultInput: {
    patterns: ['he', 'she', 'his', 'hers'],
    text: 'ushers',
  },
  codeSnippets: {
    cpp: `struct Node {
    map<char, int> next;
    int fail = 0;
    vector<int> output;
};
vector<Node> trie(1);

void buildFailLinks() {
    queue<int> q;
    for (auto& [ch, v] : trie[0].next) q.push(v);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (auto& [ch, v] : trie[u].next) {
            int f = trie[u].fail;
            while (f && !trie[f].next.count(ch)) f = trie[f].fail;
            trie[v].fail = trie[f].next.count(ch) ? trie[f].next[ch] : 0;
            for (int out : trie[trie[v].fail].output) trie[v].output.push_back(out);
            q.push(v);
        }
    }
}`,
    python: `def aho_corasick(patterns, text):
    # 1. Build Trie
    # 2. Compute BFS Failure Links
    # 3. Stream through text in O(N)
    pass`,
    typescript: `function ahoCorasick(patterns: string[], text: string) {
  // Construct Trie, Failure Links via BFS, and search stream
}`,
    java: `public class AhoCorasick {
    // Multi-pattern automaton with failure links
}`,
    pseudocode: `function ahoCorasick(patterns, text):
    trie = buildTrie(patterns)
    computeFailureLinks(trie)
    curr = root
    for i, char in text:
        while curr != root and char not in curr.children:
            curr = curr.fail
        curr = curr.children[char] or root
        reportMatches(curr, i)`,
  },
  generateTimeline: (input: {
    patterns: string[];
    text: string;
  }): ExecutionFrame<AhoCorasickState>[] => {
    const patterns = input?.patterns?.length ? input.patterns : ['he', 'she', 'his', 'hers'];
    const text = input?.text || 'ushers';
    const frames: ExecutionFrame<AhoCorasickState>[] = [];

    // Step 1: Build Trie
    const trie: AhoNode[] = [
      { id: 0, char: 'ROOT', isWord: false, failId: 0, children: {} },
    ];

    patterns.forEach((pat) => {
      let curr = 0;
      for (const ch of pat) {
        if (trie[curr].children[ch] === undefined) {
          const newId = trie.length;
          trie.push({
            id: newId,
            char: ch,
            isWord: false,
            failId: 0,
            children: {},
          });
          trie[curr].children[ch] = newId;
        }
        curr = trie[curr].children[ch];
      }
      trie[curr].isWord = true;
      trie[curr].word = pat;
    });

    // Step 2: BFS Failure Links
    const queue: number[] = [];
    Object.values(trie[0].children).forEach((childId) => {
      trie[childId].failId = 0;
      queue.push(childId);
    });

    while (queue.length > 0) {
      const u = queue.shift()!;
      for (const [ch, v] of Object.entries(trie[u].children)) {
        let f = trie[u].failId;
        while (f > 0 && trie[f].children[ch] === undefined) {
          f = trie[f].failId;
        }
        if (trie[f].children[ch] !== undefined && trie[f].children[ch] !== v) {
          trie[v].failId = trie[f].children[ch];
        } else {
          trie[v].failId = 0;
        }
        queue.push(v);
      }
    }

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      action: 'BUILD_COMPLETE',
      state: {
        trie: JSON.parse(JSON.stringify(trie)),
        currentNodeId: 0,
        textIndex: -1,
        currentChar: null,
        matches: [],
        phase: 'FAIL_LINKS',
      },
      callStack: [{ name: 'buildAhoAutomaton', params: { totalPatterns: patterns.length, totalNodes: trie.length } }],
      variables: { patterns: patterns.join(', '), totalNodes: trie.length },
      explanation: `Constructed Aho-Corasick Trie with BFS failure links for ${patterns.length} patterns. Total states: ${trie.length}.`,
    });

    // Step 3: Stream Search
    let curr = 0;
    const matches: { pattern: string; index: number }[] = [];

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];

      while (curr > 0 && trie[curr].children[ch] === undefined) {
        curr = trie[curr].failId;
      }

      if (trie[curr].children[ch] !== undefined) {
        curr = trie[curr].children[ch];
      } else {
        curr = 0;
      }

      // Check matches at current node or via failure chain
      let check = curr;
      while (check > 0) {
        if (trie[check].isWord && trie[check].word) {
          matches.push({ pattern: trie[check].word!, index: i - trie[check].word!.length + 1 });
        }
        check = trie[check].failId;
      }

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 12,
        action: 'SEARCH_STEP',
        state: {
          trie: JSON.parse(JSON.stringify(trie)),
          currentNodeId: curr,
          textIndex: i,
          currentChar: ch,
          matches: [...matches],
          phase: 'SEARCH',
        },
        callStack: [{ name: 'processChar', params: { index: i, char: ch, activeState: curr } }],
        variables: {
          textIndex: i,
          char: ch,
          activeStateId: curr,
          totalMatchesFound: matches.length,
        },
        explanation: `Index ${i} ('${ch}'): Automaton moved to State #${curr} ('${trie[curr].char}'). Matches so far: ${matches.length}.`,
      });
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 16,
      action: 'COMPLETE',
      state: {
        trie: JSON.parse(JSON.stringify(trie)),
        currentNodeId: curr,
        textIndex: text.length,
        currentChar: null,
        matches: [...matches],
        phase: 'DONE',
      },
      callStack: [{ name: 'ahoCorasick', params: { totalMatches: matches.length, status: 'DONE' } }],
      variables: {
        totalMatchesFound: matches.length,
        matchesList: matches.map((m) => `"${m.pattern}"@${m.index}`).join(', '),
      },
      explanation: `Search complete in O(N + M + Z) time! Found ${matches.length} pattern occurrences.`,
    });

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });

    return frames;
  },
  renderStage: (frame: ExecutionFrame<AhoCorasickState>) => {
    const { trie, currentNodeId, textIndex, currentChar, matches } = frame.state;

    return (
      <div className="flex flex-col items-center justify-center p-6 gap-6 w-full max-w-4xl mx-auto">
        {/* Banner */}
        <div className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Current Stream Char:</span>
            <span className="text-lg font-mono font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-3 py-0.5 rounded">
              {currentChar !== null ? `'${currentChar}' (idx ${textIndex})` : 'Idle'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Total Matches:</span>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
              {matches.length}
            </span>
          </div>
        </div>

        {/* Matches Chips */}
        {matches.length > 0 && (
          <div className="flex flex-wrap gap-2 w-full justify-start">
            {matches.map((m, idx) => (
              <span
                key={idx}
                className="text-xs font-mono font-bold bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 px-2.5 py-1 rounded-lg shadow"
              >
                ✓ Match "{m.pattern}" at index {m.index}
              </span>
            ))}
          </div>
        )}

        {/* Trie States Strip */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-3 w-full">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Automaton State Nodes & Failure Pointers:
          </span>
          <div className="flex flex-wrap gap-3">
            {trie.map((n) => {
              const isActive = currentNodeId === n.id;

              return (
                <div
                  key={n.id}
                  className={`flex flex-col items-center p-3 rounded-xl border min-w-[70px] transition-all ${
                    isActive
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/30 scale-105 z-10'
                      : n.isWord
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-900 border-slate-700 text-slate-300'
                  }`}
                >
                  <span className="text-xs font-mono text-slate-500">#{n.id}</span>
                  <span className="text-base font-mono font-black">{n.char}</span>
                  {n.isWord && (
                    <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/20 px-1.5 py-0.2 rounded mt-0.5">
                      "{n.word}"
                    </span>
                  )}
                  <span className="text-[9px] font-mono text-rose-400 mt-1">
                    fail → #{n.failId}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-400 inline-block" />
            <span>Active DFA State</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-400 inline-block" />
            <span>Match Pattern End Node</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-rose-400 font-mono font-bold text-xs">fail → #k</span>
            <span>Suffix Failure Pointer</span>
          </div>
        </div>
      </div>
    );
  },
};
