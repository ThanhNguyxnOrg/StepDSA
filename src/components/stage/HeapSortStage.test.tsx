import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { HeapSortStage } from './HeapSortStage';
import { ArrayElement } from './ArrayStage';

const state = {
  array: [
    { id: 0, value: 50, status: 'active' },
    { id: 1, value: 12, status: 'default' },
    { id: 2, value: 45, status: 'comparing' },
    { id: 3, value: 9, status: 'default' },
    { id: 4, value: 28, status: 'comparing' },
    { id: 5, value: 35, status: 'default' },
    { id: 6, value: 18, status: 'sorted' },
  ] as ArrayElement[],
  pointers: { root: 0, heapEnd: 5 },
  heapView: {
    heapSize: 6,
    phase: 'extract' as const,
    statusLabel: 'SIFT-DOWN: inspect node 0 (50)',
    statusKind: 'inspect' as const,
    currentNode: 0,
    leftChild: 1,
    rightChild: 2,
  },
};

describe('HeapSortStage', () => {
  it('renders the array cells with the locked suffix and one tree node per active heap slot', () => {
    const { container, getByTestId } = render(
      <HeapSortStage state={state} projection="2d" />
    );

    expect(getByTestId('hs-status').textContent).toContain('inspect node 0');
    expect(container.querySelectorAll('[data-heap-node]').length).toBe(6);

    // Locked suffix: index 6 >= heapSize(6) -> locked; index 5 is still in the heap.
    expect(container.querySelector('[data-cell-index="6"]')?.getAttribute('data-locked')).toBe(
      'true'
    );
    expect(container.querySelector('[data-cell-index="5"]')?.getAttribute('data-locked')).toBe(
      'false'
    );

    // Node roles: current node, compared children.
    expect(container.querySelector('[data-heap-node="0"]')?.getAttribute('data-role')).toBe(
      'current'
    );
    expect(container.querySelector('[data-heap-node="1"]')?.getAttribute('data-role')).toBe(
      'child'
    );
    expect(container.querySelector('[data-heap-node="2"]')?.getAttribute('data-role')).toBe(
      'child'
    );

    // Pointer badges map onto the array row.
    expect(container.querySelector('[data-pointer="root"]')).toBeTruthy();
  });

  it('shrinks the tree with heapSize and marks extracted cells as locked', () => {
    const shrunk = {
      ...state,
      heapView: { ...state.heapView, heapSize: 3 },
    };
    const { container } = render(<HeapSortStage state={shrunk} projection="2d" />);

    expect(container.querySelectorAll('[data-heap-node]').length).toBe(3);
    expect(container.querySelector('[data-cell-index="3"]')?.getAttribute('data-locked')).toBe(
      'true'
    );
    expect(container.querySelector('[data-cell-index="2"]')?.getAttribute('data-locked')).toBe(
      'false'
    );
  });

  it('highlights the chosen child for an imminent swap', () => {
    const swapping = {
      ...state,
      heapView: {
        ...state.heapView,
        statusKind: 'swap' as const,
        chosenChild: 1,
        swapping: [0, 1],
      },
    };
    const { container } = render(<HeapSortStage state={swapping} projection="2d" />);

    expect(container.querySelector('[data-heap-node="1"]')?.getAttribute('data-role')).toBe(
      'chosen'
    );
  });
});
