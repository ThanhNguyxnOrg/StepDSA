import { describe, it, expect } from 'vitest';
import {
  resolveTreeNodesOverlap,
  computeHeapLayout,
  groupPointersByIndex,
} from './stageLayout';
import { calculateArcHeight, calculateArcPath } from '../components/stage/ComparisonArc';
import { formatActiveExpression } from '../components/stage/ActiveExpressionCallout';
import { resolveActiveCodeLine } from './codeLineResolver';
import { detectPlatformOS, getPlatformShortcutLabels } from './platformShortcuts';
import { allModules } from '../modules/registry';

describe('stageLayout', () => {
  it('resolveTreeNodesOverlap enforces minimum horizontal gap on colliding sibling nodes', () => {
    const collidingNodes = [
      { id: 'root', value: 50, x: 280, y: 50, status: 'default' as const, leftId: 'n1', rightId: 'n2' },
      { id: 'n1', value: 25, x: 265, y: 110, status: 'default' as const, leftId: 'n3', rightId: 'n4' },
      { id: 'n2', value: 75, x: 275, y: 110, status: 'default' as const },
      { id: 'n3', value: 12, x: 260, y: 170, status: 'default' as const },
      { id: 'n4', value: 37, x: 268, y: 170, status: 'comparing' as const },
    ];

    const layout = resolveTreeNodesOverlap(collidingNodes, 56, 560, 68);
    expect(layout.nodes.length).toBe(5);

    const depth1 = layout.nodes.filter((n) => n.depth === 1).sort((a, b) => a.x - b.x);
    expect(depth1.length).toBe(2);
    expect(depth1[1].x - depth1[0].x).toBeGreaterThanOrEqual(56);

    const depth2 = layout.nodes.filter((n) => n.depth === 2).sort((a, b) => a.x - b.x);
    expect(depth2.length).toBe(2);
    expect(depth2[1].x - depth2[0].x).toBeGreaterThanOrEqual(56);
  });

  it('resolveTreeNodesOverlap handles deep skewed tree without clipping canvas height', () => {
    const skewed = [
      { id: '1', value: 10, x: 280, y: 50, status: 'default' as const, rightId: '2' },
      { id: '2', value: 20, x: 400, y: 110, status: 'default' as const, rightId: '3' },
      { id: '3', value: 30, x: 460, y: 170, status: 'default' as const, rightId: '4' },
      { id: '4', value: 40, x: 490, y: 230, status: 'default' as const, rightId: '5' },
      { id: '5', value: 50, x: 505, y: 290, status: 'default' as const, rightId: '6' },
      { id: '6', value: 60, x: 512, y: 350, status: 'sorted' as const },
    ];

    const layout = resolveTreeNodesOverlap(skewed, 56, 560, 68);
    const deepest = layout.nodes.find((n) => n.id === '6')!;
    expect(deepest.depth).toBe(5);
    expect(layout.height).toBeGreaterThan(deepest.y + 40);
  });

  it('computeHeapLayout generates valid coordinates for heaps larger than 7 elements', () => {
    const heap14 = computeHeapLayout(14, 52, 62);
    expect(heap14.coords.length).toBe(14);

    for (const c of heap14.coords) {
      expect(c.x).toBeGreaterThan(0);
      expect(c.x).toBeLessThan(heap14.width);
      expect(c.y).toBeGreaterThan(0);
      expect(c.y).toBeLessThan(heap14.height);
    }

    const level3 = heap14.coords.slice(7);
    for (let i = 1; i < level3.length; i++) {
      expect(level3[i].x - level3[i - 1].x).toBeGreaterThanOrEqual(40);
    }
  });

  it('groupPointersByIndex classifies and stacks multiple pointers on the same index', () => {
    const grouped = groupPointersByIndex({ low: 0, i: 0, j: 0, pivot: 4, high: 4 });
    expect(grouped[0].length).toBe(3);
    expect(grouped[4].length).toBe(2);
    expect(grouped[4][0].role).toBe('pivot');
    expect(grouped[4][1].role).toBe('right');
  });

  it('ComparisonArc and ActiveExpressionCallout format expressions accurately', () => {
    const h = calculateArcHeight(3);
    expect(h).toBeGreaterThanOrEqual(22);
    expect(h).toBeLessThanOrEqual(45);
    const path = calculateArcPath(100, 300, h);
    expect(path.startsWith('M 100 0 Q 200')).toBe(true);

    const expr = formatActiveExpression(
      [
        { id: 0, value: 64, status: 'comparing' },
        { id: 1, value: 34, status: 'comparing' },
      ],
      undefined,
      'compare'
    );
    expect(expr).toBe('64 vs 34 (→ SWAP)');
  });

  it('resolveActiveCodeLine guarantees in-bounds non-empty active lines across all 162 modules and 5 languages', { timeout: 120_000 }, () => {
    expect(allModules.length).toBeGreaterThanOrEqual(160);
    const langs = ['pseudocode', 'python', 'cpp', 'typescript', 'java'] as const;

    for (const mod of allModules) {
      const timeline = mod.generateTimeline(mod.defaultInput);
      expect(timeline.length).toBeGreaterThan(0);
      for (const lang of langs) {
        const code = mod.codeSnippets[lang];
        const lines = code.split('\n');
        for (const frame of timeline) {
          const resolved = resolveActiveCodeLine(code, frame, timeline);
          expect(resolved).toBeGreaterThanOrEqual(1);
          expect(resolved).toBeLessThanOrEqual(lines.length);
          expect(lines[resolved - 1].trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('All sorting modules produce a strictly sorted final array on their completion frame', () => {
    const sortingMods = allModules.filter((m) => m.category === 'sorting' && m.id !== 'quickselect');
    expect(sortingMods.length).toBeGreaterThanOrEqual(20);

    for (const mod of sortingMods) {
      const timeline = mod.generateTimeline(mod.defaultInput);
      const lastFrame = timeline[timeline.length - 1];
      const arr = lastFrame.state?.array;
      if (Array.isArray(arr) && arr.length > 1) {
        const nums = arr.map((el: any) => (typeof el === 'number' ? el : el.value));
        for (let i = 1; i < nums.length; i++) {
          expect(nums[i]).toBeGreaterThanOrEqual(nums[i - 1]);
        }
      }
    }
  });

  it('detectPlatformOS and getPlatformShortcutLabels return accurate OS-specific shortcuts and catalog', () => {
    expect(detectPlatformOS('MacIntel', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)')).toBe('mac');
    expect(detectPlatformOS('', 'Mozilla/5.0', 'Apple Computer, Inc.')).toBe('mac');
    expect(detectPlatformOS('Win32', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe('windows');
    expect(detectPlatformOS('Linux x86_64', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64)')).toBe('linux');

    const macLabels = getPlatformShortcutLabels('mac', 'auto', 'mac');
    expect(macLabels.quickSearch).toBe('Cmd+K');
    expect(macLabels.nextAction).toBe('Shift+→');
    expect(macLabels.nextMilestone).toBe('Opt+→');
    expect(macLabels.jumpStart).toBe('Cmd+←');
    expect(macLabels.catalog.length).toBeGreaterThanOrEqual(16);

    const winLabels = getPlatformShortcutLabels('windows', 'auto', 'windows');
    expect(winLabels.quickSearch).toBe('Ctrl+K');
    expect(winLabels.nextAction).toBe('Shift+→');
    expect(winLabels.nextMilestone).toBe('Alt+→');
    expect(winLabels.jumpStart).toBe('Home');
  });
});
