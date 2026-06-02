# CoveredUSA Pipeline Hardening — Ralph Plan

**Created:** 2026-06-01
**Goal:** Make write → drip-queue → publish → verify → sheet-status permanently consistent so no page can ever be stranded by a slug mismatch again, and drain the ~80 currently-stuck pages.
**Working dir:** /Users/jacobposner/clawd/projects/covered-usa

---

## Root cause (traced, confirmed)

The **slug** is the join key across five stages, but it can diverge:
- `pick` builds `OUTPUT_FILE` from the sheet's `topic_slug` (which may contain a year).
- The **writer** takes the slug from `OUTPUT_FILE`, **strips the year to pass GATE A**, and saves the year-stripped file. Nothing writes the corrected slug back to the sheet.
- The **publisher** looks up the file by the sheet's `topic_slug` (still has the year) → file not found → skip.
- The **15/day cap is applied BEFORE the existence filter**, so mismatched rows in the top-15 burn the day's slots → only ~4 ship.

Invariant we must enforce: **filename == sheet topic_slug == publisher lookup == route**, always GATE-A-valid (no year).

---

## Success criteria (DONE when ALL true)

- [ ] No writable/Ready backlog row has a year in `topic_slug` or `route` (verified by grep over sheet).
- [ ] Every Ready row maps to a file that actually exists on drip-queue or main (publisher dry-run shows 0 file-missing skips among Ready).
- [ ] Publisher dry-run ships a FULL 15 (not ~4) and never lets a skip waste a cap slot.
- [ ] `pick` normalizes any year-bearing slug AND writes the clean `topic_slug`+`route` back to the sheet, so the writer always receives a clean slug. (Verified by feeding a synthetic year-slug row through pick and confirming the sheet is corrected.)
- [ ] Publisher has a deterministic fallback (exact → year-stripped → unique normalized dir match) and self-heals the sheet when it resolves via fallback. (Verified by unit-style test.)
- [ ] The 1 false-Published row (`is-medicare-part-b-mandatory`) is corrected.
- [ ] An independent agent traces the full pipeline and confirms no stranding path remains; its findings are addressed.
- [ ] Live publish of a small real batch succeeds end-to-end (proves the chain).

---

## Tasks

### T1 — Harden the publisher (`scripts/coveredusa-drip-publish.js`)
- Apply MAX_PER_DAY cap AFTER resolving which Ready rows have a real file (resolve all Ready, then take first 15 shippable).
- File resolution order per row: exact `topic_slug.json` → year-stripped `topic_slug.json` → unique normalized match in the template dir on drip-queue. Skip only if 0 or >1 candidates.
- When resolved via fallback, reconcile the sheet (set `topic_slug`+`route` to the actual filename) so future lookups are exact.
- Verify: `node scripts/coveredusa-drip-publish.js --dry-run` ships 15, 0 spurious skips.

### T2 — Harden `pick` (scripts/cloud/coveredusa-batch-pick.js)
- Add a `normalizeSlug()` (strip year, collapse/trim hyphens). At pick time, if a row's `topic_slug` contains a year, compute the clean slug, and WRITE it back to the sheet (`topic_slug` col D + `route` col C) before returning the row, with collision guard.
- The returned `output_file`/`writer_args` use the clean slug.
- Verify: synthetic year-slug row → pick → sheet shows clean slug + clean route.

### T3 — Reconcile the existing stuck data (one-time)
- For each Ready row (and the 1 false-Published): find its actual file on drip-queue (exact → year-strip → unique normalized match); set `topic_slug`+`route` to the real filename. Flip false-Published back to Ready. Log old→new.
- Leave genuinely-live Published rows (file on main) untouched — no live URL moves.
- Verify: re-run the publisher simulation → top-15 all resolve.

### T4 — End-to-end test
- Publisher `--dry-run` (ships 15, 0 mismatched skips).
- `pick --stats` + a real small `--limit=5` live publish to prove the chain (these are real pages that should go live).

### T5 — Independent adversarial verification
- Spawn a fresh general-purpose agent: trace pick → writer → drip-queue → publisher → sheet, hunt for ANY remaining path where a written page can be stranded or a slug can diverge; check edge cases (qa-x-state subtype, event-x-state, glossary, collisions, route prefixes, Spanish/es routes, deferred templates). Address every finding. Repeat until clean.

### T6 — Ship + propagate
- Commit + push pick + publisher to covered-usa main. Confirm the Mac Mini will pick up the new publisher (Syncthing/git). Report.

---

## Notes / handoff
_(filled during execution)_
