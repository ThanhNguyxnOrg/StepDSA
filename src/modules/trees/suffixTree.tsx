import {
  AlgorithmModule,
  ExecutionFrame,
  PredictionCheckpoint,
  SoundCue,
  StepPedagogy,
} from '../../core/types';

export interface SuffixTreeNodeData {
  id: string;
  parent: string | null;
  /** 0-based inclusive start of this node's incoming edge label. */
  start: number;
  /** 0-based inclusive end of the incoming edge; leaves grow with the phase. */
  end: number;
  isLeaf: boolean;
  suffixIdx?: number;
  suffixLink: string | null;
  depth: number;
}

export interface SuffixTreeEdgeData {
  id: string;
  fromNode: string;
  toNode: string;
  start: number;
  end: number;
  label: string;
  isLeaf: boolean;
  suffixIdx?: number;
}

export interface SuffixTreeState {
  text: string;
  /** Current Ukkonen phase (character index). */
  phase: number;
  /** Number of suffixes still waiting to be extended explicitly. */
  remainder: number;
  activeNode: string;
  activeEdgeStart: number | null;
  activeEdgeChar: string | null;
  activeLength: number;
  nodes: SuffixTreeNodeData[];
  edges: SuffixTreeEdgeData[];
  /** Nodes created or linked by the current operation. */
  highlightNodeIds: string[];
  /** Suffix link established by the current operation. */
  suffixLinkHighlight: { from: string; to: string } | null;
  phaseComplete: boolean;
  message: string;
}

interface MutableNode {
  id: string;
  parent: string | null;
  start: number;
  end: number;
  isLeaf: boolean;
  suffixIdx?: number;
  suffixLink: string | null;
  children: Map<string, string>;
}

const MAX_VISUAL_LENGTH = 24;

function cloneNodes(nodes: MutableNode[]): SuffixTreeNodeData[] {
  const depthOf = (node: MutableNode): number => {
    let depth = 0;
    let cur: MutableNode | undefined = node;
    while (cur?.parent) {
      depth++;
      cur = nodes.find((n) => n.id === cur!.parent);
    }
    return depth;
  };
  return nodes.map((node) => ({
    id: node.id,
    parent: node.parent,
    start: node.start,
    end: node.end,
    isLeaf: node.isLeaf,
    suffixIdx: node.suffixIdx,
    suffixLink: node.suffixLink,
    depth: depthOf(node),
  }));
}

export const suffixTreeModule: AlgorithmModule<{ text: string }, SuffixTreeState> = {
  id: 'suffix-tree',
  title: "Suffix Tree (Ukkonen's Linear-Time Online Construction)",
  category: 'trees-bst',
  difficulty: 'Advanced',
  relatedModules: [
    { id: 'suffix-array-kasai', label: 'Suffix Array (Kasai LCP)' },
    { id: 'suffix-automaton', label: 'Suffix Automaton' },
    { id: 'trie-prefix', label: 'Prefix Trie' },
    { id: 'radix-tree', label: 'Radix Tree' },
  ],
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(N) compressed edges + suffix links',
    worstCaseCondition:
      'Highly repetitive strings such as "aaaa$" exercise the maximum number of extensions per phase',
  },
  theory: {
    overview:
      "A suffix tree is a compressed trie of every suffix of a text ending in a unique sentinel '$'. Ukkonen's algorithm builds it online in O(N) time: phase i adds text[i], and each extension adds one suffix that is not yet explicit.",
    whyItWorks:
      'Three ideas remove the O(N²) work of rebuilding suffixes: (1) phases never restart, (2) suffix links jump from one active node to its next suffix in O(1), and (3) leaf edges grow implicitly through a shared end pointer, so "once a leaf, always a leaf".',
    invariant:
      'After phase i, every suffix of text[0..i] is represented in the tree — explicitly as a leaf, or implicitly inside an existing edge. The active point (activeNode, activeEdge, activeLength) is the locus of the longest suffix prefix that already exists.',
    pitfalls: [
      "Omitting a unique sentinel '$' lets one suffix be a prefix of another, so it never gets a distinct leaf.",
      'Forgetting to canonicalise the active point when activeLength reaches the edge length: the active point must walk down into the child before comparing the next character.',
      'Splitting at the wrong offset: the split node keeps activeLength characters of the old edge, the old child keeps the remainder, and the new leaf hangs under the split.',
      'Resetting remainder on a Rule 3 stop — Rule 3 intentionally ends the phase with implicit suffixes still pending.',
    ],
  },
  presets: [
    {
      id: 'banana-suffix-tree',
      label: 'Classic "banana$"',
      description: 'Textbook example: Rule 3 stops, then a split creates the "ana" internal node',
      data: { text: 'banana$' },
    },
    {
      id: 'mississippi-suffix-tree',
      label: 'Repetitive "mississippi$"',
      description: 'Many repeated prefixes exercise suffix links and repeated splits',
      data: { text: 'mississippi$' },
    },
    {
      id: 'abaa-suffix-tree',
      label: 'Short "abaa$"',
      description: 'Short string with a split and a suffix-link jump',
      data: { text: 'abaa$' },
    },
    {
      id: 'aaaa-suffix-tree',
      label: 'All Same "aaaa$"',
      description: 'Maximum Rule 3 pressure: every phase stops after extending one character',
      data: { text: 'aaaa$' },
    },
    {
      id: 'abc-suffix-tree',
      label: 'All Distinct "abc$"',
      description: 'No repeated prefix, so no split ever occurs — every suffix becomes a root leaf',
      data: { text: 'abc$' },
    },
  ],
  defaultInput: { text: 'banana$' },
  codeSnippets: {
    cpp: `// Ukkonen's suffix tree, capacity-free compressed edges.
struct Node {
    int start = -1, end = -1;      // edge label is text[start..end]
    bool leaf = false;
    int suffixLink = 0;            // 0 = root
    map<char, int> child;
};

struct SuffixTree {
    string text;
    vector<Node> nodes{1};         // node 0 is the root
    int activeNode = 0, activeEdge = -1, activeLength = 0, remainder = 0;

    int edgeLen(int v, int phase) const {
        return nodes[v].leaf ? phase - nodes[v].start + 1
                             : nodes[v].end - nodes[v].start + 1;
    }

    void build() {
        for (int i = 0; i < (int)text.size(); ++i) {
            ++remainder;
            int lastNew = -1;
            while (remainder > 0) {
                if (activeLength == 0) activeEdge = i;
                auto it = nodes[activeNode].child.find(text[activeEdge]);
                if (it == nodes[activeNode].child.end()) {
                    int leaf = nodes.size();
                    nodes.push_back({i, i, true, 0, {}});
                    nodes[activeNode].child[text[i]] = leaf;
                    if (lastNew != -1) nodes[lastNew].suffixLink = activeNode;
                    lastNew = -1;
                } else {
                    int nxt = it->second;
                    int len = edgeLen(nxt, i);
                    if (activeLength >= len) {
                        activeNode = nxt;
                        activeEdge += len;
                        activeLength -= len;
                        continue;
                    }
                    if (text[nodes[nxt].start + activeLength] == text[i]) {
                        if (lastNew != -1) nodes[lastNew].suffixLink = activeNode;
                        lastNew = -1;
                        ++activeLength;
                        break;                      // Rule 3
                    }
                    int split = nodes.size();
                    nodes.push_back({nodes[nxt].start,
                                     nodes[nxt].start + activeLength - 1,
                                     false, 0, {}});
                    nodes[activeNode].child[text[nodes[split].start]] = split;
                    nodes[nxt].start += activeLength;
                    nodes[split].child[text[nodes[nxt].start]] = nxt;
                    int leaf = nodes.size();
                    nodes.push_back({i, i, true, 0, {}});
                    nodes[split].child[text[i]] = leaf;
                    if (lastNew != -1) nodes[lastNew].suffixLink = split;
                    lastNew = split;
                }
                --remainder;
                if (activeNode == 0 && activeLength > 0) {
                    --activeLength;
                    activeEdge = i - remainder + 1;
                } else if (activeNode != 0) {
                    activeNode = nodes[activeNode].suffixLink;
                }
            }
        }
    }
};`,
    python: `class Node:
    def __init__(self, leaf=False, suffix=None):
        self.start = -1
        self.end = -1
        self.leaf = leaf
        self.suffix = suffix
        self.link = None
        self.child = {}


def build_suffix_tree(text):
    root = Node()
    nodes = [root]
    active_node, active_edge, active_len, remainder = root, -1, 0, 0

    for i in range(len(text)):
        remainder += 1
        last_new = None
        while remainder > 0:
            if active_len == 0:
                active_edge = i
            nxt = active_node.child.get(text[active_edge])
            if nxt is None:
                leaf = Node(True, i - remainder + 1)
                leaf.start = i
                active_node.child[text[i]] = leaf
                nodes.append(leaf)
                if last_new:
                    last_new.link = active_node
                last_new = None
            else:
                edge_len = (i if nxt.leaf else nxt.end) - nxt.start + 1
                if active_len >= edge_len:
                    active_node = nxt
                    active_edge += edge_len
                    active_len -= edge_len
                    continue
                if text[nxt.start + active_len] == text[i]:
                    if last_new:
                        last_new.link = active_node
                    last_new = None
                    active_len += 1
                    break  # Rule 3
                split = Node()
                split.start = nxt.start
                split.end = nxt.start + active_len - 1
                active_node.child[text[split.start]] = split
                nxt.start += active_len
                split.child[text[nxt.start]] = nxt
                leaf = Node(True, i - remainder + 1)
                leaf.start = i
                split.child[text[i]] = leaf
                nodes.extend([split, leaf])
                if last_new:
                    last_new.link = split
                last_new = split
            remainder -= 1
            if active_node is root and active_len > 0:
                active_len -= 1
                active_edge = i - remainder + 1
            elif active_node is not root:
                active_node = active_node.link or root
    return root`,
    typescript: `interface STNode {
  start: number; end: number; leaf: boolean; suffix?: number;
  link: STNode | null; child: Map<string, STNode>;
}

function buildSuffixTree(text: string): STNode {
  const root: STNode = { start: -1, end: -1, leaf: false, link: null, child: new Map() };
  let activeNode = root, activeEdge = -1, activeLength = 0, remainder = 0;

  const edgeLen = (n: STNode, i: number) =>
    (n.leaf ? i : n.end) - n.start + 1;

  for (let i = 0; i < text.length; i++) {
    remainder++;
    let lastNew: STNode | null = null;
    while (remainder > 0) {
      if (activeLength === 0) activeEdge = i;
      const next = activeNode.child.get(text[activeEdge]);
      if (!next) {
        const leaf: STNode = { start: i, end: i, leaf: true, suffix: i - remainder + 1, link: null, child: new Map() };
        activeNode.child.set(text[i], leaf);
        if (lastNew) lastNew.link = activeNode;
        lastNew = null;
      } else {
        const len = edgeLen(next, i);
        if (activeLength >= len) {
          activeNode = next;
          activeEdge += len;
          activeLength -= len;
          continue;
        }
        if (text[next.start + activeLength] === text[i]) {
          if (lastNew) lastNew.link = activeNode;
          lastNew = null;
          activeLength++;
          break; // Rule 3
        }
        const split: STNode = { start: next.start, end: next.start + activeLength - 1, leaf: false, link: null, child: new Map() };
        activeNode.child.set(text[split.start], split);
        next.start += activeLength;
        split.child.set(text[next.start], next);
        const leaf: STNode = { start: i, end: i, leaf: true, suffix: i - remainder + 1, link: null, child: new Map() };
        split.child.set(text[i], leaf);
        if (lastNew) lastNew.link = split;
        lastNew = split;
      }
      remainder--;
      if (activeNode === root && activeLength > 0) {
        activeLength--;
        activeEdge = i - remainder + 1;
      } else if (activeNode !== root) {
        activeNode = activeNode.link ?? root;
      }
    }
  }
  return root;
}`,
    java: `class SuffixTree {
    static class Node {
        int start = -1, end = -1;
        boolean leaf;
        Integer suffix;
        Node link;
        Map<Character, Node> child = new HashMap<>();
    }

    String text;
    Node root = new Node();
    Node activeNode = root;
    int activeEdge = -1, activeLength = 0, remainder = 0;

    int edgeLen(Node n, int i) {
        return (n.leaf ? i : n.end) - n.start + 1;
    }

    void build() {
        for (int i = 0; i < text.length(); i++) {
            remainder++;
            Node lastNew = null;
            while (remainder > 0) {
                if (activeLength == 0) activeEdge = i;
                Node next = activeNode.child.get(text.charAt(activeEdge));
                if (next == null) {
                    Node leaf = new Node();
                    leaf.start = leaf.end = i;
                    leaf.leaf = true;
                    leaf.suffix = i - remainder + 1;
                    activeNode.child.put(text.charAt(i), leaf);
                    if (lastNew != null) lastNew.link = activeNode;
                    lastNew = null;
                } else {
                    int len = edgeLen(next, i);
                    if (activeLength >= len) {
                        activeNode = next;
                        activeEdge += len;
                        activeLength -= len;
                        continue;
                    }
                    if (text.charAt(next.start + activeLength) == text.charAt(i)) {
                        if (lastNew != null) lastNew.link = activeNode;
                        lastNew = null;
                        activeLength++;
                        break; // Rule 3
                    }
                    Node split = new Node();
                    split.start = next.start;
                    split.end = next.start + activeLength - 1;
                    activeNode.child.put(text.charAt(split.start), split);
                    next.start += activeLength;
                    split.child.put(text.charAt(next.start), next);
                    Node leaf = new Node();
                    leaf.start = leaf.end = i;
                    leaf.leaf = true;
                    leaf.suffix = i - remainder + 1;
                    split.child.put(text.charAt(i), leaf);
                    if (lastNew != null) lastNew.link = split;
                    lastNew = split;
                }
                remainder--;
                if (activeNode == root && activeLength > 0) {
                    activeLength--;
                    activeEdge = i - remainder + 1;
                } else if (activeNode != root) {
                    activeNode = activeNode.link != null ? activeNode.link : root;
                }
            }
        }
    }
}`,
    pseudocode: `function buildSuffixTree(text):
    root = new Node(isLeaf = false)
    activeNode = root; activeEdge = -1; activeLength = 0
    for phase i from 0 to length(text) - 1:
        remainder = remainder + 1; lastNewNode = null
        while remainder > 0:
            if activeLength == 0:
                activeEdge = i
            next = child(activeNode, text[activeEdge])
            if next is null:
                create leaf from activeNode with label text[i..i]
                link lastNewNode to activeNode if needed
            else:
                edgeLen = next.end - next.start + 1
                if activeLength >= edgeLen:
                    walk down: activeNode = next; activeEdge += edgeLen; activeLength -= edgeLen
                    continue
                if text[next.start + activeLength] == text[i]:
                    link lastNewNode to activeNode if needed
                    activeLength = activeLength + 1
                    break                        # Rule 3: phase stops early
                split = new internal node on activeNode's edge
                move next under split; add new leaf under split
                link lastNewNode to split if needed
                lastNewNode = split
            remainder = remainder - 1
            if activeNode == root and activeLength > 0:
                activeLength = activeLength - 1
                activeEdge = i - remainder + 1
            else if activeNode != root:
                activeNode = suffixLink(activeNode) or root
        extend every leaf edge to end at i
    return root`,
  },
  generateTimeline: (input: { text: string }): ExecutionFrame<SuffixTreeState>[] => {
    const rawInput =
      typeof input?.text === 'string' && input.text.length > 0 ? input.text : 'banana$';
    const withoutInternalSentinels = rawInput.replace(/\$/g, '');
    const sentinelAdded = !rawInput.endsWith('$');
    const withSentinel = withoutInternalSentinels + '$';
    const truncated = withSentinel.length > MAX_VISUAL_LENGTH;
    const text = truncated
      ? withSentinel.slice(0, MAX_VISUAL_LENGTH - 1) + '$'
      : withSentinel;
    const N = text.length;

    const nodes: MutableNode[] = [
      {
        id: 'n0',
        parent: null,
        start: -1,
        end: -1,
        isLeaf: false,
        suffixLink: null,
        children: new Map(),
      },
    ];
    let nextNodeId = 1;
    let phase = 0;
    let remainder = 0;
    let activeNode = 'n0';
    let activeEdgeStart: number | null = null;
    let activeLength = 0;
    let lastNewNode: string | null = null;
    let comparisons = 0;
    let nodeVisits = 0;
    let leavesCreated = 0;
    let splitsCreated = 0;
    let linksCreated = 0;

    const frames: ExecutionFrame<SuffixTreeState>[] = [];
    let rule3CheckpointAdded = false;
    let splitCheckpointAdded = false;
    let firstLeafMilestone = false;
    let firstSplitMilestone = false;
    let firstLinkMilestone = false;

    const nodeById = (id: string): MutableNode => {
      const found = nodes.find((n) => n.id === id);
      if (!found) throw new Error(`missing suffix-tree node ${id}`);
      return found;
    };

    const createNode = (
      parentId: string,
      start: number,
      end: number,
      isLeaf: boolean,
      suffixIdx?: number
    ): MutableNode => {
      const node: MutableNode = {
        id: `n${nextNodeId++}`,
        parent: parentId,
        start,
        end,
        isLeaf,
        suffixIdx,
        suffixLink: null,
        children: new Map(),
      };
      nodes.push(node);
      nodeById(parentId).children.set(text[start], node.id);
      return node;
    };

    interface SnapshotOverrides {
      phase?: number;
      remainder?: number;
      activeNode?: string;
      activeEdgeStart?: number | null;
      activeLength?: number;
      highlightNodeIds?: string[];
      suffixLinkHighlight?: { from: string; to: string } | null;
      phaseComplete?: boolean;
      message?: string;
    }

    const snapshot = (overrides: SnapshotOverrides = {}): SuffixTreeState => {
      const currentPhase = overrides.phase ?? phase;
      const edgeStart = 'activeEdgeStart' in overrides
        ? (overrides.activeEdgeStart ?? null)
        : activeEdgeStart;
      const clonedNodes = cloneNodes(nodes);
      const edges = nodes
        .filter((node) => node.parent !== null)
        .map((node) => {
          const end = node.isLeaf ? Math.max(node.start, currentPhase) : node.end;
          return {
            id: `${node.parent}->${node.id}`,
            fromNode: node.parent!,
            toNode: node.id,
            start: node.start,
            end,
            label: text.slice(node.start, end + 1),
            isLeaf: node.isLeaf,
            suffixIdx: node.suffixIdx,
          };
        });
      return {
        text,
        phase: currentPhase,
        remainder: overrides.remainder ?? remainder,
        activeNode: overrides.activeNode ?? activeNode,
        activeEdgeStart: edgeStart,
        activeEdgeChar:
          edgeStart !== null && edgeStart >= 0 && edgeStart < text.length
            ? text[edgeStart]
            : null,
        activeLength: overrides.activeLength ?? activeLength,
        nodes: clonedNodes,
        edges,
        highlightNodeIds: overrides.highlightNodeIds ?? [],
        suffixLinkHighlight: overrides.suffixLinkHighlight ?? null,
        phaseComplete: overrides.phaseComplete ?? false,
        message: overrides.message ?? '',
      };
    };

    const pushFrame = (opts: {
      codeLine: number;
      action: string;
      explanation: string;
      state: SnapshotOverrides;
      pedagogy: StepPedagogy;
      variables?: Record<string, any>;
      callStack?: ExecutionFrame<SuffixTreeState>['callStack'];
      milestone?: string;
      soundCue?: SoundCue;
      checkpoint?: PredictionCheckpoint;
    }) => {
      frames.push({
        stepIndex: frames.length,
        totalSteps: frames.length + 1,
        codeLine: opts.codeLine,
        action: opts.action,
        explanation: opts.explanation,
        state: snapshot(opts.state),
        callStack: opts.callStack ?? [
          {
            name: opts.action.toLowerCase(),
            params: {},
            line: opts.codeLine,
            isCurrent: true,
          },
        ],
        variables: opts.variables,
        metrics: { comparisons, accesses: nodeVisits },
        invariantStatus: {
          label: 'Every suffix of text[0..phase] is explicit or implicit in the tree',
          isValid: true,
        },
        pedagogy: opts.pedagogy,
        ...(opts.milestone
          ? { isMilestone: true, milestoneTitle: opts.milestone }
          : {}),
        ...(opts.soundCue ? { soundCue: opts.soundCue } : {}),
        ...(opts.checkpoint ? { checkpoint: opts.checkpoint } : {}),
      });
    };

    const inputNotes: string[] = [];
    if (sentinelAdded) inputNotes.push("appended sentinel '$'");
    if (withoutInternalSentinels !== rawInput) inputNotes.push("removed internal '$' characters");
    if (truncated) inputNotes.push(`truncated to ${MAX_VISUAL_LENGTH} characters`);

    pushFrame({
      codeLine: 1,
      action: 'INIT',
      explanation:
        `Building a suffix tree for "${text}" (${N} characters, ${N} suffixes).` +
        (inputNotes.length ? ` Input adjusted: ${inputNotes.join('; ')}.` : ''),
      state: {
        phase: 0,
        remainder: 0,
        activeNode: 'n0',
        activeEdgeStart: null,
        activeLength: 0,
        message: `Root created. The tree is empty; every suffix will be added online.`,
      },
      variables: {
        text,
        length: N,
        sentinelAdded,
        truncated,
        internalSentinelsRemoved: withoutInternalSentinels !== rawInput,
      },
      callStack: [
        { name: 'buildSuffixTree', params: { text }, line: 1, isCurrent: true },
      ],
      pedagogy: {
        what: `The tree starts with only a root; no suffix is stored yet.`,
        why: "Ukkonen adds characters left to right, so the tree grows together with the text instead of rebuilding every suffix.",
        whatNext: `Phase 0 adds '${text[0]}' and creates the first leaf for suffix 0.`,
      },
    });

    for (let i = 0; i < N; i++) {
      phase = i;
      remainder++;
      lastNewNode = null;

      pushFrame({
        codeLine: 5,
        action: 'PHASE_START',
        explanation: `Phase ${i}: add '${text[i]}'. Remainder becomes ${remainder}, so ${remainder} suffix(es) still need explicit handling.`,
        state: {
          phase: i,
          remainder,
          message: `Phase ${i} ('${text[i]}'): ${remainder} pending suffix extension(s).`,
        },
        variables: { phase: i, char: text[i], remainder },
        callStack: [
          { name: 'phase', params: { i, char: text[i], remainder }, line: 5, isCurrent: true },
        ],
        soundCue: 'start',
        pedagogy: {
          what: `Phase ${i} appends '${text[i]}' and increments remainder to ${remainder}.`,
          why: 'Each phase must leave every suffix of the current prefix represented, including the new one-character suffix.',
          whatNext: 'Walk the active point: create a leaf, walk down an edge, stop on Rule 3, or split an edge.',
        },
      });

      while (remainder > 0) {
        if (activeLength === 0 && activeEdgeStart !== i) {
          activeEdgeStart = i;
          pushFrame({
            codeLine: 8,
            action: 'SET_ACTIVE_EDGE',
            explanation: `activeLength is 0, so the active edge restarts at index ${i} ('${text[i]}').`,
            state: {
              phase: i,
              remainder,
              activeEdgeStart: i,
              activeLength: 0,
              message: `Active point sits on a node; choose the outgoing edge by '${text[i]}'.`,
            },
            variables: { phase: i, activeEdge: i, activeEdgeChar: text[i], activeLength: 0 },
            soundCue: 'step',
            pedagogy: {
              what: `The active point is exactly on node ${activeNode}, so the next edge is selected by the current character.`,
              why: 'With zero characters consumed on an edge, the active edge is simply the edge that starts with text[i].',
              whatNext: `Look for a child of node ${activeNode} labelled '${text[i]}'.`,
            },
          });
        }

        const edgeStart: number = activeEdgeStart ?? i;
        const activeNodeData = nodeById(activeNode);
        const childId = activeNodeData.children.get(text[edgeStart]);
        nodeVisits++;

        if (!childId) {
          const suffixIdx = i - remainder + 1;
          const leaf = createNode(activeNode, i, i, true, suffixIdx);
          leavesCreated++;

          pushFrame({
            codeLine: 11,
            action: 'CREATE_LEAF',
            explanation: `No child of node ${activeNode} starts with '${text[edgeStart]}' — create a leaf for suffix ${suffixIdx} ("${text.slice(suffixIdx)}").`,
            state: {
              phase: i,
              remainder,
              activeNode,
              activeEdgeStart: edgeStart,
              activeLength,
              highlightNodeIds: [leaf.id],
              message: `Rule 2: suffix ${suffixIdx} gets a new leaf under node ${activeNode}.`,
            },
            variables: {
              phase: i,
              suffixIdx,
              suffix: text.slice(suffixIdx),
              newLeaf: leaf.id,
              parent: activeNode,
              edgeStart: i,
              rule: 2,
            },
            milestone: !firstLeafMilestone ? 'First Leaf Created' : undefined,
            soundCue: 'insert',
            pedagogy: {
              what: `Suffix ${suffixIdx} is not represented yet, so it gets a fresh leaf.`,
              why: 'A leaf is the only place where a suffix can end; its edge label will grow automatically in later phases.',
              whatNext:
                lastNewNode !== null
                  ? `Link ${lastNewNode} to node ${activeNode}, then decrement remainder.`
                  : 'Decrement remainder and adjust the active point.',
            },
          });
          if (!firstLeafMilestone) firstLeafMilestone = true;

          if (lastNewNode !== null) {
            nodeById(lastNewNode).suffixLink = activeNode;
            linksCreated++;
            pushFrame({
              codeLine: 12,
              action: 'SET_SUFFIX_LINK',
              explanation: `Set suffixLink(${lastNewNode}) = ${activeNode}, so the next extension can jump here in O(1).`,
              state: {
                phase: i,
                remainder,
                activeNode,
                activeEdgeStart: edgeStart,
                activeLength,
                highlightNodeIds: [lastNewNode, activeNode],
                suffixLinkHighlight: { from: lastNewNode, to: activeNode },
                message: `Suffix link ${lastNewNode} → ${activeNode}.`,
              },
              variables: {
                phase: i,
                from: lastNewNode,
                to: activeNode,
                reason: 'created leaf without splitting',
              },
              milestone: !firstLinkMilestone ? 'First Suffix Link' : undefined,
              soundCue: 'step',
              pedagogy: {
                what: `The internal node ${lastNewNode} created in the previous extension now points to ${activeNode}.`,
                why: 'Suffix links encode the next shorter suffix, replacing a root-to-node walk with a single jump.',
                whatNext: 'Finish this extension and continue with the next pending suffix.',
              },
            });
            if (!firstLinkMilestone) firstLinkMilestone = true;
          }
        } else {
          const next = nodeById(childId);
          const edgeLen: number = next.isLeaf ? i - next.start + 1 : next.end - next.start + 1;

          if (activeLength >= edgeLen) {
            activeNode = next.id;
            activeEdgeStart = edgeStart + edgeLen;
            activeLength -= edgeLen;
            comparisons++;

            pushFrame({
              codeLine: 16,
              action: 'WALK_DOWN',
              explanation: `activeLength ${activeLength + edgeLen} ≥ edge length ${edgeLen}: skip "${text.slice(next.start, next.start + edgeLen)}" and move the active node to ${next.id}.`,
              state: {
                phase: i,
                remainder,
                activeNode,
                activeEdgeStart,
                activeLength,
                highlightNodeIds: [next.id],
                message: `Canonicalise: active point moved down to node ${next.id}.`,
              },
              variables: {
                phase: i,
                edgeLength: edgeLen,
                edgeLabel: text.slice(next.start, next.start + edgeLen),
                newActiveNode: next.id,
                activeLength,
                activeEdge: activeEdgeStart,
              },
              soundCue: 'step',
              pedagogy: {
                what: `The active point consumed the whole edge, so it moves to the child node ${next.id}.`,
                why: 'Keeping activeLength inside a single edge makes every later comparison O(1); this is active-point canonicalisation.',
                whatNext: 'Continue the same extension from the new active node.',
              },
            });
            continue;
          }

          const edgeChar = text[next.start + activeLength];
          comparisons++;

          if (edgeChar === text[i]) {
            if (lastNewNode !== null) {
              nodeById(lastNewNode).suffixLink = activeNode;
              linksCreated++;
              pushFrame({
                codeLine: 19,
                action: 'SET_SUFFIX_LINK',
                explanation: `Rule 3 reached — set suffixLink(${lastNewNode}) = ${activeNode} before stopping the phase.`,
                state: {
                  phase: i,
                  remainder,
                  activeNode,
                  activeEdgeStart: edgeStart,
                  activeLength,
                  highlightNodeIds: [lastNewNode, activeNode],
                  suffixLinkHighlight: { from: lastNewNode, to: activeNode },
                  message: `Suffix link ${lastNewNode} → ${activeNode}.`,
                },
                variables: {
                  phase: i,
                  from: lastNewNode,
                  to: activeNode,
                  reason: 'rule 3',
                },
                milestone: !firstLinkMilestone ? 'First Suffix Link' : undefined,
                soundCue: 'step',
                pedagogy: {
                  what: `The previous split node ${lastNewNode} receives its suffix link.`,
                  why: 'Suffix links must be set even when the phase stops on Rule 3, otherwise later jumps would miss this node.',
                  whatNext: 'Advance activeLength and stop the phase.',
                },
              });
              if (!firstLinkMilestone) firstLinkMilestone = true;
            }

            activeLength++;
            pushFrame({
              codeLine: 20,
              action: 'RULE3_MATCH',
              explanation: `Rule 3: text[${i}] = '${text[i]}' already occurs at the active point (edge "${text.slice(next.start, next.start + edgeLen)}"). Active length becomes ${activeLength}; the phase stops early.`,
              state: {
                phase: i,
                remainder,
                activeNode,
                activeEdgeStart: edgeStart,
                activeLength,
                highlightNodeIds: [next.id],
                message: `Rule 3: '${text[i]}' already on the active edge — stop extending phase ${i}.`,
              },
              variables: {
                phase: i,
                char: text[i],
                edgeLabel: text.slice(next.start, next.start + edgeLen),
                edgeChar,
                activeLength,
                rule: 3,
                remainderAfterPhase: remainder,
              },
              checkpoint:
                !rule3CheckpointAdded && !splitCheckpointAdded
                  ? {
                      id: 'suffix-tree-rule3-stop',
                      question: `Phase ${i} adds '${text[i]}', but that character already occurs at the active point. What should Ukkonen do?`,
                      options: [
                        'Create another leaf anyway',
                        'Stop extending this phase (Rule 3)',
                        'Split the active edge',
                      ],
                      correctIndex: 1,
                      explanation:
                        'Rule 3 means every remaining suffix is already implicit in the tree, so the phase ends immediately. This early stop is what keeps construction O(N).',
                      hint: 'The character is already inside an existing edge, not missing from the tree.',
                    }
                  : undefined,
              soundCue: 'success',
              pedagogy: {
                what: `'${text[i]}' is already present at the active point, so no structural change is needed.`,
                why: 'All still-pending suffixes share this prefix and are already implicit in the tree; continuing would only duplicate work.',
                whatNext: 'The phase ends here. The next phase appends the following character and increments remainder again.',
              },
            });
            rule3CheckpointAdded = true;
            break;
          }

          const splitStart = next.start;
          const splitEnd = next.start + activeLength - 1;
          const split = createNode(activeNode, splitStart, splitEnd, false);
          splitsCreated++;
          next.start = splitStart + activeLength;
          next.parent = split.id;
          split.children.set(text[next.start], next.id);

          const suffixIdx = i - remainder + 1;
          const leaf = createNode(split.id, i, i, true, suffixIdx);
          leavesCreated++;

          pushFrame({
            codeLine: 23,
            action: 'SPLIT_EDGE',
            explanation: `text[${i}] = '${text[i]}' differs from '${edgeChar}' inside the edge. Split "${text.slice(splitStart, splitEnd + 1)}" into internal node ${split.id} and tail "${text.slice(next.start, next.end + 1)}"; add suffix ${suffixIdx} as a new leaf.`,
            state: {
              phase: i,
              remainder,
              activeNode,
              activeEdgeStart: edgeStart,
              activeLength,
              highlightNodeIds: [split.id, leaf.id],
              message: `Rule 2 split: ${split.id} created, suffix ${suffixIdx} attached.`,
            },
            variables: {
              phase: i,
              splitNode: split.id,
              splitLabel: text.slice(splitStart, splitEnd + 1),
              oldChild: next.id,
              tailLabel: text.slice(next.start, next.end + 1),
              newLeaf: leaf.id,
              suffixIdx,
              suffix: text.slice(suffixIdx),
              mismatch: { expected: edgeChar, actual: text[i] },
              rule: 2,
            },
            milestone: !firstSplitMilestone ? 'First Internal Split' : undefined,
            checkpoint:
              !splitCheckpointAdded
                ? {
                    id: 'suffix-tree-first-split',
                    question: `The new character '${text[i]}' differs from '${edgeChar}' inside the active edge. What must happen before the suffix can be added?`,
                    options: [
                      'Overwrite the edge label',
                      'Split the edge at the mismatch, then attach the new leaf',
                      'Discard the suffix',
                    ],
                    correctIndex: 1,
                    explanation: `The shared prefix "${text.slice(splitStart, splitEnd + 1)}" becomes an internal node; the old child keeps the tail and the new suffix becomes a second child.`,
                    hint: 'Both the old suffix and the new suffix need to continue from the mismatch point.',
                  }
                : undefined,
            soundCue: 'swap',
            pedagogy: {
              what: `The active edge must branch: "${text.slice(splitStart, splitEnd + 1)}" stays above the new internal node, and both continuations hang below it.`,
              why: 'A compressed edge can only represent one label; two different next characters require a real branch point.',
              whatNext:
                lastNewNode !== null
                  ? `Set suffixLink(${lastNewNode}) = ${split.id}, then continue extending.`
                  : 'Decrement remainder and continue extending the next suffix.',
            },
          });
          if (!firstSplitMilestone) firstSplitMilestone = true;
          splitCheckpointAdded = true;

          if (lastNewNode !== null) {
            nodeById(lastNewNode).suffixLink = split.id;
            linksCreated++;
            pushFrame({
              codeLine: 24,
              action: 'SET_SUFFIX_LINK',
              explanation: `Set suffixLink(${lastNewNode}) = ${split.id} so the next extension can jump directly to the new branch point.`,
              state: {
                phase: i,
                remainder,
                activeNode,
                activeEdgeStart: edgeStart,
                activeLength,
                highlightNodeIds: [lastNewNode, split.id],
                suffixLinkHighlight: { from: lastNewNode, to: split.id },
                message: `Suffix link ${lastNewNode} → ${split.id}.`,
              },
              variables: {
                phase: i,
                from: lastNewNode,
                to: split.id,
                reason: 'split created an internal node',
              },
              milestone: !firstLinkMilestone ? 'First Suffix Link' : undefined,
              soundCue: 'step',
              pedagogy: {
                what: `The previous split node now points to the new internal node ${split.id}.`,
                why: 'The suffix link chain mirrors the suffix structure, so the next extension does not restart from the root.',
                whatNext: 'Continue with the next pending suffix.',
              },
            });
            if (!firstLinkMilestone) firstLinkMilestone = true;
          }
          lastNewNode = split.id;
        }

        remainder--;
        if (activeNode === 'n0' && activeLength > 0) {
          activeLength--;
          activeEdgeStart = i - remainder + 1;
        } else if (activeNode !== 'n0') {
          activeNode = nodeById(activeNode).suffixLink ?? 'n0';
        }

        pushFrame({
          codeLine: 26,
          action: 'EXTENSION_DONE',
          explanation: `Extension complete: remainder = ${remainder}. Active point is (node ${activeNode}, edge ${activeEdgeStart ?? 'none'}, length ${activeLength}).`,
          state: {
            phase: i,
            remainder,
            activeNode,
            activeEdgeStart,
            activeLength,
            message: `Remainder ${remainder}; next extension starts from (${activeNode}, ${activeEdgeStart ?? '—'}, ${activeLength}).`,
          },
          variables: {
            phase: i,
            remainder,
            activeNode,
            activeEdge: activeEdgeStart,
            activeEdgeChar:
              activeEdgeStart !== null ? text[activeEdgeStart] : null,
            activeLength,
          },
          soundCue: 'step',
          pedagogy: {
            what: `The suffix for this extension is now represented; remainder drops to ${remainder}.`,
            why:
              activeNode === 'n0' && activeLength > 0
                ? 'The active point was on the root edge, so the next shorter suffix drops one character and restarts at the new edge.'
                : activeNode !== 'n0'
                  ? 'The active node followed its suffix link, jumping to the next shorter suffix without a root walk.'
                  : 'Remainder is zero, so this phase is finished.',
            whatNext:
              remainder > 0
                ? 'Repeat the extension loop with the adjusted active point.'
                : `Phase ${i} is done; move to phase ${i + 1}.`,
          },
        });
      }

      pushFrame({
        codeLine: 32,
        action: 'PHASE_COMPLETE',
        explanation: `Phase ${i} complete. Every leaf edge now ends at index ${i}, so all ${i + 1} suffixes of "${text.slice(0, i + 1)}" are represented${remainder > 0 ? `; ${remainder} suffix(es) are still implicit inside edges` : ''}.`,
        state: {
          phase: i,
          remainder,
          message: `Phase ${i} complete: ${leavesCreated} leaf/leaves in the tree.`,
          phaseComplete: true,
        },
        variables: {
          phase: i,
          remainder,
          leaves: leavesCreated,
          nodes: nodes.length,
          edges: nodes.length - 1,
          prefix: text.slice(0, i + 1),
        },
        soundCue: 'complete',
        pedagogy: {
          what: `The tree now represents every suffix of the prefix "${text.slice(0, i + 1)}".`,
          why: 'Leaf edges grow implicitly with the global end pointer, so extending them costs no extra work per phase.',
          whatNext:
            i + 1 < N
              ? `Phase ${i + 1} appends '${text[i + 1]}'.`
              : 'Construction is complete; inspect the suffix links and the leaf labels.',
        },
      });
    }

    const leaves = nodes.filter((node) => node.isLeaf);
    pushFrame({
      codeLine: 33,
      action: 'COMPLETE',
      explanation: `Ukkonen construction complete: ${leaves.length} suffixes indexed with ${nodes.length} nodes and ${nodes.length - 1} compressed edges in O(${N}) time.`,
      state: {
        phase: N,
        remainder: 0,
        activeNode: 'n0',
        activeEdgeStart: null,
        activeLength: 0,
        message: `Suffix tree finalized: ${nodes.length} nodes, ${nodes.length - 1} edges, ${leaves.length} leaves.`,
        phaseComplete: true,
      },
      variables: {
        totalNodes: nodes.length,
        totalEdges: nodes.length - 1,
        totalLeaves: leaves.length,
        comparisons,
        splits: splitsCreated,
        suffixLinks: linksCreated,
      },
      callStack: [
        {
          name: 'buildSuffixTree',
          params: { text, nodes: nodes.length },
          line: 33,
          isCurrent: true,
        },
      ],
      milestone: 'All Suffixes Indexed',
      soundCue: 'finish',
      pedagogy: {
        what: `All ${leaves.length} suffixes have distinct leaves; each leaf is labelled with its suffix start index.`,
        why: 'The sentinel guarantees no suffix is a prefix of another, so every suffix ends at its own leaf.',
        whatNext: 'Step back through the timeline to watch Rule 3 stops, splits, and suffix-link jumps; or edit the text to compare cases.',
      },
    });

    frames.forEach((frame) => {
      frame.totalSteps = frames.length;
    });
    return frames;
  },
  renderStage: (frame: ExecutionFrame<SuffixTreeState>) => {
    const {
      text,
      phase,
      remainder,
      activeNode,
      activeEdgeStart,
      activeLength,
      nodes,
      edges,
      highlightNodeIds,
      suffixLinkHighlight,
      message,
    } = frame.state;

    const nodeMap = new Map(nodes.map((node) => [node.id, node]));
    const childrenOf = new Map<string, string[]>();
    for (const edge of edges) {
      const list = childrenOf.get(edge.fromNode) ?? [];
      list.push(edge.toNode);
      childrenOf.set(edge.fromNode, list);
    }
    // Lexicographic child order makes the suffix tree read like a sorted
    // suffix list instead of exposing node-creation order.
    for (const list of childrenOf.values()) {
      list.sort((a, b) => {
        const na = nodeMap.get(a)!;
        const nb = nodeMap.get(b)!;
        return text.charCodeAt(na.start) - text.charCodeAt(nb.start);
      });
    }

    const positions = new Map<string, { x: number; y: number }>();
    const leafGap = 128;
    let leafCursor = 0;
    let maxDepth = 0;

    const place = (id: string): number => {
      const node = nodeMap.get(id);
      const depth = node?.depth ?? 0;
      maxDepth = Math.max(maxDepth, depth);
      const kids = childrenOf.get(id) ?? [];
      let x: number;
      if (kids.length === 0) {
        x = 80 + leafCursor * leafGap;
        leafCursor++;
      } else {
        const childXs = kids.map(place);
        x = (Math.min(...childXs) + Math.max(...childXs)) / 2;
      }
      positions.set(id, { x, y: 54 + depth * 88 });
      return x;
    };
    if (nodeMap.has('n0')) place('n0');

    const width = Math.max(760, 160 + Math.max(1, leafCursor) * leafGap);
    const height = Math.max(340, 54 + maxDepth * 88 + 74);

    const activePath = new Set<string>();
    let cursor: string | null = activeNode;
    while (cursor) {
      activePath.add(cursor);
      cursor = nodeMap.get(cursor)?.parent ?? null;
    }

    const activeEdge = edges.find(
      (edge) => edge.fromNode === activeNode && edge.start === activeEdgeStart
    );

    const linkNodes = nodes.filter(
      (node) => !node.isLeaf && node.suffixLink && node.id !== 'n0'
    );

    const highlightSet = new Set(highlightNodeIds);

    const edgeLabel = (label: string) =>
      label.length > 18 ? label.slice(0, 17) + '…' : label;

    const renderSuffixLink = (
      fromId: string,
      toId: string,
      highlighted: boolean
    ) => {
      const from = positions.get(fromId);
      const to = positions.get(toId);
      if (!from || !to) return null;
      const mx = (from.x + to.x) / 2;
      const my = (from.y + to.y) / 2 - 38;
      return (
        <g key={`link-${fromId}-${toId}`}>
          <path
            d={`M ${from.x} ${from.y - 12} Q ${mx} ${my} ${to.x} ${to.y - 12}`}
            fill="none"
            stroke={highlighted ? '#818CF8' : '#475569'}
            strokeWidth={highlighted ? 2 : 1}
            strokeDasharray="4 4"
            opacity={highlighted ? 0.95 : 0.28}
            markerEnd="url(#suffix-link-arrow)"
          />
          {highlighted && (
            <text
              x={mx}
              y={my + 2}
              textAnchor="middle"
              fill="#A5B4FC"
              fontSize="8"
              fontFamily="monospace"
              fontWeight="700"
            >
              link
            </text>
          )}
        </g>
      );
    };

    return (
      <div className="flex flex-col items-center justify-center p-4 w-full max-w-5xl mx-auto gap-4">
        <div className="w-full rounded-xl border border-slate-700/60 bg-slate-900/80 px-4 py-2 text-center font-mono text-xs text-slate-200">
          {message}
        </div>

        <div className="grid w-full grid-cols-2 gap-2 font-mono text-[11px] sm:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 text-center">
            <div className="text-slate-400">Phase</div>
            <div className="text-base font-bold text-cyan-300">
              {phase < text.length ? `${phase} ('${text[phase]}')` : 'done'}
            </div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 text-center">
            <div className="text-slate-400">Remainder</div>
            <div className="text-base font-bold text-amber-300">{remainder}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 text-center">
            <div className="text-slate-400">Active point</div>
            <div className="text-base font-bold text-indigo-300">
              {activeNode} · {activeEdgeStart ?? '—'} · {activeLength}
            </div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 text-center">
            <div className="text-slate-400">Tree</div>
            <div className="text-base font-bold text-emerald-300">
              {nodes.length} nodes · {edges.length} edges
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70 p-2">
          <div className="flex min-w-max items-end gap-1 font-mono">
            {text.split('').map((ch, idx) => {
              const isPhaseChar = idx === phase;
              const edgeEnd =
                activeEdgeStart === null
                  ? -1
                  : activeEdgeStart + Math.max(activeLength, 1) - 1;
              const isOnActiveEdge =
                activeEdgeStart !== null &&
                idx >= activeEdgeStart &&
                idx <= Math.min(edgeEnd, text.length - 1);
              const suffixStart = phase - remainder + 1;
              const isSuffixStart = idx === suffixStart && remainder > 0;
              return (
                <div key={`char-${idx}`} className="flex flex-col items-center gap-0.5">
                  <div className="h-3 text-[8px] leading-none text-amber-300">
                    {isSuffixStart ? '▲' : ''}
                  </div>
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded border text-xs font-bold ${
                      isPhaseChar
                        ? 'border-cyan-300 bg-cyan-500/30 text-cyan-100'
                        : isOnActiveEdge
                          ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                          : 'border-slate-700 bg-slate-900 text-slate-300'
                    }`}
                  >
                    {ch}
                  </div>
                  <div className="text-[8px] leading-none text-slate-500">{idx}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-full overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/70 p-2 shadow-inner">
          <svg
            className="block"
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
          >
            <defs>
              <marker
                id="suffix-link-arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#818CF8" />
              </marker>
            </defs>

            {edges.map((edge) => {
              const from = positions.get(edge.fromNode);
              const to = positions.get(edge.toNode);
              if (!from || !to) return null;
              const isActive = activeEdge?.id === edge.id;
              const onActivePath =
                activePath.has(edge.fromNode) && activePath.has(edge.toNode);
              const stroke = isActive
                ? '#F59E0B'
                : onActivePath
                  ? '#A78BFA'
                  : edge.isLeaf
                    ? '#10B981'
                    : '#64748B';
              const mx = (from.x + to.x) / 2;
              const my = (from.y + to.y) / 2;
              const label = edgeLabel(edge.label);
              const labelWidth = Math.max(26, label.length * 6.1 + 10);
              return (
                <g key={edge.id}>
                  <line
                    x1={from.x}
                    y1={from.y + 12}
                    x2={to.x}
                    y2={to.y - 14}
                    stroke={stroke}
                    strokeWidth={isActive ? 2.6 : 1.6}
                  />
                  <rect
                    x={mx - labelWidth / 2}
                    y={my - 9}
                    width={labelWidth}
                    height={17}
                    rx={4}
                    fill="#0B0F19"
                    stroke={isActive ? '#F59E0B' : '#334155'}
                    strokeWidth={1}
                  />
                  <text
                    x={mx}
                    y={my + 3}
                    textAnchor="middle"
                    fill={isActive ? '#FCD34D' : edge.isLeaf ? '#6EE7B7' : '#CBD5E1'}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="700"
                  >
                    {label}
                  </text>
                </g>
              );
            })}

            {linkNodes.map((node) =>
              renderSuffixLink(
                node.id,
                node.suffixLink!,
                suffixLinkHighlight?.from === node.id &&
                  suffixLinkHighlight?.to === node.suffixLink
              )
            )}

            {nodes.map((node) => {
              const pos = positions.get(node.id);
              if (!pos) return null;
              const isActive = node.id === activeNode;
              const isHighlighted = highlightSet.has(node.id);
              const onPath = activePath.has(node.id);
              const isRoot = node.id === 'n0';
              const suffixLabel = node.isLeaf ? `#${node.suffixIdx ?? '?'}` : '';

              if (isRoot) {
                return (
                  <g key={node.id}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={18}
                      fill={isActive ? '#4F46E5' : '#0F172A'}
                      stroke="#38BDF8"
                      strokeWidth={2.5}
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 4}
                      textAnchor="middle"
                      fill="#F8FAFC"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="700"
                    >
                      root
                    </text>
                  </g>
                );
              }

              if (node.isLeaf) {
                return (
                  <g key={node.id}>
                    <rect
                      x={pos.x - 20}
                      y={pos.y - 12}
                      width={40}
                      height={24}
                      rx={7}
                      fill={isHighlighted ? '#065F46' : '#022C22'}
                      stroke={isHighlighted ? '#34D399' : '#10B981'}
                      strokeWidth={isHighlighted ? 2.5 : 1.6}
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 4}
                      textAnchor="middle"
                      fill="#D1FAE5"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="700"
                    >
                      {suffixLabel}
                    </text>
                  </g>
                );
              }

              return (
                <g key={node.id}>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={11}
                    fill={
                      isHighlighted
                        ? '#78350F'
                        : isActive
                          ? '#4F46E5'
                          : onPath
                            ? '#312E81'
                            : '#0F172A'
                    }
                    stroke={
                      isHighlighted
                        ? '#FBBF24'
                        : isActive
                          ? '#A5B4FC'
                          : '#64748B'
                    }
                    strokeWidth={isHighlighted || isActive ? 2.5 : 1.5}
                  />
                  <circle cx={pos.x} cy={pos.y} r={3} fill="#CBD5E1" />
                </g>
              );
            })}
          </svg>
        </div>

        <div className="flex w-full flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-slate-400">
          <div className="flex flex-wrap items-center gap-3">
            <span><span className="text-cyan-300">●</span> current phase character</span>
            <span><span className="text-amber-300">━</span> active edge</span>
            <span><span className="text-indigo-300">◌</span> active node</span>
            <span><span className="text-emerald-300">#j</span> leaf = suffix starting at j</span>
            <span><span className="text-indigo-300">⇢</span> suffix link</span>
          </div>
          <span className="text-slate-500">
            {nodes.filter((n) => n.isLeaf).length} leaves · {remainder} pending suffix(es)
          </span>
        </div>
      </div>
    );
  },
};
