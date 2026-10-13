# 这是什么
English: `src/README.en.md`

**本仓库的「可执行的部分」**：三道能切跑的门 + 确定性打包脚本。

⚠️ 先说一件容易误会的事：**本包没有生成器**。`doom.ui/` 里那些 mcfunction 就是**手写的源码本身**，
不是从别处生成出来的 —— 所以这里**没有** `gen_*.mjs` 那一套。

| 位置 | 是什么 | 给谁 |
|---|---|---|
| [`../dist/`](../dist) | **成品**：三份变体 zip + `SHA256SUMS.txt` | 只想装进存档玩的玩家 —— **你多半只要这个** |
| [`../doom.ui/`](../doom.ui/data/doom.ui/function) | **数据包本体（就是源码）**：每个 mcfunction 都能直接点开看 | 想知道"它到底怎么写的"、想自己改的人 |
| `src/`（本目录） | **门与打包**：静态门 / 结构门 / 打包脚本 | 想改包后自证没写坏、想自己发一版的人 |

**只玩的话不用碰这个目录**：直接下 `dist/` 的 zip。

---

## 三步构建

前置：**Node.js 18+**。不需要联网，不需要 Minecraft，不需要装任何依赖（零 npm 包）。

```
# ① 改包 —— 本体就是源码，直接改 mcfunction
#    改 doom.ui/data/doom.ui/function/**（改完 /reload 或换包即生效，没有"重新生成"这一步）

# ② 静态门 —— 这一步就是"我改的东西没写坏"的答案
node src/tools/check_static.mjs
#    期望：0 error, 1 warning（那 1 条 warning 是引用外部命名空间 doom.schedule，属依赖，不算错）

# ③ 打包发行物（zip 内顶层目录 = doom.ui/）
node src/tools/make_dist.mjs
#    产出 dist/ 下三份变体 zip 与 dist/SHA256SUMS.txt，并打印各自 sha256
```

**装配进存档**：把 `doom.ui/` 整个复制到 `<存档>/datapacks/`（服务器 `world/datapacks/`）→ 进游戏 `/reload`。
别忘了依赖 **doom.schedule v2+** 也要放进去。

## 目录里有什么

| 路径 | 内容 |
|---|---|
| `tools/check_static.mjs` | **静态门**：JSON / `pack.mcmeta` 可解析 · 函数与函数标签引用闭包 · mcfunction 加载期规则（L4·L7·L9–L13）· 宏文件的 `with` 来源。每条规则都对应过一次真机 `Failed to load function` |
| `tools/check_leak.mjs` | **结构门**：① 泄漏扫描（本机绝对路径 / 开发物标识 / 第三方素材标识）② 顶层白名单（只允许 README · LICENSE · CHANGELOG · dist/ · docs/ · src/ · .github/ · doom.ui/） |
| `tools/make_dist.mjs` | **打包**：自己写 zip、时间戳钉死在 1980-01-01、条目排序钉死 ⇒ **同样的输入必然打出同样的字节**。`--check` 模式只比对不写盘 |

## 哪些能直接跑、哪些不能（实测）

下表的"能直接跑"是在**一个干净的克隆**里跑过的（Node 18+，除本目录外没有任何额外文件）：

| 能直接跑 | 说明 |
|---|---|
| `node src/tools/check_static.mjs` | **在本仓库实跑通过**：0 error / 1 warning（warning 是引用外部命名空间 `doom.schedule:`） |
| `node src/tools/check_leak.mjs` | 同上：泄漏 0 处 · 顶层 0 违规。本机 git 不在 PATH 时用 `DOOM_GIT=<git 完整路径> node src/tools/check_leak.mjs`；不在 git 仓库里时加 `DOOM_TOP=off` |
| `node src/tools/make_dist.mjs` | 重新打包；`--check` 与 `dist/` 里的 zip 比，不一致则退出码 1 |
| `DOOM_PACK=<别的克隆>/doom.ui node src/tools/check_static.mjs` | 查另一个克隆的包体 |

| 不能直接跑（要开发仓库或外部环境） | 为什么 |
|---|---|
| 真机验收台（53 用例 / 335 断言，支持只跑一组 / 只跑一条，退出码 0=PASS） | 要一台开着 RCON 的 1.21.6 Fabric 服务端 + 一个存档 + 一个真实客户端。测试台在**私有开发仓库**，普通玩家也不该去碰 |
| 压测脚本（`stress_ui_concurrency.mjs` / `stress_ui_extreme.mjs` / `stress_ui_profile.mjs`）（同上） | 要 Carpet 假玩家或多台机器人；产出的是 [CHANGELOG](../CHANGELOG.md) 里那张并发阶梯表 |
| `/reload` 的加载期门 | 静态门查不出"加载期才炸"的那一类；`check_static` 覆盖的是已知会炸的写法，不是全部 |

## 已知差异（诚实清单）

- **`dist/` 的 zip 与 `doom.ui/` 逐字节一致（0 差异）** —— 这条不是承诺，是**跑出来的**：
  `node src/tools/make_dist.mjs --check` 会现场重打一次再逐字节比。CI 也跑这条。
  历史上这个 zip 曾经落后过（F-15 / F-16 / F-17 三个修复没进 zip），现在由这条门钉住。
- **本包没有生成器，所以没有"生成器漂移"这一类差异**：`doom.ui/` 就是源码，不存在"源码与产物不同步"的中间层。
- **`src/` 里没有测试台**：真机验收台与逐轮取证报告在私有开发仓库。原因见上面那张表；
  这也是仓库模板的规矩（玩家向仓库不放 `tests/` / `reports/` / 机器日志）。
- **手工观感没验**：淡出渐暗的观感、bossbar 分段外观、音效听感、编辑器补全体验 —— 清单见
  [`../docs/03-示例调用串.md`](../docs/03-示例调用串.md)。
