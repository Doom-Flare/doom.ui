# 02 · Usage and API

中文: `docs/02-用法与API.md`

## Calling convention

All APIs go through macro parameters: `/function doom.ui:<api> {with:{…}}`.

- `targets` defaults to `@s` (whoever executes it receives it); to send to everyone, write `"@a"`.
- Text is always a text component (the list form is the most robust): `[{"text":"你好","color":"gold"}]`.
- Numbers are in ticks (20 ticks = 1 second), unless that entry explicitly says "seconds".
- Calling again with the same `slot` replaces the old one and fires the old session's `on_interrupt`.

> One hard pitfall: the first thing every `api/*` in this pack does on entry is `data remove storage doom.ui:ctx _`.
> So when wrapping it in another layer and passing parameters, do not write into `doom.ui:ctx _`, or they will be wiped.

## Actionbar (persistent text at the bottom of the screen)

```mcfunction
function doom.ui:api/actionbar {with:{targets:"@a",content:[{"text":"Hello","color":"gold"}],time:200}}
```

| Parameter | Type | Default | Notes |
|---|---|---|---|
| `targets` | string | `@s` | Target selector |
| `content` | text component | **required** | actionbar content |
| `time` | int | 100 | Display duration (ticks) |
| `slot` | string | `"default"` | Slot (same-slot overwrite) |
| `fade` | bool | true | Fade out before expiry (dims over the last 10t) |
| `on_fade` | string | `""` | Natural-end callback (a command string) |
| `on_interrupt` / `on_interrupted_run` | string | `""` | Callback when replaced / when cleared |

## Countdown

```mcfunction
function doom.ui:api/countdown {with:{targets:"@a",prefix:[{"text":"倒计时","color":"gold"}],time:10}}
```

| Parameter | Type | Default | Notes |
|---|---|---|---|
| `time` | int | 100 | Countdown seconds (displays time..1, fires `on_fade` on expiry) |
| `slot` | string | `"countdown"` | Slot |
| `prefix` | text component (list form) | empty | Prefix text, e.g. `prefix:[{text:"倒计时",color:"gold"}]` |
| ↳ colour contract | — | — | When the prefix supplies a `color`, the seconds and the trailing `s` follow that colour (the `: ` stays white); with no prefix colour the whole segment uses the default colour |
| `priority` | int | 20 | mixer render priority |

## Bossbar (health-bar-style bar)

```mcfunction
function doom.ui:api/bossbar        {with:{targets:"@a",name:[{"text":"Boss","color":"red"}],time:200,color:"red",style:"notched_6"}}
function doom.ui:api/bossbar_update {with:{bid:"default",new_time:200}}
function doom.ui:api/bossbar_remove {with:{bid:"default"}}
```

| Parameter | Type | Default | Notes |
|---|---|---|---|
| `name` | text component | `bossbar` | Name |
| `time` | int | 100 | Duration (ticks) |
| `color` / `style` | string | `white` / `progress` | Appearance. **`color` only accepts `pink / blue / red / green / yellow / purple / white`**, and `style` accepts `progress` / `notched_6` / `notched_10` / `notched_12` / `notched_20` |
| `bid` | string | `"default"` | Identifier (`bossbar_update` / `bossbar_remove` look it up by this) |
| `countdown` | bool | false | Whether to show the remaining seconds |
| `show_sec` / `sep` | — | — | Seconds display format |

## Alert (title / subtitle)

```mcfunction
function doom.ui:api/alert {with:{targets:"@a",title:[{"text":"警告","color":"red"}],time:100}}
```

| Parameter | Type | Default | Notes |
|---|---|---|---|
| `title` / `subtitle` | text component | — | Title / subtitle |
| `fade_in` / `time` / `fade_out` | int | 5 / 100 / 10 | title times. Clear time = `fade_in + time + fade_out` (plays in full; the old version mistakenly used `time`, cutting off the fade-out) |

## Flash

```mcfunction
function doom.ui:api/flash {with:{targets:"@a",title:[{"text":"闪！","color":"yellow"}],count:5,interval:10}}
```

| Parameter | Type | Default | Notes |
|---|---|---|---|
| `count` | int | 5 | Number of flashes |
| `interval` | int | 10 | Interval (ticks) |
| `sound` | string | — | Sound for each flash (overridable per `flashes[].sound`) |
| `flashes` | list | — | Per-wave overrides (`title` / `subtitle` / `sound`) |

## Chat / Sound / Separator

```mcfunction
function doom.ui:api/chat      {with:{targets:"@a",content:[{"text":"hi"}]}}
function doom.ui:api/sound     {with:{targets:"@a",sound:"minecraft:block.note_block.harp"}}
function doom.ui:api/separator {with:{targets:"@a",separator:{text:" | "}}}
```

`separator` changes the separator between segments in the same player's mixer (by default that ` | `-style joining character), not a standalone UI element.

## XPbar (XP bar as a progress bar)

```mcfunction
function doom.ui:api/xpbar {with:{targets:"@s",time:100}}
```

- Uses the XP bar to show progress and restores the player's original XP at the end (not zeroed).
- `on_fade` is the end callback.

## Clear / remove

```mcfunction
function doom.ui:api/clear {with:{type:1,targets:"@a"}}          # 1=countdown 2=actionbar 3=everything 4=bossbar
function doom.ui:api/clear {with:{type:2,targets:"@a",slot:"a"}} # clear a specific slot
function doom.ui:api/clear_all                                   # clear everything globally
function doom.ui:api/silent_clear_all                            # clear everything globally (no callbacks, no XP change)
function doom.ui:api/remove {with:{targets:"@s",slot:"default"}} # remove that slot (same-named actionbar and countdown slots are both cleared)
```

## Limitations

- A single player has at most 10 actionbar slots and at most 20 countdown slots (excess is dropped).
- Render ceiling: mixer at most 20 segments per player × 4 text parts per segment; `priority` ranges from 10–50.
- bossbar goes through a recursive driver and has no fixed slot ceiling.

---

## Internal structure (read this before changing code)

| Path | Purpose |
|---|---|
| `doom.ui:ctx _` | The macro channel: the first thing every `api/*` does on entry is `data remove storage doom.ui:ctx _`. Do not write wrapper parameters here, or they will be wiped |
| `doom.ui:ctx sessions.*` | Per-player sessions: `ab_<uid>` / `cd_<uid>` / `al_<sid>` / `fl_<sid>` / `xp_<sid>` / `bb_<sid>` |
| `doom.ui:ctx _.tr.<uid>` | Title array used for rendering (generated by `build_title_arr`) |
| `doom.ui:ctx bossbars` | Array `[{bid,sid}]`, for debug inspection |
| `doom.ui:ctx bb_index` | Compound map `{ "<bid>": sid }`, the only lookup path from bid→sid |
| `doom.ui:mixer data` | mixer segment data: `[{uid, content:[{id,priority,text,type}], separator}]` |

Two hard rules, both learned the hard way:

1. A `data modify … set from` "source path" carrying a `[{k:v}]` filter fails silently (a target path with a filter is fine).
   To look up a value by bid / uid / id, always go through a compound map such as `bb_index`, or `data get` first.
2. `if data <path>` tests "exists", not "non-zero". A `0` written by `execute store result` also tests true.
   To test for a valid value you must convert to a score and then `matches 1..`.

Hooks: `#doom.ui:interrupt` is an empty tag for external packs to register interrupt handler functions.
`dt.interrupt` is the trigger scoreboard.

## Driver and lifecycle

- The driver loop is hooked onto `#minecraft:tick`: countdown 20t / actionbar 5t / bossbar 1t / xpbar 1t.
- When a player leaves or dies while online, the corresponding UI sessions are cleaned up automatically (the flash loop stops, xpbar restores).
- A player already offline only has their `sessions.*` and `doom.ui:mixer` entries cleared (the reachable reclamation path `internal/leave_scan`, every 20t);
  an offline player's scoreboard scores cannot be reset by any pure-datapack means. See F-8 in the [CHANGELOG](../CHANGELOG.md).
- After `/reload`, sessions / mixer are retained; `__unload__` cleans up completely.
