# doom.ui player manual

中文: `docs/README.md`

Pick the page that matches your situation:

| What you want to do | Read this | Roughly how long |
|---|---|---|
| Install it into a save / server | [01-安装](01-安装.md) | 2 minutes |
| Know what parameters each API takes and what the defaults are | [02-用法与API](02-用法与API.md) | 10 minutes |
| Copy a working call string directly | [03-示例调用串](03-示例调用串.md) | 30 seconds |
| Check "will it work on my version" and "do I need experimental gameplay" | [04-兼容与版本](04-兼容与版本.md) | 1 minute |
| Can I bundle it into a modpack / re-release it / use it commercially | [05-致谢与许可](05-致谢与许可.md) | 1 minute |
| What changed in this version and what are the known limitations | [../CHANGELOG.md](../CHANGELOG.md) | 5 minutes |
| Want to read the code / modify the pack yourself | [../src/README.md](../src/README.md) | — |

## Thirty-second version

1. Install the dependency [doom.schedule](https://github.com/Doom-Flare/doom.schedule) v2+ (without it, alert / flash / fade-out callbacks silently stop working).
2. Drop `doom.ui/` and `doom.schedule/` together into `<save>/datapacks/` (server: `world/datapacks/`).
3. `/reload`, then:
   ```
   /function doom.ui:api/actionbar {with:{targets:"@a",content:[{"text":"Hello","color":"gold"}],time:200}}
   ```
   A gold `Hello` appearing on screen for 10 seconds = it works.

If something goes wrong, first look for `Failed to load function` in `logs/latest.log`. A missing dependency, the pack placed at the wrong level, or a version mismatch will each leave a line there.

## The mental model of this thing (understand it and you will not need to memorise the API)

- One call = one session: every player has a `dt.uid` binding their own mixer data. Each API call creates a session,
  identified by a SID (`dt.sid_*`), each timing and expiring independently.
- Same-slot overwrite: a new call with the same `slot` replaces the old one, and the old session's `on_interrupt` callback fires.
- Rendering goes through the mixer: actionbar is not sent to the player directly; instead all living segments are sorted by `priority` (10–50), joined into one line and then sent.
  So several effects can be stacked on screen at the same moment instead of covering each other.
- There are two kinds of callback: natural expiry → `on_fade`; replaced or cleared → `on_interrupt`.
- alert / flash delays are scheduled by `doom.schedule`, which is why it is a hard dependency.
