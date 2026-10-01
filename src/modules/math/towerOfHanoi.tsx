import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface HanoiInput {
  numDisks: number;
}

export interface HanoiDisk {
  size: number;
  color: string;
}

export interface HanoiState {
  rods: {
    A: HanoiDisk[];
    B: HanoiDisk[];
    C: HanoiDisk[];
  };
  movingDisk?: {
    size: number;
    from: 'A' | 'B' | 'C';
    to: 'A' | 'B' | 'C';
  };
  moveCount: number;
  totalMovesNeeded: number;
}

const DISK_COLORS = [
  '#38bdf8', // sky-400 (smallest)
  '#818cf8', // indigo-400
  '#c084fc', // purple-400
  '#f472b6', // pink-400
  '#fb7185', // rose-400 (largest)
];

export const towerOfHanoiModule: AlgorithmModule<HanoiInput, HanoiState> = {
  id: 'tower-of-hanoi',
  title: 'Tower of Hanoi (Recursive Call Stack)',
  category: 'math',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(2^N)',
    timeAverage: 'O(2^N)',
    timeWorst: 'O(2^N)',
    spaceAuxiliary: 'O(N) recursive call stack',
    worstCaseCondition: 'Strictly deterministic 2^N - 1 moves required for any N disks',
  },
  theory: {
    overview:
      'The Tower of Hanoi is a classic mathematical puzzle consisting of three rods and N disks of graduated sizes. The objective is to move the entire stack to the destination rod, obeying two inviolable rules: (1) only one disk can be moved at a time, and (2) no larger disk may ever be placed atop a smaller disk.',
    whyItWorks:
      'Divide and conquer solves Hanoi in three inductive steps: 1) Recursively move N-1 disks from Source to Auxiliary. 2) Move the single largest remaining disk N from Source to Destination. 3) Recursively move N-1 disks from Auxiliary to Destination.',
    invariant:
      'On every rod at every instant, disk sizes strictly increase from top to bottom: disk[k] < disk[k+1].',
    pitfalls: [
      'Violating the non-inversion invariant by placing a larger disk onto a smaller disk.',
      'Exponential explosion: 20 disks take over 1,000,000 moves; keep visualizer N <= 5.',
    ],
  },
  presets: [
    { id: '3-disks', label: '3 Disks (7 Moves)', description: 'Classic fast induction', data: { numDisks: 3 } },
    { id: '4-disks', label: '4 Disks (15 Moves)', description: 'Standard demonstration', data: { numDisks: 4 } },
    { id: '5-disks', label: '5 Disks (31 Moves)', description: 'Deep recursion tree', data: { numDisks: 5 } },
  ],
  defaultInput: { numDisks: 3 },
  codeSnippets: {
    python: `def hanoi(n, source, target, aux):
    if n == 1:
        print(f"Move disk 1 from {source} to {target}")
        return
    hanoi(n - 1, source, aux, target)
    print(f"Move disk {n} from {source} to {target}")
    hanoi(n - 1, aux, target, source)`,
    typescript: `function hanoi(n: number, src: string, dst: string, aux: string): void {
  if (n === 1) {
    moveDisk(1, src, dst);
    return;
  }
  hanoi(n - 1, src, aux, dst);
  moveDisk(n, src, dst);
  hanoi(n - 1, aux, dst, src);
}`,
    cpp: `void hanoi(int n, char from, char to, char aux) {
    if (n == 0) return;
    hanoi(n - 1, from, aux, to);
    cout << "Move disk " << n << " from " << from << " to " << to << endl;
    hanoi(n - 1, aux, to, from);
}`,
    java: `public void hanoi(int n, char from, char to, char aux) {
    if (n == 1) {
        System.out.println("Move disk 1 from " + from + " to " + to);
        return;
    }
    hanoi(n - 1, from, aux, to);
    System.out.println("Move disk " + n + " from " + from + " to " + to);
    hanoi(n - 1, aux, to, from);
}`,
    pseudocode: `procedure Hanoi(n, A, C, B):
    if n == 1:
        move disk 1 from A to C
    else:
        Hanoi(n - 1, A, B, C)
        move disk n from A to C
        Hanoi(n - 1, B, C, A)`,
  },

  generateTimeline: (input: HanoiInput): ExecutionFrame<HanoiState>[] => {
    const frames: ExecutionFrame<HanoiState>[] = [];
    const n = Math.min(Math.max(input.numDisks, 1), 5);
    const totalMovesNeeded = Math.pow(2, n) - 1;

    const rods: Record<'A' | 'B' | 'C', HanoiDisk[]> = {
      A: [],
      B: [],
      C: [],
    };

    // Populate rod A with n disks (largest at bottom)
    for (let size = n; size >= 1; size--) {
      rods.A.push({
        size,
        color: DISK_COLORS[(size - 1) % DISK_COLORS.length],
      });
    }

    const cloneRods = () => ({
      A: rods.A.map((d) => ({ ...d })),
      B: rods.B.map((d) => ({ ...d })),
      C: rods.C.map((d) => ({ ...d })),
    });

    let moveCount = 0;

    const callStack: { name: string; params: Record<string, string | number>; line?: number; isCurrent?: boolean }[] = [];

    // Initial frame
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: `Initialized Tower of Hanoi with ${n} disks on Rod A. Minimal moves needed = 2^${n} - 1 = ${totalMovesNeeded}. Destination: Rod C.`,
      isMilestone: true,
      milestoneTitle: `${n} Disks Initialized`,
      soundCue: 'start',
      variables: { n, source: 'A', destination: 'C', aux: 'B', totalMovesNeeded, moveCount: 0 },
      callStack: [{ name: 'main', params: { n }, line: 1, isCurrent: true }],
      conditionEval: { expr: `n <= 5`, result: true },
      state: {
        rods: cloneRods(),
        moveCount: 0,
        totalMovesNeeded,
      },
    });

    const getStackSnapshot = (currentLine: number) =>
      callStack.map((frame, i) => ({
        ...frame,
        line: i === callStack.length - 1 ? currentLine : frame.line,
        isCurrent: i === callStack.length - 1,
      }));

    const solveHanoi = (
      count: number,
      src: 'A' | 'B' | 'C',
      dst: 'A' | 'B' | 'C',
      aux: 'A' | 'B' | 'C'
    ) => {
      callStack.push({
        name: 'hanoi',
        params: { count, src, dst, aux },
        line: 1,
      });

      // Frame: Call entry and base-case check
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 1,
        explanation: `Enter hanoi(count=${count}, src=${src}, dst=${dst}, aux=${aux}). Evaluating recursion condition: count === 1.`,
        soundCue: 'step',
        variables: { count, src, dst, aux, moveCount },
        callStack: getStackSnapshot(1),
        conditionEval: { expr: `${count} === 1`, result: count === 1 },
        state: {
          rods: cloneRods(),
          moveCount,
          totalMovesNeeded,
        },
      });

      if (count === 1) {
        moveCount++;
        const disk = rods[src].pop()!;
        rods[dst].push(disk);

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 2,
          explanation: `Base case met (count=1). Move #${moveCount}: Transfer disk ${disk.size} from Rod ${src} to Rod ${dst}.`,
          isMilestone: true,
          milestoneTitle: `Move Disk ${disk.size} (${src} → ${dst})`,
          soundCue: 'swap',
          variables: { move: moveCount, diskSize: disk.size, from: src, to: dst },
          callStack: getStackSnapshot(2),
          conditionEval: { expr: `moveCount === totalMovesNeeded`, result: moveCount === totalMovesNeeded },
          state: {
            rods: cloneRods(),
            movingDisk: { size: disk.size, from: src, to: dst },
            moveCount,
            totalMovesNeeded,
          },
        });

        callStack.pop();
        return;
      }

      // Step 1: Move top count-1 disks from src to aux
      solveHanoi(count - 1, src, aux, dst);

      // Step 2: Move disk count from src to dst
      moveCount++;
      const disk = rods[src].pop()!;
      rods[dst].push(disk);

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 5,
        explanation: `Move #${moveCount}: Transferred disk ${disk.size} directly from Rod ${src} to Rod ${dst}.`,
        isMilestone: true,
        milestoneTitle: `Move Disk ${disk.size} (${src} → ${dst})`,
        soundCue: 'swap',
        variables: { move: moveCount, diskSize: disk.size, from: src, to: dst, remainingSubtree: count - 1 },
        callStack: getStackSnapshot(5),
        conditionEval: { expr: `count > 1`, result: true },
        state: {
          rods: cloneRods(),
          movingDisk: { size: disk.size, from: src, to: dst },
          moveCount,
          totalMovesNeeded,
        },
      });

      // Step 3: Move count-1 disks from aux to dst
      solveHanoi(count - 1, aux, dst, src);

      callStack.pop();
    };

    solveHanoi(n, 'A', 'C', 'B');

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 7,
      explanation: `🎉 Tower of Hanoi solved! All ${n} disks migrated to Rod C in exactly ${moveCount} optimal moves. Invariant strictly preserved throughout.`,
      isMilestone: true,
      milestoneTitle: 'Puzzle Solved',
      soundCue: 'complete',
      variables: { finalMoves: moveCount, destinationRodSize: rods.C.length },
      callStack: [{ name: 'main', params: { n }, line: 7, isCurrent: true }],
      conditionEval: { expr: `rods.C.length === ${n}`, result: true },
      state: {
        rods: cloneRods(),
        moveCount,
        totalMovesNeeded,
      },
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },

  renderStage: (frame: ExecutionFrame<HanoiState>) => {
    const { rods, moveCount, totalMovesNeeded, movingDisk } = frame.state;
    const rodNames: ('A' | 'B' | 'C')[] = ['A', 'B', 'C'];

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-6 select-none">
        {/* Top HUD */}
        <div className="flex items-center gap-6 mb-8">
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 shadow-md">
            Moves:{' '}
            <span className="text-cyan-400 font-bold">
              {moveCount} / {totalMovesNeeded}
            </span>
          </div>
          {movingDisk && (
            <div className="px-4 py-2 rounded-xl bg-indigo-950/80 border border-indigo-700/60 text-xs font-mono text-indigo-300 font-bold shadow-md animate-pulse">
              Transfer: Disk {movingDisk.size} ({movingDisk.from} → {movingDisk.to})
            </div>
          )}
        </div>

        {/* 3 Pegs Stage */}
        <div className="flex items-end justify-center gap-12 max-w-4xl w-full h-[260px] pb-6 border-b-4 border-slate-700/80">
          {rodNames.map((rodKey) => {
            const diskStack = rods[rodKey];

            return (
              <div key={rodKey} className="relative flex flex-col items-center justify-end w-48 h-full">
                {/* Vertical Rod Spindle */}
                <div className="absolute bottom-0 w-3 h-52 bg-slate-700 rounded-t-md shadow-inner" />

                {/* Disk Stack (rendered bottom to top) */}
                <div className="relative z-10 flex flex-col-reverse items-center gap-1 w-full">
                  {diskStack.map((disk) => {
                    const widthPx = 40 + disk.size * 26;

                    return (
                      <div
                        key={disk.size}
                        style={{ width: `${widthPx}px`, backgroundColor: disk.color }}
                        className="h-7 rounded-lg shadow-lg flex items-center justify-center font-mono font-bold text-xs text-slate-950 border border-white/20 transition-all duration-300"
                      >
                        {disk.size}
                      </div>
                    );
                  })}
                </div>

                {/* Peg Label */}
                <div className="absolute -bottom-9 flex flex-col items-center">
                  <span className="w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center font-mono font-bold text-sm text-cyan-400 shadow-md">
                    {rodKey}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
};
