import { AlgorithmCategory } from '../types';

export interface ClassifiedPattern {
  title: string;
  category: AlgorithmCategory;
  stageHint: 'array' | 'stack' | 'tree' | 'graph';
  defaultInput: any;
  confidence: 'high' | 'medium' | 'fallback';
}

/**
 * Converts camelCase, snake_case, or kebab-case into clean Title Case.
 */
export function formatToTitleCase(str: string): string {
  if (!str) return '';
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2') // camelCase -> camel Case
    .replace(/[_-]+/g, ' ')                  // snake_case/kebab-case -> space
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Intelligently classifies custom user code or LeetCode snippets
 * to identify algorithm title, category, stage hint, and default testcases.
 */
export function classifyAlgorithmPattern(code: string, explicitTitle?: string): ClassifiedPattern {
  // 1. If explicit title provided in frontmatter, honor it directly
  if (explicitTitle && explicitTitle.trim()) {
    return {
      title: explicitTitle.trim(),
      category: 'arrays-pointers',
      stageHint: 'array',
      defaultInput: [10, 20, 30, 40],
      confidence: 'high',
    };
  }

  const clean = code.toLowerCase();

  // Pattern A: Stack / Bracket Matching (LeetCode #20 Valid Parentheses, etc.)
  const isBracketMatching =
    (clean.includes('bracket') || clean.includes('isvalid')) &&
    (clean.includes('stack') || clean.includes('st[') || clean.includes('top') || clean.includes('push')) &&
    (clean.includes('(') || clean.includes('{') || clean.includes('['));

  if (isBracketMatching) {
    return {
      title: 'Valid Parentheses (Stack)',
      category: 'stack-queue',
      stageHint: 'stack',
      defaultInput: '()[]{}',
      confidence: 'high',
    };
  }

  // Pattern B: Binary Search
  const isBinarySearch =
    (clean.includes('binary') || clean.includes('search') || clean.includes('bisect')) ||
    (clean.includes('low') && clean.includes('high') && (clean.includes('mid') || clean.includes('/ 2')));

  if (isBinarySearch && (clean.includes('mid') || clean.includes('low <= high') || clean.includes('low < high'))) {
    return {
      title: 'Binary Search',
      category: 'searching',
      stageHint: 'array',
      defaultInput: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19],
      confidence: 'high',
    };
  }

  // Pattern C: Bubble Sort / Adjacent Swapping
  const isBubbleSort =
    clean.includes('bubblesort') ||
    ((clean.includes('- i - 1') || clean.includes('- 1 - i')) && (clean.includes('j + 1') || clean.includes('swap')));

  if (isBubbleSort) {
    return {
      title: 'Bubble Sort',
      category: 'sorting',
      stageHint: 'array',
      defaultInput: [64, 34, 25, 12, 22, 11, 90],
      confidence: 'high',
    };
  }

  // Pattern D: Two Pointers
  const isTwoPointers =
    (clean.includes('twosum') || clean.includes('two_sum') || clean.includes('pointers')) ||
    ((clean.includes('left') || clean.includes('l')) && (clean.includes('right') || clean.includes('r')) && clean.includes('<'));

  if (isTwoPointers && (clean.includes('left') && clean.includes('right'))) {
    return {
      title: 'Two Pointers',
      category: 'arrays-pointers',
      stageHint: 'array',
      defaultInput: [2, 7, 11, 15],
      confidence: 'high',
    };
  }

  // Pattern E: Function name fallback (only match genuine function declarations, not random variables)
  const fnMatch = code.match(/(?:function\s+|def\s+)([a-zA-Z0-9_]+)/) ||
                  code.match(/(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*(?:function|\([^)]*\)\s*=>)/);
  if (fnMatch && fnMatch[1]) {
    const rawName = fnMatch[1];
    // Ignore common generic boilerplate names like 'Solution', 'solve', 'run'
    if (!['solution', 'solve', 'main', 'run', 'test'].includes(rawName.toLowerCase())) {
      return {
        title: formatToTitleCase(rawName),
        category: 'arrays-pointers',
        stageHint: 'array',
        defaultInput: [10, 20, 30, 40, 50],
        confidence: 'medium',
      };
    }
  }

  // Fallback
  return {
    title: 'Custom Algorithm',
    category: 'arrays-pointers',
    stageHint: 'array',
    defaultInput: [5, 2, 8, 1, 9],
    confidence: 'fallback',
  };
}
