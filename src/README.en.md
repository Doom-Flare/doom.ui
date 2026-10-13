# What this is

中文: `src/README.md`

**The "executable part" of this repo**: three runnable gates plus the deterministic packing script.

⚠️ One thing that is easy to get wrong: **this pack has no generator**. The mcfunction files inside `doom.ui/` are **the handwritten source itself**,
not generated from somewhere else — so there is **no** `gen_*.mjs` setup here.

| Location | What it is | For whom |
|---|---|---|
| [`../dist/`](../dist) | **Finished artifacts**: three variant zips + `SHA256SUMS.txt` | Players who just want to install it into a save and play — **this is probably all you need** |
| [`../doom.ui/`](../doom.ui/data/doom.ui/function) | **The datapack body (which is the source)**: every mcfunction can be opened directly | People who want to know "how is it actually written" or want to change it themselves |
| `src/` (this directory) | **Gates and packing**: static gate / structural gate / packing script | People who want to prove after changing the pack that they did not break anything, or who want to publish a version of their own |

**If you only play, you do not need to touch this directory**: just download the zip from `dist/`.

---

## Three-step build

Prerequisites: **Node.js 18+**. No network, no Minecraft, and no dependencies to install (zero npm packages).

```
# ① Change the pack —— the body is the source, edit the mcfunction directly
#    Edit doom.ui/data/doom.ui/function/** (/reload or swap the pack to take effect; there is no "regenerate" step)

# ② Static gate —— this step is the answer to "did I break what I changed"
node src/tools/check_static.mjs
#    Expect: 0 error, 1 warning (that 1 warning is the reference to the external namespace doom.schedule, which is a dependency and not an error)

# ③ Pack the release artifact (top-level directory inside the zip = doom.ui/)
node src/tools/make_dist.mjs
#    Produces the three variant zips under dist/ plus dist/SHA256SUMS.txt, and prints their sha256 values
```

**Installing into a save**: copy `doom.ui/` in whole into `<save>/datapacks/` (server: `world/datapacks/`) → enter the game and `/reload`.
Do not forget that the dependency **doom.schedule v2+** has to go in as well.

## What is in the directory

| Path | Content |
|---|---|
| `tools/check_static.mjs` | **Static gate**: JSON / `pack.mcmeta` parses · function and function tag reference closure · mcfunction load-time rules (L4·L7·L9–L13) · the `with` source of macro files. Every rule corresponds to a past real-machine `Failed to load function` |
| `tools/check_leak.mjs` | **Structural gate**: ① leak scan (local absolute paths / development-artifact markers / third-party asset markers) ② top-level whitelist (only README · LICENSE · CHANGELOG · dist/ · docs/ · src/ · .github/ · doom.ui/ allowed) |
| `tools/make_dist.mjs` | **Packing**: writes the zip itself, pins timestamps to 1980-01-01 and entry ordering ⇒ **the same input always produces the same bytes**. `--check` mode only compares and does not write to disk |

## What can be run directly and what cannot (measured)

The "can be run directly" in the table below was run in **a clean clone** (Node 18+, with no extra files beyond this directory):

| Runs directly | Notes |
|---|---|
| `node src/tools/check_static.mjs` | **Actually run and passing in this repo**: 0 error / 1 warning (the warning is the reference to the external namespace `doom.schedule:`) |
| `node src/tools/check_leak.mjs` | Same as above: 0 leaks · 0 top-level violations. When local git is not on PATH, use `DOOM_GIT=<full path to git> node src/tools/check_leak.mjs`; when not inside a git repo, add `DOOM_TOP=off` |
| `node src/tools/make_dist.mjs` | Re-packs; `--check` compares against the zips in `dist/` and exits with code 1 on any mismatch |
| `DOOM_PACK=<another clone>/doom.ui node src/tools/check_static.mjs` | Checks another clone's pack body |

| Cannot be run directly (needs the development repo or an external environment) | Why |
|---|---|
| The real-machine acceptance bench (53 cases / 335 assertions, supports running one group / one case, exit code 0 = PASS) | Needs a 1.21.6 Fabric server with RCON open + a save + a real client. The bench is in a **private development repo**, and ordinary players should not touch it anyway |
| The stress scripts (`stress_ui_concurrency.mjs` / `stress_ui_extreme.mjs` / `stress_ui_profile.mjs`) (same as above) | Needs Carpet fake players or several bots; what they produce is the concurrency ladder table in the [CHANGELOG](../CHANGELOG.md) |
| The `/reload` load-time gate | The static gate cannot catch the "only blows up at load time" class; `check_static` covers the known blowing-up patterns, not all of them |

## Known differences (honest list)

- **The zip in `dist/` is byte-for-byte identical to `doom.ui/` (0 differences)** — this is not a promise, it is **run**:
  `node src/tools/make_dist.mjs --check` re-packs on the spot and compares byte by byte. CI runs this too.
  Historically this zip was once behind (three fixes, F-15 / F-16 / F-17, were not in the zip); this gate now pins it down.
- **This pack has no generator, so there is no "generator drift" class of difference**: `doom.ui/` is the source, and there is no intermediate layer "where the source and the artifact fall out of sync".
- **There is no test bench in `src/`**: the real-machine acceptance bench and the per-round evidence reports are in a private development repo. The reason is in the table above;
  it is also the repo template's rule (a player-facing repo does not carry `tests/` / `reports/` / machine logs).
- **Manual look-and-feel is unverified**: the look of the fade-out dimming, the bossbar's notched appearance, how the sounds feel, the editor completion experience — the checklist is in
  [`../docs/03-示例调用串.md`](../docs/03-示例调用串.md).
