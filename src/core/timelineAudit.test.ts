import { describe, it, expect } from 'vitest';
import { allModules } from '../modules/registry';
import { auditAllModules, formatAuditIssues } from './timelineAudit';

describe('timeline audit', () => {
  it('every registered module has a structurally valid, deterministic default timeline', () => {
    const results = auditAllModules(allModules);
    const errors = results.filter((result) => result.errorCount > 0);

    if (errors.length > 0) {
      throw new Error(
        `Timeline audit found ${errors.length} module(s) with errors:\n${errors
          .map(formatAuditIssues)
          .join('\n')}`
      );
    }

    expect(results).toHaveLength(allModules.length);
    expect(results.every((result) => result.deterministic)).toBe(true);
    // Time-travel navigation contract: every registered timeline exposes at
    // least one milestone jump target (guaranteed by withNavigationAnchors).
    expect(results.every((result) => result.milestoneCount > 0)).toBe(true);
  }, 120_000);

  it('every preset produces a deterministic timeline without structural errors', () => {
    const results = auditAllModules(allModules, true);
    const errors = results.filter((result) => result.errorCount > 0);

    if (errors.length > 0) {
      throw new Error(
        `Preset audit found ${errors.length} timeline(s) with errors:\n${errors
          .map(formatAuditIssues)
          .join('\n')}`
      );
    }

    expect(results.length).toBeGreaterThan(allModules.length);
    expect(results.every((result) => result.deterministic)).toBe(true);
    expect(results.every((result) => result.milestoneCount > 0)).toBe(true);
  }, 180_000);
});
