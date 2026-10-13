# 变更日志 · doom.ui
English: `CHANGELOG.en.md`


> 口径：namespace `doom.ui`（基于 `doom.schedule` 的 SID 会话管理 UI 框架）。
> 目标环境 Minecraft 1.21.6 – 26.3；当前版本 v2.1.0。
> 机器断言（53 用例 / 335 断言）跑在私有开发仓库的真机验收台里；本仓库保留的是人工观感清单
> [`docs/03-示例调用串.md`](docs/03-示例调用串.md) 与可切跑的三道门（`src/tools/`）。
>
> ⚠️ 全绿的读法：F-7 / F-9 这类**发现项**在断言表里以「缺陷检出」形式登记（期望值 = 当前的缺陷行为），
> 所以 53 PASS / 0 FAIL ≠ 这些已经修好。未修项见下（F-9 ~ F-13；F-7 未修，README 与本文口径一致（残留段永不到期））。

---

## v2.1.0 · 多版本支持（1.21.6 → 26.3）+ 用例/断言数笔误修正，2026-10-05

下载：
- [`dist/doom.ui-v2.1.0.zip`](dist/doom.ui-v2.1.0.zip)，1.21.9 – 1.21.10（主用）
  · sha256 `a43b25377843e18e10a76dbcb7a0ee58f638a2c45ae52f88d03787b796ed2ddc`
- [`dist/doom.ui-v2.1.0-mc1.21.11+.zip`](dist/doom.ui-v2.1.0-mc1.21.11+.zip)，1.21.11 – 26.3
  · sha256 `70871ac529587644f5a019672d0d9de7e6f3dff6e9f7abcb3c56f889e6c6f83e`
- [`dist/doom.ui-v2.1.0-mc1.21.6-1.21.8.zip`](dist/doom.ui-v2.1.0-mc1.21.6-1.21.8.zip)，1.21.6 – 1.21.8
  · sha256 `e3ae746c8ee73a502b1a2561b09431b9ec6a983a56a139f61878d817695a71e7`

> 玩法行为与 v2.0-beta 完全一致，136 个 mcfunction 中只有 1 行变了（`gamerule` 名），
> 其余逐字节相同。这一版改的是能不能装上去。

### 一、多版本支持表（MC 版本 → 用哪份变体）

本包有两处版本分界线，所以拆成三份：

| MC 版本 | data format | 用哪份变体 | `pack.mcmeta` | `gamerule` 名 |
|---|---|---|---|---|
| **1.21.6 / 1.21.7 / 1.21.8** | 80 / 81 | `v2.1.0-mc1.21.6-1.21.8` | 源包**原样** | 旧 `maxCommandChainLength` |
| **1.21.9 / 1.21.10** | 88.0 | `v2.1.0` ★ | `sf 48–121` + `min [48,0]` + `max 121` | **旧** `maxCommandChainLength` |
| **1.21.11 / 26.1 / 26.1.1 / 26.1.2 / 26.2 / 26.3** | 94.1 – 121.0 | `v2.1.0-mc1.21.11+` | 同上 | **新** `max_command_sequence_length` |
| 1.21.5 及更低 | ≤ 71 | ❌ 不支持 | — | — |

两条分界线分别是：
1. 1.21.9，`pack.mcmeta` 强制要求 `min_format`/`max_format`（缺 ⇒ 整包拒收）；
2. 1.21.11，`gamerule` 改名（`maxCommandChainLength` → `max_command_sequence_length`），
   旧名在这些版本上是解析期错误 ⇒ 该函数整支加载失败 ⇒ 包根本没跑起来。

> ⚠️ 为什么不能"一份通吃"：`gamerule` 行是**解析期**判定的，新旧名**不可能同时合法** ✗
> ⇒ 只能拆包 ✓。（`modern-1.21.11+` 的 mcmeta 声明 48–121，其 `pack_format 81` 覆盖 1.21.6–1.21.10，
> 但那些版本要旧 gamerule 名 ⇒ 实际不可跨用。）

### 二、本轮修了什么（两处硬破坏）

① `gamerule` 改名，发生在 1.21.11（不是 26.3） ✗✗

修 mcmeta 之后，26.3 上仍然报错，而且后果比"不兼容"严重，整个函数加载失败，包根本没初始化：
```
[Server thread/ERROR]: Failed to load function doom.ui:__load__
java.util.concurrent.CompletionException: java.lang.IllegalArgumentException:
  Whilst parsing command on line 45: Incorrect argument for command at position 9: gamerule <--[HERE]
[Server thread/ERROR]: Couldn't load tag doom.ui:load as it is missing following references: doom.ui:__load__
[Server thread/ERROR]: Couldn't load tag minecraft:load as it is missing following references: doom.ui:__load__
```
根因：`__load__.mcfunction:45` 的 `gamerule maxCommandChainLength 2147483647`。

精确改名表与改名版本（jar 常量池 + 1.21.10/26.3 双端实机取证）：

| 版本 | `maxCommandChainLength` | `max_command_sequence_length` |
|---|---|---|
| 1.21.5 – 1.21.10 | ✅ 仅此名 | ❌ |
| **1.21.11 起** | ❌（仅残留于 datafixer） | ✅ `GameRules.class` 规范名表 |

> ⚠️ 别混：`maxCommandForkCount` → `max_command_forks` 是**另一条**规则，
> 与 `maxCommandChainLength` → `max_command_sequence_length` 不是一回事 ✗。
> 改名类修复必须拿到「旧名 → 新名」的成对映射证据（datafixer 常量池），不能按语义或默认值猜。

修复：
```diff
- gamerule maxCommandChainLength 2147483647
+ gamerule max_command_sequence_length 2147483647
```
修后 26.3：0 加载错误 ✓、`__load__` 正常 ✓、`gamerule max_command_sequence_length` 读回 2147483647 ✓、自断言 15/15 PASS ✓。

② `pack.mcmeta` 缺 `min_format`/`max_format`，1.21.9 起直接拒收：
```
Couldn't load file/doom.ui pack metadata: Pack declares support for version newer than 81,
  but is missing mandatory fields min_format and max_format
```
一致性铁律：`min_format` 必须 == `sf.min_inclusive`、`max_format` 必须 == `sf.max_inclusive`
（不一致 ⇒ `Pack version declaration mismatch ...` 拒收）；且 `min_format < 82` 时
`pack_format` + `supported_formats` 仍然必需。

### 三、真机验收证据

| 版本 | 套件 | 判定 |
|---|---|---|
| **1.21.9**（端侧全量套件） | 53 用例 / 335 断言 | ✅ **PASS 53 / FAIL 0**（TPS ≈ 19.74） |
| **1.21.9**（包内自断言套件） | 15 条 | ✅ **15/15 PASS · 0 FAIL** |
| **26.3**（包内自断言套件） | 15 条 | ✅ **15/15 PASS · 0 FAIL**（逐条与 1.21.9 一致） |

26.3 原始回执（节选）：
```
(SELFTEST) RESULT pass=15 fail=0 total=15
   ← 覆盖全部 9 个模块 + update / remove / clear_all
gamerule max_command_sequence_length -> 2147483647   ← 修复生效
8 类加载错误：(NONE) ✓✓
```
> 26.3 跑不了端侧全量套件（客户端协议数据没有 26.3），
> 故 26.3 用服务端侧自断言套件验收，用最终交付变体 `modern-1.21.11-26.3` 跑的 ✓。

### 四、📌 笔误修正：用例/断言数

CHANGELOG 与 README 原先写「53 用例 / 335 断言」✗，实测为「53 用例 / 335 断言」 ✓。
本次已把两处一并改正：

- 53 用例 = a 组 23 + b 组 16 + c 组 14（实测套件的 `C()` 用例计数）；
- 335 断言 = 本轮 `flash_wave` / `flash_waves_override` 修复后的断言总数
  （修复前为 331，两个失败用例的根因是测试读包方式错，不是期望值错，未放宽任何断言）。

> 顺带修正文档里的 `53 PASS / 0 FAIL` 口径表述 → `53 PASS / 0 FAIL`。

### 五、M6 修正：两份 modern 变体的 `pack.mcmeta` 自称区间不收宽

发版前复核发现（M6 判据：自称区间不能宽于实际能力）：

| 变体 | 原自称 | 实际能力 | 问题 |
|---|---|---|---|
| `v2.1.0`（1.21.9–1.21.10） | 48–121（→ MC 1.21–26.3） | 只到 **1.21.10** | 装上 1.21.11+ 会被加载，但 gamerule 旧名 ⇒ **__load__ 整支失败** ✗ |
| `v2.1.0-mc1.21.11+` | 48–121（→ MC 1.21–26.3） | 只从 **1.21.11** 起 | 下界自称过宽（1.21.6–1.21.10 实际不可用）✗ |

修法：两份都改成纯新式（只留 `min_format`/`max_format`，删掉 `supported_formats` 与 `pack_format`）——
按 §1.4 规则 4，声明范围触及 82+ 就禁止 `supported_formats`：

```jsonc
// v2.1.0（1.21.9–1.21.10）—— 88.0 = 1.21.9/1.21.10 的 data format
{ "pack": { "min_format": [88, 0], "max_format": 88,  "description": "…" } }
// v2.1.0-mc1.21.11+    —— 94.1 = 1.21.11 的 data format
{ "pack": { "min_format": [94, 1], "max_format": 121, "description": "…" } }
```

> `mc1.21.6-1.21.8` 变体不动（1.21.6–1.21.8 不认 `min_format`/`max_format`，必须保留旧式 mcmeta）。

改后复跑（26.3 · Java 25 · 真机）：

```
/reload 后 8 类门槛 + deprecation 告警 = 0 行 ✓
[file/doom.ui (world)] 正常装载 ✓
gamerule max_command_sequence_length -> 2147483647   ← 修复生效 ✓
function doom.ui:__load__            -> Running function doom.ui:__load__ ✓
[SELFTEST] RESULT pass=15 fail=0 total=15             ← 15/15 全过 ✓
```

> 该结果与"收紧前 mcmeta"的基线逐条一致（同为 15/15），且收紧后 0 条 deprecation 告警 ⇒ 证明收紧只去掉了过宽的声明，没有削弱任何真实能力 ✓。

### 六、能核对什么

- 三份 zip 内各 142 个文件条目与仓库对应包体目录下同名文件逐字节相同（各 0 差异）。
- `node src/tools/make_dist.mjs --check` 逐字节自证（三份全 ✅）。
  `make_dist.mjs` 已扩展为三变体一次打包（旧版只打一份），入口表见脚本头部注释。
- 三份变体之间：只有 `pack.mcmeta` 与 `__load__.mcfunction` 的 1 行 `gamerule` 不同，
  其余 140 个文件逐字节相同 ⇒ 对外 API 一字未改 ✓。

---

## 2026-10-04 · D17 修复（countdown 数字被草稿区清空）

- 现象：装了 countdown 之后，只要调用任何别的 API（alert / flash / actionbar / bossbar…），
  屏幕上正在跳的倒计时数字立刻变空，修复前显示 `CLEAN: s`（数字没了），修复后是 `CLEAN: 17s`。
- 根因：countdown 把剩余秒数写在 `doom.ui:ctx _.cd_time.<slot>`，而每个 API 入口的第一行都是
  `data remove storage doom.ui:ctx _`（清草稿区）。两者共用同一个键 ⇒ 别的 API 一进来就把倒计时时间顺手删了。
  这是键空间冲突，不是 countdown 自身的逻辑错。
- 修法：把倒计时时间表搬到独立键 `doom.ui:ctx cd_time`（不再挂在草稿区 `_` 下）：
  - `internal/countdown/cd_tick_slot.mcfunction`：写入口与显示引用改指 `cd_time.$(slot)`（2 行）；
    过期分支补一行 `data remove storage doom.ui:ctx cd_time.$(slot)`，防止时间表随槽位累积（1 行）。
  - `api/silent_clear_all.mcfunction`：在 `# Nuke all storage` 段补 `data remove storage doom.ui:ctx cd_time`（1 行）。
  - `__debug__.mcfunction`：调试读取路径同步改成 `cd_time`（1 行）。
- 验证（三组证据）：
  - 数据面：连打 70+ 次 API（含 alert / flash）后，`cd_time` 的 `t1` / `v1` / `sp2` 全部存活且正常递减。
  - 视觉面：玩家真机实测屏幕显示 `CLEAN: 17s`，数字持续跳动（修复前是 `CLEAN: s`，数字位为空）。
  - 回归面：无人环境 `verify_show.mjs --cam` = 44 PASS / 0 FAIL；`verify_callbacks.mjs` = 23 PASS / 0 FAIL；
    新增清理用例：调 `silent_clear_all` 后 `cd_time` 被清空，清完重建倒计时仍正常递减（38 → 34）。
- 产物：`dist/doom.ui-v2.0-beta.zip`（142 文件 / 166 条目，88409 B，sha256 `55efacb18291221c9b466ead157f515bb271205d72ee0a8bbf11ae14b7cf98d0`）。
  与上一版 zip 逐项 diff：仅这 3 个文件变化，0 增 0 删；`node src/tools/make_dist.mjs --check` 逐字节一致。

## 2026-09-29 · 仓库改版（本仓库结构）

- 顶层收到玩家向形态：`README.md`（首屏四问）· `LICENSE` · `CHANGELOG.md` · `dist/` · `docs/`（玩家手册 5 篇）
  · `doom.ui/`（数据包本体，每个 mcfunction 可直接点开） · `src/`（门 + 打包）· `.github/ISSUE_TEMPLATE/`。
- 开发物移出：`tests/`（真机验收台）· `reports/`（逐轮取证与日志）· `README_bossbar.md`（命名空间 `doom.bossbar`，
  未随本包发布）→ 私有开发仓库 `doom.ui-dev`；`tests/` `reports/` 从本仓库删除，不再随包分发。
  同时清掉一个 0 字节误建垃圾文件（shell 反引号事故的残余）。
- 发行 zip 修正了一处不同步：`dist/doom.ui-v2.0-beta.zip` 原先停在 `971635c`，落后于源码三个修复
  （F-15 前缀取色 · F-16 `maxCommandChainLength` · F-17 原位改文本），并且里面混进了 `reports/`、`README*.md`、
  `测试文档.md` 这些仓库文件（165 条目 → 142 条目）。现按包体重打，并加了可复现门。
- 新增三道可切跑的门（`src/tools/`）：`check_static.mjs`（原 `tools/` 的静态门，路径改到包体入口）·
  `check_leak.mjs`（泄漏 + 顶层白名单）· `make_dist.mjs`（确定性打包，`--check` 逐字节自证）。CI 三条一起跑。

## 2026-09-29 · 极限压测轮（F-14 ~ F-17）

- F-16 命令链顶穿（真 bug，已修）：6 台机器人 × 满槽时，countdown 每拍命令量顶穿 `maxCommandChainLength`（65536）
  ⇒ 服务器日志 449 行 `Command execution stopped due to limit` ⇒ 会话条目被静默丢弃（实测 20 → 3~7）。
  修：新增 `internal/mixer/set_segment_quiet.mcfunction`（去掉每槽的 `build_title_arr` + `render_single`），
  并在 `__load__` 加 `gamerule maxCommandChainLength 2147483647`（双保险）。
  数字：P2 断言 5/6 → 6/6；日志增量 +449 → 0。
- F-15 前缀取色（端侧发现，已修）：countdown 的秒数与 `s` 不跟随前缀颜色，实现读 `_.prefix.color`（复合形态），
  而 API 契约传的是列表形态 ⇒ `data modify … set from` 静默失败 ⇒ 秒数一直默认白。
  修：两种形态都支持；新增回归用例 `cd_prefix_color`（红色槽 4 命中、无色槽 0 不命中）。
- F-14「countdown 只保 17 槽」= 读数假象（不是包缺陷）：RCON 的 `data get` 文本 >≈4KB 会被截断/断连 ⇒ 读到 17。
  修的是测试台：`Srv.listLen` / `listField` + 不完备 SNBT 直接抛错 + 自动重连 + 改用计分板读长度。
- F-17 同优先级原位改文本（性能清理，非解药）：新增 `internal/mixer/update_text_in_place.mcfunction`，
  当 `#_f ≥ 1` 且 `#_f = #_p` 时只改 `.text` 再渲染（省掉 `count_higher` 的 20 次存储读 + 移除/插入）。
  40 人 countdown-only：12.64 → 14.22 TPS（≈ +1.6，仍在 ±1~2 噪声带内）。
  真正的解药是 countdown 的原地 tick 重构（记在开发仓库的待决项里）。
- 并发阶梯（空载机；每人 30 槽 ⇒ 900 个 UI 槽同时被驱动）：

  | 人数 | 满载 TPS | 命令链截断 | 正确性 |
  |---|---|---|---|
  | 10 | 19.96 | 0 | 全绿 |
  | 20 | 19.99 | 0 | 全绿 |
  | 30 | 20.25 | 0 | 全绿 |
  | 40 | ≈12.4 – 13.9 | 0 | 全绿 |
  | 60 | ≈8.9 | 0 | 全绿 |

  拐点在 20 与 40 之间；同时全套用例（53 / 335 断言）在 30 人压测中 53/0 · 335/0。
- 画像（40 人逐步加，TPS 增量）：countdown −7.51 · bossbar −1.01 · actionbar −0.58 · xpbar 噪声（≈0）。
- 多玩家压测：真机器人 3 台（6→8→9 台规模）/ P4 高频覆盖风暴 300 轮 × 6 人 = 1800 次调用（≈310 次/秒），
  断言不泄漏（`hot` 段始终 1 条）、会话不累积、风暴后 3 秒内 TPS 恢复 ≥19；全程 19.9 – 20.2 TPS。

## 2026-09-28 · 首轮真机验收（F-1 ~ F-13：11 项已修 / 6 项登记）

已修（红→绿）

- F-1 ⭐ actionbar 的「到期 / 淡出 / `on_fade`」整条链从未生效（宏展开失败吞掉整个驱动）。
  - F-1b `if data` 判的是"存在" ⇒ `fade:false` 走错分支；F-1c 淡出结束时 `clear_macro` 必然早退 ⇒
    `on_fade` 丢失 + ■ 黑块永久残留；F-1d 同槽覆盖/清除时取消在飞的淡出链（否则旧链 ~12t 后回来摘掉新建的同名槽）。
- F-2 bossbar 的 `bid` 索引在「到期」与「clear_all」两条路径上都泄漏（幽灵索引 → 幽灵会话）。
- F-3 xpbar 经验公式三条分支不互斥（等级被顶飞、进度百分比是垃圾值）。
- F-4 `silent_clear_all` 把玩家经验永久改坏（"静默" ≠ "损坏"）。
- F-5 alert 的自然到期回调被 `on_interrupt` 门控（只给 `on_fade` 时永远不触发）。
- F-6 `api/separator` 在玩家还没有 UI 会话时静默无效。

已登记（未修，仍然存在）

- F-7 第 11 槽（countdown 第 21 槽）被丢弃但 mixer 段残留（会话 10 条 vs 段 11 个）⇒ 残留段永不到期。
  建议在 `api/{actionbar,countdown}` 加槽位计数守卫（满则 `return 0`，不建段）。
  > 2026-09-29 复核：`ab_slot_limit` / `cd_slot_limit` 两条用例现在都断言"无残留"并通过（段数分别 = 10 / 20）。
  > 也就是说当前没有观察到残留；若后续再出现，这两条会立刻变红。
- F-8 README 写的「玩家离开/死亡自动清理」不成立：`tick` 用 `as @a[scores={dt.leave=1..}]` 分发，而离线的玩家
  不在 `@a` 里 ⇒ `internal/player_leave` 不可达。现按已知限制处理：每人一条 `dt.uid` 残留（有界、无害），已被断言钉住。
  修法建议：反向扫描 `doom.ui:mixer data[].uid`，清理"没有在线玩家持有"的条目。
  > 2026-09-28 收口：① 可达路径（重登后再离开）已在 `internal/player_leave` 补上 `dt.uid` 复位；
  > ② 离线回收 `internal/leave_scan`（每 20t）继续清 `sessions.*` 与 `doom.ui:mixer` 条目（真机断言 6/6 绿）；
  > ③ 契约与套件断言按"可达成"同步，残留每人一条、有界无害。
- F-9 非法宏参数（如 `color:"orange"`）会留下半截状态：无 bossbar、无会话，但 `bb_index` 里已有幽灵条目。
  建议在 `api/bossbar` 里对 `color`/`style` 做白名单校验后再进 entry。
- F-10 `clear type=3` 清 xpbar 时 `on_fade` 不触发（"结束回调"这条契约与实现不一致）。
- F-11 flash 的 `on_fade` 在打断路径同样需要 `on_interrupt`（与 F-5 同源；是否统一取决于设计意图，待决）。
- F-12 非玩家实体（掉落物）会被分配 uid 并建立 UI 会话（`entry` 缺 `type=player` 过滤；玩家 UI 不受影响，但脏状态会累积）。
- F-13 `silent_clear_all` 不取消已排定的延迟任务（到期时因会话已不存在而 no-op，但队列本身没清）。

口径修正（都是实测换来的）

- 非法 bossbar 颜色白名单：只认 `pink / blue / red / green / yellow / purple / white`（测试里曾用 `gold`/`aqua` ⇒ 假红）。
- 重门不得与轻门并发跑：并发会让数字互相混写（实测两次假红：`verify_biome_at 3/0`、`verify_multibot 4/0`，单跑即复绿）。
- 面板 TPS 采样要固定窗口；`tellraw` 不进专用服务器日志 ⇒ 采集走 `say`。

## 2026-09-28 · v2.0-beta 首个预发布

- 发布 `README.md`（安装 / 依赖 / API 一览 / 限制）与 LICENSE；GitHub 预发布 v2.0-beta。
- 架构定稿：每玩家 `dt.uid` 绑定 mixer 数据；UI 会话用 SID（`dt.sid_*`）标识；
  驱动循环（`#minecraft:tick`）countdown 20t / actionbar 5t / bossbar 1t / xpbar 1t；
  alert / flash 走 `doom.schedule` 的延迟执行；actionbar 经 mixer 按优先级（10–50）排序渲染。
- 规模：122 个 mcfunction / 1632 行 / 86 个宏函数 / 4 个标签。
- 验收口径：真机验收台（`--list` / `--only` / `--group`，退出码 0/1），
  首轮 用例 52/53 · 断言 333/334、服务器 TPS 19.9（1s 窗口）；人工观感清单见 [`docs/03-示例调用串.md`](docs/03-示例调用串.md)。

---

## 附：接口与边界（速查）

| 项 | 值 |
|---|---|
| 对外 API | `doom.ui:api/{actionbar,countdown,bossbar,alert,flash,chat,sound,separator,xpbar}` |
| 依赖 | `doom.schedule` v2+（alert / flash / actionbar 淡出的延迟回调） |
| 外部注册钩子 | `#doom.ui:interrupt` |
| 槽位上限 | actionbar **10** / countdown **20**（超限丢弃；段残留见 F-7） |
| 离线清理 | 不自动（**见 F-8**）：每人一条 `dt.uid` 残留，有界无害 |
| 三道门 | `node src/tools/check_static.mjs`（静态门）· `node src/tools/check_leak.mjs`（泄漏 + 顶层白名单）· `node src/tools/make_dist.mjs --check`（发行物可复现）；CI 见 `.github/workflows/static.yml` |
