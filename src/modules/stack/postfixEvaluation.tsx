import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface PostfixEvalState {
  tokens: string[];
  currentIndex: number;
  operandStack: number[];
  currentComputation: string | null;
  intermediateResult: number | null;
}

export const postfixEvaluationModule: AlgorithmModule<
  { expression: string },
  PostfixEvalState
> = {
  id: 'postfix-evaluation',
  title: 'Postfix Expression Evaluation (Operand Stack O(N))',
  category: 'stack-queue',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(N)',
    worstCaseCondition: 'Requires pushing and popping each token at most once',
  },
  theory: {
    overview:
      'Evaluate an arithmetic expression expressed in Postfix Notation (Reverse Polish Notation / RPN) using a single operand stack without operator precedence ambiguities or recursive parentheses trees.',
    whyItWorks:
      'Because operands strictly precede their corresponding operator in postfix notation, pushing numbers onto a LIFO stack guarantees that when an operator is encountered, its two immediate operands sit consecutively at the top of the stack.',
    invariant:
      'Operand Stack Invariant: At step i, the stack contains the evaluated results of all complete sub-expressions scanned up to index i.',
    pitfalls: [
      'Order of operands during subtraction and division: the first popped is the right operand (b), and the second popped is the left operand (a), computing a - b or a / b.',
      'Division by zero.',
    ],
  },
  presets: [
    {
      id: 'classic-rpn',
      label: 'RPN: "2 1 + 3 *"',
      description: 'Equivalent to (2 + 1) * 3 = 9',
      data: { expression: '2 1 + 3 *' },
    },
    {
      id: 'nested-eval',
      label: 'RPN: "4 13 5 / +"',
      description: 'Equivalent to 4 + (13 / 5) = 6',
      data: { expression: '4 13 5 / +' },
    },
    {
      id: 'complex-mix',
      label: 'RPN: "10 6 9 3 + -11 * / * 17 + 5 +"',
      description: 'LeetCode 150 benchmark test case',
      data: { expression: '10 6 9 3 + -11 * / * 17 + 5 +' },
    },
  ],
  defaultInput: { expression: '2 1 + 3 *' },
  codeSnippets: {
    python: `def evalRPN(tokens):
    stack = []
    for token in tokens:
        if token in "+-*/":
            b = stack.pop()
            a = stack.pop()
            if token == '+': stack.append(a + b)
            elif token == '-': stack.append(a - b)
            elif token == '*': stack.append(a * b)
            elif token == '/': stack.append(int(a / b))
        else:
            stack.append(int(token))
    return stack[0]`,
    typescript: `function evalRPN(tokens: string[]): number {
  const stack: number[] = [];
  for (const token of tokens) {
    if (['+', '-', '*', '/'].includes(token)) {
      const b = stack.pop()!;
      const a = stack.pop()!;
      if (token === '+') stack.push(a + b);
      else if (token === '-') stack.push(a - b);
      else if (token === '*') stack.push(a * b);
      else if (token === '/') stack.push(Math.trunc(a / b));
    } else {
      stack.push(Number(token));
    }
  }
  return stack[0];
}`,
    cpp: `int evalRPN(vector<string>& tokens) {
    stack<long long> st;
    for (const string& s : tokens) {
        if (s == "+" || s == "-" || s == "*" || s == "/") {
            long long b = st.top(); st.pop();
            long long a = st.top(); st.pop();
            if (s == "+") st.push(a + b);
            else if (s == "-") st.push(a - b);
            else if (s == "*") st.push(a * b);
            else if (s == "/") st.push(a / b);
        } else {
            st.push(stoll(s));
        }
    }
    return st.top();
}`,
    java: `public int evalRPN(String[] tokens) {
    Deque<Integer> stack = new ArrayDeque<>();
    for (String token : tokens) {
        if ("+-*/".contains(token) && token.length() == 1) {
            int b = stack.pop();
            int a = stack.pop();
            switch (token) {
                case "+": stack.push(a + b); break;
                case "-": stack.push(a - b); break;
                case "*": stack.push(a * b); break;
                case "/": stack.push(a / b); break;
            }
        } else {
            stack.push(Integer.parseInt(token));
        }
    }
    return stack.pop();
}`,
    pseudocode: `function evalRPN(tokens):
    stack = empty stack
    for token in tokens:
        if token is operator (+, -, *, /):
            b = stack.pop()
            a = stack.pop()
            result = compute(a, token, b)
            stack.push(result)
        else:
            stack.push(integer(token))
    return stack.top()`,
  },

  generateTimeline: (input: { expression: string }): ExecutionFrame<PostfixEvalState>[] => {
    const raw = input.expression.trim() || '2 1 + 3 *';
    const tokens = raw.split(/\s+/);

    const frames: ExecutionFrame<PostfixEvalState>[] = [];
    const stack: number[] = [];

    // Frame 0: Initialization
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialize operand stack for RPN expression [${tokens.join(' ')}]. Stack is empty.`,
      variables: { totalTokens: tokens.length, stackSize: 0 },
      callStack: [
        { name: 'evalRPN(tokens)', params: { count: tokens.length }, line: 2, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      state: {
        tokens,
        currentIndex: -1,
        operandStack: [],
        currentComputation: null,
        intermediateResult: null,
      },
    });

    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      const isOp = ['+', '-', '*', '/'].includes(tok);

      if (!isOp) {
        const val = Number(tok);
        // Inspect token
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 12,
          explanation: `Scan token[${i}] = "${tok}". Test if operator: token is an integer operand (${val}).`,
          variables: { tokenIndex: i, token: tok, isOperator: false, parsedVal: val },
          conditionEval: { expr: "['+', '-', '*', '/'].includes(token)", result: false },
          soundCue: { type: 'step' },
          callStack: [
            { name: `scanToken("${tok}")`, params: { index: i, tok }, line: 12, isCurrent: true },
            { name: 'evalRPN()', params: { count: tokens.length }, line: 3 },
          ],
          state: {
            tokens,
            currentIndex: i,
            operandStack: [...stack],
            currentComputation: `Read operand ${val}`,
            intermediateResult: val,
          },
        });

        stack.push(val);

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 13,
          explanation: `Push operand ${val} onto LIFO stack. Stack now contains [${stack.join(', ')}].`,
          variables: { operand: val, stackTop: val, stackDepth: stack.length },
          conditionEval: { expr: "stack.push(val)", result: true },
          soundCue: { type: 'insert' },
          callStack: [
            { name: `pushOperand(${val})`, params: { val, depth: stack.length }, line: 13, isCurrent: true },
            { name: 'evalRPN()', params: { count: tokens.length }, line: 3 },
          ],
          state: {
            tokens,
            currentIndex: i,
            operandStack: [...stack],
            currentComputation: `Push ${val} -> [${stack.join(', ')}]`,
            intermediateResult: val,
          },
        });
      } else {
        // Inspect operator
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 4,
          explanation: `Scan token[${i}] = "${tok}". Operator detected! Prepare to pop two operands from stack.`,
          variables: { tokenIndex: i, operator: tok, currentStackSize: stack.length },
          conditionEval: { expr: "['+', '-', '*', '/'].includes(token)", result: true },
          soundCue: { type: 'step' },
          callStack: [
            { name: `scanOperator("${tok}")`, params: { op: tok }, line: 4, isCurrent: true },
            { name: 'evalRPN()', params: { count: tokens.length }, line: 3 },
          ],
          state: {
            tokens,
            currentIndex: i,
            operandStack: [...stack],
            currentComputation: `Encountered operator ${tok}`,
            intermediateResult: null,
          },
        });

        const b = stack.pop()!;
        const a = stack.pop()!;

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 5,
          explanation: `Popped right operand b = ${b} (top of stack), then popped left operand a = ${a}.`,
          variables: { op: tok, leftOperand_a: a, rightOperand_b: b, stackRemaining: [...stack] },
          conditionEval: { expr: "stack.length >= 2", result: true },
          soundCue: { type: 'compare' },
          callStack: [
            { name: `popOperands("${tok}")`, params: { a, b }, line: 5, isCurrent: true },
            { name: 'evalRPN()', params: { count: tokens.length }, line: 3 },
          ],
          state: {
            tokens,
            currentIndex: i,
            operandStack: [...stack],
            currentComputation: `a = ${a}, b = ${b}`,
            intermediateResult: null,
          },
        });

        let res = 0;
        if (tok === '+') res = a + b;
        else if (tok === '-') res = a - b;
        else if (tok === '*') res = a * b;
        else if (tok === '/') res = b !== 0 ? Math.trunc(a / b) : 0;

        stack.push(res);

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 6,
          isMilestone: true,
          milestoneTitle: `Evaluated ${a} ${tok} ${b} = ${res}`,
          explanation: `Computed ${a} ${tok} ${b} = ${res}. Pushed result ${res} back onto stack.`,
          variables: { op: tok, left: a, right: b, result: res, newStack: [...stack] },
          conditionEval: { expr: `${a} ${tok} ${b}`, result: res },
          soundCue: { type: 'swap' },
          callStack: [
            { name: `applyOperator("${tok}", ${a}, ${b})`, params: { op: tok, a, b, res }, line: 6, isCurrent: true },
            { name: 'evalRPN()', params: { count: tokens.length }, line: 3 },
          ],
          state: {
            tokens,
            currentIndex: i,
            operandStack: [...stack],
            currentComputation: `${a} ${tok} ${b} = ${res}`,
            intermediateResult: res,
          },
        });
      }
    }

    // Final Frame
    const finalVal = stack[0] ?? 0;
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 14,
      isMilestone: true,
      milestoneTitle: `Final Value: ${finalVal}`,
      explanation: `RPN Evaluation complete. Single surviving value on stack is ${finalVal}.`,
      variables: { finalResult: finalVal, tokensEvaluated: tokens.length, stackSize: stack.length },
      conditionEval: { expr: "tokensExhausted && stack.length === 1", result: true },
      soundCue: { type: 'complete' },
      callStack: [
        { name: 'complete()', params: { result: finalVal }, line: 14, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      state: {
        tokens,
        currentIndex: tokens.length,
        operandStack: [...stack],
        currentComputation: `Final Result: ${finalVal}`,
        intermediateResult: finalVal,
      },
    });

    const total = frames.length;
    frames.forEach((f) => {
      f.totalSteps = total;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<PostfixEvalState>) => {
    const { tokens, currentIndex, operandStack, currentComputation } = frame.state;

    return (
      <div className="w-full flex-1 flex flex-col items-center justify-between p-6 select-none max-w-5xl mx-auto">
        {/* Token Tape */}
        <div className="w-full flex flex-col items-center mb-6">
          <div className="text-xs font-mono font-bold text-slate-400 mb-2 uppercase tracking-wider">
            Postfix Token Tape
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
            {tokens.map((tok, idx) => {
              const isCurrent = idx === currentIndex;
              const isProcessed = idx < currentIndex;
              return (
                <div
                  key={idx}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm transition-all duration-300 ${
                    isCurrent
                      ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-110'
                      : isProcessed
                      ? 'bg-slate-900/60 border border-slate-800 text-slate-600'
                      : 'bg-slate-900 border border-slate-700 text-slate-200'
                  }`}
                >
                  {tok}
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: Operand Tank & Live Computation */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 my-auto">
          {/* LIFO Operand Tank */}
          <div className="flex flex-col items-center p-5 rounded-2xl bg-slate-950/70 border border-slate-800 shadow-xl">
            <div className="text-xs font-mono font-bold text-emerald-400 mb-3 flex items-center gap-2">
              <span>🔋 OPERAND STACK (LIFO)</span>
              <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 text-[10px]">
                {operandStack.length}
              </span>
            </div>

            <div className="w-48 h-48 rounded-2xl border-2 border-dashed border-emerald-800/40 bg-slate-900/40 p-2 flex flex-col-reverse gap-1.5 overflow-y-auto">
              {operandStack.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-[11px] font-mono text-slate-600 italic">
                  Empty Stack
                </div>
              ) : (
                operandStack.map((val, idx) => {
                  const isTop = idx === operandStack.length - 1;
                  return (
                    <div
                      key={idx}
                      className={`h-9 rounded-xl flex items-center justify-between px-4 font-mono font-bold text-sm transition-all ${
                        isTop
                          ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                          : 'bg-slate-800 border border-slate-700 text-slate-300'
                      }`}
                    >
                      <span>{val}</span>
                      <span className="text-[10px] opacity-75 font-normal">
                        {isTop ? 'TOP' : `#${idx}`}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Live Math Expression */}
          <div className="flex flex-col justify-between p-5 rounded-2xl bg-slate-950/70 border border-slate-800 shadow-xl">
            <div>
              <div className="text-xs font-mono font-bold text-cyan-400 mb-2">
                ⚙️ ACTIVE COMPUTATION
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-sm font-mono text-cyan-300 font-bold mb-3 min-h-[50px] flex items-center">
                {currentComputation || 'Waiting for next token...'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-400 leading-relaxed">
              <strong className="text-white block mb-1">Popping Rule:</strong>
              1st pop = <span className="text-amber-400">b (Right operand)</span>, 2nd pop = <span className="text-cyan-400">a (Left operand)</span>. Result = <span className="text-emerald-400">a OP b</span>.
            </div>
          </div>
        </div>
      </div>
    );
  },
};
