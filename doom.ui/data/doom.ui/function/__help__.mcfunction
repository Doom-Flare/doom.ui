# doom.ui:__help__ -- display help information
tellraw @s {"text":"=== [DT] DBM 5.0 by Doom_Flare ===","color":"gold","bold":true}
tellraw @s {"text":"--- Actionbar ---","color":"green"}
tellraw @s {"text":"api/actionbar {with:{targets, content, time, slot, priority, fade, on_fade, on_interrupt}}","color":"white"}
tellraw @s {"text":"  time: ticks (or duration). priority: 10=default.","color":"gray"}
tellraw @s {"text":"  on_interrupt: true=clear\u65f6\u4e5f\u89e6\u53d1 on_fade","color":"gray"}
tellraw @s {"text":"--- Countdown ---","color":"green"}
tellraw @s {"text":"api/countdown {with:{targets, prefix, time, slot, priority, on_fade}}","color":"white"}
tellraw @s {"text":"  time: \u79d2 (or seconds). priority: 20=default.","color":"gray"}
tellraw @s {"text":"--- Alert ---","color":"green"}
tellraw @s {"text":"api/alert {with:{targets, title, subtitle, time, fade_in, fade_out, priority, on_fade}}","color":"white"}
tellraw @s {"text":"--- Bossbar ---","color":"green"}
tellraw @s {"text":"api/bossbar {with:{targets, name, time, color, style, bid, countdown, sep, on_fade}}","color":"white"}
tellraw @s {"text":"  countdown: true=\u663e\u793a\u79d2\u6570. sep: \u5206\u9694\u7b26.","color":"gray"}
tellraw @s {"text":"--- Flash ---","color":"green"}
tellraw @s {"text":"api/flash {with:{targets, title, subtitle, count, interval, priority, on_fade}}","color":"white"}
tellraw @s {"text":"  count: 5=default. interval: 10t=default.","color":"gray"}
tellraw @s {"text":"--- XPBar ---","color":"green"}
tellraw @s {"text":"api/xpbar {with:{targets, time, on_fade}}","color":"white"}
tellraw @s {"text":"  \u7b49\u7ea7\u5012\u6570 + \u7ecf\u9a8c\u6761\u767e\u5206\u6bd4\uff0c\u7ed3\u675f\u81ea\u52a8\u6062\u590d","color":"gray"}
tellraw @s {"text":"--- Chat ---","color":"green"}
tellraw @s {"text":"api/chat {with:{targets, content, on_fade}}","color":"white"}
tellraw @s {"text":"--- Sound ---","color":"green"}
tellraw @s {"text":"api/sound {with:{targets, sound, source, volume, pitch}}","color":"white"}
tellraw @s {"text":"  sound: default xp_orb.pickup. source: default master.","color":"gray"}
tellraw @s {"text":"--- Clear ---","color":"red"}
tellraw @s {"text":"api/clear {with:{targets, type}}  type:1=cd 2=ab 3=all 4=bb","color":"white"}
tellraw @s {"text":"api/bossbar_remove {with:{bid}} / api/bossbar_update {with:{bid,new_time}}","color":"white"}
tellraw @s {"text":"api/clear_all  -- 带中断回调","color":"white"}
tellraw @s {"text":"api/silent_clear_all  -- 不触发回调，强制清空","color":"white"}
tellraw @s {"text":"--- Remove ---","color":"red"}
tellraw @s {"text":"api/remove {with:{targets, slot}}","color":"white"}
tellraw @s {"text":"--- Separator ---","color":"green"}
tellraw @s {"text":"api/separator {with:{targets, separator}}","color":"white"}
tellraw @s {"text":"--- Debug ---","color":"yellow"}
tellraw @s {"text":"__debug__ / __help__ / __unload__","color":"gray"}
tellraw @s {"text":"--- Alias --- time/duration/seconds/stay","color":"gray"}


