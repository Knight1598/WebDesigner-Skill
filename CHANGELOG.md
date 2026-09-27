# Changelog

All notable changes to WebDesigner. Format: [Keep a Changelog](https://keepachangelog.com/),
versioning: [SemVer](https://semver.org/).

## [1.1.0] — 2026-09-27

Fixes for misses found in eval iteration-1 (`evals/results/iteration-1/`).

### Fixed
- `check.mjs` now counts `data-action` on elements rendered from JS (template strings,
  `dataset.action`, `setAttribute`) and on `<input>` / `<select>`. It no longer reports
  false "declared but unused" warnings on dashboards and booking forms.
- The design direction shown to the user must keep all nine labelled lines. A booking run
  had dropped spacing and interaction when rephrasing.

### Added
- `check.mjs` warns about `overflow-x: auto` without `overflow-y`, which gives tab rows a
  stray vertical scrollbar (seen in the coffee-shop run).
- Breakpoint checklist: the header must fit on one line at 360 px, and secondary or
  placeholder items move into the menu (a dashboard header wrapped onto 3 lines).
- Run the checker without `cd`-ing into the project, because Windows long paths stopped
  `node` from launching.
- Regression tests: `evals/regression/checker.test.mjs` and the `direction_all_nine` grader.

## [1.0.0] — 2026-09-27

### Added
- `web-designer` skill: design-first workflow (brief → 9-line design direction → structure →
  prototype → verify → review → scoped iteration → design lock → handoff).
- Anti-generic design catalogue, signature-element patterns, Thai typography guidance
  (`references/design-direction.md`).
- Build conventions: role-named CSS tokens, `data-action` wiring, mock-state recipes,
  breakpoint checklist (`references/build-and-verify.md`).
- Approval detection rules that refuse to lock on mixed/early/partial approvals, and
  post-lock revision flow (`references/iteration-and-lock.md`).
- `.webfactory` handoff spec + templates: `DESIGN.md`, `ACTIONS.yaml`, `STATE.yaml`.
- `scripts/check.mjs` (zero-dependency Node): button integrity, dead links, ACTIONS sync,
  backend-boundary & secret detection, accessibility basics, `file://` pitfalls, Thai type
  checks, generic-pattern smells, handoff validation.
- Claude Code plugin manifest + marketplace; Codex install path.
- Eval suite: 5 creation scenarios + 3 iteration/lock scenarios with rubric.
