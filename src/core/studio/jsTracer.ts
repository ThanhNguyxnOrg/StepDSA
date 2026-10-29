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

const POINTER_KEYS = new Set(['i', 'j', 'k', 'left', 'right', 'mid', 'low', 'high', 'l', 'r', 'pivot', 'idx']);

function findLineNumber(lines: string[], pattern: RegExp, fallback = 1): number {
  for (let idx = 0; idx < lines.length; idx++) {
    if (pattern.test(lines[idx])) {
      return idx + 1;
    }
  }
  return fallback;
}

/**
 * Traces JavaScript LeetCode functions and scripts.
 * Captures Call Stack frames, local variable mutations, array updates, pointers, and return values.
 */
export function traceJavaScriptExecution(
  code: string,
  rawTestcaseInput: any = '',
  options: JSTracerOptions = {}
): ExecutionFrame[] {
  const maxSteps = options.maxSteps ?? 500;
  const frames: ExecutionFrame[] = [];
  const sourceLines = code.split('\n');
  let stepIndex = 0;
  let lastReadIdx: number | null = null;
  let activeLine = 1;
  let primaryNumericArray: number[] | null = null;
  const latestVars: Record<string, any> = {};

  const callStack: { name: string; params: Record<string, any>; line?: number }[] = [];

  function extractPointers(vars: Record<string, any>): Record<string, number> {
    const pointers: Record<string, number> = {};
    for (const [k, v] of Object.entries(vars)) {
      if (POINTER_KEYS.has(k) && typeof v === 'number' && Number.isInteger(v) && v >= 0) {
        pointers[k] = v;
      }
    }
    return pointers;
  }

  function recordFrame(
    explanation: string,
    action: string,
    soundCue: 'step' | 'swap' | 'compare' | 'finish' = 'step',
    vars: Record<string, any> = {},
    isMilestone = false,
    activeElements?: { id: string; value: number; status: 'normal' | 'comparing' | 'swapping' | 'sorted'; index?: number }[],
    explicitLine?: number
  ) {
    if (stepIndex >= maxSteps) return;
    if (explicitLine && explicitLine > 0) {
      activeLine = explicitLine;
    }

    const stackStrings = callStack.map(
      (frame) =>
        `${frame.name}(${Object.entries(frame.params)
          .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
          .join(', ')})`
    );

    const combinedVars: Record<string, any> = { ...latestVars };
    callStack.forEach((frame) => {
      Object.assign(combinedVars, frame.params);
    });
    Object.assign(combinedVars, vars);
    Object.assign(latestVars, vars);

    const pointers = extractPointers(combinedVars);
    let resolvedArray = activeElements;
    if (!resolvedArray && primaryNumericArray && primaryNumericArray.length > 0) {
      const pointedSet = new Set(Object.values(pointers));
      resolvedArray = primaryNumericArray.map((val, idx) => ({
        id: `${idx}`,
        value: Number(val),
        status: pointedSet.has(idx) ? 'comparing' : 'normal',
        index: idx,
      }));
    }

    frames.push({
      stepIndex: stepIndex++,
      totalSteps: 0,
      codeLine: activeLine,
      explanation,
      action,
      callStack: stackStrings.length > 0 ? stackStrings : ['main()'],
      variables: combinedVars,
      isMilestone,
      soundCue,
      state: {
        callStackDepth: callStack.length,
        variables: combinedVars,
        array: resolvedArray && resolvedArray.length > 0 ? resolvedArray : undefined,
        pointers: Object.keys(pointers).length > 0 ? pointers : undefined,
      },
    });
  }

  const compareLine = findLineNumber(sourceLines, /[<>]=?|===/, 4);
  const swapLine = findLineNumber(sourceLines, /\[\s*[a-zA-Z0-9_+-]+\s*\]\s*=/, compareLine + 1);
  const pushLine = findLineNumber(sourceLines, /\.push\s*\(/, 5);
  const returnLine = findLineNumber(sourceLines, /\breturn\b/, sourceLines.length);

  // Tracer runtime injected into sandboxed execution
  const __tracer = {
    enter(name: string, params: Record<string, any>, lineNo?: number) {
      if (stepIndex >= maxSteps) return;
      callStack.push({ name, params, line: lineNo });
      const paramStr = Object.entries(params)
        .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
        .join(', ');
      recordFrame(
        `Calling ${name}(${paramStr}) [Call Stack Depth: ${callStack.length}]`,
        'call',
        'step',
        params,
        false,
        undefined,
        lineNo ?? findLineNumber(sourceLines, new RegExp(`\\b${name}\\b`), 2)
      );
    },

    leave(name: string, returnVal?: any) {
      if (stepIndex >= maxSteps) return returnVal;
      const popped = callStack.pop();
      const valStr = returnVal !== undefined ? ` → ${JSON.stringify(returnVal)}` : '';
      recordFrame(
        `Returning from ${popped?.name || name}${valStr} [Depth: ${callStack.length}]`,
        'return',
        'step',
        { ...(popped?.params || {}), ...(returnVal !== undefined ? { returnVal } : {}) },
        true,
        undefined,
        returnLine
      );
      return returnVal;
    },

    step(desc: string, vars: Record<string, any> = {}, lineNo?: number) {
      if (stepIndex >= maxSteps) return;
      recordFrame(desc, 'step', 'step', vars, false, undefined, lineNo);
    },

    compare(desc: string, vars: Record<string, any> = {}) {
      if (stepIndex >= maxSteps) return;
      recordFrame(desc, 'compare', 'compare', vars, false, undefined, compareLine);
    },

    swap(desc: string, vars: Record<string, any> = {}) {
      if (stepIndex >= maxSteps) return;
      recordFrame(desc, 'swap', 'swap', vars, false, undefined, swapLine);
    },

    trackArray(arr: any[], name = 'arr') {
      if (arr.length > 0 && arr.every((x) => typeof x === 'number')) {
        primaryNumericArray = arr as number[];
      }

      return new Proxy(arr, {
        get(target, prop, receiver) {
          if (prop === 'push') {
            return function (...items: any[]) {
              const res = Array.prototype.push.apply(target, items);
              if (target.length > 0 && target.every((x) => typeof x === 'number')) {
                primaryNumericArray = target as number[];
              }
              recordFrame(
                `Pushed ${items.map((v) => JSON.stringify(v)).join(', ')} to ${name}`,
                'push',
                'step',
                { [`${name}.length`]: target.length, [name]: [...target] },
                true,
                undefined,
                pushLine
              );
              return res;
            };
          }
          if (prop === 'pop') {
            return function () {
              const res = Array.prototype.pop.apply(target);
              recordFrame(
                `Popped ${JSON.stringify(res)} from ${name}`,
                'pop',
                'step',
                { [`${name}.length`]: target.length, [name]: [...target] },
                false
              );
              return res;
            };
          }
          if (typeof prop === 'string' && !isNaN(Number(prop))) {
            const idx = Number(prop);
            if (idx >= 0 && idx < target.length) {
              if (target.every((x) => typeof x === 'number')) {
                primaryNumericArray = target as number[];
              }
              if (lastReadIdx !== null && lastReadIdx !== idx) {
                const elements = target.every((x) => typeof x === 'number')
                  ? target.map((v, i) => ({
                      id: `${i}`,
                      value: Number(v),
                      status: (i === lastReadIdx || i === idx ? 'comparing' : 'normal') as 'comparing' | 'normal',
                      index: i,
                    }))
                  : undefined;
                recordFrame(
                  `Comparing ${name}[${lastReadIdx}] (${target[lastReadIdx]}) with ${name}[${idx}] (${target[idx]})`,
                  'compare',
                  'compare',
                  {
                    i: lastReadIdx,
                    j: idx,
                    [`${name}[${lastReadIdx}]`]: target[lastReadIdx],
                    [`${name}[${idx}]`]: target[idx],
                  },
                  false,
                  elements,
                  compareLine
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
            if (target.every((x) => typeof x === 'number')) {
              primaryNumericArray = target as number[];
            }
            const elements = target.every((x) => typeof x === 'number')
              ? target.map((v, i) => ({
                  id: `${i}`,
                  value: Number(v),
                  status: (i === idx ? 'swapping' : 'normal') as 'swapping' | 'normal',
                  index: i,
                }))
              : undefined;
            recordFrame(
              `Updated ${name}[${idx}] = ${JSON.stringify(value)}`,
              'swap',
              'swap',
              { i: idx, [`${name}[${idx}]`]: value, [name]: [...target] },
              true,
              elements,
              swapLine
            );
            lastReadIdx = null;
          }
          return res;
        },
      });
    },

    trackObject(obj: Record<string, any>, name = 'map') {
      const mapLine = findLineNumber(sourceLines, new RegExp(`\\b${name}\\s*\\[`), 5);
      return new Proxy(obj, {
        set(target, prop, value, receiver) {
          const res = Reflect.set(target, prop, value, receiver);
          if (typeof prop === 'string') {
            recordFrame(
              `Recorded ${name}[${JSON.stringify(prop)}] = ${JSON.stringify(value)}`,
              'step',
              'step',
              { [name]: { ...target }, [prop]: value, complement: prop },
              false,
              undefined,
              mapLine
            );
          }
          return res;
        },
      });
    },
  };

function stripTypeScriptAnnotations(code: string): string {
  return code
    // Strip interface/type declarations on single lines while keeping newlines
    .replace(/^\s*(?:export\s+)?type\s+[A-Za-z0-9_]+\s*=[^;\n]+;?/gm, '// type stripped')
    // Strip function return type annotations e.g. ): number { or ): string[] =>
    .replace(/\)\s*:\s*[A-Za-z0-9_<>\[\]\s|&]+(\s*(?:=>|\{))/g, ')$1')
    // Strip variable type annotations e.g. const res: string[] =
    .replace(/\b(const|let|var)\s+([a-zA-Z0-9_$]+)\s*:\s*[A-Za-z0-9_<>\[\]\s|&]+(\s*=)/g, '$1 $2$3')
    // Strip parameter type annotations e.g. (nums: number[], target: number)
    .replace(/([a-zA-Z0-9_$]+)\s*\??:\s*(?:number|string|boolean|any|unknown|void|Record<[^>]+>|Array<[^>]+>|[A-Za-z0-9_]+)(?:\[\])*/g, '$1');
}

  const sanitizedCode = stripTypeScriptAnnotations(code);

  // Detect top-level function names
  const functionMatch =
    sanitizedCode.match(/(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:function|\([^)]*\)\s*=>|[a-zA-Z0-9_$]+\s*=>)/) ||
    sanitizedCode.match(/function\s+([a-zA-Z0-9_$]+)\s*\(/);

  const entryFnName = functionMatch ? functionMatch[1] : null;

  let instrumentedCode = sanitizedCode;

  // 1. Wrap array literal declarations (like const res = []; or const arr = [5, 2, 8];)
  instrumentedCode = instrumentedCode.replace(
    /(const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(\[[^\]]*\]);?/g,
    '$1 $2 = __tracer.trackArray($3, "$2");'
  );

  // 2. Wrap object literal declarations (like const map = {};)
  instrumentedCode = instrumentedCode.replace(
    /(const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*\{\s*\};?/g,
    '$1 $2 = __tracer.trackObject({}, "$2");'
  );

  // 3. Instrument midpoint & two-pointer calculations (e.g. const mid = ..., left = ..., right = ...)
  const midLine = findLineNumber(sourceLines, /\bmid\s*=/, 4);
  instrumentedCode = instrumentedCode.replace(
    /((?:const|let|var)\s+mid\s*=\s*[^;\n]+;)/g,
    `$1 __tracer.step("Inspecting midpoint mid=" + mid, { left: typeof left !== "undefined" ? left : undefined, right: typeof right !== "undefined" ? right : undefined, mid }, ${midLine});`
  );
  instrumentedCode = instrumentedCode.replace(
    /\b(left|right|low|high)\s*=\s*([^;\n=]+);/g,
    (match, ptrName, expr) => {
      if (match.includes('let ') || match.includes('const ') || match.includes('var ')) return match;
      const ptrLine = findLineNumber(sourceLines, new RegExp(`\\b${ptrName}\\s*=`), midLine + 1);
      return `${ptrName} = ${expr}; __tracer.step("Updated pointer ${ptrName} = " + ${ptrName}, { left: typeof left !== "undefined" ? left : undefined, right: typeof right !== "undefined" ? right : undefined, mid: typeof mid !== "undefined" ? mid : undefined, ${ptrName} }, ${ptrLine});`;
    }
  );

  // 4. Instrument nested/recursive functions
  instrumentedCode = instrumentedCode.replace(
    /((?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:\([^)]*\)|[a-zA-Z0-9_$]+)\s*=>\s*\{|function\s+([a-zA-Z0-9_$]+)\s*\([^)]*\)\s*\{)/g,
    (match, _p1, arrowFnName, standardFnName) => {
      const fnName = arrowFnName || standardFnName;
      const fnLine = findLineNumber(sourceLines, new RegExp(`\\b${fnName}\\b`), 2);
      const paramsMatch = match.match(/\(([^)]*)\)/);
      const params = paramsMatch
        ? paramsMatch[1].split(',').map((p) => p.trim()).filter((p) => p.length > 0)
        : [];

      const paramObjEntries = params.map((p) => `${p}: ${p}`).join(', ');
      return `${match}\n  __tracer.enter("${fnName}", { ${paramObjEntries} }, ${fnLine});\n`;
    }
  );

  // 5. Instrument return statements inside functions to call __tracer.leave
  instrumentedCode = instrumentedCode.replace(
    /return\s+([^;\n]+);?/g,
    'return __tracer.leave("fn", $1);'
  );
  instrumentedCode = instrumentedCode.replace(
    /return;/g,
    '__tracer.leave("fn"); return;'
  );

  // 6. Ensure nested arrow functions without a trailing return still pop their frame on block exit
  instrumentedCode = instrumentedCode.replace(
    /(\n\s*(?!return\b|__tracer\.leave)[^\n]+\n)(\s*\};)/g,
    '$1  __tracer.leave("fn");\n$2'
  );

  // Initial Frame
  recordFrame('Initializing execution sandbox...', 'init', 'step', {}, false, undefined, 1);

  const parsedArgs = parseTestcaseInput(rawTestcaseInput);

  // Auto-wrap array arguments passed to entry function with Proxy
  const processedArgs = parsedArgs.map((arg) => {
    if (Array.isArray(arg)) {
      return `__tracer.trackArray(${JSON.stringify(arg)}, "nums")`;
    }
    return JSON.stringify(arg);
  });

  // Build the complete runner script
  let invocationCode = '';
  if (entryFnName) {
    const argsString = processedArgs.join(', ');
    invocationCode = `\nconst __result = ${entryFnName}(${argsString});\n__tracer.step("Execution finished with result: " + JSON.stringify(__result), { result: __result }, ${sourceLines.length});`;
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

  // Compute cumulative operational metrics across all frames
  if (frames.length === 1) {
    recordFrame('Execution completed with 0 state changes.', 'finish', 'finish');
  }

  const total = frames.length;
  frames.forEach((f, idx) => {
    f.stepIndex = idx;
    f.totalSteps = total;
  });

  return frames;
}
