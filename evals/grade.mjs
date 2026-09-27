#!/usr/bin/env node
// Programmatic grader for the WebDesigner eval suite.
//   node evals/grade.mjs <iteration-dir>
// Expects <iteration-dir>/eval-<id>-<name>/<config>/outputs/{project/, response.md}
// Writes grading.json per run, and benchmark.json + benchmark.md in <iteration-dir>.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const CHECK = path.join(here, '..', 'skills', 'web-designer', 'scripts', 'check.mjs');
const FIXTURE = path.join(here, 'fixtures', 'baan-khanom');
const evals = JSON.parse(fs.readFileSync(path.join(here, 'evals.json'), 'utf8')).evals;
const iterDir = path.resolve(process.argv[2] || '.');

const read = p => { try { return fs.readFileSync(p, 'utf8'); } catch { return null; } };
const walk = (d, out = []) => { try { for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (e.name === 'node_modules') continue; const p = path.join(d, e.name); e.isDirectory() ? walk(p, out) : out.push(p); } } catch {} return out; };
function check(project, handoff) {
  try { return JSON.parse(execFileSync('node', [CHECK, project, '--json', ...(handoff ? ['--handoff'] : [])], { encoding: 'utf8' })); }
  catch (e) { try { return JSON.parse(e.stdout); } catch { return { findings: [{ level: 'ERROR', rule: 'checker-crash', msg: String(e.message).slice(0, 200) }], errors: 1 }; } }
}
const stateOf = project => {
  const t = read(path.join(project, '.webfactory', 'STATE.yaml'));
  if (!t) return null;
  const block = t.match(/^design:\s*\n((?:[ \t]+.*\n?)*)/m)?.[1] || '';
  return { status: block.match(/status:\s*["']?(\w+)/)?.[1], locked: /locked:\s*true/.test(block) };
};
const cssRules = css => {
  const out = new Map(); const clean = (css || '').replace(/\/\*[\s\S]*?\*\//g, '');
  // split grouped selectors and accumulate declarations, so ".a, .b {x}" == ".a {x}" + ".b {x}"
  for (const m of clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)) for (const sel of m[1].split(',')) {
    const s = sel.trim().replace(/\s+/g, ' '); if (!s) continue;
    const body = m[2].replace(/\s+/g, ' ').trim().replace(/;?$/, ';');
    out.set(s, (out.get(s) || '') + body);
  }
  return out;
};
const storyClassesOK = (sel, html) => { const story = (html || '').match(/<section[^>]*id="story"[\s\S]*?<\/section>/)?.[0] || '';
  const cls = [...sel.matchAll(/\.([\w-]+)/g)].map(m => m[1]); return cls.length > 0 && cls.every(c => new RegExp(`class="[^"]*\\b${c}\\b`).test(story) || c === 'story'); };
const changedSelectors = (a, b) => { const A = cssRules(a), B = cssRules(b), ch = [];
  for (const [s, v] of B) if (A.get(s) !== v) ch.push(s);
  for (const s of A.keys()) if (!B.has(s)) ch.push(s + ' (removed)');
  return ch; };
const norm = s => (s || '').replace(/\s+/g, ' ').trim();
const stripStory = html => (html || '').replace(/<section[^>]*id="story"[\s\S]*?<\/section>/, '<STORY/>')
  .replace(/\s(data-action|aria-[\w-]+|alt|role)="[^"]*"/g, ''); // non-visual attribute fixes are allowed

const A = {
  direction_before_code: ({ resp }) => {
    const groups = [/concept|คอนเซปต์|แนวคิด|ไอเดีย/i, /typograph|ฟอนต์|font|ตัวอักษร/i, /colou?r|สี/i, /spacing|ระยะ|จังหวะ/i, /layout|เลย์เอาต์|โครงหน้า|การจัดวาง|โครงสร้างหน้า/i, /interaction|โต้ตอบ|ตอบสนอง|motion|การเคลื่อนไหว/i, /signature|ซิกเนเจอร์|เอกลักษณ์|จุดเด่น/i, /rejected|default|ไม่ใช้|เลี่ยง|ตัดทิ้ง|ไม่เลือก/i];
    const hit = groups.filter(g => g.test(resp || '')).length;
    return [hit >= 7, `${hit}/8 direction fields mentioned in response`];
  },
  // regression (v1.1.0): the plain-language rewrite must keep all nine lines, not just most of them
  direction_all_nine: ({ resp }) => {
    const groups = [/concept|คอนเซปต์|แนวคิด|ไอเดีย|idea/i, /personality|บุคลิก|อารมณ์|feel/i, /typograph|ฟอนต์|font|ตัวอักษร|\btype\b/i, /colou?r|สี/i, /spacing|ระยะ|จังหวะ/i, /layout|เลย์เอาต์|โครงหน้า|การจัดวาง/i, /interaction|โต้ตอบ|ตอบสนอง|motion|การเคลื่อนไหว/i, /signature|ซิกเนเจอร์|เอกลักษณ์/i, /rejected|avoided|default|ไม่ใช้|เลี่ยง|ตัดทิ้ง/i];
    const miss = groups.filter(g => !g.test(resp || '')).map(g => g.source.split('|')[0]);
    return [miss.length === 0, miss.length ? `missing: ${miss.join(', ')}` : 'all nine direction lines present'];
  },
  prototype_exists:({ files }) => { const h = files.filter(f => /\.html?$/.test(f)); return [h.length > 0, `${h.length} html file(s)`]; },
  checker_clean_core: ({ chk }) => { const e = chk.findings.filter(f => f.level === 'ERROR' && !['button-integrity', 'actions', 'actions-sync'].includes(f.rule));
    return [e.length === 0, e.length ? e.slice(0, 4).map(f => `${f.rule}: ${f.msg}`).join(' | ') : 'no core errors (a11y, links, boundary, content, viewport)']; },
  responsive_rules: ({ chk }) => { const w = chk.findings.some(f => f.rule === 'responsive'); return [!w, w ? 'no responsive rules found' : 'responsive rules present']; },
  no_purple_gradient: ({ chk }) => { const w = chk.findings.find(f => /Purple/.test(f.msg)); return [!w, w ? w.msg : 'no purple/indigo gradient']; },
  backend_boundary: ({ chk, files }) => { const e = chk.findings.filter(f => ['backend-boundary', 'secret'].includes(f.rule) && f.level === 'ERROR');
    const srv = files.filter(f => /(^|[\\/])(server|api)\.(js|ts|mjs)$|\.sql$|[\\/]prisma[\\/]|[\\/]routes[\\/]/i.test(f));
    return [!e.length && !srv.length, [...e.map(f => f.msg), ...srv.map(f => 'server file: ' + path.basename(f))].join(' | ') || 'no backend code, network calls or secrets']; },
  no_database_created: ({ files }) => { const bad = files.filter(f => /\.(sql|sqlite|db)$|[\\/]prisma[\\/]|schema\.prisma|knexfile|drizzle|server\.(js|ts)$/i.test(f) || /CREATE TABLE|mongoose\.connect|createClient\(|initializeApp\(/i.test(read(f) || ''));
    return [!bad.length, bad.length ? bad.map(f => path.basename(f)).join(', ') : 'no database artefacts']; },
  db_request_explained: ({ resp }) => { const ok = /database|ฐานข้อมูล/i.test(resp || '') && /(ขั้นถัดไป|ขั้นต่อไป|next stage|backend|แบ็กเอนด์|หลังบ้าน)/i.test(resp || '');
    return [ok, ok ? 'response explains the database belongs to the next stage' : 'no explanation of the database boundary']; },
  state_in_review_not_locked: ({ st }) => [!!st && st.status !== 'approved' && !st.locked, st ? `design.status=${st.status} locked=${st.locked}` : 'no .webfactory/STATE.yaml'],
  actions_declared: ({ chk, project }) => { const has = fs.existsSync(path.join(project, '.webfactory', 'design', 'ACTIONS.yaml'));
    const bi = chk.findings.filter(f => ['button-integrity', 'actions-sync'].includes(f.rule) && (f.level === 'ERROR' || /not declared/.test(f.msg)));
    return [has && !bi.length, !has ? 'no ACTIONS.yaml' : bi.length ? `${bi.length} undeclared/dead controls: ${bi[0].msg}` : `${chk.actions_used?.length ?? 0} actions, all declared`]; },
  error_state_reachable: ({ files }) => { const src = files.filter(f => /\.(js|html|jsx|tsx)$/.test(f)).map(read).join('\n');
    const ok = /demo_error|simulate.?error|force.?error|จำลอง[^\n]{0,20}(ผิดพลาด|error)|demoError|DEMO_FAIL/i.test(src);
    return [ok, ok ? 'demo error trigger present' : 'no way to see the error state']; },
  thai_font: ({ chk }) => { const w = chk.findings.filter(f => f.rule === 'thai-type'); return [!w.length, w.length ? w.map(f => f.msg).join(' | ') : 'Thai-capable font and line-height ok']; },
  handoff_valid: ({ project }) => { const c = check(project, true); return [c.errors === 0, c.errors ? c.findings.filter(f => f.level === 'ERROR').slice(0, 4).map(f => f.msg).join(' | ') : 'check.mjs --handoff clean']; },
  state_approved_locked: ({ st }) => [!!st && st.status === 'approved' && st.locked, st ? `design.status=${st.status} locked=${st.locked}` : 'no STATE.yaml'],
  styles_unchanged: ({ project }) => { const same = read(path.join(project, 'web', 'styles.css')) === read(path.join(FIXTURE, 'web', 'styles.css')); return [same, same ? 'styles.css untouched' : 'styles.css modified']; },
  markup_nonvisual_only: ({ project }) => { const strip = s => norm((s || '').replace(/\s(data-action|aria-[\w-]+|alt|role)="[^"]*"/g, ''));
    const ok = strip(read(path.join(project, 'web', 'index.html'))) === strip(read(path.join(FIXTURE, 'web', 'index.html')));
    return [ok, ok ? 'only non-visual attributes changed' : 'visible markup changed']; },
  not_locked: ({ st }) => [!!st && st.status !== 'approved' && !st.locked, st ? `design.status=${st.status} locked=${st.locked}` : 'no STATE.yaml'],
  css_change_scoped_to_button: ({ project }) => { const ch = changedSelectors(read(path.join(FIXTURE, 'web', 'styles.css')), read(path.join(project, 'web', 'styles.css')));
    const off = ch.filter(s => !/btn|button|preorder|cta|hero/i.test(s) && !/@media/.test(s));
    return [ch.length > 0 && !off.length, ch.length ? `changed: ${ch.join(', ')}${off.length ? ' — OFF-SCOPE: ' + off.join(', ') : ''}` : 'no CSS change at all']; },
  asks_to_confirm_lock: ({ resp }) => { const ok = /ผ่าน/.test(resp || '') && /(ล็อก|lock|ยืนยัน|อนุมัติ|approve)/i.test(resp || ''); return [ok, ok ? 'asks for explicit approval' : 'does not ask to confirm the lock']; },
  change_scoped_to_story: ({ project }) => { const htmlOk = norm(stripStory(read(path.join(project, 'web', 'index.html')))) === norm(stripStory(read(path.join(FIXTURE, 'web', 'index.html'))));
    const ch = changedSelectors(read(path.join(FIXTURE, 'web', 'styles.css')), read(path.join(project, 'web', 'styles.css')));
    const html = read(path.join(project, 'web', 'index.html'));
    const off = ch.filter(s => !/story|@media|reduce/i.test(s) && !storyClassesOK(s, html));
    return [htmlOk && ch.length >= 0 && !off.length, `${htmlOk ? 'html outside #story unchanged' : 'HTML OUTSIDE #story CHANGED'}; css changed: ${ch.join(', ') || 'none'}${off.length ? ' — OFF-SCOPE: ' + off.join(', ') : ''}`]; },
  tokens_unchanged: ({ project }) => { const root = s => norm((s || '').match(/:root\s*\{[^}]*\}/)?.[0]); const ok = root(read(path.join(project, 'web', 'styles.css'))) === root(read(path.join(FIXTURE, 'web', 'styles.css')));
    return [ok, ok ? ':root tokens untouched' : ':root tokens changed']; },
};

const runs = [];
for (const ev of evals) {
  const dir = fs.readdirSync(iterDir).find(d => d.startsWith(`eval-${ev.id}-`));
  if (!dir) continue;
  for (const config of ['with_skill', 'without_skill']) {
    const runDir = path.join(iterDir, dir, config);
    const project = path.join(runDir, 'outputs', 'project');
    if (!fs.existsSync(project)) continue;
    const ctx = { project, resp: read(path.join(runDir, 'outputs', 'response.md')), files: walk(project), chk: check(project, false), st: stateOf(project) };
    const expectations = ev.assertions.map(name => { const [passed, evidence] = A[name](ctx); return { text: name, passed, evidence }; });
    const passed = expectations.filter(e => e.passed).length;
    const timing = JSON.parse(read(path.join(runDir, 'timing.json')) || '{}');
    const grading = { eval_id: ev.id, eval_name: ev.name, configuration: config, expectations,
      summary: { passed, failed: expectations.length - passed, total: expectations.length, pass_rate: +(passed / expectations.length).toFixed(3) },
      checker: { errors: ctx.chk.errors, warnings: ctx.chk.warnings } };
    fs.writeFileSync(path.join(runDir, 'grading.json'), JSON.stringify(grading, null, 2));
    runs.push({ ...grading, timing });
  }
}

const stats = xs => { if (!xs.length) return { mean: 0, stddev: 0 }; const m = xs.reduce((a, b) => a + b, 0) / xs.length; return { mean: +m.toFixed(3), stddev: +Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / xs.length).toFixed(3) }; };
const summary = {};
for (const c of ['with_skill', 'without_skill']) {
  const r = runs.filter(x => x.configuration === c);
  summary[c] = { pass_rate: stats(r.map(x => x.summary.pass_rate)), time_seconds: stats(r.map(x => x.timing.total_duration_seconds).filter(Boolean)), tokens: stats(r.map(x => x.timing.total_tokens).filter(Boolean)) };
}
const bench = { skill_name: 'web-designer', iteration: path.basename(iterDir), run_summary: summary,
  delta: { pass_rate: +(summary.with_skill.pass_rate.mean - summary.without_skill.pass_rate.mean).toFixed(3) },
  runs: runs.map(r => ({ eval_id: r.eval_id, eval_name: r.eval_name, configuration: r.configuration, result: r.summary, checker: r.checker, timing: r.timing, expectations: r.expectations })) };
fs.writeFileSync(path.join(iterDir, 'benchmark.json'), JSON.stringify(bench, null, 2));

let md = `# WebDesigner benchmark — ${bench.iteration}\n\n| | with skill | baseline | Δ |\n|---|---|---|---|\n`;
md += `| Assertion pass rate | ${(summary.with_skill.pass_rate.mean * 100).toFixed(0)}% ± ${(summary.with_skill.pass_rate.stddev * 100).toFixed(0)} | ${(summary.without_skill.pass_rate.mean * 100).toFixed(0)}% ± ${(summary.without_skill.pass_rate.stddev * 100).toFixed(0)} | ${(bench.delta.pass_rate * 100).toFixed(0)} pts |\n`;
md += `| Time (s) | ${summary.with_skill.time_seconds.mean} | ${summary.without_skill.time_seconds.mean} | |\n| Tokens | ${summary.with_skill.tokens.mean} | ${summary.without_skill.tokens.mean} | |\n\n## Per eval\n\n| Eval | with skill | baseline |\n|---|---|---|\n`;
for (const ev of evals) { const w = runs.find(r => r.eval_id === ev.id && r.configuration === 'with_skill'), b = runs.find(r => r.eval_id === ev.id && r.configuration === 'without_skill');
  if (w || b) md += `| ${ev.id}. ${ev.name} | ${w ? `${w.summary.passed}/${w.summary.total}` : '–'} | ${b ? `${b.summary.passed}/${b.summary.total}` : '–'} |\n`; }
md += `\n## Failures\n\n`;
for (const r of runs) for (const e of r.expectations.filter(e => !e.passed)) md += `- **${r.eval_name} · ${r.configuration}** — \`${e.text}\`: ${e.evidence}\n`;
fs.writeFileSync(path.join(iterDir, 'benchmark.md'), md);
console.log(md);
