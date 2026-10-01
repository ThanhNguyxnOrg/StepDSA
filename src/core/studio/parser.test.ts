import { describe, it, expect } from 'vitest';
import { parseStepDSAFile } from './parser';

describe('parser: parseStepDSAFile', () => {
  it('parses standard .stepdsa file with frontmatter and code', () => {
    const content = `---
title: Quick Sort (Lomuto Partition)
language: typescript
category: sorting
input: [45, 12, 89, 34, 21, 70]
stage: array
pointers: ["i", "j", "pivot"]
---
function partition(arr, low, high) {
  return low;
}
`;

    const result = parseStepDSAFile(content);
    expect(result.metadata.title).toBe('Quick Sort (Lomuto Partition)');
    expect(result.metadata.language).toBe('typescript');
    expect(result.metadata.category).toBe('sorting');
    expect(result.metadata.input).toEqual([45, 12, 89, 34, 21, 70]);
    expect(result.metadata.stage).toBe('array');
    expect(result.metadata.pointers).toEqual(['i', 'j', 'pivot']);
    expect(result.code.trim()).toBe(`function partition(arr, low, high) {\n  return low;\n}`);
  });

  it('parses string input and boolean values in frontmatter', () => {
    const content = `---
title: Valid Parentheses
input: "()[]{}"
isOptimal: true
---
function isValid(s) { return true; }`;

    const result = parseStepDSAFile(content);
    expect(result.metadata.title).toBe('Valid Parentheses');
    expect(result.metadata.input).toBe('()[]{}');
    expect(result.code.trim()).toBe('function isValid(s) { return true; }');
  });

  it('gracefully handles raw code without frontmatter', () => {
    const content = `function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {}
}`;

    const result = parseStepDSAFile(content);
    expect(result.metadata).toEqual({});
    expect(result.code.trim()).toBe(content.trim());
  });

  it('handles empty or whitespace-only files', () => {
    const result = parseStepDSAFile('   \n  ');
    expect(result.metadata).toEqual({});
    expect(result.code).toBe('');
  });
});
