import { ExecutionFrame } from '../types';

export interface JSTracerOptions {
  maxSteps?: number;
  entryFunction?: string;
}

export function parseTestcaseInput(rawInput: any): any[] {
  if (rawInput === undefined || rawInput === null || rawInput === '') return [];
  if (typeof rawInput !== 'string') return [rawInput];

  const trimmed = rawInput.trim();
  if (!trimmed) return [];

  // Remove parameter variable names: e.g. "nums = [1, 2], k = 3" -> "[1, 2], 3"
  const cleaned = trimmed.replace(/\b[a-zA-Z_$][a-zA-Z0-9_$]*\s*=\s*/g, '');

  try {
    const fn = new Function(`return [${cleaned}];`);
    return fn();
  } catch {
    return [trimmed];
  }
}

/**
 * Traces JavaScript LeetCode functions and scripts.
 * Captures Call Stack frames, local variable mutations, array updates, and return values.
 */
export function traceJavaScriptExecution(
  code: string,
  rawTestcaseInput: any = '',
  options: JSTracerOptions = {}
): ExecutionFrame[] {
  const maxSteps = options.maxSteps ?? 500;
  const frames: ExecutionFrame[] = [];
  let stepIndex = 0;
  let lastReadIdx: number | null = null;

  const callStack: { name: string; params: Record<string, any> }[] = [];

  function recordFrame(
    explanation: string,
    action: string,
    soundCue: 'step' | 'swap' | 'compare' | 'finish' = 'step',
    vars: Record<string, any> = {},
    isMilestone = false,
    activeElements: { id: string; value: number; status: 'normal' | 'comparing' | 'swapping' | 'sorted' }[] = []
  ) {
    if (stepIndex >= maxSteps) return;

    // Snapshot current call stack representations
    const stackStrings = callStack.map(
      (frame) => `${frame.name}(${Object.entries(frame.params).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(', ')})`
    );

    // Merge variables from stack frames + local vars
    const combinedVars: Record<string, any> = {};
    callStack.forEach((frame) => {
      Object.assign(combinedVars, frame.params);
    });
    Object.assign(combinedVars, vars);

    frames.push({
      stepIndex: stepIndex++,
      totalSteps: 0,
      codeLine: 1,
      explanation,
      action,
      callStack: stackStrings.length > 0 ? stackStrings : ['main()'],
      variables: combinedVars,
      isMilestone,
      soundCue,
      state: {
        callStackDepth: callStack.length,
        variables: combinedVars,
        array: activeElements.length > 0 ? activeElements : undefined,
      },
    });
  }

  // Tracer runtime injected into sandboxed execution
  const __tracer = {
    enter(name: string, params: Record<string, any>) {
      if (stepIndex >= maxSteps) return;
      callStack.push({ name, params });
      const paramStr = Object.entries(params)
        .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
        .join(', ');
      recordFrame(
        `Calling ${name}(${paramStr}) [Call Stack Depth: ${callStack.length}]`,
        'call',
        'step',
        params,
        false
      );
    },

    leave(name: string, returnVal?: any) {
      if (stepIndex >= maxSteps) return returnVal;
      const popped = callStack.pop();
      const valStr = returnVal !== undefined ? ` ➔ ${JSON.stringify(returnVal)}` : '';
      recordFrame(
        `Returning from ${name}${valStr} [Depth: ${callStack.length}]`,
        'return',
        'step',
        popped?.params || {},
        true
      );
      return returnVal;
    },

    step(desc: string, vars: Record<string, any> = {}) {
      if (stepIndex >= maxSteps) return;
      recordFrame(desc, 'step', 'step', vars);
    },

    compare(desc: string, vars: Record<string, any> = {}) {
      if (stepIndex >= maxSteps) return;
      recordFrame(desc, 'compare', 'compare', vars);
    },

    swap(desc: string, vars: Record<string, any> = {}) {
      if (stepIndex >= maxSteps) return;
      recordFrame(desc, 'swap', 'swap', vars);
    },

    trackArray(arr: any[], name = 'arr') {
      return new Proxy(arr, {
        get(target, prop, receiver) {
          if (prop === 'push') {
            return function (...items: any[]) {
              const res = Array.prototype.push.apply(target, items);
              recordFrame(
                `Pushed ${items.map(v => JSON.stringify(v)).join(', ')} to ${name}`,
                'push',
                'step',
                { [`${name}.length`]: target.length, [`${name}`]: [...target] },
                true
              );
              return res;
            };
          }
          if (prop === 'pop') {
            return function () {
              const res = Array.prototype.pop.apply(target);
              recordFrame(`Popped from ${name}`, 'pop', 'step', { [`${name}.length`]: target.length });
              return res;
            };
          }
          if (typeof prop === 'string' && !isNaN(Number(prop))) {
            const idx = Number(prop);
            if (idx >= 0 && idx < target.length) {
              if (lastReadIdx !== null && lastReadIdx !== idx) {
                const elements = target.map((v, i) => ({
                  id: `${i}`,
                  value: Number(v),
                  status: (i === lastReadIdx || i === idx ? 'comparing' : 'normal') as const,
                }));
                recordFrame(
                  `Comparing ${name}[${lastReadIdx}] (${target[lastReadIdx]}) with ${name}[${idx}] (${target[idx]})`,
                  'compare',
                  'compare',
                  { i: lastReadIdx, j: idx, [`${name}[${lastReadIdx}]`]: target[lastReadIdx], [`${name}[${idx}]`]: target[idx] },
                  false,
                  elements
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
            const elements = target.map((v, i) => ({
              id: `${i}`,
              value: Number(v),
              status: (i === idx ? 'swapping' : 'normal') as const,
            }));
            recordFrame(
              `Updated ${name}[${idx}] = ${JSON.stringify(value)}`,
              'swap',
              'swap',
              { i: idx, [`${name}[${idx}]`]: value },
              false,
              elements
            );
            lastReadIdx = null;
          }
          return res;
        },
      });
    },

    trackObject(obj: Record<string, any>, name = 'map') {
      return new Proxy(obj, {
        set(target, prop, value, receiver) {
          const res = Reflect.set(target, prop, value, receiver);
          if (typeof prop === 'string') {
            recordFrame(
              `Recorded map key ${JSON.stringify(prop)} = ${JSON.stringify(value)}`,
              'step',
              'step',
              { [name]: { ...target }, [prop]: value, complement: prop },
              false
            );
          }
          return res;
        },
      });
    },
  };

  // Detect top-level function names
  const functionMatch =
    code.match(/(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:function|\([^)]*\)\s*=>|[a-zA-Z0-9_$]+\s*=>)/) ||
    code.match(/function\s+([a-zA-Z0-9_$]+)\s*\(/);

  const entryFnName = functionMatch ? functionMatch[1] : null;

  // Instrument internal functions (e.g. const dfs = (O, C, s) => {)
  let instrumentedCode = code;

  // 1. Wrap array literal declarations (like const res = []; or const arr = [5, 2, 8];)
  instrumentedCode = instrumentedCode.replace(
    /(const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(\[[^\]]*\]);/g,
    '$1 $2 = __tracer.trackArray($3, "$2");'
  );

  // 2. Wrap object literal declarations (like const map = {};)
  instrumentedCode = instrumentedCode.replace(
    /(const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*\{\s*\};/g,
    '$1 $2 = __tracer.trackObject({}, "$2");'
  );

  // 3. Instrument nested/recursive functions
  // Matches: const dfs = (a, b) => { OR function dfs(a, b) {
  instrumentedCode = instrumentedCode.replace(
    /((?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:\([^)]*\)|[a-zA-Z0-9_$]+)\s*=>\s*\{|function\s+([a-zA-Z0-9_$]+)\s*\([^)]*\)\s*\{)/g,
    (match, p1, arrowFnName, standardFnName) => {
      const fnName = arrowFnName || standardFnName;
      // Extract parameter names from match
      const paramsMatch = match.match(/\(([^)]*)\)/);
      const params = paramsMatch
        ? paramsMatch[1].split(',').map((p) => p.trim()).filter((p) => p.length > 0)
        : [];

      const paramObjEntries = params.map((p) => `${p}: ${p}`).join(', ');
      return `${match}\n  __tracer.enter("${fnName}", { ${paramObjEntries} });\n`;
    }
  );

  // 4. Instrument return statements inside functions to call __tracer.leave
  instrumentedCode = instrumentedCode.replace(
    /return\s+([^;]+);/g,
    'return __tracer.leave("fn", $1);'
  );
  instrumentedCode = instrumentedCode.replace(
    /return;/g,
    '__tracer.leave("fn"); return;'
  );

  // Initial Frame
  recordFrame('Initializing execution sandbox...', 'init', 'step');

  const parsedArgs = parseTestcaseInput(rawTestcaseInput);

  // Auto-wrap array arguments passed to entry function with Proxy
  const processedArgs = parsedArgs.map((arg, idx) => {
    if (Array.isArray(arg)) {
      return `__tracer.trackArray(${JSON.stringify(arg)}, "nums")`;
    }
    return JSON.stringify(arg);
  });

  // Build the complete runner script
  let invocationCode = '';
  if (entryFnName) {
    const argsString = processedArgs.join(', ');
    invocationCode = `\nconst __result = ${entryFnName}(${argsString});\n__tracer.step("Execution finished with result: " + JSON.stringify(__result), { result: __result });`;
  }

  const fullExecutable = `
    ${instrumentedCode}
    ${invocationCode}
  `;

  try {
    const runner = new Function('__tracer', fullExecutable);
    runner(__tracer);
  } catch (err: any) {
    recordFrame(`Execution error: ${err.message || String(err)}`, 'error', 'step', { error: err.message });
  }

  // If only 1 frame was emitted, add completion
  if (frames.length === 1) {
    recordFrame('Execution completed with 0 state changes.', 'finish', 'finish');
  } else {
    // Stamp totalSteps
    const total = frames.length;
    frames.forEach((f, idx) => {
      f.stepIndex = idx;
      f.totalSteps = total;
    });
  }

  return frames;
}
