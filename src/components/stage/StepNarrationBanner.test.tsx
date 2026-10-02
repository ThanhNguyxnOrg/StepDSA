import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StepNarrationBanner, inferIntuitionSubtitle } from './StepNarrationBanner';
import { ExecutionFrame } from '../../core/types';

describe('inferIntuitionSubtitle', () => {
  it('uses explicit subtitle if provided on frame', () => {
    const frame: ExecutionFrame = {
      stepIndex: 0,
      totalSteps: 5,
      codeLine: 1,
      explanation: 'Checking pair',
      subtitle: 'Two-Pointer Converge',
      state: {},
    };
    expect(inferIntuitionSubtitle(frame)).toBe('Two-Pointer Converge');
  });

  it('infers swap subtitle when action is swap', () => {
    const frame: ExecutionFrame = {
      stepIndex: 1,
      totalSteps: 5,
      codeLine: 2,
      explanation: 'Swapping values',
      action: 'swap',
      state: {},
    };
    expect(inferIntuitionSubtitle(frame)).toContain('SWAP');
  });

  it('infers comparison subtitle when action is compare', () => {
    const frame: ExecutionFrame = {
      stepIndex: 2,
      totalSteps: 5,
      codeLine: 3,
      explanation: 'Comparing arr[i] with arr[j]',
      action: 'compare',
      state: {},
    };
    expect(inferIntuitionSubtitle(frame)).toContain('COMPARE');
  });
});

describe('StepNarrationBanner Component', () => {
  it('renders dual layer with subtitle badge and detailed explanation', () => {
    const frame: ExecutionFrame = {
      stepIndex: 2,
      totalSteps: 10,
      codeLine: 4,
      explanation: 'Element 42 is placed into sorted position',
      subtitle: 'Pivot Partition Complete',
      state: {},
    };

    render(<StepNarrationBanner frame={frame} />);

    expect(screen.getByText('Step 3/10')).toBeInTheDocument();
    expect(screen.getByText('Pivot Partition Complete')).toBeInTheDocument();
    expect(screen.getByText('Element 42 is placed into sorted position')).toBeInTheDocument();
  });
});
