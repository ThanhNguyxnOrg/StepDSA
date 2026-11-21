import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const cli = path.resolve('cli/stepdsa.js');

describe('CLI trace output', () => {
  let dir: string;

  beforeEach(() => { dir = fs.mkdtempSync(path.join(os.tmpdir(), 'stepdsa-trace-')); });
  afterEach(() => { fs.rmSync(dir, { recursive: true, force: true }); });

  const invoke = (...args: string[]) => spawnSync(process.execPath, [cli, ...args], { cwd: dir, encoding: 'utf8' });

  it.each(['trace', 'run'])('%s rejects Python instead of inventing sorting steps', (command) => {
    fs.writeFileSync(path.join(dir, 'sum.py'), 'nums = [3, 1, 2]\nprint(sum(nums))\n');
    const result = invoke(command, 'sum.py', '--no-open', '--verbose');
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Python tracing is not supported');
    expect(result.stdout).not.toMatch(/Step #|Trace Completed|#trace=/);
    expect(fs.existsSync(path.join(dir, 'sum.stepdsa.json'))).toBe(false);
  });

  it('does not save partial frames when execution fails after a write', () => {
    fs.writeFileSync(path.join(dir, 'partial.js'), 'const arr = [3, 1, 2]; arr[0] = 9; throw new Error("stop");');
    const result = invoke('trace', 'partial.js');
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Unsupported trace');
    expect(fs.existsSync(path.join(dir, 'partial.stepdsa.json'))).toBe(false);
  });

  it('saves the actual array writes for supported code', () => {
    fs.writeFileSync(path.join(dir, 'write.js'), 'const arr = [3, 1, 2]; arr[0] = 9;');
    const result = invoke('trace', 'write.js', '--out', 'trace.json');
    expect(result.status).toBe(0);
    const { frames } = JSON.parse(fs.readFileSync(path.join(dir, 'trace.json'), 'utf8'));
    expect(frames.at(-1).state.array.map((el: { value: number }) => el.value)).toEqual([9, 1, 2]);
  });
});
