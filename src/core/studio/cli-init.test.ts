import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('stepdsa init', () => {
  it('should create solution.stepdsa and README.md in target directory', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stepdsa-init-'));
    try {
      const cliPath = path.resolve('cli/stepdsa.js');
      execSync(`node "${cliPath}" init`, { cwd: tmpDir, env: { ...process.env } });
      expect(fs.existsSync(path.join(tmpDir, 'solution.stepdsa'))).toBe(true);
      expect(fs.existsSync(path.join(tmpDir, 'README.md'))).toBe(true);
      const content = fs.readFileSync(path.join(tmpDir, 'solution.stepdsa'), 'utf8');
      expect(content).toContain('const arr');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('should refuse to overwrite existing solution.stepdsa', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stepdsa-init-'));
    try {
      const cliPath = path.resolve('cli/stepdsa.js');
      fs.writeFileSync(path.join(tmpDir, 'solution.stepdsa'), '// existing user code');
      execSync(`node "${cliPath}" init`, {
        cwd: tmpDir,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      // File should NOT be overwritten
      const content = fs.readFileSync(path.join(tmpDir, 'solution.stepdsa'), 'utf8');
      expect(content).toBe('// existing user code');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
