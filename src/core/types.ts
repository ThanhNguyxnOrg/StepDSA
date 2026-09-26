import React from 'react';

export type AlgorithmCategory =
  | 'sorting'
  | 'searching'
  | 'arrays-pointers'
  | 'linked-lists'
  | 'trees-bst'
  | 'graphs'
  | 'dynamic-programming';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type ElementStatus =
  | 'default'
  | 'comparing'
  | 'swapping'
  | 'active'
  | 'sorted'
  | 'discarded'
  | 'pivot';

export interface ComplexityProfile {
  timeBest: string;
  timeAverage: string;
  timeWorst: string;
  spaceAuxiliary: string;
  worstCaseCondition: string;
}

export interface InvariantStatus {
  label: string;
  isValid: boolean;
}

export interface ExecutionFrame<TState = any> {
  stepIndex: number;
  totalSteps: number;
  codeLine: number;
  explanation: string;
  invariantStatus?: InvariantStatus;
  isMilestone?: boolean;
  milestoneTitle?: string;
  soundCue?: {
    frequency?: number;
    type: 'compare' | 'swap' | 'sorted' | 'pivot' | 'discard';
  };
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
  seekTo: (step: number) => void;
  setSpeed: (multiplier: number) => void;
  reset: () => void;
}
