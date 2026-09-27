# Example workflow — "บ้านขนมป้านวล"

A condensed real-shape session. The prototype from step 2 is in
[`evals/fixtures/baan-khanom/`](../evals/fixtures/baan-khanom/).

## 1. The request

> ทำเว็บให้ร้านขนมไทยของแม่หน่อย ชื่อบ้านขนมป้านวล อยู่ตลาดพลู เปิดเช้าถึงบ่ายโมง อยากให้คนสั่งจองล่วงหน้าได้

## 2. Assistant: direction, then build (same turn)

> **Design Direction**
> - **Concept**: ถาดขนมบนใบตองยามเช้า (a morning tray of sweets on banana leaves). The page reads like the tray on the shop's counter.
> - **Personality**: warm, homely, with old-shop credibility. Not a luxury bakery and not cutesy.
> - **Type**: Trirong for headings (a Thai serif, old-sign feel) and Sarabun for text (readable for older customers).
> - **Color**: coconut-cream ground #F6EFE2, palm-sugar ink #3A2A1E, banana-leaf green #2F6B4F used *only* for actions, and golden-sweet #C98A1B for highlights.
> - **Spacing**: 8 px base. Airy hero, tight menu list.
> - **Layout**: an asymmetric hero (text left, tray right) and the menu as a price list like a shop board, not cards.
> - **Interaction**: a light press on buttons; tabs filter the menu instantly.
> - **Signature**: the leaf-cut corner (`0 24px 0 24px`) on the tray and buttons, and the hero "tray" of the day's sweets.
> - **Rejected defaults**: a gradient hero (says nothing about the shop), three "why us" cards (swapped for one story paragraph), and rounded-xl everywhere (the leaf corner replaces it).
>
> Built at `web/index.html`. Try: the เมนู button on mobile, the นึ่ง/ทอง ๆ tabs, and สั่งจองล่วงหน้า → submit (tick "โหมดทดสอบ" to see the error screen).
> Checks: automated passed · opened at 390/834/1440.
> Assumptions: prices and address are samples, and there's no delivery.

## 3. Feedback round

> User: ปุ่มสั่งจองใหญ่ขึ้นอีกหน่อย แล้วหัวข้อ "ขนมวันนี้" สีเข้มกว่านี้

> Changed: `.hero .btn-primary` padding 14/22 → 18/30 px, min-height 48 → 56 px; `h2` color `--color-ink-muted` → `--color-ink`. Nothing else touched.

## 4. Approval

> User: โอเค ผ่าน ใช้แบบนี้เลย

The assistant runs `check.mjs`, finds that the modal's × button has no `data-action`, adds
`data-action="close_preorder"` (a non-visual fix), then writes:

```
.webfactory/
├── STATE.yaml            design.status: approved · locked: true · approval_quote: "โอเค ผ่าน ใช้แบบนี้เลย"
└── design/
    ├── DESIGN.md         DESIGN_STATUS = APPROVED …
    └── ACTIONS.yaml      toggle_mobile_nav, filter_menu, open_preorder, close_preorder, submit_preorder
```

It runs `check.mjs --handoff` until it's clean and tells the user:

> ล็อกดีไซน์แล้วครับ (v1) ขั้นต่อไปจะใช้ไฟล์ใน .webfactory เพื่อทำระบบรับออเดอร์จริง
> ถ้าอยากแก้หน้าตาทีหลังก็บอกได้ จะบันทึกเป็นเวอร์ชันใหม่

(The design is locked (v1). The next stage will use the files in `.webfactory` to build the
real order system. If you want to change the look later, just say so and it will be saved as
a new version.)

## 5. Next stage

A backend skill reads `ACTIONS.yaml`. `submit_preorder` is `requires_backend: true`, with its
inputs, success and error states defined, so it builds the order API and replaces the mock
in `app.js` without touching the visual design.
