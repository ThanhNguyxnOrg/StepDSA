import { describe, it, expect } from 'vitest';
import { formatCompactBigO } from '../components/dashboard/DashboardView';
import { allModules } from '../modules/registry';

describe('formatCompactBigO', () => {
  it('cleans descriptive text from time and space complexities', () => {
    expect(formatCompactBigO('O(N!) with state pruning')).toBe('O(N!)');
    expect(formatCompactBigO('O(1) with two running variables (or O(N) for DP table)')).toBe('O(1)');
    expect(formatCompactBigO('O(N) for board configuration and recursion stack')).toBe('O(N)');
    expect(formatCompactBigO('O(1) (running variables) or O(N) for DP table')).toBe('O(1)');
    expect(formatCompactBigO('O(V + E) with Adjacency List')).toBe('O(V + E)');
    expect(formatCompactBigO('O(1)')).toBe('O(1)');
    expect(formatCompactBigO('O(N)')).toBe('O(N)');
    expect(formatCompactBigO('')).toBe('O(1)');
    expect(formatCompactBigO(undefined)).toBe('O(1)');
  });

  it('formats every registered module time and space complexity cleanly without overflow', () => {
    for (const mod of allModules) {
      const compactTime = formatCompactBigO(mod.complexity.timeAverage);
      const compactSpace = formatCompactBigO(mod.complexity.spaceAuxiliary);

      expect(typeof compactTime).toBe('string');
      expect(typeof compactSpace).toBe('string');
      expect(compactTime.length).toBeGreaterThan(0);
      expect(compactSpace.length).toBeGreaterThan(0);
      // Ensure no multi-line newlines exist in compact format
      expect(compactTime).not.toContain('\n');
      expect(compactSpace).not.toContain('\n');
      // Ensure it stays compact
      expect(compactTime.length).toBeLessThanOrEqual(20);
      expect(compactSpace.length).toBeLessThanOrEqual(20);
    }
  });
});
