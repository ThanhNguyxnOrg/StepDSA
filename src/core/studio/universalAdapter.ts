import React from 'react';
import { AlgorithmModule, ExecutionFrame } from '../types';
import { StepDSAParsedFile } from './parser';
import { ClassifiedPattern } from './classifier';
import { ArrayStage } from '../../components/stage/ArrayStage';

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
  const language = (parsed.metadata.language || 'typescript').toLowerCase();

  return {
    id: cleanId,
    title,
    category,
    difficulty: (parsed.metadata.difficulty as any) || 'Intermediate',
    complexity: {
      timeBest: 'O(?)',
      timeAverage: 'O(?)',
      timeWorst: 'O(?)',
      spaceAuxiliary: 'O(?)',
      worstCaseCondition: 'User-defined custom algorithm execution',
    },
    theory: {
      overview: `Custom algorithm "${title}" traced live via StepDSA Personal Code Studio (BYOC).`,
      whyItWorks: 'Visualized through client-side state tracing with time-travel debugger playback.',
      invariant: 'Memory mutations captured per discrete step.',
      pitfalls: ['Watch for unhandled array bounds or runaway loops.'],
    },
    codeSnippets: {
      python: language === 'python' ? parsed.code : `# ${title}\n${parsed.code}`,
      typescript: language === 'typescript' || language === 'javascript' ? parsed.code : `// ${title}\n${parsed.code}`,
      cpp: language === 'cpp' ? parsed.code : `// ${title}\n${parsed.code}`,
      java: language === 'java' ? parsed.code : `// ${title}\n${parsed.code}`,
      pseudocode: parsed.code,
    },
    presets: [
      {
        id: 'default',
        label: 'Default Input',
        description: 'Input defined in .stepdsa frontmatter',
        data: parsed.metadata.input ?? classified.defaultInput,
      },
    ],
    defaultInput: parsed.metadata.input ?? classified.defaultInput,
    generateTimeline: () => frames,
    renderStage: (frame: ExecutionFrame, projection: '2d' | 'isometric') => {
      // Dynamic rendering: If state has array, render ArrayStage
      if (frame.state && Array.isArray(frame.state.array)) {
        return React.createElement(ArrayStage, {
          state: frame.state,
          projection,
        });
      }

      // Fallback inspector for arbitrary state objects
      return React.createElement(
        'div',
        {
          className: 'flex flex-col items-center justify-center p-6 w-full h-full min-h-[300px] text-slate-400 font-mono text-xs gap-3',
        },
        React.createElement(
          'div',
          { className: 'p-4 rounded-xl bg-slate-900/80 border border-slate-800 max-w-lg w-full space-y-2' },
          React.createElement('div', { className: 'text-amber-400 font-bold' }, `Step: ${frame.explanation}`),
          React.createElement('pre', { className: 'text-slate-300 text-[11px] overflow-x-auto p-2 bg-slate-950 rounded' },
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
    code: parsed.sourceCode || meta.sourceCode || `// Traced via StepDSA CLI\n// Algorithm: ${title}`,
    rawContent: snapshotJson,
  };

  const dummyClassified: ClassifiedPattern = {
    title,
    category: 'sorting',
    stageHint: 'array',
    defaultInput: [],
    confidence: 'high',
  };

  return createCustomAlgorithmModule(dummyParsedFile, dummyClassified, frames);
}
