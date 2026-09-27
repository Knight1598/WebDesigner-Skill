#!/usr/bin/env node
// Builds <iteration-dir>/review.html: side-by-side prototypes, replies and grades.
//   node evals/build-review.mjs <iteration-dir>
import fs from 'node:fs';
import path from 'node:path';

const iter = path.resolve(process.argv[2] || '.');
const bench = JSON.parse(fs.readFileSync(path.join(iter, 'benchmark.json'), 'utf8'));
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const entryOf = proj => ['web/index.html', 'index.html', 'public/index.html'].find(e => fs.existsSync(path.join(proj, e)));

const evalDirs = fs.readdirSync(iter).filter(d => d.startsWith('eval-')).sort((a, b) => parseInt(a.slice(5)) - parseInt(b.slice(5)));
const panes = evalDirs.map(dir => {
  const cols = ['with_skill', 'without_skill'].map(cfg => {
    const out = path.join(iter, dir, cfg, 'outputs');
    const entry = entryOf(path.join(out, 'project'));
    const g = JSON.parse(fs.readFileSync(path.join(iter, dir, cfg, 'grading.json'), 'utf8'));
    const resp = fs.existsSync(path.join(out, 'response.md')) ? fs.readFileSync(path.join(out, 'response.md'), 'utf8') : '(no response.md)';
    const src = entry ? `${dir}/${cfg}/outputs/project/${entry}` : null;
    return `<div class="col"><h3>${cfg === 'with_skill' ? 'WebDesigner skill' : 'Baseline'} · ${g.summary.passed}/${g.summary.total}</h3>
      ${src ? `<div class="frames"><iframe src="${src}" class="desk" loading="lazy"></iframe><iframe src="${src}" class="mob" loading="lazy"></iframe></div><a href="${src}" target="_blank">open full page ↗</a>` : '<p>no page</p>'}
      <details><summary>Assertions</summary><ul>${g.expectations.map(e => `<li class="${e.passed ? 'ok' : 'bad'}">${e.passed ? '✓' : '✗'} <b>${esc(e.text)}</b> — ${esc(e.evidence)}</li>`).join('')}</ul></details>
      <details><summary>Reply to user</summary><pre>${esc(resp)}</pre></details></div>`;
  }).join('');
  return `<section><h2>${esc(dir)}</h2><div class="pair">${cols}</div></section>`;
}).join('');

const s = bench.run_summary;
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>WebDesigner Eval Review</title><style>
:root{--bg:#f6f5f1;--fg:#1d1d1b;--mut:#6b6a64;--line:#dcdad2;--ok:#2f6b47;--bad:#b3261e;--card:#fff}
@media (prefers-color-scheme:dark){:root{--bg:#161614;--fg:#eceae4;--mut:#a3a19a;--line:#34332f;--ok:#7cc79a;--bad:#f08a80;--card:#1f1f1c}}
body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.6 system-ui,"Noto Sans Thai",sans-serif}
main{max-width:1500px;margin:0 auto;padding:24px 16px}h1{margin:0 0 4px}table{border-collapse:collapse;margin:12px 0 28px}td,th{border:1px solid var(--line);padding:6px 12px;text-align:left}
section{border-top:2px solid var(--fg);padding:16px 0 28px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:20px}@media(max-width:900px){.pair{grid-template-columns:1fr}}
.col{background:var(--card);border:1px solid var(--line);padding:12px}.frames{display:flex;gap:8px;align-items:flex-start}
iframe{border:1px solid var(--line);background:#fff}.desk{width:1280px;height:800px;transform:scale(.36);transform-origin:0 0;margin-right:-819px;margin-bottom:-512px}.mob{width:390px;height:780px;transform:scale(.37);transform-origin:0 0;margin-right:-246px;margin-bottom:-491px}
.ok{color:var(--ok)}.bad{color:var(--bad)}pre{white-space:pre-wrap;font-size:13px;max-height:420px;overflow:auto}summary{cursor:pointer;margin-top:8px}
</style></head><body><main><h1>WebDesigner — ${esc(bench.iteration)}</h1><p style="color:var(--mut)">Skill vs baseline. Each run shows a desktop and a mobile preview (scaled), the automated assertions and the reply the user would see.</p>
<table><tr><th></th><th>With skill</th><th>Baseline</th></tr>
<tr><td>Assertion pass rate</td><td>${Math.round(s.with_skill.pass_rate.mean * 100)}%</td><td>${Math.round(s.without_skill.pass_rate.mean * 100)}%</td></tr>
<tr><td>Avg time</td><td>${Math.round(s.with_skill.time_seconds.mean)} s</td><td>${Math.round(s.without_skill.time_seconds.mean)} s</td></tr>
<tr><td>Avg tokens</td><td>${Math.round(s.with_skill.tokens.mean).toLocaleString()}</td><td>${Math.round(s.without_skill.tokens.mean).toLocaleString()}</td></tr></table>
${panes}</main></body></html>`;
fs.writeFileSync(path.join(iter, 'review.html'), html);
console.log('wrote', path.join(iter, 'review.html'));
