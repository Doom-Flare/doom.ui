# 02 · 用法与 API
English: `docs/02-用法与API.en.md`

## 调用约定

所有 API 都走宏参数：`/function doom.ui:<api> {with:{…}}`。

- `targets` 默认 `@s`（谁执行就发给谁）；要给所有人就写 `"@a"`。
- 文本一律是文本组件（list 形态最稳）：`[{"text":"你好","color":"gold"}]`。
- 数字是 tick（20 tick = 1 秒），除非那一条写明是“秒”。
- 同一个 `slot` 的再次调用会顶掉旧的，并触发旧会话的 `on_interrupt`。

> 一条硬坑：本包的每个 `api/*` 进来第一件事是 `data remove storage doom.ui:ctx _`。
> 所以外包一层再传参数时不要写进 `doom.ui:ctx _`，会被清掉。

## Actionbar（屏幕下方的常驻文本）

```mcfunction
function doom.ui:api/actionbar {with:{targets:"@a",content:[{"text":"Hello","color":"gold"}],time:200}}
```

| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `targets` | string | `@s` | 目标选择器 |
| `content` | 文本组件 | **必填** | actionbar 内容 |
| `time` | int | 100 | 显示时长（tick） |
| `slot` | string | `"default"` | 槽位（同槽覆盖） |
| `fade` | bool | true | 到期前淡出（最后 10t 渐暗） |
| `on_fade` | string | `""` | 自然结束回调（命令串） |
| `on_interrupt` / `on_interrupted_run` | string | `""` | 被顶掉 / 被清掉时的回调 |

## Countdown（倒计时）

```mcfunction
function doom.ui:api/countdown {with:{targets:"@a",prefix:[{"text":"倒计时","color":"gold"}],time:10}}
```

| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `time` | int | 100 | 倒计时秒数（显示 time..1，到期触发 `on_fade`） |
| `slot` | string | `"countdown"` | 槽位 |
| `prefix` | 文本组件（列表形态） | 空 | 前缀文本，例如 `prefix:[{text:"倒计时",color:"gold"}]` |
| ↳ 颜色契约 | — | — | 前缀给了 `color` 时，秒数与结尾的 `s` 跟随该颜色（`: ` 固定白色）；前缀无颜色则整段用默认色 |
| `priority` | int | 20 | mixer 渲染优先级 |

## Bossbar（血条样式的条）

```mcfunction
function doom.ui:api/bossbar        {with:{targets:"@a",name:[{"text":"Boss","color":"red"}],time:200,color:"red",style:"notched_6"}}
function doom.ui:api/bossbar_update {with:{bid:"default",new_time:200}}
function doom.ui:api/bossbar_remove {with:{bid:"default"}}
```

| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `name` | 文本组件 | `bossbar` | 名称 |
| `time` | int | 100 | 时长（tick） |
| `color` / `style` | string | `white` / `progress` | 外观。**`color` 只认 `pink / blue / red / green / yellow / purple / white`**，`style` 认 `progress` / `notched_6` / `notched_10` / `notched_12` / `notched_20` |
| `bid` | string | `"default"` | 标识（`bossbar_update` / `bossbar_remove` 按它找） |
| `countdown` | bool | false | 是否显示剩余秒数 |
| `show_sec` / `sep` | — | — | 秒数显示格式 |

## Alert（大标题 / 副标题）

```mcfunction
function doom.ui:api/alert {with:{targets:"@a",title:[{"text":"警告","color":"red"}],time:100}}
```

| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `title` / `subtitle` | 文本组件 | — | 标题 / 副标题 |
| `fade_in` / `time` / `fade_out` | int | 5 / 100 / 10 | title times。清除时刻 = `fade_in + time + fade_out`（完整播完；旧版误用 `time`，会砍掉淡出） |

## Flash（闪烁）

```mcfunction
function doom.ui:api/flash {with:{targets:"@a",title:[{"text":"闪！","color":"yellow"}],count:5,interval:10}}
```

| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `count` | int | 5 | 闪烁次数 |
| `interval` | int | 10 | 间隔（tick） |
| `sound` | string | — | 每次闪烁的音效（可被 `flashes[].sound` 覆盖） |
| `flashes` | list | — | 逐波覆盖（`title` / `subtitle` / `sound`） |

## Chat / Sound / Separator

```mcfunction
function doom.ui:api/chat      {with:{targets:"@a",content:[{"text":"hi"}]}}
function doom.ui:api/sound     {with:{targets:"@a",sound:"minecraft:block.note_block.harp"}}
function doom.ui:api/separator {with:{targets:"@a",separator:{text:" | "}}}
```

`separator` 改的是同一玩家 mixer 里各段之间的分隔符（默认就是 ` | ` 那类拼接符），不是独立的 UI 元件。

## XPbar（经验条当进度条）

```mcfunction
function doom.ui:api/xpbar {with:{targets:"@s",time:100}}
```

- 用经验条显示进度，结束时恢复玩家原经验（不是清零）。
- `on_fade` 结束回调。

## Clear / remove

```mcfunction
function doom.ui:api/clear {with:{type:1,targets:"@a"}}          # 1=countdown 2=actionbar 3=全部 4=bossbar
function doom.ui:api/clear {with:{type:2,targets:"@a",slot:"a"}} # 指定槽清除
function doom.ui:api/clear_all                                   # 全局清空
function doom.ui:api/silent_clear_all                            # 全局清空（不触发回调、不动经验）
function doom.ui:api/remove {with:{targets:"@s",slot:"default"}} # 移除该槽（actionbar 与 countdown 同名槽都会清）
```

## 限制

- 单玩家 actionbar 最多 10 槽，countdown 最多 20 槽（超出丢弃）。
- 渲染上限：mixer 每玩家 20 段 × 每段 4 文本部分；`priority` 取值 10–50。
- bossbar 走递归驱动，没有固定槽位上限。

---

## 内部结构（改代码前先看这里）

| 路径 | 用途 |
|---|---|
| `doom.ui:ctx _` | 宏通道：每个 `api/*` 进来第一件事就是 `data remove storage doom.ui:ctx _`。外包装参数不要写这里，会被清掉 |
| `doom.ui:ctx sessions.*` | 每玩家会话：`ab_<uid>` / `cd_<uid>` / `al_<sid>` / `fl_<sid>` / `xp_<sid>` / `bb_<sid>` |
| `doom.ui:ctx _.tr.<uid>` | 渲染用标题数组（由 `build_title_arr` 生成） |
| `doom.ui:ctx bossbars` | 数组 `[{bid,sid}]`，供调试查看 |
| `doom.ui:ctx bb_index` | 复合映射 `{ "<bid>": sid }`，bid→sid 的唯一查找路径 |
| `doom.ui:mixer data` | mixer 段数据：`[{uid, content:[{id,priority,text,type}], separator}]` |

两条硬规则，都是踩过的坑：

1. `data modify … set from` 的“源路径”带 `[{k:v}]` filter 会静默失败（目标路径带 filter 没问题）。
   需要按 bid / uid / id 找值，一律走 `bb_index` 这类复合映射，或先 `data get`。
2. `if data <path>` 判的是“存在”，不是“非零”。用 `execute store result` 写出来的 `0` 也会判真。
   要判有效值必须转成 score 再 `matches 1..`。

钩子：`#doom.ui:interrupt` 是空标签，供外部包注册打断处理函数。
`dt.interrupt` 是 trigger 计分板。

## 驱动与生命周期

- 驱动循环挂在 `#minecraft:tick` 上：countdown 20t / actionbar 5t / bossbar 1t / xpbar 1t。
- 玩家在线时离开或死亡，会自动清理对应 UI 会话（flash 循环停止、xpbar 恢复）。
- 已经离线的玩家只清 `sessions.*` 与 `doom.ui:mixer` 条目（可达回收路径 `internal/leave_scan`，每 20t）；
  某个离线玩家的计分板分数任何纯数据包手段都复位不了。见 [CHANGELOG](../CHANGELOG.md) 的 F-8。
- `/reload` 后 sessions / mixer 保留；`__unload__` 彻底清理。
