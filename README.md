# NCT-Guide

《The New Campaign Trail》离线竞选攻略插件：比较当前对话选项、预测选举人票与普选票，并推荐值得访问的州。

## 成就攻略

[31 项原生成就条件与攻略（含剧透）](achievements/README_ZH.md)：配置、真实触发条件、指定答案中英对照、访问与控票建议，以及菜单描述与源码的差异。可以直接阅读，无需安装插件；不包含社区 MOD 成就。

现在也支持**游戏内实时成就引导**：进入竞选后开启攻略，在“本局目标”下拉框选择成就。它会按当前总统与搭档检查资格、提示必选答案、发现漏选、按成就目标重排答案与访问州；组合不合适时自动展开可替代的组合建议。结算后读取真实成就存档显示是否解锁。

替代组合先按源码条件筛选，优先推荐已有实际解锁记录的组合，再参考普通胜选单种子结果；明确列出配置与实测次数，不伪称最高成功率。详见 [实时引导与实际验证](achievements/LIVE_COACH_ZH.md)。

[路线与实际解锁覆盖](achievements/COVERAGE_ZH.md) · [社区来源和缺口](achievements/WEB_RESEARCH_ZH.md)。逐题路线已接入游戏，显示当前答案和下一次访问；设置不符、原文变化或偏离路线时会警告并停用固定路线。未通过实际解锁的候选有明确标记。

本轮已记录613局实际浏览器游戏，**31／31项原生成就均有实际解锁证据**，包括真实100局2016a和同存档七年累计。成功记录不等于每局必得。详见 [本轮测试报告](achievements/TEST_REPORT_2026-10-17_ZH.md)。

## 安装

1. 下载并解压 [NCT-Chinese-Version](https://github.com/hy0713/NCT-Chinese-Version)。
2. 下载本仓库，安装 Python 3，在本仓库目录运行：

```powershell
python install.py "D:\Games\NCT-Chinese-Version"
```

3. 在中文版目录双击 `start.bat`，刷新游戏，点击顶部 **攻略（含剧透）**。默认关闭，记住选择。

本局不打成就时，取消勾选面板中的 **“启用成就引导”**：成就提示和专项规划关闭，普通胜选攻略保留。开关会记住选择，再开启可恢复上次目标；不影响游戏进度，也不阻止游戏自然解锁成就。

已安装旧版攻略时，使用 `python install.py "D:\Games\NCT-Chinese-Version" --upgrade`。只更新哈希匹配已发布版本的文件，拒绝覆盖未知的个人修改，并在本地保留备份。默认仅安装运行时文件；开发测试脚本可另外加 `--dev-tools`。

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
