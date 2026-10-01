// Runtime audit: import each module and count actual timeline steps
// Run with: npx tsx scripts/runtime-audit.ts

import { allModules } from '../src/modules/registry';

interface AuditResult {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  presetCount: number;
  defaultSteps: number;
  minSteps: number;
  maxSteps: number;
  hasCallStack: boolean;
  hasVariables: boolean;
  hasSoundCue: boolean;
  hasConditionEval: boolean;
  hasMilestones: boolean;
  codeSnippetLangs: string[];
  error?: string;
}

const results: AuditResult[] = [];
const issues: { id: string; issue: string }[] = [];

for (const mod of allModules) {
  try {
    // Generate timeline with default input
    const timeline = mod.generateTimeline(mod.defaultInput);
    
    // Generate with all presets
    let minSteps = timeline.length;
    let maxSteps = timeline.length;
    
    for (const preset of mod.presets) {
      try {
        const presetTimeline = mod.generateTimeline(preset.data);
        minSteps = Math.min(minSteps, presetTimeline.length);
        maxSteps = Math.max(maxSteps, presetTimeline.length);
      } catch { /* skip broken presets */ }
    }
    
    // Check frame quality
    const hasCallStack = timeline.some(f => f.callStack && f.callStack.length > 0);
    const hasVariables = timeline.some(f => f.variables && Object.keys(f.variables).length > 0);
    const hasSoundCue = timeline.some(f => f.soundCue !== undefined);
    const hasConditionEval = timeline.some(f => f.conditionEval !== undefined);
    const hasMilestones = timeline.some(f => f.isMilestone === true);
    
    const result: AuditResult = {
      id: mod.id,
      title: mod.title,
      category: mod.category,
      difficulty: mod.difficulty,
      presetCount: mod.presets.length,
      defaultSteps: timeline.length,
      minSteps,
      maxSteps,
      hasCallStack,
      hasVariables,
      hasSoundCue,
      hasConditionEval,
      hasMilestones,
      codeSnippetLangs: Object.keys(mod.codeSnippets),
    };
    
    results.push(result);
    
    // Flag issues
    if (timeline.length < 5) {
      issues.push({ id: mod.id, issue: `VERY_FEW_STEPS: ${timeline.length}` });
    } else if (timeline.length < 10) {
      issues.push({ id: mod.id, issue: `FEW_STEPS: ${timeline.length}` });
    }
    
    if (!hasCallStack && !hasVariables && !hasConditionEval) {
      issues.push({ id: mod.id, issue: 'NO_DEBUGGER_FEATURES (no callStack, variables, or conditionEval)' });
    }
    
  } catch (err: any) {
    results.push({
      id: mod.id,
      title: mod.title,
      category: mod.category,
      difficulty: mod.difficulty,
      presetCount: mod.presets?.length || 0,
      defaultSteps: 0,
      minSteps: 0,
      maxSteps: 0,
      hasCallStack: false,
      hasVariables: false,
      hasSoundCue: false,
      hasConditionEval: false,
      hasMilestones: false,
      codeSnippetLangs: [],
      error: err.message,
    });
    issues.push({ id: mod.id, issue: `CRASH: ${err.message}` });
  }
}

// Sort by steps ascending
const sorted = [...results].sort((a, b) => a.defaultSteps - b.defaultSteps);

console.log('=== RUNTIME AUDIT: STEP COUNT RANKING ===');
console.log(`Total modules: ${results.length}`);
console.log(`Modules with errors: ${results.filter(r => r.error).length}`);
console.log(`Average steps: ${Math.round(results.reduce((s, r) => s + r.defaultSteps, 0) / results.length)}`);
console.log('');

// Bottom 30 by step count
console.log('=== LOWEST STEP COUNT (Bottom 30) ===');
sorted.slice(0, 30).forEach((r, i) => {
  const flags = [];
  if (!r.hasCallStack) flags.push('no-callstack');
  if (!r.hasVariables) flags.push('no-vars');
  if (!r.hasMilestones) flags.push('no-milestones');
  if (r.error) flags.push(`ERROR: ${r.error}`);
  console.log(`${String(i + 1).padStart(3)}. ${String(r.defaultSteps).padStart(4)} steps | ${r.id.padEnd(40)} | ${flags.join(', ')}`);
});

console.log('');

// Modules with issues
if (issues.length > 0) {
  console.log(`=== ISSUES (${issues.length}) ===`);
  issues.forEach(i => console.log(`  [${i.issue}] ${i.id}`));
}

// Category breakdown
const categories = new Map<string, number[]>();
for (const r of results) {
  if (!categories.has(r.category)) categories.set(r.category, []);
  categories.get(r.category)!.push(r.defaultSteps);
}

console.log('\n=== CATEGORY BREAKDOWN ===');
for (const [cat, steps] of categories) {
  const avg = Math.round(steps.reduce((a, b) => a + b, 0) / steps.length);
  const min = Math.min(...steps);
  const max = Math.max(...steps);
  console.log(`  ${cat.padEnd(25)} | ${steps.length} modules | avg=${avg} min=${min} max=${max}`);
}
