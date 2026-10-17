# doom.ui — datapack UI framework (actionbar · countdown · bossbar · alert · flash · xpbar)

中文: `README.md`

[![Latest release](https://img.shields.io/github/v/release/Doom-Flare/doom.ui?include_prereleases&label=%E6%9C%80%E6%96%B0%E7%89%88%E6%9C%AC)](https://github.com/Doom-Flare/doom.ui/releases)
[![Minecraft](https://img.shields.io/badge/Minecraft-1.21.6%20%E2%80%93%2026.3-3C8527)](docs/04-兼容与版本.md)
[![License](https://img.shields.io/badge/%E8%AE%B8%E5%8F%AF-All%20Rights%20Reserved%20%C2%B7%20Beta-c0392b)](docs/05-致谢与许可.md)

<!-- Hero image slot (no image yet): capture a shot of "countdown + fade-out + bossbar all on screen at once",
     save it as docs/assets/首屏效果.png, then uncomment the line below. Until then, do not leave half a broken image. -->
<!-- <p align="center"><img src="docs/assets/首屏效果.png" width="720" alt="doom.ui running in a save"></p> -->

Add a layer of interface to your save with a pure datapack. That covers the persistent text at the bottom of the screen, countdowns, health-bar-style bars, titles and subtitles, flashing, chat and sound, and the XP bar.

Everything is called through `{with:{…}}` macro parameters, so one `/function` produces the effect. The driver loop is hooked onto tick — install it and it works.

## Which one to download

This pack has two version dividing lines (the 1.21.9 `pack.mcmeta` rules, and the 1.21.11 gamerule rename), so it is split into three variants. Pick by your MC version; see "MC version → which variant to use" below.

## Installation

1. Unzip to get the `doom.ui/` folder
2. Put it **together with the dependency `doom.schedule/`** into `saves/<your save>/datapacks/`. For a server, put them in `world/datapacks/`
3. Enter the game and `/reload`

Note that you must install [doom.schedule](https://github.com/Doom-Flare/doom.schedule) v2 or newer**, otherwise alert, flash and fade-out callbacks will silently stop working.

Once installed, try one line:

```
/function doom.ui:api/actionbar {with:{targets:"@a",content:[{"text":"Hello","color":"gold"}],time:200}}
```

If a gold `Hello` appears on screen and stays for 10 seconds, it works. After downloading, checking the checksum first is recommended; see "Verifying the downloaded file".

## Current status

**v2.1.1**, supporting Minecraft 1.21.6 through 26.3.
This release only tidies attribution and links: the author line in `__help__` / `__load__` inside the two variant packs now says `Doom_Flare` instead of the old username; the command logic is byte-identical to v2.1.0 (not a line changed in the 136 mcfunction files), after which all three zips were repacked as the rules require.


Real-machine acceptance has been run: **53 cases / 335 assertions all green** (1.21.9 · Fabric, also 53/0 · 335/0 under a stress test with 30 players online at once). 26.3 was separately accepted with the in-pack self-assertion suite: **15/15 PASS · 0 load errors**.

Known limitations are kept on record one by one in [CHANGELOG.md](CHANGELOG.md): F-7 unfixed (when countdown slot 21 is dropped a mixer segment remains, and a residual segment never expires), F-9 through F-13 unfixed.

Mind the scope: **53 PASS / 0 FAIL does not mean fixed**. The findings are registered in the assertion table as "defect detections"; see the note at the top of the CHANGELOG.

**You can install it into a save and play, but back up your save first.**

## Where the source is

The pack body is right in this repo at [`doom.ui/`](doom.ui/data/doom.ui/function); every mcfunction can be opened directly. The runnable gates and packing scripts are in [`src/`](src/). Full details below in "Where the source is".

---

## 30 seconds: download → install → see whether it runs

| Step | What to do |
|---|---|
| ① | Download the zip for your version per "MC version → which variant to use", plus [`dist/SHA256SUMS.txt`](dist), and compare the hash below |
| ② | Unzip to get `doom.ui/`, put it **together with the dependency `doom.schedule/`** into `<save>/datapacks/`; for a server, `world/datapacks/` |
| ③ | Enter the world, `/reload`, then type one line: `/function doom.ui:api/actionbar {with:{targets:"@a",content:[{"text":"Hello","color":"gold"}],time:200}}` |

If a gold `Hello` appears on screen and stays for 10 seconds, it works.
If nothing happens, check these three in order: **is the dependency installed** → is there a `Failed to load function` in `logs/latest.log` → did you `/reload`.

To uninstall: delete `datapacks/doom.ui/` → `/reload` (this pack does not touch any vanilla gamerule, so the world returns to its original state after uninstalling).

More detailed installation steps (covering "where the pack goes, how it goes on a server, how to tell if the version mismatches") are in [`docs/01-安装.md`](docs/01-安装.md).

## Verifying the downloaded file (one line)

`dist/SHA256SUMS.txt` holds the zips' sha256 values. Run this in the directory where the zip is:

```
Linux / macOS:        sha256sum -c SHA256SUMS.txt
Windows PowerShell:   (Get-FileHash .\doom.ui-v2.1.1.zip -Algorithm SHA256).Hash
```

If it prints `OK` (or the hash equals the string in `SHA256SUMS.txt`), the download is complete; if it does not match, do not use it — download again. Current values:

| File | sha256 |
|---|---|
| `doom.ui-v2.1.1.zip` (1.21.9–1.21.10) | `6e9e7e7e09364159caff3a35c91fdc6f613e7a4d6d050caa4d52398e21971fb6` |
| `doom.ui-v2.1.1-mc1.21.11+.zip` (1.21.11–26.3) | `2af9c3e4bcbeff1ac8bb335303964cbc7f04caee58bf5aa4a2bd017c9b088e6b` |
| `doom.ui-v2.1.1-mc1.21.6-1.21.8.zip` (1.21.6–1.21.8) | `2340bab5a8fbba6a788d97aea4b27f53332e82f22badbe6e066cde798b0eb21a` |

These values are not hand-copied. `node src/tools/make_dist.mjs --check` compares the bytes of a fresh re-pack against the zip in `dist/` byte by byte, and errors if they differ. The hash you get from re-packing should be exactly the same as the table above.

## Dependency (read this one before installing)

| Dependency | Version | Why |
|---|---|---|
| [doom.schedule](https://github.com/Doom-Flare/doom.schedule) | **v2+** | The delayed callbacks of alert / flash / actionbar fade-out all go through it. Without it there is no error, but **those effects silently do not happen** |

This pack does not touch vanilla gamerules (it does not change gamerules or mob spawning), and uninstalls cleanly.

## What it can do (9 APIs)

All of them take `{with:{…}}` macro parameters; `targets` defaults to `@s`. One example per line:

```mcfunction
function doom.ui:api/actionbar  {with:{targets:"@a",content:[{"text":"Hello","color":"gold"}],time:200}}
function doom.ui:api/countdown  {with:{targets:"@a",prefix:[{"text":"倒计时","color":"gold"}],time:10}}
function doom.ui:api/bossbar    {with:{targets:"@a",name:[{"text":"Boss","color":"red"}],time:200,color:"red",style:"notched_6"}}
function doom.ui:api/alert      {with:{targets:"@a",title:[{"text":"警告","color":"red"}],time:100}}
function doom.ui:api/flash      {with:{targets:"@a",title:[{"text":"闪！","color":"yellow"}],count:5,interval:10}}
function doom.ui:api/chat       {with:{targets:"@a",content:[{"text":"hi"}]}}
function doom.ui:api/sound      {with:{targets:"@a",sound:"minecraft:block.note_block.harp"}}
function doom.ui:api/separator  {with:{targets:"@a",separator:{text:" | "}}}
function doom.ui:api/xpbar      {with:{targets:"@s",time:100}}
```

| What you want | Which one | In one sentence |
|---|---|---|
| Persistent text at the bottom of the screen | `api/actionbar` | Can stack multiple segments by `slot`, rendered in order of `priority` (10–50); dims and fades out over the last 10t before expiry |
| Countdown | `api/countdown` | Displays `time..1` seconds and fires `on_fade` on expiry; when the prefix has a colour, **the seconds and the `s` follow that colour** |
| Health-bar-style bar | `api/bossbar` / `bossbar_update` / `bossbar_remove` | Identified by `bid`; remaining time can be updated and it can be removed; optionally `notched_6/10/12/20` |
| Title / subtitle | `api/alert` | Clear time = `fade_in + time + fade_out` (plays in full; the fade-out is not cut short) |
| Flash | `api/flash` | `count` times × `interval` ticks, each wave overridable via `flashes[]` |
| Chat / sound / separator | `api/chat` · `api/sound` · `api/separator` | Insert a piece of text into the conversation / play a sound once / change the separator between segments |
| XP bar as a progress bar | `api/xpbar` | Restores the player's original XP at the end (not zeroed) |
| Cleanup | `api/clear` · `api/clear_all` · `api/remove` · `api/silent_clear_all` | `clear type=1/2/3/4` = countdown / actionbar / everything / bossbar |

The full parameter tables, defaults, return values and internal data structures: [`docs/02-用法与API.md`](docs/02-用法与API.md).
Copy-paste-ready full call strings: [`docs/03-示例调用串.md`](docs/03-示例调用串.md).

## Limitations and known issues (honest list)

- Slot ceilings: at most 10 actionbar slots and 20 countdown slots per player (excess is dropped);
  the mixer renders at most 20 segments per player × 4 text parts per segment, with `priority` from 10–50.
- bossbar colours only accept `pink / blue / red / green / yellow / purple / white`; passing anything else (for example `gold`) has no effect.
- Driving cost scales with player count: 30 players online at once on an idle machine still holds a steady 20 TPS; 40 players drops to ≈12.4–13.9, 60 players to ≈8.9.
  The knee is between 20 and 40 players, and the bottleneck is countdown (see the concurrency ladder and profile in [CHANGELOG.md](CHANGELOG.md)).
- Unfixed defects F-9 ~ F-13 (an illegal macro parameter leaves half a state / `clear type=3` does not fire xpbar's `on_fade` / non-player entities get sessions created …):
  each is written up in [CHANGELOG.md](CHANGELOG.md); nothing is hidden. Scan it before reporting a bug.
- This pack does not automatically clean up scoreboard leftovers of offline players (one per player, bounded and harmless; the cause and the closing conclusion are in F-8 of the CHANGELOG).

## MC version → which variant to use

| MC version | data format | Which one | `gamerule` name | Measured |
|---|---|---|---|---|
| **1.21.6 / 1.21.7 / 1.21.8** | 80 / 81 | `v2.1.1-mc1.21.6-1.21.8` | old | Source pack as-is |
| **1.21.9 / 1.21.10** | 88.0 | `v2.1.1` (primary) | old | 53/53 + 15/15 |
| **1.21.11 / 26.1 / 26.1.1 / 26.1.2 / 26.2 / 26.3** | 94.1 – 121.0 | `v2.1.1-mc1.21.11+` | new | 15/15 (26.3) |
The two modern variants use purely new-style mcmeta (`min_format`/`max_format`, no `supported_formats`), making the self-declared range equal the actual capability: `v2.1.1` declares 88.0–88.0, and `v2.1.1-mc1.21.11+` declares 94.1–121.0.

| 1.21.5 and lower | ≤ 71 | Not supported | — | — |

The two dividing lines: ① from 1.21.9 `min_format`/`max_format` are mandatory (missing ⇒ the whole pack is rejected);
② from 1.21.11 `gamerule maxCommandChainLength` is renamed `max_command_sequence_length`,
and the old name is a parse-time error ⇒ that whole branch of functions fails to load ⇒ the pack does not run at all ⇒ the old and new names cannot coexist, so the pack has to be split.

| Other | Works? |
|---|---|
| Single-player save / server | Both work; for a server use `world/datapacks/` |
| Experimental gameplay | No experimental gameplay needs to be enabled |
| Dependency [doom.schedule](https://github.com/Doom-Flare/doom.schedule) | **v2.3+**, also picked by MC version |
| Missing `doom.schedule` v2+ | alert / flash / fade-out callbacks silently stop working |

The complete version matrix with upgrade/downgrade advice is in [`docs/04-兼容与版本.md`](docs/04-兼容与版本.md).

## Where the source is (click straight through)

- **The datapack body (mcfunction source, directly openable)**: [`doom.ui/`](doom.ui/data/doom.ui/function) — inside are the actual function files this pack loads into the game;
  `doom.ui/pack.mcmeta` is the pack description, and `doom.ui/mcdoc/` holds the editor hints for Spyglass / Misode.
- **The finished downloads**: [`dist/`](dist): three variant zips plus `SHA256SUMS.txt`; the pack bodies of the other two variants are in [`variants/`](variants/).
- **The runnable gates and packing scripts**: [`src/`](src/): static gate (JSON / reference closure / mcfunction load-time rules), structural gate (leaks + top-level whitelist),
  and the deterministic packing script. If you do not want to read code, just download the zip from `dist/` — **you do not need `src/`**.
- **Player manual**: [`docs/`](docs/README.md): installation / usage and API / example call strings / compatibility and versions / credits and licence.
- The same version is also attached to [Releases](https://github.com/Doom-Flare/doom.ui/releases)
  (the asset names carry the version number, and the body has four sections: which to download / how to install / checksums / where the source is).
- **The real-machine acceptance bench and the per-round evidence reports** live in a private development repo (not public): that setup needs a server with RCON open plus a real client,
  and by the repo template's rules it does not go into this repo. If you want to know "why can it claim 53/335 all green", see the numbers and conclusions in [CHANGELOG.md](CHANGELOG.md).

## Want to change the behaviour / want to change the code

| What you want to change | Where to change it | Do you need to re-pack |
|---|---|---|
| Just tweak a call (duration, colour, priority) | Change your `/function` call string directly in game | No |
| Change the pack's behaviour (change an API implementation) | The mcfunction under `doom.ui/data/doom.ui/function/**` (the body is the source; there is no generator) | No; `/reload` or swap the pack when done |
| Publish a version you modified yourself | Run `node src/tools/check_static.mjs` and `node src/tools/make_dist.mjs` when done | Use the packing script, do not drag the zip together by hand |

The concrete workflow for modifying the pack (what can be run directly, the scope of the gates, how packing proves itself) is in [`src/README.md`](src/README.md).

## Licence

**All Rights Reserved · Beta** (personal use / playing / passing it on unmodified is fine; to release a modified version or use it commercially, get permission first),
full text in [LICENSE](LICENSE), clause-by-clause explanation in [`docs/05-致谢与许可.md`](docs/05-致谢与许可.md).
