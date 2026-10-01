import { ExecutionFrame } from '../types';

export interface TraceOptions {
  maxSteps?: number;
  pointers?: string[];
}

export interface ArrayElementState {
  id: string;
  value: number;
  status: 'normal' | 'comparing' | 'swapping' | 'sorted' | 'active';
  index: number;
}

/**
 * Traces in-browser JavaScript/TypeScript array algorithms using native ES6 Proxies.
 * Zero external compiler dependencies; runs at native V8 speed with an execution ceiling
 * to protect the UI thread from infinite loops.
 */
export function traceArrayExecution(
  code: string,
  rawInput: number[],
  options: TraceOptions = {}
): ExecutionFrame[] {
  let effectiveInput = rawInput;
  if (!effectiveInput || effectiveInput.length === 0) {
    const match = code.match(/=\s*\[([\d\s,.-]+)\]/);
    if (match && match[1]) {
      const parsed = match[1].split(',').map(v => Number(v.trim())).filter(v => !isNaN(v));
      if (parsed.length > 0) effectiveInput = parsed;
    }
  }

  const maxSteps = options.maxSteps ?? 500;
  const frames: ExecutionFrame[] = [];
  const currentArray = [...(effectiveInput && effectiveInput.length > 0 ? effectiveInput : [10, 20, 30, 40])];
  let stepIndex = 0;
  let lastReadIdx: number | null = null;

  function recordSnapshot(
    explanation: string,
    action: string,
    soundCue: 'step' | 'swap' | 'compare' | 'finish',
    comparingIndices: number[] = [],
    modifyingIndex: number | null = null,
    isMilestone = false
  ) {
    if (stepIndex >= maxSteps) {
      throw new Error('STEPDSA_MAX_STEPS_REACHED');
    }

    const stateArray: ArrayElementState[] = currentArray.map((val, idx) => {
      let status: ArrayElementState['status'] = 'normal';
      if (modifyingIndex === idx) {
        status = 'swapping';
      } else if (comparingIndices.includes(idx)) {
        status = 'comparing';
      }
      return {
        id: `${idx}`,
        value: val,
        status,
        index: idx,
      };
    });

    frames.push({
      stepIndex: stepIndex++,
      totalSteps: 0,
      codeLine: 1,
      explanation,
      action,
      callStack: ['customAlgorithm(input)'],
      variables: {
        'array.length': currentArray.length,
        'comparing': comparingIndices.length > 0 ? comparingIndices.join(', ') : 'none',
        'active': modifyingIndex !== null ? modifyingIndex : 'none',
      },
      conditionEval: {
        condition: action,
        result: true,
      },
      soundCue,
      isMilestone,
      state: {
        array: stateArray,
        pointers: {},
      },
    });
  }

  // Initial Frame
  recordSnapshot(
    `Initial state loaded: [${currentArray.join(', ')}] (Size: ${currentArray.length})`,
    'init',
    'step'
  );

  const proxiedArray = new Proxy(currentArray, {
    get(target, prop, receiver) {
      if (typeof prop === 'string' && !isNaN(Number(prop))) {
        const idx = Number(prop);
        if (idx >= 0 && idx < target.length) {
          if (lastReadIdx !== null && lastReadIdx !== idx) {
            recordSnapshot(
              `Comparing index ${lastReadIdx} (${target[lastReadIdx]}) with index ${idx} (${target[idx]})`,
              'compare',
              'compare',
              [lastReadIdx, idx]
            );
            lastReadIdx = null;
          } else {
            lastReadIdx = idx;
          }
        }
      }
      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value, receiver) {
      const res = Reflect.set(target, prop, value, receiver);
      if (typeof prop === 'string' && !isNaN(Number(prop))) {
        const idx = Number(prop);
        recordSnapshot(
          `Updated index ${idx} to value ${value}`,
          'swap',
          'swap',
          [],
          idx
        );
        lastReadIdx = null;
      }
      return res;
    },
  });

  let hasErrorOrLimit = false;
  try {
    const sanitizedCode = code.replace(
      /(?:const|let|var)\s+(arr|nums|input)\s*=\s*\[[\d\s,.-]*\];?/g,
      'var $1 = input;'
    );
    const runner = new Function('input', `var arr = input; var nums = input;\n${sanitizedCode}`);
    runner(proxiedArray);
  } catch (err: any) {
    hasErrorOrLimit = true;
    if (err.message === 'STEPDSA_MAX_STEPS_REACHED') {
      frames.push({
        stepIndex: stepIndex++,
        totalSteps: 0,
        codeLine: 1,
        explanation: `Safety limit reached (${maxSteps} steps). Execution paused to protect browser.`,
        action: 'limit',
        soundCue: 'step',
        isMilestone: true,
        state: {
          array: currentArray.map((val, idx) => ({
            id: `${idx}`,
            value: val,
            status: 'normal',
            index: idx,
          })),
          pointers: {},
        },
      });
    } else {
      frames.push({
        stepIndex: stepIndex++,
        totalSteps: 0,
        codeLine: 1,
        explanation: `Runtime exception: ${err.message}`,
        action: 'error',
        soundCue: 'step',
        isMilestone: true,
        state: {
          array: currentArray.map((val, idx) => ({
            id: `${idx}`,
            value: val,
            status: 'normal',
            index: idx,
          })),
          pointers: {},
        },
      });
    }
  }

  // Completion Final Frame (only if executed normally without limit/error)
  if (!hasErrorOrLimit) {
    frames.push({
      stepIndex: stepIndex++,
      totalSteps: 0,
      codeLine: 1,
      explanation: `Execution complete. Final array: [${currentArray.join(', ')}]`,
      action: 'finish',
      soundCue: 'finish',
      isMilestone: true,
      state: {
        array: currentArray.map((val, idx) => ({
          id: `${idx}`,
          value: val,
          status: 'sorted',
          index: idx,
        })),
        pointers: {},
      },
    });
  }

  const total = frames.length;
  frames.forEach((f, idx) => {
    f.stepIndex = idx;
    f.totalSteps = total;
  });

  return frames;
}
