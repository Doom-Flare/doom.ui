# doom.ui — 数据包 UI 框架（actionbar · countdown · bossbar · alert · flash · xpbar）
English: `README.en.md`


[![最新版本](https://img.shields.io/github/v/release/Doom-Flare/doom.ui?include_prereleases&label=%E6%9C%80%E6%96%B0%E7%89%88%E6%9C%AC)](https://github.com/Doom-Flare/doom.ui/releases)
[![Minecraft](https://img.shields.io/badge/Minecraft-1.21.6%20%E2%80%93%2026.3-3C8527)](docs/04-兼容与版本.md)
[![许可](https://img.shields.io/badge/%E8%AE%B8%E5%8F%AF-All%20Rights%20Reserved%20%C2%B7%20Beta-c0392b)](docs/05-致谢与许可.md)

<!-- 首屏效果图位（还没放图）：截一张"倒计时 + 渐暗淡出 + bossbar 同时挂在屏幕上"的图，
     存成 docs/assets/首屏效果.png，然后把下面这行的注释去掉。在那之前不要留半张破图。 -->
<!-- <p align="center"><img src="docs/assets/首屏效果.png" width="720" alt="doom.ui 在存档里跑起来的样子"></p> -->

用纯数据包给存档加一层界面。包括屏幕下方的常驻文本、倒计时、血条样式的条、大标题和副标题、闪烁、聊天与音效、经验条。

全部走 `{with:{…}}` 宏参数调用，一条 `/function` 就能出效果。驱动循环挂在 tick 上，装完即用。

## 下载哪个

这个包有两条版本分界线（1.21.9 的 `pack.mcmeta` 规则、1.21.11 的 gamerule 改名），所以拆成三份变体。按你的 MC 版本挑，见下面「MC 版本 → 用哪份变体」。

## 安装

1. 解压得到 `doom.ui/` 文件夹
2. 把它**和依赖 `doom.schedule/`** 一起放进 `saves/<你的存档>/datapacks/`。服务器放 `world/datapacks/`
3. 进游戏 `/reload`

注意，必须同时装 [doom.schedule](https://github.com/Doom-Flare/doom.schedule) v2 或更新版**，否则 alert、flash、淡出回调会静默失效。

装好后敲一条试试：

```
/function doom.ui:api/actionbar {with:{targets:"@a",content:[{"text":"Hello","color":"gold"}],time:200}}
```

屏幕上出现一行金色的 `Hello` 并停 10 秒就是通了。下载后建议先对一下校验值，见「校验下载的文件」。

## 当前状态

**v2.1.0**，支持 Minecraft 1.21.6 到 26.3。

已跑过真机验收：**53 用例 / 335 断言全绿**（1.21.9 · Fabric，30 名玩家同时在线的压测下也是 53/0 · 335/0）。26.3 另用包内自断言套件验收 **15/15 PASS · 0 加载错误**。

已知限制逐条留档在 [CHANGELOG.md](CHANGELOG.md)：F-7 未修（countdown 第 21 槽被丢弃时 mixer 段会残留，残留段永不到期），F-9 到 F-13 未修。

注意口径：**53 PASS / 0 FAIL 不等于已修**。发现项在断言表里是以「缺陷检出」登记的，见 CHANGELOG 开头那段说明。

**可以装进存档玩，但请先备份存档。**

## 源码在哪

包体就在本仓库 [`doom.ui/`](doom.ui/data/doom.ui/function)，每个 mcfunction 都能直接点开看。可切跑的门与打包脚本在 [`src/`](src/)。完整细节见下面「源码在哪」。

---

## 30 秒：下载 → 装 → 看它是否跑起来

| 步 | 做什么 |
|---|---|
| ① | 按「MC 版本 → 用哪份变体」下载对应 zip 与 [`dist/SHA256SUMS.txt`](dist)，对一下后面的 hash |
| ② | 解压得到 `doom.ui/`，把它**和依赖 `doom.schedule/`** 一起放进 `<存档>/datapacks/`；服务器放 `world/datapacks/` |
| ③ | 进世界 `/reload`，然后敲一条：`/function doom.ui:api/actionbar {with:{targets:"@a",content:[{"text":"Hello","color":"gold"}],time:200}}` |

屏幕上出现一行金色的 `Hello` 并停 10 秒就是通了。
没反应就按顺序查这三样：**依赖装了没** → `logs/latest.log` 里有没有 `Failed to load function` → 有没有 `/reload`。

要卸载：删掉 `datapacks/doom.ui/` → `/reload`（本包不接任何原版房规，卸载后世界回到原样）。

细一点的安装步骤（含"包放哪儿、服务器怎么放、版本不符怎么判"）见 [`docs/01-安装.md`](docs/01-安装.md)。

## 校验下载的文件（一行）

`dist/SHA256SUMS.txt` 里是 zip 的 sha256。在 zip 所在的目录里跑：

```
Linux / macOS:        sha256sum -c SHA256SUMS.txt
Windows PowerShell:   (Get-FileHash .\doom.ui-v2.1.0.zip -Algorithm SHA256).Hash
```

输出 `OK`（或哈希与 `SHA256SUMS.txt` 里那一串相等）就是完整下载；不等就别用，重新下。当前值：

| 文件 | sha256 |
|---|---|
| `doom.ui-v2.1.0.zip`（1.21.9–1.21.10） | `a43b25377843e18e10a76dbcb7a0ee58f638a2c45ae52f88d03787b796ed2ddc` |
| `doom.ui-v2.1.0-mc1.21.11+.zip`（1.21.11–26.3） | `70871ac529587644f5a019672d0d9de7e6f3dff6e9f7abcb3c56f889e6c6f83e` |
| `doom.ui-v2.1.0-mc1.21.6-1.21.8.zip`（1.21.6–1.21.8） | `e3ae746c8ee73a502b1a2561b09431b9ec6a983a56a139f61878d817695a71e7` |

这个值不是手抄的。`node src/tools/make_dist.mjs --check` 会把「现在重新打一次」的字节与 `dist/` 里的 zip 逐字节比，不一致就报错。你重新打包得到的 hash 应当与上表完全相同。


## 依赖（装之前先看这一条）

| 依赖 | 版本 | 为什么 |
|---|---|---|
| [doom.schedule](https://github.com/Doom-Flare/doom.schedule) | **v2+** | alert / flash / actionbar 淡出 的延迟回调都走它。缺了不会报错，但**这些效果会静默不发生** |

本包不接原版房规（不改 gamerule、不动刷怪），卸载干净。

## 能做什么（9 个 API）

全部 `{with:{…}}` 宏参数，`targets` 默认 `@s`。一行一个例子：

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

| 你想要 | 用哪个 | 一句话 |
|---|---|---|
| 屏幕下方的常驻文本 | `api/actionbar` | 可按 `slot` 叠多段，按 `priority`（10–50）排序渲染；到期前 10t 渐暗淡出 |
| 倒计时 | `api/countdown` | 显示 `time..1` 秒，到期触发 `on_fade`；前缀给颜色时**秒数与 `s` 跟随该颜色** |
| 血条样式的条 | `api/bossbar` / `bossbar_update` / `bossbar_remove` | 按 `bid` 标识，可更新剩余时间、可移除；可选 `notched_6/10/12/20` |
| 大标题 / 副标题 | `api/alert` | 清除时刻 = `fade_in + time + fade_out`（完整播完，不砍淡出） |
| 闪烁 | `api/flash` | `count` 次 × `interval` tick，逐波可用 `flashes[]` 覆盖 |
| 聊天 / 音效 / 分隔符 | `api/chat` · `api/sound` · `api/separator` | 往会话里插一段文本 / 播一次音 / 改段间分隔符 |
| 经验条当进度条 | `api/xpbar` | 结束时恢复玩家原经验（不是清零） |
| 清理 | `api/clear` · `api/clear_all` · `api/remove` · `api/silent_clear_all` | `clear type=1/2/3/4` = countdown / actionbar / 全部 / bossbar |

完整的参数表、默认值、返回值与内部数据结构：[`docs/02-用法与API.md`](docs/02-用法与API.md)。
能直接复制粘贴的整串调用：[`docs/03-示例调用串.md`](docs/03-示例调用串.md)。

## 限制与已知问题（诚实清单）

- 槽位上限：每玩家 actionbar 最多 10 槽、countdown 最多 20 槽（超出丢弃）；
  mixer 渲染上限每玩家 20 段 × 每段 4 文本部分，`priority` 取值 10–50。
- bossbar 颜色只认 `pink / blue / red / green / yellow / purple / white`；传别的（例如 `gold`）不会生效。
- 驱动开销与人数相关：空载机上 30 名玩家同时在服仍稳 20 TPS；40 人掉到 ≈12.4–13.9、60 人 ≈8.9。
  拐点在 20–40 人之间，瓶颈是 countdown（见 [CHANGELOG.md](CHANGELOG.md) 的并发阶梯与画像）。
- 未修缺陷 F-9 ~ F-13（非法宏参数留半截状态 / `clear type=3` 不触发 xpbar 的 `on_fade` / 非玩家实体被建会话……）：
  逐条写在 [CHANGELOG.md](CHANGELOG.md)，不藏着。报 bug 前先扫一眼。
- 本包不自动清理已离线玩家的计分板残留（每人一条，有界无害；成因与收口结论见 CHANGELOG 的 F-8）。

## MC 版本 → 用哪份变体

| MC 版本 | data format | 用哪份 | `gamerule` 名 | 实测 |
|---|---|---|---|---|
| **1.21.6 / 1.21.7 / 1.21.8** | 80 / 81 | `v2.1.0-mc1.21.6-1.21.8` | 旧 | 源包形态 |
| **1.21.9 / 1.21.10** | 88.0 | `v2.1.0`（主用）| 旧 | 53/53 + 15/15 |
| **1.21.11 / 26.1 / 26.1.1 / 26.1.2 / 26.2 / 26.3** | 94.1 – 121.0 | `v2.1.0-mc1.21.11+` | 新 | 15/15（26.3） |
两份 modern 变体用纯新式 mcmeta（`min_format`/`max_format`，无 `supported_formats`），使自称区间等于实际能力：`v2.1.0` 声明 88.0–88.0，`v2.1.0-mc1.21.11+` 声明 94.1–121.0。

| 1.21.5 及更低 | ≤ 71 | 不支持 | — | — |

两条分界线：① 1.21.9 起强制 `min_format`/`max_format`（缺 ⇒ 整包拒收）；
② 1.21.11 起 `gamerule maxCommandChainLength` 改名 `max_command_sequence_length`，
旧名是解析期错误 ⇒ 该函数整支加载失败 ⇒ 包根本没跑起来 ⇒ 新旧名不可能共存，只能拆包。

| 其他 | 能不能用 |
|---|---|
| 单人存档 / 服务器 | 都行；服务器用 `world/datapacks/` |
| 实验性玩法 | 不需要开任何实验性玩法 |
| 依赖 [doom.schedule](https://github.com/Doom-Flare/doom.schedule) | **v2.3+**，同样按 MC 版本选变体 |
| 缺 `doom.schedule` v2+ | alert / flash / 淡出回调静默失效 |

完整的版本矩阵与升级/降级建议见 [`docs/04-兼容与版本.md`](docs/04-兼容与版本.md)。

## 源码在哪（直接点开就能看）

- **数据包本体（mcfunction 源码，可直接点开）**：[`doom.ui/`](doom.ui/data/doom.ui/function)：里面就是这只包实际装入游戏的每个函数文件；
  `doom.ui/pack.mcmeta` 是包描述，`doom.ui/mcdoc/` 是给 Spyglass / Misode 用的编辑器提示。
- **下载用的成品**：[`dist/`](dist)：三份变体 zip 与 `SHA256SUMS.txt`；其余两份变体的包体在 [`variants/`](variants/)。
- **可切跑的门与打包脚本**：[`src/`](src/)：静态门（JSON / 引用闭包 / mcfunction 加载期规则）、结构门（泄漏 + 顶层白名单）、
  确定性打包脚本。不想读代码的话，直接下 `dist/` 的 zip 即可，**用不到 `src/`**。
- **玩家手册**：[`docs/`](docs/README.md)：安装 / 用法与 API / 示例调用串 / 兼容与版本 / 致谢与许可。
- 同一个版本也附在 [Releases](https://github.com/Doom-Flare/doom.ui/releases)
  （附件名带版本号，正文有四段：下哪个 / 怎么装 / 校验值 / 源码在哪）。
- **真机验收台与逐轮取证报告**放在私有开发仓库（不对外）：那套东西要一台开着 RCON 的服务器和一个真实客户端，
  按仓库模板规矩不进这个仓库。想知道"它凭什么说 53/335 全绿"，看 [CHANGELOG.md](CHANGELOG.md) 的数字与结论。

## 想改玩法 / 想改代码

| 你想改 | 改哪里 | 要重新打包吗 |
|---|---|---|
| 只是调调用（时长、颜色、优先级） | 游戏里直接改你的 `/function` 调用串 | 不用 |
| 改包的行为（改某个 API 的实现） | `doom.ui/data/doom.ui/function/**` 里的 mcfunction（本体就是源码，没有生成器） | 不用；改完 `/reload` 或换包 |
| 想发一个你自己改过的版本 | 改完跑 `node src/tools/check_static.mjs` 与 `node src/tools/make_dist.mjs` | 用打包脚本，别手工拖 zip |

改包的具体流程（哪些能直接跑、门的口径、打包怎么自证）见 [`src/README.md`](src/README.md)。

## 许可

**All Rights Reserved · Beta**（自用 / 游玩 / 原样转发可以；二次发布修改版或商用请先取得许可），
全文见 [LICENSE](LICENSE)，逐条说明见 [`docs/05-致谢与许可.md`](docs/05-致谢与许可.md)。
