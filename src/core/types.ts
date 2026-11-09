import React from 'react';

export type AlgorithmCategory =
  | 'sorting'
  | 'searching'
  | 'arrays-pointers'
  | 'linked-lists'
  | 'trees-bst'
  | 'graphs'
  | 'dynamic-programming'
  | 'math'
  | 'stack-queue';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type ElementStatus =
  | 'default'
  | 'comparing'
  | 'swapping'
  | 'active'
  | 'sorted'
  | 'discarded'
  | 'pivot'
  | 'selected';

export interface ComplexityProfile {
  timeBest: string;
  timeAverage: string;
  timeWorst: string;
  spaceAuxiliary: string;
  worstCaseCondition: string;
}

export interface CallStackFrame {
  id?: string;
  name: string;
  params: Record<string, any>;
  line?: number;
  file?: string;
  isCurrent?: boolean;
}

export interface InvariantStatus {
  label: string;
  isValid: boolean;
}

/**
 * Optional, algorithm-authored teaching context for a single frame.
 * Modules should fill these in with concrete values from the current state
 * instead of relying on generic keyword matching in the UI.
 */
export interface StepPedagogy {
  /** What just happened, in one precise sentence. */
  what?: string;
  /** Why this operation is correct / necessary at this point. */
  why?: string;
  /** What the learner should watch for on the next step. */
  whatNext?: string;
}

/**
 * Optional prediction checkpoint shown before the learner advances.
 * The answer is deliberately part of the deterministic frame data so tests
 * can verify that every checkpoint is answerable from the current state.
 */
export interface PredictionCheckpoint {
  id?: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint?: string;
}

export type SoundCueType =
  | 'compare'
  | 'swap'
  | 'sorted'
  | 'pivot'
  | 'discard'
  | 'step'
  | 'start'
  | 'success'
  | 'complete'
  | 'pop'
  | 'fail'
  | 'finish'
  | 'select'
  | 'insert';

export interface SoundCueObj {
  frequency?: number;
  type: SoundCueType;
}

export type SoundCue = SoundCueType | SoundCueObj;

export interface OperationalMetrics {
  comparisons: number;
  swaps: number;
  accesses: number;
  lookups: number;
}

export interface ExecutionFrame<TState = any> {
  stepIndex: number;
  totalSteps: number;
  codeLine: number;
  explanation: string;
  subtitle?: string;
  action?: string;
  callStack?: (CallStackFrame | string)[];
  conditionEval?: {
    expr?: string;
    condition?: string;
    result: any;
    formatted?: string;
  };
  metrics?: Partial<OperationalMetrics>;
  variables?: Record<string, any>;
  scopeVariables?: Record<string, any>;
  codeHighlights?: Record<string, number[]>;
  invariantStatus?: InvariantStatus | string;
  invariantNote?: string;
  pedagogy?: StepPedagogy;
  checkpoint?: PredictionCheckpoint;
  isMilestone?: boolean;
  milestoneTitle?: string;
  soundCue?: SoundCue;
  state: TState;
}

export interface InputPreset<TInput> {
  id: string;
  label: string;
  description: string;
  data: TInput;
}

export interface TheoryContent {
  overview: string;
  whyItWorks: string;
  invariant: string;
  pitfalls: string[];
  steps?: string[];
  watchOut?: string[];
}

export type SupportedLanguage = 'python' | 'typescript' | 'cpp' | 'java' | 'pseudocode';

export interface AlgorithmModule<TInput = any, TState = any> {
  id: string;
  title: string;
  category: AlgorithmCategory;
  difficulty: Difficulty;
  complexity: ComplexityProfile;
  theory: TheoryContent;
  codeSnippets: Record<SupportedLanguage, string>;
  presets: InputPreset<TInput>[];
  defaultInput: TInput;
  generateTimeline: (input: TInput) => ExecutionFrame<TState>[];
  renderStage: (frame: ExecutionFrame<TState>, projection: '2d' | 'isometric') => React.ReactNode;
}

export interface PlaybackController {
  currentStep: number;
  totalSteps: number;
  currentFrame: ExecutionFrame<any> | null;
  isPlaying: boolean;
  speed: number;
  play: () => void;
  pause: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  stepToNextAction?: () => void;
  stepToPrevAction?: () => void;
  seekTo: (step: number) => void;
  setSpeed: (multiplier: number) => void;
  reset: () => void;
  isAutoPacing?: boolean;
  toggleAutoPacing?: () => void;
}
