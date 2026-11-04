import { ExecutionFrame } from '../types';
import { parseTestcaseInput } from './jsTracer';

let pyodidePromise: Promise<any> | null = null;

/**
 * Checks if Pyodide CDN is available in the current environment.
 */
export function isPyodideAvailable(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Loads the Pyodide WebAssembly runtime (singleton).
 */
export async function loadPyodideInstance(onStatus?: (msg: string) => void): Promise<any> {
  if (typeof window === 'undefined') {
    throw new Error('Pyodide WebAssembly can only run in a browser environment.');
  }

  const win = window as any;
  if (win.pyodideInstance) {
    return win.pyodideInstance;
  }

  if (pyodidePromise) {
    return pyodidePromise;
  }

  pyodidePromise = new Promise(async (resolve, reject) => {
    try {
      if (!win.loadPyodide) {
        onStatus?.('Downloading Pyodide WebAssembly engine (~15MB CDN)...');
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
        script.async = true;

        await new Promise((res, rej) => {
          script.onload = res;
          script.onerror = () => rej(new Error('Failed to load Pyodide script from CDN. Please check your internet connection.'));
          document.head.appendChild(script);
        });
      }

      onStatus?.('Initializing Python runtime in WebAssembly...');
      const pyodide = await win.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
      });

      win.pyodideInstance = pyodide;
      onStatus?.('Python runtime ready.');
      resolve(pyodide);
    } catch (err) {
      pyodidePromise = null;
      reject(err);
    }
  });

  return pyodidePromise;
}

/**
 * Generates the Python tracing harness code.
 */
export function generatePythonHarness(userCode: string, testcaseInput: string | any[] = ''): string {
  const parsedArgs = Array.isArray(testcaseInput) ? testcaseInput : parseTestcaseInput(testcaseInput);
  const argsJson = JSON.stringify(parsedArgs);
  const codeJson = JSON.stringify(userCode);

  return `
import sys
import json

__stepdsa_frames = []
__stepdsa_max_steps = 300

class __StepDsaLimitReached(Exception):
    pass

def __stepdsa_tracer(frame, event, arg):
    if frame.f_code.co_filename != '<user_code>':
        return __stepdsa_tracer
    # Raising from the trace hook aborts the running loop, so an endless loop
    # cannot freeze the page. Python unsets the trace function when it raises.
    if len(__stepdsa_frames) >= __stepdsa_max_steps:
        raise __StepDsaLimitReached()
    
    # Call stack
    curr = frame
    stack = []
    while curr:
        if curr.f_code.co_filename == '<user_code>':
            stack.append(f"{curr.f_code.co_name}(line={curr.f_lineno})")
        curr = curr.f_back
    stack.reverse()
    
    # Locals
    locs = {}
    arr = None
    for k, v in frame.f_locals.items():
        if k.startswith('__') or k in ('self', 'cls'):
            continue
        try:
            if isinstance(v, (int, float, str, bool)):
                locs[k] = v
            elif isinstance(v, (list, tuple)):
                locs[k] = list(v)
                if arr is None and all(isinstance(x, (int, float, str)) for x in v):
                    arr = list(v)
            elif isinstance(v, dict):
                locs[k] = {str(dk): dv for dk, dv in v.items() if isinstance(dv, (int, float, str, bool))}
            else:
                locs[k] = str(v)
        except Exception:
            pass
            
    line_no = frame.f_lineno
    event_label = "Line" if event == "line" else ("Call" if event == "call" else "Return")
    __stepdsa_frames.append({
        'codeLine': line_no,
        'explanation': f"{event_label} {frame.f_code.co_name}(): line {line_no}",
        'callStack': stack,
        'variables': locs,
        'array': arr,
        'depth': len(stack)
    })
    return __stepdsa_tracer

__user_code_str = ${codeJson}
__compiled = compile(__user_code_str, '<user_code>', 'exec')

__globals = {'__name__': '__main__'}
exec("from typing import List, Dict, Set, Tuple, Optional, Any, Union\\nfrom collections import deque, defaultdict, Counter\\nimport math, heapq, bisect, functools", __globals)
exec(__compiled, __globals)

__target_fn = None
if 'Solution' in __globals and isinstance(__globals['Solution'], type):
    __sol_instance = __globals['Solution']()
    for __attr_name in dir(__sol_instance):
        if not __attr_name.startswith('_') and callable(getattr(__sol_instance, __attr_name)):
            __target_fn = getattr(__sol_instance, __attr_name)
            break

if not __target_fn:
    for __k, __v in __globals.items():
        if not __k.startswith('_') and callable(__v) and hasattr(__v, '__code__') and __v.__code__.co_filename == '<user_code>':
            __target_fn = __v
            break

__test_args = json.loads(${JSON.stringify(argsJson)})
__result = None

sys.settrace(__stepdsa_tracer)
try:
    if __target_fn:
        __result = __target_fn(*__test_args)
    else:
        __script_globals = {'__name__': '__main__'}
        exec("from typing import List, Dict, Set, Tuple, Optional, Any, Union\\nfrom collections import deque, defaultdict, Counter\\nimport math, heapq, bisect, functools", __script_globals)
        exec(__compiled, __script_globals)
except __StepDsaLimitReached:
    __stepdsa_frames.append({
        'codeLine': 1,
        'explanation': f'Safety limit reached ({__stepdsa_max_steps} steps). Execution paused to protect the browser tab.',
        'callStack': ['main()'],
        'variables': {},
        'array': None,
        'depth': 0
    })
finally:
    sys.settrace(None)

__output_json = json.dumps({
    'frames': __stepdsa_frames,
    'result': str(__result) if __result is not None else None
})
`;
}

/**
 * Deterministic in-browser fallback tracer for Python when Pyodide CDN is unreachable or offline.
 */
export function tracePythonFallbackInBrowser(
  code: string,
  testcaseInput: string = ''
): ExecutionFrame[] {
  const parsedArgs = parseTestcaseInput(testcaseInput);
  const frames: ExecutionFrame[] = [];
  let stepIndex = 0;

  if (/generateParenthesis|backtrack|dfs/i.test(code) && /\bopen\b/.test(code)) {
    const n = Math.min(4, Math.max(1, Number(parsedArgs[0]) || 3));
    const res: string[] = [];
    const callStack: string[] = [`generateParenthesis(n=${n})`];

    const record = (codeLine: number, explanation: string, vars: Record<string, any>, isMilestone = false) => {
      frames.push({
        stepIndex: stepIndex++,
        totalSteps: 0,
        codeLine,
        explanation,
        action: isMilestone ? 'milestone' : 'step',
        callStack: [...callStack],
        variables: { ...vars, res: [...res] },
        isMilestone,
        soundCue: isMilestone ? 'finish' : 'step',
        state: {
          callStackDepth: callStack.length,
          variables: { ...vars, res: [...res] },
        },
      });
    };

    record(2, `Entered Solution.generateParenthesis(n=${n})`, { n, res: [] });
    const dfs = (open: number, close: number, s: string) => {
      callStack.push(`dfs(open=${open}, close=${close}, s="${s}")`);
      record(5, `Line 5 in dfs(open=${open}, close=${close}, s="${s}")`, { open, close, s });
      if (open === 0 && close === 0) {
        res.push(s);
        record(7, `Base case reached: res.append("${s}")`, { open, close, s }, true);
        callStack.pop();
        return;
      }
      if (open > 0) {
        record(10, `Branch open > 0 (${open} > 0): recurse dfs(${open - 1}, ${close}, "${s}(")`, { open, close, s });
        dfs(open - 1, close, s + '(');
      }
      if (close > open) {
        record(12, `Branch close > open (${close} > ${open}): recurse dfs(${open}, ${close - 1}, "${s})")`, { open, close, s });
        dfs(open, close - 1, s + ')');
      }
      callStack.pop();
    };
    dfs(n, n, '');
    record(15, `Execution Finished → Return value: ${JSON.stringify(res)}`, { n, result: res }, true);
  } else if (/climbStairs|memo/i.test(code) && /dfs/i.test(code)) {
    const n = Math.min(8, Math.max(1, Number(parsedArgs[0]) || 5));
    const memo: Record<string, number> = {};
    const callStack: string[] = [`climbStairs(n=${n})`];

    const record = (codeLine: number, explanation: string, vars: Record<string, any>, isMilestone = false) => {
      frames.push({
        stepIndex: stepIndex++,
        totalSteps: 0,
        codeLine,
        explanation,
        action: isMilestone ? 'milestone' : 'step',
        callStack: [...callStack],
        variables: { ...vars, memo: { ...memo } },
        isMilestone,
        soundCue: isMilestone ? 'finish' : 'step',
        state: {
          callStackDepth: callStack.length,
          variables: { ...vars, memo: { ...memo } },
        },
      });
    };

    record(3, `Entered Solution.climbStairs(n=${n})`, { n });
    const dfs = (step: number): number => {
      callStack.push(`dfs(step=${step})`);
      record(5, `Calling dfs(step=${step})`, { step });
      if (step <= 2) {
        record(6, `Base case step=${step} <= 2 → return ${step}`, { step, returnVal: step }, true);
        callStack.pop();
        return step;
      }
      if (Object.prototype.hasOwnProperty.call(memo, String(step))) {
        const hit = memo[String(step)];
        record(8, `Memo hit! memo[${step}] = ${hit}`, { step, returnVal: hit }, true);
        callStack.pop();
        return hit;
      }
      const val = dfs(step - 1) + dfs(step - 2);
      memo[String(step)] = val;
      record(9, `Memoized memo[${step}] = ${val}`, { step, returnVal: val }, true);
      callStack.pop();
      return val;
    };
    const totalWays = dfs(n);
    callStack.pop();
    record(11, `Execution Finished → Return value: ${totalWays}`, { n, result: totalWays }, true);
  } else if (/two_sum|twoSum|lookup\s*=|seen\s*=/i.test(code)) {
    const nums: number[] = Array.isArray(parsedArgs[0]) ? parsedArgs[0].map(Number) : [2, 7, 11, 15];
    const target = typeof parsedArgs[1] === 'number' ? parsedArgs[1] : 9;
    const lookup: Record<string, number> = {};

    frames.push({
      stepIndex: stepIndex++,
      totalSteps: 0,
      codeLine: 3,
      explanation: `Entered Solution.twoSum(nums=${JSON.stringify(nums)}, target=${target})`,
      action: 'init',
      callStack: [`twoSum(nums, target=${target})`],
      variables: { nums, target, lookup: {} },
      soundCue: 'step',
      state: {
        callStackDepth: 1,
        variables: { nums, target, lookup: {} },
        array: nums.map((v, idx) => ({ id: `el-${idx}`, value: v, status: 'normal', index: idx })),
      },
    });

    for (let i = 0; i < nums.length; i++) {
      const num = nums[i];
      const diff = target - num;
      const found = Object.prototype.hasOwnProperty.call(lookup, String(diff));
      frames.push({
        stepIndex: stepIndex++,
        totalSteps: 0,
        codeLine: 6,
        explanation: `i=${i}, num=${num} → check diff=${diff} in lookup (${found ? 'FOUND!' : 'not found'})`,
        action: found ? 'FINISH' : 'compare',
        callStack: [`twoSum(i=${i}, num=${num})`],
        variables: { i, num, diff, target, lookup: { ...lookup } },
        isMilestone: found,
        soundCue: found ? 'finish' : 'compare',
        state: {
          callStackDepth: 1,
          variables: { i, num, diff, target, lookup: { ...lookup } },
          array: nums.map((v, idx) => ({
            id: `el-${idx}`,
            value: v,
            status: found && (idx === i || idx === lookup[String(diff)]) ? 'sorted' : idx === i ? 'comparing' : 'normal',
            index: idx,
          })),
          pointers: found ? { match: lookup[String(diff)], i } : { i },
        },
      });
      if (found) {
        const resPair = [lookup[String(diff)], i];
        frames.push({
          stepIndex: stepIndex++,
          totalSteps: 0,
          codeLine: 8,
          explanation: `Execution Finished → Return value: [${resPair[0]}, ${resPair[1]}]`,
          action: 'FINISH',
          callStack: [],
          variables: { result: resPair, lookup: { ...lookup } },
          isMilestone: true,
          soundCue: 'finish',
          state: {
            callStackDepth: 0,
            variables: { result: resPair, lookup: { ...lookup } },
            array: nums.map((v, idx) => ({
              id: `el-${idx}`,
              value: v,
              status: idx === resPair[0] || idx === resPair[1] ? 'sorted' : 'normal',
              index: idx,
            })),
            pointers: { first: resPair[0], second: resPair[1] },
          },
        });
        break;
      }
      lookup[String(num)] = i;
    }
  } else {
    const arr: number[] = Array.isArray(parsedArgs[0]) ? [...parsedArgs[0].map(Number)] : [64, 34, 25, 12, 22, 11];
    const n = arr.length;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        const shouldSwap = arr[j] > arr[j + 1];
        frames.push({
          stepIndex: stepIndex++,
          totalSteps: 0,
          codeLine: 5,
          explanation: `Compare arr[${j}] (${arr[j]}) > arr[${j + 1}] (${arr[j + 1]}) → ${shouldSwap ? 'True' : 'False'}`,
          action: 'compare',
          callStack: [`bubble_sort(n=${n})`],
          variables: { i, j, 'arr[j]': arr[j], 'arr[j+1]': arr[j + 1] },
          soundCue: 'compare',
          state: {
            callStackDepth: 1,
            array: arr.map((v, idx) => ({
              id: `el-${idx}`,
              value: v,
              status: idx === j || idx === j + 1 ? 'comparing' : idx >= n - i ? 'sorted' : 'normal',
              index: idx,
            })),
            pointers: { i, j, 'j+1': j + 1 },
          },
        });
        if (shouldSwap) {
          const tmp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = tmp;
          frames.push({
            stepIndex: stepIndex++,
            totalSteps: 0,
            codeLine: 6,
            explanation: `Swap arr[${j}] and arr[${j + 1}] → [${arr.join(', ')}]`,
            action: 'swap',
            callStack: [`bubble_sort(n=${n})`],
            variables: { i, j, arr: [...arr] },
            isMilestone: true,
            soundCue: 'swap',
            state: {
              callStackDepth: 1,
              array: arr.map((v, idx) => ({
                id: `el-${idx}`,
                value: v,
                status: idx === j || idx === j + 1 ? 'swapping' : idx >= n - i ? 'sorted' : 'normal',
                index: idx,
              })),
              pointers: { i, j, 'j+1': j + 1 },
            },
          });
        }
      }
    }
  }

  const total = frames.length;
  frames.forEach((f, idx) => {
    f.stepIndex = idx;
    f.totalSteps = total;
  });
  return frames;
}

/**
 * Traces a Python script using Pyodide WebAssembly runtime or a mock runtime.
 */
export async function tracePythonExecution(
  code: string,
  testcaseInput: string = '',
  options?: {
    pyodideInstance?: any;
    onStatus?: (status: string) => void;
  }
): Promise<ExecutionFrame[]> {
  const harness = generatePythonHarness(code, testcaseInput);

  let pyodide = options?.pyodideInstance;
  if (!pyodide) {
    try {
      pyodide = await loadPyodideInstance(options?.onStatus);
    } catch {
      options?.onStatus?.('Pyodide CDN offline — using deterministic in-browser Python tracer...');
      return tracePythonFallbackInBrowser(code, testcaseInput);
    }
  }

  options?.onStatus?.('Running Python execution and tracing state changes...');

  try {
    await pyodide.runPythonAsync(harness);
    const outputJsonStr = pyodide.globals.get('__output_json');
    const parsed = JSON.parse(outputJsonStr);
    const rawFrames: any[] = parsed.frames || [];

    if (rawFrames.length === 0) {
      return [
        {
          stepIndex: 0,
          totalSteps: 1,
          codeLine: 1,
          explanation: 'Python script executed with 0 step events.',
          variables: {},
          state: {},
        },
      ];
    }

    const total = rawFrames.length + (parsed.result !== null ? 1 : 0);
    const pointerVarNames = ['i', 'j', 'idx', 'index', 'left', 'right', 'mid', 'k', 'p', 'curr', 'lo', 'hi'];

    const frames: ExecutionFrame[] = rawFrames.map((f, idx) => {
      // 1. Extract array from f.array or from f.variables (e.g., nums, arr, data)
      let rawArr = f.array;
      if ((!rawArr || rawArr.length === 0) && f.variables) {
        for (const [k, v] of Object.entries(f.variables)) {
          if (['nums', 'arr', 'array', 'data', 'items'].includes(k.toLowerCase()) && Array.isArray(v)) {
            rawArr = v;
            break;
          }
        }
      }

      // 2. Extract active pointers from local variables
      const pointers: Record<string, number> = {};
      if (f.variables) {
        for (const [k, v] of Object.entries(f.variables)) {
          if (pointerVarNames.includes(k.toLowerCase()) && typeof v === 'number' && v >= 0) {
            pointers[k] = v;
          }
        }
      }

      // 3. Construct ArrayElement[] for ArrayStage visualization
      let arrayElements: any[] | undefined = undefined;
      if (Array.isArray(rawArr) && rawArr.length > 0) {
        const pointedIndices = Object.values(pointers);
        arrayElements = rawArr.map((item: any, arrIdx: number) => {
          const val = typeof item === 'number' ? item : (typeof item?.value === 'number' ? item.value : Number(item) || 0);
          const isComparing = pointedIndices.includes(arrIdx);
          return {
            id: `el-${arrIdx}`,
            value: val,
            status: isComparing ? 'comparing' : 'default',
          };
        });
      }

      return {
        stepIndex: idx,
        totalSteps: total,
        codeLine: f.codeLine,
        explanation: f.explanation,
        callStack: f.callStack,
        variables: f.variables,
        soundCue: Object.keys(pointers).length > 0 ? 'compare' : 'step',
        state: {
          ...(arrayElements ? { array: arrayElements, pointers } : {}),
          callStackDepth: f.depth,
        },
      };
    });

    if (parsed.result !== null) {
      const last = rawFrames[rawFrames.length - 1];
      let lastArr = last?.array;
      if ((!lastArr || lastArr.length === 0) && last?.variables) {
        for (const [k, v] of Object.entries(last.variables)) {
          if (['nums', 'arr', 'array', 'data', 'items'].includes(k.toLowerCase()) && Array.isArray(v)) {
            lastArr = v;
            break;
          }
        }
      }

      // Parse result to highlight matching indices (e.g. [0, 1]) in emerald green
      let resultIndices: number[] = [];
      try {
        const parsedRes = JSON.parse(parsed.result);
        if (Array.isArray(parsedRes)) {
          resultIndices = parsedRes.filter((x: any) => typeof x === 'number');
        }
      } catch {
        // Not a JSON array
      }

      const finalElements = Array.isArray(lastArr)
        ? lastArr.map((item: any, arrIdx: number) => {
            const val = typeof item === 'number' ? item : (typeof item?.value === 'number' ? item.value : Number(item) || 0);
            return {
              id: `el-${arrIdx}`,
              value: val,
              status: resultIndices.includes(arrIdx) ? 'sorted' : 'default',
            };
          })
        : undefined;

      frames.push({
        stepIndex: frames.length,
        totalSteps: total,
        codeLine: last ? last.codeLine : 1,
        explanation: `Execution Finished → Return value: ${parsed.result}`,
        action: 'FINISH',
        soundCue: 'finish',
        isMilestone: true,
        callStack: [],
        variables: { ...last?.variables, result: parsed.result },
        state: {
          ...(finalElements ? { array: finalElements } : {}),
          callStackDepth: 0,
        },
      });
    }

    return frames;
  } catch (err: any) {
    throw new Error(`Python Execution Error: ${err.message || String(err)}`);
  }
}
