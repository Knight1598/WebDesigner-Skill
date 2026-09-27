# Evaluation rubric — Baseline AI vs WebDesigner

Each run is scored in two ways:

1. **Assertions (automatic)**: `node evals/grade.mjs <iteration-dir>`. These are objective
   pass/fail checks, listed per eval in `evals.json`. Some assertions test WebDesigner-specific
   deliverables (`STATE.yaml`, `ACTIONS.yaml`). A baseline is *expected* to fail those, and
   that gap is part of what the skill adds.
2. **Rubric (human or blind grader)**: score 1–5 on the 9 criteria below. Show the grader
   both prototypes *unlabelled*, in random order, at 390 px and 1440 px.

| # | Criterion | 1 (poor) | 3 (ok) | 5 (excellent) |
|---|---|---|---|---|
| 1 | **Visual hierarchy** | Everything shouts; the main action is unclear | The main action is findable; some competing elements | The eye goes goal → proof → action without effort |
| 2 | **Originality** | Could be any company with the logo swapped | Some specific touches | A distinct concept that could only be this business |
| 3 | **Brand fit** | The mood contradicts the business or audience | Neutral and inoffensive | Type, color and tone clearly express the brief's personality |
| 4 | **UX quality** | Confusing flow, missing labels, poor contrast | Usable with minor friction | Clear flow, good forms, AA contrast, keyboard-friendly |
| 5 | **Responsive quality** | Breaks or scrolls sideways on mobile | Stacks correctly but is desktop-shrunk | Mobile *designed*: navigation, priority, sticky action, tables adapted |
| 6 | **Interaction completeness** | Dead buttons, and only the happy path | Main flow works, but states are missing | Every control works or is an explicit placeholder; loading, empty, error and success states exist |
| 7 | **Generic-AI avoidance** | Gradient hero, 3 cards, glass, uniform radius | One or two defaults, used without reason | Defaults avoided, or used deliberately with a stated reason |
| 8 | **Scope discipline** | Built a backend or DB, added unrequested features, redesigned on a small request | Minor drift | Exactly what was asked; the boundary is explained in plain words |
| 9 | **Handoff quality** | Nothing a backend developer can use | Some notes in chat | `.webfactory` files are complete and machine-checkable, with mock boundaries and open questions listed |

**Weighting for a single score**: 1–7 ×1, 8 ×1.5, 9 ×1.5, out of a maximum of 50.

## Trap evals (6–8)

These test the risk points that most often go wrong in real sessions:

- **6. Lock on clear approval**: the handoff must be valid, and it may fix only non-visual defects. The fixture deliberately has a modal × button without `data-action`.
- **7. Mixed approval ("โอเค แต่…")**: it must apply the change and *not* lock.
- **8. Vague feedback**: the change must stay inside the named section, with no global token edits.
