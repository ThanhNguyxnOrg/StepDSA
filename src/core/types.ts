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

export interface ExecutionFrame<TState = any> {
  stepIndex: number;
  totalSteps: number;
  codeLine: number;
  explanation: string;
  action?: string;
  callStack?: (CallStackFrame | string)[];
  conditionEval?: {
    expr?: string;
    condition?: string;
    result: any;
  };
  variables?: Record<string, any>;
  scopeVariables?: Record<string, any>;
  codeHighlights?: Record<string, number[]>;
  invariantStatus?: InvariantStatus | string;
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
}
