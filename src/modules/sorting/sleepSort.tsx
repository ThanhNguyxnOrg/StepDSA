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

    // Frame 0: Spawn threads
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialize Sleep Sort: Spawned ${n} concurrent timer threads for values [${arr.join(', ')}]. Ticks needed: max(arr) = ${maxVal}.`,
      variables: { totalThreads: n, maxDuration: maxVal, tick: 0 },
      callStack: [{ name: 'sleepSort()', params: { n, maxVal }, line: 2, isCurrent: true }],
      state: {
        array: elements.map((e) => ({ ...e })),
        pointers: {},
      },
    });

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
        wakingThisTick.forEach((idx) => {
          elements[idx].status = 'sorted';
        });

        const pointerMap: Record<string, number> = {};
        wakingThisTick.forEach((idx, pIdx) => {
          pointerMap[`wake_${pIdx + 1}`] = idx;
        });

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 5,
          explanation: `Tick t = ${tick}: Timer expired for value(s) [${wakingThisTick.map((i) => arr[i]).join(', ')}]! Appended to sorted output. (${sortedOrder.length}/${n} collected).`,
          variables: {
            currentTick: tick,
            wokenCount: wakingThisTick.length,
            sortedSoFar: `[${sortedOrder.join(', ')}]`,
          },
          callStack: [
            { name: `timerWake(tick=${tick})`, params: { tick, count: wakingThisTick.length }, line: 5, isCurrent: true },
            { name: 'sleepSort()', params: { total: n }, line: 3 },
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
          explanation: `Tick t = ${tick}: All sleeping threads awaiting timeouts... (${sortedOrder.length}/${n} awake).`,
          variables: { currentTick: tick, awake: sortedOrder.length, sleeping: n - sortedOrder.length },
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
      explanation: `All threads joined! Sleep Sort completed in ${maxVal} virtual ticks. Sorted array: [${sortedOrder.join(', ')}].`,
      variables: {
        totalTicks: maxVal,
        sortedResult: `[${sortedOrder.join(', ')}]`,
      },
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
