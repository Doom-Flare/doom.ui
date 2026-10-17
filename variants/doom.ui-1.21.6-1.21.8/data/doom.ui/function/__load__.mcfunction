tellraw @a [{"text":"[DT] ","color":"gold"},{"text":"DBM 5.0","color":"green"},{"text":" by Doom_Flare","color":"gray"}]
scoreboard objectives add dt.id dummy
scoreboard objectives add dt.uid dummy
scoreboard objectives add dt.leave custom:leave_game
scoreboard objectives add dt.deaths deathCount
scoreboard objectives add dt.hp health
scoreboard objectives add dt.temp dummy
scoreboard players set #2 dt.temp 2
scoreboard players set #5 dt.temp 5
scoreboard players set #9 dt.temp 9
scoreboard players set #20 dt.temp 20
scoreboard players set #60 dt.temp 60
scoreboard players set #100 dt.temp 100
scoreboard objectives add dt.sid_al dummy
scoreboard objectives add dt.sid_fl dummy
scoreboard objectives add dt.sid_xp dummy
scoreboard objectives add dt.xp_lvl dummy
scoreboard objectives add dt.xp_pts dummy
scoreboard objectives add dt.xp_time dummy
scoreboard objectives add dt.xp_dead dummy
scoreboard objectives add dt.fl_r dummy
scoreboard objectives add dt.ab_remain dummy
scoreboard objectives add dt.interrupt trigger
execute unless data storage doom.ui:mixer data run data modify storage doom.ui:mixer data set value []
execute unless data storage doom.ui:ctx sessions run data modify storage doom.ui:ctx sessions set value {}
execute unless data storage doom.ui:ctx active_bossbars run data modify storage doom.ui:ctx active_bossbars set value []
execute unless data storage doom.ui:ctx bossbars run data modify storage doom.ui:ctx bossbars set value []
execute unless data storage doom.ui:ctx bb_index run data modify storage doom.ui:ctx bb_index set value {}




# bossbar 合法取值白名单（1.21.6 源码：BossBarCommands 用 Commands.literal("pink")… 逐一枚举，
# 非法取值是**解析期**错误 ⇒ 宏函数整批实例化失败 ⇒ 该文件一行都不执行。见 F-9。
data modify storage doom.ui:ctx const.colors set value {pink:1,blue:1,red:1,green:1,yellow:1,purple:1,white:1}
data modify storage doom.ui:ctx const.styles set value {progress:1,notched_6:1,notched_10:1,notched_12:1,notched_20:1}
# 音源枚举白名单（PlaySoundCommand.java：SoundSource.MASTER/MUSIC/RECORD/WEATHER/BLOCK/HOSTILE/NEUTRAL/PLAYER/AMBIENT/VOICE）
data modify storage doom.ui:ctx const.sources set value {master:1,music:1,record:1,weather:1,block:1,hostile:1,neutral:1,player:1,ambient:1,voice:1}
scoreboard players set #timer_5 dt.temp 0
scoreboard players set #timer_20 dt.temp 0

# F-16（2026-09-29）：多人满槽时每拍命令数会顶穿 maxCommandChainLength(默认 65536)，
# 服务端会把本拍剩下的命令**静默丢弃**（日志：Command execution stopped due to limit），
# 表现是 countdown 会话条目凭空少几条、mixer 段却在。这里抬到上限，并配合 set_segment_quiet 降耗。
gamerule maxCommandChainLength 2147483647
