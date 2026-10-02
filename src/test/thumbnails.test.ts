import { describe, it, expect } from 'vitest';
import { allModules } from '../modules/registry';
import { renderExtraThumbnail } from '../components/dashboard/dynamicThumbnails';
import fs from 'fs';
import path from 'path';

describe('Algorithm Card Thumbnails Uniqueness & Coverage', () => {
  const origFile = fs.readFileSync(path.resolve(__dirname, '../components/dashboard/AlgorithmCardThumbnail.tsx'), 'utf-8');

  // Extract all cases handled in AlgorithmCardThumbnail.tsx
  const caseRegex = /case '([^']+)':/g;
  const switchCases = new Set<string>();
  let match;
  while ((match = caseRegex.exec(origFile)) !== null) {
    switchCases.add(match[1]);
  }

  it('provides a bespoke dynamic thumbnail for all 162 registered algorithms', () => {
    const unhandledModules: string[] = [];

    for (const mod of allModules) {
      const inExtra = renderExtraThumbnail(mod.id, mod.category) !== null;
      const inSwitch = switchCases.has(mod.id);

      if (!inExtra && !inSwitch) {
        unhandledModules.push(mod.id);
      }
    }

    expect(unhandledModules).toEqual([]);
  });

  it('guarantees every module has a distinct non-empty ID and title', () => {
    const ids = new Set<string>();
    for (const mod of allModules) {
      expect(ids.has(mod.id)).toBe(false);
      ids.add(mod.id);
      expect(mod.title.length).toBeGreaterThan(0);
    }
  });
});
