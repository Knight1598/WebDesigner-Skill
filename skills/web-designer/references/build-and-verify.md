# Build and verify

## Contents
1. File layout
2. Tokens
3. Action wiring convention
4. Mock-state recipes
5. Component checklist
6. Breakpoint checklist
7. Running the checks
8. Honest reporting

---

## 1. File layout (new project, no framework)

```
<project-root>/
├── web/
│   ├── index.html        # entry page. Add more pages as extra .html files
│   ├── styles.css        # tokens first, then base, layout, components, utilities
│   ├── app.js            # UI behaviour (vanilla JS, no build)
│   └── mock-data.js      # every piece of fake data the UI renders (optional)
└── .webfactory/
    ├── STATE.yaml
    └── design/
        ├── ACTIONS.yaml  # grows while you build
        └── DESIGN.md     # written at approval
```

Load `mock-data.js` before `app.js` with plain `<script>` tags, not ES modules, so opening
the file directly (`file://`) works in every browser. ES modules are blocked from `file://`
in Chrome.

In an existing project, follow its structure. Place `.webfactory/` at the repository root.

## 2. Tokens

Tokens go at the top of `styles.css`, named by role:

```css
:root {
  /* color: roles, not hues */
  --color-ground: #F4EFE6;
  --color-surface: #FFFDF8;
  --color-ink: #2B1D14;
  --color-ink-muted: #6B5A4E;
  --color-accent: #B8432F;      /* the one action color */
  --color-accent-ink: #FFFFFF;
  --color-success: #3F7D58;
  --color-error: #B3261E;
  --color-line: #D9CFC2;
  /* type */
  --font-display: "Anuphan", "Noto Sans Thai", system-ui, sans-serif;
  --font-text: "IBM Plex Sans Thai", "Noto Sans Thai", system-ui, sans-serif;
  --text-base: 1rem;             /* ≥16px */
  --leading-thai: 1.7;
  /* space */
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-5: 24px; --space-6: 32px; --space-7: 48px; --space-8: 72px;
  /* shape and motion */
  --radius-1: 2px; --radius-2: 10px;
  --dur-fast: 120ms; --dur-med: 240ms; --ease: cubic-bezier(.2,.7,.2,1);
}
```

Components use tokens, not raw values. That's what makes "สีหัวข้อเข้มขึ้น" (make the
heading color darker) a one-line edit.

## 3. Action wiring convention

- Every `<button>`, `<form>`, `<a href="#">` / `<a>` without a real destination, and custom control (`role="button"`, `role="tab"`, `role="switch"`) carries `data-action="<action_id>"`.
- `action_id` is `snake_case` and states the verb and object: `open_menu`, `filter_menu_by_category`, `submit_booking`, `add_to_cart`.
- The same action in several places, such as two "จองเลย" buttons, shares one id. Record where it appears in the `element` field.
- Real navigation (`<a href="menu.html">`, `<a href="#location">` pointing to an existing id) needs no `data-action`, but it must point somewhere that exists.
- `placeholder` actions must be visibly placeholders, for example `aria-disabled="true"` with a "เร็ว ๆ นี้" (coming soon) tag or a toast that says the feature is coming. They must never be silent dead buttons.
- In JS, bind behaviour by delegating on `data-action` so the wiring is discoverable:

```js
const handlers = {
  open_menu: () => toggleDrawer(true),
  submit_booking: (el, e) => { e.preventDefault(); mockSubmit(el.closest('form')); },
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (el && el.tagName !== 'FORM' && handlers[el.dataset.action]) handlers[el.dataset.action](el, e);
});
document.addEventListener('submit', e => {
  const f = e.target.closest('form[data-action]');
  if (f && handlers[f.dataset.action]) handlers[f.dataset.action](f, e);
});
```

## 4. Mock-state recipes

**Backend-required submit (booking, contact, checkout, login UI)**

```js
async function mockSubmit(form) {
  if (!form.reportValidity()) return;              // native validation first
  setState(form, 'loading');                       // disable the button and show a spinner or text
  await new Promise(r => setTimeout(r, 900));
  const fail = form.querySelector('[name="demo_error"]')?.checked
            || new URLSearchParams(location.search).has('demo_error');
  setState(form, fail ? 'error' : 'success');      // success: a confirmation UI with a summary of what was sent
}
```

- The error state must be *reachable*, for example through a small labelled "โหมดทดสอบ: จำลองข้อผิดพลาด" (test mode: simulate an error) checkbox in the form footer, or `?demo_error` in the URL. Mention how in your message to the user.
- The success UI repeats back what was submitted (the booking summary), which helps the user judge the flow.
- Never pretend the data was saved. Copy like "ส่งคำขอแล้ว" (request sent) in a prototype is fine. Don't add fake persistence across reloads unless you label it as a demo.

**Local filtering and search**: filter the array from `mock-data.js` in memory. Build the
empty state ("ไม่พบรายการที่ตรงกับ…", no items match…) and a reset action.

**Loading and skeletons**: for data-driven views, show a skeleton for about 500 ms on first
render so the loading state exists and can be seen.

## 5. Component checklist

For each component you build, ask whether it has all of these:

- default, hover, focus-visible, active and disabled states
- loading, empty, error and success states where data or submit is involved
- a keyboard path. Modals: open, focus moves in, Tab is trapped, Esc closes, and focus returns. Tabs: the arrow keys move between tabs. Menus and drawers: Esc closes them.
- ARIA only where native HTML can't express the role (`aria-expanded`, `aria-controls`, `aria-selected`, `aria-live` for toasts and form results)
- respect for `prefers-reduced-motion` by reducing or removing non-essential motion

## 6. Breakpoint checklist

Check each item at about 1440, 834, 390 and 360 px:

- [ ] No horizontal scroll at any width. Watch fixed widths, long words, wide tables and 100vw with a scrollbar.
- [ ] The header row fits at 360 px on one line. Move secondary items and placeholders (such as "เร็ว ๆ นี้") into the menu instead of letting them wrap. Without a browser, check this by counting header items and their label lengths.
- [ ] Navigation changes form deliberately, for example a bottom bar or a drawer on mobile. There's no tiny desktop nav squeezed onto a phone.
- [ ] Hierarchy is re-ordered for mobile priority, and the primary action is visible early or sticky.
- [ ] The grid collapses with intent, for example 12 → 6 → 4 columns or a different composition, not just 3 → 1 stacks everywhere.
- [ ] The type scale steps down, headings don't break Thai words badly, and body text is at least 16 px.
- [ ] Buttons and targets are at least 44 px, with at least 8 px between targets.
- [ ] Forms: single column on mobile, correct `type` and `inputmode`, `autocomplete`, labels above the fields, errors inline next to the field.
- [ ] Tables become stacked rows or cards, or a priority-column view with details on tap.
- [ ] Complex UI (calendar, filters, sidebars) becomes a sheet, drawer or step flow on mobile.
- [ ] Images and compositions are cropped for the mobile aspect, not just scaled down.

## 7. Running the checks

```
node <skill-dir>/scripts/check.mjs <project-root>            # during build and iteration
node <skill-dir>/scripts/check.mjs <project-root> --handoff  # after approval
```

- `<skill-dir>` is the directory containing this skill's SKILL.md.
- Don't `cd` into the project to run it. Pass both paths as arguments, because on Windows a deep working directory can stop the shell from launching `node` ("path too long"). If that happens, run the command from a short directory, such as the skill directory or your home directory.
- The script has no dependencies and needs Node 18 or later. If Node is unavailable, perform the same checks by reading the code, and say that the automated check couldn't run.
- It scans `web/` if that exists, and otherwise the project root (ignoring `node_modules`, `dist`, `build` and `.git`). Pass `--src <dir>` to override.
- **Errors** must be fixed. **Warnings** are prompts for a design self-review: fix them, or keep the choice deliberately and be ready to say why.

For a visual check, use whatever the environment offers: a preview pane, a browser tool or
Playwright. Resize to each width, take a screenshot, and look. Click the primary flow end to
end, including the error path.

## 8. Honest reporting

Tell the user exactly what was verified. For example: "ตรวจอัตโนมัติผ่าน · เปิดดูจริงที่
390/834/1440 แล้ว" (automated checks passed · opened for real at 390/834/1440), or "ตรวจ
อัตโนมัติผ่าน · ยังไม่ได้เปิดดูในเบราว์เซอร์จริง เพราะไม่มีเครื่องมือเปิดเบราว์เซอร์ในเครื่องนี้"
(automated checks passed · not yet opened in a real browser, because this machine has no
browser tool). Never say something is responsive or works on mobile when you didn't look.
