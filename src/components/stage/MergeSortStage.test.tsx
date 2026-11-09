import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  buildMergeSortRows,
  MergeSortStage,
  MergeSortView,
} from './MergeSortStage';
import { ArrayElement } from './ArrayStage';

const makeArray = (values: number[], activeIndex?: number): ArrayElement[] =>
  values.map((value, idx) => ({
    id: idx,
    value,
    status: idx === activeIndex ? 'active' : 'default',
  }));

describe('buildMergeSortRows', () => {
  it('keeps every depth row partitioned over [0..n-1] by inserting gap placeholders', () => {
    const view: MergeSortView = {
      nodes: [
        { id: '0-3', left: 0, right: 3, depth: 0, phase: 'ready' },
        { id: '0-1', left: 0, right: 1, depth: 1, phase: 'left' },
        { id: '2-3', left: 2, right: 3, depth: 1, phase: 'right' },
        { id: '0-0', left: 0, right: 0, depth: 2, phase: 'base' },
        { id: '1-1', left: 1, right: 1, depth: 2, phase: 'base' },
        { id: '2-2', left: 2, right: 2, depth: 2, phase: 'consumed' },
      ],
    };

    const rows = buildMergeSortRows(view, 4);
    expect(rows.map((row) => row.depth)).toEqual([0, 1, 2]);

    for (const row of rows) {
      // Items are contiguous and cover the whole array exactly once.
      let cursor = 0;
      for (const item of row.items) {
        expect(item.left).toBe(cursor);
        cursor = item.right + 1;
      }
      expect(cursor).toBe(4);
    }

    // Depth 2 has an interspersed gap: [3..3] was resolved at a shallower depth.
    expect(rows[2].items.map((item) => item.kind)).toEqual([
      'node',
      'node',
      'node',
      'gap',
    ]);
    expect(rows[2].items[3]).toMatchObject({ left: 3, right: 3 });
  });

  it('sorts nodes of the same depth deterministically by left boundary', () => {
    const view: MergeSortView = {
      nodes: [
        { id: '2-3', left: 2, right: 3, depth: 1, phase: 'right' },
        { id: '0-1', left: 0, right: 1, depth: 1, phase: 'left' },
      ],
    };
    const rows = buildMergeSortRows(view, 4);
    expect(rows[0].items.map((item) => item.node?.id)).toEqual(['0-1', '2-3']);
  });
});

describe('MergeSortStage', () => {
  const view: MergeSortView = {
    nodes: [
      { id: '0-3', left: 0, right: 3, depth: 0, phase: 'merging' },
      { id: '0-1', left: 0, right: 1, depth: 1, phase: 'left' },
      { id: '2-3', left: 2, right: 3, depth: 1, phase: 'right' },
      { id: '0-0', left: 0, right: 0, depth: 2, phase: 'consumed' },
      { id: '1-1', left: 1, right: 1, depth: 2, phase: 'consumed' },
    ],
    merge: { left: 0, mid: 1, right: 3, i: 0, j: 2, phase: 'compare' },
    statusLabel: 'COMPARE arr[0] = 38 vs arr[2] = 43',
    statusKind: 'compare',
  };

  const baseState = {
    array: makeArray([38, 27, 43, 3]),
    pointers: { left: 0, mid: 1, right: 3, i: 0, j: 2, copyFrom: 1 },
    mergeView: view,
  };

  it('renders the status chip, depth rows, phase styling, and the mid divider', () => {
    const { container, getByTestId } = render(
      <MergeSortStage state={baseState} projection="2d" />
    );

    expect(getByTestId('ms-status').textContent).toContain('COMPARE arr[0] = 38 vs arr[2] = 43');
    expect(getByTestId('ms-row-0')).toBeTruthy();
    expect(getByTestId('ms-row-2')).toBeTruthy();

    const merging = container.querySelector('[data-node-id="0-3"]');
    expect(merging?.getAttribute('data-phase')).toBe('merging');
    expect(
      container.querySelector('[data-node-id="0-3"] [data-divider-mid="1"]')
    ).toBeTruthy();

    expect(container.querySelector('[data-node-id="0-1"]')?.getAttribute('data-phase')).toBe(
      'left'
    );
    expect(container.querySelector('[data-node-id="2-3"]')?.getAttribute('data-phase')).toBe(
      'right'
    );
  });

  it('shows pointer badges only in active merge boxes and never maps temp-only pointers onto cells', () => {
    const { container } = render(<MergeSortStage state={baseState} projection="2d" />);

    expect(
      container.querySelector('[data-node-id="0-1"] [data-pointer="i"]')
    ).toBeTruthy();
    expect(
      container.querySelector('[data-node-id="0-1"] [data-pointer="left"]')
    ).toBeTruthy();
    expect(
      container.querySelector('[data-node-id="2-3"] [data-pointer="j"]')
    ).toBeTruthy();

    // `copyFrom` indexes the temp buffer, not the array — it must never be drawn.
    expect(container.querySelector('[data-pointer="copyFrom"]')).toBeNull();

    // Consumed boxes never show badges.
    expect(
      container.querySelector('[data-node-id="0-0"] [data-pointer]')
    ).toBeNull();
  });

  it('highlights the copy-back destination cell through array statuses', () => {
    const copyView: MergeSortView = {
      ...view,
      merge: { left: 0, mid: 1, right: 3, i: 2, j: 2, phase: 'copy', copyTo: 2 },
      statusLabel: 'COPY BACK temp[2] = 43 → arr[2]',
      statusKind: 'copy',
    };
    const { container } = render(
      <MergeSortStage
        state={{ ...baseState, array: makeArray([27, 38, 43, 3], 2), mergeView: copyView }}
        projection="2d"
      />
    );

    const cell = container.querySelector('[data-cell-index="2"]');
    expect(cell?.textContent).toContain('43');
    expect(cell?.className).toContain('border-[#06B6D4]');
  });

  it('falls back to a hint when no merge view is available', () => {
    const { container } = render(
      <MergeSortStage state={{ array: [] }} projection="2d" />
    );
    expect(container.textContent).toContain('divide-and-merge view');
  });
});
