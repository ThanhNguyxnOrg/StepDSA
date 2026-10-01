// Audit script: count steps, check render function presence, and validate code snippets
// for all registered modules in StepDSA

const fs = require('fs');
const path = require('path');

// Read registry file to extract module imports
const registryPath = path.join(__dirname, '..', 'src', 'modules', 'registry.ts');
const registryContent = fs.readFileSync(registryPath, 'utf-8');

// Extract all module file paths from imports
const importRegex = /from\s+'\.\/([^']+)'/g;
const modulePaths = [];
let match;
while ((match = importRegex.exec(registryContent)) !== null) {
  modulePaths.push(match[1]);
}

console.log(`Found ${modulePaths.length} module imports in registry.ts\n`);

// For each module file, check:
// 1. File exists
// 2. Has generateTimeline function
// 3. Has renderStage function
// 4. Has all 5 code snippets (python, typescript, cpp, java, pseudocode)
// 5. Has presets
// 6. Try to estimate step count from default input

const results = [];
const issues = [];

for (const modPath of modulePaths) {
  const fullPath = path.join(__dirname, '..', 'src', 'modules', modPath + '.tsx');
  const exists = fs.existsSync(fullPath);
  
  if (!exists) {
    issues.push({ file: modPath, issue: 'FILE_NOT_FOUND' });
    results.push({ file: modPath, exists: false });
    continue;
  }
  
  const content = fs.readFileSync(fullPath, 'utf-8');
  const lines = content.split('\n').length;
  const bytes = Buffer.byteLength(content, 'utf-8');
  
  // Check for key exports/functions
  const hasGenerateTimeline = /generateTimeline/.test(content);
  const hasRenderStage = /renderStage/.test(content);
  const hasPython = /python\s*[:=]/.test(content) || /['"]python['"]/.test(content);
  const hasTypescript = /typescript\s*[:=]/.test(content) || /['"]typescript['"]/.test(content);
  const hasCpp = /cpp\s*[:=]/.test(content) || /['"]cpp['"]/.test(content);
  const hasJava = /java\s*[:=]/.test(content) || /['"]java['"]/.test(content);
  const hasPseudocode = /pseudocode\s*[:=]/.test(content) || /['"]pseudocode['"]/.test(content);
  const hasPresets = /presets\s*[:=]/.test(content);
  const hasTheory = /theory\s*[:=]/.test(content);
  const hasComplexity = /complexity\s*[:=]/.test(content);
  
  const codeSnippets = [hasPython, hasTypescript, hasCpp, hasJava, hasPseudocode];
  const missingSnippets = [];
  if (!hasPython) missingSnippets.push('python');
  if (!hasTypescript) missingSnippets.push('typescript');
  if (!hasCpp) missingSnippets.push('cpp');
  if (!hasJava) missingSnippets.push('java');
  if (!hasPseudocode) missingSnippets.push('pseudocode');
  
  // Check for React.createElement or JSX usage in renderStage
  const hasReactRender = /React\.createElement/.test(content) || /<[A-Z]/.test(content) || /<div/.test(content) || /<svg/.test(content);
  
  const result = {
    file: modPath,
    exists: true,
    lines,
    bytes,
    hasGenerateTimeline,
    hasRenderStage,
    hasReactRender,
    codeSnippetCount: codeSnippets.filter(Boolean).length,
    missingSnippets,
    hasPresets,
    hasTheory,
    hasComplexity,
  };
  
  results.push(result);
  
  // Flag issues
  if (!hasGenerateTimeline) issues.push({ file: modPath, issue: 'MISSING_generateTimeline' });
  if (!hasRenderStage) issues.push({ file: modPath, issue: 'MISSING_renderStage' });
  if (missingSnippets.length > 0) issues.push({ file: modPath, issue: `MISSING_CODE_SNIPPETS: ${missingSnippets.join(', ')}` });
  if (!hasPresets) issues.push({ file: modPath, issue: 'MISSING_presets' });
  if (!hasTheory) issues.push({ file: modPath, issue: 'MISSING_theory' });
  if (!hasReactRender) issues.push({ file: modPath, issue: 'NO_REACT_RENDER' });
  if (lines < 80) issues.push({ file: modPath, issue: `SUSPICIOUSLY_SHORT: ${lines} lines` });
}

// Summary
console.log('=== MODULE AUDIT SUMMARY ===');
console.log(`Total modules: ${results.length}`);
console.log(`Files found: ${results.filter(r => r.exists).length}`);
console.log(`Files missing: ${results.filter(r => !r.exists).length}`);
console.log('');

// Stats
const existing = results.filter(r => r.exists);
const avgLines = Math.round(existing.reduce((s, r) => s + r.lines, 0) / existing.length);
const avgBytes = Math.round(existing.reduce((s, r) => s + r.bytes, 0) / existing.length);
console.log(`Average lines per module: ${avgLines}`);
console.log(`Average bytes per module: ${avgBytes}`);
console.log('');

// Short modules
const shortModules = existing.filter(r => r.lines < 150).sort((a, b) => a.lines - b.lines);
if (shortModules.length > 0) {
  console.log(`=== SHORT MODULES (<150 lines) — ${shortModules.length} modules ===`);
  shortModules.forEach(r => {
    console.log(`  ${r.lines} lines | ${r.file}`);
  });
  console.log('');
}

// Missing code snippets
const missingCode = existing.filter(r => r.missingSnippets.length > 0);
if (missingCode.length > 0) {
  console.log(`=== MODULES MISSING CODE SNIPPETS — ${missingCode.length} modules ===`);
  missingCode.forEach(r => {
    console.log(`  ${r.file}: missing ${r.missingSnippets.join(', ')}`);
  });
  console.log('');
}

// All issues
if (issues.length > 0) {
  console.log(`=== ALL ISSUES — ${issues.length} total ===`);
  issues.forEach(i => {
    console.log(`  [${i.issue}] ${i.file}`);
  });
}

// Write JSON report
const reportPath = path.join(__dirname, 'audit_results.json');
fs.writeFileSync(reportPath, JSON.stringify({ results, issues, summary: {
  total: results.length,
  found: results.filter(r => r.exists).length,
  missing: results.filter(r => !r.exists).length,
  avgLines,
  shortModuleCount: shortModules.length,
  missingCodeCount: missingCode.length,
  issueCount: issues.length,
}}, null, 2));
console.log(`\nFull report written to: ${reportPath}`);
