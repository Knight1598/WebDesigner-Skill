#!/usr/bin/env node
// Regression tests for scripts/check.mjs — misses found in eval iteration-1.
//   node evals/regression/checker.test.mjs      (exit 1 on any failure)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const CHECK = process.env.CHECK_PATH || path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'skills', 'web-designer', 'scripts', 'check.mjs');
const page = body => `<!doctype html><html lang="th"><head><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="styles.css"></head><body><h1>t</h1>${body}<script src="app.js"></script></body></html>`;
const actions = ids => 'schema: webfactory/actions@1\nactions:\n' + ids.map(id => `  - action_id: ${id}\n    kind: frontend\n    element: x\n    trigger: click\n    purpose: x\n    input: []\n    expected_result: x\n    requires_backend: false\n    success_state: x\n    error_state: x\n`).join('');

function run(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wd-'));
  for (const [p, c] of Object.entries(files)) { fs.mkdirSync(path.dirname(path.join(dir, p)), { recursive: true }); fs.writeFileSync(path.join(dir, p), c); }
  let out; try { out = execFileSync('node', [CHECK, dir, '--json'], { encoding: 'utf8' }); } catch (e) { out = e.stdout; }
  fs.rmSync(dir, { recursive: true, force: true });
  return JSON.parse(out).findings;
}

const cases = [
  {
    // eval-4 dashboard: row buttons rendered from app.js were reported "declared but no element uses"
    name: 'data-action on JS-rendered elements counts as used',
    files: {
      'web/index.html': page('<ul id="rows"></ul>'),
      'web/styles.css': '@media (max-width:600px){body{margin:0}}',
      'web/app.js': 'rows.innerHTML = items.map(i => `<li><button type="button" data-action="open_order_panel">${i}</button></li>`).join("");',
      '.webfactory/design/ACTIONS.yaml': actions(['open_order_panel']),
    },
    expect: f => !f.some(x => x.rule === 'actions-sync'),
  },
  {
    // eval-2 coffee / eval-3 booking: data-action on radio inputs was invisible to the checker
    name: 'data-action on <input> counts as used',
    files: {
      'web/index.html': page('<label><input type="radio" name="d" data-action="choose_duration"> 45</label>'),
      'web/styles.css': '@media (max-width:600px){body{margin:0}}',
      'web/app.js': '',
      '.webfactory/design/ACTIONS.yaml': actions(['choose_duration']),
    },
    expect: f => !f.some(x => x.rule === 'actions-sync'),
  },
  {
    // eval-2 coffee: .tabs { overflow-x: auto } showed a stray vertical scrollbar in the browser
    name: 'overflow-x without overflow-y is flagged',
    files: {
      'web/index.html': page('<div class="tabs"></div>'),
      'web/styles.css': '.tabs { display: flex; overflow-x: auto; }\n@media (max-width:600px){body{margin:0}}',
      'web/app.js': '',
      '.webfactory/design/ACTIONS.yaml': actions([]),
    },
    expect: f => f.some(x => x.rule === 'layout' && /overflow-y/.test(x.msg)),
  },
  {
    name: 'overflow-x with overflow-y set is not flagged',
    files: {
      'web/index.html': page('<div class="tabs"></div>'),
      'web/styles.css': '.tabs { display: flex; overflow-x: auto; overflow-y: hidden; }\n@media (max-width:600px){body{margin:0}}',
      'web/app.js': '',
      '.webfactory/design/ACTIONS.yaml': actions([]),
    },
    expect: f => !f.some(x => x.rule === 'layout'),
  },
];

let failed = 0;
for (const c of cases) {
  const ok = c.expect(run(c.files));
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${c.name}`);
}
console.log(`\n${cases.length - failed}/${cases.length} passed`);
process.exit(failed ? 1 : 0);
