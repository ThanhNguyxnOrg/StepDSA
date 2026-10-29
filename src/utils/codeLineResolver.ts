import { ExecutionFrame } from '../core/types';

/**
 * Resolves the accurate 1-indexed active line number for any target language snippet
 * (`pseudocode`, `python`, `cpp`, `typescript`, `java`), even when a module's
 * `frame.codeLine` was authored against a longer C++/Java snippet or exceeds the
 * selected language's line count.
 *
 * Strategy:
 * 1. If the snippet is empty, return 1.
 * 2. Compute the maximum `codeLine` across the timeline (`maxTimelineCodeLine`).
 * 3. If `frame.codeLine` is within bounds AND `maxTimelineCodeLine <= totalLines`,
 *    use `frame.codeLine` directly (snapping off blank/brace-only lines if needed).
 * 4. Otherwise, try semantic keyword matching between the current frame's explanation/variables
 *    and the lines of the target snippet, anchored around the proportional progress line
 *    so that every step highlights a meaningful, valid line in all 5 languages.
 */
export function resolveActiveCodeLine(
  rawCode: string,
  frame: ExecutionFrame | null | undefined,
  timeline?: ExecutionFrame[]
): number {
  if (!rawCode) return 1;
  const lines = rawCode.split('\n');
  const totalLines = lines.length;
  if (totalLines <= 1) return 1;

  const rawLine = frame?.codeLine ?? 1;

  let maxTimelineLine = rawLine;
  if (timeline && timeline.length > 0) {
    for (let i = 0; i < timeline.length; i++) {
      const cl = timeline[i]?.codeLine ?? 1;
      if (cl > maxTimelineLine) maxTimelineLine = cl;
    }
  }

  const isMeaningfulLine = (idx0: number): boolean => {
    const text = (lines[idx0] || '').trim();
    if (!text) return false;
    // Skip pure closing braces or comment-only lines when snapping
    if (/^[{}();]+$/.test(text)) return false;
    return true;
  };

  const snapToNearestMeaningful = (line1: number): number => {
    const clamped = Math.max(1, Math.min(totalLines, Math.round(line1)));
    const idx0 = clamped - 1;
    if (isMeaningfulLine(idx0)) return clamped;

    for (let offset = 1; offset < totalLines; offset++) {
      if (idx0 - offset >= 0 && isMeaningfulLine(idx0 - offset)) {
        return idx0 - offset + 1;
      }
      if (idx0 + offset < totalLines && isMeaningfulLine(idx0 + offset)) {
        return idx0 + offset + 1;
      }
    }
    return clamped;
  };

  // Case A: The module's timeline line numbers fit cleanly within this language's snippet
  if (maxTimelineLine <= totalLines && rawLine >= 1 && rawLine <= totalLines) {
    return snapToNearestMeaningful(rawLine);
  }

  // Case B: `rawLine` or `maxTimelineLine` exceeds `totalLines` (e.g. Pseudocode or Python is shorter than C++/Java)
  const denom = Math.max(1, maxTimelineLine - 1);
  const ratio = Math.max(0, Math.min(1, (rawLine - 1) / denom));
  const proportionalLine = 1 + Math.round(ratio * (totalLines - 1));

  // Semantic keyword refinement around proportionalLine
  const explanation = (frame?.explanation || '').toLowerCase();
  const action = (frame?.action || '').toLowerCase();

  const candidateKeywords: string[] = [];
  if (action === 'swap' || explanation.includes('swap')) {
    candidateKeywords.push('swap', 'temp');
  }
  if (
    action === 'Complete' ||
    explanation.includes('sorted!') ||
    explanation.includes('complete') ||
    explanation.includes('return ') ||
    explanation.includes('found')
  ) {
    candidateKeywords.push('return');
  }
  if (explanation.includes('while ')) {
    candidateKeywords.push('while');
  }
  if (explanation.includes('for ')) {
    candidateKeywords.push('for');
  }
  if (explanation.includes('compare') || explanation.includes('if ') || frame?.conditionEval) {
    candidateKeywords.push('if');
  }

  if (candidateKeywords.length > 0) {
    let bestLine = -1;
    let bestDist = Infinity;
    for (let i = 0; i < totalLines; i++) {
      const lineLower = lines[i].toLowerCase();
      if (!isMeaningfulLine(i)) continue;
      if (candidateKeywords.some((kw) => lineLower.includes(kw))) {
        const dist = Math.abs(i + 1 - proportionalLine);
        if (dist < bestDist) {
          bestDist = dist;
          bestLine = i + 1;
        }
      }
    }
    if (bestLine !== -1 && bestDist <= Math.max(4, Math.ceil(totalLines * 0.45))) {
      return bestLine;
    }
  }

  return snapToNearestMeaningful(proportionalLine);
}
