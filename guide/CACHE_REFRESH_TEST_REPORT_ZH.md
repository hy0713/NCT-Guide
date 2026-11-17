# 成就筛选与缓存更新验证

日期：2026-11-17。

用户页面仍运行旧脚本，成就下拉框显示31项并带有旧版勾选标记；同地址的服务端文件已更新。此前发布没有为攻略资源设置内容版本号，本轮补齐升级后的缓存刷新。

## 改动

- 安装器按全部运行时文件的内容计算统一版本号，写入五个入口脚本／样式地址。
- 后台规划器地址及其四个脚本引用沿用该版本号。任一运行时文件改变都会更新版本。
- 识别上一发布版4848850的原文件，继续拒绝覆盖未知个人修改。备份仍留在本地。
- 游戏仓库的本地服务另为本地化脚本、JSON和CSS提供`Cache-Control: no-cache`，请求仍只到本机。

## 实际结果

在用户Chrome中恢复2020拜登／达克沃思、默认模式、普通难度，第1题未作答。实际DOM仅有“常规胜选、殊途同归、黑暗布兰登崛起、文明获胜……？”四个选项，入口攻略脚本均携带新版本。沿用localhost:18080，未清除成就或偏好。

- [安装回归](../tests/install-routes-results.json)：新装、重复安装、四个已发布版本升级、个人修改保护均通过。隔离夹具仅改变规划器文件，也会改变全部入口版本号。
- [筛选回归](../tests/achievement-filter-results.json)：15种年份／搭档／设置场景通过，含普通高级模式、BIGSHOT分支、旧目标清除及双语重绘。
- [规划与布局](../tests/compact-performance-results.json)：实际工作线程请求及其脚本引用均携带同一版本；后台结果与同步计算一致。关闭规划、中英文切换不改变游戏数据或随机调用数；桌面与窄屏四档缩放通过。
- [路线UI](../tests/routes-ui-results.json)：配置、原文和路线偏离检查、独立开关及只读状态检查通过。
- [断网通关](../tests/english-edition-results.json)：屏蔽全部非本机请求，实际完成2020拜登／戴明斯和1960尼克松／戈德华特两局，分别触发原生成就ridingBiden、Vice；无脚本异常或缺失资源。
- `node tools/build-guide.cjs --check`通过，原计算源哈希保持不变。

初次同时运行两组浏览器测试时，首页原脚本初始化超时；改为逐项运行后，以上全部回归通过。本轮没有重跑历史报告中全部105组合的210局通关。

## 重现

保持独立测试服务运行，依次执行：

```powershell
python tests/install-routes.py E:/nct
$env:NCT_BASE_URL='http://127.0.0.1:18081'
node tests/achievement-filter.cjs E:/nct
node tests/compact-performance.cjs E:/nct
node tests/routes-ui.cjs E:/nct
node tests/english-edition.cjs E:/nct
```

E:/nct应替换为已安装本版攻略的游戏目录，测试使用隔离的浏览器存储。
