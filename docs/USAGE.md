# Usage examples

Talk normally. You don't need design or programming words.

## Start a new site

> ทำเว็บให้ร้านซ่อมจักรยานของผมหน่อย อยู่แถวอารีย์ ลูกค้าส่วนใหญ่เป็นคนทำงานที่ปั่นไปออฟฟิศ อยากให้จองคิวซ่อมได้

> I need a landing page for my invoicing app for Thai freelancers. It should feel trustworthy but not boring.

> อยากได้หน้า dashboard ไว้ดูออเดอร์ร้านออนไลน์ ของเยอะ ต้องค้นหาได้ กรองสถานะได้

What you get back:
1. A short **Design Direction** (concept, fonts, colors, the signature idea, and the defaults it avoided)
2. A working prototype in `web/` that you open by double-clicking `web/index.html`
3. What to try clicking, and the assumptions it made

## Give feedback (iteration)

Say what you feel. It changes only that part:

| You say | It changes |
|---|---|
| ปุ่มจองใหญ่ขึ้นหน่อย | That button's size only |
| ส่วนรีวิวแน่นไป | Spacing in the reviews section only |
| Hero ยังไม่โดน | The hero only, often as 2 variants for you to pick from |
| สีดูจืด | Accent/contrast only, and it tells you what changed |
| เพิ่มหน้า FAQ | A new page, because you asked. It won't add pages on its own |

If a change would affect something else, it asks you first.

## Approve (lock the design)

> ผ่าน · ใช้แบบนี้ · เอาอันนี้ · ดีแล้ว · design approved

It then writes the handoff (`.webfactory/`) for the backend stage. If you write
"โอเค แต่…" with another change, it makes the change and asks again before locking.

## After the lock

You can still change things. Say "ขอแก้หน้าแรกอีกนิด…" and it records the edit as a design
revision (v2), then tells the backend stage what changed.

## Using references

> เอาฟีลแบบเว็บนี้ [link/screenshot] แต่เป็นร้านเรา

It extracts the style (layout logic, type, color behaviour, density) and designs something
new for you. It doesn't copy the page.

## What it won't do

It won't build a real database, login, payment, API, server, or email sending. Buttons that
need these work as *demos* (with loading, success and error screens) and are listed in
`ACTIONS.yaml` for the next stage.
