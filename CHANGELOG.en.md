# Changelog · doom.ui

中文: `CHANGELOG.md`

> Scope: namespace `doom.ui` (a UI framework built on `doom.schedule`'s SID session management).
> Target environment Minecraft 1.21.6 – 26.3; current version v2.1.0.
> The machine assertions (53 cases / 335 assertions) run on the real-machine acceptance bench in a private development repo; what this repo keeps is the manual look-and-feel checklist
> [`docs/03-示例调用串.md`](docs/03-示例调用串.md) and the three runnable gates (`src/tools/`).
>
> ⚠️ How to read "all green": **findings** such as F-7 / F-9 are registered in the assertion table in the form of "defect detections" (expected value = the current defective behaviour),
> so 53 PASS / 0 FAIL ≠ these are fixed. The unfixed items are below (F-9 ~ F-13; F-7 unfixed, and the README and this document agree on the scope (a residual segment never expires)).

---

## v2.1.0 · multi-version support (1.21.6 → 26.3) + correction of a case/assertion count typo, 2026-10-05

Downloads:
- [`dist/doom.ui-v2.1.0.zip`](dist/doom.ui-v2.1.0.zip), 1.21.9 – 1.21.10 (primary)
  · sha256 `a43b25377843e18e10a76dbcb7a0ee58f638a2c45ae52f88d03787b796ed2ddc`
- [`dist/doom.ui-v2.1.0-mc1.21.11+.zip`](dist/doom.ui-v2.1.0-mc1.21.11+.zip), 1.21.11 – 26.3
  · sha256 `70871ac529587644f5a019672d0d9de7e6f3dff6e9f7abcb3c56f889e6c6f83e`
- [`dist/doom.ui-v2.1.0-mc1.21.6-1.21.8.zip`](dist/doom.ui-v2.1.0-mc1.21.6-1.21.8.zip), 1.21.6 – 1.21.8
  · sha256 `e3ae746c8ee73a502b1a2561b09431b9ec6a983a56a139f61878d817695a71e7`

> Gameplay behaviour is exactly the same as v2.0-beta; of the 136 mcfunction files only 1 line changed (the `gamerule` name),
> and the rest are byte-for-byte identical. What this version changes is whether it can be installed at all.

### 1. Multi-version support table (MC version → which variant to use)

This pack has two version dividing lines, so it is split into three:

| MC version | data format | Which variant | `pack.mcmeta` | `gamerule` name |
|---|---|---|---|---|
| **1.21.6 / 1.21.7 / 1.21.8** | 80 / 81 | `v2.1.0-mc1.21.6-1.21.8` | Source pack **as-is** | old `maxCommandChainLength` |
| **1.21.9 / 1.21.10** | 88.0 | `v2.1.0` ★ | `sf 48–121` + `min [48,0]` + `max 121` | **old** `maxCommandChainLength` |
| **1.21.11 / 26.1 / 26.1.1 / 26.1.2 / 26.2 / 26.3** | 94.1 – 121.0 | `v2.1.0-mc1.21.11+` | same as above | **new** `max_command_sequence_length` |
| 1.21.5 and lower | ≤ 71 | ❌ Not supported | — | — |

The two dividing lines are:
1. 1.21.9, where `pack.mcmeta` mandates `min_format`/`max_format` (missing ⇒ the whole pack is rejected);
2. 1.21.11, where the `gamerule` is renamed (`maxCommandChainLength` → `max_command_sequence_length`),
   and the old name is a parse-time error on those versions ⇒ that whole branch of functions fails to load ⇒ the pack does not run at all.

> ⚠️ Why one pack cannot cover everything: the `gamerule` line is decided at **parse time**, and the old and new names **cannot both be legal** ✗
> ⇒ splitting is the only option ✓. (`modern-1.21.11+`'s mcmeta declares 48–121, and its `pack_format 81` covers 1.21.6–1.21.10,
> but those versions need the old gamerule name ⇒ in practice it cannot be used across them.)

### 2. What was fixed this round (two hard breakages)

① The `gamerule` rename happens in 1.21.11 (not 26.3) ✗✗

After fixing the mcmeta, 26.3 still errored, and the consequence was more serious than "incompatible" — the entire function failed to load and the pack never initialized:
```
[Server thread/ERROR]: Failed to load function doom.ui:__load__
java.util.concurrent.CompletionException: java.lang.IllegalArgumentException:
  Whilst parsing command on line 45: Incorrect argument for command at position 9: gamerule <--[HERE]
[Server thread/ERROR]: Couldn't load tag doom.ui:load as it is missing following references: doom.ui:__load__
[Server thread/ERROR]: Couldn't load tag minecraft:load as it is missing following references: doom.ui:__load__
```
Root cause: `gamerule maxCommandChainLength 2147483647` on `__load__.mcfunction:45`.

Precise rename table and the version it happened in (jar constant pool + on-machine evidence from both 1.21.10 and 26.3):

| Version | `maxCommandChainLength` | `max_command_sequence_length` |
|---|---|---|
| 1.21.5 – 1.21.10 | ✅ this name only | ❌ |
| **from 1.21.11** | ❌ (only a leftover in the datafixer) | ✅ canonical name table in `GameRules.class` |

> ⚠️ Do not conflate them: `maxCommandForkCount` → `max_command_forks` is a **different** rule,
> not the same thing as `maxCommandChainLength` → `max_command_sequence_length` ✗.
> A rename-class fix must get paired evidence for "old name → new name" (the datafixer constant pool); you cannot guess from semantics or default values.

The fix:
```diff
- gamerule maxCommandChainLength 2147483647
+ gamerule max_command_sequence_length 2147483647
```
After the fix, on 26.3: 0 load errors ✓, `__load__` runs normally ✓, `gamerule max_command_sequence_length` reads back 2147483647 ✓, self-assertions 15/15 PASS ✓.

② `pack.mcmeta` was missing `min_format`/`max_format`, so 1.21.9 onward rejects it outright:
```
Couldn't load file/doom.ui pack metadata: Pack declares support for version newer than 81,
  but is missing mandatory fields min_format and max_format
```
The iron rule of consistency: `min_format` must == `sf.min_inclusive` and `max_format` must == `sf.max_inclusive`
(any mismatch ⇒ `Pack version declaration mismatch ...` rejection); and when `min_format < 82`,
`pack_format` + `supported_formats` are still required.

### 3. Real-machine acceptance evidence

| Version | Suite | Verdict |
|---|---|---|
| **1.21.9** (full client-side suite) | 53 cases / 335 assertions | ✅ **PASS 53 / FAIL 0** (TPS ≈ 19.74) |
| **1.21.9** (in-pack self-assertion suite) | 15 entries | ✅ **15/15 PASS · 0 FAIL** |
| **26.3** (in-pack self-assertion suite) | 15 entries | ✅ **15/15 PASS · 0 FAIL** (entry by entry identical to 1.21.9) |

Raw 26.3 receipt (excerpt):
```
(SELFTEST) RESULT pass=15 fail=0 total=15
   ← covers all 9 modules + update / remove / clear_all
gamerule max_command_sequence_length -> 2147483647   ← fix in effect
8 classes of load errors: (NONE) ✓✓
```
> 26.3 cannot run the full client-side suite (the client protocol data has no 26.3),
> so 26.3 was accepted with the server-side self-assertion suite, run on the final delivery variant `modern-1.21.11-26.3` ✓.

### 4. 📌 Typo fix: case/assertion count

The CHANGELOG and README originally said "53 cases / 335 assertions" ✗; the measurement is "53 cases / 335 assertions" ✓.
Both places have been corrected this time:

- 53 cases = group a 23 + group b 16 + group c 14 (the measured suite's `C()` case count);
- 335 assertions = the assertion total after this round's `flash_wave` / `flash_waves_override` fix
  (331 before the fix; the root cause of the two failing cases was the test reading the pack the wrong way, not a wrong expected value, and no assertion was relaxed).

> Along the way, the document's `53 PASS / 0 FAIL` scope phrasing was corrected → `53 PASS / 0 FAIL`.

### 5. M6 fix: the two modern variants' self-declared `pack.mcmeta` ranges are no longer too wide

A pre-release review found (M6 criterion: the self-declared range must not be wider than actual capability):

| Variant | Originally declared | Actual capability | Problem |
|---|---|---|---|
| `v2.1.0` (1.21.9–1.21.10) | 48–121 (→ MC 1.21–26.3) | only up to **1.21.10** | On 1.21.11+ it does load, but with the old gamerule name ⇒ **__load__ fails as a whole** ✗ |
| `v2.1.0-mc1.21.11+` | 48–121 (→ MC 1.21–26.3) | only from **1.21.11** up | The lower bound is declared too wide (1.21.6–1.21.10 are actually unusable) ✗ |

The fix: both were changed to purely new-style (keeping only `min_format`/`max_format`, deleting `supported_formats` and `pack_format`) —
per §1.4 rule 4, a declared range that reaches 82+ forbids `supported_formats`:

```jsonc
// v2.1.0 (1.21.9–1.21.10) —— 88.0 = the data format of 1.21.9/1.21.10
{ "pack": { "min_format": [88, 0], "max_format": 88,  "description": "…" } }
// v2.1.0-mc1.21.11+    —— 94.1 = the data format of 1.21.11
{ "pack": { "min_format": [94, 1], "max_format": 121, "description": "…" } }
```

> The `mc1.21.6-1.21.8` variant is untouched (1.21.6–1.21.8 do not recognize `min_format`/`max_format`, so the old-style mcmeta must be kept).

Re-run after the change (26.3 · Java 25 · real machine):

```
After /reload: 8 classes of thresholds + deprecation warnings = 0 lines ✓
[file/doom.ui (world)] loads normally ✓
gamerule max_command_sequence_length -> 2147483647   ← fix in effect ✓
function doom.ui:__load__            -> Running function doom.ui:__load__ ✓
[SELFTEST] RESULT pass=15 fail=0 total=15             ← 15/15 all pass ✓
```

> This result matches the baseline with the "pre-tightening mcmeta" entry by entry (both 15/15), and after tightening there are 0 deprecation warnings ⇒ proving the tightening only removed over-wide declarations and weakened no real capability ✓.

### 6. What can be cross-checked

- The 142 file entries in each of the three zips are byte-for-byte identical to the same-named files under the corresponding pack body directory in the repo (0 differences each).
- `node src/tools/make_dist.mjs --check` proves it byte by byte (all three ✅).
  `make_dist.mjs` has been extended to pack three variants in one go (the old version packed only one); the entry table is in the script's header comment.
- Between the three variants: only `pack.mcmeta` and 1 `gamerule` line of `__load__.mcfunction` differ,
  and the other 140 files are byte-for-byte identical ⇒ the public API is unchanged down to the character ✓.

---

## 2026-10-04 · D17 fix (countdown digits wiped by the scratch area)

- Symptom: after installing countdown, any other API call (alert / flash / actionbar / bossbar…) immediately blanked the countdown digits ticking on screen; before the fix it showed `CLEAN: s` (the digits were gone), after the fix it is `CLEAN: 17s`.
- Root cause: countdown wrote the remaining seconds into `doom.ui:ctx _.cd_time.<slot>`, while the first line of every API entry is
  `data remove storage doom.ui:ctx _` (clearing the scratch area). The two shared the same key ⇒ any other API coming in wiped the countdown time along the way.
  It was a key-space collision, not a logic error in countdown itself.
- Fix: move the countdown time table to an independent key `doom.ui:ctx cd_time` (no longer hung under the scratch area `_`):
  - `internal/countdown/cd_tick_slot.mcfunction`: the write entry and the display references now point at `cd_time.$(slot)` (2 lines);
    the expiry branch gained a `data remove storage doom.ui:ctx cd_time.$(slot)` line, so the time table does not accumulate with slots (1 line).
  - `api/silent_clear_all.mcfunction`: add `data remove storage doom.ui:ctx cd_time` in the `# Nuke all storage` section (1 line).
  - `__debug__.mcfunction`: the debug read path was changed to `cd_time` as well (1 line).
- Verification (three sets of evidence):
  - Data side: after firing 70+ API calls in a row (including alert / flash), `cd_time`'s `t1` / `v1` / `sp2` all survived and counted down normally.
  - Visual side: a real player measured the on-screen display as `CLEAN: 17s`, with the digits ticking continuously (before the fix it was `CLEAN: s`, with the digit position empty).
  - Regression side: in an empty environment `verify_show.mjs --cam` = 44 PASS / 0 FAIL; `verify_callbacks.mjs` = 23 PASS / 0 FAIL;
    a new cleanup case: after calling `silent_clear_all` the `cd_time` is emptied, and a countdown rebuilt after clearing still counts down normally (38 → 34).
- Artifact: `dist/doom.ui-v2.0-beta.zip` (142 files / 166 entries, 88409 B, sha256 `55efacb18291221c9b466ead157f515bb271205d72ee0a8bbf11ae14b7cf98d0`).
  Item-by-item diff against the previous zip: only these 3 files changed, 0 added, 0 removed; `node src/tools/make_dist.mjs --check` is byte-for-byte consistent.

## 2026-09-29 · Repo restructuring (this repo's structure)

- The top level adopted the player-facing shape: `README.md` (the four first-screen questions) · `LICENSE` · `CHANGELOG.md` · `dist/` · `docs/` (5 player manual pages)
  · `doom.ui/` (the datapack body; every mcfunction can be opened directly) · `src/` (gates + packing) · `.github/ISSUE_TEMPLATE/`.
- Development artifacts moved out: `tests/` (the real-machine acceptance bench) · `reports/` (per-round evidence and logs) · `README_bossbar.md` (namespace `doom.bossbar`,
  never released with this pack) → the private development repo `doom.ui-dev`; `tests/` and `reports/` were deleted from this repo and are no longer distributed with the pack.
  A 0-byte junk file created by mistake was also cleaned up (the remnant of a shell backtick accident).
- The release zip fixed one out-of-sync point: `dist/doom.ui-v2.0-beta.zip` had been stuck at `971635c`, three fixes behind the source
  (F-15 prefix colour · F-16 `maxCommandChainLength` · F-17 in-place text edit), and it had repo files like `reports/`, `README*.md` and
  `测试文档.md` mixed in (165 entries → 142 entries). It has now been re-packed from the pack body, with a reproducibility gate added.
- Three new runnable gates (`src/tools/`): `check_static.mjs` (the static gate formerly in `tools/`, with paths moved to the pack body entry) ·
  `check_leak.mjs` (leaks + top-level whitelist) · `make_dist.mjs` (deterministic packing, with `--check` byte-for-byte self-proof). CI runs all three together.

## 2026-09-29 · Extreme stress-test round (F-14 ~ F-17)

- F-16 command chain maxed out (a real bug, fixed): with 6 bots × full slots, the per-tick command volume of countdown maxed out `maxCommandChainLength` (65536)
  ⇒ the server log showed 449 lines of `Command execution stopped due to limit` ⇒ session entries were silently dropped (measured 20 → 3~7).
  Fix: add `internal/mixer/set_segment_quiet.mcfunction` (removing the per-slot `build_title_arr` + `render_single`),
  and add `gamerule maxCommandChainLength 2147483647` in `__load__` (belt and braces).
  Numbers: P2 assertions 5/6 → 6/6; log delta +449 → 0.
- F-15 prefix colour (found client-side, fixed): countdown's seconds and `s` did not follow the prefix colour; the implementation read `_.prefix.color` (the compound form),
  while the API contract passes the list form ⇒ `data modify … set from` failed silently ⇒ the seconds stayed default white.
  Fix: support both forms; add a regression case `cd_prefix_color` (a red slot 4 matches, a colourless slot 0 does not).
- F-14 "countdown only keeps 17 slots" = a reading artifact (not a pack defect): RCON's `data get` text is truncated / disconnected above ≈4KB ⇒ reads 17.
  What was fixed is the test bench: `Srv.listLen` / `listField` + throwing directly on incomplete SNBT + auto-reconnect + reading the length from a scoreboard instead.
- F-17 in-place text edit at the same priority (a performance cleanup, not the cure): add `internal/mixer/update_text_in_place.mcfunction`,
  which when `#_f ≥ 1` and `#_f = #_p` changes only `.text` and re-renders (saving `count_higher`'s 20 storage reads plus the remove/insert).
  40-player countdown-only: 12.64 → 14.22 TPS (≈ +1.6, still within the ±1–2 noise band).
  The real cure is refactoring countdown's in-place tick (recorded as a pending item in the development repo).
- Concurrency ladder (idle machine; 30 slots per player ⇒ 900 UI slots driven at once):

  | Players | Full-load TPS | Command chain truncations | Correctness |
  |---|---|---|---|
  | 10 | 19.96 | 0 | all green |
  | 20 | 19.99 | 0 | all green |
  | 30 | 20.25 | 0 | all green |
  | 40 | ≈12.4 – 13.9 | 0 | all green |
  | 60 | ≈8.9 | 0 | all green |

  The knee is between 20 and 40; at the same time the full case set (53 / 335 assertions) was 53/0 · 335/0 under the 30-player stress test.
- Profile (40 players added step by step, TPS delta): countdown −7.51 · bossbar −1.01 · actionbar −0.58 · xpbar noise (≈0).
- Multi-player stress test: 3 real bots (scaling 6→8→9) / P4 high-frequency overwrite storm 300 rounds × 6 players = 1800 calls (≈310 calls/second),
  assertions leak nothing (the `hot` segment is always 1 entry), sessions do not accumulate, and TPS recovers to ≥19 within 3 seconds after the storm; 19.9 – 20.2 TPS throughout.

## 2026-09-28 · First real-machine acceptance round (F-1 ~ F-13: 11 fixed / 6 registered)

Fixed (red → green)

- F-1 ⭐ actionbar's entire "expiry / fade-out / `on_fade`" chain never worked (a macro expansion failure swallowed the whole driver).
  - F-1b `if data` tests "exists" ⇒ `fade:false` took the wrong branch; F-1c at the end of the fade-out `clear_macro` necessarily returned early ⇒
    `on_fade` was lost + the ■ black block stayed forever; F-1d cancelling the in-flight fade-out chain on same-slot overwrite/clear (otherwise the old chain came back ~12t later and removed the newly created same-named slot).
- F-2 bossbar's `bid` index leaked on both the "expiry" and "clear_all" paths (ghost index → ghost session).
- F-3 xpbar's XP formula had three non-mutually-exclusive branches (the level was blown out and the progress percentage was a junk value).
- F-4 `silent_clear_all` permanently corrupted the player's XP ("silent" ≠ "corrupting").
- F-5 alert's natural-expiry callback was gated by `on_interrupt` (when only `on_fade` is given it never fires).
- F-6 `api/separator` silently did nothing when the player had no UI session yet.

Registered (unfixed, still present)

- F-7 Slot 11 (countdown slot 21) is dropped but the mixer segment remains (10 session entries vs 11 segments) ⇒ a residual segment never expires.
  Suggestion: add a slot-count guard in `api/{actionbar,countdown}` (when full, `return 0` and do not build a segment).
  > 2026-09-29 re-check: both the `ab_slot_limit` / `cd_slot_limit` cases now assert "no residue" and pass (segment counts = 10 / 20 respectively).
  > That is, no residue is currently observed; if it appears again later, these two will turn red immediately.
- F-8 The README's "auto cleanup on player leave/death" does not hold: `tick` dispatches with `as @a[scores={dt.leave=1..}]`, and offline players
  are not in `@a` ⇒ `internal/player_leave` is unreachable. It is now treated as a known limitation: one `dt.uid` leftover per player (bounded and harmless), pinned down by an assertion.
  Suggested fix: scan `doom.ui:mixer data[].uid` in reverse and clean entries "held by no online player".
  > 2026-09-28 closing note: ① the reachable path (leaving again after re-logging) has had the `dt.uid` reset added in `internal/player_leave`;
  > ② offline reclamation `internal/leave_scan` (every 20t) keeps clearing `sessions.*` and `doom.ui:mixer` entries (real-machine assertions 6/6 green);
  > ③ the contract and suite assertions were synchronized to "achievable", leaving one residual per player, bounded and harmless.
- F-9 An illegal macro parameter (such as `color:"orange"`) leaves half a state: no bossbar, no session, but a ghost entry already in `bb_index`.
  Suggestion: whitelist-validate `color`/`style` in `api/bossbar` before creating the entry.
- F-10 `clear type=3` clearing xpbar does not fire `on_fade` (the "end callback" contract disagrees with the implementation).
- F-11 flash's `on_fade` also needs `on_interrupt` on the interrupt path (same origin as F-5; whether to unify depends on the design intent, pending).
- F-12 Non-player entities (dropped items) get a uid assigned and a UI session created (`entry` lacks a `type=player` filter; player UI is unaffected, but dirty state accumulates).
- F-13 `silent_clear_all` does not cancel scheduled delayed tasks (at expiry they are no-ops because the session no longer exists, but the queue itself is not cleared).

Scope corrections (all bought with measurements)

- Illegal bossbar colour whitelist: only `pink / blue / red / green / yellow / purple / white` (the tests once used `gold`/`aqua` ⇒ false red).
- Heavy gates must not run concurrently with light gates: concurrency makes the numbers overwrite each other (two false reds measured: `verify_biome_at 3/0`, `verify_multibot 4/0`; running them singly turns them green again).
- Panel TPS sampling needs a fixed window; `tellraw` does not go into the dedicated server log ⇒ collection goes through `say`.

## 2026-09-28 · v2.0-beta first pre-release

- Published `README.md` (installation / dependencies / API overview / limitations) and LICENSE; GitHub pre-release v2.0-beta.
- Architecture finalized: per-player `dt.uid` binds mixer data; UI sessions are identified by SID (`dt.sid_*`);
  driver loop (`#minecraft:tick`) countdown 20t / actionbar 5t / bossbar 1t / xpbar 1t;
  alert / flash go through `doom.schedule`'s delayed execution; actionbar is rendered through the mixer ordered by priority (10–50).
- Scale: 122 mcfunction / 1632 lines / 86 macro functions / 4 tags.
- Acceptance scope: the real-machine acceptance bench (`--list` / `--only` / `--group`, exit code 0/1),
  first round 52/53 cases · 333/334 assertions, server TPS 19.9 (1s window); the manual look-and-feel checklist is in [`docs/03-示例调用串.md`](docs/03-示例调用串.md).

---

## Appendix: interfaces and boundaries (quick reference)

| Item | Value |
|---|---|
| Public API | `doom.ui:api/{actionbar,countdown,bossbar,alert,flash,chat,sound,separator,xpbar}` |
| Dependency | `doom.schedule` v2+ (the delayed callbacks of alert / flash / actionbar fade-out) |
| External registration hook | `#doom.ui:interrupt` |
| Slot ceilings | actionbar **10** / countdown **20** (excess is dropped; on segment residue see F-7) |
| Offline cleanup | Not automatic (**see F-8**): one `dt.uid` leftover per player, bounded and harmless |
| Three gates | `node src/tools/check_static.mjs` (static gate) · `node src/tools/check_leak.mjs` (leaks + top-level whitelist) · `node src/tools/make_dist.mjs --check` (release reproducibility); CI in `.github/workflows/static.yml` |
