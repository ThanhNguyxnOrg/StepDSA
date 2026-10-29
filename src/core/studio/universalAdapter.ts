import React from 'react';
import { AlgorithmModule, ExecutionFrame } from '../types';
import { StepDSAParsedFile } from './parser';
import { ClassifiedPattern } from './classifier';
import { ArrayStage } from '../../components/stage/ArrayStage';
import { CallStackStage } from '../../components/developer/CallStackStage';

/**
 * Creates a standard AlgorithmModule from user code parsing, smart pattern classification,
 * and pre-executed frames.
 */
export function createCustomAlgorithmModule(
  parsed: StepDSAParsedFile,
  classified: ClassifiedPattern,
  frames: ExecutionFrame[]
): AlgorithmModule {
  const title = parsed.metadata.title || classified.title || 'Custom Algorithm';
  const category = (parsed.metadata.category as any) || classified.category || 'arrays-pointers';
  const cleanId = `custom-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;

  return {
    id: cleanId,
    title,
    category,
    difficulty: (parsed.metadata.difficulty as any) || 'Intermediate',
    complexity: {
      timeBest: 'O(N)',
      timeAverage: 'O(N log N)',
      timeWorst: 'O(N²)',
      spaceAuxiliary: 'O(N)',
      worstCaseCondition: 'User-defined custom algorithm execution in Personal Code Studio',
    },
    theory: {
      overview: `Custom algorithm "${title}" traced live via StepDSA Personal Code Studio (BYOC).`,
      whyItWorks:
        'Every array read, write, pointer update, dictionary lookup, and recursive stack frame is captured deterministically into an immutable ExecutionFrame[] timeline.',
      invariant:
        'State transitions are indexed per discrete step so you can scrub backward and forward in O(1) time.',
      pitfalls: [
        'Watch for off-by-one boundary indices in loops and recursion base cases.',
        'Infinite recursion or unbounded loops are automatically capped by the sandbox step guard.',
      ],
    },
    codeSnippets: {
      python: parsed.code,
      typescript: parsed.code,
      cpp: parsed.code,
      java: parsed.code,
      pseudocode: parsed.code,
    },
    presets: [
      {
        id: 'default',
        label: 'Studio Testcase Input',
        description: 'Input defined in Personal Code Studio or .stepdsa frontmatter',
        data: parsed.metadata.input ?? classified.defaultInput,
      },
    ],
    defaultInput: parsed.metadata.input ?? classified.defaultInput,
    generateTimeline: () => frames,
    renderStage: (frame: ExecutionFrame, projection: '2d' | 'isometric') => {
      // Dynamic rendering: If state has array, render ArrayStage + compact variable/map strip
      if (frame.state && Array.isArray(frame.state.array) && frame.state.array.length > 0) {
        const vars = frame.variables || frame.state.variables || {};
        const dictKeys = Object.entries(vars).filter(
          ([, v]) => v !== null && typeof v === 'object' && !Array.isArray(v)
        );

        return React.createElement(
          'div',
          { className: 'w-full flex-1 flex flex-col items-center justify-center gap-3' },
          React.createElement(ArrayStage, {
            state: frame.state,
            projection,
            conditionEval: frame.conditionEval,
            action: frame.action,
          }),
          dictKeys.length > 0 &&
            React.createElement(
              'div',
              {
                className:
                  'w-full max-w-3xl px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center gap-2 font-mono text-xs',
              },
              dictKeys.map(([mapName, mapObj]) =>
                React.createElement(
                  'div',
                  { key: mapName, className: 'flex flex-wrap items-center gap-1.5' },
                  React.createElement(
                    'span',
                    { className: 'text-purple-400 font-bold' },
                    `${mapName}:`
                  ),
                  Object.keys(mapObj as Record<string, any>).length === 0
                    ? React.createElement('span', { className: 'text-slate-500 italic' }, '{}')
                    : Object.entries(mapObj as Record<string, any>).map(([k, v]) =>
                        React.createElement(
                          'span',
                          {
                            key: k,
                            className:
                              'px-2 py-0.5 rounded bg-purple-950/50 border border-purple-500/30 text-purple-200 text-[11px]',
                          },
                          `${k} → ${JSON.stringify(v)}`
                        )
                      )
                )
              )
            )
        );
      }

      // If callStack or callStackDepth is present, render CallStackStage
      if (
        (frame.callStack && frame.callStack.length > 0) ||
        (frame.state && typeof frame.state.callStackDepth === 'number')
      ) {
        return React.createElement(CallStackStage, { frame });
      }

      // Fallback inspector for arbitrary state objects
      return React.createElement(
        'div',
        {
          className:
            'flex flex-col items-center justify-center p-6 w-full h-full min-h-[300px] text-slate-400 font-mono text-xs gap-3',
        },
        React.createElement(
          'div',
          {
            className:
              'p-4 rounded-xl bg-slate-900/80 border border-slate-800 max-w-lg w-full space-y-2',
          },
          React.createElement('div', { className: 'text-amber-400 font-bold' }, `Step: ${frame.explanation}`),
          React.createElement(
            'pre',
            { className: 'text-slate-300 text-[11px] overflow-x-auto p-2 bg-slate-950 rounded' },
            JSON.stringify(frame.state, null, 2)
          )
        )
      );
    },
  };
}

/**
 * Adapts a CLI-generated JSON trace file into a playable AlgorithmModule.
 */
export function adaptTraceSnapshotToModule(snapshotJson: string): AlgorithmModule {
  const parsed = JSON.parse(snapshotJson);
  const meta = parsed.meta || parsed.metadata || {};
  const frames: ExecutionFrame[] = parsed.frames || parsed.steps || [];

  const title = meta.title || meta.algorithm || meta.sourceFile || 'CLI Trace Snapshot';
  const language = meta.language || 'typescript';

  const dummyParsedFile: StepDSAParsedFile = {
    metadata: {
      title,
      language,
    },
    code:
      parsed.sourceCode ||
      meta.sourceCode ||
      `// Traced via StepDSA CLI\n// Algorithm: ${title}`,
    rawContent: snapshotJson,
  };

  const dummyClassified: ClassifiedPattern = {
    title,
    category: meta.category || 'sorting',
    stageHint: 'array',
    defaultInput: [],
    confidence: 'high',
  };

  return createCustomAlgorithmModule(dummyParsedFile, dummyClassified, frames);
}
