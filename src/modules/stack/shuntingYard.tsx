import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface ShuntingYardState {
  tokens: string[];
  currentIndex: number;
  operatorStack: string[];
  outputQueue: string[];
  actionDescription: string;
}

const PRECEDENCE: Record<string, number> = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
  '^': 3,
};

const IS_RIGHT_ASSOCIATIVE: Record<string, boolean> = {
  '^': true,
};

export const shuntingYardModule: AlgorithmModule<
  { expression: string },
  ShuntingYardState
> = {
  id: 'shunting-yard',
  title: "Infix to Postfix (Dijkstra's Shunting-Yard O(N))",
  category: 'stack-queue',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(N)',
    worstCaseCondition: 'Each token is pushed and popped from operator stack at most once',
  },
  theory: {
    overview:
      "Dijkstra's Shunting-Yard algorithm parses infix expressions (containing parentheses, operators, and operands) and converts them into postfix notation (Reverse Polish Notation, RPN), which can be evaluated without ambiguity or parenthesis trees.",
    whyItWorks:
      'The algorithm routes operands immediately to the output queue while holding operators on a LIFO stack until higher or equal precedence operators have completed their left-to-right evaluation order.',
    invariant:
      'Stack Precedence Invariant: Operators remaining in the stack strictly adhere to monotonic precedence hierarchy unless bracketed by left parentheses.',
    pitfalls: [
      'Right-associative operators (like exponentiation `^`) do not pop equal-precedence operators.',
      'Mismatched parentheses (missing closing `)` or extra `)`).',
    ],
  },
  presets: [
    {
      id: 'arithmetic-parentheses',
      label: 'Standard Infix: ( A + B ) * C',
      description: 'Parentheses override normal multiplication precedence',
      data: { expression: '( A + B ) * C' },
    },
    {
      id: 'precedence-mix',
      label: 'Precedence Mix: 3 + 4 * 2 / ( 1 - 5 )',
      description: 'Tests +, *, /, and nested subtraction in parentheses',
      data: { expression: '3 + 4 * 2 / ( 1 - 5 )' },
    },
    {
      id: 'powers-associativity',
      label: 'Right Associative: 2 ^ 3 ^ 2',
      description: 'Right-associative exponentiation evaluated right-to-left',
      data: { expression: '2 ^ 3 ^ 2' },
    },
  ],
  defaultInput: { expression: '( A + B ) * C' },
  codeSnippets: {
    python: `def shunting_yard(expression):
    precedence = {'+': 1, '-': 1, '*': 2, '/': 2, '^': 3}
    stack, output = [], []
    for token in expression.split():
        if token.isalnum():
            output.append(token)
        elif token == '(':
            stack.append(token)
        elif token == ')':
            while stack and stack[-1] != '(':
                output.append(stack.pop())
            stack.pop() # Discard '('
        else:
            while (stack and stack[-1] != '(' and
                   (precedence[stack[-1]] > precedence[token] or
                    (precedence[stack[-1]] == precedence[token] and token != '^'))):
                output.append(stack.pop())
            stack.append(token)
    while stack:
        output.append(stack.pop())
    return " ".join(output)`,
    typescript: `function shuntingYard(tokens: string[]): string[] {
  const prec: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 3 };
  const stack: string[] = [];
  const output: string[] = [];
  for (const token of tokens) {
    if (!isNaN(Number(token)) || /^[a-zA-Z]$/.test(token)) {
      output.push(token);
    } else if (token === '(') {
      stack.push(token);
    } else if (token === ')') {
      while (stack.length > 0 && stack[stack.length - 1] !== '(') {
        output.push(stack.pop()!);
      }
      stack.pop();
    } else {
      while (stack.length > 0 && stack[stack.length - 1] !== '(' &&
             (prec[stack[stack.length - 1]] > prec[token] ||
              (prec[stack[stack.length - 1]] === prec[token] && token !== '^'))) {
        output.push(stack.pop()!);
      }
      stack.push(token);
    }
  }
  while (stack.length > 0) output.push(stack.pop()!);
  return output;
}`,
    cpp: `vector<string> shuntingYard(const vector<string>& tokens) {
    map<string, int> prec = {{"+", 1}, {"-", 1}, {"*", 2}, {"/", 2}, {"^", 3}};
    stack<string> ops;
    vector<string> output;
    for (const auto& token : tokens) {
        if (isalnum(token[0])) output.push_back(token);
        else if (token == "(") ops.push(token);
        else if (token == ")") {
            while (!ops.empty() && ops.top() != "(") {
                output.push_back(ops.top()); ops.pop();
            }
            if (!ops.empty()) ops.pop();
        } else {
            while (!ops.empty() && ops.top() != "(" &&
                   (prec[ops.top()] > prec[token] ||
                    (prec[ops.top()] == prec[token] && token != "^"))) {
                output.push_back(ops.top()); ops.pop();
            }
            ops.push(token);
        }
    }
    while (!ops.empty()) { output.push_back(ops.top()); ops.pop(); }
    return output;
}`,
    java: `public List<String> shuntingYard(String[] tokens) {
    Map<String, Integer> prec = Map.of("+", 1, "-", 1, "*", 2, "/", 2, "^", 3);
    Deque<String> stack = new ArrayDeque<>();
    List<String> output = new ArrayList<>();
    for (String token : tokens) {
        if (token.matches("[a-zA-Z0-9]+")) output.add(token);
        else if (token.equals("(")) stack.push(token);
        else if (token.equals(")")) {
            while (!stack.isEmpty() && !stack.peek().equals("(")) output.add(stack.pop());
            if (!stack.isEmpty()) stack.pop();
        } else {
            while (!stack.isEmpty() && !stack.peek().equals("(") &&
                   (prec.get(stack.peek()) > prec.get(token) ||
                    (prec.get(stack.peek()).equals(prec.get(token)) && !token.equals("^")))) {
                output.add(stack.pop());
            }
            stack.push(token);
        }
    }
    while (!stack.isEmpty()) output.add(stack.pop());
    return output;
}`,
    pseudocode: `function shuntingYard(expression):
    stack = empty stack, output = empty queue
    for each token in expression:
        if token is operand: enqueue token to output
        else if token is '(': push to stack
        else if token is ')':
            while top of stack != '(': pop to output
            pop '(' from stack
        else (operator):
            while stack has operator with greater precedence:
                pop to output
            push token to stack
    drain remaining stack to output
    return output`,
  },

  generateTimeline: (input: { expression: string }): ExecutionFrame<ShuntingYardState>[] => {
    const raw = input.expression.trim() || '( A + B ) * C';
    const tokens = raw.includes(' ') ? raw.split(/\s+/) : raw.split('');

    const frames: ExecutionFrame<ShuntingYardState>[] = [];
    const stack: string[] = [];
    const output: string[] = [];

    // Initial frame
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 3,
      explanation: `Initialize Shunting-Yard engine for token stream [${tokens.join(', ')}]. Operator stack and output queue empty.`,
      variables: { totalTokens: tokens.length, stackDepth: 0, outputLength: 0 },
      callStack: [
        { name: `shuntingYard("${tokens.join(' ')}")`, params: { count: tokens.length }, line: 3, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      state: {
        tokens,
        currentIndex: -1,
        operatorStack: [],
        outputQueue: [],
        actionDescription: 'Engine initialized',
      },
    });

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const isOperand = /^[a-zA-Z0-9]+$/.test(token);

      if (isOperand) {
        output.push(token);
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 5,
          explanation: `Token "${token}" is an operand. Append directly to output queue.`,
          variables: { token, type: 'operand', output: output.join(' ') },
          callStack: [
            { name: `processOperand("${token}")`, params: { token }, line: 5, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          state: {
            tokens,
            currentIndex: i,
            operatorStack: [...stack],
            outputQueue: [...output],
            actionDescription: `Emitted operand "${token}" to output`,
          },
        });
      } else if (token === '(') {
        stack.push(token);
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 7,
          explanation: `Token "(" opened sub-expression. Push to operator stack.`,
          variables: { token: '(', stackDepth: stack.length },
          callStack: [
            { name: `pushOperator("(")`, params: { token: '(' }, line: 7, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          state: {
            tokens,
            currentIndex: i,
            operatorStack: [...stack],
            outputQueue: [...output],
            actionDescription: `Pushed "(" to stack`,
          },
        });
      } else if (token === ')') {
        // Pop until '('
        while (stack.length > 0 && stack[stack.length - 1] !== '(') {
          const popped = stack.pop()!;
          output.push(popped);
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 10,
            explanation: `Closing ")": Popped operator "${popped}" from stack to output queue.`,
            variables: { poppedOp: popped, remainingStack: stack.join(' ') },
            callStack: [
              { name: `popSubExpression()`, params: { popped }, line: 10, isCurrent: true },
              { name: 'main()', params: {}, line: 1 },
            ],
            state: {
              tokens,
              currentIndex: i,
              operatorStack: [...stack],
              outputQueue: [...output],
              actionDescription: `Popped "${popped}" until "("`,
            },
          });
        }
        if (stack.length > 0 && stack[stack.length - 1] === '(') {
          stack.pop(); // discard '('
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 11,
            explanation: `Matched opening "(". Discarded from operator stack.`,
            variables: { stackDepth: stack.length },
            callStack: [
              { name: `discardParenthesis()`, params: {}, line: 11, isCurrent: true },
              { name: 'main()', params: {}, line: 1 },
            ],
            state: {
              tokens,
              currentIndex: i,
              operatorStack: [...stack],
              outputQueue: [...output],
              actionDescription: `Discarded "("`,
            },
          });
        }
      } else {
        // Operator
        const tokenPrec = PRECEDENCE[token] || 0;
        const isRightAssoc = !!IS_RIGHT_ASSOCIATIVE[token];

        while (
          stack.length > 0 &&
          stack[stack.length - 1] !== '(' &&
          ((PRECEDENCE[stack[stack.length - 1]] || 0) > tokenPrec ||
            ((PRECEDENCE[stack[stack.length - 1]] || 0) === tokenPrec && !isRightAssoc))
        ) {
          const popped = stack.pop()!;
          output.push(popped);
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 15,
            explanation: `Top operator "${popped}" has higher or equal precedence to "${token}". Pop to output queue.`,
            variables: { poppedOp: popped, currentOp: token, opPrecedence: tokenPrec },
            callStack: [
              { name: `popPrecedence("${popped}", "${token}")`, params: { popped, token }, line: 15, isCurrent: true },
              { name: 'main()', params: {}, line: 1 },
            ],
            state: {
              tokens,
              currentIndex: i,
              operatorStack: [...stack],
              outputQueue: [...output],
              actionDescription: `Popped higher-precedence "${popped}"`,
            },
          });
        }

        stack.push(token);
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 18,
          explanation: `Pushed operator "${token}" (precedence ${tokenPrec}) to stack.`,
          variables: { pushedOp: token, precedence: tokenPrec, stackDepth: stack.length },
          callStack: [
            { name: `pushOp("${token}")`, params: { op: token, prec: tokenPrec }, line: 18, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          state: {
            tokens,
            currentIndex: i,
            operatorStack: [...stack],
            outputQueue: [...output],
            actionDescription: `Pushed operator "${token}"`,
          },
        });
      }
    }

    // Drain remaining stack
    while (stack.length > 0) {
      const popped = stack.pop()!;
      output.push(popped);
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 20,
        explanation: `End of tokens. Drain remaining operator "${popped}" to output queue.`,
        variables: { drainedOp: popped, remainingStack: stack.length },
        callStack: [
          { name: `drainRemaining("${popped}")`, params: { drained: popped }, line: 20, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        state: {
          tokens,
          currentIndex: tokens.length,
          operatorStack: [...stack],
          outputQueue: [...output],
          actionDescription: `Drained "${popped}" to output`,
        },
      });
    }

    // Final completed frame
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 22,
      isMilestone: true,
      milestoneTitle: 'Conversion Complete',
      explanation: `Postfix conversion complete. RPN Output: [ ${output.join(' ')} ]. Ready for O(N) evaluation.`,
      variables: { rpnResult: output.join(' '), totalTokens: output.length },
      callStack: [
        { name: 'complete()', params: { rpn: output.join(' ') }, line: 22, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      state: {
        tokens,
        currentIndex: tokens.length,
        operatorStack: [],
        outputQueue: [...output],
        actionDescription: 'Finished RPN expression',
      },
    });

    const total = frames.length;
    frames.forEach((f) => {
      f.totalSteps = total;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<ShuntingYardState>) => {
    const { tokens, currentIndex, operatorStack, outputQueue, actionDescription } = frame.state;

    return (
      <div className="w-full flex-1 flex flex-col items-center justify-between p-6 select-none max-w-5xl mx-auto">
        {/* Top: Input Token Tape */}
        <div className="w-full flex flex-col items-center mb-6">
          <div className="text-xs font-mono font-bold text-slate-400 mb-2 uppercase tracking-wider">
            Token Stream
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
            {tokens.map((tok, idx) => {
              const isCurrent = idx === currentIndex;
              const isProcessed = idx < currentIndex;
              return (
                <div
                  key={idx}
                  className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center font-mono font-bold text-sm transition-all duration-300 ${
                    isCurrent
                      ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)] scale-110'
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

        {/* Center: Operator Stack & Status */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 my-2">
          {/* Operator Stack (LIFO Vertical Tank) */}
          <div className="flex flex-col items-center p-5 rounded-2xl bg-slate-950/70 border border-slate-800 shadow-xl">
            <div className="text-xs font-mono font-bold text-cyan-400 mb-3 flex items-center gap-2">
              <span>🥞 OPERATOR STACK (LIFO)</span>
              <span className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 text-[10px]">
                {operatorStack.length}
              </span>
            </div>

            <div className="w-48 h-44 rounded-2xl border-2 border-dashed border-cyan-800/40 bg-slate-900/40 p-2 flex flex-col-reverse gap-1.5 overflow-y-auto">
              {operatorStack.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-[11px] font-mono text-slate-600 italic">
                  Empty Stack
                </div>
              ) : (
                operatorStack.map((op, idx) => {
                  const isTop = idx === operatorStack.length - 1;
                  return (
                    <div
                      key={idx}
                      className={`h-9 rounded-xl flex items-center justify-between px-4 font-mono font-bold text-sm transition-all ${
                        isTop
                          ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                          : 'bg-slate-800 border border-slate-700 text-slate-300'
                      }`}
                    >
                      <span>{op}</span>
                      <span className="text-[10px] opacity-75 font-normal">
                        {isTop ? 'TOP' : `#${idx}`}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Action Log / Invariant Card */}
          <div className="flex flex-col justify-between p-5 rounded-2xl bg-slate-950/70 border border-slate-800 shadow-xl">
            <div>
              <div className="text-xs font-mono font-bold text-emerald-400 mb-2">
                ⚡ SHUNTING ACTION
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-300 font-semibold mb-3">
                {actionDescription}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-400 leading-relaxed">
              <strong className="text-white block mb-1">Precedence Hierarchy:</strong>
              ^ (3, Right) &gt; * / (2, Left) &gt; + - (1, Left)
            </div>
          </div>
        </div>

        {/* Bottom: Output Queue (RPN Result) */}
        <div className="w-full flex flex-col items-center mt-6">
          <div className="text-xs font-mono font-bold text-emerald-400 mb-2 uppercase tracking-wider flex items-center gap-2">
            <span>🚀 Output Queue (RPN Expression)</span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 text-[10px]">
              {outputQueue.length} elements
            </span>
          </div>
          <div className="w-full flex items-center gap-2 overflow-x-auto p-4 rounded-2xl bg-slate-950/80 border border-emerald-900/40 min-h-[64px]">
            {outputQueue.length === 0 ? (
              <span className="text-xs font-mono text-slate-600 italic mx-auto">
                No tokens emitted yet. Operands and resolved operators will queue here.
              </span>
            ) : (
              outputQueue.map((tok, idx) => (
                <div
                  key={idx}
                  className="px-3.5 py-2 rounded-xl bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 font-mono font-bold text-sm shadow-md shrink-0 flex items-center gap-1.5"
                >
                  <span>{tok}</span>
                  <span className="text-[9px] text-emerald-500/60">#{idx}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  },
};
