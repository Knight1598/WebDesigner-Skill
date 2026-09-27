# Design direction: making it original and appropriate

Read this on every new design. It turns "make it look good" into decisions you can defend.

## Contents
1. Where direction comes from
2. Generic-AI patterns and what to do instead
3. Signature elements by site type
4. Typography, including Thai
5. Color method
6. Spacing and layout
7. Site-type playbooks
8. Direction example

---

## 1. Where direction comes from

Original design is specific design. Mine the brief for concrete material before you choose
any style:

- **The thing itself**: what the product or service physically or emotionally is. A coffee roaster has beans, roast curves, paper bags, stamps and chalkboards. An accounting SaaS has ledgers, columns, reconciliations and calm.
- **The place and the people**: a neighbourhood, a market stall, a hospital corridor, a studio.
- **The moment of use**: rushed on a phone at a bus stop, or leisurely on a laptop on Sunday.
- **The one action**: the whole page leans toward it.

Turn that material into a *visual concept* phrased as a scene or metaphor. For example,
"ใบเสร็จร้านกาแฟที่มีลายแสตมป์" (a coffee-shop receipt with rubber-stamp marks) or "a
calm ledger". Style names like "modern and clean" are not concepts; they only describe the
default.

## 2. Generic-AI patterns and what to do instead

| Default pattern | Why it's weak | Try instead (only if it fits) |
|---|---|---|
| Centred hero on a gradient | Says nothing about the product, and every AI page has one | Left-weighted headline with the product *doing its job* beside it; an editorial split; a full-bleed photo-like composition; the headline set in the brand's material, such as a stamp, a receipt or a sign |
| Three equal feature cards | Three is arbitrary, and equal weight hides the key feature | One dominant feature and two supporting ones; a numbered sequence; a comparison table; a single annotated screenshot |
| Glassmorphism everywhere | Hurts contrast and readability, and dates quickly | Solid surfaces with one material cue, such as paper grain, a hairline border or a tinted panel |
| Uniform `rounded-xl` | Removes character and hierarchy | A deliberate shape language: square for data and ledgers, pill for tags only, and one signature radius or cut corner |
| Purple/blue gradient by default | It's the model's reflex rather than the brand's | Derive the palette from the material or place (§5) |
| Identical container per section | Creates a monotonous vertical stack | Vary the rhythm: full-bleed, narrow reading column, offset grid, a band with a different ground |
| Icon + heading + paragraph repeated | Makes content invisible because everything looks the same | Give each section its own form: a list, a table, a quote, a timeline, a map or a step flow |
| Dashboard wall of cards | Every metric gets equal volume, so there's no answer to "what needs attention?" | One headline status line, then a primary chart or table, and secondary metrics as a compact strip |
| Fake testimonials and client logos | Invented social proof | Leave it out, or use a clearly labelled sample (see Placeholder content in handoff) |
| Emoji as icons, generic line icons | Cheap and generic | A few icons from one consistent set, or none with typography doing the work |

These aren't banned; they're *defaults*. If one is truly right, for example cards for a
product grid in e-commerce, use it on purpose and make it specific, and say why in
"Rejected defaults".

## 3. Signature elements by site type

The signature should come out of the concept and help the goal. Some examples to adapt, not
to copy:

- **Landing / SaaS**: a hero where the headline flows into a live mini-demo of the product; a scroll-driven "before → after" of the user's messy workflow; a pricing section laid out like the product's own UI.
- **Café / restaurant / local shop**: the menu set like the real chalkboard or receipt; a hand-stamped "today's beans" band; a custom map card with the walking route from the BTS station.
- **Booking**: a time picker styled after the venue, such as a court grid, chair map or calendar board; a progress "ticket" that fills in as the user chooses; a confirmation shown as a boarding-pass-style stub.
- **Dashboard / internal tool**: a single "what needs attention now" line at the top written as a sentence; a dense and calm ledger-style table with inline sparklines; a command bar.
- **E-commerce product page**: an annotated product image with hotspots that explain materials; a size or variant selector that visualises the difference; an "in the box" exploded layout.
- **Portfolio**: an editorial index that works like a magazine table of contents; a project list that previews on hover as a cursor-following image; typographic case-study covers.

A signature is one or two things done well. Five competing gimmicks cancel each other out.

## 4. Typography, including Thai

- Pick at most two families: display plus text, or one family with strong weight contrast. Name them in the direction and say why they fit.
- Set a clear scale, for example 1.25 or 1.333 on mobile and larger on desktop, and use `clamp()` for fluid headings.
- Measure (line length): 45–75 characters for Latin text and roughly 30–45 Thai words' width. Put long reading text in a narrower column.
- **Thai text**: choose fonts with proper Thai glyphs. Good Google Fonts options include:
  - *looped*: Sarabun, Noto Sans Thai Looped, Chakra Petch (techy), Charm and Srisakdi (decorative, display only)
  - *loopless or modern*: Noto Sans Thai, IBM Plex Sans Thai, Anuphan, Kanit, Prompt, Bai Jamjuree, Mitr
  - *serif-like or editorial*: Noto Serif Thai, Trirong, Taviraj
  
  Use loopless for modern brands and display, and looped for long body text aimed at older or formal readers.
- Use a line-height of 1.6–1.8 for Thai body text. Thai has stacked vowels and tone marks that clip at tight line-heights. Headings can go down to about 1.25–1.35, but check that tone marks don't collide.
- Don't use uppercase transforms or wide letter-spacing on Thai; they don't apply and look broken. Keep letter-spacing tweaks for Latin labels.
- Thai has no spaces between words, so add `word-break: keep-all` with care and prefer `overflow-wrap: anywhere` only where needed. Check that headings don't break mid-word badly on mobile; use `<wbr>` or reword if they do.
- Load fonts with `display=swap`, give a system fallback stack (`"Noto Sans Thai", "Leelawadee UI", "Thonburi", system-ui, sans-serif`), and keep it to three or four weights in total.

## 5. Color method

1. **Source the palette** from the concept's material or place, such as roasted-bean brown and receipt paper, or hospital mint and signage red. Describe it in words first.
2. **Assign roles**: ground (background), surface, ink (text), muted ink, one accent (brand or action), and signal colors (success, warning, error), which are often muted versions tuned for the palette.
3. **Keep one accent for action**, so the user always knows what to click. Don't spend the accent on decoration.
4. **Check contrast**: body text at 4.5:1 or better, large text and UI boundaries at 3:1 or better. A tinted off-white ground with near-black ink usually beats pure white and pure black.
5. **Dark mode** only when it fits the audience or the user asks for it. If you do it, define it with the same tokens.

Write the tokens as CSS variables named by role (`--color-ground`, `--color-ink`,
`--color-accent`), not by hue. The handoff and iteration requests depend on these names.

## 6. Spacing and layout

- Choose a base unit (4 or 8 px) and a scale (`--space-1` … `--space-8`). Density follows the audience: dashboards and tools are tighter, while editorial and hospitality pages are airier.
- Vary section rhythm on purpose: a tight band followed by a generous breathing section. Monotony comes from equal padding everywhere.
- Use a grid, then break it once on purpose; that break is often where the signature lives.
- On mobile, re-order by priority rather than by desktop position. The primary action should be reachable without hunting; consider a sticky bottom CTA for booking and buying.

## 7. Site-type playbooks

**Landing page / SaaS**: in the first view, say what it is, who it's for and the primary
action. Then show proof of how it works (a demo, a screenshot or steps), then objections
(pricing and FAQ), then repeat the action. Avoid feature-grid monotony.

**Café / restaurant / local business**: people want the menu, the opening hours, the
location and how to order or book, fast and on a phone. Put hours and directions within one
scroll on mobile. Atmosphere comes through typography and color, not through huge
decorative sections.

**Booking application**: the flow is service, then date and time, then details, then
confirm. Show progress, keep the chosen items visible (a summary or ticket), and show
unavailable slots clearly (disabled, with the reason). Mock availability data, and include
validation errors plus loading, success and failure states. Add the error-state demo trigger.

**Admin dashboard / internal tool**: answer "what needs my attention?" first. Use tables
with sorting and filtering that works on local mock data, bulk actions (mocked), and empty
and error states. Keyboard use matters. Aim for dense but readable. On mobile, show triage
views (lists and key numbers), not the full desktop table.

**E-commerce product page**: include a gallery, name, price, variant selection with visible
state, quantity, a clear add-to-cart action (mocked with cart-drawer feedback), delivery and
returns info, details or specs, and reviews (placeholder-labelled). Keep the price and
add-to-cart reachable on mobile, for example with a sticky bar.

**Portfolio**: the work is the hero, so let the typography and composition carry the
personality and keep the chrome minimal. Make case-study navigation clear.

## 8. Direction example (compact)

> **Visual concept**: ใบเสร็จร้านกาแฟที่มีลายแสตมป์ (a coffee-shop receipt with rubber-stamp marks). Content reads like a printed menu slip.
> **Personality**: อบอุ่น ตรงไปตรงมา มีฝีมือ (warm, direct, crafted). Not a luxury café or a chain.
> **Typography**: Anuphan for headings (compact, confident Thai) plus IBM Plex Sans Thai for text. Monospace figures for prices, like a receipt.
> **Color**: receipt paper #F4EFE6 ground, roasted ink #2B1D14, stamp red #B8432F as the single action accent, and faded blue #5C7285 for info.
> **Spacing**: 8 px base. Tight inside the menu, generous around the story section.
> **Layout**: a narrow receipt column for the menu, set against a wide, offset photo-like band. The sections alternate paper and ink grounds.
> **Interaction**: small "stamp" press on buttons, with a 120 ms scale and ink-spread. The menu filter tabs slide like tearing a slip.
> **Signature**: the menu is set as a long receipt with a torn edge, and prices use tabular figures.
> **Rejected defaults**: a centred gradient hero (it says nothing about coffee), three "Why us" cards (replaced by one story paragraph and one photo), and a rounded glass nav (it loses the paper feel).
