import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryShelf, extractAuxiliaryMemory } from './MemoryShelf';
import { ExecutionFrame } from '../../core/types';

describe('extractAuxiliaryMemory', () => {
  it('extracts map or seen variables from frame', () => {
    const frame: any = {
      variables: { seen: { '2': 0, '7': 1 }, i: 2 },
      state: {},
    };
    const res = extractAuxiliaryMemory(frame);
    expect(res?.type).toBe('map');
    expect(res?.data).toEqual({ '2': 0, '7': 1 });
  });

  it('extracts auxiliary buffer array if present', () => {
    const frame: any = {
      state: { auxiliary: [1, 2, 5] },
    };
    const res = extractAuxiliaryMemory(frame);
    expect(res?.type).toBe('buffer');
    expect(res?.data).toEqual([1, 2, 5]);
  });

  it('returns null when no auxiliary memory exists', () => {
    const frame: any = {
      variables: { i: 0, j: 1 },
      state: { array: [1, 2, 3] },
    };
    expect(extractAuxiliaryMemory(frame)).toBeNull();
  });
});

describe('MemoryShelf Component', () => {
  it('renders nothing when frame has no auxiliary data', () => {
    const frame: any = {
      stepIndex: 0,
      totalSteps: 5,
      codeLine: 1,
      explanation: 'test',
      state: {},
      variables: {},
    };
    const { container } = render(<MemoryShelf frame={frame} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders hash map entries cleanly with key-value pills', () => {
    const frame: any = {
      stepIndex: 1,
      totalSteps: 5,
      codeLine: 2,
      explanation: 'storing complement',
      state: {},
      variables: {
        seen: { '7': 0, '2': 1 },
      },
    };
    render(<MemoryShelf frame={frame} />);
    expect(screen.getByText(/Auxiliary Memory/i)).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders buffer array elements', () => {
    const frame: any = {
      stepIndex: 1,
      totalSteps: 5,
      codeLine: 2,
      explanation: 'merging into temp',
      state: {
        auxiliary: [10, 20, 30],
      },
      variables: {},
    };
    render(<MemoryShelf frame={frame} />);
    expect(screen.getAllByText(/Auxiliary Buffer/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });
});
