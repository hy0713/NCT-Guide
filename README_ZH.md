# NCT-Guide

[English](README.md) · 简体中文

《The New Campaign Trail》离线竞选攻略插件：比较当前对话选项、预测选举人票与普选票，并推荐值得访问的州。

**全部31项逐项检查已完成（2026-11-18汇总）：**共记录300局。27项单局目标各测5组，其中8项5/5解锁、17项结果波动、2项0/5；百局、七年累计和特殊操作成就另作完整核验。[31项逐项结果与原始记录](ALL_ACHIEVEMENTS_AUDIT_ZH.md)。

11 月 19 日版更新了六条路线，并修复了部分巡访地点无法点击的问题。偏离逐题建议后，系统会尝试接上与你的进度相符的实测路线。[新版路线与新旧对照](ACHIEVEMENT_OPTIMIZER_ZH.md)

## 成就攻略

[31 项原生成就条件与攻略（含剧透）](achievements/README_ZH.md)：配置、真实触发条件、指定答案中英对照、访问与控票建议，以及菜单描述与源码的差异。可以直接阅读，无需安装插件；不包含社区 MOD 成就。

现在也支持**游戏内实时成就引导**：进入竞选后开启攻略，在“本局目标”下拉框选择成就。列表只显示当前年份、总统和副总统组合适用的成就；BIGSHOT 彩蛋仅在原版特殊分支下显示。它会提示必选答案、发现漏选、按成就目标重排答案与访问州。切换组合后，若原目标不再适用，会自动恢复普通胜选攻略。结算后读取真实成就存档显示是否解锁。

替代组合按原版条件筛选，优先推荐已有解锁记录的组合，并列出配置和回放次数。[实时引导与实际验证](achievements/LIVE_COACH_ZH.md)

逐题路线会显示当前答案和下一次访问。偏离原路线时，面板会说明已接续到哪类建议；模式或难度不合适时，会提示已有实测路线的开局配置。[路线与实际解锁覆盖](achievements/COVERAGE_ZH.md) · [社区来源和缺口](achievements/WEB_RESEARCH_ZH.md)

**31／31 项原生成就有实际解锁记录**，包括真实完成 100 局 2016a 和同一存档七年累计。[原版累计流程测试](achievements/TEST_REPORT_2026-10-17_ZH.md)

## 面板使用

默认显示本题建议，其他选项、成就条件、路线来源与预测数据可以展开。进入访问环节时，优先显示推荐州。后续整局推演在后台运行，可继续操作游戏。

[本次界面与响应测试](guide/COMPACT_UI_TEST_REPORT_ZH.md)

[筛选与缓存更新验证](guide/CACHE_REFRESH_TEST_REPORT_ZH.md)：实际Chrome确认、安装升级、后台脚本版本及两局断网成就解锁。

## 安装

1. 下载并解压 [NCT-Chinese-Version](https://github.com/hy0713/NCT-Chinese-Version)。
2. 下载本仓库，安装 Python 3，在本仓库目录运行：

```powershell
python install.py "D:\Games\NCT-Chinese-Version"
```

3. 在中文版目录双击 `start.bat`，刷新游戏，点击顶部 **攻略（含剧透）**。默认关闭，记住选择。

本局不打成就时，取消勾选面板中的 **“启用成就引导”**：成就提示和专项规划关闭，普通胜选攻略保留。开关会记住选择，再开启可恢复上次目标；不影响游戏进度，也不阻止游戏自然解锁成就。

已安装旧版攻略时，使用 `python install.py "D:\Games\NCT-Chinese-Version" --upgrade`。只更新哈希匹配已发布版本的文件，拒绝覆盖未知的个人修改，并在本地保留备份。默认仅安装运行时文件；开发测试脚本可另外加 `--dev-tools`。

升级后，入口脚本、样式与后台规划器会统一更新内容版本号，刷新即可加载新版本，避免旧缓存继续显示全部成就。

这是独立插件仓库，不含游戏本体或社区 MOD。支持中文与英文。安装器保留本地备份，遇到已有不同攻略文件或翻译键时退出，避免覆盖修改。

## 建议如何产生

从原游戏计算函数生成独立只读预测器。在当前状态的副本上比较全部可见答案和访问州，随机项归零；不替玩家作答，不改变原始数值、进度或随机流。历史解释沿用中文版的有来源离线旁注。

预测不是胜率：这是逐题动态推荐，未证明全局最优或所有人物必胜。搭档、难度、随机波动会影响结果；高级模式不预测未来广告、筹款和对手行为。

## 测试与维护

历史实际回归覆盖 105 组合、210 局双语通关，另有 5 局隐藏攻略对照。种子 1776 下为 **95 胜、7 负、3 僵局**；这是一组路径的结果，不是胜率或人物胜选上限。

- [机制与历史依据](guide/README_ZH.md)
- [原交付实测报告](guide/TEST_REPORT_ZH.md)
- [独立安装验证](PUBLICATION_TEST_REPORT_ZH.md)
- [原作来源与权利](NOTICE.md)

安装后，在游戏目录执行 `npm install`，保持 `python server.py` 运行，再按顺序运行：

```powershell
node tools/build-guide.cjs --check
node tests/guide-model.cjs
node tests/guide-ui.cjs
node tests/guide.cjs --smoke
```

源码更新后重新生成预测器：在游戏目录运行 `node tools/build-guide.cjs`，再将生成的 `localization/guide/model.js` 同步到本仓库 `guide/model.js`。旧版本的预测器不能自动保证兼容未来改动。

卸载：移除 `campaign-trail/index.html` 中全部五条 `/localization/guide/` 引用。正文、原始数据与计算函数未被安装器改写。
