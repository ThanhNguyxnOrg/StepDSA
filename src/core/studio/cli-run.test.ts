import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('stepdsa run', () => {
  it('should trace a .stepdsa file and print the browser URL with #trace=', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stepdsa-run-'));
    const sampleFile = path.join(tmpDir, 'test.stepdsa');
    fs.writeFileSync(sampleFile, `
const arr = [5, 3, 1];
for (let i = 0; i < arr.length; i++) {
  for (let j = 0; j < arr.length - i - 1; j++) {
    if (arr[j] > arr[j + 1]) {
      const temp = arr[j];
      arr[j] = arr[j + 1];
      arr[j + 1] = temp;
    }
  }
}
`, 'utf8');

    try {
      const cliPath = path.resolve('cli/stepdsa.js');
      // Use --no-open to skip browser launch in test
      const output = execSync(
        `node "${cliPath}" run "${sampleFile}" --no-open`,
        { cwd: tmpDir, encoding: 'utf8' }
      );
      expect(output).toContain('ThanhNguyxnOrg.github.io/StepDSA');
      expect(output).toContain('#trace=');
      expect(output).toContain('Trace Completed');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('should support --dev flag to target localhost:5173', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stepdsa-run-dev-'));
    const sampleFile = path.join(tmpDir, 'test.stepdsa');
    fs.writeFileSync(sampleFile, `const arr = [2, 1]; if (arr[0] > arr[1]) { const t = arr[0]; arr[0] = arr[1]; arr[1] = t; }`, 'utf8');

    try {
      const cliPath = path.resolve('cli/stepdsa.js');
      const output = execSync(
        `node "${cliPath}" run "${sampleFile}" --dev --no-open`,
        { cwd: tmpDir, encoding: 'utf8' }
      );
      expect(output).toContain('localhost:5173');
      expect(output).toContain('#trace=');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
