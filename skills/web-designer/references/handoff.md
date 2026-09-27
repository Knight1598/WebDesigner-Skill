# Handoff package

The handoff is the contract between this skill and whatever builds the real system. That
might be a backend skill, another agent or a human developer. It must let them build the
backend *without re-deciding anything visual* and *without guessing what a button does*.

Three files, all under `.webfactory/` at the project root. Templates are in `../assets/`.

```
.webfactory/
├── STATE.yaml            # where the project is, and who may change what
└── design/
    ├── DESIGN.md         # the approved design, human- and agent-readable
    └── ACTIONS.yaml      # every meaningful action, machine-readable
```

## STATE.yaml

- Create it at the start of building with `design.status: in_progress`.
- Update it at review (`in_review`), at approval (`approved`, `locked: true`) and at revisions (`revision_in_progress`).
- Stage names are fixed: `design`, `contract`, `backend`, `integration`, `qa`, `deploy`. Each has a `status`. This skill only ever sets `design` and `frontend`. It leaves the other stages at `pending` and never marks them done.
- `project.stage` stays `design` when you hand off. The next skill advances it.

## ACTIONS.yaml

Start it during the build and add each action as you create the element. At approval,
complete every field.

Required fields for each action:

| Field | Meaning |
|---|---|
| `action_id` | snake_case. Equals the `data-action` value in the markup |
| `kind` | `frontend` · `navigation` · `backend` · `placeholder` |
| `element` | human description plus location, e.g. `ปุ่ม "จองเลย" — web/index.html hero + sticky bar` |
| `trigger` | `click` · `submit` · `change` · `input` · `keydown` · `load` |
| `purpose` | the user's intent in their words ("อยากจองโต๊ะคืนนี้", I want to book a table tonight) |
| `input` | the fields and values sent. Use `[]` when there are none. For backend actions, list name, type and required |
| `expected_result` | what should happen in the real system |
| `requires_backend` | `true` / `false` (true iff `kind: backend`) |
| `success_state` | what the UI shows on success, and where |
| `error_state` | what the UI shows on failure, including field-level validation messages |

Optional but valuable fields: `mock` (how the prototype fakes it, and how to trigger the
error demo), `notes`, and `open_questions`, which are business rules the backend must
decide, such as cancellation policy or stock rules. Never invent those rules as facts. List
them as questions.

A placeholder action still needs `purpose` and `expected_result` (what it will do later) and
`success_state: n/a` / `error_state: n/a`.

## DESIGN.md

It must contain, in this order:

1. `DESIGN_STATUS = APPROVED` on the first line, then the version, approval date and the approval quote.
2. **Rules for downstream skills**, copied from `iteration-and-lock.md` §6.
3. **Design concept**: the nine direction lines, updated to what was actually built.
4. **Pages**: each page or view, its file, and its purpose.
5. **Sections**: for each page, the ordered sections with a one-line purpose and composition notes.
6. **Components**: name, where they're used, variants, states, and the file/selector.
7. **Typography**: families, weights, the scale per breakpoint, line-heights (Thai), and loading.
8. **Color system**: the token table (name → value → role → contrast notes).
9. **Spacing**: the scale, section rhythm and radius/shape rules.
10. **Responsive behavior**: the breakpoints, plus what changes at each (nav, grid, tables, forms, sticky CTA).
11. **Interaction behavior**: motion tokens, and the behaviour of modals, drawers, tabs, forms and toasts, including keyboard support and reduced motion.
12. **Signature elements**: what, where, why, and how to preserve them.
13. **Mock boundary**: what is faked, where the mock data lives, and how to see the error states.
14. **Placeholder content**: every invented price, address, review, statistic and image that must be replaced with real data before launch.
15. **Open questions**: business rules the next stage needs from the owner.
16. **Change log**: `v1 · 2026-09-27 · approved`, then revisions.

Be precise and compact. Use tables for tokens and lists for everything else. Real values
(hex codes, px/rem, ms) matter more than prose.
