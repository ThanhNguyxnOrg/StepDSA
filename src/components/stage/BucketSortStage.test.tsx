import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BucketSortStage } from './BucketSortStage';
import { ArrayElement } from './ArrayStage';

const makeArray = (values: number[]): ArrayElement[] =>
  values.map((value, idx) => ({
    id: idx,
    value,
    status: idx === 1 ? 'active' : idx < 1 ? 'sorted' : 'default',
  }));

const baseState = {
  array: makeArray([3, 9, 21, 29, 25, 37, 43, 49]),
  pointers: { writeIdx: 1, bucket: 2 },
  bucketView: {
    buckets: [[3, 9], [21], [29, 25], [37], [49, 43]],
    numBuckets: 5,
    bucketRange: 10,
    minVal: 3,
    activeBucket: 2,
    writeIdx: 1,
    phase: 'sort' as const,
    statusLabel: 'SORT B2: 25 ⇄ 29',
  },
};

describe('BucketSortStage', () => {
  it('renders range labels, active bucket highlight, and write-cursor badges', () => {
    const { container, getByTestId } = render(
      <BucketSortStage state={baseState} projection="2d" />
    );

    expect(getByTestId('bs-status').textContent).toContain('SORT B2: 25 ⇄ 29');
    expect(container.querySelectorAll('[data-bucket]').length).toBe(5);
    expect(container.querySelector('[data-bucket="2"]')?.getAttribute('data-bucket-state')).toBe(
      'active'
    );

    // During the sort phase, earlier buckets are already marked sorted.
    expect(container.querySelector('[data-bucket="0"]')?.getAttribute('data-bucket-state')).toBe(
      'sorted'
    );
    expect(container.querySelector('[data-bucket="4"]')?.getAttribute('data-bucket-state')).toBe(
      'idle'
    );

    // Range partition label B0 owns [3..12].
    expect(container.textContent).toContain('[3..12]');
    // Pointer badges render under array cells.
    expect(container.querySelector('[data-pointer="writeIdx"]')).toBeTruthy();
    expect(container.querySelector('[data-pointer="bucket"]')).toBeTruthy();
  });

  it('dims already-gathered buckets during the gather phase', () => {
    const gathering = {
      ...baseState,
      bucketView: {
        ...baseState.bucketView,
        phase: 'gather' as const,
        activeBucket: 4,
        statusLabel: 'GATHER B4 → arr[6] = 43',
      },
    };
    const { container } = render(
      <BucketSortStage state={gathering} projection="2d" />
    );

    expect(container.querySelector('[data-bucket="0"]')?.getAttribute('data-bucket-state')).toBe(
      'gathered'
    );
    expect(container.querySelector('[data-bucket="4"]')?.getAttribute('data-bucket-state')).toBe(
      'active'
    );
  });

  it('marks everything as gathered once the sort completes', () => {
    const done = {
      ...baseState,
      bucketView: {
        ...baseState.bucketView,
        phase: 'done' as const,
        activeBucket: null,
        statusLabel: 'DONE: fully sorted',
      },
    };
    const { container, getByTestId } = render(
      <BucketSortStage state={done} projection="2d" />
    );
    expect(getByTestId('bs-status').textContent).toContain('DONE');
    for (let b = 0; b < 5; b++) {
      expect(container.querySelector(`[data-bucket="${b}"]`)?.getAttribute('data-bucket-state')).toBe(
        'gathered'
      );
    }
  });
});
