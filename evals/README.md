# Eval suite

| File | Purpose |
|---|---|
| `evals.json` | 8 scenarios (5 creation + 3 iteration/lock traps) with named assertions |
| `grade.mjs` | Automatic grader. Writes `grading.json` per run plus `benchmark.json` / `benchmark.md` |
| `RUBRIC.md` | 9-criterion 1–5 rubric for human or blind grading |
| `fixtures/baan-khanom/` | A pre-built prototype, in review, used by evals 6–8 |
| `results/` | Committed benchmark summaries from past iterations |
| `regression/checker.test.mjs` | Unit tests for `check.mjs`. Run `node evals/regression/checker.test.mjs` |
| `build-review.mjs` | Builds `review.html`, a side-by-side view of both runs of each scenario |

## Running

1. For each eval, create `<workspace>/iteration-N/eval-<id>-<name>/{with_skill,without_skill}/outputs/project/`.
   For evals 6–8, copy `fixtures/baan-khanom/` into `project/` first.
2. Run the prompt twice: once with the agent told to follow `skills/web-designer/SKILL.md`,
   and once without it. Tell both that the user can't answer follow-up questions. Save the
   final chat reply to `outputs/response.md`.
3. Optionally save `timing.json` (`total_tokens`, `total_duration_seconds`) in each run dir.
4. Grade:

```bash
node evals/grade.mjs web-designer-workspace/iteration-1
```

5. Open the prototypes side by side and score them with `RUBRIC.md`.
