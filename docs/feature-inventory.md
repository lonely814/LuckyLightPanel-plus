# 功能清单（重写基线）

结论：重写后必须保留的可见行为如下。任何一项做不到，视为回归。

## 1. 数据与接口

| 行为 | 来源 |
|---|---|
| 启动依次拉 `nav.json` / `sites.json` / `docker.json` / `luckyservices.json` | API.md |
| Docker、Lucky 统计 5s 轮询，上一轮未完成则跳过 | src/stores/nav.ts |
| 网络类型 `/backend/api/network-type`，失败时 `networkTypeFetchFailed=true` 并降级 | src/stores/nav.ts |
| 服务器默认配置 `default-config.json`，仅本地无配置时应用 | src/stores/config.ts |
| `backgroundImages` 非空且本地无配置时，默认背景取 `server_0` | src/stores/config.ts |

## 2. 配置（localStorage `lightpanel_config`）

保留字段语义，不保留 9 主题 / 7 布局枚举：

- `theme`: `light` | `dark`（旧的 blueprint/bauhaus/crt-terminal/light-panel/console/receipt/arctic-aurora → 迁移到 `dark`；`default` → `dark`）
- `layout` / `dockerLayout` / `luckyServicesLayout`: `card` | `compact`（`normal`→`card`，其余 6 种 → `compact`）
- `background`、`customBgUrl`、`layoutScale`、`siteCardSize`、`siteCardShape`、`showDescription`、`showTime`、`showSearch`、`showHeader`、`searchEngine`、`customSearchUrl`、`tabGroups`、`networkMode`、`currentTab`
- `detailTextContrast` / `detailRadiusScale` / `detailGlassBlurScale` / `detailGlassOpacityScale` / `detailReduceMotion`：100 = 跟随主题

## 3. 站点交互

| 行为 | 条件 |
|---|---|
| 直接打开最佳链接 | 只有一个可用链接 |
| 弹下拉让用户选 | 可用链接 > 1 |
| 外网模式无外链、有多内链 → 展示内链下拉 | 降级 |
| 内网模式无内链、有多外链 → 展示外链下拉 | 降级 |
| 键盘 Enter / Space 等价点击 | 可访问性 |
| 图标缺失时回退 `origin/favicon.ico` | src/utils/siteLinks.ts |
| `target` 自定义时断开 `window.opener` | 安全 |

## 4. Docker / Lucky

| 行为 | 说明 |
|---|---|
| 状态色映射（running / exited / paused / restarting / created / unknown） | 保留 |
| CPU / 内存百分比、网络速率、磁盘速率格式化 | 保留 |
| 60 点历史走势 sparkline | 保留 |
| 运行时长中文化（Up 2 hours → 已运行 2 小时） | 保留 |
| 分组多选筛选（`tabGroups` 存数组，`all` 表示全部） | 保留 |
| 每标签页独立搜索关键字（不持久化） | 保留 |

## 5. 布局与主题

| 项 | 旧 | 新 |
|---|---|---|
| 主题 | 9 套 | 2 套 `light` / `dark` |
| 布局 | compact/normal/large/list/minimal/rack/map | `card` / `compact` |
| 主题实现 | 24 个 CSS 文件 6056 行，7 个主题各 120+ 条组件选择器 | `tokens.css` 一份 + 两个 `[data-theme]` 变量块 |
| 卡片变体 | 17 个组件 | 3 个（SiteCard / DockerCard / ServiceCard），`card`/`compact` 由密度 token 驱动 |

## 6. 明确放弃（写入 PR 说明）

- 7 套装饰主题：bauhaus、console、crt-terminal、light-panel、receipt、arctic-aurora、blueprint
- 5 种布局：large、list、minimal、rack、map（含地铁线路图 `MAP_LINE_COLORS`、机柜 LED 动画、极简纯图标）
- 各主题对应的背景组件（TechBackground / BlueprintBackground / ConsoleBackground / CRTBackground / ReceiptBackground / AuroraBackground / DotMatrixBackground / BauhausBackground），统一改为渐变 + 图片背景

## 7. 验收

1. `npm run test:contract` 全绿（7 接口）
2. `npm run test` 全绿（含迁移函数用例）
3. `npm run build` 通过，入口 JS < 100 kB gzip、CSS < 80 kB gzip
4. 手工冒烟：3 个标签页 × 2 布局 × 2 主题 = 12 种组合可正常渲染与交互
