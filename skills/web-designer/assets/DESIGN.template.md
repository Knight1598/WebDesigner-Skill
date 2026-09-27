DESIGN_STATUS = APPROVED

# <Project name>: Design v<N>

- Approved: YYYY-MM-DD · Quote: "<user's exact words>"
- Prototype: `web/index.html` (static HTML/CSS/JS)

## Rules for downstream skills
- Do not change tokens, typography, layout, spacing, copy, imagery or motion unless the user explicitly asks.
- You may wire `data-action` handlers to real APIs, replace `web/mock-data.js`, and add non-visual attributes.
- If the backend forces a UI change (a new field, error type or step), propose it to the user and route it back to the web-designer skill as a revision.
- New states reuse the existing state components and tokens.

## Design concept
- Visual concept:
- Page personality:
- Typography direction:
- Color strategy:
- Spacing rhythm:
- Layout principle:
- Interaction language:
- Signature element:
- Rejected defaults:

## Pages
| Page / view | File | Purpose |
|---|---|---|

## Sections
### <Page>
1. **<Section>**: purpose · composition · mobile change

## Components
| Component | Used in | Variants | States | Selector / file |
|---|---|---|---|---|

## Typography
| Role | Family | Weight | Size (mobile → desktop) | Line-height |
|---|---|---|---|---|
Loading: …

## Color system
| Token | Value | Role | Contrast note |
|---|---|---|---|

## Spacing
Scale: … · Section rhythm: … · Shape/radius: …

## Responsive behavior
| Breakpoint | Changes |
|---|---|
| ≤ 599 px | |
| 600–1023 px | |
| ≥ 1024 px | |

## Interaction behavior
- Motion tokens: …
- Modals / drawers / tabs / forms / toasts: …
- Keyboard & reduced motion: …

## Signature elements
- **<Name>**: where · why it fits · how to preserve it

## Mock boundary
- Mock data: `web/mock-data.js`
- Faked actions: see `ACTIONS.yaml` (`requires_backend: true`)
- Error demo: …

## Placeholder content (replace before launch)
- …

## Open questions for the owner / backend
- …

## Change log
- v1 · YYYY-MM-DD · approved
