import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VariableWatcher } from './VariableWatcher';

describe('VariableWatcher Component with Delta Badges', () => {
  it('renders variables without delta badge on first step', () => {
    const frame: any = {
      stepIndex: 0,
      variables: { count: 5, target: 10 },
      state: {},
    };

    render(<VariableWatcher frame={frame} />);
    expect(screen.getByText('count')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.queryByText(/▲/)).toBeNull();
    expect(screen.queryByText(/▼/)).toBeNull();
  });

  it('renders positive delta badge when a numeric variable increases', () => {
    const frame0: any = {
      stepIndex: 0,
      variables: { count: 5 },
      state: {},
    };
    const { rerender } = render(<VariableWatcher frame={frame0} />);

    const frame1: any = {
      stepIndex: 1,
      variables: { count: 8 },
      state: {},
    };
    rerender(<VariableWatcher frame={frame1} />);

    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('▲ +3')).toBeInTheDocument();
  });

  it('renders negative delta badge when a numeric variable decreases', () => {
    const frame0: any = {
      stepIndex: 0,
      variables: { balance: 20 },
      state: {},
    };
    const { rerender } = render(<VariableWatcher frame={frame0} />);

    const frame1: any = {
      stepIndex: 1,
      variables: { balance: 13 },
      state: {},
    };
    rerender(<VariableWatcher frame={frame1} />);

    expect(screen.getByText('13')).toBeInTheDocument();
    expect(screen.getByText('▼ -7')).toBeInTheDocument();
  });

  it('does not produce NaN or deltas for non-numeric variables', () => {
    const frame0: any = {
      stepIndex: 0,
      variables: { status: 'idle' },
      state: {},
    };
    const { rerender } = render(<VariableWatcher frame={frame0} />);

    const frame1: any = {
      stepIndex: 1,
      variables: { status: 'running' },
      state: {},
    };
    rerender(<VariableWatcher frame={frame1} />);

    expect(screen.getByText('status')).toBeInTheDocument();
    expect(screen.getByText('running')).toBeInTheDocument();
    expect(screen.queryByText(/NaN/)).toBeNull();
    expect(screen.queryByText(/▲/)).toBeNull();
  });
});
