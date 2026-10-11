# 攻略功能实测报告

完成时间：2026-10-10T03:49:58.193498+00:00；Windows / Chrome 155.0.8059.39；localhost:8000。

## 实际结果

- 全部105内置组合，按各自原版默认模式，使用攻略推荐逐题作答和访问，中英文各通关一次：共210局，每局25题。模式值见每个组合的记录。
- 相同初始种子1776、相同策略下，中英文的完整州结果、全国票数、答案ID、访问记录与随机调用次数一致。
- 五组代表组合另以攻略隐藏状态执行同一策略，结果与显示攻略完全一致；开关不是自动代玩。
- 全105组合、三种模式、三种难度倍率、每组两个州，共1890次单州优化预测与完整原版重算逐值相同。
- 经典、比例、高级模式与不允许州访问的剧本界面实际检查；新配置默认关闭，偏好持久化，Enter/Space隔离原版快捷键，反馈期间隐藏旧题建议。
- 本轮所有浏览器测试拦截非本机请求；顺序续跑、模型专项和界面专项没有脚本错误或网络请求失败。
- 原版保护：PASS 7 original algorithms, 111 original data files, 671 bilingual keys and variable signatures。生成的独立预测器与当前原作源码逐字构建产物一致。

该种子的105组结果：{'win': 95, 'loss': 7, 'tie': 3}。这是实际游戏输出，不是胜率；`tie` 表示原版无人过半／平局类结果，不冒称赢得总统职位。

## 真实中断记录

最初同时运行多个浏览器测试时，完整通关批次在完成51组后出现间歇性脚本加载失败（jQuery等未定义）。原始失败报告完整保留，没有把整次中断标记为通过；模型并行尝试也曾中断。精确网络原因未确认。
固定文件后，单浏览器模型专项全105组合通过；其余54组顺序通关通过。最终报告合并105组已实际完成的对局，并逐项保留各次报告与中断说明。没有声称多客户端压力测试通过。

## 验证边界

- 固定一种子，不覆盖所有随机序列。没有证明整局全局最优、每个候选人必胜，或一定胜过全部人工路线。
- 对比原有首项路线的结果只描述这个种子的两种策略，不作为普遍优越性或因果胜率的证明。
- 高级模式仅投影已经生效的参数，不模拟未来筹款、广告、时间分配、游说或对手访问。
- 原有330条集合外引用、简化州分票公式和媒体替代等限制保留；历史解释与游戏加分分开。

## 每个组合结果

| 组合 | 模式 | 总统ID | 搭档ID | 攻略路线结果 | 原首项路线结果 | 玩家选举人票 |
|---|---|---:|---:|---|---|---:|
| 2020_Biden_Harris | 3 | 300 | 304 | win | loss | 350 |
| 2020_Biden_Rice | 3 | 300 | 305 | win | win | 388 |
| 2020_Biden_Duckworth | 3 | 300 | 314 | win | loss | 306 |
| 2020_Biden_Demings | 3 | 300 | 313 | win | win | 350 |
| 2020_Biden_Bass | 3 | 300 | 306 | win | loss | 306 |
| 2020_Biden_Whitmer | 3 | 300 | 307 | win | loss | 321 |
| 2020_Biden_Warren | 3 | 300 | 308 | win | loss | 306 |
| 2020_Trump_Pence | 3 | 301 | 309 | win | win | 295 |
| 2020_Trump_Haley | 3 | 301 | 310 | win | loss | 289 |
| 2016_Trump_Pence | 3 | 200 | 204 | win | loss | 325 |
| 2016_Trump_Christie | 3 | 200 | 205 | win | win | 338 |
| 2016_Trump_Sessions | 3 | 200 | 207 | win | loss | 342 |
| 2016_Trump_Carson | 3 | 200 | 206 | win | loss | 351 |
| 2016_Trump_Palin | 3 | 200 | 208 | win | loss | 329 |
| 2016_Clinton_Kaine | 3 | 201 | 209 | win | loss | 323 |
| 2016_Clinton_Booker | 3 | 201 | 211 | win | loss | 323 |
| 2016_Clinton_Brown | 3 | 201 | 213 | win | loss | 341 |
| 2016_Clinton_Sanders | 3 | 201 | 210 | win | win | 341 |
| 2016_Clinton_Warren | 3 | 201 | 212 | win | loss | 308 |
| 2016a_Clinton_Booker | 1 | 165 | 169 | win | loss | 408 |
| 2016a_Clinton_Castro | 1 | 165 | 170 | win | loss | 367 |
| 2016a_Clinton_Warren | 1 | 165 | 171 | win | loss | 332 |
| 2016a_Clinton_Brown | 1 | 165 | 172 | win | loss | 338 |
| 2016a_Trump_Brown | 1 | 166 | 173 | win | loss | 322 |
| 2016a_Trump_Christie | 1 | 166 | 175 | win | loss | 322 |
| 2016a_Trump_Carson | 1 | 166 | 174 | win | loss | 322 |
| 2012_Obama_Biden | 1 | 16 | 30 | win | loss | 347 |
| 2012_Obama_Clinton | 1 | 16 | 34 | win | loss | 347 |
| 2012_Romney_Ryan | 1 | 17 | 31 | win | loss | 321 |
| 2012_Romney_Portman | 1 | 17 | 32 | win | loss | 321 |
| 2012_Romney_Rubio | 1 | 17 | 33 | win | loss | 321 |
| 2012_Romney_Pawlenty | 1 | 17 | 37 | win | loss | 321 |
| 2000_Bush_Cheney | 1 | 77 | 81 | win | loss | 278 |
| 2000_Bush_Danforth | 1 | 77 | 82 | win | loss | 289 |
| 2000_Bush_Ridge | 1 | 77 | 83 | win | loss | 312 |
| 2000_Bush_Powell | 1 | 77 | 84 | win | loss | 324 |
| 2000_Gore_Lieberman | 1 | 78 | 85 | win | loss | 345 |
| 2000_Gore_Graham | 1 | 78 | 86 | win | loss | 340 |
| 2000_Gore_Kerry | 1 | 78 | 87 | win | loss | 349 |
| 2000_Gore_Bayh | 1 | 78 | 88 | win | loss | 349 |
| 2000_Nader_LaDuke | 1 | 79 | 89 | loss | loss | 0 |
| 1988_Bush_Quayle | 1 | 152 | 156 | win | loss | 489 |
| 1988_Bush_Dole | 1 | 152 | 157 | win | loss | 483 |
| 1988_Bush_Kemp | 1 | 152 | 158 | win | loss | 473 |
| 1988_Dukakis_Bentsen | 1 | 153 | 159 | win | loss | 434 |
| 1988_Dukakis_Glenn | 1 | 153 | 160 | win | loss | 400 |
| 1988_Dukakis_Gore | 1 | 153 | 161 | win | loss | 414 |
| 1988_Dukakis_Jackson | 1 | 153 | 162 | win | loss | 272 |
| 1976_Carter_Mondale | 1 | 91 | 95 | win | loss | 443 |
| 1976_Carter_Church | 1 | 91 | 96 | win | loss | 440 |
| 1976_Carter_Glenn | 1 | 91 | 97 | win | loss | 443 |
| 1976_Carter_Jackson | 1 | 91 | 98 | win | loss | 443 |
| 1976_Ford_Dole | 1 | 92 | 99 | loss | loss | 252 |
| 1976_Ford_Baker | 1 | 92 | 100 | win | loss | 394 |
| 1976_Ford_Anderson | 1 | 92 | 101 | win | loss | 387 |
| 1976_Ford_Connally | 1 | 92 | 102 | win | loss | 278 |
| 1968_Nixon_Agnew | 1 | 23 | 55 | win | loss | 458 |
| 1968_Nixon_Reagan | 1 | 23 | 44 | win | loss | 458 |
| 1968_Nixon_Rockefeller | 1 | 23 | 56 | win | loss | 458 |
| 1968_Nixon_Romney | 1 | 23 | 57 | win | loss | 439 |
| 1968_Humphrey_Muskie | 1 | 24 | 58 | win | loss | 459 |
| 1968_Humphrey_Kennedy | 1 | 24 | 61 | win | loss | 348 |
| 1968_Humphrey_Connally | 1 | 24 | 60 | win | loss | 433 |
| 1968_Humphrey_Harris | 1 | 24 | 59 | win | loss | 351 |
| 1968_Wallace_LeMay | 1 | 25 | 62 | tie | loss | 56 |
| 1968_Wallace_Thurmond | 1 | 25 | 64 | loss | loss | 45 |
| 1968_Wallace_Chandler | 1 | 25 | 63 | tie | loss | 56 |
| 1964_Johnson_Humphrey | 1 | 6970 | 9998 | win | win | 491 |
| 1964_Goldwater_Miller | 1 | 6969 | 9999 | loss | loss | 137 |
| 1960_Kennedy_Johnson | 1 | 105 | 108 | win | loss | 344 |
| 1960_Kennedy_Symington | 1 | 105 | 109 | win | loss | 298 |
| 1960_Kennedy_Humphrey | 1 | 105 | 110 | win | loss | 275 |
| 1960_Nixon_Lodge | 1 | 106 | 111 | win | loss | 364 |
| 1960_Nixon_Dirksen | 1 | 106 | 113 | win | loss | 364 |
| 1960_Nixon_Rockefeller | 1 | 106 | 112 | win | loss | 377 |
| 1960_Nixon_Goldwater | 1 | 106 | 115 | win | loss | 278 |
| 1948_Truman_Barkley | 1 | 116 | 120 | win | loss | 352 |
| 1948_Dewey_Warren | 1 | 117 | 121 | win | loss | 305 |
| 1948_Dewey_Stassen | 1 | 117 | 122 | win | loss | 299 |
| 1948_Dewey_Bricker | 1 | 117 | 123 | win | loss | 305 |
| 1948_Dewey_Vandenberg | 1 | 117 | 124 | win | loss | 299 |
| 1916_Wilson_Marshall | 1 | 142 | 146 | win | loss | 296 |
| 1916_Wilson_Baker | 1 | 142 | 147 | win | loss | 356 |
| 1916_Hughes_Fairbanks | 1 | 143 | 148 | win | loss | 303 |
| 1916_Hughes_Burkett | 1 | 143 | 149 | win | loss | 296 |
| 1896_McKinley_Hobart | 1 | 20 | 45 | win | loss | 335 |
| 1896_McKinley_Reed | 1 | 20 | 47 | win | loss | 335 |
| 1896_McKinley_Quay | 1 | 20 | 48 | win | loss | 335 |
| 1896_McKinley_Gage | 1 | 20 | 46 | win | win | 335 |
| 1896_Bryan_Sewall | 1 | 21 | 49 | win | loss | 318 |
| 1896_Bryan_Stevenson | 1 | 21 | 51 | win | loss | 318 |
| 1896_Bryan_Matthews | 1 | 21 | 50 | win | loss | 318 |
| 1896_Bryan_Boies | 1 | 21 | 53 | win | loss | 318 |
| 1896_Bryan_Teller | 1 | 21 | 52 | win | loss | 354 |
| 1860_Lincoln_Hamlin | 1 | 67 | 71 | win | tie | 181 |
| 1860_Lincoln_Clay | 1 | 67 | 127 | win | tie | 178 |
| 1860_Lincoln_Chase | 1 | 67 | 128 | win | win | 178 |
| 1860_Douglas_Johnson | 1 | 68 | 72 | tie | loss | 64 |
| 1860_Douglas_Guthrie | 1 | 68 | 129 | loss | loss | 29 |
| 1860_Douglas_Seymour | 1 | 68 | 130 | loss | loss | 9 |
| 1844_Polk_Dallas | 1 | 131 | 135 | win | loss | 213 |
| 1844_Polk_Woodbury | 1 | 131 | 136 | win | loss | 183 |
| 1844_Clay_Frelinghuysen | 1 | 132 | 137 | loss | loss | 133 |
| 1844_Clay_Sergeant | 1 | 132 | 138 | win | loss | 183 |
| 1844_Clay_Fillmore | 1 | 132 | 139 | win | loss | 195 |

数值与来源哈希见 `tests/guide-results.json`；完整问题、答案、州访问的数值一致性由浏览器断言检验，未修改游戏计算记录。
