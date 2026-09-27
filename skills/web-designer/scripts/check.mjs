#!/usr/bin/env node
// WebDesigner prototype + handoff checker. Zero dependencies, Node >= 18.
//
//   node check.mjs <project-root>              build/iteration checks
//   node check.mjs <project-root> --handoff    + validate .webfactory handoff (errors on any gap)
//   options: --src <dir>  scan this dir instead of web/ (or root)   --json  machine-readable output
//
// Exit code 1 when any ERROR is found. WARNs are prompts for a design self-review.

import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const flags = new Set(argv.filter(a => a.startsWith('--')));
const positional = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--src') { i++; continue; }
  if (!argv[i].startsWith('--')) positional.push(argv[i]);
}
const root = path.resolve(positional[0] || '.');
const srcArg = argv.includes('--src') ? argv[argv.indexOf('--src') + 1] : null;
const HANDOFF = flags.has('--handoff');
const JSON_OUT = flags.has('--json');

const findings = [];
const add = (level, rule, file, line, msg) =>
  findings.push({ level, rule, file: file ? path.relative(root, file).replace(/\\/g, '/') : '', line, msg });

// ---------- collect source files ----------
const SKIP = new Set(['node_modules', 'dist', 'build', '.git', '.webfactory', '.next', '.nuxt', '.svelte-kit', 'coverage', '.cache']);
const MARKUP = ['.html', '.htm', '.jsx', '.tsx', '.vue', '.svelte', '.astro'];
const SCRIPT = ['.js', '.mjs', '.cjs', '.ts', '.jsx', '.tsx', '.vue', '.svelte', '.astro'];
const STYLE = ['.css', '.scss', '.sass', '.less'];

let srcDir = srcArg ? path.resolve(root, srcArg)
  : fs.existsSync(path.join(root, 'web')) ? path.join(root, 'web') : root;

function walk(dir, out = []) {
  let entries = [];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (SKIP.has(e.name) || (e.isDirectory() && e.name.startsWith('.'))) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if ([...MARKUP, ...SCRIPT, ...STYLE].includes(path.extname(e.name).toLowerCase())) out.push(p);
  }
  return out;
}
const files = walk(srcDir).map(p => ({ p, ext: path.extname(p).toLowerCase(), text: fs.readFileSync(p, 'utf8') }));
const lineOf = (text, idx) => text.slice(0, idx).split('\n').length;

if (!files.length) add('ERROR', 'no-source', null, null, `No HTML/CSS/JS files found under ${path.relative(root, srcDir) || '.'}`);

// ---------- tag scanner (tolerates JSX braces and quoted '>') ----------
function scanTags(text, names) {
  const out = [];
  const re = new RegExp(`<(${names.join('|')})(?=[\\s>/])`, 'gi');
  let m;
  while ((m = re.exec(text))) {
    let i = m.index + m[0].length, depth = 0, q = null;
    for (; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === q) q = null; continue; }
      if (c === '"' || c === "'" || c === '`') { q = c; continue; }
      if (c === '{') depth++;
      else if (c === '}') depth--;
      else if (c === '>' && depth <= 0) break;
    }
    out.push({ tag: m[1].toLowerCase(), attrs: text.slice(m.index + m[0].length, i), index: m.index });
  }
  return out;
}
const attr = (attrs, name) => {
  const m = attrs.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|\\{([^}]*)\\}|([^\\s>]+))`, 'i'));
  return m ? (m[1] ?? m[2] ?? m[3] ?? m[4] ?? '') : null;
};
const hasAttr = (attrs, name) => new RegExp(`(?:^|\\s)${name}(?=[\\s=/>]|$)`, 'i').test(attrs);

// ---------- markup checks ----------
const usedActions = new Map(); // id -> [{file,line}]
const allIds = new Set();
const markupFiles = files.filter(f => MARKUP.includes(f.ext));
for (const f of markupFiles) for (const m of f.text.matchAll(/\sid\s*=\s*["']([^"']+)["']/g)) allIds.add(m[1]);

for (const f of markupFiles) {
  const { text, p, ext } = f;
  const isHtml = ext === '.html' || ext === '.htm';
  const noteAction = (id, idx) => {
    if (!id || /[{}$]/.test(id)) return; // dynamic value, can't resolve statically
    if (!usedActions.has(id)) usedActions.set(id, []);
    usedActions.get(id).push({ file: p, line: lineOf(text, idx) });
  };

  if (isHtml && /<html[\s>]/i.test(text)) {
    if (!/<meta[^>]+name\s*=\s*["']viewport["']/i.test(text)) add('ERROR', 'viewport', p, 1, 'Missing <meta name="viewport" content="width=device-width, initial-scale=1">');
    if (!/<html[^>]*\slang\s*=/i.test(text)) add('ERROR', 'lang', p, 1, 'Missing lang attribute on <html> (e.g. lang="th")');
    const h1 = (text.match(/<h1[\s>]/gi) || []).length;
    if (h1 === 0) add('WARN', 'h1', p, 1, 'No <h1> on this page');
    if (h1 > 1) add('WARN', 'h1', p, 1, `${h1} <h1> elements; prefer exactly one`);
    for (const s of scanTags(text, ['script'])) {
      if (/type\s*=\s*["']module["']/i.test(s.attrs) && !fs.existsSync(path.join(root, 'package.json')))
        add('WARN', 'file-protocol', p, lineOf(text, s.index), 'type="module" scripts are blocked when the page is opened by double-click (file://). Use classic <script> tags for a no-build prototype');
    }
  }

  const formsWithAction = scanTags(text, ['form']).filter(t => attr(t.attrs, 'data-action') !== null);
  for (const t of scanTags(text, ['form'])) {
    const a = attr(t.attrs, 'data-action');
    if (a === null) add('ERROR', 'button-integrity', p, lineOf(text, t.index), '<form> without data-action — every form needs a declared action');
    else noteAction(a, t.index);
  }
  for (const t of scanTags(text, ['button'])) {
    const a = attr(t.attrs, 'data-action');
    const type = (attr(t.attrs, 'type') || '').toLowerCase();
    if (a !== null) { noteAction(a, t.index); continue; }
    if (type === 'submit' && formsWithAction.length) continue; // covered by its form
    add('ERROR', 'button-integrity', p, lineOf(text, t.index), '<button> without data-action — declare its job (frontend | navigation | backend | placeholder) or remove it');
  }
  for (const t of scanTags(text, ['a'])) {
    const a = attr(t.attrs, 'data-action');
    if (a !== null) { noteAction(a, t.index); continue; }
    const href = attr(t.attrs, 'href');
    const ln = lineOf(text, t.index);
    if (href === null || href === '' || href === '#' || /^javascript:/i.test(href)) {
      add('ERROR', 'button-integrity', p, ln, `<a href="${href ?? ''}"> goes nowhere and has no data-action`);
    } else if (/^#/.test(href) && !/[{}$]/.test(href)) {
      if (!allIds.has(decodeURIComponent(href.slice(1)))) add('ERROR', 'dead-link', p, ln, `Anchor ${href} points to an id that does not exist`);
    } else if (!/^(https?:|mailto:|tel:|\/\/|\{|\$)/i.test(href) && isHtml) {
      const target = path.resolve(path.dirname(p), href.split(/[?#]/)[0]);
      if (href.split(/[?#]/)[0] && !fs.existsSync(target)) add('ERROR', 'dead-link', p, ln, `Link to ${href} — file does not exist`);
    }
  }
  for (const t of scanTags(text, ['div', 'span', 'li', 'section'])) {
    const role = (attr(t.attrs, 'role') || '').toLowerCase();
    if (['button', 'switch', 'tab', 'menuitem'].includes(role)) {
      const a = attr(t.attrs, 'data-action');
      if (a === null) add('WARN', 'button-integrity', p, lineOf(text, t.index), `<${t.tag} role="${role}"> without data-action; prefer a native <button>`);
      else noteAction(a, t.index);
      if (role === 'button' && !hasAttr(t.attrs, 'tabindex')) add('WARN', 'a11y-keyboard', p, lineOf(text, t.index), `<${t.tag} role="button"> is not keyboard-focusable (no tabindex); use <button>`);
    }
  }
  for (const t of scanTags(text, ['img'])) {
    if (attr(t.attrs, 'alt') === null) add('ERROR', 'a11y-alt', p, lineOf(text, t.index), '<img> without alt (use alt="" only for pure decoration)');
  }
  const labelFor = new Set([...text.matchAll(/<label[^>]*\s(?:for|htmlFor)\s*=\s*["']([^"']+)["']/gi)].map(m => m[1]));
  for (const t of scanTags(text, ['input', 'select', 'textarea'])) {
    const type = (attr(t.attrs, 'type') || '').toLowerCase();
    const da = attr(t.attrs, 'data-action');
    if (da !== null) noteAction(da, t.index);
    if (['hidden', 'submit', 'button', 'reset'].includes(type)) continue;
    const id = attr(t.attrs, 'id');
    const ok = attr(t.attrs, 'aria-label') !== null || attr(t.attrs, 'aria-labelledby') !== null || (id && labelFor.has(id));
    const before = text.slice(Math.max(0, t.index - 400), t.index);
    const wrapped = before.lastIndexOf('<label') > before.lastIndexOf('</label');
    if (!ok && !wrapped) add('WARN', 'a11y-label', p, lineOf(text, t.index), `<${t.tag}${id ? ' id="' + id + '"' : ''}> may be unlabelled — add <label for> or aria-label`);
  }
}

// ---------- elements rendered from JS (template strings, createElement) ----------
for (const f of files.filter(f => ['.js', '.mjs', '.cjs', '.ts'].includes(f.ext))) {
  const { text, p } = f;
  const note = (id, idx) => { if (!usedActions.has(id)) usedActions.set(id, []); usedActions.get(id).push({ file: p, line: lineOf(text, idx) }); };
  for (const m of text.matchAll(/data-action\s*=\s*\\?["']([a-z][a-z0-9_]*)/g)) note(m[1], m.index);
  for (const m of text.matchAll(/(?:dataset\.action\s*=|setAttribute\(\s*["']data-action["']\s*,)\s*["']([a-z][a-z0-9_]*)["']/g)) note(m[1], m.index);
  for (const t of scanTags(text, ['button'])) {
    if (attr(t.attrs, 'data-action') === null && (attr(t.attrs, 'type') || '').toLowerCase() !== 'submit')
      add('WARN', 'button-integrity', p, lineOf(text, t.index), '<button> rendered from JS without data-action — declare its job');
  }
}

// ---------- boundary, honesty, file:// checks (all source) ----------
const SECRET = [
  [/sk_live_[0-9a-zA-Z]{10,}/, 'Stripe live secret key'],
  [/AKIA[0-9A-Z]{16}/, 'AWS access key'],
  [/AIza[0-9A-Za-z_\-]{35}/, 'Google API key'],
  [/-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/, 'private key'],
  [/\b(?:api[_-]?key|secret|client_secret|password|token)\b\s*[:=]\s*["'][A-Za-z0-9_\-\.]{16,}["']/i, 'hard-coded credential'],
];
const BACKEND = [
  [/require\(\s*["']express["']\)|from\s+["']express["']/, 'Express server'],
  [/\bhttp\.createServer\(|\bcreateServer\(/, 'HTTP server'],
  [/from\s+["']@prisma\/client["']|\bnew PrismaClient\(/, 'Prisma database client'],
  [/\bmongoose\.connect\(|\bnew MongoClient\(/, 'MongoDB client'],
  [/\bcreateClient\(\s*["']https:\/\/[^"']*supabase/, 'Supabase client'],
  [/\binitializeApp\(\s*\{[^}]*apiKey/s, 'Firebase app init'],
  [/\bnodemailer\b|\bsendgrid\b|\bresend\.emails\.send/i, 'email sending'],
  [/\bstripe\.(charges|paymentIntents|checkout)\b/, 'payment processing'],
];
for (const f of files) {
  const { text, p } = f;
  for (const [re, what] of SECRET) { const m = text.match(re); if (m) add('ERROR', 'secret', p, lineOf(text, m.index), `Looks like a ${what} — never put secrets in the prototype`); }
  for (const [re, what] of BACKEND) { const m = text.match(re); if (m) add('ERROR', 'backend-boundary', p, lineOf(text, m.index), `${what} detected — this skill builds frontend only; mock it and record the need in ACTIONS.yaml`); }
  for (const m of text.matchAll(/\b(fetch|axios(?:\.\w+)?)\(\s*([`"'])([^`"']*)\2/g)) {
    const url = m[3];
    if (/^https?:\/\//i.test(url) && !/fonts\.(googleapis|gstatic)\.com/.test(url))
      add('ERROR', 'backend-boundary', p, lineOf(text, m.index), `Network call to ${url} — prototype must use mock data`);
    else if (!/^https?:/i.test(url))
      add('WARN', 'file-protocol', p, lineOf(text, m.index), `fetch('${url}') fails when the page is opened via file:// — load mock data with a <script> tag instead`);
  }
  for (const m of text.matchAll(/new\s+(WebSocket|EventSource)\(|XMLHttpRequest|navigator\.sendBeacon/g))
    add('ERROR', 'backend-boundary', p, lineOf(text, m.index), `${m[0]} — prototype must not talk to a server`);
  const lorem = text.match(/lorem ipsum|dolor sit amet/i);
  if (lorem) add('ERROR', 'content', p, lineOf(text, lorem.index), 'Lorem ipsum found — write real content in the user\'s language');
}

// ---------- design smell heuristics (warnings) ----------
const allStyle = files.map(f => f.text).join('\n');
const styleOnly = files.filter(f => STYLE.includes(f.ext) || MARKUP.includes(f.ext)).map(f => f.text).join('\n');
const warnGlobal = (rule, msg) => add('WARN', rule, null, null, msg);

if (files.length) {
  if (!/@media|@container|clamp\(|\b(sm|md|lg|xl):[a-z]/.test(styleOnly))
    warnGlobal('responsive', 'No @media / @container / clamp() / responsive utility classes found — mobile was probably not designed');
  const blur = (allStyle.match(/backdrop-filter\s*:|backdrop-blur/g) || []).length;
  if (blur >= 3) warnGlobal('generic-pattern', `backdrop-filter/blur used ${blur}× — glassmorphism everywhere is a generic-AI default; justify it or reduce`);

  const hueOf = hex => {
    let h = hex.replace('#', ''); if (h.length === 3) h = [...h].map(c => c + c).join('');
    const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    if (!d) return { h: 0, s: 0 };
    let hue = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    hue = (hue * 60 + 360) % 360; const l = (mx + mn) / 2;
    return { h: hue, s: d / (1 - Math.abs(2 * l - 1)) };
  };
  let purpleGrad = 0;
  for (const m of allStyle.matchAll(/(?:linear|radial|conic)-gradient\(([^;]*?)\)\s*[;"'}]/g)) {
    const hexes = m[1].match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g) || [];
    if (hexes.some(x => { const { h, s } = hueOf(x); return h >= 225 && h <= 290 && s > 0.35; })) purpleGrad++;
  }
  purpleGrad += (allStyle.match(/\b(from|via|to)-(purple|indigo|violet)-\d{2,3}/g) || []).length;
  if (purpleGrad) warnGlobal('generic-pattern', `Purple/indigo/blue-violet gradient found (${purpleGrad}×) — the #1 AI default; is it really from the brand?`);

  const radii = [...allStyle.matchAll(/border-radius\s*:\s*([^;}{]+)/g)].map(m => m[1].trim());
  if (radii.length >= 6) {
    const counts = radii.reduce((a, r) => (a[r] = (a[r] || 0) + 1, a), {});
    const [top, n] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    const px = parseFloat(top);
    if (n / radii.length >= 0.7 && (px >= 12 || /rem/.test(top) && px >= 0.75)) warnGlobal('generic-pattern', `Same border-radius (${top}) on ${n}/${radii.length} rules — uniform large rounding is a generic default; define a shape language`);
  }
  const tw = (allStyle.match(/\brounded-(xl|2xl|3xl)\b/g) || []).length;
  if (tw >= 10) warnGlobal('generic-pattern', `rounded-xl/2xl/3xl used ${tw}× — uniform rounding is a generic default`);
  const cards = (allStyle.match(/class(?:Name)?\s*=\s*["'][^"']*\bcard\b/g) || []).length;
  if (cards >= 12) warnGlobal('generic-pattern', `${cards} elements with class "card" — check this isn't a wall of identical cards`);

  for (const f of files.filter(f => STYLE.includes(f.ext) || f.ext === '.html')) for (const m of f.text.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (/overflow-x\s*:\s*(auto|scroll)/.test(m[2]) && !/overflow-y\s*:|overflow\s*:/.test(m[2]))
      add('WARN', 'layout', f.p, lineOf(f.text, m.index), `${m[1].trim()}: overflow-x without overflow-y makes overflow-y compute to auto — add overflow-y: hidden or a stray vertical scrollbar appears`);
  }
  if (/@keyframes|animation\s*:|transition\s*:/.test(allStyle) && !/prefers-reduced-motion/.test(allStyle))
    warnGlobal('a11y-motion', 'Motion used but prefers-reduced-motion is never handled');
  if (/outline\s*:\s*(none|0)\b/.test(allStyle) && !/:focus-visible/.test(allStyle))
    warnGlobal('a11y-focus', 'outline removed but no :focus-visible style — keyboard users lose focus');
  if (/[฀-๿]{6,}/.test(files.filter(f => MARKUP.includes(f.ext) || SCRIPT.includes(f.ext)).map(f => f.text).join(''))) {
    if (!/Sarabun|Noto (Sans|Serif) Thai|IBM Plex Sans Thai|Anuphan|Kanit|Prompt|Bai Jamjuree|Mitr|Chakra Petch|Trirong|Taviraj|Charm|Srisakdi|Pridi|Athiti|Mali|Niramit|K2D|Krub|Kodchasan|Fahkwang|Chonburi|Itim|Pattaya|Sriracha|Thasadith|Leelawadee|Thonburi|Line Seed Sans TH|LINE Seed|Noto Looped Thai|Noto Sans Thai Looped|Google Sans/i.test(allStyle))
      warnGlobal('thai-type', 'Thai text found but no Thai-capable font is declared — the browser fallback will not match the design');
    const lh = [...allStyle.matchAll(/line-height\s*:\s*([0-9.]+)\s*[;}\n]|font\s*:[^;{}]*?\/\s*([0-9.]+)(?![0-9.]*(?:px|rem|em|%))/g)]
      .map(m => parseFloat(m[1] ?? m[2])).filter(n => n > 0 && n < 4);
    for (const m of allStyle.matchAll(/--leading[\w-]*\s*:\s*([0-9.]+)/g)) lh.push(parseFloat(m[1]));
    if (lh.length && Math.max(...lh) < 1.5) warnGlobal('thai-type', `Thai text found but the largest unitless line-height is ${Math.max(...lh)} — Thai body text needs ~1.6–1.8`);
  }
}

// ---------- mini YAML (maps, scalars, inline {k: v}, simple lists) ----------
function scalar(v) {
  v = v.replace(/\s+#.*$/, '').trim();
  if (v === '' ) return '';
  if (/^(null|~)$/i.test(v)) return null;
  if (/^true$/i.test(v)) return true;
  if (/^false$/i.test(v)) return false;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  if (/^\{.*\}$/.test(v)) { const o = {}; for (const kv of v.slice(1, -1).split(',')) { const [k, ...r] = kv.split(':'); if (k.trim()) o[k.trim()] = scalar(r.join(':')); } return o; }
  if (/^\[\s*\]$/.test(v)) return [];
  return v.replace(/^(["'])(.*)\1$/, '$2');
}
function parseYamlMap(text) {
  const rootObj = {}; const stack = [{ indent: -1, obj: rootObj }];
  for (const raw of text.split(/\r?\n/)) {
    if (!raw.trim() || /^\s*#/.test(raw)) continue;
    const indent = raw.match(/^\s*/)[0].length;
    const m = raw.trim().match(/^([A-Za-z0-9_\-]+)\s*:(.*)$/);
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
    if (!m) continue;
    const parent = stack[stack.length - 1].obj;
    if (m[2].replace(/\s+#.*$/, '').trim() === '') { parent[m[1]] = {}; stack.push({ indent, obj: parent[m[1]] }); }
    else parent[m[1]] = scalar(m[2]);
  }
  return rootObj;
}
function parseActions(text) {
  const lines = text.split(/\r?\n/); const out = [];
  let cur = null, keyIndent = -1;
  lines.forEach((raw, i) => {
    const start = raw.match(/^(\s*)-\s+action_id\s*:(.*)$/);
    if (start) { cur = { action_id: scalar(start[2]), _line: i + 1, _keys: new Set(['action_id']) }; keyIndent = start[1].length + 2; out.push(cur); return; }
    if (!cur) return;
    const km = raw.match(/^(\s*)([a-z_]+)\s*:(.*)$/);
    if (km && km[1].length === keyIndent) { cur._keys.add(km[2]); cur[km[2]] = scalar(km[3]); }
  });
  return out;
}

// ---------- ACTIONS cross-check ----------
const wf = path.join(root, '.webfactory');
const actionsPath = path.join(wf, 'design', 'ACTIONS.yaml');
const REQUIRED_ACTION = ['action_id', 'kind', 'element', 'trigger', 'purpose', 'input', 'expected_result', 'requires_backend', 'success_state', 'error_state'];
const KINDS = ['frontend', 'navigation', 'backend', 'placeholder'];
let actions = null;
if (fs.existsSync(actionsPath)) {
  actions = parseActions(fs.readFileSync(actionsPath, 'utf8'));
  const seen = new Set();
  for (const a of actions) {
    const lvl = HANDOFF ? 'ERROR' : 'WARN';
    if (!/^[a-z][a-z0-9_]*$/.test(String(a.action_id))) add('ERROR', 'actions', actionsPath, a._line, `action_id "${a.action_id}" must be snake_case`);
    if (seen.has(a.action_id)) add('ERROR', 'actions', actionsPath, a._line, `Duplicate action_id "${a.action_id}"`);
    seen.add(a.action_id);
    const missing = REQUIRED_ACTION.filter(k => !a._keys.has(k) || a[k] === null || a[k] === '' && k !== 'input');
    if (missing.length) add(lvl, 'actions', actionsPath, a._line, `${a.action_id}: missing ${missing.join(', ')}`);
    if (a._keys.has('kind') && !KINDS.includes(a.kind)) add('ERROR', 'actions', actionsPath, a._line, `${a.action_id}: kind "${a.kind}" must be one of ${KINDS.join(' | ')}`);
    if (a._keys.has('requires_backend') && typeof a.requires_backend === 'boolean' && KINDS.includes(a.kind) && a.requires_backend !== (a.kind === 'backend'))
      add('ERROR', 'actions', actionsPath, a._line, `${a.action_id}: requires_backend=${a.requires_backend} contradicts kind=${a.kind}`);
  }
  const declared = new Set(actions.map(a => a.action_id));
  for (const [id, locs] of usedActions) if (!declared.has(id))
    add(HANDOFF ? 'ERROR' : 'WARN', 'actions-sync', locs[0].file, locs[0].line, `data-action="${id}" is not declared in ACTIONS.yaml`);
  for (const a of actions) if (a.kind !== 'navigation' && !usedActions.has(a.action_id))
    add('WARN', 'actions-sync', actionsPath, a._line, `${a.action_id} is declared but no element uses data-action="${a.action_id}"`);
} else {
  add(HANDOFF ? 'ERROR' : 'WARN', 'actions', null, null, '.webfactory/design/ACTIONS.yaml not found — record actions while building');
}

// ---------- handoff ----------
if (HANDOFF) {
  const statePath = path.join(wf, 'STATE.yaml');
  const designPath = path.join(wf, 'design', 'DESIGN.md');
  if (!fs.existsSync(statePath)) add('ERROR', 'handoff', null, null, '.webfactory/STATE.yaml missing');
  else {
    const s = parseYamlMap(fs.readFileSync(statePath, 'utf8'));
    const need = (cond, msg) => { if (!cond) add('ERROR', 'state', statePath, null, msg); };
    need(s.project && s.project.stage, 'project.stage missing');
    need(s.design && s.design.status === 'approved', `design.status must be "approved" (is "${s.design?.status}")`);
    need(s.design && s.design.locked === true, 'design.locked must be true');
    need(s.design && s.design.approved_at, 'design.approved_at missing');
    need(s.design && s.design.approval_quote, 'design.approval_quote missing (the user\'s approving words)');
    need(s.frontend && s.frontend.status === 'prototype_complete', 'frontend.status must be "prototype_complete"');
    for (const st of ['contract', 'backend', 'integration', 'qa', 'deploy'])
      need(s[st] && s[st].status, `${st}.status missing (should be "pending")`);
    if (s.frontend?.entry && !fs.existsSync(path.join(root, s.frontend.entry))) add('ERROR', 'state', statePath, null, `frontend.entry ${s.frontend.entry} does not exist`);
  }
  if (!fs.existsSync(designPath)) add('ERROR', 'handoff', null, null, '.webfactory/design/DESIGN.md missing');
  else {
    const d = fs.readFileSync(designPath, 'utf8');
    if ((d.split(/\r?\n/).find(l => l.trim()) || '').trim() !== 'DESIGN_STATUS = APPROVED') add('ERROR', 'design-doc', designPath, 1, 'First line must be exactly: DESIGN_STATUS = APPROVED');
    const sections = ['Rules for downstream', 'Design concept', 'Pages', 'Sections', 'Components', 'Typography', 'Color system', 'Spacing', 'Responsive behavior', 'Interaction behavior', 'Signature element', 'Mock boundary', 'Placeholder content', 'Change log'];
    for (const sct of sections) if (!new RegExp(`^#{1,3}\\s+${sct}`, 'im').test(d)) add('ERROR', 'design-doc', designPath, null, `Missing section "${sct}"`);
    if (!/^#{1,3}\s+Open questions/im.test(d)) add('WARN', 'design-doc', designPath, null, 'No "Open questions" section — are there really no business rules to decide?');
    const leftovers = d.match(/<Project name>|YYYY-MM-DD|<user's exact words>|<Page>|<Section>|<Name>/);
    if (leftovers) add('ERROR', 'design-doc', designPath, lineOf(d, leftovers.index), `Template placeholder left in DESIGN.md: ${leftovers[0]}`);
    if (!/--[a-z0-9-]+|#[0-9a-fA-F]{6}\b/.test(d)) add('ERROR', 'design-doc', designPath, null, 'No token names or hex values — the color system must be concrete');
  }
}

// ---------- report ----------
const errors = findings.filter(f => f.level === 'ERROR'), warns = findings.filter(f => f.level === 'WARN');
if (JSON_OUT) {
  console.log(JSON.stringify({ root, scanned: path.relative(root, srcDir) || '.', files: files.length, actions_used: [...usedActions.keys()], actions_declared: actions ? actions.map(a => a.action_id) : null, errors: errors.length, warnings: warns.length, findings }, null, 2));
} else {
  console.log(`WebDesigner check · ${files.length} files in ${path.relative(root, srcDir) || '.'}${HANDOFF ? ' · handoff mode' : ''}`);
  for (const f of [...errors, ...warns]) console.log(`${f.level.padEnd(5)} [${f.rule}] ${f.file}${f.line ? ':' + f.line : ''}${f.file ? ' — ' : ''}${f.msg}`);
  console.log(`\n${errors.length} error(s), ${warns.length} warning(s)` + (errors.length ? ' — fix errors before presenting / handing off' : ' — OK'));
}
process.exit(errors.length ? 1 : 0);
