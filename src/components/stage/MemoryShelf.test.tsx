import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryShelf, extractAuxiliaryMemory } from './MemoryShelf';

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

  it('extracts structured buffer descriptors with active index and note', () => {
    const frame: any = {
      state: {
        auxiliary: {
          type: 'buffer',
          name: 'temp',
          data: [10, 20, 30],
          activeIndex: 1,
          note: 'Merge buffer for arr[0..3]',
        },
      },
    };
    const res = extractAuxiliaryMemory(frame);
    expect(res).toEqual({
      type: 'buffer',
      name: 'temp',
      data: [10, 20, 30],
      activeIndex: 1,
      note: 'Merge buffer for arr[0..3]',
    });
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

  it('renders structured buffer metadata and highlights the active index', () => {
    const frame: any = {
      stepIndex: 2,
      totalSteps: 5,
      codeLine: 2,
      explanation: 'appending into temp',
      state: {
        auxiliary: {
          type: 'buffer',
          name: 'temp',
          data: [10, 20],
          activeIndex: 1,
          note: 'Values are appended in sorted order.',
        },
      },
      variables: {},
    };
    render(<MemoryShelf frame={frame} />);
    expect(screen.getByText('temp')).toBeInTheDocument();
    expect(screen.getByText('Values are appended in sorted order.')).toBeInTheDocument();
    expect(screen.getByText(/\[1\].*←/)).toBeInTheDocument();
  });

  it('renders a held value descriptor for insertion-sort keys', () => {
    const frame: any = {
      stepIndex: 3,
      totalSteps: 5,
      codeLine: 2,
      explanation: 'key held aside',
      state: {
        auxiliary: {
          type: 'value',
          name: 'key',
          data: 42,
          note: 'arr[3] was copied into key.',
        },
      },
      variables: {},
    };
    render(<MemoryShelf frame={frame} />);
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getAllByText('key').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('arr[3] was copied into key.')).toBeInTheDocument();
  });
});
