import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CallStackStage } from './CallStackStage';
import { ExecutionFrame } from '../../core/types';

describe('CallStackStage Component', () => {
  it('renders call stack frames with function names and parameters', () => {
    const frame: ExecutionFrame = {
      stepIndex: 2,
      totalSteps: 10,
      codeLine: 5,
      explanation: 'Calling dfs(O: 2, C: 3, s: "(")',
      callStack: [
        'generateParenthesis(n=3)',
        'dfs(O=3, C=3, s="")',
        'dfs(O=2, C=3, s="(")',
      ],
      variables: { O: 2, C: 3, s: '(', 'res.length': 0 },
      state: {},
    };

    render(<CallStackStage frame={frame} />);

    expect(screen.getByText(/Active Call Stack/i)).toBeInTheDocument();
    expect(screen.getByText(/Depth:/i)).toBeInTheDocument();
    expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/dfs/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/generateParenthesis/i)).toBeInTheDocument();
  });

  it('renders empty fallback when call stack has 0 frames', () => {
    const frame: ExecutionFrame = {
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: 'Empty',
      callStack: [],
      state: {},
    };

    render(<CallStackStage frame={frame} />);
    expect(screen.getByText(/Call Stack Ready/i)).toBeInTheDocument();
  });
});
