import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
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
    expect(inferIntuitionSubtitle(frame).toUpperCase()).toContain('SWAP');
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
    expect(inferIntuitionSubtitle(frame).toUpperCase()).toContain('COMPARE');
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

  it('renders algorithm-authored WHAT / WHY / NEXT pedagogy when provided', () => {
    const frame: ExecutionFrame = {
      stepIndex: 1,
      totalSteps: 4,
      codeLine: 3,
      explanation: 'Comparing key with arr[0].',
      state: {},
      pedagogy: {
        what: 'key = 12 is held aside while arr[0] is compared.',
        why: 'The array slot may be overwritten during shifting.',
        whatNext: 'Shift arr[0] right because it is greater than key.',
      },
    };

    render(<StepNarrationBanner frame={frame} />);

    expect(screen.getByText(/What:/)).toBeInTheDocument();
    expect(screen.getByText('key = 12 is held aside while arr[0] is compared.')).toBeInTheDocument();
    expect(screen.getByText(/Why:/)).toBeInTheDocument();
    expect(screen.getByText('The array slot may be overwritten during shifting.')).toBeInTheDocument();
    expect(screen.getByText(/Next:/)).toBeInTheDocument();
    expect(screen.getByText('Shift arr[0] right because it is greater than key.')).toBeInTheDocument();
  });

  it('lets the learner answer a prediction checkpoint and reveals the explanation', () => {
    const frame: ExecutionFrame = {
      stepIndex: 1,
      totalSteps: 4,
      codeLine: 3,
      explanation: 'pivot = 3, arr[j] = 4.',
      state: {},
      checkpoint: {
        id: 'quicksort-test-checkpoint',
        question: 'What should happen next?',
        options: ['Advance j without swapping', 'Swap arr[pIndex] with arr[j]'],
        correctIndex: 0,
        explanation: '4 > 3, so it stays in the right partition and only j advances.',
        hint: 'Compare the value with the pivot.',
      },
    };

    render(<StepNarrationBanner frame={frame} />);

    expect(screen.getByTestId('prediction-checkpoint')).toBeInTheDocument();
    expect(screen.getByText('What should happen next?')).toBeInTheDocument();
    expect(screen.getByText('Compare the value with the pivot.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Advance j without swapping' }));

    expect(screen.getByText(/Correct\./)).toBeInTheDocument();
    expect(
      screen.getByText('4 > 3, so it stays in the right partition and only j advances.')
    ).toBeInTheDocument();
    expect(screen.queryByText('Compare the value with the pivot.')).toBeNull();
  });
});
