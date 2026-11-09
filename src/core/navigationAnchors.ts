import { AlgorithmModule, ExecutionFrame } from './types';

const hasMilestoneMark = (frame: ExecutionFrame): boolean =>
  Boolean(frame.isMilestone || frame.milestoneTitle);

/**
 * Deterministic time-travel navigation contract: every timeline with at least
 * two frames must expose jump targets for its start and its completion, since
 * those are the only positions that are meaningful for *every* algorithm
 * without algorithm-specific knowledge.
 *
 * Modules that already author richer, algorithm-specific milestones are left
 * untouched. This helper only fills in the missing first/last anchors with a
 * generic `Start` / `Complete` title so milestone-jump controls never have
 * zero (or incomplete) targets. Frame order, `stepIndex`/`totalSteps`
 * bookkeeping, explanations, and visual state are preserved byte-for-byte.
 */
export function withNavigationAnchors<TInput, TState>(
  module: AlgorithmModule<TInput, TState>
): AlgorithmModule<TInput, TState> {
  return {
    ...module,
    generateTimeline: (input: TInput): ExecutionFrame<TState>[] => {
      const frames = module.generateTimeline(input);
      if (frames.length < 2) return frames;

      const firstFrame = frames[0];
      const lastFrame = frames[frames.length - 1];
      const needsStart = !hasMilestoneMark(firstFrame);
      const needsComplete = !hasMilestoneMark(lastFrame);
      if (!needsStart && !needsComplete) return frames;

      const anchored = [...frames];
      if (needsStart) {
        anchored[0] = {
          ...firstFrame,
          isMilestone: true,
          milestoneTitle: firstFrame.milestoneTitle || 'Start',
        };
      }
      if (needsComplete) {
        anchored[anchored.length - 1] = {
          ...lastFrame,
          isMilestone: true,
          milestoneTitle: lastFrame.milestoneTitle || 'Complete',
        };
      }
      return anchored;
    },
  };
}
