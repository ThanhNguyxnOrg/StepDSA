import { describe, it, expect } from 'vitest';
import {
  createCustomAlgorithmModule,
  adaptTraceSnapshotToModule,
} from './universalAdapter';
import { StepDSAParsedFile } from './parser';
import { ClassifiedPattern } from './classifier';
import { ExecutionFrame } from '../types';

describe('universalAdapter: createCustomAlgorithmModule', () => {
  it('constructs a fully compliant AlgorithmModule from parsed file and frames', () => {
    const parsed: StepDSAParsedFile = {
      metadata: {
        title: 'User Quick Sort',
        category: 'sorting',
      },
      code: 'function quickSort() {}',
      rawContent: '...',
    };

    const classified: ClassifiedPattern = {
      title: 'Quick Sort',
      category: 'sorting',
      stageHint: 'array',
      defaultInput: [3, 1, 2],
      confidence: 'high',
    };

    const dummyFrames: ExecutionFrame[] = [
      {
        stepIndex: 0,
        totalSteps: 1,
        codeLine: 1,
        explanation: 'Initial step',
        state: { array: [{ id: '0', value: 3, status: 'normal' }] },
      },
    ];

    const mod = createCustomAlgorithmModule(parsed, classified, dummyFrames);

    expect(mod.id).toContain('custom-');
    expect(mod.title).toBe('User Quick Sort');
    expect(mod.category).toBe('sorting');
    expect(mod.generateTimeline([3, 1, 2])).toEqual(dummyFrames);
    expect(typeof mod.renderStage).toBe('function');
  });

  it('adapts a CLI-generated .stepdsa.json trace snapshot into an AlgorithmModule', () => {
    const snapshotJson = JSON.stringify({
      version: '1.0',
      meta: {
        title: 'CLI Bubble Sort',
        algorithm: 'bubble-sort',
        language: 'typescript',
      },
      frames: [
        {
          stepIndex: 0,
          codeLine: 1,
          explanation: 'Comparing index 0 and 1',
          state: {
            array: [
              { id: '0', value: 42, status: 'comparing' },
              { id: '1', value: 17, status: 'comparing' },
            ],
          },
        },
      ],
    });

    const mod = adaptTraceSnapshotToModule(snapshotJson);
    expect(mod.title).toBe('CLI Bubble Sort');
    const timeline = mod.generateTimeline(null);
    expect(timeline.length).toBe(1);
    expect(timeline[0].explanation).toBe('Comparing index 0 and 1');
  });
});
