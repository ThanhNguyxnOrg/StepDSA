import { describe, it, expect } from 'vitest';
import LZString from 'lz-string';

describe('Hash trace loader compression round-trip', () => {
  it('should compress and decompress snapshot losslessly via lz-string', () => {
    const snapshot = {
      version: '1.0.0',
      meta: { title: 'Bubble Sort Test', language: 'typescript', totalSteps: 3 },
      frames: [
        { stepIndex: 0, codeLine: 1, explanation: 'Step 0', state: { array: [1, 2] } },
        { stepIndex: 1, codeLine: 2, explanation: 'Step 1', state: { array: [2, 1] } },
        { stepIndex: 2, codeLine: 3, explanation: 'Step 2', state: { array: [1, 2] } }
      ]
    };

    const originalJson = JSON.stringify(snapshot);
    const compressed = LZString.compressToEncodedURIComponent(originalJson);
    expect(typeof compressed).toBe('string');
    expect(compressed.length).toBeGreaterThan(0);

    const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
    expect(decompressed).toBe(originalJson);

    const parsed = JSON.parse(decompressed!);
    expect(parsed.meta.title).toBe('Bubble Sort Test');
    expect(parsed.frames).toHaveLength(3);
  });
});
