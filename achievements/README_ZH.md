# NCT 原生成就攻略（含剧透）

本攻略覆盖 **31 个原生成就**，不包含成就菜单里的社区 MOD 项目。对应上游提交 `d6655ef6ad80ab9a8fe5510d0fd43874e57dacbf`，以独立中文版当前保留的原始判定为准。攻略是可离线阅读的文档，不自动解锁或修改存档。

## 先检查这五件事

1. **多数普通成就用经典模式、普通难度0.97最稳妥。** 普通或更难通常指倍率≤0.97；具体例外写在条目中。比例分票没有被全局门槛排除，但本攻略的州路线以通常的赢家通吃玩法为基准。
2. 普通成就要求 `bigshot_mode != true`、`dirtyhacker3 == null`，并且 `game_type_id !== "3"`。原作这里是严格的字符串比较；UI正常选择高级模式会受到排除。独立攻略面板不是BIG SHOT，不会自己把一局变成作弊局。
3. **打到最终结算。** 大部分检查不在答题时进行。一个成就拿到后，本局的锁通常阻止再弹另一个；同时满足多个目标时，源码更靠前的判定可能优先。特别是“殊途同归”、2020的精确票数与2016a累计项，别把没弹第二个当成存档损坏。
4. 成就保存在当前网页源的localStorage。同一浏览器也要保持 `localhost`/`127.0.0.1`、协议和端口一致。清站点数据会丢成就；无痕窗口不适合刷100局。直接改成就JSON而不匹配MD5会触发原作清空与刷新。
5. **即时胜选攻略不等于成就攻略。** 精确306／269票、故意落败、输掉指定州、指定回答，都可能要求你放弃即时最高收益答案。先满足硬条件，再优化其余题。

## 如何使用下面的路线

每项列出配置、真实硬条件、操作建议与常见误区。策略建议是根据机制推导，并非每项都有已验证的25题固定路线。没有宣称31项均自然通关解锁。固定答案在文末逐字列出，避免“选第几个选项”随界面顺序变化而失效。刷新或换搭档可能改变可见选项，优先按内容识别。

得分型目标先用攻略比较选择、巩固必需州，再访问少量能翻转的州。精确票数目标先列州集合并求和：避开非目标州，最后用访问救目标州。下文的州建议是优先观察对象，不是保证该局民调一定接近。

## 原生年份覆盖

1844、1860、1964本身没有专属普通成就；1964参与306/232跨年计数。其余按以下各项处理。社区MOD成就即便写在同一主脚本中，也不因重复使用election_id而成为原生成就。

## 1. 殊途同归

**ID：`destiny` · 配置：1964、1976、1988、2000、2012、2016、2020，普通或更难。**

**实际目标：** 七个年份分别取得本人306或232票，七个标记全部集齐。

这不是七连胜：本人232票也记账。选两党候选人；先确定一组总计306或232票的目标州，再把访问集中到其中最接近翻转的州，避免额外翻州。用投票结果反向调整路线。2016a不计入，1968也不计入；代码只核对本人票数，不核对整幅历史地图。最后一年的计数先更新，再检查总成就，可能优先弹出本成就。

<details><summary>源码判定（可复核）</summary>

来源：[campaign_trail.js 第2876行](https://github.com/hy0713/NCT-Chinese-Version/blob/main/static/js/campaign_trail.js#L2876)，属于legitimate branch。

```javascript
!run.achievements["destiny"] && run.threeosix["2020"] && run.threeosix["2016"] && run.threeosix["2012"] && run.threeosix["2000"] && run.threeosix["1988"] && run.threeosix["1976"] && run.threeosix["1964"]
```

</details>

## 2. 黑暗布兰登崛起

**ID：`ridingBiden` · 配置：2020／拜登，普通或更难。**

**实际目标：** 至少406票。

在常规胜选基础上争取共和党倾向州。优先稳住中西部和亚利桑那、佐治亚，再观察得克萨斯、佛罗里达等大州是否接近；访问应追逐可以翻转的大州，而非给安全州锦上添花。不要把攻略的单局预测当成406票保证。

<details><summary>源码判定（可复核）</summary>

来源：[campaign_trail.js 第2883行](https://github.com/hy0713/NCT-Chinese-Version/blob/main/static/js/campaign_trail.js#L2883)，属于legitimate branch。

```javascript
!modded&&  !run.achievements["ridingBiden"] && e.candidate_last_name == "Biden" && e.election_id == 21 && campaignTrail_temp.difficulty_level_multiplier <= 0.97 && e.final_overall_results[n].electoral_votes > 405
```

</details>

## 3. 让美国再次伟大……再来一次

**ID：`magaa` · 配置：2020／特朗普，普通或更难。**

**实际目标：** 至少322票。

保住本方基础，再针对宾夕法尼亚、密歇根、威斯康星等竞争州扩大战果。单纯重现2016年306票不够。比较各答案的州级影响和普选票，但以能跨过322的州组合为目标。

<details><summary>源码判定（可复核）</summary>

来源：[campaign_trail.js 第2887行](https://github.com/hy0713/NCT-Chinese-Version/blob/main/static/js/campaign_trail.js#L2887)，属于legitimate branch。

```javascript
!modded && !run.achievements["magaa"] && e.candidate_last_name == "Trump" && e.election_id == 21 && campaignTrail_temp.difficulty_level_multiplier <= 0.97 && e.final_overall_results[n].electoral_votes > 321
```

</details>

## 4. 他不是我的总统！

**ID：`nmpr` · 配置：2020／特朗普，普通或更难。**

**实际目标：** 本人恰好269票。

这是一道控票题，攻略的最高选举人票推荐常与目标相反。先规划总计269票的州集合，保住核心州，对不能多赢的边缘州避免追加访问。最后几次访问用来修正小幅落后州。判定只看特朗普269票，不单独检查对手269票。

<details><summary>源码判定（可复核）</summary>

来源：[campaign_trail.js 第2891行](https://github.com/hy0713/NCT-Chinese-Version/blob/main/static/js/campaign_trail.js#L2891)，属于legitimate branch。

```javascript
!modded && !run.achievements["nmpr"] && e.candidate_last_name == "Trump" && e.election_id == 21 && campaignTrail_temp.difficulty_level_multiplier <= 0.97 && e.final_overall_results[n].electoral_votes == 269
```

</details>

## 5. 文明获胜……？

**ID：`nomalarkey` · 配置：2020／拜登，普通或更难。**

**实际目标：** 本人恰好306票。

现实2020年地图可作为目标模板：拿下民主党基本盘及拜登当年翻转州，避免额外赢得佛罗里达、北卡罗来纳、得克萨斯。游戏只核对306，不要求各州与历史完全一致。可与“殊途同归”的2020标记同局推进。

<details><summary>源码判定（可复核）</summary>

来源：[campaign_trail.js 第2895行](https://github.com/hy0713/NCT-Chinese-Version/blob/main/static/js/campaign_trail.js#L2895)，属于legitimate branch。

```javascript
!modded && !run.achievements["nomalarkey"] && e.candidate_last_name == "Biden" && e.election_id == 21 && campaignTrail_temp.difficulty_level_multiplier <= 0.97 && e.final_overall_results[n].electoral_votes == 306
```

</details>

## 6. 我依然屹立

**ID：`whatbelt` · 配置：2016（不是2016a），任一候选人，普通或更难。**

**实际目标：** 本人至少270票，并在宾州、密州、威州都排第二。

建议从克林顿出发，寻找佛罗里达、北卡罗来纳等替代州补足缺口；基础盘加替代州必须算够270。访问放到替代州。源码不是泛指“没赢三个州”：逐个要求你是结果表第二名，第三名也不符合。

<details><summary>源码判定（可复核）</summary>

来源：[campaign_trail.js 第2902行](https://github.com/hy0713/NCT-Chinese-Version/blob/main/static/js/campaign_trail.js#L2902)，属于legitimate branch。

```javascript
!modded && !run.achievements["whatbelt"] && e.election_id == 20 && campaignTrail_temp.difficulty_level_multiplier <= 0.97 && e.candidate_id == e.final_state_results[37].result[1].candidate && e.candidate_id == e.final_state_results[21].result[1].candidate && e.candidate_id == e.final_state_results[49].result[1].candidate && e.final_overall_results[n].electoral_votes > 269
```

</details>

## 7. 伯尼之火

**ID：`thebern` · 配置：2016／克林顿＋桑德斯，普通或更难。**

**实际目标：** 至少351票。

选定桑德斯后走全国扩张路线，优先巩固本方基础，再争夺中西部和佛罗里达等高票竞争州。菜单写“至少350”，实际350不解锁；必须超过350。

<details><summary>源码判定（可复核）</summary>

来源：[campaign_trail.js 第2906行](https://github.com/hy0713/NCT-Chinese-Version/blob/main/static/js/campaign_trail.js#L2906)，属于legitimate branch。

```javascript
!modded && !run.achievements["thebern"] && e.candidate_last_name == "Clinton" && e.election_id == 20 && campaignTrail_temp.difficulty_level_multiplier <= 0.97 && e.final_overall_results[n].electoral_votes > 350 && e.running_mate_last_name == "Sanders"
```

</details>

## 8. 莫斯科的火枪手

**ID：`moscow` · 配置：2016／特朗普＋佩林，普通或更难。**

**实际目标：** 在胜选或败选结局中，本人普选票严格多于主要对手。

全国支持率优先于少数摇摆州的选举人票。不要只把访问堆到已稳拿的州；比较选项的全国收益。僵局结局不符合。无需一定赢总统职位。

<details><summary>源码判定（可复核）</summary>

来源：[campaign_trail.js 第2910行](https://github.com/hy0713/NCT-Chinese-Version/blob/main/static/js/campaign_trail.js#L2910)，属于legitimate branch。

```javascript
!modded && !run.achievements["moscow"] && e.candidate_last_name == "Trump" && e.election_id == 20 && campaignTrail_temp.difficulty_level_multiplier <= 0.97 && ((e.final_outcome == "win" && e.final_overall_results[0].popular_votes > e.final_overall_results[1].popular_votes)||(e.final_outcome=="loss" && e.final_overall_results[1].popular_votes > e.final_overall_results[0].popular_votes)) && e.running_mate_last_name == "Palin"
```

</details>

## 9. 为什么？

**ID：`why` · 配置：2016a，任一可玩组合。**

**实际目标：** 在符合资格的一局到达结算。

这是先做的入门成就。不需要赢，但仅点开年份不够；正常回答到底并进入最终结果。难度无额外数值限制，仍需避开高级模式和BIG SHOT。

<details><summary>源码判定（可复核）</summary>

来源：[campaign_trail.js 第2917行](https://github.com/hy0713/NCT-Chinese-Version/blob/main/static/js/campaign_trail.js#L2917)，属于legitimate branch。

```javascript
!modded && !run.achievements["why"] && e.election_id == 16
```

</details>

## 10. 到底为什么？！

**ID：`what` · 配置：2016a，任一可玩组合。**

**实际目标：** 符合资格的结算累计至少100次。

计数在成就检查前加一；用同一浏览器、同一协议与端口持续通关。第一次会先解锁“为什么？”，正常累计到100次可继续解锁本项。失败也能累计；刷新开场不算一局。不要手改存档，校验失败会清空。

<details><summary>源码判定（可复核）</summary>

来源：[campaign_trail.js 第2921行](https://github.com/hy0713/NCT-Chinese-Version/blob/main/static/js/campaign_trail.js#L2921)，属于legitimate branch。

```javascript
!modded && !run.achievements["what"] && e.election_id == 16 && run.tsatrolling > 99
```

</details>

## 11. 真正的辩论

**ID：`realdebate` · 配置：2012／奥巴马，普通或更难。**

**实际目标：** 前两个已选答案依次为729、330，之后包含168，并获胜。

三项回答均为硬性要求，不可让即时攻略替换。按附录中文原文寻找选项；第三个答案168不要求固定作答序号。剩余题追求胜选，访问真正接近的竞争州。

<details><summary>源码判定（可复核）</summary>

来源：[campaign_trail.js 第2927行](https://github.com/hy0713/NCT-Chinese-Version/blob/main/static/js/campaign_trail.js#L2927)，属于legitimate branch。

```javascript
!modded && !run.achievements["realdebate"] && e.election_id == 3 && campaignTrail_temp.player_answers[0]==729 && campaignTrail_temp.player_answers[1]==330 && containsObject(168,e.player_answers)  && campaignTrail_temp.difficulty_level_multiplier <= 0.97 && e.final_outcome == "win"
```

</details>

## 12. 因果报应

**ID：`karmic` · 配置：2012／奥巴马＋希拉里·克林顿，普通或更难。**

**实际目标：** 本人选举人票不超过4。

目标是有控制地惨败，不是胜选。其余题主动选择削弱己方的回答，访问不应救回大州。菜单说“只剩哥伦比亚特区”，代码并不核对特区，0至4票都满足。

<details><summary>源码判定（可复核）</summary>

来源：[campaign_trail.js 第2931行](https://github.com/hy0713/NCT-Chinese-Version/blob/main/static/js/campaign_trail.js#L2931)，属于legitimate branch。

```javascript
!modded && !run.achievements["karmic"] && e.election_id == 3 && campaignTrail_temp.difficulty_level_multiplier <= 0.97 && e.final_overall_results[n].electoral_votes <= 4 && e.running_mate_last_name=="Clinton"
```

</details>

## 13. 纳德的突击队

**ID：`raiders` · 配置：2000／纳德尔，倍率不高于1.33。**

**实际目标：** 本人普选票至少5,300,000。

轻而易举1.33可用，适合先尝试。追求全国普选票，关注人口大州的可获得支持，不要求选举人票或当选。菜单说5%，代码并不计算5%比例，真正目标是530万票；也不是任意自定义难度都允许。

<details><summary>源码判定（可复核）</summary>

来源：[campaign_trail.js 第2937行](https://github.com/hy0713/NCT-Chinese-Version/blob/main/static/js/campaign_trail.js#L2937)，属于legitimate branch。

```javascript
!modded && !run.achievements["raiders"] && e.election_id == 9 && e.candidate_last_name == "Nader" && e.difficulty_level_multiplier <= 1.33 && e.final_overall_results[n].popular_votes >= 5300000
```

</details>

## 14. 自己掌舵

**ID：`master` · 配置：2000／戈尔，普通或更难。**

**实际目标：** 选答案3326，并赢得选举。

必须公开支持弹劾克林顿的指定回答，不能用一个意思相近的选项代替。其余题补回支持率，保护佛罗里达等决定胜负的竞争州。附录列出准确中文和英文。

<details><summary>源码判定（可复核）</summary>

来源：[campaign_trail.js 第2941行](https://github.com/hy0713/NCT-Chinese-Version/blob/main/static/js/campaign_trail.js#L2941)，属于legitimate branch。

```javascript
!modded && !run.achievements["master"] && e.election_id == 9 && e.candidate_last_name == "Gore" && e.difficulty_level_multiplier <= 0.97 && e.final_outcome == "win" && containsObject(3326,e.player_answers)
```

</details>

## 15. 胜负对调

**ID：`swap` · 配置：2000／戈尔，普通或更难。**

**实际目标：** 选举结局为胜选，但结果榜第一名的普选票低于第二名。

把资源从全国普选票最大化转向选举人票效率：守住必要州、窄胜关键州即可，不必扩大安全州优势。胜选后查看全国普选票，差一票也必须严格落后。不要按弹窗英文标题判断，原作弹窗误用了另一个成就名称，内部ID swap才是准绳。

<details><summary>源码判定（可复核）</summary>

来源：[campaign_trail.js 第2945行](https://github.com/hy0713/NCT-Chinese-Version/blob/main/static/js/campaign_trail.js#L2945)，属于legitimate branch。

```javascript
!modded && !run.achievements["swap"] && e.election_id == 9 && e.candidate_last_name == "Gore" && e.difficulty_level_multiplier <= 0.97 && e.final_outcome == "win" && e.final_overall_results[0].popular_votes < e.final_overall_results[1].popular_votes
```

</details>

## 16. 艺术模仿生活

**ID：`florida2000` · 配置：2000，任一候选人。**

**实际目标：** 佛州前两名份额差严格小于0.005，且全国选举人票榜第一名不超过294。

0.005份额等于0.5个百分点，等于边界不算。把佛州维持为极窄胜负，避免全国碾压。源码没有额外难度上限，也没有独立验证“翻转佛州一定改变总统胜者”；仅依菜单文字推断会多加条件。仍受普通成就资格门槛。

<details><summary>源码判定（可复核）</summary>

来源：[campaign_trail.js 第2950行](https://github.com/hy0713/NCT-Chinese-Version/blob/main/static/js/campaign_trail.js#L2950)，属于legitimate branch。

```javascript
!modded && !run.achievements["florida2000"] && e.final_state_results[8].result[0].percent - e.final_state_results[8].result[1].percent < 0.005 && e.final_overall_results[0].electoral_votes <= 294
```

</details>

## 17. 坦克与税收

**ID：`tanks` · 配置：1988／杜卡基斯，普通或更难。**

**实际目标：** 选过4439、4484两个答案，并获胜。

坦克与加税都要选，附录给出原文。随后用其余答案与竞争州访问弥补损失；不要一味照选即时最高收益答案，因为它可能避开这两个必要选择。

<details><summary>源码判定（可复核）</summary>

来源：[campaign_trail.js 第2957行](https://github.com/hy0713/NCT-Chinese-Version/blob/main/static/js/campaign_trail.js#L2957)，属于legitimate branch。

```javascript
!modded && !run.achievements["tanks"] && e.election_id == 15 && containsObject(4439,e.player_answers) && containsObject(4484,e.player_answers)  && campaignTrail_temp.difficulty_level_multiplier <= 0.97 && e.final_outcome == "win"
```

</details>

## 18. 彩虹联盟

**ID：`Rainbow` · 配置：1988／杜卡基斯＋杰西·杰克逊，普通或更难。**

**实际目标：** 结局为胜选。

搭档必须杰克逊；其余无指定回答。围绕能翻转的竞争州争取多数，不需要特定全国票数。与坦克／加税路线可以尝试同局推进，但同局通常只弹一个成就，不保证双解锁。

<details><summary>源码判定（可复核）</summary>

来源：[campaign_trail.js 第2961行](https://github.com/hy0713/NCT-Chinese-Version/blob/main/static/js/campaign_trail.js#L2961)，属于legitimate branch。

```javascript
!modded && !run.achievements["Rainbow"] && e.election_id == 15 && campaignTrail_temp.running_mate_last_name=="Jackson" && campaignTrail_temp.final_outcome=="win" && campaignTrail_temp.difficulty_level_multiplier <= 0.97
```

</details>

## 19. 更仁慈、更温和的大胜

**ID：`Kinder` · 配置：1988／老布什，普通或更难。**

**实际目标：** 获胜且榜首超过500票，即至少501。

需要广泛翻转对方州，不能停在普通的安全胜利；从访问还能翻转的州开始，不要继续增加安全大州优势。请注意代码大写K，存档键为Kinder。

<details><summary>源码判定（可复核）</summary>

来源：[campaign_trail.js 第2965行](https://github.com/hy0713/NCT-Chinese-Version/blob/main/static/js/campaign_trail.js#L2965)，属于legitimate branch。

```javascript
!modded && !run.achievements["Kinder"] && e.election_id == 15 && campaignTrail_temp.candidate_last_name=="Bush" && campaignTrail_temp.final_outcome=="win" && campaignTrail_temp.final_overall_results[0].electoral_votes>500 && campaignTrail_temp.difficulty_level_multiplier <= 0.97
```

</details>

## 20. 激进自由派吉米·卡特

**ID：`georgia` · 配置：1976／卡特，普通或更难。**

**实际目标：** 选过3610、3647，且本人至少401票。

堕胎选择权与全民医保的两项立场必须用指定答案表达。之后平衡全国扩大支持与州级差异，争取大范围胜利；刚过270远远不够。

<details><summary>源码判定（可复核）</summary>

来源：[campaign_trail.js 第2972行](https://github.com/hy0713/NCT-Chinese-Version/blob/main/static/js/campaign_trail.js#L2972)，属于legitimate branch。

```javascript
!modded && !run.achievements["georgia"] && e.election_id == 10 && containsObject(3610,e.player_answers) && containsObject(3647,e.player_answers)  && campaignTrail_temp.difficulty_level_multiplier <= 0.97 && e.final_overall_results[n].electoral_votes > 400
```

</details>

## 21. 魔鬼来到佐治亚

**ID：`georgenixon` · 配置：1968／尼克松，普通或更难。**

**实际目标：** 佐治亚州胜者的候选人ID为23（尼克松）。

把佐治亚视为专项目标，比较地方收益并在有希望翻转时集中访问。代码没有要求尼克松赢得全国选举；必要时可牺牲其他州。不要把游戏路线当成现实历史结果。

<details><summary>源码判定（可复核）</summary>

来源：[campaign_trail.js 第2979行](https://github.com/hy0713/NCT-Chinese-Version/blob/main/static/js/campaign_trail.js#L2979)，属于legitimate branch。

```javascript
!modded && !run.achievements["georgenixon"] && e.candidate_last_name == "Nixon" && e.election_id == 4 && campaignTrail_temp.difficulty_level_multiplier <= 0.97 && 23 == campaignTrail_temp.final_state_results[8].result[0].candidate
```

</details>

## 22. 休伯特的压倒性胜利

**ID：`ratio` · 配置：1968／汉弗莱，普通或更难。**

**实际目标：** 至少431票。

需要同时压缩尼克松和华莱士的州版图，尤其注意三方竞逐下的相对多数。菜单说至少430，代码用>430。一般胜选路线不代表已经达标。

<details><summary>源码判定（可复核）</summary>

来源：[campaign_trail.js 第2983行](https://github.com/hy0713/NCT-Chinese-Version/blob/main/static/js/campaign_trail.js#L2983)，属于legitimate branch。

```javascript
!modded && !run.achievements["ratio"] && e.candidate_last_name == "Humphrey" && e.election_id == 4 && campaignTrail_temp.difficulty_level_multiplier <= 0.97 && e.final_overall_results[n].electoral_votes > 430
```

</details>

## 23. 正因为困难

**ID：`BCitsHard` · 配置：1960／肯尼迪，倍率不高于0.90。**

**实际目标：** 结局为胜选。

极难0.90或更难才符合，困难0.95不算。围绕过半所需州精确配置访问，接受安全州只窄胜，避免追求无关的全国大胜。搭档没有额外硬性限制。

<details><summary>源码判定（可复核）</summary>

来源：[campaign_trail.js 第2990行](https://github.com/hy0713/NCT-Chinese-Version/blob/main/static/js/campaign_trail.js#L2990)，属于legitimate branch。

```javascript
!modded && !run.achievements["BCitsHard"] && e.candidate_last_name == "Kennedy" && e.election_id == 11 && campaignTrail_temp.difficulty_level_multiplier <= 0.9 && campaignTrail_temp.final_outcome=="win"
```

</details>

## 24. 正因为容易

**ID：`BCitsEasy` · 配置：1960／肯尼迪，轻而易举1.33。**

**实际目标：** 本人少于100票。

这是反向挑战：严格使用1.33，再主动选择伤害己方的选项，不要用访问挽救大州。99符合，100不符合；非常简单1.20并不能替代。

<details><summary>源码判定（可复核）</summary>

来源：[campaign_trail.js 第2994行](https://github.com/hy0713/NCT-Chinese-Version/blob/main/static/js/campaign_trail.js#L2994)，属于legitimate branch。

```javascript
!modded && !run.achievements["BCitsEasy"] && e.candidate_last_name =="Kennedy" &&  campaignTrail_temp.election_id == 11 && campaignTrail_temp.difficulty_level_multiplier == 1.33 && campaignTrail_temp.final_overall_results[n].electoral_votes<100
```

</details>

## 25. 无懈可击的副总统

**ID：`Vice` · 配置：1960／尼克松＋戈德华特，普通或更难。**

**实际目标：** 结局为胜选。

搭档固定后没有指定回答要求，针对竞争州扩大获胜联盟。南部与其他地区的取舍用当局民调判断，避免因搭档标签机械假定所有州同向受益。

<details><summary>源码判定（可复核）</summary>

来源：[campaign_trail.js 第2998行](https://github.com/hy0713/NCT-Chinese-Version/blob/main/static/js/campaign_trail.js#L2998)，属于legitimate branch。

```javascript
!modded && !run.achievements["Vice"] && e.election_id == 11 && campaignTrail_temp.difficulty_level_multiplier <= 0.97 && campaignTrail_temp.final_outcome=="win" && campaignTrail_temp.running_mate_last_name=="Goldwater"
```

</details>

## 26. 南方击败杜威

**ID：`dixieDewey` · 配置：1948／杜鲁门，普通或更难。**

**实际目标：** 第三个已选答案必须是3809，并获胜。

这里检查player_answers[2]，即从零计数的第三项；同样的答案若不在指定位置也不符合。第三项按附录选择，其余题维持胜选路线。

<details><summary>源码判定（可复核）</summary>

来源：[campaign_trail.js 第3004行](https://github.com/hy0713/NCT-Chinese-Version/blob/main/static/js/campaign_trail.js#L3004)，属于legitimate branch。

```javascript
!modded && !run.achievements["dixieDewey"] && e.candidate_last_name == "Truman" && e.election_id == 12 && campaignTrail_temp.difficulty_level_multiplier <= 0.97 && campaignTrail_temp.player_answers[2]==3809 && e.final_outcome=="win"
```

</details>

## 27. 大局已定

**ID：`Dewey` · 配置：1948／杜威，普通或更难。**

**实际目标：** 同时赢得总统选举与主要两名候选人间的普选票比较。

菜单只强调普选票，源码还要求final_outcome为win。因此全国普选领先但选举人票输掉不算。全国表现与关键州多数两条线都要满足。

<details><summary>源码判定（可复核）</summary>

来源：[campaign_trail.js 第3009行](https://github.com/hy0713/NCT-Chinese-Version/blob/main/static/js/campaign_trail.js#L3009)，属于legitimate branch。

```javascript
!modded && !run.achievements["Dewey"] && e.candidate_last_name == "Dewey" && e.election_id == 12 && campaignTrail_temp.difficulty_level_multiplier <= 0.97 && ((e.final_outcome == "win" && e.final_overall_results[0].popular_votes > e.final_overall_results[1].popular_votes)||(e.final_outcome=="loss" && e.final_overall_results[1].popular_votes > e.final_overall_results[0].popular_votes)) && e.final_outcome=="win"
```

</details>

## 28. 加州在哪里？

**ID：`California` · 配置：1916／休斯，普通或更难。**

**实际目标：** 胜选，并在加州结果中排第二。

先把加州以外的目标州算够当年的多数门槛；关注其他可替代的大州和竞争州，访问投向替代路线而非加州。源码要求第二名，不能泛化为任意名次的“失去加州”。不要套用现代270票门槛。

<details><summary>源码判定（可复核）</summary>

来源：[campaign_trail.js 第3015行](https://github.com/hy0713/NCT-Chinese-Version/blob/main/static/js/campaign_trail.js#L3015)，属于legitimate branch。

```javascript
!modded && !run.achievements["California"] && e.candidate_last_name == "Hughes" && e.election_id == 14 && campaignTrail_temp.difficulty_level_multiplier <= 0.97 && e.candidate_id == e.final_state_results[3].result[1].candidate && e.final_outcome=="win"
```

</details>

## 29. 伟大的平民

**ID：`Commoner` · 配置：1896／布赖恩，普通或更难。**

**实际目标：** 胜选，且榜首至少331票。

在农业州基础之外扩大联盟，重点找仍有希望翻转的州；一般胜选不够。注释里曾写500票，实际条件>330，菜单译文与此一致。

<details><summary>源码判定（可复核）</summary>

来源：[campaign_trail.js 第3021行](https://github.com/hy0713/NCT-Chinese-Version/blob/main/static/js/campaign_trail.js#L3021)，属于legitimate branch。

```javascript
!modded && !run.achievements["Commoner"] && e.candidate_last_name == "Bryan" && e.election_id == 5 && campaignTrail_temp.difficulty_level_multiplier <= 0.97 && campaignTrail_temp.final_overall_results[0].electoral_votes>330 && e.final_outcome=="win"
```

</details>

## 30. 依然在场

**ID：`stillAlive` · 配置：1968／华莱士，特殊非合规分支。**

**实际目标：** 本人恰好535票，并进入非合规分支。

这是隐藏彩蛋，与一般公平胜选挑战分开。普通合规一局即使535票也不检查本项；需BIG SHOT或其他使isLegitRun为假的状态。可在单独的BIG SHOT娱乐局尝试让华莱士拿下除3票州／特区以外的535票，最终仍须核对本人精确535。未提供或验证必达的作弊参数组合；不要为此损坏正常成就存档。该项在BIG SHOT通用成就前检查，可能优先解锁。

<details><summary>源码判定（可复核）</summary>

来源：[campaign_trail.js 第3096行](https://github.com/hy0713/NCT-Chinese-Version/blob/main/static/js/campaign_trail.js#L3096)，属于non-legitimate branch。

```javascript
!modded && e.candidate_last_name == "Wallace" && e.election_id == 4 && e.final_overall_results[n].electoral_votes == 535 && !run.achievements["stillAlive"]
```

</details>

## 31. 你的机会来了

**ID：`yourchance` · 配置：任一原生剧本，单独的BIG SHOT局。**

**实际目标：** 到结算时bigshot_mode为true，且未优先触发stillAlive。

在主菜单、进入答题界面之前，依次输入BIGSHOT后按Enter；首次通常只出现提示，再输入一次才真正启用。不要把焦点放在语言按钮上，也不要只看到提示就以为开启成功。原作在题目出现后移除这个键盘入口，因此开始答题后再输入不会启用。正常打完到最终结算，不要求胜选。完成后重新开一个关闭BIG SHOT的正常局，再刷其他普通成就；不要混用“NEO”永久开启功能。

<details><summary>源码判定（可复核）</summary>

来源：[campaign_trail.js 第3100行](https://github.com/hy0713/NCT-Chinese-Version/blob/main/static/js/campaign_trail.js#L3100)，属于non-legitimate branch。

```javascript
!modded && !run.achievements["yourchance"] && campaignTrail_temp.bigshot_mode
```

</details>

## 指定答案原文速查

以下从内置剧本语言包按答案ID提取，英文保留用于核对。它们是所列剧本内的ID，不能当成跨剧本通用选项编号。没有为了方便而重排题目或修改原答案。

### 答案 729

适用：`2012_Obama_Biden`、`2012_Obama_Clinton`。

我会承诺重新致力于自由主义和经济振兴。我们的社会福利计划和工会需要保护。在共和党继续阻碍进步的领域，我们会寻找其他办法把事情办成。

<details><summary>英文对照</summary>

I will pledge a new commitment to liberalism and economic revival. Our social programs and unions need to be protected. In those areas where Republicans continue to stand in the way of progress, we will look for other ways to get things done.

</details>

### 答案 330

适用：`2012_Obama_Biden`、`2012_Obama_Clinton`。

我会详细谈谈，我们如何偏离了罗斯福、约翰逊和汉弗莱等人建立的自由主义传统。我会重申，第二任期将致力于实现这一愿景。

<details><summary>英文对照</summary>

I will talk at great length about how we've drifted from the tradition of liberalism that was built by the likes of Roosevelt, Johnson, and Humphrey. I will reaffirm my commitment to this vision in my second term.

</details>

### 答案 168

适用：`2012_Obama_Biden`、`2012_Obama_Clinton`、`2012_Romney_Ryan`、`2012_Romney_Portman`、`2012_Romney_Rubio`、`2012_Romney_Pawlenty`。

应该设立一家公共保险机构，为所有美国人提供医疗保障。私人保险公司实在太贪婪，也太容易拒绝有既往病史的人。

<details><summary>英文对照</summary>

There should be a public insurance company offering health care to all Americans. Private insurers are simply too greedy and too likely to turn down people with pre-existing health conditions.

</details>

### 答案 3326

适用：`2000_Bush_Cheney`、`2000_Bush_Danforth`、`2000_Bush_Ridge`、`2000_Bush_Powell`、`2000_Gore_Lieberman`、`2000_Gore_Graham`、`2000_Gore_Kerry`、`2000_Gore_Bayh`、`2000_Nader_LaDuke`。

比尔·克林顿让美国蒙羞，他遭到弹劾是罪有应得。我认为他应当被免职。

<details><summary>英文对照</summary>

Bill Clinton was an embarrassment to the United States, and his impeachment was well-deserved. I believe that he should have been removed from office.

</details>

### 答案 4439

适用：`1988_Dukakis_Bentsen`、`1988_Dukakis_Glenn`、`1988_Dukakis_Gore`、`1988_Dukakis_Jackson`。

我们得改变公众在这个问题上对我的印象。安排我乘坐坦克拍一组宣传照吧。

<details><summary>英文对照</summary>

We need to change the imagery on this issue. Let's do a photo-op of me riding in a tank.

</details>

### 答案 4484

适用：`1988_Bush_Quayle`、`1988_Bush_Dole`、`1988_Bush_Kemp`、`1988_Dukakis_Bentsen`、`1988_Dukakis_Glenn`、`1988_Dukakis_Gore`、`1988_Dukakis_Jackson`。

我的对手会加税，我也会。他不会告诉你，而我刚刚说了。

<details><summary>英文对照</summary>

My opponent will raise taxes, and so will I. He won't tell you. I just did.

</details>

### 答案 3610

适用：`1976_Carter_Mondale`、`1976_Carter_Church`、`1976_Carter_Glenn`、`1976_Carter_Jackson`、`1976_Ford_Dole`、`1976_Ford_Baker`、`1976_Ford_Anderson`、`1976_Ford_Connally`。

我是支持妇女自主选择权的候选人，支持<em>罗诉韦德案</em>判决。

<details><summary>英文对照</summary>

I am a pro-choice candidate, and I support the <em>Roe v. Wave</em> decision.

</details>

### 答案 3647

适用：`1976_Carter_Mondale`、`1976_Carter_Church`、`1976_Carter_Glenn`、`1976_Carter_Jackson`、`1976_Ford_Dole`、`1976_Ford_Baker`、`1976_Ford_Anderson`、`1976_Ford_Connally`。

担任总统后，我绝对会支持这样的法律。我国早就应该让所有人都享有医疗保障了。

<details><summary>英文对照</summary>

I would absolutely support a law like this as President. It is past time that our nation had health coverage for all.

</details>

### 答案 3809

适用：`1948_Truman_Barkley`。

我们的胜算已经够低了，不能再引发南方代表退出党代会。这类事情得等我们的地位更稳固一些再说。

<details><summary>英文对照</summary>

Our chances are bad enough without instigating a Southern walkout from our convention. This kind of thing will have to wait until our position is a little stronger.

</details>

## 已验证什么，尚未验证什么

- `source-audit.json` 保存全部31个原生成就的原始条件、源码行号／SHA256和9项必要答案的双语原文，便于源码变化后重新核对。
- `predicate-tests.json` 是原条件的31个正例与16个反例／边界夹具；它验证条件含义，**不是**31次真实成就解锁，不证明每个数值都能由自然游玩达到。
- 实际浏览器验证单列在 `BROWSER_TEST_REPORT.json`：经典2016a通关解锁why、同源刷新保留成就、主菜单键盘启用BIG SHOT并通关解锁yourchance，且后一局不增加普通2016a计数。两局都真实回答25题并到达结算，拦截外部网络，无脚本错误或缺失资源。初次验证在答题后输入BIGSHOT未激活；根据原作移除键盘监听器的实际逻辑，已修正步骤并重跑通过。没有完成或没有明确记录的项目，不视为已经通过。
- 普通路线的随机性、特殊回答损失、精确票数与535票隐藏彩蛋尚无全部必达解。攻略不承诺每个搭档都能完成所有成就，也不把模拟胜选率冒称已证明结果。

维护命令（需要中文版开发依赖，游玩不需要）：

```powershell
node tools/achievement-audit.cjs "D:\Games\NCT-Chinese-Version"
python tools/build-achievement-guide.py
```

不要修改游戏计算、成就条件或基线来让验证通过。若更新上游，应重新提取与人工校订本攻略。历史／政治梗的有来源解释继续使用中文版内置旁注；这里专注游戏真实判定，不把架空结局写成历史事实。
