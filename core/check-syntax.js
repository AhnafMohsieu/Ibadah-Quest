'use strict';

/**
 * Syntax gate for Ibadah Quest.
 *
 * Classic browser scripts must parse as scripts (node:vm.Script).
 *
 * Usage:  node scripts/check-syntax.js
 * Exits:  0 on success, 1 if any file fails to parse.
 */

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
// Tooling / vendored / generated dirs that are not shipped as browser scripts.
const EXCLUDED = new Set([
  'node_modules',
  '.git',
  '.github',
  '.playwright-mcp',
  '.worktrees',
  'dist'
]);

const failures = [];
let fileCount = 0;

function isModuleFile() {
  return false;
}

function checkModule() {}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    const rel = path.relative(root, abs).replace(/\\/g, '/');
    if (entry.isDirectory()) {
      // Match on the top-level segment only, so a nested directory that
      // happens to share a name (e.g. src/dist/) is still scanned.
      if (!EXCLUDED.has(rel.split('/')[0])) walk(abs);
    } else if (entry.name.endsWith('.js')) {
      fileCount++;
      if (isModuleFile(rel)) { checkModule(abs, rel); continue; }
      try {
        const code = fs.readFileSync(abs, 'utf8');
        new vm.Script(code, { filename: rel });
      } catch (err) {
        failures.push(rel + ': ' + err.message);
      }
    }
  }
}

walk(root);

if (failures.length > 0) {
  console.error('Syntax check FAILED — ' + failures.length + ' file(s):');
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('OK — all ' + fileCount + ' JS files parse cleanly.');
