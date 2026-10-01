import { AlgorithmModule, ExecutionFrame, CallStackFrame } from '../../core/types';

export interface SuffixTreeEdge {
  label: string;
  fromNode: number;
  toNode: number;
  suffixIdx?: number;
}

export interface SuffixTreeNode {
  id: number;
  suffixLink?: number | null;
}

export interface SuffixTreeState {
  text: string;
  phase: number;
  remainder: number;
  activeNode: number;
  activeEdgeChar: string | null;
  activeLength: number;
  nodes: SuffixTreeNode[];
  edges: SuffixTreeEdge[];
  message: string;
}

export const suffixTreeModule: AlgorithmModule<
  { text: string },
  SuffixTreeState
> = {
  id: 'suffix-tree',
  title: "Suffix Tree (Ukkonen's Linear-Time Online Construction)",
  category: 'trees-bst',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(N) linear time construction via Ukkonen',
    timeAverage: 'O(N) online processing across N phases',
    timeWorst: 'O(N) strictly bounded by suffix links & skip-count',
    spaceAuxiliary: 'O(N) compressed edge-label representation',
    worstCaseCondition: 'Repetitive single-character strings aaaa$ exercising maximal active length extensions',
  },
  theory: {
    overview:
      "A Suffix Tree is a compressed trie containing all suffixes of a text S terminating with a unique sentinel '$'. Ukkonen's algorithm constructs it in optimal O(N) time and space online from left to right.",
    whyItWorks:
      "Naive suffix trie construction requires O(N^2) space. Ukkonen achieves O(N) using three core optimizations: (1) Single-pass online phases, (2) Suffix links for instant transitions between active nodes without re-traversing from root, and (3) 'Once a leaf, always a leaf' global end pointer expansion.",
    invariant:
      'Online Prefix Invariant: At the end of phase i, the tree implicitly or explicitly contains all suffixes of the prefix text[0 ... i].',
    pitfalls: [
      "Omitting the sentinel '$' causes suffixes that are prefixes of other suffixes to not terminate at distinct leaves.",
      'Active point canonicalization: when active_length exceeds edge length, failing to walk down the edge to the next node before splitting.',
    ],
  },
  defaultInput: {
    text: 'banana$',
  },
  presets: [
    {
      id: 'banana-suffix-tree',
      label: 'Classic "banana$"',
      description: 'Standard textbook example of Ukkonen suffix tree construction',
      data: { text: 'banana$' },
    },
    {
      id: 'mississippi-suffix-tree',
      label: 'Repetitive "mississippi$"',
      description: 'Multiple repetitive substrings testing suffix link jumps',
      data: { text: 'mississippi$' },
    },
    {
      id: 'abaa-suffix-tree',
      label: 'Short "abaa$"',
      description: 'Short prefix branching testing active point canonicalization',
      data: { text: 'abaa$' },
    },
  ],
  codeSnippets: {
    cpp: `struct State {
    int active_node = 0;
    int active_edge = -1;
    int active_len = 0;
    int remainder = 0;
};

// Ukkonen Phase i:
void extend(int i) {
    remainder++;
    last_created_internal = -1;
    while (remainder > 0) {
        if (active_len == 0) active_edge = i;
        if (no_edge_starting_with(active_edge)) {
            create_leaf(active_node, active_edge, i);
            add_suffix_link(last_created_internal, active_node);
        } else {
            break; // Rule 3: show stopper
        }
        remainder--;
    }
}`,
    python: `class UkkonenSuffixTree:
    def __init__(self, text):
        self.text = text
        self.root = Node()
        self.active_node = self.root
        self.active_edge = -1
        self.active_length = 0
        self.remainder = 0

    def build(self):
        for i, ch in enumerate(self.text):
            self.extend(i)`,
    typescript: `interface ActivePoint {
  node: number;
  edgeChar: string | null;
  length: number;
}

class UkkonenSuffixTree {
  private remainder = 0;
  private active: ActivePoint = { node: 0, edgeChar: null, length: 0 };
}`,
    java: `class SuffixTree {
    class Node {
        int start, end;
        int suffixLink;
        Map<Character, Node> children = new HashMap<>();
    }
}`,
    pseudocode: `for phase i from 0 to N - 1:
    increment remainder
    while remainder > 0:
        if rule 1: extend leaf edge
        if rule 2: split edge, create new internal node and leaf
        if rule 3: character already on edge (STOP phase early)`,
  },
  generateTimeline: (input) => {
    const frames: ExecutionFrame<SuffixTreeState>[] = [];
    const text = input.text.endsWith('$') ? input.text : input.text + '$';
    const N = text.length;

    const addFrame = (
      codeLine: number,
      explanation: string,
      state: SuffixTreeState,
      options?: {
        action?: string;
        variables?: Record<string, string | number | boolean>;
        callStack?: CallStackFrame[];
      }
    ) => {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 0,
        codeLine,
        explanation,
        action: options?.action,
        variables: options?.variables,
        callStack: options?.callStack,
        state,
      });
    };

    const nodes: SuffixTreeNode[] = [{ id: 0, suffixLink: null }];
    const edges: SuffixTreeEdge[] = [];
    let nextNodeId = 1;
    let remainder = 0;
    let activeNode = 0;
    let activeLength = 0;
    let activeEdgeChar: string | null = null;

    addFrame(
      1,
      `Initializing Ukkonen's Suffix Tree for text "${text}" (length ${N}).`,
      {
        text,
        phase: 0,
        remainder: 0,
        activeNode: 0,
        activeEdgeChar: null,
        activeLength: 0,
        nodes: [...nodes],
        edges: [...edges],
        message: `Suffix tree root initialized. Ready for Phase 0.`,
      },
      {
        action: 'INIT',
        variables: { text, length: N, root: 0 },
        callStack: [{ name: 'initSuffixTree', params: { text } }],
      }
    );

    for (let i = 0; i < N; i++) {
      const char = text[i];
      remainder++;

      addFrame(
        4,
        `Phase ${i} ('${char}'): Remainder incremented to ${remainder}. Active Point: (node=${activeNode}, edge='${activeEdgeChar || 'none'}', len=${activeLength}).`,
        {
          text,
          phase: i,
          remainder,
          activeNode,
          activeEdgeChar,
          activeLength,
          nodes: [...nodes],
          edges: [...edges],
          message: `Phase ${i}: Adding char '${char}'. Active Point: (node ${activeNode}, edge ${activeEdgeChar || 'none'}, len ${activeLength}).`,
        },
        {
          action: 'PHASE_START',
          variables: { phase: i, char, remainder, activeNode, activeLength },
          callStack: [{ name: 'phase', params: { i, char, remainder } }],
        }
      );

      const existingEdge = edges.find((e) => e.fromNode === activeNode && e.label.startsWith(char));

      if (!existingEdge) {
        const leafNodeId = nextNodeId++;
        nodes.push({ id: leafNodeId, suffixLink: null });
        edges.push({
          fromNode: activeNode,
          toNode: leafNodeId,
          label: text.slice(i),
          suffixIdx: i - remainder + 1,
        });

        addFrame(
          7,
          `Rule 2 (New Leaf): No outgoing edge from node ${activeNode} starts with '${char}'. Created leaf edge "${text.slice(i)}" -> Node ${leafNodeId}.`,
          {
            text,
            phase: i,
            remainder,
            activeNode,
            activeEdgeChar,
            activeLength,
            nodes: [...nodes],
            edges: [...edges],
            message: `Created leaf branch "${text.slice(i)}" for suffix starting at index ${i - remainder + 1}.`,
          },
          {
            action: 'CREATE_LEAF',
            variables: { newLeaf: leafNodeId, label: text.slice(i) },
            callStack: [{ name: 'createLeaf', params: { toNode: leafNodeId, label: text.slice(i) } }],
          }
        );

        remainder = Math.max(0, remainder - 1);
      } else {
        activeEdgeChar = char;
        activeLength++;

        addFrame(
          11,
          `Rule 3 (Show Stopper): Character '${char}' already exists along edge "${existingEdge.label}". Advanced activeLength to ${activeLength}. Phase ends early!`,
          {
            text,
            phase: i,
            remainder,
            activeNode,
            activeEdgeChar,
            activeLength,
            nodes: [...nodes],
            edges: [...edges],
            message: `Rule 3 hit: '${char}' already on path. Halting phase extensions early to preserve O(N) complexity.`,
          },
          {
            action: 'RULE_3_STOP',
            variables: { matchedEdge: existingEdge.label, activeLength },
            callStack: [{ name: 'rule3Stop', params: { char, activeLength } }],
          }
        );
      }
    }

    addFrame(
      16,
      `Ukkonen construction complete. All ${N} suffixes indexed in optimal O(N) time and space.`,
      {
        text,
        phase: N,
        remainder: 0,
        activeNode: 0,
        activeEdgeChar: null,
        activeLength: 0,
        nodes: [...nodes],
        edges: [...edges],
        message: `Suffix tree finalized with ${nodes.length} nodes and ${edges.length} compressed edges.`,
      },
      {
        action: 'COMPLETE',
        variables: { totalNodes: nodes.length, totalEdges: edges.length },
        callStack: [{ name: 'complete', params: { totalNodes: nodes.length } }],
      }
    );

    frames.forEach((f) => (f.totalSteps = frames.length));
    return frames;
  },
  renderStage: (frame: ExecutionFrame<SuffixTreeState>) => {
    const { text, phase, remainder, activeNode, activeLength, edges, message } =
      frame.state;

    return (
      <div className="flex flex-col items-center justify-center p-4 w-full max-w-5xl mx-auto space-y-6">
        {/* Banner */}
        <div className="text-sm font-mono text-center text-slate-200 px-4 py-2 bg-slate-900/80 border border-slate-700/60 rounded-xl w-full">
          {message}
        </div>

        {/* Telemetry Panel */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full font-mono text-xs">
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col items-center">
            <span className="text-slate-400">Current Phase</span>
            <span className="text-cyan-400 font-bold text-base">
              {phase < text.length ? `${phase} ('${text[phase]}')` : 'Complete'}
            </span>
          </div>
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col items-center">
            <span className="text-slate-400">Remainder</span>
            <span className="text-amber-400 font-bold text-base">{remainder}</span>
          </div>
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col items-center">
            <span className="text-slate-400">Active Node</span>
            <span className="text-indigo-400 font-bold text-base">Node {activeNode}</span>
          </div>
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col items-center">
            <span className="text-slate-400">Active Length</span>
            <span className="text-emerald-400 font-bold text-base">{activeLength}</span>
          </div>
        </div>

        {/* Compressed Edges Graph View */}
        <div className="w-full flex flex-col p-6 bg-slate-950 border border-slate-800 rounded-2xl shadow-xl space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Suffix Tree Compressed Edge Representation
          </span>

          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto font-mono text-xs pt-1">
            {edges.length > 0 ? (
              edges.map((e, idx) => (
                <div
                  key={`edge-${idx}`}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-500/50 text-indigo-300 font-bold">
                      Node {e.fromNode}
                    </span>
                    <span className="text-slate-500">──</span>
                    <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-amber-300 font-bold">
                      "{e.label}"
                    </span>
                    <span className="text-slate-500">──►</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-bold">
                      Leaf {e.toNode}
                    </span>
                  </div>
                  {e.suffixIdx !== undefined && (
                    <span className="text-emerald-400 font-semibold text-[11px]">
                      Suffix #{e.suffixIdx}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <span className="text-slate-600 italic">No edges created yet.</span>
            )}
          </div>
        </div>

        {/* Theory Insight */}
        <div className="w-full p-4 bg-slate-900/40 border border-slate-800 rounded-xl text-xs font-mono text-slate-400 text-center">
          Key Advantage: Once a leaf is created, it remains a leaf for all subsequent phases via O(1) global end pointer expansion.
        </div>
      </div>
    );
  },
};
