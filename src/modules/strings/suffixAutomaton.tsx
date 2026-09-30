import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface SAMStateNode {
  id: number;
  len: number;
  link: number;
  next: Record<string, number>;
}

export interface SuffixAutomatonState {
  str: string;
  processedLength: number;
  nodes: SAMStateNode[];
  lastNodeId: number;
  activeChar: string | null;
  clonedNodeId: number | null;
}

export const suffixAutomatonModule: AlgorithmModule<
  { text: string },
  SuffixAutomatonState
> = {
  id: 'suffix-automaton',
  title: 'Suffix Automaton / SAM (Minimal Directed Acyclic Word Graph O(N))',
  category: 'searching',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(N * Sigma) bounded by 2N - 1 states and 3N - 4 transitions',
    worstCaseCondition: 'Strictly linear construction across all string alphabets and repetition patterns',
  },
  theory: {
    overview:
      'A Suffix Automaton (SAM) is a minimal deterministic directed acyclic word graph (DAWG) that accepts all suffixes and substrings of a string. Built in linear O(N) time and space, it represents an entire string dictionary with at most 2N - 1 states and 3N - 4 transitions.',
    whyItWorks:
      'Substrings sharing identical sets of end-positions (endpos) are clustered into contiguous equivalence classes. By maintaining suffix links between nested classes, adding a new character requires redirecting only a small chain of suffix link ancestors, amortizing to O(1) per character.',
    invariant:
      'Linear State Bound: A string of length N yields at most 2N - 1 states. Suffix links form a directed tree rooted at state 0 corresponding to the suffix tree of the reversed string.',
    pitfalls: [
      'Omitting state duplication (cloning) when transition length does not equal len[p] + 1, which would break equivalence class invariants.',
      'Misrouting suffix links after cloning.',
    ],
  },
  presets: [
    {
      id: 'sam-abcbc',
      label: 'Pattern "abcbc"',
      description: 'Demonstrates suffix link redirects and state cloning',
      data: {
        text: 'abcbc',
      },
    },
    {
      id: 'sam-banana',
      label: 'Word "banana"',
      description: 'Classic suffix test case with repeated "an" and "a" prefixes',
      data: {
        text: 'banana',
      },
    },
  ],
  defaultInput: {
    text: 'abcbc',
  },
  codeSnippets: {
    cpp: `struct State {
    int len, link;
    map<char, int> next;
};
State st[MAXLEN * 2];
int sz, last;

void sam_init() {
    st[0].len = 0;
    st[0].link = -1;
    sz = 1; last = 0;
}

void sam_extend(char c) {
    int cur = sz++;
    st[cur].len = st[last].len + 1;
    int p = last;
    while (p != -1 && !st[p].next.count(c)) {
        st[p].next[c] = cur;
        p = st[p].link;
    }
    if (p == -1) {
        st[cur].link = 0;
    } else {
        int q = st[p].next[c];
        if (st[p].len + 1 == st[q].len) {
            st[cur].link = q;
        } else {
            int clone = sz++;
            st[clone].len = st[p].len + 1;
            st[clone].next = st[q].next;
            st[clone].link = st[q].link;
            while (p != -1 && st[p].next[c] == q) {
                st[p].next[c] = clone;
                p = st[p].link;
            }
            st[q].link = st[cur].link = clone;
        }
    }
    last = cur;
}`,
    python: `class SuffixAutomaton:
    def __init__(self):
        self.st = [{'len': 0, 'link': -1, 'next': {}}]
        self.last = 0

    def extend(self, c):
        cur = len(self.st)
        self.st.append({'len': self.st[self.last]['len'] + 1, 'link': 0, 'next': {}})
        p = self.last
        while p != -1 and c not in self.st[p]['next']:
            self.st[p]['next'][c] = cur
            p = self.st[p]['link']
        if p != -1:
            q = self.st[p]['next'][c]
            if self.st[p]['len'] + 1 == self.st[q]['len']:
                self.st[cur]['link'] = q
            else:
                clone = len(self.st)
                self.st.append({'len': self.st[p]['len'] + 1, 'link': self.st[q]['link'], 'next': dict(self.st[q]['next'])})
                while p != -1 and self.st[p]['next'].get(c) == q:
                    self.st[p]['next'][c] = clone
                    p = self.st[p]['link']
                self.st[q]['link'] = self.st[cur]['link'] = clone
        self.last = cur`,
    typescript: `interface State {
  len: number;
  link: number;
  next: Record<string, number>;
}

function samExtend(st: State[], last: number, c: string): number {
  const cur = st.length;
  st.push({ len: st[last].len + 1, link: 0, next: {} });
  let p = last;
  while (p !== -1 && !(c in st[p].next)) {
    st[p].next[c] = cur;
    p = st[p].link;
  }
  if (p === -1) {
    st[cur].link = 0;
  } else {
    const q = st[p].next[c];
    if (st[p].len + 1 === st[q].len) {
      st[cur].link = q;
    } else {
      const clone = st.length;
      st.push({ len: st[p].len + 1, link: st[q].link, next: { ...st[q].next } });
      while (p !== -1 && st[p].next[c] === q) {
        st[p].next[c] = clone;
        p = st[p].link;
      }
      st[q].link = clone;
      st[cur].link = clone;
    }
  }
  return cur;
}`,
    java: `public class SuffixAutomaton {
    static class State {
        int len, link;
        Map<Character, Integer> next = new HashMap<>();
    }
    List<State> st = new ArrayList<>();
    int last = 0;
}`,
    pseudocode: `function samExtend(c):
    cur = new state with len = st[last].len + 1
    p = last
    while p != -1 and c not in st[p].next:
        st[p].next[c] = cur
        p = st[p].link
    if p == -1: st[cur].link = 0
    else:
        q = st[p].next[c]
        if st[p].len + 1 == st[q].len: st[cur].link = q
        else:
            clone = copy(q) with len = st[p].len + 1
            redirect parent transitions to clone
            st[q].link = st[cur].link = clone
    last = cur`,
  },
  generateTimeline: (input: { text: string }): ExecutionFrame<SuffixAutomatonState>[] => {
    const text = input?.text?.length ? input.text : 'abcbc';
    const frames: ExecutionFrame<SuffixAutomatonState>[] = [];

    const nodes: SAMStateNode[] = [{ id: 0, len: 0, link: -1, next: {} }];
    let last = 0;

    function cloneNodes(): SAMStateNode[] {
      return nodes.map((n) => ({ id: n.id, len: n.len, link: n.link, next: { ...n.next } }));
    }

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      action: 'INIT',
      state: {
        str: text,
        processedLength: 0,
        nodes: cloneNodes(),
        lastNodeId: 0,
        activeChar: null,
        clonedNodeId: null,
      },
      callStack: [{ name: 'samInit', params: { textLength: text.length } }],
      variables: { text, totalStates: 1, rootLink: -1 },
      explanation: `Initialized empty Suffix Automaton with root state 0 (len=0, link=-1). Ready to extend with text "${text}".`,
    });

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const cur = nodes.length;
      nodes.push({ id: cur, len: nodes[last].len + 1, link: 0, next: {} });

      let p = last;
      while (p !== -1 && !(c in nodes[p].next)) {
        nodes[p].next[c] = cur;
        p = nodes[p].link;
      }

      let clonedId: number | null = null;
      if (p === -1) {
        nodes[cur].link = 0;
      } else {
        const q = nodes[p].next[c];
        if (nodes[p].len + 1 === nodes[q].len) {
          nodes[cur].link = q;
        } else {
          clonedId = nodes.length;
          nodes.push({
            id: clonedId,
            len: nodes[p].len + 1,
            link: nodes[q].link,
            next: { ...nodes[q].next },
          });

          while (p !== -1 && nodes[p].next[c] === q) {
            nodes[p].next[c] = clonedId;
            p = nodes[p].link;
          }
          nodes[q].link = clonedId;
          nodes[cur].link = clonedId;
        }
      }

      last = cur;

      frames.push({
        stepIndex: frames.length,
        totalSteps: frames.length + 1,
        codeLine: 18,
        action: 'EXTEND_CHAR',
        state: {
          str: text,
          processedLength: i + 1,
          nodes: cloneNodes(),
          lastNodeId: last,
          activeChar: c,
          clonedNodeId: clonedId,
        },
        callStack: [{ name: 'samExtend', params: { char: c, stateId: cur } }],
        variables: {
          currentChar: c,
          newStateId: cur,
          totalStates: nodes.length,
          lastState: last,
          wasCloned: clonedId !== null,
        },
        explanation: `Extended SAM with '${c}' (prefix "${text.slice(0, i + 1)}"). Created state ${cur}${
          clonedId !== null ? ` and cloned intermediate state ${clonedId}` : ''
        }. Total states: ${nodes.length}.`,
      });
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: frames.length + 1,
      codeLine: 35,
      action: 'COMPLETE',
      state: {
        str: text,
        processedLength: text.length,
        nodes: cloneNodes(),
        lastNodeId: last,
        activeChar: null,
        clonedNodeId: null,
      },
      callStack: [{ name: 'complete', params: { totalStates: nodes.length } }],
      variables: { completed: true, totalStates: nodes.length },
      explanation: `Suffix Automaton successfully constructed for "${text}". Formed ${nodes.length} states encoding all ${
        (text.length * (text.length + 1)) / 2
      } potential substrings.`,
    });

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });
    return frames;
  },
  renderStage: (frame: ExecutionFrame<SuffixAutomatonState>) => {
    const { str, processedLength, nodes, lastNodeId, activeChar, clonedNodeId } = frame.state;

    return (
      <div className="flex flex-col items-center justify-center p-6 gap-6 w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Stream:</span>
            <div className="flex items-center font-mono text-sm font-bold">
              <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                {str.slice(0, processedLength)}
              </span>
              <span className="text-slate-500">{str.slice(processedLength)}</span>
            </div>
            {activeChar && (
              <span className="font-mono text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded">
                +{activeChar}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span>States: <strong className="text-cyan-400">{nodes.length}</strong></span>
            <span>Last ID: <strong className="text-indigo-400">{lastNodeId}</strong></span>
          </div>
        </div>

        {/* State nodes grid/cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 w-full max-h-[380px] overflow-y-auto p-2">
          {nodes.map((node) => {
            const isLast = node.id === lastNodeId;
            const isCloned = node.id === clonedNodeId;

            let border = 'border-slate-800';
            let bg = 'bg-slate-950/70';
            if (isLast) {
              border = 'border-amber-500/80';
              bg = 'bg-amber-950/20';
            } else if (isCloned) {
              border = 'border-purple-500/80';
              bg = 'bg-purple-950/20';
            }

            return (
              <div
                key={`node-${node.id}`}
                className={`flex flex-col p-3 rounded-xl border ${border} ${bg} shadow-md transition-all duration-200`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-slate-200">
                    State #{node.id}
                  </span>
                  <span className="text-xs font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                    len={node.len}
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-400 mt-1">
                  link: <span className="text-rose-400 font-bold">{node.link}</span>
                </div>
                <div className="mt-2 text-xs font-mono border-t border-slate-800/80 pt-1.5 text-slate-400">
                  <span className="text-slate-500">transitions:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.entries(node.next).map(([ch, target]) => (
                      <span
                        key={`${node.id}-${ch}`}
                        className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded text-[11px]"
                      >
                        {ch} &rarr; {target}
                      </span>
                    ))}
                    {Object.keys(node.next).length === 0 && (
                      <span className="text-slate-600 text-[10px] italic">none</span>
                    )}
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
