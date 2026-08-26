'use strict';

/**
 * Syntax gate for Ibadah Quest.
 *
 * Every JS file in the repo is loaded by the browser as a classic <script>
 * (IIFE + window.* exports — no ES modules, no build step). So the faithful
 * syntax check is "does this parse as a script?", which node:vm.Script gives us
 * in-process (faster and web-worker-safe vs spawning `node --check` per file).
 *
 * Usage:  node scripts/check-syntax.js
 * Exits:  0 on success, 1 if any file fails to parse.
 */

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
// Tooling / vendored dirs that are not shipped as browser scripts.
const EXCLUDED = new Set([
  'node_modules',
  '.git',
  '.github',
  '.playwright-mcp',
  '.opencode'
]);

const failures = [];
let fileCount = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!EXCLUDED.has(entry.name)) walk(abs);
    } else if (entry.name.endsWith('.js')) {
      fileCount++;
      const rel = path.relative(root, abs).replace(/\\/g, '/');
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