import { AlgorithmModule, ExecutionFrame, SupportedLanguage } from './types';

export type TimelineIssueCode =
  | 'empty-timeline'
  | 'single-frame'
  | 'index-mismatch'
  | 'total-mismatch'
  | 'missing-explanation'
  | 'invalid-code-line'
  | 'missing-state'
  | 'invalid-pedagogy'
  | 'invalid-checkpoint'
  | 'duplicate-consecutive-frame'
  | 'code-line-out-of-range'
  | 'missing-milestone'
  | 'non-deterministic';

export interface TimelineAuditIssue {
  code: TimelineIssueCode;
  severity: 'error' | 'warning';
  moduleId: string;
  frameIndex?: number;
  message: string;
}

export interface TimelineAuditResult {
  moduleId: string;
  frameCount: number;
  issues: TimelineAuditIssue[];
  errorCount: number;
  warningCount: number;
  milestoneCount: number;
  checkpointCount: number;
  pedagogyFrameCount: number;
  deterministic: boolean;
}

const ALL_LANGUAGES: SupportedLanguage[] = [
  'python',
  'typescript',
  'cpp',
  'java',
  'pseudocode',
];

function safeSerialize(value: unknown): string {
  try {
    return JSON.stringify(value, (_key, val) => {
      if (val instanceof Set) return { __set: Array.from(val) };
      if (val instanceof Map) return { __map: Array.from(val.entries()) };
      return val;
    });
  } catch {
    return '[unserializable]';
  }
}

function maxSnippetLine(module: AlgorithmModule): number {
  return Math.max(
    ...ALL_LANGUAGES.map((lang) => (module.codeSnippets[lang] || '').split('\n').length),
    1
  );
}

function auditFrame(
  module: AlgorithmModule,
  frame: ExecutionFrame,
  index: number,
  expectedTotal: number,
  maxCodeLine: number
): TimelineAuditIssue[] {
  const issues: TimelineAuditIssue[] = [];
  const base = { moduleId: module.id, frameIndex: index };

  if (!Number.isInteger(frame.stepIndex) || frame.stepIndex !== index) {
    issues.push({
      ...base,
      code: 'index-mismatch',
      severity: 'error',
      message: `stepIndex ${frame.stepIndex} does not match array position ${index}`,
    });
  }

  if (frame.totalSteps !== expectedTotal) {
    issues.push({
      ...base,
      code: 'total-mismatch',
      severity: 'error',
      message: `totalSteps ${frame.totalSteps} does not match timeline length ${expectedTotal}`,
    });
  }

  if (!frame.explanation || !frame.explanation.trim()) {
    issues.push({
      ...base,
      code: 'missing-explanation',
      severity: 'error',
      message: 'frame has an empty explanation',
    });
  }

  if (!Number.isInteger(frame.codeLine) || frame.codeLine < 1) {
    issues.push({
      ...base,
      code: 'invalid-code-line',
      severity: 'error',
      message: `codeLine must be a positive integer, received ${String(frame.codeLine)}`,
    });
  } else if (frame.codeLine > maxCodeLine) {
    issues.push({
      ...base,
      code: 'code-line-out-of-range',
      severity: 'warning',
      message: `codeLine ${frame.codeLine} exceeds the longest snippet (${maxCodeLine} lines); the resolver will map it proportionally`,
    });
  }

  if (frame.state === undefined || frame.state === null) {
    issues.push({
      ...base,
      code: 'missing-state',
      severity: 'error',
      message: 'frame has no visual state',
    });
  }

  if (frame.pedagogy) {
    const { what, why, whatNext } = frame.pedagogy;
    if (!what && !why && !whatNext) {
      issues.push({
        ...base,
        code: 'invalid-pedagogy',
        severity: 'warning',
        message: 'pedagogy object is present but has no non-empty field',
      });
    }
  }

  if (frame.checkpoint) {
    const checkpoint = frame.checkpoint;
    if (!checkpoint.question?.trim()) {
      issues.push({
        ...base,
        code: 'invalid-checkpoint',
        severity: 'error',
        message: 'checkpoint is missing a question',
      });
    }
    if (!Array.isArray(checkpoint.options) || checkpoint.options.length < 2) {
      issues.push({
        ...base,
        code: 'invalid-checkpoint',
        severity: 'error',
        message: 'checkpoint must offer at least two options',
      });
    }
    if (
      !Number.isInteger(checkpoint.correctIndex) ||
      checkpoint.correctIndex < 0 ||
      checkpoint.correctIndex >= (checkpoint.options?.length ?? 0)
    ) {
      issues.push({
        ...base,
        code: 'invalid-checkpoint',
        severity: 'error',
        message: `checkpoint correctIndex ${checkpoint.correctIndex} is outside its options`,
      });
    }
    if (!checkpoint.explanation?.trim()) {
      issues.push({
        ...base,
        code: 'invalid-checkpoint',
        severity: 'error',
        message: 'checkpoint is missing an explanation',
      });
    }
  }

  return issues;
}

/**
 * Structural audit for one deterministic timeline. This intentionally checks
 * invariants that every module can satisfy without knowing algorithm-specific
 * semantics; visual/stage checks live in the test suite.
 */
export function auditTimeline(
  module: AlgorithmModule,
  input: any = module.defaultInput,
  frames?: ExecutionFrame[]
): TimelineAuditResult {
  let timeline: ExecutionFrame[];
  try {
    timeline = frames ?? module.generateTimeline(input);
  } catch (error) {
    return {
      moduleId: module.id,
      frameCount: 0,
      issues: [
        {
          code: 'empty-timeline',
          severity: 'error',
          moduleId: module.id,
          message: `generateTimeline threw: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      errorCount: 1,
      warningCount: 0,
      milestoneCount: 0,
      checkpointCount: 0,
      pedagogyFrameCount: 0,
      deterministic: false,
    };
  }

  const issues: TimelineAuditIssue[] = [];
  if (timeline.length === 0) {
    issues.push({
      code: 'empty-timeline',
      severity: 'error',
      moduleId: module.id,
      message: 'timeline is empty',
    });
  } else if (timeline.length === 1) {
    issues.push({
      code: 'single-frame',
      severity: 'warning',
      moduleId: module.id,
      message: 'timeline contains only one frame, so there is nothing to animate',
    });
  }

  const maxCodeLine = maxSnippetLine(module);
  timeline.forEach((frame, index) =>
    issues.push(...auditFrame(module, frame, index, timeline.length, maxCodeLine))
  );

  // Duplicate consecutive frames are almost always a missed intermediate state.
  for (let i = 1; i < timeline.length; i++) {
    const prev = timeline[i - 1];
    const curr = timeline[i];
    if (
      prev.codeLine === curr.codeLine &&
      prev.explanation === curr.explanation &&
      safeSerialize(prev.state) === safeSerialize(curr.state)
    ) {
      issues.push({
        code: 'duplicate-consecutive-frame',
        severity: 'warning',
        moduleId: module.id,
        frameIndex: i,
        message: 'consecutive frames have identical codeLine, explanation, and state',
      });
    }
  }

  const milestoneCount = timeline.filter((f) => f.isMilestone || f.milestoneTitle).length;
  if (timeline.length > 2 && milestoneCount === 0) {
    issues.push({
      code: 'missing-milestone',
      severity: 'warning',
      moduleId: module.id,
      message: 'timeline has no milestone frames for time-travel navigation',
    });
  }

  // Determinism is part of the product contract: regenerating the same input
  // must produce byte-for-byte identical frame metadata and state.
  let deterministic = true;
  try {
    const second = module.generateTimeline(input);
    if (second.length !== timeline.length) {
      deterministic = false;
    } else {
      for (let i = 0; i < timeline.length; i++) {
        if (
          timeline[i].codeLine !== second[i].codeLine ||
          timeline[i].explanation !== second[i].explanation ||
          safeSerialize(timeline[i].state) !== safeSerialize(second[i].state)
        ) {
          deterministic = false;
          break;
        }
      }
    }
  } catch {
    deterministic = false;
  }
  if (!deterministic) {
    issues.push({
      code: 'non-deterministic',
      severity: 'error',
      moduleId: module.id,
      message: 'regenerating the same input produced a different timeline',
    });
  }

  return {
    moduleId: module.id,
    frameCount: timeline.length,
    issues,
    errorCount: issues.filter((i) => i.severity === 'error').length,
    warningCount: issues.filter((i) => i.severity === 'warning').length,
    milestoneCount,
    checkpointCount: timeline.filter((f) => f.checkpoint).length,
    pedagogyFrameCount: timeline.filter((f) => f.pedagogy).length,
    deterministic,
  };
}

export function auditModuleInputs(
  module: AlgorithmModule,
  includePresets = false
): TimelineAuditResult[] {
  const results = [auditTimeline(module, module.defaultInput)];
  if (includePresets) {
    for (const preset of module.presets ?? []) {
      results.push(auditTimeline(module, preset.data));
    }
  }
  return results;
}

export function auditAllModules(
  modules: AlgorithmModule[],
  includePresets = false
): TimelineAuditResult[] {
  return modules.flatMap((module) => auditModuleInputs(module, includePresets));
}

export function formatAuditIssues(result: TimelineAuditResult): string {
  if (result.issues.length === 0) return `${result.moduleId}: clean`;
  return result.issues
    .map(
      (issue) =>
        `${result.moduleId}${issue.frameIndex !== undefined ? `[frame ${issue.frameIndex}]` : ''}: ${issue.severity} ${issue.code} — ${issue.message}`
    )
    .join('\n');
}
