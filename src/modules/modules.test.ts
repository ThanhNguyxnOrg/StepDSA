import { describe, it, expect } from 'vitest';
import { allModules } from './registry';

describe('Algorithm Modules Integrity & Generator Test', () => {
  it('has registered Tier 1 modules', () => {
    expect(allModules.length).toBeGreaterThanOrEqual(5);
  });

  allModules.forEach((mod) => {
    describe(`Module: ${mod.title} (${mod.id})`, () => {
      it('has valid metadata and multi-language snippets', () => {
        expect(mod.id).toBeTruthy();
        expect(mod.title).toBeTruthy();
        expect(mod.complexity.timeAverage).toBeTruthy();
        expect(mod.theory.invariant).toBeTruthy();
        expect(mod.codeSnippets.python).toBeTruthy();
        expect(mod.codeSnippets.typescript).toBeTruthy();
      });

      it('generates deterministic timeline without crashing on defaultInput', () => {
        const timeline = mod.generateTimeline(mod.defaultInput);
        expect(timeline.length).toBeGreaterThan(1);

        // Check sequential indexing
        timeline.forEach((frame, idx) => {
          expect(frame.stepIndex).toBe(idx);
          expect(frame.totalSteps).toBe(timeline.length);
          expect(frame.explanation).toBeTruthy();
        });
      });
    });
  });
});
