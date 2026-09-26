import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface StackItem {
  id: string;
  char: string;
  index: number;
}

export interface ParenthesesState {
  characters: { char: string; index: number; status: 'pending' | 'current' | 'matched' | 'mismatch' }[];
  stack: StackItem[];
  currentIndex: number;
  result: 'valid' | 'invalid' | 'in-progress';
  message: string;
}

export const balancedParenthesesModule: AlgorithmModule<string, ParenthesesState> = {
  id: 'valid-parentheses',
  title: 'Balanced Parentheses (Stack LIFO)',
  category: 'stack-queue',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(1)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(N)',
    worstCaseCondition: 'All opening brackets pushed to stack before validation completes',
  },
  theory: {
    overview:
      'The Valid Parentheses algorithm uses a Last-In, First-Out (LIFO) Stack to ensure every opening bracket has a corresponding and correctly ordered closing bracket.',
    whyItWorks:
      'Nested bracket structures must close in reverse order of opening. Pushing opening brackets to the stack guarantees that the most recent unmatched opener is always on top.',
    invariant:
      'Every bracket currently residing on the stack is an unmatched opening symbol waiting for its exact closing pair.',
    pitfalls: [
      'Popping from an empty stack when encountering a closing bracket without an opener.',
      'Stack not being empty after reading the entire input string (unclosed brackets).',
    ],
  },
  presets: [
    { id: 'valid-nested', label: 'Valid Complex Nested', description: 'Properly nested brackets', data: '{[()()]}' },
    { id: 'mismatch', label: 'Type Mismatch Error', description: 'Closing bracket does not match top', data: '({[)]}' },
    { id: 'unclosed', label: 'Unclosed Opening Bracket', description: 'Stack remains non-empty at end', data: '(()' },
    { id: 'empty-pop', label: 'Premature Closing Bracket', description: 'Closing bracket with empty stack', data: '())(' },
  ],
  defaultInput: '{[()()]}',
  codeSnippets: {
    python: `def is_valid_parentheses(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
            
    return len(stack) == 0`,
    typescript: `function isValidParentheses(s: string): boolean {
  const stack: string[] = [];
  const pairs: Record<string, string> = { ')': '(', '}': '{', ']': '[' };

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(' || c === '{' || c === '[') {
      stack.push(c);
    } else {
      if (stack.length === 0 || stack.pop() !== pairs[c]) {
        return false;
      }
    }
  }

  return stack.length === 0;
}`,
    cpp: `bool isValidParentheses(string s) {
    stack<char> st;
    unordered_map<char, char> pairs = {{')', '('}, {'}', '{'}, {']', '['}};
    
    for (char c : s) {
        if (c == '(' || c == '{' || c == '[') {
            st.push(c);
        } else {
            if (st.empty() || st.top() != pairs[c]) return false;
            st.pop();
        }
    }
    return st.empty();
}`,
    java: `public boolean isValid(String s) {
    Stack<Character> stack = new Stack<>();
    Map<Character, Character> pairs = Map.of(')', '(', '}', '{', ']', '[');
    
    for (char c : s.toCharArray()) {
        if (c == '(' || c == '{' || c == '[') {
            stack.push(c);
        } else {
            if (stack.isEmpty() || stack.pop() != pairs.get(c)) return false;
        }
    }
    return stack.isEmpty();
}`,
    pseudocode: `function isValidParentheses(s):
    stack = empty Stack
    for each char in s:
        if char is opening:
            stack.push(char)
        else:
            if stack is empty or stack.pop() != matching(char):
                return false
    return stack is empty`,
  },

  generateTimeline: (input: string): ExecutionFrame<ParenthesesState>[] => {
    const frames: ExecutionFrame<ParenthesesState>[] = [];
    const s = input.trim();
    const n = s.length;
    const pairs: Record<string, string> = { ')': '(', '}': '{', ']': '[' };
    const stack: StackItem[] = [];

    const charsState: { char: string; index: number; status: 'pending' | 'current' | 'matched' | 'mismatch' }[] = s.split('').map((c, idx) => ({
      char: c,
      index: idx,
      status: 'pending',
    }));

    // Initial frame
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: `Initialized empty stack for bracket validation on "${s}".`,
      callStack: [
        { name: 'isValidParentheses(s)', params: { length: n }, line: 1, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { length: n, stackSize: 0 },
      state: {
        characters: charsState.map((c) => ({ ...c })),
        stack: [],
        currentIndex: -1,
        result: 'in-progress',
        message: 'Stack initialized (empty). Starting scan.',
      },
    });

    let isValid = true;

    for (let i = 0; i < n; i++) {
      const char = s[i];
      const isOpening = char === '(' || char === '{' || char === '[';

      charsState[i].status = 'current';

      if (isOpening) {
        // Frame: Opening bracket encountered
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 6,
          explanation: `Encountered opening bracket '${char}' at index ${i}. Pushing to stack.`,
          callStack: [
            { name: 'isValidParentheses(s)', params: { i, char, action: 'PUSH' }, line: 6, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          variables: { i, char, stackSize: stack.length },
          conditionEval: { expr: `isOpening('${char}')`, result: true },
          soundCue: { type: 'compare' },
          state: {
            characters: charsState.map((c) => ({ ...c })),
            stack: [...stack],
            currentIndex: i,
            result: 'in-progress',
            message: `Pushing '${char}' to stack.`,
          },
        });

        stack.push({ id: `item-${i}`, char, index: i });
        charsState[i].status = 'matched';

        // Frame: After push
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 7,
          explanation: `'${char}' pushed to stack. Stack size is now ${stack.length}.`,
          callStack: [
            { name: 'isValidParentheses(s)', params: { i, stackTop: char, stackSize: stack.length }, line: 7, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          variables: { i, top: char, stackSize: stack.length },
          soundCue: { type: 'swap' },
          state: {
            characters: charsState.map((c) => ({ ...c })),
            stack: [...stack],
            currentIndex: i,
            result: 'in-progress',
            message: `Pushed '${char}' to stack top.`,
          },
          invariantStatus: {
            isValid: true,
            label: `Stack has ${stack.length} unmatched opener(s)`,
          },
        });
      } else {
        // Closing bracket
        const expectedOpening = pairs[char];

        // Check empty stack error
        if (stack.length === 0) {
          charsState[i].status = 'mismatch';
          isValid = false;

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 9,
            explanation: `Encountered closing bracket '${char}' at index ${i}, but stack is empty! No matching opener exists.`,
            callStack: [
              { name: 'isValidParentheses(s)', params: { i, char, error: 'EMPTY_STACK' }, line: 9, isCurrent: true },
              { name: 'main()', params: {}, line: 1 },
            ],
            variables: { i, char, result: 'INVALID' },
            conditionEval: { expr: 'stack.empty()', result: true },
            soundCue: { type: 'discard' },
            isMilestone: true,
            milestoneTitle: 'Empty Stack Mismatch',
            state: {
              characters: charsState.map((c) => ({ ...c })),
              stack: [],
              currentIndex: i,
              result: 'invalid',
              message: `Error: Closing '${char}' with no opening bracket!`,
            },
            invariantStatus: {
              isValid: false,
              label: 'Premature closing bracket',
            },
          });
          break;
        }

        const top = stack[stack.length - 1];
        const isMatch = top.char === expectedOpening;

        // Frame: Compare top with closing pair
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 9,
          explanation: `Encountered closing bracket '${char}'. Top of stack is '${top.char}'. Checking match: expecting '${expectedOpening}'.`,
          callStack: [
            { name: 'isValidParentheses(s)', params: { i, char, stackTop: top.char, expected: expectedOpening }, line: 9, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          variables: { i, char, top: top.char, expected: expectedOpening },
          conditionEval: { expr: `'${top.char}' == '${expectedOpening}'`, result: isMatch },
          soundCue: { type: 'compare' },
          state: {
            characters: charsState.map((c) => ({ ...c })),
            stack: [...stack],
            currentIndex: i,
            result: 'in-progress',
            message: `Comparing '${char}' with stack top '${top.char}'.`,
          },
        });

        if (!isMatch) {
          charsState[i].status = 'mismatch';
          charsState[top.index].status = 'mismatch';
          isValid = false;

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 10,
            explanation: `MISMATCH! Closing bracket '${char}' does NOT match stack top '${top.char}'. Returning false.`,
            callStack: [
              { name: 'isValidParentheses(s)', params: { mismatch: `${top.char} vs ${char}` }, line: 10, isCurrent: true },
              { name: 'main()', params: {}, line: 1 },
            ],
            variables: { result: 'FALSE', mismatch: `${top.char} != ${char}` },
            soundCue: { type: 'discard' },
            isMilestone: true,
            milestoneTitle: 'Bracket Mismatch',
            state: {
              characters: charsState.map((c) => ({ ...c })),
              stack: [...stack],
              currentIndex: i,
              result: 'invalid',
              message: `Mismatch: '${top.char}' cannot be closed by '${char}'.`,
            },
            invariantStatus: {
              isValid: false,
              label: 'Bracket Type Mismatch',
            },
          });
          break;
        }

        // Pop from stack
        stack.pop();
        charsState[i].status = 'matched';

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 10,
          explanation: `MATCH CONFIRMED! '${top.char}' paired with '${char}'. Popped from stack.`,
          callStack: [
            { name: 'isValidParentheses(s)', params: { matched: `${top.char}${char}`, remainingStack: stack.length }, line: 10, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          variables: { matched: `${top.char}${char}`, stackSize: stack.length },
          soundCue: { type: 'sorted' },
          state: {
            characters: charsState.map((c) => ({ ...c })),
            stack: [...stack],
            currentIndex: i,
            result: 'in-progress',
            message: `Successfully closed pair '${top.char}${char}'.`,
          },
          invariantStatus: {
            isValid: true,
            label: `Closed pair '${top.char}${char}'`,
          },
        });
      }
    }

    // End of string validation
    if (isValid) {
      const isStackEmpty = stack.length === 0;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 14,
        explanation: isStackEmpty
          ? 'Validation complete! All brackets correctly matched and stack is empty. String is VALID.'
          : `Scan finished but stack still contains ${stack.length} unclosed bracket(s): [${stack.map((item) => item.char).join(', ')}]. String is INVALID.`,
        callStack: [
          { name: 'isValidParentheses(s)', params: { finalResult: isStackEmpty ? 1 : 0 }, line: 14, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: { isValid: isStackEmpty, remainingStackSize: stack.length },
        conditionEval: { expr: 'stack.empty()', result: isStackEmpty },
        soundCue: { type: isStackEmpty ? 'sorted' : 'discard' },
        isMilestone: true,
        milestoneTitle: isStackEmpty ? 'Valid Parentheses' : 'Unclosed Openers',
        state: {
          characters: charsState.map((c) => ({
            ...c,
            status: isStackEmpty ? 'matched' : stack.some((it) => it.index === c.index) ? 'mismatch' : 'matched',
          })),
          stack: [...stack],
          currentIndex: n,
          result: isStackEmpty ? 'valid' : 'invalid',
          message: isStackEmpty ? 'Input is 100% Balanced and Valid!' : 'Error: Unclosed brackets remain on stack.',
        },
        invariantStatus: {
          isValid: isStackEmpty,
          label: isStackEmpty ? 'All Brackets Balanced' : 'Unclosed Brackets Remain',
        },
      });
    }

    const totalSteps = frames.length;
    return frames.map((f) => ({ ...f, totalSteps }));
  },

  renderStage: (frame: ExecutionFrame<ParenthesesState>) => {
    const { characters, stack, currentIndex, result, message } = frame.state;

    return (
      <div className="w-full h-full flex flex-col justify-between p-4 bg-[#0B0F19] rounded-2xl border border-[#1F293D] select-none">
        {/* Top: Characters Stream Bar */}
        <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Input Characters Stream</span>
            <span className={`font-bold px-2 py-0.5 rounded text-xs ${
              result === 'valid'
                ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                : result === 'invalid'
                ? 'bg-[#F43F5E]/20 text-[#F43F5E] border border-[#F43F5E]/40'
                : 'bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/40'
            }`}>
              {result.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {characters.map((item, idx) => {
              const isCurrent = idx === currentIndex;
              let borderClass = 'border-[#1F293D] bg-[#1F2937] text-slate-300';

              if (item.status === 'mismatch') {
                borderClass = 'border-[#F43F5E] bg-[#F43F5E]/20 text-[#F43F5E] shadow-md shadow-rose-900/30';
              } else if (item.status === 'matched') {
                borderClass = 'border-[#10B981] bg-[#10B981]/20 text-[#10B981]';
              } else if (isCurrent) {
                borderClass = 'border-[#F59E0B] bg-[#F59E0B]/30 text-amber-200 ring-2 ring-[#F59E0B]/50 animate-pulse';
              }

              return (
                <div key={idx} className="flex flex-col items-center gap-1 shrink-0">
                  <div className={`w-9 h-11 rounded-lg border flex items-center justify-center font-mono font-bold text-base transition-all ${borderClass}`}>
                    {item.char}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">[{idx}]</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: Stack Container Visualization (LIFO) */}
        <div className="flex-1 flex flex-col items-center justify-center my-4">
          <div className="w-56 flex flex-col items-center">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-400 mb-2">
              <span>STACK (LIFO)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1F2937] text-cyan-300">
                Size: {stack.length}
              </span>
            </div>

            {/* Stack Visual Bucket */}
            <div className="w-full min-h-[160px] max-h-[220px] bg-[#111827]/70 border-x-2 border-b-2 border-[#06B6D4]/50 rounded-b-xl p-2 flex flex-col-reverse items-center gap-1.5 overflow-y-auto relative shadow-inner">
              {stack.length > 0 ? (
                stack.map((item, idx) => {
                  const isTop = idx === stack.length - 1;
                  return (
                    <div
                      key={item.id}
                      className={`w-full py-2 px-3 rounded-lg border flex items-center justify-between font-mono text-xs transition-all ${
                        isTop
                          ? 'bg-[#06B6D4]/20 border-[#06B6D4] text-cyan-200 shadow-md shadow-[#06B6D4]/20'
                          : 'bg-[#1F2937] border-[#374151] text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white">{item.char}</span>
                        <span className="text-[10px] text-slate-400">from [{item.index}]</span>
                      </div>
                      {isTop && (
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-[#06B6D4] text-slate-900">
                          TOP
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-xs font-mono text-slate-500 italic py-8">Stack is empty</div>
              )}
            </div>
            {/* Base Stand */}
            <div className="w-3/4 h-1.5 bg-[#06B6D4]/40 rounded-full mt-1" />
          </div>
        </div>

        {/* Bottom Status Message */}
        <div className="bg-[#111827] border border-[#1F293D] rounded-xl px-4 py-2.5 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-medium truncate">{message}</span>
          <span className="text-slate-500 text-[11px] shrink-0 ml-2">
            Top: {stack.length > 0 ? `'${stack[stack.length - 1].char}'` : 'NULL'}
          </span>
        </div>
      </div>
    );
  },
};
