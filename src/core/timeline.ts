import { useState, useEffect, useRef, useCallback } from 'react';
import { ExecutionFrame, PlaybackController } from './types';

/**
 * Calculates adaptive delay for smart auto-pacing.
 * Decelerates decisive milestones and swaps; accelerates repetitive scanning loops.
 */
export function calculateAdaptiveDelay(
  frame: ExecutionFrame | null,
  baseDelayMs: number,
  isAutoPacing: boolean
): number {
  if (!isAutoPacing || !frame) return baseDelayMs;

  const isDecisive =
    (typeof frame.action === 'string' && frame.action.toLowerCase().includes('swap')) ||
    frame.soundCue === 'swap' ||
    (typeof frame.soundCue === 'object' && frame.soundCue?.type === 'swap') ||
    Boolean(frame.isMilestone) ||
    frame.milestoneTitle !== undefined;

  // Decisive events decelerate (+50% delay + 150ms buffer)
  if (isDecisive) {
    return Math.round(baseDelayMs * 1.5 + 150);
  }

  // Fast forward repetitive scans
  return Math.max(60, Math.round(baseDelayMs * 0.7));
}

/**
 * Normalizes an array of raw execution frames, guaranteeing 0-based indices and totalSteps count.
 */
export function normalizeTimeline<TState>(rawFrames: Omit<ExecutionFrame<TState>, 'stepIndex' | 'totalSteps'>[]): ExecutionFrame<TState>[] {
  const totalSteps = rawFrames.length;
  if (totalSteps === 0) {
    return [
      {
        stepIndex: 0,
        totalSteps: 1,
        codeLine: 1,
        explanation: 'Initial state (empty timeline)',
        state: {} as TState,
      },
    ];
  }

  return rawFrames.map((frame, index) => ({
    ...frame,
    stepIndex: index,
    totalSteps,
  }));
}

/**
 * React hook to manage deterministic timeline playback.
 * Guaranteed 0ms latency for scrubbing and stepping back.
 */
export function useTimelinePlayback(frames: ExecutionFrame[]): PlaybackController {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1); // 0.25, 0.5, 1, 1.5, 2
  const [isAutoPacing, setIsAutoPacing] = useState<boolean>(true); // Smart Auto-Pacing on by default
  const timerRef = useRef<number | null>(null);

  const totalSteps = frames.length;
  const currentFrame = frames[currentStep] || frames[0] || null;

  // Reset to step 0 when frames timeline changes
  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, [frames]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const play = useCallback(() => {
    if (currentStep >= totalSteps - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
  }, [currentStep, totalSteps]);

  const stepForward = useCallback(() => {
    pause();
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [pause, totalSteps]);

  const stepBackward = useCallback(() => {
    pause();
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, [pause]);

  const stepToNextAction = useCallback(() => {
    pause();
    for (let i = currentStep + 1; i < totalSteps; i++) {
      const f = frames[i];
      if (f.soundCue || f.isMilestone || f.milestoneTitle || f.invariantStatus || i === totalSteps - 1) {
        setCurrentStep(i);
        return;
      }
    }
    setCurrentStep(totalSteps - 1);
  }, [currentStep, totalSteps, frames, pause]);

  const stepToPrevAction = useCallback(() => {
    pause();
    for (let i = currentStep - 1; i >= 0; i--) {
      const f = frames[i];
      if (f.soundCue || f.isMilestone || f.milestoneTitle || f.invariantStatus || i === 0) {
        setCurrentStep(i);
        return;
      }
    }
    setCurrentStep(0);
  }, [currentStep, frames, pause]);

  const seekTo = useCallback((step: number) => {
    pause();
    const clamped = Math.max(0, Math.min(step, totalSteps - 1));
    setCurrentStep(clamped);
  }, [pause, totalSteps]);

  const reset = useCallback(() => {
    pause();
    setCurrentStep(0);
  }, [pause]);

  const toggleAutoPacing = useCallback(() => {
    setIsAutoPacing((prev) => !prev);
  }, []);

  // Playback timer loop with smart auto-pacing
  useEffect(() => {
    if (!isPlaying) return;

    if (currentStep >= totalSteps - 1) {
      setIsPlaying(false);
      return;
    }

    const baseDelayMs = Math.max(80, Math.round(600 / speed));
    const delay = calculateAdaptiveDelay(currentFrame, baseDelayMs, isAutoPacing);

    timerRef.current = window.setTimeout(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next >= totalSteps - 1) {
          setIsPlaying(false);
        }
        return Math.min(next, totalSteps - 1);
      });
    }, delay);

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying, currentStep, totalSteps, speed, currentFrame, isAutoPacing]);

  return {
    currentStep,
    totalSteps,
    currentFrame,
    isPlaying,
    speed,
    play,
    pause,
    stepForward,
    stepBackward,
    stepToNextAction,
    stepToPrevAction,
    seekTo,
    setSpeed,
    reset,
    isAutoPacing,
    toggleAutoPacing,
  };
}
