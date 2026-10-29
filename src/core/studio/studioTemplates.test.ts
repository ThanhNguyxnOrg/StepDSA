import { describe, it, expect } from 'vitest';
import {
  STUDIO_TEMPLATES,
  getTemplatesByLanguage,
  traceCppInBrowser,
} from './studioTemplates';
import { tracePythonFallbackInBrowser } from './pythonRunner';

describe('studioTemplates & in-browser tracers', () => {
  it('provides curated templates for javascript, python, and cpp', () => {
    expect(STUDIO_TEMPLATES.length).toBeGreaterThanOrEqual(10);
    expect(getTemplatesByLanguage('javascript').length).toBeGreaterThanOrEqual(4);
    expect(getTemplatesByLanguage('python').length).toBeGreaterThanOrEqual(3);
    expect(getTemplatesByLanguage('cpp').length).toBeGreaterThanOrEqual(3);
  });

  it('traces C++ Generate Parentheses recursion in browser', () => {
    const cppTpl = getTemplatesByLanguage('cpp')[0];
    const frames = traceCppInBrowser(cppTpl.code, '2');
    expect(frames.length).toBeGreaterThan(5);
    expect(frames.some((f) => f.callStack?.some((s) => String(s).includes('dfs')))).toBe(true);
    const finalFrame = frames[frames.length - 1];
    expect(finalFrame.explanation).toContain('(())');
  });

  it('traces C++ vector Bubble Sort in browser with ArrayStage elements and pointers', () => {
    const cppSort = getTemplatesByLanguage('cpp')[1];
    const frames = traceCppInBrowser(cppSort.code, '[30, 10, 20]');
    expect(frames.length).toBeGreaterThan(4);
    expect(frames.some((f) => f.action === 'swap')).toBe(true);
    const last = frames[frames.length - 1];
    const values = last.state.array.map((el: any) => el.value);
    expect(values).toEqual([10, 20, 30]);
  });

  it('traces C++ Binary Search in browser with left, mid, right pointers', () => {
    const cppBsearch = getTemplatesByLanguage('cpp')[2];
    const frames = traceCppInBrowser(cppBsearch.code, '[-1, 0, 3, 5, 9, 12], 9');
    expect(frames.length).toBeGreaterThan(3);
    expect(frames.some((f) => f.state.pointers?.mid !== undefined)).toBe(true);
    const last = frames[frames.length - 1];
    expect(last.variables?.result).toBe(4);
  });

  it('traces Python fallback templates in browser when CDN is offline', () => {
    const pyTemplates = getTemplatesByLanguage('python');
    const twoSumFrames = tracePythonFallbackInBrowser(pyTemplates[0].code, '[2, 7, 11, 15], 9');
    expect(twoSumFrames.some((f) => f.action === 'FINISH')).toBe(true);

    const sortFrames = tracePythonFallbackInBrowser(pyTemplates[1].code, '[30, 10, 20]');
    expect(sortFrames.some((f) => f.action === 'swap')).toBe(true);

    const climbFrames = tracePythonFallbackInBrowser(pyTemplates[2].code, '4');
    expect(climbFrames.length).toBeGreaterThan(5);
  });
});
