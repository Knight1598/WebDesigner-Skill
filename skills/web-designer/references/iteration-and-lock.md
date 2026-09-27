# Iteration, approval and post-lock revisions

## 1. Translating feedback into a scoped edit

Non-designers describe feelings, not properties. Map the feeling to the smallest set of
properties that produces it, change those, and say what you changed.

| User says | Likely properties | Usually NOT |
|---|---|---|
| "ปุ่มใหญ่ขึ้น" (bigger button) | the padding and font size of *that* button (and its variant token) | every button, or the layout |
| "ส่วนนี้แน่นไป" (this part is too crowded) | spacing and line-height in that section, and possibly dropping one element with permission | the global spacing scale |
| "Hero ยังไม่โดน" (the hero doesn't land yet) | headline copy, type scale and weight, composition and image in the hero | the nav, palette or other sections |
| "สีดูจืด" (the colors look dull) | accent saturation, ground/ink contrast | the brand hue family, unless the user asks |
| "ดูไม่พรีเมียม" (doesn't look premium) | type choice and scale, whitespace, fewer elements, finer lines | adding gradients and shadows |
| "ดูเด็กไป" (looks too childish) | radius, the playfulness of type, color saturation | the information architecture |
| "อ่านยาก" (hard to read) | font size, line-height, contrast, measure | the layout |

- When the target is ambiguous ("ตรงนี้", meaning "here"), and it has a clear best guess, use it and name it. If there's no clear guess, ask one short question that offers two or three options by name.
- For taste-level requests ("Hero ยังไม่โดน"), it's often best to offer two variants of *that section only*. Use a small dev-only switch, or two files (`index.html` and `index-hero-b.html`), and let the user pick. Remove the losing variant after they choose.
- If a request conflicts with usability (for example "ตัวหนังสือสีเทาอ่อนกว่านี้", lighter gray text, which would fail contrast), do it in the safest form possible and say briefly why you stopped where you did. Or offer a nearby alternative. Don't refuse silently or comply silently.
- If a fix needs a change outside the requested scope, say so *before* making it: "ถ้าขยายปุ่มนี้ แถบเมนูมือถือจะล้น ต้องลดข้อความเมนูลงด้วย โอเคไหม" (if I enlarge this button, the mobile menu bar will overflow, so I'd also need to shorten the menu labels; is that okay?).

## 2. What never happens during iteration

- Silent redesigns: changing sections, palette, fonts or layout the user didn't mention.
- New features or pages the user didn't ask for. Suggest them in one line instead.
- Architecture changes such as a new framework, a different folder structure or a CSS rewrite.
- Rewriting a whole large file for a small change.

After each round, run the checker, update `STATE.yaml` (`design.status: in_review`), add a
one-line entry in your reply ("แก้: ปุ่มจองใหญ่ขึ้น 48→56px, ขอบมนเท่าเดิม", which means
fixed: booking button enlarged from 48 to 56 px, same corner radius), and ask for the next
round or for approval.

## 3. Recognising approval (lock)

Lock only when the user approves **the design as a whole**, **after seeing it**, with **no
pending change request**.

| Message | Lock? | Response |
|---|---|---|
| "ผ่าน" / "ใช้แบบนี้เลย" / "เอาอันนี้" / "ดีแล้ว ไปต่อ" / "design approved" | Yes | Run the lock procedure |
| "โอเค" right after you presented a build and asked for feedback | Probably | If nothing else is pending, lock it. If the conversation had open threads, confirm in one line |
| "โอเค แต่ปุ่มใหญ่ขึ้นหน่อย" | No | Apply the change, then ask: "แก้แล้วครับ ถ้าโอเคทั้งหน้าแล้ว พิมพ์ 'ผ่าน' เพื่อล็อกดีไซน์" |
| "โอเค" in reply to "ขอใช้ฟอนต์นี้นะ?" (is this font okay?) | No | It answers that question only |
| "ถ้าออกมาดีก็ผ่านเลย" before any build | No | They haven't seen it. Build, show, then ask |
| "ส่วน hero ผ่านแล้ว" (the hero section is approved) | No, partial | Note that the hero is settled and avoid touching it. Continue with the rest |
| "เอาแบบ B" (between two variants) | No, it's a choice | Apply B, remove A, and ask about the whole page |

When unsure, a single confirmation question costs one message. A wrong lock costs a whole
revision cycle downstream.

## 4. Lock procedure

1. Run `check.mjs <root>`. Fix non-visual errors only. If an error needs a visual change, ask first.
2. Write the handoff: `DESIGN.md`, `ACTIONS.yaml` (complete it) and `STATE.yaml`, following `references/handoff.md`.
3. Run `check.mjs <root> --handoff` until it's clean.
4. Set STATE: `design.status: approved`, `design.locked: true`, `design.approved_at: <ISO date>`, `design.approval_quote: "<user's exact words>"`, `frontend.status: prototype_complete`, `project.stage: design`, and the next stage (`contract`) `pending`.
5. Tell the user in plain words that the design is locked, what files the next stage will use, and that they can still ask for changes, which will be recorded as a revision.

## 5. Changes after lock (design revision)

The lock stops *other skills* and *you* from changing the design unprompted. It doesn't stop
the user.

When the user asks for a visual change after approval:

1. Confirm that it's a change to the approved design. Usually it obviously is; don't make them re-justify it.
2. Set `design.status: revision_in_progress` and keep `design.locked: true`, because downstream skills must still not touch visuals.
3. Make the scoped edit, following the same rules as iteration.
4. If downstream stages have started (`contract`, `backend`, `integration` not `pending`), list which `action_id`s or components changed so those stages can update. Record this in the DESIGN.md change log.
5. When the user re-approves, bump `design.version`, set `status: approved`, update `approved_at` and `approval_quote`, and update DESIGN.md and ACTIONS.yaml.

## 6. Rules downstream skills must follow

These go into DESIGN.md so any later skill or developer sees them:

- Don't change tokens, typography, layout, spacing, copy, imagery or motion without an explicit user request.
- You may wire `data-action` handlers to real APIs, replace `mock-data.js` with real data, and add non-visual attributes.
- If the backend forces a UI change, such as a new required field, a new error type or a different flow step, propose it to the user and route it back to the web-designer skill as a revision. Don't restyle it yourself.
- New states the backend introduces, such as a rate-limit error, should reuse the existing state components and tokens.
