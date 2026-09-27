# WebDesigner

> Design-first AI skill that turns a plain-language website idea into an original, responsive,
> interaction-ready frontend and locks the approved design for backend handoff.

**Version 1.1.0** · for **Claude Code** and **Codex** · Thai and English

WebDesigner makes your AI coding assistant work like a senior web designer, UI/UX designer
and frontend art director. Describe the site you want in everyday words. You get a
prototype you can open and click, you refine it by saying what you feel, and when you say
**"ผ่าน"** the design is locked and packaged for the backend stage.

You don't need to know UI/UX or programming.

## What makes it different from asking an AI "make me a website"

| Plain AI | WebDesigner |
|---|---|
| Starts coding immediately | Decides a 9-line **Design Direction** first (concept, type, color, rhythm, layout, interaction, signature, *rejected defaults*) |
| Centred gradient hero, 3 cards, purple/blue, rounded-xl everything | Actively avoids generic AI patterns, and each visual choice traces back to the product, brand or audience |
| Looks the same as every other AI site | At least one **signature element** that fits the business |
| Decorative buttons that do nothing | Every button is frontend, navigation, backend (mocked) or an explicit placeholder, and is recorded in `ACTIONS.yaml` |
| Mobile = shrunk desktop | Mobile is designed: navigation, hierarchy, tables and forms are reconsidered |
| "Make the button bigger" → redesigns half the page | Scoped iteration: changes only what you asked, and asks before touching anything else |
| No clear end | Design lock (`DESIGN_STATUS = APPROVED`) plus a handoff package |
| May wire up a fake database or real APIs | Strict backend boundary, with mocks and loading/success/error states |

## Quick start

1. Install it (see [INSTALL.md](INSTALL.md)). In Claude Code:
   ```
   /plugin marketplace add Knight1598/WebDesigner-Skill
   /plugin install webdesigner@webdesigner
   ```
2. Ask: *"ทำเว็บร้านกาแฟเล็ก ๆ ย่านอารีย์ ให้คนดูเมนูและจองโต๊ะได้"*
3. Open `web/index.html`, try it, and give feedback in plain words.
4. Say **"ผ่าน"** when you're happy. The handoff appears in `.webfactory/`.

More in [docs/USAGE.md](docs/USAGE.md) and the step-by-step [docs/WORKFLOW.md](docs/WORKFLOW.md).

## The workflow

```
brief → design direction → structure → prototype → verify (desktop/tablet/mobile)
      → you review → scoped fixes ↺ → "ผ่าน" → DESIGN LOCK → handoff
```

## Handoff package

```
.webfactory/
├── STATE.yaml          # project stage + design status (approved, locked)
└── design/
    ├── DESIGN.md       # concept, pages, sections, components, tokens, responsive, interactions, signature
    └── ACTIONS.yaml    # every button/form: purpose, input, expected result, backend?, success/error states
```

The next skill (backend, API, integration) builds the real system from these files and must
not change the approved visual design unless you ask.

## Repository layout

```
skills/web-designer/
├── SKILL.md                      # the skill
├── references/                   # loaded on demand: direction, build & verify, iteration & lock, handoff
├── assets/                       # DESIGN / ACTIONS / STATE templates
└── scripts/check.mjs             # zero-dependency checker (Node 18+)
evals/                            # eval suite, rubric, fixtures
docs/                             # usage examples, example workflow
.claude-plugin/                   # Claude Code plugin + marketplace manifests
```

## Not in scope

This isn't a backend builder, database architect, API builder, deployment tool or QA
suite. It prepares clean input for those stages.

## Evaluation

See [evals/README.md](evals/README.md). There are 8 scenarios: a SaaS landing page, a café,
a booking app, an admin dashboard, an e-commerce product page, and 3 iteration/lock traps.
Each is scored on 9 criteria, comparing a baseline AI with WebDesigner.

## License

**Pending owner decision.** See [LICENSE.md](LICENSE.md). Until a license is chosen, all
rights are reserved.
