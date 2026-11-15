import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface SkipListNodeVisual {
  key: number;
  height: number;
}

export interface SkipListState {
  elements: number[];
  nodeHeights: Record<number, number>;
  activeKey: number | null;
  activeLevel: number | null;
  targetKey: number | null;
  visitedNodes: { key: number; level: number }[];
  found: boolean | null;
}

export const skipListModule: AlgorithmModule<
  { elements: number[]; searchTarget: number },
  SkipListState
> = {
  id: 'skip-list',
  title: 'SkipList (Probabilistic Multi-Level Express Lanes O(log N))',
  category: 'trees-bst',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(1)',
    timeAverage: 'O(log N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(N) probabilistic pointer tower overhead',
    worstCaseCondition: 'Coin flips generate all level-1 towers, degenerating to a standard singly linked list',
  },
  theory: {
    overview:
      'A SkipList is a probabilistic alternative to balanced trees invented by William Pugh. It consists of multiple ordered linked lists layered hierarchically, allowing forward searches to skip over large sequences of elements in O(log N) expected time.',
    whyItWorks:
      'Each node is assigned a random height via geometric coin flipping with probability p = 0.5. Higher levels act as express subway lines, halving the search space at each transition downwards.',
    invariant:
      'Express Lane Ordering: Each level is a strictly monotonically increasing linked list. A node present at level L is guaranteed to be present at all levels below L (0 to L - 1).',
    pitfalls: [
      'Forgetting to update backward or forward pointers across all tower levels during insertion or deletion.',
      'Unbounded tower heights without capping at maxLevel = floor(log2(N)).',
    ],
  },
  presets: [
    {
      id: 'skiplist-search-mid',
      label: 'Express Lane Search for 25',
      description: 'Traverses through L3, drops to L2, and stops exactly at key 25',
      data: {
        elements: [3, 7, 9, 12, 17, 21, 25, 31, 38, 45, 52],
        searchTarget: 25,
      },
    },
    {
      id: 'skiplist-search-missing',
      label: 'Search for Non-Existent Key 30',
      description: 'Demonstrates downward ladder traversal between 25 and 31 without match',
      data: {
        elements: [3, 7, 12, 19, 25, 31, 42, 50],
        searchTarget: 30,
      },
    },
  ],
  defaultInput: {
    elements: [3, 7, 9, 12, 17, 21, 25, 31, 38, 45, 52],
    searchTarget: 25,
  },
  codeSnippets: {
    cpp: `struct Node {
    int key;
    vector<Node*> forward;
    Node(int k, int level) : key(k), forward(level + 1, nullptr) {}
};

bool search(Node* head, int target, int maxLevel) {
    Node* current = head;
    for (int i = maxLevel; i >= 0; i--) {
        while (current->forward[i] && current->forward[i]->key < target) {
            current = current->forward[i];
        }
    }
    current = current->forward[0];
    return (current && current->key == target);
}`,
    python: `def search(head, target, max_level):
    current = head
    for level in reversed(range(max_level + 1)):
        while current.forward[level] and current.forward[level].key < target:
            current = current.forward[level]
    current = current.forward[0]
    return current is not None and current.key == target`,
    typescript: `interface SkipNode {
  key: number;
  forward: (SkipNode | null)[];
}

function search(head: SkipNode, target: number, maxLevel: number): boolean {
  let curr: SkipNode | null = head;
  for (let l = maxLevel; l >= 0; l--) {
    while (curr && curr.forward[l] && curr.forward[l]!.key < target) {
      curr = curr.forward[l];
    }
  }
  curr = curr?.forward[0] ?? null;
  return curr !== null && curr.key === target;
}`,
    java: `public boolean search(SkipNode head, int target, int maxLevel) {
    SkipNode curr = head;
    for (int l = maxLevel; l >= 0; l--) {
        while (curr.forward[l] != null && curr.forward[l].key < target) {
            curr = curr.forward[l];
        }
    }
    curr = curr.forward[0];
    return curr != null && curr.key == target;
}`,
    pseudocode: `function search(head, target, maxLevel):
    curr = head
    for level from maxLevel down to 0:
        # express lane at this level: look at the next tower
        next = closest tower after curr with height >= level
        while next exists:
            # candidate found — compare against target
            if next.key < target: curr = next; next = next tower
            else if next.key == target: return FOUND
            else: break             # overshoot: descend
        # no next tower here: descend to the slower lane
        level = level - 1
    # reached level 0
    next = curr.forward[0]
    return next != null and next.key == target   # else NOT FOUND`,
  },
  generateTimeline: (input: {
    elements: number[];
    searchTarget: number;
  }): ExecutionFrame<SkipListState>[] => {
    const rawElements = input?.elements?.length
      ? [...new Set(input.elements)].sort((a, b) => a - b)
      : [3, 7, 9, 12, 17, 21, 25, 31, 38, 45, 52];
    const target = input?.searchTarget ?? 25;

    // Deterministic pseudo-random heights based on index parity for clean visualization
    const heights: Record<number, number> = {};
    rawElements.forEach((el, idx) => {
      if (idx % 4 === 0) heights[el] = 3;
      else if (idx % 2 === 0) heights[el] = 2;
      else heights[el] = 1;
    });

    const maxLevel = 3;
    const frames: ExecutionFrame<SkipListState>[] = [];
    const visited: { key: number; level: number }[] = [];
    let checkpointAdded = false;

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      isMilestone: true,
      milestoneTitle: `Init SkipList Express Lanes (Max L${maxLevel})`,
      action: 'INIT',
      state: {
        elements: rawElements,
        nodeHeights: { ...heights },
        activeKey: null,
        activeLevel: maxLevel,
        targetKey: target,
        visitedNodes: [],
        found: null,
      },
      callStack: [{ name: 'skipListSearch', params: { target, maxLevel }, line: 1, isCurrent: true }],
      variables: { target, maxLevel, totalKeys: rawElements.length, towers: Object.entries(heights).map(([k, v]) => `${k}:h${v}`).join(', ') },
      conditionEval: { expr: 'elements.length > 0', result: true },
      soundCue: { type: 'step' },
      pedagogy: {
        what: `Deterministic tower heights: ${Object.entries(heights).map(([k, v]) => `${k}→h${v}`).join(', ')}. Search for ${target}.`,
        why: 'A tower of height h appears in express lanes L0..h-1; taller towers let the search skip more nodes per hop.',
        whatNext: `Start at the top express lane L${maxLevel} from the head pointer.`,
      },
      explanation: `Initialized SkipList with ${rawElements.length} elements across ${maxLevel + 1} levels (L0 to L3). Higher levels act as express lanes to bypass sequences of nodes. Target search key: ${target}.`,
    });

    let currentKey: number | null = null; // null represents head
    let found = false;

    for (let level = maxLevel; level >= 0; level--) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 3,
        isMilestone: true,
        milestoneTitle: `Enter Express Level ${level}`,
        action: 'LEVEL_START',
        state: {
          elements: rawElements,
          nodeHeights: { ...heights },
          activeKey: currentKey,
          activeLevel: level,
          targetKey: target,
          visitedNodes: [...visited],
          found: null,
        },
        callStack: [{ name: 'scanLevel', params: { level, current: currentKey ?? 'HEAD' }, line: 3, isCurrent: true }],
        variables: { currentLevel: level, currentKey: currentKey ?? 'HEAD' },
        conditionEval: { expr: `level >= 0`, result: true },
        soundCue: { type: 'select' },
        pedagogy: {
          what: `Begin scanning express lane L${level} from ${currentKey !== null ? `key ${currentKey}` : 'the head pointer'}.`,
          why: 'Higher lanes skip more nodes; the search only moves forward on the current lane and never needs to go back up.',
          whatNext: 'Inspect the next tower on this lane.',
        },
        checkpoint: !checkpointAdded
          ? {
              id: 'skip-list-express-lanes',
              question: 'Why do express lanes keep the expected search O(log n)?',
              options: [
                'Each lane advances past every tower whose key is below the target and then drops one level, so only a handful of nodes are visited on the way down',
                'Because every level scans the full list of nodes',
              ],
              correctIndex: 0,
              explanation:
                'With random-ish tower heights, lane Lk keeps about 1/2^k of the nodes. The search skips roughly half the remaining candidates per level, giving O(log n) hops in expectation.',
            }
          : undefined,
        explanation: `Scanning along express Level ${level} starting from ${currentKey !== null ? `key ${currentKey}` : 'HEAD pointer'}.`,
      });
      checkpointAdded = true;

      // Find candidates at this level after currentKey
      while (true) {
        const nextNode = rawElements.find(
          (k) => (currentKey === null || k > currentKey) && (heights[k] ?? 1) >= level
        );

        if (!nextNode) {
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 11,
            action: 'DROP_DOWN',
            state: {
              elements: rawElements,
              nodeHeights: { ...heights },
              activeKey: currentKey,
              activeLevel: level,
              targetKey: target,
              visitedNodes: [...visited],
              found: null,
            },
            callStack: [{ name: 'dropDown', params: { fromLevel: level, toLevel: level - 1 }, line: 11, isCurrent: true }],
            variables: { droppedToLevel: level - 1, atKey: currentKey ?? 'HEAD' },
            conditionEval: { expr: `forward[${level}] === null`, result: true },
            soundCue: { type: 'step' },
            pedagogy: {
              what: `Lane L${level} has no tower left after ${currentKey ?? 'HEAD'}, so the search drops to L${level - 1}.`,
              why: 'Descending keeps the position (curr) — lower lanes contain every tower the current lane could reach, plus more.',
              whatNext: `Continue scanning at L${level - 1}.`,
            },
            explanation: `No further forward express pointers exist at Level ${level}. Dropping vertically down to Level ${level - 1}.`,
          });
          break;
        }

        visited.push({ key: nextNode, level });

        // Compare nextNode with target
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 7,
          action: 'COMPARE_NODE',
          state: {
            elements: rawElements,
            nodeHeights: { ...heights },
            activeKey: nextNode,
            activeLevel: level,
            targetKey: target,
            visitedNodes: [...visited],
            found: null,
          },
          callStack: [{ name: 'compareKey', params: { candidateKey: nextNode, target, level }, line: 7, isCurrent: true }],
          variables: { candidateKey: nextNode, target, comparison: `${nextNode} vs ${target}` },
          conditionEval: { expr: `nextNode.key (${nextNode}) < target (${target})`, result: nextNode < target },
          soundCue: { type: 'compare' },
          pedagogy: {
            what: `Candidate ${nextNode} on lane L${level} is compared with ${target}.`,
            why: 'Keys are sorted in every lane, so one comparison tells the search whether to step forward, stop, or descend.',
            whatNext: nextNode < target ? 'Step forward.' : nextNode === target ? 'Match found.' : 'Overshoot — drop down.',
          },
          explanation: `Inspecting next node in Level ${level} express lane: Key ${nextNode}. Comparing against target ${target}.`,
        });

        if (nextNode < target) {
          currentKey = nextNode;
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 8,
            action: 'FORWARD_STEP',
            state: {
              elements: rawElements,
              nodeHeights: { ...heights },
              activeKey: currentKey,
              activeLevel: level,
              targetKey: target,
              visitedNodes: [...visited],
              found: null,
            },
            callStack: [{ name: 'stepForward', params: { key: currentKey, level }, line: 8, isCurrent: true }],
            variables: { currentKey, target, status: 'Advanced forward' },
            conditionEval: { expr: `${nextNode} < ${target}`, result: true },
            soundCue: { type: 'swap' },
            pedagogy: {
              what: `${nextNode} < ${target}, so the walk advances to ${currentKey} without ever considering the skipped keys at lower lanes.`,
              why: 'Forward stepping on a higher lane is what makes the search skip many nodes at once.',
              whatNext: `Compare the next tower on L${level}.`,
            },
            explanation: `Since ${nextNode} < ${target}, advance forward to node ${currentKey} at Level ${level}.`,
          });
        } else if (nextNode === target) {
          currentKey = nextNode;
          found = true;
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 9,
            isMilestone: true,
            milestoneTitle: `Target Key ${target} Found at L${level}!`,
            action: 'FOUND',
            state: {
              elements: rawElements,
              nodeHeights: { ...heights },
              activeKey: currentKey,
              activeLevel: level,
              targetKey: target,
              visitedNodes: [...visited],
              found: true,
            },
            callStack: [{ name: 'matchFound', params: { key: currentKey, level }, line: 9, isCurrent: true }],
            variables: { matchedKey: currentKey, levelFound: level, searchSuccessful: true },
            conditionEval: { expr: `${nextNode} === ${target}`, result: true },
            soundCue: { type: 'complete' },
            pedagogy: {
              what: `Candidate ${nextNode} equals the target on lane L${level}; the search returns FOUND.`,
              why: 'Every skipped key on this lane was smaller, and the tower being compared is in the base list too, so the match is genuine.',
              whatNext: 'Search complete — no further levels are scanned.',
            },
            explanation: `Target key ${target} located directly in Level ${level} express lane! Search terminated in O(log N) operations.`,
          });
          break;
        } else {
          // nextNode > target
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 10,
            action: 'OVERSHOOT',
            state: {
              elements: rawElements,
              nodeHeights: { ...heights },
              activeKey: currentKey,
              activeLevel: level,
              targetKey: target,
              visitedNodes: [...visited],
              found: null,
            },
            callStack: [{ name: 'overshoot', params: { nextNode, target, level }, line: 10, isCurrent: true }],
            variables: { nextNode, target, comparison: `${nextNode} > ${target}` },
            conditionEval: { expr: `${nextNode} > ${target}`, result: true },
            soundCue: { type: 'step' },
            pedagogy: {
              what: `${nextNode} > ${target}: stepping forward would skip past the target, so the lane is abandoned here.`,
              why: 'Skipping an overshooting tower can never lose the target — if it exists, it lies between the current key and this candidate.',
              whatNext: `Drop to L${level - 1} and search the finer-grained lane.`,
            },
            explanation: `Key ${nextNode} exceeds target ${target}. Halting forward advance at Level ${level} to drop down to Level ${level - 1}.`,
          });
          break;
        }
      }

      if (found) break;
    }

    if (!found) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 15,
        isMilestone: true,
        milestoneTitle: `Key ${target} Not Found`,
        action: 'NOT_FOUND',
        state: {
          elements: rawElements,
          nodeHeights: { ...heights },
          activeKey: currentKey,
          activeLevel: 0,
          targetKey: target,
          visitedNodes: [...visited],
          found: false,
        },
        callStack: [{ name: 'searchFailed', params: { target }, line: 15, isCurrent: true }],
        variables: { target, result: 'NOT_FOUND', finalKey: currentKey },
        conditionEval: { expr: 'targetFound', result: false },
        soundCue: { type: 'complete' },
        pedagogy: {
          what: `The base lane L0 was scanned to its end without matching ${target}, so the key does not exist.`,
          why: 'L0 contains every element; if the target were present, the walk on L0 would have found it.',
          whatNext: 'Compare with a balanced BST: same O(log n) search, but skip lists use randomization instead of rotations.',
        },
        explanation: `Reached bottom Level 0 without finding key ${target}. Target key does not exist in SkipList.`,
      });
    }

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });

    return frames;
  },
  renderStage: (frame: ExecutionFrame<SkipListState>) => {
    const { elements, nodeHeights, activeKey, activeLevel, targetKey, visitedNodes, found } =
      frame.state;

    const levels = [3, 2, 1, 0];
    const colWidth = 56;
    const startX = 90;

    return (
      <div className="flex flex-col items-center justify-center p-6 gap-6 w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Target Key:</span>
            <span className="font-mono text-sm font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-3 py-1 rounded">
              {targetKey}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {found === true && (
              <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3 py-1 rounded">
                MATCH FOUND
              </span>
            )}
            {found === false && (
              <span className="text-xs font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 px-3 py-1 rounded">
                KEY NOT PRESENT
              </span>
            )}
            <span className="text-xs font-mono text-slate-400">
              Active Level: <strong className="text-amber-400">L{activeLevel ?? '-'}</strong>
            </span>
          </div>
        </div>

        <div className="relative w-full overflow-x-auto bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 shadow-inner min-h-[340px]">
          <svg className="w-[740px] h-[280px]" viewBox="0 0 740 280">
            {/* Draw Level Track Lines */}
            {levels.map((lvl) => {
              const y = (3 - lvl) * 60 + 50;
              const isCurrentLvl = lvl === activeLevel;
              return (
                <g key={`track-${lvl}`}>
                  <line
                    x1="40"
                    y1={y}
                    x2="700"
                    y2={y}
                    stroke={isCurrentLvl ? '#38bdf8' : '#334155'}
                    strokeWidth={isCurrentLvl ? '2' : '1'}
                    strokeDasharray={isCurrentLvl ? undefined : '4 4'}
                  />
                  <text
                    x="20"
                    y={y + 5}
                    fill={isCurrentLvl ? '#38bdf8' : '#64748b'}
                    fontSize="12"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    L{lvl}
                  </text>
                  {/* Head node at this level */}
                  <circle cx="55" cy={y} r="10" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
                  <text x="55" y={y + 3} textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="bold">
                    H
                  </text>
                </g>
              );
            })}

            {/* Elements and Towers */}
            {elements.map((el, idx) => {
              const x = startX + idx * colWidth;
              const height = nodeHeights[el] ?? 1;

              return (
                <g key={`col-${el}`}>
                  {/* Vertical connecting tower line */}
                  <line
                    x1={x}
                    y1={(3 - height) * 60 + 50}
                    x2={x}
                    y2={3 * 60 + 50}
                    stroke="#475569"
                    strokeWidth="2"
                  />

                  {/* Draw nodes at each height level */}
                  {Array.from({ length: height + 1 }).map((_, l) => {
                    const y = (3 - l) * 60 + 50;
                    const isActive = el === activeKey && l === activeLevel;
                    const isVisited = visitedNodes.some((v) => v.key === el && v.level === l);
                    const isMatch = el === targetKey && found === true;

                    let fill = '#0f172a';
                    let stroke = '#334155';
                    if (isMatch) {
                      fill = '#065f46';
                      stroke = '#10b981';
                    } else if (isActive) {
                      fill = '#78350f';
                      stroke = '#f59e0b';
                    } else if (isVisited) {
                      fill = '#1e3a8a';
                      stroke = '#3b82f6';
                    }

                    return (
                      <g key={`node-${el}-l${l}`}>
                        <circle
                          cx={x}
                          cy={y}
                          r="14"
                          fill={fill}
                          stroke={stroke}
                          strokeWidth={isActive || isMatch ? '2.5' : '1.5'}
                          className="transition-all duration-300"
                        />
                        <text
                          x={x}
                          y={y + 4}
                          textAnchor="middle"
                          fill={isActive ? '#fbbf24' : isMatch ? '#34d399' : '#e2e8f0'}
                          fontSize="11"
                          fontWeight="700"
                          fontFamily="monospace"
                        >
                          {el}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  },
};
