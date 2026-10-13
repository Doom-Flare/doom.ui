# doom.ui 玩家手册
English: `docs/README.en.md`

按你现在的处境挑一篇：

| 你想干什么 | 看这篇 | 大概多久 |
|---|---|---|
| 把它装进存档 / 服务器 | [01-安装](01-安装.md) | 2 分钟 |
| 知道每个 API 收什么参数、默认值是什么 | [02-用法与API](02-用法与API.md) | 10 分钟 |
| 直接复制一段能用的调用串 | [03-示例调用串](03-示例调用串.md) | 30 秒 |
| 确认“我的版本能不能用”“要不要开实验性玩法” | [04-兼容与版本](04-兼容与版本.md) | 1 分钟 |
| 我能不能整合进整合包 / 二次发布 / 商用 | [05-致谢与许可](05-致谢与许可.md) | 1 分钟 |
| 这个版本改了什么、有哪些已知限制 | [../CHANGELOG.md](../CHANGELOG.md) | 5 分钟 |
| 想读代码 / 自己改包 | [../src/README.md](../src/README.md) | — |

## 三十秒版

1. 装依赖 [doom.schedule](https://github.com/DoomDecapitator/doom.schedule) v2+（不装，alert / flash / 淡出回调会静默失效）。
2. 把 `doom.ui/` 和 `doom.schedule/` 一起丢进 `<存档>/datapacks/`（服务器：`world/datapacks/`）。
3. `/reload`，然后：
   ```
   /function doom.ui:api/actionbar {with:{targets:"@a",content:[{"text":"Hello","color":"gold"}],time:200}}
   ```
   屏幕上出现金色 `Hello` 停 10 秒 = 通了。

出问题先看 `logs/latest.log` 里有没有 `Failed to load function`。缺依赖、包放错层级、版本不符，都会在那里留一行。

## 这套东西的心智模型（看懂它，API 就不用背）

- 一次调用 = 一个会话：每个玩家有一条 `dt.uid`，绑定自己的 mixer 数据。每次 API 调用建一个会话，
  用 SID（`dt.sid_*`）标识，各自独立计时、独立到期。
- 同槽覆盖：`slot` 同名的新调用会顶掉旧的，旧的 `on_interrupt` 回调会触发。
- 渲染走 mixer：actionbar 不是直接发给玩家，而是把所有活着的段按 `priority`（10–50）排序、拼成一行再发。
  所以同一时刻多个效果可以叠着显示，而不是互相盖掉。
- 回调有两种：自然到期 → `on_fade`；被顶掉或被清掉 → `on_interrupt`。
- alert / flash 的延迟交给 `doom.schedule` 排期，所以它是硬依赖。
