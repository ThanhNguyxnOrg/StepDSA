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

def __stepdsa_tracer(frame, event, arg):
    if len(__stepdsa_frames) >= __stepdsa_max_steps:
        return None
    if frame.f_code.co_filename != '<user_code>':
        return __stepdsa_tracer
    
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
finally:
    sys.settrace(None)

__output_json = json.dumps({
    'frames': __stepdsa_frames,
    'result': str(__result) if __result is not None else None
})
`;
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
    pyodide = await loadPyodideInstance(options?.onStatus);
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
    const frames: ExecutionFrame[] = rawFrames.map((f, idx) => ({
      stepIndex: idx,
      totalSteps: total,
      codeLine: f.codeLine,
      explanation: f.explanation,
      callStack: f.callStack,
      variables: f.variables,
      state: {
        ...(f.array ? { array: f.array } : {}),
        callStackDepth: f.depth,
      },
    }));

    if (parsed.result !== null) {
      const last = rawFrames[rawFrames.length - 1];
      frames.push({
        stepIndex: frames.length,
        totalSteps: total,
        codeLine: last ? last.codeLine : 1,
        explanation: `Execution Finished -> Return value: ${parsed.result}`,
        callStack: [],
        variables: { ...last?.variables, result: parsed.result },
        state: {
          ...(last?.array ? { array: last.array } : {}),
          callStackDepth: 0,
        },
      });
    }

    return frames;
  } catch (err: any) {
    throw new Error(`Python Execution Error: ${err.message || String(err)}`);
  }
}
