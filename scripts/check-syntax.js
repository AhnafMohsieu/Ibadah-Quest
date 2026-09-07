'use strict';

/**
 * Syntax gate for Ibadah Quest.
 *
 * Classic browser scripts must parse as scripts (node:vm.Script).
 * ESM sources (src/** plus root vite.config.js) must parse as modules via
 * `node --input-type=module --check` over stdin — vm.SourceTextModule does
 * not exist on Node 22+, so in-process module parsing is not available.
 *
 * Usage:  node scripts/check-syntax.js
 * Exits:  0 on success, 1 if any file fails to parse.
 */

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');

const root = path.join(__dirname, '..');
// Tooling / vendored / generated dirs that are not shipped as browser scripts.
const EXCLUDED = new Set([
  'node_modules',
  '.git',
  '.github',
  '.playwright-mcp',
  '.opencode',
  '.worktrees',
  'dist'
]);

const failures = [];
let fileCount = 0;

function isModuleFile(rel) {
  return rel.startsWith('src/') || rel === 'vite.config.js';
}

function checkModule(abs, rel) {
  const code = fs.readFileSync(abs, 'utf8');
  try {
    execFileSync(process.execPath, ['--input-type=module', '--check'], {
      input: code, stdio: ['pipe', 'pipe', 'pipe']
    });
  } catch (err) {
    const msg = ((err.stderr || err.message || String(err)).toString().split('\n'))[0];
    failures.push(rel + ': ' + msg);
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!EXCLUDED.has(entry.name)) walk(abs);
    } else if (entry.name.endsWith('.js')) {
      fileCount++;
      const rel = path.relative(root, abs).replace(/\\/g, '/');
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
