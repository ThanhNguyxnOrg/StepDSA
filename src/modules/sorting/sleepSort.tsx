import { AlgorithmModule, ElementStatus, ExecutionFrame } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

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
  ],
  defaultInput: [3, 1, 4, 2, 5],
  codeSnippets: {
    cpp: `void sleepSort(const vector<int>& arr) {
    vector<thread> threads;
    for (int x : arr) {
        threads.emplace_back([x]() {
            this_thread::sleep_for(chrono::milliseconds(x * 10));
            cout << x << " ";
        });
    }
    for (auto& t : threads) t.join();
}`,
    python: `import time, threading

def sleep_sort(arr):
    result = []
    def worker(x):
        time.sleep(x * 0.01)
        result.append(x)

    threads = [threading.Thread(target=worker, args=(x,)) for x in arr]
    for t in threads: t.start()
    for t in threads: t.join()
    return result`,
    typescript: `async function sleepSort(arr: number[]): Promise<number[]> {
    const result: number[] = [];
    const tasks = arr.map(x =>
        new Promise<void>(resolve => {
            setTimeout(() => {
                result.push(x);
                resolve();
            }, x * 10);
        })
    );
    await Promise.all(tasks);
    return result;
}`,
    java: `public static void sleepSort(int[] arr) {
    for (int x : arr) {
        new Thread(() -> {
            try {
                Thread.sleep(x * 10L);
                System.out.print(x + " ");
            } catch (InterruptedException ignored) {}
        }).start();
    }
}`,
    pseudocode: `function sleepSort(arr):
    result = []
    for each x in arr:
        spawn_thread:
            sleep(x)
            append x to result
    wait_for_all_threads()
    return result`,
  },

  generateTimeline: (input: number[]): ExecutionFrame<ArrayStageState>[] => {
    const raw = input?.length ? [...input] : [3, 1, 4, 2, 5];
    const arr = raw.map((v) => Math.max(1, Math.min(v, 15)));
    const n = arr.length;
    const maxVal = Math.max(...arr);

    // Initial stage elements
    const elements = arr.map((val, idx) => ({
      id: idx,
      value: val,
      status: 'default' as ElementStatus,
    }));

    const frames: ExecutionFrame<ArrayStageState>[] = [];

    // Frame 0: Initialization
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      isMilestone: true,
      milestoneTitle: `Init Sleep Sort (${n} threads)`,
      explanation: `Initialize Sleep Sort: Preparing to schedule ${n} concurrent timer threads for values [${arr.join(', ')}].`,
      variables: { totalElements: n, maxValue: maxVal, activeThreads: 0 },
      conditionEval: { expr: 'arr.length > 0', result: true },
      soundCue: { type: 'step' },
      callStack: [{ name: 'sleepSort()', params: { n, maxVal }, line: 2, isCurrent: true }],
      state: {
        array: elements.map((e) => ({ ...e })),
        pointers: {},
      },
    });

    // Thread dispatch phase
    for (let i = 0; i < n; i++) {
      elements[i].status = 'selected';
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 3,
        explanation: `Dispatch Thread #${i + 1}: Registered worker timer for value ${arr[i]} with sleep duration ${arr[i]} virtual ticks.`,
        variables: { threadIndex: i, elementValue: arr[i], sleepDelay: `${arr[i]} ticks` },
        conditionEval: { expr: `spawnWorker(val=${arr[i]})`, result: true },
        soundCue: { type: 'select' },
        callStack: [
          { name: `spawnWorker(${arr[i]})`, params: { threadId: i, delay: arr[i] }, line: 3, isCurrent: true },
          { name: 'sleepSort()', params: { n }, line: 2 },
        ],
        state: {
          array: elements.map((e) => ({ ...e })),
          pointers: { spawning: i },
        },
      });
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

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 4,
          explanation: `Virtual tick t = ${tick}: Timer interrupt fired! Thread(s) for value(s) [${wakingThisTick.map((i) => arr[i]).join(', ')}] have reached expiry.`,
          variables: {
            currentTick: tick,
            expiredThreadCount: wakingThisTick.length,
            wakingValues: wakingThisTick.map((i) => arr[i]),
          },
          conditionEval: { expr: `tick (${tick}) === threadDelay`, result: true },
          soundCue: { type: 'compare' },
          callStack: [
            { name: `onTimerTick(t=${tick})`, params: { tick }, line: 4, isCurrent: true },
            { name: 'sleepSort()', params: { total: n }, line: 2 },
          ],
          state: {
            array: elements.map((e) => ({ ...e })),
            pointers: { ...pointerMap },
          },
        });

        // Frame: Append and sort status update
        wakingThisTick.forEach((idx) => {
          elements[idx].status = 'sorted';
        });

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 5,
          isMilestone: true,
          milestoneTitle: `Woke ${wakingThisTick.map((i) => arr[i]).join(', ')} at t=${tick}`,
          explanation: `Appended [${wakingThisTick.map((i) => arr[i]).join(', ')}] to output stream. Total collected: ${sortedOrder.length}/${n} elements.`,
          variables: {
            currentTick: tick,
            wokenCount: wakingThisTick.length,
            sortedSoFar: `[${sortedOrder.join(', ')}]`,
          },
          conditionEval: { expr: `output.push(${wakingThisTick.map((i) => arr[i]).join(', ')})`, result: true },
          soundCue: { type: 'insert' },
          callStack: [
            { name: `collectOutput(val=${wakingThisTick.map((i) => arr[i]).join(', ')})`, params: { tick, count: wakingThisTick.length }, line: 5, isCurrent: true },
            { name: 'sleepSort()', params: { total: n }, line: 2 },
          ],
          state: {
            array: elements.map((e) => ({ ...e })),
            pointers: pointerMap,
          },
        });
      } else {
        // Silent tick
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 4,
          explanation: `Virtual tick t = ${tick}: No timers expiring this cycle. All remaining threads still sleeping... (${sortedOrder.length}/${n} awake).`,
          variables: { currentTick: tick, awake: sortedOrder.length, sleeping: n - sortedOrder.length },
          conditionEval: { expr: `hasExpiredTimers(t=${tick})`, result: false },
          soundCue: { type: 'step' },
          callStack: [{ name: `sleep(tick=${tick})`, params: { tick }, line: 4, isCurrent: true }],
          state: {
            array: elements.map((e) => ({ ...e })),
            pointers: {},
          },
        });
      }
    }

    // Final Completion
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 7,
      isMilestone: true,
      milestoneTitle: `Sorted: [${sortedOrder.join(', ')}]`,
      explanation: `All ${n} threads joined! Sleep Sort completed successfully in ${maxVal} virtual ticks. Sorted result: [${sortedOrder.join(', ')}].`,
      variables: {
        totalTicks: maxVal,
        sortedResult: `[${sortedOrder.join(', ')}]`,
        allThreadsTerminated: true,
      },
      conditionEval: { expr: 'threads.allJoined()', result: true },
      soundCue: { type: 'complete' },
      callStack: [{ name: 'complete()', params: { ticks: maxVal }, line: 7, isCurrent: true }],
      state: {
        array: elements.map((e) => ({ ...e, status: 'sorted' })),
        pointers: {},
      },
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
