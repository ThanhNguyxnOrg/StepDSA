import { AlgorithmModule, ElementStatus, ExecutionFrame, PredictionCheckpoint, StepPedagogy } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

const MAX_LEN = 8;
const MIN_TICK = 1;
const MAX_TICK = 15;
const DEFAULT_ARRAY = [3, 1, 4, 2, 5];

interface NormalisedInput {
  array: number[];
  notes: string[];
}

/**
 * Sleep sort only works on positive integer tick counts: non-numeric entries
 * are dropped, values are rounded into [MIN_TICK..MAX_TICK], and the input is
 * truncated to MAX_LEN elements. Every adjustment is reported as a note so the
 * INIT frame can state it honestly. An explicitly empty array stays empty —
 * it is a valid two-frame run, not an error.
 */
function normalise(input: number[] | undefined): NormalisedInput {
  const notes: string[] = [];

  if (!Array.isArray(input)) {
    notes.push('input was not an array, so the default array is used');
    return { array: [...DEFAULT_ARRAY], notes };
  }

  const usable = input.filter(
    (value): value is number => typeof value === 'number' && Number.isFinite(value)
  );

  if (input.length > 0 && usable.length === 0) {
    notes.push('no usable numbers in the input, so the default array is used');
    return { array: [...DEFAULT_ARRAY], notes };
  }
  if (usable.length < input.length) {
    notes.push(`${input.length - usable.length} non-numeric value(s) dropped`);
  }

  const kept: number[] = [];
  for (const value of usable) {
    const rounded = Math.round(value);
    const clamped = Math.max(MIN_TICK, Math.min(MAX_TICK, rounded));
    if (clamped !== rounded) {
      notes.push(`value ${rounded} clamped to ${clamped} (tick range ${MIN_TICK}..${MAX_TICK})`);
    }
    kept.push(clamped);
  }

  if (input.length > 0 && kept.length === 0) {
    notes.push('no usable tick counts remain, so the default array is used');
    return { array: [...DEFAULT_ARRAY], notes };
  }

  let array = kept;
  if (array.length > MAX_LEN) {
    notes.push(`${array.length} values truncated to ${MAX_LEN} for a readable strip`);
    array = array.slice(0, MAX_LEN);
  }

  return { array, notes };
}

export const sleepSortModule: AlgorithmModule<number[], ArrayStageState> = {
  id: 'sleep-sort',
  title: 'Sleep Sort (Thread-Based Timer Scheduling O(max(A) + N))',
  category: 'sorting',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(max(A)) concurrent timer completion',
    timeAverage: 'O(max(A) + N)',
    timeWorst: 'O(max(A) + N)',
    spaceAuxiliary: 'O(N) thread/timer contexts',
    worstCaseCondition: 'Wall-clock delay proportional to maximum value in input',
  },
  theory: {
    overview:
      'Sleep Sort is an esoteric concurrency-based sorting algorithm. For every element x in the input array, it spawns an asynchronous thread that sleeps for x milliseconds/ticks. As threads wake up in chronological order, they append their value to the output array.',
    whyItWorks:
      'Because the delay is strictly monotonic with respect to x (smaller numbers sleep for less time than larger numbers), the threads wake up in ascending numeric order.',
    invariant:
      'Chronological Wakeup Invariant: Thread t_i wakes strictly before thread t_j if and only if value(t_i) <= value(t_j).',
    pitfalls: [
      'Does not handle negative numbers without offsetting.',
      'Susceptible to race conditions, OS thread scheduling jitter, and high CPU thread overhead.',
      'Runtime depends on the LARGEST value, not on N — great for tiny keys, terrible for large ones.',
    ],
    steps: [
      'Guard: an empty or one-element array is already sorted.',
      'Dispatch one thread per value with a sleep duration equal to that value.',
      'Advance the virtual clock tick by tick; when a thread expires, append its value in wake order.',
      'Join all threads and return the collected output.',
    ],
    watchOut: [
      'The visualizer uses VIRTUAL ticks so the timeline is deterministic and instant; real threads race.',
      'Equal values wake at the same tick and are appended in input order — stability is free.',
    ],
  },
  presets: [
    {
      id: 'simple-sleep',
      label: 'Small Integers: [3, 1, 4, 2, 5]',
      description: 'Clean discrete ticks from t=1 to t=5',
      data: [3, 1, 4, 2, 5],
    },
    {
      id: 'repeated-sleep',
      label: 'Duplicates: [4, 2, 2, 5, 1]',
      description: 'Simultaneous wake-ups at t=2',
      data: [4, 2, 2, 5, 1],
    },
    {
      id: 'already-sorted',
      label: 'Sequential: [1, 2, 3, 4, 5]',
      description: 'Successive monotonic tick wakeups',
      data: [1, 2, 3, 4, 5],
    },
    {
      id: 'single-element',
      label: 'One Element',
      description: 'Sorted without any dispatch loop',
      data: [42],
    },
  ],
  defaultInput: [3, 1, 4, 2, 5],
  codeSnippets: {
    pseudocode: `function sleepSort(arr):
    result = []
    for each x in arr:
        spawn_thread:
            sleep(x)
            append x to result
    wait_for_all_threads()
    return result`,
    python: `def sleep_sort(arr):
    result = []
    for x in arr:
        thread = spawn_thread(worker, x)
        # worker sleeps x ticks and appends x to result
        thread.start()
    join_all_threads()
    return result`,
    typescript: `async function sleepSort(arr: number[]): Promise<number[]> {
  const result: number[] = [];
  for (const x of arr) {
    new Promise<void>(resolve => setTimeout(() => {
      // sleep x ticks then append
      result.push(x); resolve(); }, x)); }
  await Promise.all(result); // wait_for_all_threads
  return result; }`,
    cpp: `vector<int> sleepSort(const vector<int>& arr) {
    vector<thread> threads;
    for (int x : arr) {
        threads.emplace_back([x]() {
            this_thread::sleep_for(chrono::milliseconds(x * 10));
            cout << x << " "; }); }
    for (auto& t : threads) t.join();
    return arr; }`,
    java: `static int[] sleepSort(int[] arr) {
    Thread[] threads = new Thread[arr.length];
    for (int i = 0; i < arr.length; i++) {
        final int x = arr[i]; threads[i] = new Thread(() -> {
            try { Thread.sleep(x * 10L); } catch (InterruptedException ignored) {}
            System.out.print(x + " "); }); threads[i].start(); }
    for (Thread t : threads) t.join();
    return arr; }`,
  },

  generateTimeline: (input: number[]): ExecutionFrame<ArrayStageState>[] => {
    const { array, notes } = normalise(input);
    const arr = [...array];
    const n = arr.length;
    const maxVal = n > 0 ? Math.max(...arr) : 0;

    const elements = arr.map((val, idx) => ({
      id: idx,
      value: val,
      status: 'default' as ElementStatus,
    }));

    const frames: ExecutionFrame<ArrayStageState>[] = [];
    let wakeCheckpointAdded = false;
    let tieCheckpointAdded = false;
    let firstWakeMilestoneUsed = false;
    let halfMilestoneUsed = false;

    let actionType: 'INIT' | 'DISPATCH' | 'TICK_WAKE' | 'WAKE_APPEND' | 'TICK_IDLE' | 'DONE' = 'INIT';

    const pushFrame = (opts: {
      codeLine: number;
      explanation: string;
      pedagogy?: StepPedagogy;
      variables?: Record<string, any>;
      conditionEval?: ExecutionFrame<ArrayStageState>['conditionEval'];
      milestone?: string;
      soundCue?: ExecutionFrame<ArrayStageState>['soundCue'];
      checkpoint?: PredictionCheckpoint;
      statuses?: Record<number, ElementStatus>;
      pointers?: Record<string, number>;
      callStack?: any[];
      /** Explicit array override — the DONE frame shows the sorted output, not the input. */
      array?: { id: number; value: number; status: ElementStatus }[];
    }) => {
      const statusFor = (idx: number): ElementStatus => opts.statuses?.[idx] ?? elements[idx].status;
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
            actionType === 'DONE'
              ? 'all threads joined — wake order produced a sorted output'
              : 'a thread wakes exactly when its value equals the current tick',
          isValid: true,
        },
        pedagogy: opts.pedagogy,
        isMilestone: !!opts.milestone,
        milestoneTitle: opts.milestone,
        soundCue: opts.soundCue ?? 'step',
        ...(opts.checkpoint ? { checkpoint: opts.checkpoint } : {}),
        callStack: opts.callStack ?? [
          { name: 'sleepSort()', params: { n, maxVal }, line: opts.codeLine, isCurrent: true },
        ],
        state: {
          array: opts.array ?? elements.map((e, idx) => ({ id: e.id, value: e.value, status: statusFor(idx) })),
          pointers: opts.pointers ?? {},
        },
      });
    };

    // ── Frame 0: initialisation ─────────────────────────────────────────────
    if (n > 0) {
      actionType = 'INIT';
      pushFrame({
        codeLine: 2,
        explanation:
          `Sleep Sort on [${arr.join(', ')}]: ${n} timer threads to schedule, each sleeping its own value in virtual ticks.` +
          (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
        variables: { totalElements: n, maxValue: maxVal, activeThreads: 0 },
        soundCue: 'start',
        pedagogy: {
          what: `Sleep sort creates one thread per value; each thread sleeps for a time proportional to its value, then appends it to the output.`,
          why: 'Sorting emerges from concurrency, not comparisons: smaller values wake earlier and are appended earlier.',
          whatNext: `Dispatch one thread per element (${n} threads).`,
        },
        pointers: {},
      });
    } else {
      actionType = 'INIT';
      pushFrame({
        codeLine: 2,
        explanation:
          'n = length(arr) = 0: an empty array is sorted, so zero threads are needed.' +
          (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
        variables: { totalElements: 0, maxValue: null, activeThreads: 0 },
        soundCue: 'start',
        pedagogy: {
          what: 'An empty array is sorted by definition.',
          why: 'No value exists to sleep on, so no thread can be dispatched and nothing needs joining.',
          whatNext: 'Return the empty result immediately.',
        },
      });
      actionType = 'DONE';
      pushFrame({
        codeLine: 8,
        explanation: 'Sleep Sort complete on an empty array: 0 dispatches, 0 ticks, 0 appends.',
        variables: { totalTicks: 0, sortedResult: '[]', result: 0 },
        milestone: 'Nothing to Sort',
        soundCue: 'complete',
        pedagogy: {
          what: 'The dispatch loop never runs because there is no value to spawn on.',
          why: 'Joining zero threads is trivially complete.',
          whatNext: 'Load a preset such as Small Integers to watch the timer ticks.',
        },
      });
      const totalEarly = frames.length;
      return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: totalEarly }));
    }

    // Thread dispatch phase
    for (let i = 0; i < n; i++) {
      elements[i].status = 'selected';
      actionType = 'DISPATCH';

      const wakeCheckpoint: PredictionCheckpoint | undefined = !wakeCheckpointAdded
        ? {
            id: 'sleepsort-wake-order',
            question: `All ${n} threads are dispatched with sleep delays equal to their values. In what order will they wake?`,
            options: [
              'Input order — threads that started first wake first',
              'Ascending value order — smaller values sleep less',
            ],
            correctIndex: 1,
            explanation:
              'Each thread sleeps val ticks, so the smallest value fires first and is appended first — the output comes out sorted.',
            hint: 'Which value owns the SHORTEST delay?',
          }
        : undefined;

      pushFrame({
        codeLine: 4,
        explanation: `Dispatch Thread #${i + 1}: sleep timer for value ${arr[i]} = ${arr[i]} virtual ticks.`,
        variables: { threadIndex: i, elementValue: arr[i], sleepDelay: `${arr[i]} ticks` },
        conditionEval: { expr: 'spawnWorker(val)', condition: `${arr[i]} ticks`, result: true },
        soundCue: 'select',
        checkpoint: wakeCheckpoint,
        pedagogy: {
          what: `Thread for value ${arr[i]} starts its sleep timer of ${arr[i]} ticks.`,
          why: 'The value itself is the delay — that is the entire "comparison": time replaces order comparison.',
          whatNext: 'Dispatch the remaining threads, then advance the virtual clock.',
        },
        pointers: { spawning: i },
        callStack: [
          { name: `spawnWorker(${arr[i]})`, params: { threadId: i, delay: arr[i] }, line: 4, isCurrent: true },
          { name: 'sleepSort()', params: { n }, line: 2 },
        ],
      });
      if (wakeCheckpoint) wakeCheckpointAdded = true;
      elements[i].status = 'default';
    }

    const wokeIndices = new Set<number>();
    const sortedOrder: number[] = [];

    // Simulate timer ticks
    for (let tick = 1; tick <= maxVal; tick++) {
      const wakingThisTick: number[] = [];
      arr.forEach((val, idx) => {
        if (val === tick) {
          wakingThisTick.push(idx);
          wokeIndices.add(idx);
          sortedOrder.push(val);
        }
      });

      if (wakingThisTick.length > 0) {
        // Frame: Timer expired event
        const pointerMap: Record<string, number> = {};
        wakingThisTick.forEach((idx, pIdx) => {
          pointerMap[`wake_${pIdx + 1}`] = idx;
          elements[idx].status = 'comparing';
        });

        actionType = 'TICK_WAKE';
        const tieCheckpoint: PredictionCheckpoint | undefined =
          !tieCheckpointAdded && wakingThisTick.length > 1
            ? {
                id: 'sleepsort-tie-wake',
                question: `Tick t = ${tick}: ${wakingThisTick.length} threads expire simultaneously (values [${wakingThisTick.map((i) => arr[i]).join(', ')}]). What does the output do?`,
                options: [
                  'Appends them in input order — stability is free',
                  'Appends them in random order — a race is unavoidable',
                ],
                correctIndex: 0,
                explanation: `Equal values share one tick, so they append in the order they were dispatched. Real threads race, but the virtual clock makes it deterministic.`,
                hint: 'Which guarantee does the virtual clock give that real threads cannot?',
              }
            : undefined;

        pushFrame({
          codeLine: 5,
          explanation: `Virtual tick t = ${tick}: Timer interrupt fired! Thread(s) for value(s) [${wakingThisTick.map((i) => arr[i]).join(', ')}] have reached expiry.`,
          variables: {
            currentTick: tick,
            expiredThreadCount: wakingThisTick.length,
            wakingValues: wakingThisTick.map((i) => arr[i]),
          },
          conditionEval: { expr: 'tick === threadDelay', condition: `${tick} ticks`, result: true },
          soundCue: 'compare',
          checkpoint: tieCheckpoint,
          pedagogy: {
            what: `Thread(s) sleeping for ${tick} tick(s) finish now: value(s) ${wakingThisTick.map((i) => arr[i]).join(', ')}.`,
            why: `t = ${tick} is exactly the sleep duration of these values; no other thread has waited that exact time and finished yet.`,
            whatNext: 'Append the woken values to the output stream in wake order.',
          },
          statuses: Object.fromEntries(wakingThisTick.map((idx) => [idx, 'comparing' as ElementStatus])),
          pointers: pointerMap,
          callStack: [
            { name: `onTimerTick(t=${tick})`, params: { tick }, line: 5, isCurrent: true },
            { name: 'sleepSort()', params: { total: n }, line: 2 },
          ],
        });
        if (tieCheckpoint) tieCheckpointAdded = true;

        // Frame: Append and sort status update
        wakingThisTick.forEach((idx) => {
          elements[idx].status = 'sorted';
        });

        const wakeMilestone = !firstWakeMilestoneUsed
          ? 'First Wakeup'
          : sortedOrder.length >= Math.ceil(n / 2) && !halfMilestoneUsed
            ? 'Half Awake'
            : undefined;
        if (wakeMilestone) firstWakeMilestoneUsed = true;
        if (wakeMilestone === 'Half Awake') halfMilestoneUsed = true;

        actionType = 'WAKE_APPEND';
        pushFrame({
          codeLine: 6,
          explanation: `Appended [${wakingThisTick.map((i) => arr[i]).join(', ')}] to output stream. Total collected: ${sortedOrder.length}/${n} elements.`,
          variables: {
            currentTick: tick,
            wokenCount: wakingThisTick.length,
            sortedSoFar: `[${sortedOrder.join(', ')}]`,
          },
          milestone: wakeMilestone,
          soundCue: 'insert',
          conditionEval: { expr: 'output.push(woken)', condition: `${wakingThisTick.length} appended`, result: true },
          pedagogy: {
            what: `Value(s) ${wakingThisTick.map((i) => arr[i]).join(', ')} joined the output; ${sortedOrder.length}/${n} collected.`,
            why: 'Wake order is value order, so each append lands exactly one position after the previous smaller value — no reordering needed.',
            whatNext: `Continue the clock until every thread has fired.`,
          },
          statuses: Object.fromEntries(wakingThisTick.map((idx) => [idx, 'sorted' as ElementStatus])),
          pointers: pointerMap,
          callStack: [
            { name: `collectOutput(val=${wakingThisTick.map((i) => arr[i]).join(', ')})`, params: { tick, count: wakingThisTick.length }, line: 6, isCurrent: true },
            { name: 'sleepSort()', params: { total: n }, line: 2 },
          ],
        });
      } else {
        // Silent tick
        actionType = 'TICK_IDLE';
        pushFrame({
          codeLine: 5,
          explanation: `Virtual tick t = ${tick}: no timers expiring this cycle. All remaining threads still sleeping... (${sortedOrder.length}/${n} awake).`,
          variables: { currentTick: tick, awake: sortedOrder.length, sleeping: n - sortedOrder.length },
          conditionEval: { expr: 'hasExpiredTimers(t)', condition: `${tick} ticks`, result: false },
          soundCue: 'step',
          pedagogy: {
            what: `The clock advanced to t = ${tick} with no thread reaching its sleep duration.`,
            why: 'Values are integers, so ticks without a matching value are simply idle — the algorithm waits for time, not for comparisons.',
            whatNext: `Keep ticking until the next thread's sleep duration is reached.`,
          },
          statuses: {},
          pointers: {},
          callStack: [{ name: `sleep(tick=${tick})`, params: { tick }, line: 5, isCurrent: true }],
        });
      }
    }

    // Final Completion
    actionType = 'DONE';
    pushFrame({
      codeLine: 8,
      explanation: `All ${n} threads joined! Sleep Sort completed in ${maxVal} virtual ticks. Sorted result: [${sortedOrder.join(', ')}].`,
      variables: {
        totalTicks: maxVal,
        sortedResult: `[${sortedOrder.join(', ')}]`,
        allThreadsTerminated: true,
        result: sortedOrder.length,
      },
      milestone: 'Sleep Sort Complete',
      conditionEval: { expr: 'threads.allJoined()', condition: `${n}/${n} joined`, result: true },
      soundCue: 'complete',
      pedagogy: {
        what: `Output: [${sortedOrder.join(', ')}] — sorted purely by timer expiry order.`,
        why: `Runtime is proportional to the largest value (${maxVal} ticks), not to n: great for small numbers, terrible for big ones — and real concurrent threads race, so ties are unsafe.`,
        whatNext: 'Compare with counting sort: both trade value range for speed, but counting sort does it deterministically.',
      },
      callStack: [{ name: 'complete()', params: { ticks: maxVal }, line: 8, isCurrent: true }],
      array: sortedOrder.map((val, idx) => ({ id: idx, value: val, status: 'sorted' as ElementStatus })),
      pointers: {},
    });

    const total = frames.length;
    frames.forEach((f) => {
      f.totalSteps = total;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<ArrayStageState>, projection: '2d' | 'isometric') => {
    return <ArrayStage state={frame.state} projection={projection} />;
  },
};
